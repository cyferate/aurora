import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { useAuroraStore } from '../../store'

// Animated digit odometer
function OdometerDigit({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 })
  const display = useTransform(spring, (v) => Math.round(v).toString())
  useEffect(() => { spring.set(value) }, [spring, value])
  return (
    <motion.span style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {display}
    </motion.span>
  )
}

interface OdometerCardProps {
  label: string
  value: number
  color: string
  unit?: string
  subtitle?: string
  icon?: string
}

function OdometerCard({ label, value, color, unit = '', subtitle, icon }: OdometerCardProps) {
  return (
    <GlassCard
      accentColor={color as any}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
        minWidth: '160px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: `var(--aurora-${color})` || color,
          letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#e8eaf6',
          textShadow: `0 0 20px var(--aurora-${color}, ${color})`,
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <OdometerDigit value={value} />
        </span>
        {unit && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(136,146,176,0.5)' }}>
            {unit}
          </span>
        )}
      </div>
      {subtitle && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.4)', letterSpacing: '0.08em' }}>
          {subtitle}
        </span>
      )}
    </GlassCard>
  )
}

export const TokenOdometer: React.FC = () => {
  const { totalTokensIn, totalTokensOut, totalTokensSaved, totalRequests } = useAuroraStore()

  const savePct = totalTokensIn > 0
    ? Math.round((totalTokensSaved / totalTokensIn) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
    >
      <OdometerCard
        label="Tokens In"
        value={totalTokensIn}
        color="cyan"
        unit="tok"
        icon="📥"
        subtitle="Input tokens consumed"
      />
      <OdometerCard
        label="Tokens Out"
        value={totalTokensOut}
        color="magenta"
        unit="tok"
        icon="📤"
        subtitle="Output tokens generated"
      />
      <OdometerCard
        label="Saved"
        value={totalTokensSaved}
        color="green"
        unit="tok"
        icon="⚡"
        subtitle={`${savePct}% compression rate`}
      />
      <OdometerCard
        label="Requests"
        value={totalRequests}
        color="purple"
        icon="🔀"
        subtitle="Total proxied requests"
      />
    </motion.div>
  )
}

