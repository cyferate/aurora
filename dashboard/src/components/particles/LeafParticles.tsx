import React from 'react'

interface Leaf {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  driftMid: number
  driftEnd: number
  emoji: string
}

const LEAVES_POOL = ['🍂', '🍁', '🍃', '🌸', '🌺']

function makeLeaves(count: number): Leaf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 12 + Math.random() * 14,
    duration: 5 + Math.random() * 7,
    delay: -Math.random() * 12,
    driftMid: (Math.random() - 0.3) * 120,
    driftEnd: (Math.random() - 0.5) * 60,
    emoji: LEAVES_POOL[i % LEAVES_POOL.length],
  }))
}

const LEAVES = makeLeaves(30)

export function LeafParticles() {
  return (
    <div className="particles-layer" aria-hidden>
      {LEAVES.map(l => (
        <div
          key={l.id}
          className="leaf"
          style={{
            left: `${l.x}%`,
            '--size': `${l.size}px`,
            '--duration': `${l.duration}s`,
            '--delay': `${l.delay}s`,
            '--drift-mid': `${l.driftMid}px`,
            '--drift-end': `${l.driftEnd}px`,
            fontSize: `${l.size}px`,
          } as React.CSSProperties}
        >
          {l.emoji}
        </div>
      ))}
    </div>
  )
}
