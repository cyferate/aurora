import React, { useEffect, useRef, useState } from 'react'
import { useSeason } from '../../hooks/useSeason'
import { SnowParticles } from '../particles/SnowParticles'
import { LeafParticles } from '../particles/LeafParticles'
import { ScrollJourneyLine } from './ScrollJourneyLine'

/* ── SVG OS glyphs (inline, no external dep) ─────────────── */
function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor" aria-hidden>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.9-155.5-108.2C115.1 758.5 76.2 673.7 76.2 594c0-152.6 99.9-233.2 198.1-233.2 52.4 0 96.1 34.4 129.1 34.4 31.3 0 79.9-36.3 140.4-36.3 22.4 0 108.2 1.9 168.3 103.6zm-234.5-204.3c27.9-33.2 47.8-79.4 47.8-125.6 0-6.4-.6-12.8-1.9-18 .6 0 .6 0 .6 0-44.2 1.9-96.7 29.5-128.7 66.5-24.9 27.7-48.5 73.2-48.5 120 0 7.1 1.3 14.2 1.9 16.4 2.6.6 6.5 1.3 10.4 1.3 39.6 0 89.4-26.9 118.4-60.6z"/>
    </svg>
  )
}

function WindowsGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 88 88" fill="currentColor" aria-hidden>
      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.344-47.318-6.651-.066-34.78z"/>
    </svg>
  )
}

/* ── Floating Pill Nav ────────────────────────────────────── */
function FloatingPillNav({ onDashboard }: { onDashboard: () => void }) {
  return (
    <nav className="pill-nav" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="nav-logo">
        <div className="nav-logo-glyph" aria-hidden>◈</div>
        <span className="nav-logo-word">AURORA</span>
      </div>

      {/* Links */}
      <div className="nav-links">
        {['Product', 'Docs', 'Pricing', 'Changelog', 'Blog'].map(label => (
          <button key={label} className="nav-link">{label}</button>
        ))}
      </div>

      {/* Actions */}
      <div className="nav-actions">
        <button className="nav-login">Log in</button>
        <button className="nav-download-pill" onClick={onDashboard}>
          <span style={{ fontSize: 13 }}>⬇</span>
          Dashboard
        </button>
      </div>
    </nav>
  )
}

/* ── Command Bar Mockup ───────────────────────────────────── */
const CMD_RESULTS = [
  { icon: '⚡', label: 'Route to OpenRouter — Claude 3.5 Sonnet', shortcut: '⌘ Enter', active: true },
  { icon: '🔑', label: 'Manage API Keys',                          shortcut: '⌘ B' },
  { icon: '📊', label: 'Open Live Visualizer',                     shortcut: '⌘ O' },
  { icon: '⚙️', label: 'Settings & Providers',                     shortcut: '⌘ K' },
]

