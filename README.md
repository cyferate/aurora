# ⚡ AURORA — Unified Claude Code Proxy Platform

> **Code forever, pay nothing. AURORA routes Claude Code through free AI tiers automatically.**

---

## What is AURORA?

AURORA fuses **9Router** + **Free-Claude-Code** + a full **Cyberpunk dashboard UI** into one self-contained folder. Boot it once, and your Claude Code CLI routes through free providers automatically — no subscriptions, no limits.

```
Claude Code CLI ──→ AURORA Harness (port 20128) ──→ FastAPI Proxy ──→ Free Providers
                         ↓
                   Cyberpunk Dashboard (port 5173)
```

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.11+
- At least one free API key (see below)

### 2. Setup

```bash
cd Aurora
cp .env.example .env
# Edit .env and add your free API keys
npm run setup
```

### 3. Launch AURORA

```bash
npm run start
```

This starts:
- ⚡ **Harness** on `http://localhost:20128` (Claude Code endpoint)
- 🐍 **Proxy** on `http://localhost:8082` (FastAPI backend)
- 🎨 **Dashboard** on `http://localhost:5173` (opens automatically)

### 4. Point Claude Code at AURORA

```bash
export ANTHROPIC_BASE_URL="http://localhost:20128/v1"
export ANTHROPIC_API_KEY="aurora-free-forever"

# Now just use Claude Code normally:
claude "build me a React app"
```

---

## 🔑 Free API Keys (All Free Tier)

| Provider | Sign Up | Free Models |
|---|---|---|
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | DeepSeek R1, Llama 3.3, Mistral |
| **Nvidia NIM** | [build.nvidia.com](https://build.nvidia.com) | Llama 3.1 405B |
| **Groq** | [console.groq.com/keys](https://console.groq.com/keys) | Llama 3.3 70B (ultra-fast) |
| **Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Gemini 2.0 Flash |
| **Ollama** | [ollama.ai](https://ollama.ai) | Any local model, fully offline |

Add keys to your `.env` file or via the Dashboard → API Keys panel.

---

## 🏗️ Architecture

```
Aurora/
├── harness/          # Node.js CLI gateway (port 20128)
├── proxy/            # FastAPI proxy backend (port 8082)
│   ├── router/       # 3-tier fallback, RTK token saver, MoA chain
│   ├── providers/    # OpenRouter, Nvidia, Groq, Gemini, Ollama clients
│   ├── normalizer/   # Anthropic ↔ OpenAI format translation
│   └── db/           # SQLite key pool & request logging
└── dashboard/        # React/Vite cyberpunk UI (port 5173)
    └── src/
        ├── components/visualizer/   # React Flow animated route map
        ├── components/panels/       # Token odometer, key manager, MoA, plugins
        └── components/ui/           # CRT overlay, glitch text, neon buttons
```

## ✨ Key Features

| Feature | Description |
|---|---|
| **3-Tier Fallback** | Primary → Secondary → Offline fallback, zero drops |
| **Key Rotation** | Round-robin across multiple API keys, auto-cooldown on 429 |
| **RTK Token Saver** | Compresses tool results 20–40%, fits free-tier context windows |
| **Format Translation** | Anthropic ↔ OpenAI ↔ Gemini schema normalization |
| **MoA Chain** | 4-model debate: Generator → Critic → Optimizer → Synthesizer |
| **Live Visualizer** | Animated React Flow map of routing pulses |
| **Cyberpunk UI** | CRT scanlines, glitch effects, glassmorphism, neon palette |
| **Plugin Browser** | Curated list from awesome-claude-plugins |

## 🎨 Dashboard Tabs

- **Visualizer** — Live animated routing map + token odometers
- **API Keys** — Manage your key pool with status and cooldown tracking
- **MoA Chain** — Configure the Mixture of Agents debate pipeline
- **Plugins** — Browse awesome-claude-plugins ecosystem
- **Focus Mode** — Code preview + terminal log side-by-side
- **OmniRush** — OmniRush GUI integration (port 8787, session control, logs, direct link)
- **Settings** — Provider chain, feature toggles, key management

---

## 🔮 OmniRush GUI Integration

AURORA integrates [OmniRush GUI](https://github.com/omnirush-ai/omnirush-gui) as an integrated coding workbench and model provider:
- **Preconfigured Environment:** `omnirush/.env` and `omnirush/omnirush-aurora.config.json` route OmniRush's OpenCode v2 engine through AURORA Proxy (`http://localhost:8082`).
- **Dashboard Management:** Dedicated **OmniRush tab** in the Cyberpunk UI showing real-time connectivity, active sessions, and execution logs.
- **Provider Tier:** AURORA proxy includes an `omnirush` provider tier that allows accessing frontier models configured in your local OmniRush server.

---

## Credits

Built on the shoulders of:
- [decolua/9router](https://github.com/decolua/9router) — Smart 3-tier routing & RTK token saver
- [alishahryar1/free-claude-code](https://github.com/alishahryar1/free-claude-code) — FastAPI proxy core & SSE normalization
- [omnirush-ai/omnirush-gui](https://github.com/omnirush-ai/omnirush-gui) — OpenCode v2 desktop & web GUI workbench
- [quemsah/awesome-claude-plugins](https://github.com/quemsah/awesome-claude-plugins) — Plugin ecosystem index

---

*AURORA — Advanced Unified Router & Orchestration Architecture*
*Free forever. Unlimited. Unrestricted.*

