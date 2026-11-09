"""
AURORA Provider Router — 3-tier smart fallback with key rotation
Catches 429/500 errors and instantly re-routes to next provider/key
"""
import asyncio
import os
import time
from typing import Any

from db.crud import get_active_keys, mark_key_cooldown, increment_key_usage
from normalizer.request_norm import normalize_request
from providers.openrouter import OpenRouterClient
from providers.nvidia_nim import NvidiaClient
from providers.groq import GroqClient
from providers.gemini import GeminiClient
from providers.ollama import OllamaClient


PROVIDER_CHAIN = os.getenv("DEFAULT_PROVIDER_CHAIN", "openrouter,nvidia,groq,gemini,ollama").split(",")

PROVIDER_CLASS_MAP = {
    "openrouter": OpenRouterClient,
    "nvidia":     NvidiaClient,
    "groq":       GroqClient,
    "gemini":     GeminiClient,
    "ollama":     OllamaClient,
}

ENV_KEY_MAP = {
    "openrouter": "OPENROUTER_API_KEY",
    "nvidia":     "NVIDIA_API_KEY",
    "groq":       "GROQ_API_KEY",
    "gemini":     "GEMINI_API_KEY",
    "ollama":     None,  # No key needed
}

DEFAULT_MODEL_MAP = {
    "openrouter": os.getenv("OPENROUTER_DEFAULT_MODEL", "deepseek/deepseek-r1:free"),
    "nvidia":     os.getenv("NVIDIA_DEFAULT_MODEL",     "meta/llama-3.1-405b-instruct"),
    "groq":       os.getenv("GROQ_DEFAULT_MODEL",       "llama-3.3-70b-versatile"),
    "gemini":     os.getenv("GEMINI_DEFAULT_MODEL",     "gemini-2.0-flash-exp"),
    "ollama":     os.getenv("OLLAMA_DEFAULT_MODEL",     "llama3.2"),
}


class ProviderRouter:
    def __init__(self):
        self._provider_status: dict[str, dict] = {
            p: {"status": "unknown", "last_check": 0, "error_count": 0}
            for p in PROVIDER_CHAIN
        }

    async def route(self, body: dict) -> tuple[str, Any, dict]:
        """
        Try providers in priority order.
        Returns (provider_name, provider_client, openai_body)
        """
        openai_body = normalize_request(body)
        last_error = None

        for provider_name in PROVIDER_CHAIN:
            # Try env key first, then DB keys
            env_key_name = ENV_KEY_MAP.get(provider_name)
            env_key = os.getenv(env_key_name) if env_key_name else "ollama-no-key"

            # Build candidate key list
            db_keys = await get_active_keys(provider_name)
            candidates = []
            if env_key and env_key not in ("", "your_key_here", None):
                candidates.append({"id": None, "key": env_key})
            candidates.extend(db_keys)

            if not candidates:
                # No keys available for this provider — skip
                continue

            for candidate in candidates:
                key = candidate["key"]
                key_id = candidate["id"]
                try:
                    model = DEFAULT_MODEL_MAP[provider_name]
                    client_cls = PROVIDER_CLASS_MAP[provider_name]
                    client = client_cls(api_key=key, model=model)

                    # Inject chosen model into body
                    openai_body["model"] = model

                    # Mark key as used
                    if key_id is not None:
                        await increment_key_usage(key_id)

                    self._provider_status[provider_name]["status"] = "active"
                    self._provider_status[provider_name]["error_count"] = 0
                    print(f"[ROUTER] → {provider_name} ({model})")
                    return provider_name, client, openai_body

                except Exception as e:
                    last_error = e
                    status_code = getattr(e, "status_code", None) or getattr(e, "code", None)

                    if status_code == 429:
                        print(f"[ROUTER] ⚡ 429 on {provider_name} key …{key[-4:]} → cooling down")
                        if key_id is not None:
                            cooldown = int(os.getenv("KEY_COOLDOWN_SECONDS", "300"))
                            await mark_key_cooldown(key_id, cooldown)
                        # Try next key in same provider
                        continue
                    else:
                        print(f"[ROUTER] ✗ {provider_name} error: {e}")
                        self._provider_status[provider_name]["status"] = "error"
                        self._provider_status[provider_name]["error_count"] += 1
                        break  # Move to next provider

        # All providers exhausted
        raise RuntimeError(
            f"All providers exhausted. Last error: {last_error}. "
            "Add more keys via the AURORA dashboard."
        )

    async def get_provider_status(self) -> dict:
        return self._provider_status

