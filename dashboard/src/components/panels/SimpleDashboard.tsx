import React, { useEffect, useState } from 'react'
import { useAuroraStore } from '../../store'

interface Stats {
  totalRequests: number
  successRate: number
  tokensToday: number
  activeSessions: number
}

interface LogLine {
  id: number
  time: string
  level: 'ok' | 'warn' | 'err'
  msg: string
}

type DashTab = 'overview' | 'keys' | 'logs' | 'providers'

const PROVIDER_COLORS: Record<string, string> = {
  openrouter: 'openrouter',
  gemini:     'gemini',
  groq:       'groq',
  nvidia:     'nvidia',
  ollama:     'ollama',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export function SimpleDashboard({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<DashTab>('overview')
  const [online, setOnline] = useState(false)
  const [stats, setStats] = useState<Stats>({ totalRequests: 0, successRate: 100, tokensToday: 0, activeSessions: 0 })
  const [logs, setLogs] = useState<LogLine[]>([])
  const store = useAuroraStore()

  // Keys state (local)
  const [keys, setKeys] = useState({
    openrouter: '',
    gemini:     '',
    groq:       '',
    nvidia:     '',
  })

  // Poll health
  useEffect(() => {
    async function poll() {
      try {
        const r = await fetch('http://localhost:8082/health')
        const j = await r.json()
        setOnline(j.status === 'aurora_proxy_online')
        addLog('ok', `Health check OK — status: ${j.status}`)
      } catch {
        setOnline(false)
        addLog('err', 'Proxy unreachable — start with npm run start')
      }
    }
    poll()
    const id = setInterval(poll, 15_000)
    return () => clearInterval(id)
  }, [])

  // Poll stats
  useEffect(() => {
    async function poll() {
      try {
        const r = await fetch('http://localhost:8082/api/stats')
        if (!r.ok) return
        const j = await r.json()
        setStats({
          totalRequests: j.total_requests ?? 0,
          successRate:   Math.round((j.success_rate ?? 1) * 100),
          tokensToday:   j.tokens_today ?? 0,
          activeSessions:j.active_sessions ?? 0,
        })
      } catch { /* silent */ }
    }
    poll()
    const id = setInterval(poll, 10_000)
    return () => clearInterval(id)
  }, [])

  function addLog(level: LogLine['level'], msg: string) {
    setLogs(prev => [{ id: Date.now(), time: now(), level, msg }, ...prev].slice(0, 80))
  }

  async function saveKey(provider: string, value: string) {
    try {
      await fetch('http://localhost:8082/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: value }),
      })
      addLog('ok', `Key saved for ${provider}`)
    } catch {
      addLog('err', `Failed to save key for ${provider}`)
    }
  }

  const TABS: { id: DashTab; label: string }[] = [
    { id: 'overview',   label: 'Overview' },
    { id: 'keys',       label: 'API Keys' },
    { id: 'providers',  label: 'Providers' },
    { id: 'logs',       label: 'Logs' },
  ]

  return (
    <div className="simple-dashboard">
      {/* Header */}
      <header className="dash-header">
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: '0 4px',
            marginRight: 4,
          }}
          aria-label="Back to home"
        >
          ←
        </button>
        <div className="dash-logo">◈ AURORA</div>
        <div className="dash-subtitle">Proxy Control Panel · v2.0</div>
        <div className={`dash-status-pill ${online ? 'online' : 'offline'}`}>
          <div className="dash-status-dot" />
          {online ? 'Proxy Online' : 'Proxy Offline'}
        </div>
      </header>

      {/* Body */}
      <div className="dash-body">
        {/* Flow strip */}
        <div className="flow-strip" role="img" aria-label="Request routing flow">
          <div className="flow-node">
            <div className="flow-node-icon source" aria-hidden>💻</div>
            <div className="flow-node-label">Claude Code CLI</div>
            <div className="flow-node-sub">port 20128</div>
          </div>

          <div className="flow-arrow" aria-hidden>
            <div className="flow-dots">
              <div className="flow-dot" />
              <div className="flow-dot" />
              <div className="flow-dot" />
            </div>
          </div>

          <div className="flow-node">
            <div className="flow-node-icon proxy" aria-hidden>◈</div>
            <div className="flow-node-label">AURORA Proxy</div>
            <div className="flow-node-sub">port 8082</div>
          </div>

          <div className="flow-arrow" aria-hidden>
            <div className="flow-dots">
              <div className="flow-dot" />
              <div className="flow-dot" />
              <div className="flow-dot" />
            </div>
          </div>

          <div className="flow-node">
            <div className="flow-node-icon target" aria-hidden>🌐</div>
            <div className="flow-node-label">Free Model</div>
            <div className="flow-node-sub">OpenRouter / Gemini / Groq</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="dash-nav" aria-label="Dashboard sections">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`dash-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
              aria-selected={tab === t.id}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {tab === 'overview' && (
          <>
            {/* Metrics */}
            <div className="metrics-row">
              {[
                { label: 'TOTAL REQUESTS', value: fmt(stats.totalRequests), delta: 'All time' },
                { label: 'SUCCESS RATE',   value: `${stats.successRate}%`,   delta: 'Live', up: stats.successRate >= 95 },
                { label: 'TOKENS TODAY',   value: fmt(stats.tokensToday),    delta: 'Last 24h' },
                { label: 'ACTIVE SESSIONS',value: String(stats.activeSessions), delta: 'Right now' },
              ].map((m, i) => (
                <div key={i} className="metric-card">
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">{m.value}</div>
                  <div className={`metric-delta${m.up === false ? ' down' : ''}`}>{m.delta}</div>
                </div>
              ))}
            </div>

            {/* Quick start */}
            <div>
              <div className="section-title">Quick Start</div>
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.055)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  lineHeight: 2,
                }}
              >
                <div><span style={{ color: 'var(--warm-amber)' }}>$</span> <span style={{ color: '#4ade80' }}>export</span> ANTHROPIC_BASE_URL=http://localhost:20128/v1</div>
                <div><span style={{ color: 'var(--warm-amber)' }}>$</span> <span style={{ color: '#4ade80' }}>export</span> ANTHROPIC_API_KEY=any-value-works</div>
                <div><span style={{ color: 'var(--warm-amber)' }}>$</span> claude  <span style={{ color: 'var(--text-dim)' }}># ← now routed through AURORA</span></div>
              </div>
            </div>
          </>
        )}

        {tab === 'keys' && (
          <div>
            <div className="section-title">API Keys</div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>
              Keys are stored locally in SQLite. Paste each key and click Save.
            </p>
            {[
              { id: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-v1-...' },
              { id: 'gemini',     label: 'Gemini',     placeholder: 'AIza...' },
              { id: 'groq',       label: 'Groq',       placeholder: 'gsk_...' },
              { id: 'nvidia',     label: 'Nvidia NIM', placeholder: 'nvapi-...' },
            ].map(p => (
              <div key={p.id} className="key-input-row">
                <div className={`provider-badge ${PROVIDER_COLORS[p.id] ?? ''}`}>
                  {p.label}
                </div>
                <input
                  className="key-input"
                  type="password"
                  placeholder={p.placeholder}
                  value={keys[p.id as keyof typeof keys] ?? ''}
                  onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                  aria-label={`${p.label} API key`}
                />
                <div
                  className="key-status-dot"
                  style={{
                    background: keys[p.id as keyof typeof keys]
                      ? '#4ade80'
                      : 'var(--text-dim)',
                  }}
                />
                <button
                  className="warm-btn"
                  onClick={() => saveKey(p.id, keys[p.id as keyof typeof keys])}
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'providers' && (
          <div>
            <div className="section-title">Provider Routing</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {[
                { name: 'OpenRouter',  badge: 'openrouter', tier: 'Tier 1 — Primary',   models: 'Claude 3.5, Llama 3.1 405B, Qwen 2.5', emoji: '🔀' },
                { name: 'Gemini',      badge: 'gemini',     tier: 'Tier 1 — Primary',   models: 'Gemini 1.5 Pro, Flash',                  emoji: '✨' },
                { name: 'Groq',        badge: 'groq',       tier: 'Tier 2 — Fallback',  models: 'Llama 3.1 70B, Mixtral 8x7B',           emoji: '⚡' },
                { name: 'Nvidia NIM',  badge: 'nvidia',     tier: 'Tier 2 — Fallback',  models: 'Llama 3.1 405B Instruct',               emoji: '🖥️' },
                { name: 'Ollama',      badge: 'ollama',     tier: 'Tier 3 — Local',     models: 'Any local model you have pulled',        emoji: '🏠' },
              ].map(p => (
                <div key={p.name} className="metric-card" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }} aria-hidden>{p.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                    <div className={`provider-badge ${p.badge}`} style={{ marginLeft: 'auto' }}>
                      {p.tier}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    {p.models}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div>
            <div className="section-title">Request Log</div>
            <div className="log-stream" aria-live="polite" aria-label="Live request log">
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '32px 0' }}>
                  Waiting for requests…
                </div>
              ) : (
                logs.map(l => (
                  <div key={l.id} className="log-line">
                    <span className="log-time">{l.time}</span>
                    <span className={`log-level-${l.level}`}>
                      {l.level === 'ok' ? 'OK ' : l.level === 'warn' ? 'WRN' : 'ERR'}
                    </span>
                    <span className="log-msg">{l.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
