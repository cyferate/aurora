import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { NeonButton } from '../ui/NeonButton'
import { useAuroraStore } from '../../store'
import axios from 'axios'

const PROVIDER_INFO: Record<string, { label: string; color: string; icon: string; url: string }> = {
  openrouter: { label: 'OpenRouter',  color: 'green',  icon: '🔀', url: 'https://openrouter.ai/keys' },
  nvidia:     { label: 'Nvidia NIM',  color: 'cyan',   icon: '🖥', url: 'https://build.nvidia.com' },
  groq:       { label: 'Groq',        color: 'yellow', icon: '⚡', url: 'https://console.groq.com/keys' },
  gemini:     { label: 'Gemini',      color: 'magenta',icon: '♊', url: 'https://aistudio.google.com/apikey' },
  ollama:     { label: 'Ollama',      color: 'purple', icon: '🦙', url: 'https://ollama.ai' },
}

function KeyCard({ keyData }: { keyData: any }) {
  const info = PROVIDER_INFO[keyData.provider] || { label: keyData.provider, color: 'cyan', icon: '🔑', url: '' }
  const isActive = keyData.status === 'active'
  const isCool   = keyData.status === 'cooldown'

  const cooldownRemaining = isCool && keyData.cooldownUntil
    ? Math.max(0, Math.round((keyData.cooldownUntil * 1000 - Date.now()) / 60000))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        accentColor={isActive ? info.color as any : isCool ? 'yellow' : 'red'}
        style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <span style={{ fontSize: '18px' }}>{info.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
              color: `var(--aurora-${info.color})`,
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              {info.label}
            </span>
            {isActive && <CheckCircle size={12} color="#00ff88" />}
            {isCool && <Clock size={12} color="#f0e040" />}
            {keyData.status === 'exhausted' && <AlertCircle size={12} color="#ff2244" />}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(136,146,176,0.5)' }}>
            {keyData.keyHint}
            {isCool && cooldownRemaining !== null && (
              <span style={{ color: '#f0e040', marginLeft: '8px' }}>
                ~{cooldownRemaining}m cooldown
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.4)' }}>
            {keyData.usageCount} uses
          </span>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const KeyManager: React.FC = () => {
  const { apiKeys, setApiKeys } = useAuroraStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProvider, setNewProvider] = useState('openrouter')
  const [newKey, setNewKey] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const handleAddKey = async () => {
    if (!newKey.trim()) { setError('Key cannot be empty'); return }
    setAdding(true); setError('')
    try {
      await axios.post('http://localhost:8082/api/keys', { provider: newProvider, key: newKey.trim() })
      // Refresh keys
      const resp = await axios.get('http://localhost:8082/api/keys')
      setApiKeys(resp.data.keys || [])
      setNewKey('')
      setShowAddForm(false)
    } catch (e: any) {
      setError(e.message || 'Failed to add key')
    } finally {
      setAdding(false)
    }
  }

  const handleRefresh = async () => {
    try {
      const resp = await axios.get('http://localhost:8082/api/keys')
      setApiKeys(resp.data.keys || [])
    } catch {}
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '6px',
    color: '#e8eaf6',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: '8px 12px',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#ff00aa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            🔑 API Key Pool
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.5)', marginTop: '4px' }}>
            {apiKeys.length} keys • Round-robin rotation with auto-cooldown
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <NeonButton color="cyan" size="sm" onClick={handleRefresh} icon={<RefreshCw size={12} />}>
            Refresh
          </NeonButton>
          <NeonButton color="magenta" size="sm" onClick={() => setShowAddForm(!showAddForm)} icon={<Plus size={12} />}>
            Add Key
          </NeonButton>
        </div>
      </div>

      {/* Quick-start env instructions */}
      <GlassCard accentColor="cyan" style={{ padding: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#00f5ff', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
          ⚡ Quick Start
        </h3>
        <div style={{
          background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '12px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00f5ff', lineHeight: 1.8,
        }}>
          <div><span style={{ color: '#8892b0' }}># In your terminal:</span></div>
          <div>export ANTHROPIC_BASE_URL=<span style={{ color: '#00ff88' }}>"http://localhost:20128/v1"</span></div>
          <div>export ANTHROPIC_API_KEY=<span style={{ color: '#00ff88' }}>"aurora-free-forever"</span></div>
          <div style={{ marginTop: '6px' }}><span style={{ color: '#8892b0' }}># Then just run Claude Code normally:</span></div>
          <div>claude <span style={{ color: '#f0e040' }}>"your task here"</span></div>
        </div>
      </GlassCard>

      {/* Add key form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard accentColor="magenta" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ff00aa', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Add API Key
              </h3>
              <select
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {Object.entries(PROVIDER_INFO).map(([id, info]) => (
                  <option key={id} value={id} style={{ background: '#0d0d1a' }}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
              />
              {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ff2244' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <NeonButton color="green" size="sm" onClick={handleAddKey} disabled={adding}>
                  {adding ? 'Adding…' : 'Add Key'}
                </NeonButton>
                <NeonButton color="red" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancel
                </NeonButton>
              </div>
              {newProvider !== 'ollama' && (
                <a
                  href={PROVIDER_INFO[newProvider]?.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,245,255,0.5)', textDecoration: 'none' }}
                >
                  → Get free {PROVIDER_INFO[newProvider]?.label} API key ↗
                </a>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {apiKeys.length === 0 ? (
            <GlassCard accentColor="purple" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(136,146,176,0.4)' }}>
                No keys configured yet. Add a key above to begin routing.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.3)', marginTop: '8px' }}>
                AURORA also reads keys from your .env file automatically.
              </p>
            </GlassCard>
          ) : (
            apiKeys.map((key) => <KeyCard key={key.id} keyData={key} />)
          )}
        </AnimatePresence>
      </div>

      {/* Provider free tier links */}
      <GlassCard accentColor="green" style={{ padding: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#00ff88', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
          Free Tier Sources
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '8px' }}>
          {Object.entries(PROVIDER_INFO).map(([id, info]) => (
            <a
              key={id}
              href={info.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                borderRadius: '6px', background: 'rgba(0,0,0,0.3)',
                border: `1px solid var(--aurora-${info.color}, #333)`,
                textDecoration: 'none', transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '14px' }}>{info.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: `var(--aurora-${info.color})` }}>
                {info.label}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.3)' }}>↗</span>
            </a>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

