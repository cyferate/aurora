import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'

const MOA_STAGES = [
  {
    id: 'generator',
    label: 'Generator',
    icon: '⚡',
    color: '#00f5ff',
    provider: 'DeepSeek R1 (OpenRouter Free)',
    description: 'Writes the initial draft / code architecture',
    prompt: 'Write a first-pass implementation based on the user request.',
  },
  {
    id: 'critic',
    label: 'Critic',
    icon: '🔍',
    color: '#ff00aa',
    provider: 'Llama 3.3 70B (Groq Free)',
    description: 'Security audit & logical gap analysis',
    prompt: 'You are a senior architect. Find every flaw, gap, and bottleneck in this code.',
  },
  {
    id: 'optimizer',
    label: 'Optimizer',
    icon: '🔧',
    color: '#8844ff',
    provider: 'Gemini 2.0 Flash (Free)',
    description: 'Rewrites fixing all critique points',
    prompt: 'Rewrite the code fixing all mentioned flaws while optimizing for speed and clarity.',
  },
  {
    id: 'synthesizer',
    label: 'Synthesizer',
    icon: '✅',
    color: '#00ff88',
    provider: 'Llama 3.2 (Ollama Local)',
    description: 'Validates output matches original goal',
    prompt: 'Verify this output fully solves the user\'s original request. Report any gaps.',
  },
]

function StageCard({ stage, index }: { stage: typeof MOA_STAGES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard
        accentColor={['cyan','magenta','purple','green'][index] as any}
        style={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Step number */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `${stage.color}22`, border: `1.5px solid ${stage.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: `0 0 12px ${stage.color}40`,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: stage.color }}>
              {index + 1}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px' }}>{stage.icon}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                color: stage.color, textShadow: `0 0 10px ${stage.color}60`,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {stage.label}
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'rgba(136,146,176,0.7)', marginBottom: '6px', lineHeight: 1.5,
            }}>
              {stage.description}
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: `${stage.color}99`,
              background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
              padding: '4px 8px', display: 'inline-block',
            }}>
              {stage.provider}
            </div>
            <div style={{
              marginTop: '8px', padding: '8px',
              background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
              borderLeft: `2px solid ${stage.color}66`,
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                color: 'rgba(136,146,176,0.5)', fontStyle: 'italic', lineHeight: 1.5,
              }}>
                "{stage.prompt}"
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const MoAConsole: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#8844ff', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
          🤖 Mixture of Agents Chain
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(136,146,176,0.5)' }}>
          Multi-model debate: Generator → Critic → Optimizer → Synthesizer. Each free model specializes in one phase.
        </p>
      </div>

      {/* Flow diagram */}
      <GlassCard accentColor="purple" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {MOA_STAGES.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <div style={{
                padding: '8px 14px', borderRadius: '20px',
                background: `${stage.color}15`, border: `1px solid ${stage.color}66`,
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: stage.color,
                fontWeight: 600, letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span>{stage.icon}</span>
                {stage.label}
              </div>
              {i < MOA_STAGES.length - 1 && (
                <span style={{ color: 'rgba(136,146,176,0.3)', fontSize: '18px', fontWeight: 100 }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.3)', marginTop: '10px' }}>
          All models are free-tier. Total cost: $0.00
        </p>
      </GlassCard>

      {/* Stage cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MOA_STAGES.map((stage, i) => (
          <StageCard key={stage.id} stage={stage} index={i} />
        ))}
      </div>

      {/* Enable toggle note */}
      <GlassCard accentColor="yellow" style={{ padding: '14px 16px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f0e040', lineHeight: 1.6 }}>
          ⚡ Enable MoA in <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '3px' }}>.env</code>:
          set <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '3px' }}>MOA_ENABLED=true</code>.
          Note: MoA adds latency (3–4 sequential calls). Best for complex architectural tasks.
        </p>
      </GlassCard>
    </div>
  )
}

