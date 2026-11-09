import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface NeonButtonProps {
  children: React.ReactNode
  onClick?: () => void
  color?: 'cyan' | 'magenta' | 'green' | 'red' | 'purple' | 'yellow'
  variant?: 'solid' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  icon?: React.ReactNode
}

const COLOR_MAP = {
  cyan:    { main: '#00f5ff', glow: 'rgba(0,245,255,0.4)',   bg: 'rgba(0,245,255,0.1)' },
  magenta: { main: '#ff00aa', glow: 'rgba(255,0,170,0.4)',   bg: 'rgba(255,0,170,0.1)' },
  green:   { main: '#00ff88', glow: 'rgba(0,255,136,0.4)',   bg: 'rgba(0,255,136,0.1)' },
  red:     { main: '#ff2244', glow: 'rgba(255,34,68,0.4)',   bg: 'rgba(255,34,68,0.1)' },
  purple:  { main: '#8844ff', glow: 'rgba(136,68,255,0.4)',  bg: 'rgba(136,68,255,0.1)' },
  yellow:  { main: '#f0e040', glow: 'rgba(240,224,64,0.4)',  bg: 'rgba(240,224,64,0.1)' },
}

const SIZE_MAP = {
  sm: { padding: '6px 12px', fontSize: '11px', gap: '6px' },
  md: { padding: '10px 20px', fontSize: '13px', gap: '8px' },
  lg: { padding: '14px 28px', fontSize: '15px', gap: '10px' },
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children, onClick, color = 'cyan', variant = 'outline', size = 'md',
  disabled = false, className, type = 'button', icon
}) => {
  const c = COLOR_MAP[color]
  const s = SIZE_MAP[size]

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.4 : 1,
    position: 'relative',
    overflow: 'hidden',
  }

  const variantStyle: React.CSSProperties = variant === 'solid'
    ? {
        background: c.main,
        color: '#000',
        boxShadow: `0 0 20px ${c.glow}`,
      }
    : variant === 'ghost'
    ? {
        background: c.bg,
        color: c.main,
        outline: 'none',
      }
    : {
        background: 'transparent',
        color: c.main,
        outline: `1px solid ${c.main}`,
        boxShadow: `inset 0 0 10px ${c.bg}`,
      }

  return (
    <motion.button
      type={type}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : {
        boxShadow: `0 0 25px ${c.glow}, 0 0 50px ${c.glow}`,
        scale: 1.03,
      }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{ ...baseStyle, ...variantStyle }}
      className={className}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </motion.button>
  )
}

