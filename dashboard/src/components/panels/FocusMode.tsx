import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { NeonButton } from '../ui/NeonButton'
import { Terminal, Code2, Split } from 'lucide-react'

export const FocusMode: React.FC = () => {
  const [code, setCode] = useState(`// AURORA Focus Mode
// Your generated code appears here in real-time
// as Claude Code writes it through the proxy.

function example() {
  console.log("Aurora is routing your requests for free!");
}`)
  const [terminal, setTerminal] = useState([
    '⚡ AURORA Proxy Online — port 20128',
    '→ Routing: openrouter/deepseek-r1:free',
    '✓ Request proxied in 1.2s (847 tokens, saved 120)',
    '→ Routing: groq/llama-3.3-70b-versatile (fallback)',
    '✓ Request proxied in 0.8s (512 tokens, saved 68)',
  ])

  const editorStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '340px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#00f5ff',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    lineHeight: 1.7,
    resize: 'none',
    padding: '16px',
    caretColor: '#00f5ff',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#f0e040', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
            🎯 Focus Mode
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(136,146,176,0.5)' }}>
            Live code preview + terminal logs side by side
          </p>
        </div>
        <NeonButton color="yellow" size="sm" icon={<Split size={12} />}>
          Split View
        </NeonButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
        {/* Code editor */}
        <GlassCard accentColor="cyan" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
            borderBottom: '1px solid rgba(0,245,255,0.1)',
            fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,245,255,0.6)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <Code2 size={12} color="#00f5ff" />
            Generated Code
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={editorStyle}
            spellCheck={false}
          />
        </GlassCard>

        {/* Terminal log */}
        <GlassCard accentColor="green" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
            borderBottom: '1px solid rgba(0,255,136,0.1)',
            fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,255,136,0.6)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <Terminal size={12} color="#00ff88" />
            Proxy Log
          </div>
          <div style={{ padding: '12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {terminal.map((line, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6,
                color: line.startsWith('✓') ? '#00ff88'
                     : line.startsWith('→') ? '#00f5ff'
                     : line.startsWith('⚡') ? '#f0e040'
                     : 'rgba(136,146,176,0.6)',
              }}>
                {line}
              </div>
            ))}
            <div className="typewriter-cursor" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(0,245,255,0.3)' }} />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

