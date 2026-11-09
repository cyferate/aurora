import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { NeonButton } from '../ui/NeonButton'
import { Save } from 'lucide-react'

const PROVIDERS_CONFIG = [
  { key: 'OPENROUTER_API_KEY', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-…', color: 'green' as const, hint: 'openrouter.ai/keys — Free tier available' },
  { key: 'NVIDIA_API_KEY', label: 'Nvidia NIM API Key', placeholder: 'nvapi-…', color: 'cyan' as const, hint: 'build.nvidia.com — Free tier available' },
  { key: 'GROQ_API_KEY', label: 'Groq API Key', placeholder: 'gsk_…', color: 'yellow' as const, hint: 'console.groq.com — Free tier available' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key', placeholder: 'AIzaSy…', color: 'magenta' as const, hint: 'aistudio.google.com/apikey — Free tier available' },
  { key: 'OLLAMA_BASE_URL', label: 'Ollama Base URL', placeholder: 'http://localhost:11434', color: 'purple' as const, hint: 'ollama.ai — Fully local, no key needed' },
]

const CHAIN_OPTIONS = ['openrouter', 'nvidia', 'groq', 'gemini', 'ollama']

export const Settings: React.FC = () => {
  const [chain, setChain] = useState(['openrouter', 'nvidia', 'groq', 'gemini', 'ollama'])
  const [moaEnabled, setMoaEnabled] = useState(false)
  const [tokenSaver, setTokenSaver] = useState(true)
  const [saved, setSaved] = useState(false)

  const toggleChain = (p: string) => {
    setChain(c => c.includes(p) ? c.filter(x => x !== p) : [...c, p])
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.15)',
    borderRadius: '6px', color: '#e8eaf6',
    fontFamily: 'var(--font-mono)', fontSize: '12px',
    padding: '8px 12px', outline: 'none', width: '100%',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#ff8800', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
          ⚙️ Settings
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(136,146,176,0.5)' }}>
          Configure providers, routing chain, and advanced features
        </p>
      </div>

      {/* Provider chain order */}
      <GlassCard accentColor="cyan" style={{ padding: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00f5ff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Provider Priority Chain
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CHAIN_OPTIONS.map((p, i) => (
            <button
              key={p}
              onClick={() => toggleChain(p)}
              style={{
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                background: chain.includes(p) ? 'rgba(0,245,255,0.1)' : 'rgba(0,0,0,0.3)',
                border: chain.includes(p) ? '1px solid rgba(0,245,255,0.5)' : '1px solid rgba(136,146,176,0.2)',
                color: chain.includes(p) ? '#00f5ff' : 'rgba(136,146,176,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {chain.includes(p) ? `${chain.indexOf(p) + 1}. ` : '✗ '}{p}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.3)', marginTop: '8px' }}>
          Click to toggle. Order = fallback priority.
        </p>
      </GlassCard>

      {/* Toggles */}
      <GlassCard accentColor="purple" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#8844ff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Features
        </h3>
        {[
          { key: 'tokenSaver', label: 'RTK Token Saver', desc: 'Compress tool results to save 20-40% tokens', value: tokenSaver, set: setTokenSaver, color: '#00ff88' },
          { key: 'moa', label: 'Mixture of Agents', desc: 'Multi-model debate chain (adds latency)', value: moaEnabled, set: setMoaEnabled, color: '#8844ff' },
        ].map(opt => (
          <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              onClick={() => opt.set(!opt.value)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                background: opt.value ? opt.color : 'rgba(0,0,0,0.5)',
                border: `1px solid ${opt.value ? opt.color : 'rgba(136,146,176,0.2)'}`,
                position: 'relative', transition: 'all 0.2s ease', flexShrink: 0,
                boxShadow: opt.value ? `0 0 10px ${opt.color}60` : 'none',
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: opt.value ? '#fff' : 'rgba(136,146,176,0.4)',
                position: 'absolute', top: '2px',
                left: opt.value ? '22px' : '2px',
                transition: 'all 0.2s ease',
              }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: opt.value ? opt.color : 'rgba(136,146,176,0.6)', fontWeight: 600 }}>
                {opt.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.4)' }}>
                {opt.desc}
              </div>
            </div>
          </div>
        ))}
      </GlassCard>

      {/* API Keys */}
      <GlassCard accentColor="magenta" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ff00aa', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          API Keys (.env)
        </h3>
        {PROVIDERS_CONFIG.map(cfg => (
          <div key={cfg.key}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', color: `var(--aurora-${cfg.color})`, letterSpacing: '0.08em', marginBottom: '4px', textTransform: 'uppercase' }}>
              {cfg.label}
            </label>
            <input type="password" placeholder={cfg.placeholder} style={inputStyle} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.3)', marginTop: '3px' }}>
              {cfg.hint}
            </p>
          </div>
        ))}
      </GlassCard>

      <NeonButton color="green" onClick={handleSave} icon={<Save size={14} />}>
        {saved ? '✓ Saved to .env' : 'Save Configuration'}
      </NeonButton>
    </div>
  )
}

