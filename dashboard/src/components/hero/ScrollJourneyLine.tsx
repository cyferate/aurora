import React from 'react'
import { useScrollProgress } from '../../hooks/useScrollProgress'

const PATH_LENGTH = 400 // total SVG path length in px

/**
 * Vertical journey line that draws itself as the user scrolls.
 * Rendered as a narrow SVG strip; use inside a tall section wrapper.
 */
export function ScrollJourneyLine({ height = 400 }: { height?: number }) {
  const progress = useScrollProgress()
  const dashOffset = PATH_LENGTH * (1 - progress)

  return (
    <div className="scroll-journey-section" style={{ height }}>
      <svg
        className="scroll-journey-svg"
        width="2"
        height={height}
        viewBox={`0 0 2 ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="journeyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ff2f3a" />
            <stop offset="50%"  stopColor="#ff6b4a" />
            <stop offset="100%" stopColor="#ffb347" />
          </linearGradient>
        </defs>
        {/* Track (dim) */}
        <line
          x1="1" y1="0" x2="1" y2={height}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Progress line */}
        <line
          className="journey-line"
          x1="1" y1="0" x2="1" y2={height}
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={dashOffset}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Glow dot at progress head */}
        <circle
          cx="1"
          cy={progress * height}
          r="4"
          fill="#ff6b4a"
          opacity={progress > 0.02 ? 1 : 0}
          filter="url(#glowFilter)"
        />
        <defs>
          <filter id="glowFilter" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  )
}
