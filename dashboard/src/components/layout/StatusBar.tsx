import React from 'react'
import { motion } from 'framer-motion'
import { useAuroraStore } from '../../store'

export const StatusBar: React.FC = () => {
  const { totalTokensIn, totalTokensOut, totalTokensSaved, totalRequests, proxyOnline, activeProvider } = useAuroraStore()

  const stats = [
    { label: 'IN',    value: totalTokensIn.toLocaleString(),    color: '#00f5ff', unit: 'tok' },
    { label: 'OUT',   value: totalTokensOut.toLocaleString(),   color: '#ff00aa', unit: 'tok' },
    { label: 'SAVED', value: totalTokensSaved.toLocaleString(), color: '#00ff88', unit: 'tok' },
    { label: 'REQS',  value: totalRequests.toLocaleString(),    color: '#8844ff', unit: '' },
  ]

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{
        height: '36px',
        background: 'rgba(3,3,10,0.95)',
        borderTop: '1px solid rgba(0,245,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '24px',
        flexShrink: 0,
      }}
    >
      {/* Port info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: proxyOnline ? '#00ff88' : '#ff2244', boxShadow: proxyOnline ? '0 0 6px #00ff88' : '0 0 6px #ff2244', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.6)', letterSpacing: '0.08em' }}>
          :20128/v1
        </span>
      </div>

      <div style={{ width: '1px', height: '16px', background: 'rgba(0,245,255,0.1)' }} />

      {/* Stats */}
      {stats.map((s) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.4)', letterSpacing: '0.12em' }}>
            {s.label}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: s.color, textShadow: `0 0 8px ${s.color}` }}>
            {s.value}
          </span>
          {s.unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.3)' }}>{s.unit}</span>}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Active provider */}
      {activeProvider && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.4)', letterSpacing: '0.1em' }}>ACTIVE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#00f5ff', fontWeight: 600, textShadow: '0 0 6px #00f5ff' }}>
            {activeProvider.toUpperCase()}
          </span>
        </div>
      )}

      <div style={{ width: '1px', height: '16px', background: 'rgba(0,245,255,0.1)' }} />

      {/* Env hint */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.3)', letterSpacing: '0.05em' }}>
        ANTHROPIC_BASE_URL=http://localhost:20128/v1
      </span>
    </motion.div>
  )
}

