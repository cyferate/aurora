# AURORA Refine Prompt
## Copy-paste this into Roo Code / Cline / Kilo Code / any AI agent to continue refining AURORA

---

```
You are an expert senior developer refining AURORA — a Claude Code proxy dashboard.

## Project Location
c:\Users\Divyanshu\Desktop\Aurora

## Stack
- Dashboard: React 18 + Vite 5 + TypeScript (dashboard/)
- Proxy: FastAPI + Python 3.11 Anaconda (proxy/)
- Harness: Express.js Node.js (harness/)
- Orchestrator: start.mjs (native Node spawn, no concurrently)
- State: Zustand (dashboard/src/store.ts)
- CSS: Pure CSS (no Tailwind, no styled-components)
  - Main design: dashboard/src/styles/aurora-hero.css

## Design System — STRICT RULES
### Palette (WARM ONLY — absolutely NO purple / indigo / violet)
- Background canvas:  #07080a
- Warm crimson:       #ff2f3a
- Warm coral:         #ff6b4a  (primary accent)
- Warm amber:         #ffb347
- Text primary:       #ffffff
- Text muted:         #9c9c9d
- Text dim:           #5c5c5e
- Border hairline:    rgba(255,255,255,0.08)

### Typography
- UI font:   Inter (all weights 400/500/600)
- Mono font: Geist Mono (ONLY for code, install captions, keyboard shortcut chips)
- NO other fonts

### Aurora Background (.aurora-bg)
- 5 diagonal "light-blade" divs (.aurora-blade-1 through -5)
- Each: position:absolute, mix-blend-mode:screen, filter:blur(60px)
- Colors: crimson #ff2f3a core → coral #ff6b4a → amber #ffb347 tip → transparent
- 15-22s staggered @keyframes blade-drift + blade-breathe
- 0% keyframe = full bloom (richest frame)
- Vignette: .aurora-bg::after radial-gradient
- Film grain: .film-grain-overlay with inline SVG feTurbulence

## Current File Structure
dashboard/src/
  App.tsx                              — view router: 'hero' | 'dashboard'
  main.tsx                             — entry
  store.ts                             — Zustand store
  styles/
    aurora-hero.css                    — ENTIRE design system (single file)
    globals.css                        — Legacy
    animations.css                     — Legacy
  components/
    hero/
      HeroPage.tsx                     — ★ Main landing page
      ScrollJourneyLine.tsx            — SVG scroll-draw line
    particles/
      SnowParticles.tsx                — Winter CSS snow (55 flakes)
      LeafParticles.tsx                — Autumn emoji leaves/petals (30)
    panels/
      SimpleDashboard.tsx              — ★ Proxy control panel (4 tabs)
  hooks/
    useScrollProgress.ts              — Returns [0,1] scroll fraction
    useSeason.ts                      — Returns 'winter'|'spring'|'summer'|'autumn'

## Running
npm run start               # from c:\Users\Divyanshu\Desktop\Aurora
# Starts: Harness :20128, Proxy :8082, Dashboard :5173

## Hero Page Layout (HeroPage.tsx)
1. FloatingPillNav — fixed top center, pill shape, backdrop-blur
2. .eyebrow-chip — "v2.0 — now with an AI command bar"
3. .hero-h1 — 64-72px Inter 600, one word with .gradient-word (amber→crimson text gradient)
4. .hero-subtitle — 18px muted, max-width 580px
5. .download-row — two .keycap-btn buttons (Mac + Windows)
   Keycap style: bg #e6e6e6, text #2f3031, 8px radius
   Shadow: 0 0 0 1.5px rgba(0,0,0,.85), 0 6px 20px rgba(255,255,255,.12),
           inset 0 1px 0 rgba(255,255,255,.75), inset 0 -2px 0 rgba(0,0,0,.22)
6. .install-caption — Geist Mono 12px #9c9c9d
7. CommandBarMockup — dark-glass panel, blinking warm caret (#ff6b4a),
   4 result rows, first row active (rgba(255,47,58,0.12) tint), Geist Mono shortcuts
8. .ghost-pill — "Open Dashboard →"
9. ScrollJourneyLine — SVG with linearGradient crimson→coral→amber, stroke-dashoffset synced to scroll
10. Features grid — 3×2 cards with .feature-card
11. ProductHuntBadge — position:fixed bottom-right

## Proxy Dashboard (SimpleDashboard.tsx)
4 tabs: Overview | API Keys | Providers | Logs
- Polls http://localhost:8082/health every 15s
- Polls http://localhost:8082/api/stats every 10s
- Flow strip: Claude Code CLI → (animated dots) → AURORA Proxy → (dots) → Free Model
- Metric cards: Total Requests, Success Rate, Tokens Today, Active Sessions
- Key inputs: OpenRouter, Gemini, Groq, Nvidia NIM (saves to POST /api/keys)
- Log stream: live append, 80 lines max

## Improvement Tasks (pick any)

### Visual Polish
- Add micro-interactions: hover state on feature cards should emit a subtle warm glow
- Add a floating "scroll to top" button that appears after scrolling 400px
- Add smooth view transition animation between hero and dashboard (fade + slight scale)
- The command bar mockup should cycle through 3 different query strings with typewriter
- Aurora blades: add a 6th very subtle wide blade across the full bottom

### Dashboard Enhancements  
- Add a provider health ring (small donut chart: green=ok, amber=cooldown, red=error)
- Add token usage sparkline (last 7 requests as small inline bar chart)
- Real-time WebSocket log stream from ws://localhost:8083

### New Features
- Add a /focus route that hides all UI except a minimal status dot (for focus mode)
- Add keyboard shortcut: Cmd+K or Ctrl+K to open the command bar
- Add a "Copy setup commands" button in Overview that copies the env exports to clipboard

### Performance
- Lazy-load SimpleDashboard with React.lazy + Suspense
- Use CSS content-visibility: auto on feature cards for faster paint
- Memoize the FLAKES / LEAVES arrays outside component (already done) — verify

## Constraints
- No external CSS frameworks (no Tailwind, no Bootstrap, no MUI)
- No purple (#7c3aed, #8b5cf6, #a855f7, #9333ea, etc.) ANYWHERE
- Font families: Inter + Geist Mono ONLY
- Python = C:\Users\Divyanshu\anaconda3\python.exe
- npm installs require BypassSandbox on Windows
- Build must pass: cd dashboard && node node_modules/vite/bin/vite.js build
- TypeScript strict mode: npx tsc --noEmit must exit 0

## Quality Bar: "L99"
Every component must be handcrafted — no generic UI library defaults.
The result must feel like a premium developer tool landing page, NOT like a template.
```

---

> **How to use:** Paste the entire block above into your agent's system prompt or first message.
> Then describe your specific change.
