import React, { useEffect, useRef } from 'react'

interface Snowflake {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  drift: number
}

function makeFlakes(count: number): Snowflake[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 3 + Math.random() * 7,
    duration: 6 + Math.random() * 8,
    delay: -Math.random() * 14,
    drift: (Math.random() - 0.5) * 80,
  }))
}

const FLAKES = makeFlakes(55)

export function SnowParticles() {
  return (
    <div className="particles-layer" aria-hidden>
      {FLAKES.map(f => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.x}%`,
            '--size': `${f.size}px`,
            '--duration': `${f.duration}s`,
            '--delay': `${f.delay}s`,
            '--snow-drift': `${f.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
