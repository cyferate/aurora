import React, { useEffect, useRef } from 'react'

export const CRTOverlay: React.FC = () => {
  return (
    <>
      {/* CRT Scanline overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* Moving scanline */}
      <div className="crt-scanline" />
    </>
  )
}

