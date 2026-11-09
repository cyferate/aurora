import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap, Network, Key, Bot, Puzzle, Focus, Settings,
  Wifi, WifiOff, Circle, Layers
} from 'lucide-react'
import { useAuroraStore, ActiveTab } from '../../store'
import { GlitchText } from '../ui/GlitchText'

const NAV_ITEMS: { id: ActiveTab; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'visualizer', icon: <Network size={18} />, label: 'Visualizer',  color: '#00f5ff' },
  { id: 'keys',       icon: <Key size={18} />,     label: 'API Keys',    color: '#ff00aa' },
  { id: 'moa',        icon: <Bot size={18} />,      label: 'MoA Chain',   color: '#8844ff' },
  { id: 'plugins',    icon: <Puzzle size={18} />,   label: 'Plugins',     color: '#00ff88' },
  { id: 'focus',      icon: <Focus size={18} />,    label: 'Focus Mode',  color: '#f0e040' },
  { id: 'omnirush',  icon: <Layers size={18} />,   label: 'OmniRush',    color: '#A855F7' },
  { id: 'settings',  icon: <Settings size={18} />, label: 'Settings',    color: '#ff8800' },
]

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, proxyOnline, wsConnected, totalRequests, totalTokensSaved } = useAuroraStore()

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'rgba(6,6,16,0.95)',
        borderRight: '1px solid rgba(0,245,255,0.12)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Zap size={24} color="#00f5ff" style={{ filter: 'drop-shadow(0 0 8px #00f5ff)' }} />
          <GlitchText
            text="AURORA"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#00f5ff',
              textShadow: '0 0 20px rgba(0,245,255,0.6)',
              letterSpacing: '0.15em',
            }}
          />
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'rgba(0,245,255,0.5)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          Unified Proxy Platform
        </p>
      </div>

      {/* Status bar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-dot ${proxyOnline ? 'active' : 'offline'}`} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: proxyOnline ? '#00ff88' : '#4a5568' }}>
            {proxyOnline ? 'PROXY ONLINE' : 'PROXY OFFLINE'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wsConnected
            ? <Wifi size={10} color="#00f5ff" />
            : <WifiOff size={10} color="#4a5568" />}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: wsConnected ? '#00f5ff' : '#4a5568' }}>
            {wsConnected ? 'WS LIVE' : 'WS OFFLINE'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: isActive ? `rgba(0,0,0,0)` : 'transparent',
                color: isActive ? item.color : 'rgba(136,146,176,0.7)',
                outline: isActive ? `1px solid ${item.color}33` : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  style={{
                    position: 'absolute',
                    left: 0, top: '20%', bottom: '20%',
                    width: '3px',
                    background: item.color,
                    borderRadius: '0 2px 2px 0',
                    boxShadow: `0 0 8px ${item.color}`,
                  }}
                />
              )}
              <span style={{ color: isActive ? item.color : 'rgba(136,146,176,0.5)', filter: isActive ? `drop-shadow(0 0 6px ${item.color})` : 'none' }}>
                {item.icon}
              </span>
              {item.label}
            </motion.button>
          )
        })}
      </nav>

      {/* Stats footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(0,245,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.5)', textTransform: 'uppercase' }}>Requests</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#00f5ff' }}>{totalRequests.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.5)', textTransform: 'uppercase' }}>Saved</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#00ff88' }}>{totalTokensSaved.toLocaleString()} tok</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(136,146,176,0.3)', textAlign: 'center' }}>
          AURORA v1.0.0 • Free Forever
        </div>
      </div>
    </motion.aside>
  )
}

