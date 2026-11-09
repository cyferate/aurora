"""
OmniRush provider — routes requests to the OmniRush server
which itself provides access to frontier models via their platform.
OmniRush server must be running on port 8787.
"""
import httpx
import json
import asyncio
from typing import AsyncIterator

OMNIRUSH_BASE_URL = "http://localhost:8787"
OMNIRUSH_TIMEOUT = 60.0


async def omnirush_chat(
    messages: list,
    model: str = "claude-opus-4-5",
    system: str = "",
    stream: bool = True,
    **kwargs,
) -> AsyncIterator[bytes] | dict:
    """
    Send a chat request to OmniRush server.
    OmniRush exposes an OpenAI-compatible /v1/chat/completions endpoint.
    """
    payload = {
        "model": model,
        "messages": [{"role": "system", "content": system}] + messages if system else messages,
        "stream": stream,
        **kwargs,
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "text/event-stream" if stream else "application/json",
        "X-Aurora-Proxy": "1",
    }

    if stream:
        async def _stream() -> AsyncIterator[bytes]:
            async with httpx.AsyncClient(timeout=OMNIRUSH_TIMEOUT) as client:
                async with client.stream(
                    "POST",
                    f"{OMNIRUSH_BASE_URL}/v1/chat/completions",
                    json=payload,
                    headers=headers,
                ) as resp:
                    resp.raise_for_status()
                    async for chunk in resp.aiter_bytes():
                        yield chunk
        return _stream()
    else:
        async with httpx.AsyncClient(timeout=OMNIRUSH_TIMEOUT) as client:
            resp = await client.post(
                f"{OMNIRUSH_BASE_URL}/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()


async def omnirush_health() -> dict:
    """Check if OmniRush server is running."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OMNIRUSH_BASE_URL}/api/health")
            return {"online": resp.status_code == 200, "data": resp.json() if resp.status_code == 200 else {}}
    except Exception as e:
        return {"online": False, "error": str(e)}


async def omnirush_models() -> list[str]:
    """Get available models from OmniRush."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OMNIRUSH_BASE_URL}/v1/models")
            if resp.status_code == 200:
                data = resp.json()
                return [m["id"] for m in data.get("data", [])]
    except Exception:
        pass
    # Default OmniRush models
    return [
        "claude-opus-4-5",
        "claude-sonnet-4-5",
        "gpt-4.1",
        "gemini-2.5-pro",
        "o3",
    ]