function CommandBarMockup() {
  const [typed, setTyped] = useState('')
  const full = 'Route through Gemini Pro...'

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i <= full.length) {
        setTyped(full.slice(0, i))
        i++
      } else {
        // pause then reset
        setTimeout(() => { i = 0; setTyped('') }, 2200)
      }
    }, 65)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="command-bar-wrapper">
      <div className="command-bar" role="search" aria-label="Command palette">
        {/* Search row */}
        <div className="cmd-search-row">
          <span className="cmd-search-icon" aria-hidden>⌕</span>
          <div className="cmd-search-input" aria-label="Search commands">
            <span className="cmd-typed">{typed}</span>
            <span className="cmd-caret" aria-hidden />
          </div>
          <div className="cmd-mode-pill">Command</div>
        </div>

        {/* Results */}
        <div className="cmd-results" role="listbox">
          {CMD_RESULTS.map((r, i) => (
            <div
              key={i}
              className={`cmd-result-row${r.active ? ' active' : ''}`}
              role="option"
              aria-selected={r.active}
            >
              <div className="cmd-result-icon" aria-hidden>{r.icon}</div>
              <span className="cmd-result-label">{r.label}</span>
              <span className="cmd-shortcut-chip">{r.shortcut}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="cmd-footer">
          <div className="cmd-footer-hint">
            <kbd>↑↓</kbd> navigate
          </div>
          <div className="cmd-footer-hint">
            <kbd>↵</kbd> select
          </div>
          <div className="cmd-footer-hint">
            <kbd>esc</kbd> close
          </div>
          <div style={{ flex: 1 }} />
          <div className="cmd-footer-hint" style={{ opacity: 0.5 }}>
            AURORA Proxy v2.0
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Fade-up observer ─────────────────────────────────────── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ── Feature cards ────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '⚡',
    title: 'Smart 3-Tier Fallback',
    desc: 'Hits rate limits? AURORA instantly reroutes to the next free provider — zero dropped context.',
  },
  {
    icon: '🔀',
    title: 'Token Compression',
    desc: 'Strips redundant logs and compresses tool results, saving up to 95% token overhead on free-tier models.',
  },
  {
    icon: '🌐',
    title: 'Universal Translation',
    desc: 'Converts Claude\'s XML tool-calling format to JSON schema so any model — Gemini, GPT, Llama — works seamlessly.',
  },
  {
    icon: '🔑',
    title: 'Key Rotation',
    desc: 'Manage OpenRouter, Nvidia NIM, Groq, and Ollama keys in one place with automatic cooldown tracking.',
  },
  {
    icon: '🤖',
    title: 'Mixture-of-Agents',
    desc: 'Chain 4 different models together for multi-step reasoning. Best free answer, every time.',
  },
  {
    icon: '📡',
    title: 'OmniRush Integration',
    desc: 'Full OmniRush GUI integration — manage sessions, routes, and providers from one unified dashboard.',
  },
]

function FeatureCard({ icon, title, desc, delay }: typeof FEATURES[0] & { delay: number }) {
  const ref = useFadeUp()
  return (
    <div
      ref={ref}
      className="feature-card fade-up"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="feature-icon-wrap" aria-hidden>{icon}</div>
      <div className="feature-title">{title}</div>
      <div className="feature-desc">{desc}</div>
    </div>
  )
}

/* ── Product Hunt Badge ───────────────────────────────────── */
function ProductHuntBadge() {
  return (
    <div className="ph-badge" role="complementary" aria-label="Featured on Product Hunt">
      <div className="ph-logo" aria-hidden>🚀</div>
      <div className="ph-text-group">
        <div className="ph-label">Featured on</div>
        <div className="ph-title">Product Hunt</div>
      </div>
    </div>
  )
}

/* ── Main HeroPage ────────────────────────────────────────── */
interface HeroPageProps {
  onDashboard: () => void
}

export function HeroPage({ onDashboard }: HeroPageProps) {
  const season = useSeason()
  const h1Ref = useFadeUp()
  const subtitleRef = useFadeUp()
  const downloadRef = useFadeUp()
  const cmdRef = useFadeUp()

  return (
    <>
      {/* Aurora living background */}
      <div className="aurora-bg" aria-hidden>
        <div className="aurora-blade aurora-blade-1" />
        <div className="aurora-blade aurora-blade-2" />
        <div className="aurora-blade aurora-blade-3" />
        <div className="aurora-blade aurora-blade-4" />
        <div className="aurora-blade aurora-blade-5" />
      </div>

      {/* Film grain */}
      <div className="film-grain-overlay" aria-hidden />

      {/* Seasonal particles */}
      {season === 'winter' && <SnowParticles />}
      {season === 'autumn' && <LeafParticles />}

      {/* Floating nav */}
      <FloatingPillNav onDashboard={onDashboard} />

      {/* Page content */}
      <div className="page-content">
        {/* Hero */}
        <section className="hero-section" aria-labelledby="hero-heading">
          {/* Eyebrow */}
          <div className="eyebrow-chip">
            <span className="eyebrow-dot" aria-hidden />
            v2.0 — now with an AI command bar
          </div>

          {/* H1 */}
          <h1
            id="hero-heading"
            className="hero-h1 fade-up"
            ref={h1Ref}
            style={{ transitionDelay: '50ms' }}
          >
            Route Claude Code through{' '}
            <span className="gradient-word">every</span>
            {' '}free model on Earth
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle fade-up"
            ref={subtitleRef}
            style={{ transitionDelay: '100ms' }}
          >
            AURORA intercepts your Claude Code CLI, compresses tokens, and routes
            intelligently across OpenRouter, Gemini, Groq, Nvidia NIM, and Ollama —
            so you never hit a rate limit again.
          </p>

          {/* Download buttons */}
          <div
            className="download-row fade-up"
            ref={downloadRef}
            style={{ transitionDelay: '150ms' }}
          >
            <button className="keycap-btn" aria-label="Download for macOS">
              <span className="keycap-icon" aria-hidden><AppleGlyph /></span>
              <span className="keycap-text-group">
                <span className="keycap-text-label">Download for Mac</span>
                <span className="keycap-text-sub">macOS 12+</span>
              </span>
            </button>
            <button className="keycap-btn" onClick={onDashboard} aria-label="Open AURORA for Windows">
              <span className="keycap-icon" aria-hidden><WindowsGlyph /></span>
              <span className="keycap-text-group">
                <span className="keycap-text-label">Open for Windows</span>
                <span className="keycap-text-sub">Windows 10+</span>
              </span>
            </button>
          </div>

          {/* Install caption */}
          <p className="install-caption" aria-label="Installation commands">
            <code>npm run start</code>
            <span>·</span>
            Launch from your Aurora folder
          </p>

          {/* Command bar */}
          <div
            className="fade-up"
            ref={cmdRef}
            style={{ transitionDelay: '200ms', width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <CommandBarMockup />
          </div>

          {/* Ghost pill */}
          <button className="ghost-pill" onClick={onDashboard} aria-label="Open dashboard">
            Open Dashboard →
          </button>
        </section>

        {/* Scroll journey divider */}
        <ScrollJourneyLine height={120} />

        {/* Features */}
        <section className="features-section" aria-label="Features">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 80} />
            ))}
          </div>
        </section>
      </div>

      {/* Product Hunt badge */}
      <ProductHuntBadge />
    </>
  )
}
