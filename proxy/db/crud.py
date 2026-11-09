"""
AURORA SQLite Database — Schema initialization and CRUD operations
"""
import aiosqlite
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'aurora.db')

SCHEMA = """
CREATE TABLE IF NOT EXISTS api_keys (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    provider      TEXT NOT NULL,
    key_value     TEXT NOT NULL,
    key_hint      TEXT NOT NULL,
    status        TEXT DEFAULT 'active',  -- active | cooldown | exhausted
    cooldown_until REAL DEFAULT 0,
    usage_count   INTEGER DEFAULT 0,
    created_at    REAL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS requests (
    id            TEXT PRIMARY KEY,
    provider      TEXT NOT NULL,
    model         TEXT,
    input_tokens  INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    tokens_saved  INTEGER DEFAULT 0,
    latency_ms    REAL DEFAULT 0,
    status        TEXT DEFAULT 'success',  -- success | fallback | error
    created_at    REAL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS provider_config (
    provider      TEXT PRIMARY KEY,
    enabled       INTEGER DEFAULT 1,
    priority      INTEGER DEFAULT 1,
    base_url      TEXT,
    default_model TEXT,
    updated_at    REAL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO provider_config (provider, enabled, priority, base_url, default_model) VALUES
    ('openrouter', 1, 1, 'https://openrouter.ai/api/v1', 'deepseek/deepseek-r1:free'),
    ('nvidia',     1, 2, 'https://integrate.api.nvidia.com/v1', 'meta/llama-3.1-405b-instruct'),
    ('groq',       1, 3, 'https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile'),
    ('gemini',     1, 4, 'https://generativelanguage.googleapis.com/v1beta/openai', 'gemini-2.0-flash-exp'),
    ('ollama',     1, 5, 'http://localhost:11434/v1', 'llama3.2');
"""

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(SCHEMA)
        await db.commit()
    print(f"✓ AURORA Database initialized: {DB_PATH}")

async def log_request(request_id: str, provider: str, body: dict,
                       tokens_saved: int, latency: float):
    model = body.get("model", "unknown")
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR REPLACE INTO requests "
            "(id, provider, model, tokens_saved, latency_ms) VALUES (?, ?, ?, ?, ?)",
            (request_id, provider, model, tokens_saved, round(latency * 1000, 2))
        )
        await db.commit()

async def get_active_keys(provider: str) -> list[dict]:
    now = time.time()
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id, key_value FROM api_keys "
            "WHERE provider = ? AND status = 'active' AND cooldown_until < ? "
            "ORDER BY usage_count ASC",
            (provider, now)
        ) as cursor:
            rows = await cursor.fetchall()
    return [{"id": r[0], "key": r[1]} for r in rows]

async def mark_key_cooldown(key_id: int, seconds: int = 300):
    cooldown_until = time.time() + seconds
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE api_keys SET status='cooldown', cooldown_until=? WHERE id=?",
            (cooldown_until, key_id)
        )
        await db.commit()

async def increment_key_usage(key_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE api_keys SET usage_count = usage_count + 1 WHERE id=?",
            (key_id,)
        )
        await db.commit()

