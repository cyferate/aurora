import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { NeonButton } from '../ui/NeonButton'
import {
  Cpu, Globe, Terminal, ExternalLink, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Loader2,
  Zap, Box, Code2, Server, Activity
} from 'lucide-react'

interface OmniRushStatus {
  online: boolean
  version: string | null
  port: number
  workspaces: string[]
  activeModel: string | null
  error: string | null
}

interface OmniRushSession {
  id: string
  title: string
  model: string
  created: string
  messages: number
}

const OMNIRUSH_PORT = 8787
const OMNIRUSH_URL = `http://localhost:${OMNIRUSH_PORT}`

export const OmniRushPanel: React.FC = () => {
  const [status, setStatus] = useState<OmniRushStatus>({
    online: false,
    version: null,
    port: OMNIRUSH_PORT,
    workspaces: [],
    activeModel: null,
    error: null,
  })
  const [sessions, setSessions] = useState<OmniRushSession[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [logs, setLogs] = useState<string[]>([
    '[AURORA] OmniRush integration ready',
    '[AURORA] Routing: OmniRush → AURORA Proxy (port 8082)',
    '[AURORA] OpenCode engine proxied through free-tier fallback',
  ])
  const [activeSection, setActiveSection] = useState<'status' | 'sessions' | 'config' | 'terminal'>('status')

  const checkStatus = useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetch(`${OMNIRUSH_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        setStatus(prev => ({
          ...prev,
          online: true,
          version: data.version || 'dev',
          workspaces: data.workspaces || [],
          activeModel: data.model || 'aurora-routed',
          error: null,
        }))
        addLog('[OK] OmniRush server responding on port 8787')
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        online: false,
        error: err instanceof Error ? err.message : 'Connection refused',
      }))
      addLog(`[ERR] OmniRush offline: ${err instanceof Error ? err.message : 'Connection refused'}`)
    } finally {
      setIsChecking(false)
    }
  }, [])

  const addLog = (line: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [`[${ts}] ${line}`, ...prev].slice(0, 50))
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 15000)
    return () => clearInterval(interval)
  }, [checkStatus])

  const openOmniRushUI = () => {
    window.open(`${OMNIRUSH_URL}`, '_blank')
    addLog('[ACTION] Opened OmniRush UI in browser')
  }

  const sections = [
    { id: 'status' as const, label: 'Status', icon: <Activity size={14} /> },
    { id: 'sessions' as const, label: 'Sessions', icon: <Code2 size={14} /> },
    { id: 'config' as const, label: 'Config', icon: <Box size={14} /> },
    { id: 'terminal' as const, label: 'Logs', icon: <Terminal size={14} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #6C3FC5, #A855F7)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(168,85,247,0.4)',
          }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700,
              color: '#A855F7', margin: 0, letterSpacing: '0.1em',
              textShadow: '0 0 20px rgba(168,85,247,0.5)',
            }}>
              OMNIRUSH
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'rgba(136,146,176,0.6)', margin: 0, letterSpacing: '0.15em',
            }}>
              OPEN-SOURCE AI WORKBENCH • AURORA INTEGRATED
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <NeonButton
            onClick={checkStatus}
            variant="ghost"
            color="purple"
            size="sm"
            icon={<RefreshCw size={12} style={{ animation: isChecking ? 'spin 1s linear infinite' : 'none' }} />}
          >
            Refresh
          </NeonButton>
          <NeonButton
            onClick={openOmniRushUI}
            variant="outline"
            color="purple"
            size="sm"
            icon={<ExternalLink size={12} />}
          >
            Open UI
          </NeonButton>
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard style={{
          padding: '14px 20px',
          borderColor: status.online ? 'rgba(0,255,136,0.3)' : 'rgba(255,80,80,0.3)',
          background: status.online
            ? 'rgba(0,255,136,0.04)'
            : 'rgba(255,80,80,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isChecking ? (
              <Loader2 size={18} color="#A855F7" style={{ animation: 'spin 1s linear infinite' }} />
            ) : status.online ? (
              <CheckCircle size={18} color="#00ff88" style={{ filter: 'drop-shadow(0 0 6px #00ff88)' }} />
            ) : (
              <XCircle size={18} color="#ff5050" style={{ filter: 'drop-shadow(0 0 6px #ff5050)' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
                color: status.online ? '#00ff88' : '#ff5050',
              }}>
                {isChecking ? 'CHECKING...' : status.online ? `ONLINE — port ${status.port}` : 'OFFLINE'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.5)', marginTop: '2px' }}>
                {status.online
                  ? `v${status.version} • Routed → AURORA Proxy (8082) • Model: ${status.activeModel}`
                  : status.error || 'Start: cd omnirush && bun run apps/server/src/cli.ts'}
              </div>
            </div>

            {/* Routing indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px',
              background: 'rgba(168,85,247,0.1)',
              borderRadius: '20px',
              border: '1px solid rgba(168,85,247,0.3)',
            }}>
              <Server size={10} color="#A855F7" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#A855F7' }}>
                AURORA PROXY
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: activeSection === s.id ? 'rgba(168,85,247,0.15)' : 'transparent',
              border: `1px solid ${activeSection === s.id ? 'rgba(168,85,247,0.4)' : 'rgba(136,146,176,0.1)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: activeSection === s.id ? '#A855F7' : 'rgba(136,146,176,0.5)',
              transition: 'all 0.2s ease',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1, minHeight: 0 }}
        >

          {/* STATUS section */}
          {activeSection === 'status' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Server Port', value: `${OMNIRUSH_PORT}`, icon: <Server size={14} />, color: '#A855F7' },
                { label: 'Engine', value: 'OpenCode v2', icon: <Cpu size={14} />, color: '#00f5ff' },
                { label: 'AI Backend', value: 'AURORA Proxy', icon: <Zap size={14} />, color: '#00ff88' },
                { label: 'Mode', value: 'Dev (No Auth)', icon: <Globe size={14} />, color: '#f0e040' },
                { label: 'Approval', value: 'Auto', icon: <CheckCircle size={14} />, color: '#ff00aa' },
                { label: 'Workspace', value: 'Aurora/', icon: <Box size={14} />, color: '#ff8800' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: item.color }}>
                      {item.value}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* SESSIONS section */}
          {activeSection === 'sessions' && (
            <GlassCard style={{ padding: '16px', height: '100%', minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#A855F7', margin: 0 }}>
                  ACTIVE SESSIONS
                </h3>
                <NeonButton
                  variant="ghost"
                  color="purple"
                  size="sm"
                  icon={<ExternalLink size={10} />}
                  onClick={() => window.open(`${OMNIRUSH_URL}/sessions`, '_blank')}
                >
                  Open in OmniRush
                </NeonButton>
              </div>

              {sessions.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '40px', color: 'rgba(136,146,176,0.3)',
                }}>
                  <Code2 size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', margin: 0 }}>
                    {status.online ? 'No active sessions' : 'OmniRush is offline'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '6px', color: 'rgba(136,146,176,0.2)' }}>
                    {status.online
                      ? `Open ${OMNIRUSH_URL} to start a session`
                      : 'Start OmniRush first (see Config tab)'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sessions.map(session => (
                    <div key={session.id} style={{
                      padding: '12px',
                      background: 'rgba(168,85,247,0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(168,85,247,0.15)',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fff', marginBottom: '4px' }}>
                        {session.title}
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A855F7' }}>{session.model}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.4)' }}>{session.messages} msgs</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.3)' }}>{session.created}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {/* CONFIG section */}
          {activeSection === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <GlassCard style={{ padding: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#A855F7', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  🔌 Integration Config
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'OPENCODE_BASE_URL', value: 'http://localhost:8082', desc: 'OmniRush AI engine → AURORA proxy' },
                    { key: 'ANTHROPIC_BASE_URL', value: 'http://localhost:20128/v1', desc: 'Claude Code harness endpoint' },
                    { key: 'OMNIRUSH_DEV_MODE', value: '1', desc: 'Bypass cloud auth for local use' },
                    { key: 'PORT', value: '8787', desc: 'OmniRush server port' },
                    { key: 'CORS_ORIGINS', value: 'localhost:5173, localhost:20128', desc: 'AURORA dashboard access' },
                  ].map(item => (
                    <div key={item.key} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(168,85,247,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#A855F7' }}>{item.key}</code>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00f5ff' }}>{item.value}</code>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.4)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard style={{ padding: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#ff8800', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ▶ Manual Start Commands
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Via AURORA (recommended)', cmd: 'npm run start  # from Aurora/ folder' },
                    { label: 'OmniRush server only (requires Bun)', cmd: 'cd omnirush && bun apps/server/src/cli.ts --port 8787 --opencode-base-url http://localhost:8082' },
                    { label: 'OmniRush web UI only', cmd: 'cd omnirush/apps/app && npx vite --port 8788' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.4)', marginBottom: '3px', textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: '#00f5ff',
                        border: '1px solid rgba(0,245,255,0.1)',
                        userSelect: 'all',
                      }}>
                        {item.cmd}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TERMINAL/LOGS section */}
          {activeSection === 'terminal' && (
            <GlassCard style={{ padding: '16px', height: '100%', minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#A855F7', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Terminal size={12} style={{ display: 'inline', marginRight: '6px' }} />
                  Integration Logs
                </h3>
                <button
                  onClick={() => setLogs(['[CLEARED] Log cleared'])}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
              <div style={{
                height: '280px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '2px',
              }}>
                {logs.map((log, i) => (
                  <div key={i} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: log.includes('[ERR]') ? '#ff5050'
                      : log.includes('[OK]') ? '#00ff88'
                      : log.includes('[ACTION]') ? '#A855F7'
                      : 'rgba(136,146,176,0.6)',
                    padding: '2px 0',
                    borderBottom: '1px solid rgba(136,146,176,0.04)',
                  }}>
                    {log}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
