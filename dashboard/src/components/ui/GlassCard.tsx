import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accentColor?: 'cyan' | 'magenta' | 'green' | 'purple' | 'yellow' | 'red'
  glow?: boolean
  hover?: boolean
  style?: React.CSSProperties
}

const ACCENT_MAP = {
  cyan:    { border: 'rgba(0,245,255,0.3)',   glow: 'rgba(0,245,255,0.15)',    color: '#00f5ff' },
  magenta: { border: 'rgba(255,0,170,0.3)',   glow: 'rgba(255,0,170,0.15)',   color: '#ff00aa' },
  green:   { border: 'rgba(0,255,136,0.3)',   glow: 'rgba(0,255,136,0.15)',   color: '#00ff88' },
  purple:  { border: 'rgba(136,68,255,0.3)',  glow: 'rgba(136,68,255,0.15)',  color: '#8844ff' },
  yellow:  { border: 'rgba(240,224,64,0.3)',  glow: 'rgba(240,224,64,0.15)',  color: '#f0e040' },
  red:     { border: 'rgba(255,34,68,0.3)',   glow: 'rgba(255,34,68,0.15)',   color: '#ff2244' },
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children, className, accentColor = 'cyan', glow = false, hover = true, style
}) => {
  const accent = ACCENT_MAP[accentColor]

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2 }}
      className={clsx('glass-panel', className)}
      style={{
        background: 'rgba(13,13,26,0.75)',
        border: `1px solid ${accent.border}`,
        backdropFilter: 'blur(16px)',
        borderRadius: '12px',
        boxShadow: glow
          ? `0 0 20px ${accent.glow}, 0 0 60px ${accent.glow}, inset 0 0 20px rgba(0,0,0,0.3)`
          : `0 4px 24px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2)`,
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

