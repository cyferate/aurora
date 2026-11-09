"""
AURORA OpenRouter Provider Client
Connects to openrouter.ai — hundreds of free & paid models via one API
"""
import os
import httpx
from typing import AsyncGenerator


OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class OpenRouterClient:
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://aurora-proxy.local",
            "X-Title": "AURORA Unified Proxy",
        }

    async def stream(self, body: dict) -> AsyncGenerator[dict, None]:
        body = {**body, "stream": True}
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST",
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=self.headers,
                json=body,
            ) as resp:
                if resp.status_code == 429:
                    raise RateLimitError(f"OpenRouter 429: {await resp.aread()}")
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data.strip() == "[DONE]":
                            break
                        try:
                            import json
                            yield json.loads(data)
                        except Exception:
                            continue

    async def complete(self, body: dict) -> dict:
        body = {**body, "stream": False}
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=self.headers,
                json=body,
            )
            if resp.status_code == 429:
                raise RateLimitError(f"OpenRouter 429")
            resp.raise_for_status()
            return self._to_anthropic(resp.json())

    def _to_anthropic(self, openai_resp: dict) -> dict:
        import uuid
        choice = openai_resp.get("choices", [{}])[0]
        text = choice.get("message", {}).get("content", "")
        usage = openai_resp.get("usage", {})
        return {
            "id": f"msg_{uuid.uuid4().hex[:20]}",
            "type": "message",
            "role": "assistant",
            "content": [{"type": "text", "text": text}],
            "model": self.model,
            "stop_reason": "end_turn",
            "usage": {
                "input_tokens": usage.get("prompt_tokens", 0),
                "output_tokens": usage.get("completion_tokens", 0),
            }
        }


class RateLimitError(Exception):
    status_code = 429

