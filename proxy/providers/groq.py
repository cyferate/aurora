"""AURORA Groq Provider Client — ultra-fast inference"""
import httpx, json
from typing import AsyncGenerator

GROQ_BASE_URL = "https://api.groq.com/openai/v1"

class GroqClient:
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    async def stream(self, body: dict) -> AsyncGenerator[dict, None]:
        body = {**body, "stream": True}
        # Groq doesn't support vision or some tool params — strip if needed
        body.pop("max_tokens", None)
        body["max_completion_tokens"] = 8192
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST", f"{GROQ_BASE_URL}/chat/completions",
                headers=self.headers, json=body
            ) as resp:
                if resp.status_code == 429:
                    raise RateLimitError("Groq 429")
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data.strip() == "[DONE]": break
                        try:
                            yield json.loads(data)
                        except Exception:
                            continue

    async def complete(self, body: dict) -> dict:
        body = {**body, "stream": False}
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{GROQ_BASE_URL}/chat/completions",
                headers=self.headers, json=body
            )
            if resp.status_code == 429:
                raise RateLimitError("Groq 429")
            resp.raise_for_status()
            return resp.json()

class RateLimitError(Exception):
    status_code = 429

