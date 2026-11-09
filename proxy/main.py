"""
AURORA FastAPI Proxy Core
Intercepts Anthropic Messages API calls and routes them to free providers
"""
import asyncio
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aiosqlite
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from db.crud import init_db, log_request
from router.provider_router import ProviderRouter
from router.token_saver import TokenSaver
from normalizer.request_norm import normalize_request
from normalizer.response_norm import stream_normalize_response
from providers.omnirush import omnirush_health

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    app.state.router = ProviderRouter()
    app.state.token_saver = TokenSaver()
    print("✓ AURORA Proxy Backend online (port 8082)")
    yield
    print("✓ AURORA Proxy Backend shutting down")

app = FastAPI(title="AURORA Proxy", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── /v1/models ───────────────────────────────────────────────────────────────
@app.get("/v1/models")
@app.get("/models")
async def list_models():
    """Returns all available models across all configured providers"""
    models = [
        # OpenRouter free models
        {"id": "deepseek/deepseek-r1:free",        "object": "model", "provider": "openrouter", "tier": "free"},
        {"id": "deepseek/deepseek-chat-v3-0324:free","object": "model","provider": "openrouter", "tier": "free"},
        {"id": "meta-llama/llama-3.3-70b-instruct:free","object":"model","provider":"openrouter","tier":"free"},
        {"id": "google/gemini-flash-1.5-8b:free",  "object": "model", "provider": "openrouter", "tier": "free"},
        {"id": "mistralai/mistral-7b-instruct:free","object": "model", "provider": "openrouter", "tier": "free"},
        # Nvidia NIM
        {"id": "meta/llama-3.1-405b-instruct",     "object": "model", "provider": "nvidia",     "tier": "free"},
        {"id": "meta/llama-3.3-70b-instruct",       "object": "model", "provider": "nvidia",     "tier": "free"},
        # Groq
        {"id": "llama-3.3-70b-versatile",          "object": "model", "provider": "groq",       "tier": "free"},
        {"id": "deepseek-r1-distill-llama-70b",    "object": "model", "provider": "groq",       "tier": "free"},
        # Gemini
        {"id": "gemini-2.0-flash-exp",             "object": "model", "provider": "gemini",     "tier": "free"},
        {"id": "gemini-1.5-flash-8b",              "object": "model", "provider": "gemini",     "tier": "free"},
        # Ollama (local)
        {"id": "llama3.2",                         "object": "model", "provider": "ollama",     "tier": "local"},
        {"id": "deepseek-r1:14b",                  "object": "model", "provider": "ollama",     "tier": "local"},
        {"id": "qwen2.5-coder:7b",                 "object": "model", "provider": "ollama",     "tier": "local"},
        # OmniRush (frontier models via OmniRush platform)
        {"id": "claude-opus-4-5",                  "object": "model", "provider": "omnirush",   "tier": "omnirush"},
        {"id": "gpt-4.1",                          "object": "model", "provider": "omnirush",   "tier": "omnirush"},
        {"id": "gemini-2.5-pro",                   "object": "model", "provider": "omnirush",   "tier": "omnirush"},
        {"id": "o3",                               "object": "model", "provider": "omnirush",   "tier": "omnirush"},
    ]
    return {"object": "list", "data": models}

# ─── /v1/messages  (Main proxy endpoint) ──────────────────────────────────────
@app.post("/v1/messages")
@app.post("/messages")
async def proxy_messages(request: Request):
    request_id = str(uuid.uuid4())[:8]
    start_time = time.monotonic()

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    is_streaming = body.get("stream", False)

    # ── Token Saver compression ────────────────────────────────────────────────
    if os.getenv("TOKEN_SAVER_ENABLED", "true").lower() == "true":
        body, tokens_saved = app.state.token_saver.compress(body)
    else:
        tokens_saved = 0

    # ── Route to best available provider ──────────────────────────────────────
    provider_name, provider_client, openai_body = await app.state.router.route(body)

    if is_streaming:
        async def event_stream() -> AsyncGenerator[bytes, None]:
            async for chunk in stream_normalize_response(
                provider_client, openai_body, provider_name
            ):
                yield chunk
            # Log after stream
            elapsed = time.monotonic() - start_time
            await log_request(request_id, provider_name, body, tokens_saved, elapsed)

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "X-Aurora-Request-Id": request_id,
                "X-Aurora-Provider": provider_name,
                "X-Aurora-Tokens-Saved": str(tokens_saved),
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    else:
        response_body = await provider_client.complete(openai_body)
        elapsed = time.monotonic() - start_time
        await log_request(request_id, provider_name, body, tokens_saved, elapsed)
        return JSONResponse(
            content=response_body,
            headers={
                "X-Aurora-Request-Id": request_id,
                "X-Aurora-Provider": provider_name,
                "X-Aurora-Tokens-Saved": str(tokens_saved),
            }
        )

# ─── /health ──────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "aurora_proxy_online",
        "providers": await app.state.router.get_provider_status(),
        "omnirush": await omnirush_health(),
        "timestamp": time.time()
    }

@app.get("/api/omnirush/status")
async def get_omnirush_status():
    """Proxy health check to OmniRush"""
    return await omnirush_health()

# ─── /api/stats ───────────────────────────────────────────────────────────────
@app.get("/api/stats")
async def get_stats():
    """Dashboard statistics endpoint"""
    async with aiosqlite.connect("../aurora.db") as db:
        async with db.execute(
            "SELECT provider, COUNT(*) as reqs, SUM(tokens_saved) as saved "
            "FROM requests GROUP BY provider"
        ) as cursor:
            rows = await cursor.fetchall()
    return {
        "providers": [
            {"provider": r[0], "requests": r[1], "tokens_saved": r[2] or 0}
            for r in rows
        ]
    }

# ─── /api/keys ────────────────────────────────────────────────────────────────
@app.get("/api/keys")
async def get_keys():
    """List configured API keys (masked)"""
    async with aiosqlite.connect("../aurora.db") as db:
        async with db.execute(
            "SELECT id, provider, key_hint, status, cooldown_until, usage_count FROM api_keys"
        ) as cursor:
            rows = await cursor.fetchall()
    return {
        "keys": [
            {
                "id": r[0], "provider": r[1], "key_hint": r[2],
                "status": r[3], "cooldown_until": r[4], "usage_count": r[5]
            }
            for r in rows
        ]
    }

@app.post("/api/keys")
async def add_key(request: Request):
    """Add a new API key"""
    data = await request.json()
    provider = data.get("provider")
    key = data.get("key")
    if not provider or not key:
        raise HTTPException(status_code=400, detail="provider and key required")
    hint = key[:6] + "..." + key[-4:] if len(key) > 10 else "***"
    async with aiosqlite.connect("../aurora.db") as db:
        await db.execute(
            "INSERT INTO api_keys (provider, key_value, key_hint, status) VALUES (?, ?, ?, 'active')",
            (provider, key, hint)
        )
        await db.commit()
    return {"status": "added", "provider": provider, "hint": hint}

