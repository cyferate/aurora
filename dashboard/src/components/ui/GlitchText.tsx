import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GlitchTextProps {
  text: string
  className?: string
  style?: React.CSSProperties
  glitchInterval?: number
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text, className, style, glitchInterval = 4000
}) => {
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    const trigger = () => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 400)
    }
    const interval = setInterval(trigger, glitchInterval)
    return () => clearInterval(interval)
  }, [glitchInterval])

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {text}
      {glitching && (
        <>
          <span style={{
            position: 'absolute', top: 0, left: 0, color: '#00f5ff',
            clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
            transform: 'translate(-3px, -1px)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}>{text}</span>
          <span style={{
            position: 'absolute', top: 0, left: 0, color: '#ff00aa',
            clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
            transform: 'translate(3px, 1px)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}>{text}</span>
        </>
      )}
    </span>
  )
}

