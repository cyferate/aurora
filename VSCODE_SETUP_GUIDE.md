# ⚡ Ultimate Free & Unlimited Agentic Coding Setup

This guide details how to use your newly installed VS Code / Antigravity extensions with **AURORA Proxy** for 100% free, unlimited, autonomous coding.

---

## 📦 Installed Extensions Overview

| Extension | Role | Mode | How It Works |
|---|---|---|---|
| **Roo Code** (`rooveterinaryinc.roo-cline`) | Autonomous Coding Agent | BYOK / AURORA | Full multi-file editing, terminal execution, diff review |
| **Cline** (`saoudrizwan.claude-dev`) | Autonomous Coding Agent | BYOK / AURORA | Native Claude Code architecture inside VS Code |
| **Kilo Code** (`kilocode.kilo-code`) | Autonomous Coding Agent | BYOK / AURORA | Fast agentic workflows, multi-tab execution |
| **Continue** (`continue.continue`) | Codebase Chat & Refactor | Ollama / AURORA | Pre-configured in `~/.continue/config.json` |
| **Codeium / Windsurf** (`codeium.codeium`) | Real-time Inline Autocomplete | Zero-Config Free | Unlimited multi-line suggestions as you type |
| **Qodo Gen** (`codium.codium`) | Test Gen & Integrity Chat | Free Tier | Context-aware code explanations and test generation |
| **Supermaven** (`supermaven.supermaven`) | Sub-millisecond Autocomplete | Free Tier | Ultra-low latency code completions |

---

## 🔌 Connecting Agents (Roo Code, Cline, Kilo Code) to AURORA

Because **AURORA** acts as an Anthropic & OpenAI drop-in proxy on port `20128`, you can point any of your agent extensions directly to AURORA to enjoy:
- **Zero API bills:** Uses your free OpenRouter, Nvidia NIM, Groq, Gemini, or Ollama tiers.
- **Smart 3-Tier Fallback:** If one model or key hits a rate limit (429), AURORA instantly reroutes to another candidate without dropping your context or task!
- **RTK Token Compression:** Tool logs and diffs are compressed 15%–40%, preventing context overflow.

### Setup Steps for Roo Code & Cline:
1. Launch AURORA in your terminal:
   ```powershell
   cd c:\Users\Divyanshu\Desktop\Aurora
   npm run start
   ```
2. In VS Code, click the **Roo Code** or **Cline** icon on the left activity bar.
3. Click the ⚙️ **Settings** gear at the top right of the panel.
4. Set the following fields:
   - **API Provider:** `OpenAI Compatible` (or `Anthropic Compatible`)
   - **Base URL:** `http://localhost:20128/v1`
   - **API Key:** `aurora-free-forever` (any placeholder works)
   - **Model ID:** `deepseek/deepseek-r1:free` or `llama-3.3-70b-versatile` or `gemini-2.0-flash-exp`
5. Click **Done / Save**.
6. Prompt the agent: *"Build me a new feature..."* — it will code autonomously through AURORA!

---

## 🧠 Continue Configuration (`~/.continue/config.json`)

`Continue` has already been pre-configured with AURORA, Ollama, and OpenRouter models.
To open Continue:
- Press `Ctrl + L` (Chat) or `Ctrl + I` (Inline Edit).
- Select **AURORA Proxy (Free Tier Fallback)** from the model dropdown at the bottom of the chat panel.

---

## ⚡ Real-Time Autocompletions (Codeium & Supermaven)

No configuration needed! Both **Codeium** and **Supermaven** will automatically show gray ghost-text suggestions as you type in any language:
- Press `Tab` to accept suggestions.
- Press `Alt + ]` or `Alt + [` to cycle alternative suggestions.
