"""AURORA Ollama Provider Client — fully offline local LLM"""
import httpx, json, os
from typing import AsyncGenerator

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class OllamaClient:
    def __init__(self, api_key: str = "ollama", model: str = "llama3.2"):
        self.model = model
        self.base_url = OLLAMA_BASE_URL

    async def stream(self, body: dict) -> AsyncGenerator[dict, None]:
        body = {**body, "stream": True}
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST", f"{self.base_url}/v1/chat/completions",
                json=body
            ) as resp:
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
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{self.base_url}/v1/chat/completions", json=body
            )
            resp.raise_for_status()
            return resp.json()

