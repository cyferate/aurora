import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { NeonButton } from '../ui/NeonButton'
import { ExternalLink, Star, GitFork, Package } from 'lucide-react'

// Curated plugin list from awesome-claude-plugins ecosystem
const PLUGINS = [
  {
    id: 'ultrathink',
    name: 'ultrathink',
    author: 'getmidia',
    description: 'Unlocks extended thinking time for Claude Code. Adds /ultrathink slash command for deeper reasoning on complex problems.',
    stars: 1200, forks: 89,
    tags: ['thinking', 'reasoning', 'productivity'],
    color: '#00f5ff',
    url: 'https://github.com/getmidia/ultrathink',
    install: 'claude mcp add ultrathink',
  },
  {
    id: 'claude-code-mcp',
    name: 'claude-code-mcp',
    author: 'wong2',
    description: 'Exposes Claude Code as an MCP server so other tools can query it programmatically. Enables agent chaining.',
    stars: 980, forks: 71,
    tags: ['mcp', 'integration', 'agent'],
    color: '#8844ff',
    url: 'https://github.com/wong2/claude-code-mcp',
    install: 'claude mcp add claude-code-mcp',
  },
  {
    id: 'claude-code-router',
    name: 'claude-code-router',
    author: 'musistudio',
    description: 'Model router for Claude Code. Routes different request types to specialized models for cost optimization.',
    stars: 756, forks: 44,
    tags: ['routing', 'optimization', 'free'],
    color: '#00ff88',
    url: 'https://github.com/musistudio/claude-code-router',
    install: 'npm i -g claude-code-router',
  },
  {
    id: 'ccusage',
    name: 'ccusage',
    author: 'ryoppippi',
    description: 'Tracks and visualizes Claude Code token usage, costs, and session analytics with beautiful charts.',
    stars: 643, forks: 38,
    tags: ['analytics', 'tokens', 'monitoring'],
    color: '#ff00aa',
    url: 'https://github.com/ryoppippi/ccusage',
    install: 'npx ccusage',
  },
  {
    id: 'claude-task-master',
    name: 'claude-task-master',
    author: 'eyaltoledano',
    description: 'AI-driven task management system integrated with Claude Code. Auto-breaks PRDs into executable dev tasks.',
    stars: 2100, forks: 155,
    tags: ['planning', 'tasks', 'prd', 'workflow'],
    color: '#f0e040',
    url: 'https://github.com/eyaltoledano/claude-task-master',
    install: 'npm install -g claude-task-master',
  },
  {
    id: 'opencode',
    name: 'opencode',
    author: 'sst',
    description: 'Open-source AI coding agent. Full TUI interface, multi-model, runs Claude Code workflows in a modern terminal UI.',
    stars: 8900, forks: 390,
    tags: ['tui', 'open-source', 'multi-model'],
    color: '#ff8800',
    url: 'https://github.com/sst/opencode',
    install: 'npm i -g opencode',
  },
]

const TAG_COLORS: Record<string, string> = {
  'thinking': '#00f5ff', 'reasoning': '#00f5ff', 'productivity': '#00ff88',
  'mcp': '#8844ff', 'integration': '#8844ff', 'agent': '#8844ff',
  'routing': '#00ff88', 'optimization': '#00ff88', 'free': '#00ff88',
  'analytics': '#ff00aa', 'tokens': '#ff00aa', 'monitoring': '#ff00aa',
  'planning': '#f0e040', 'tasks': '#f0e040', 'prd': '#f0e040', 'workflow': '#f0e040',
  'tui': '#ff8800', 'open-source': '#ff8800', 'multi-model': '#ff8800',
}

function PluginCard({ plugin }: { plugin: typeof PLUGINS[0] }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(plugin.install)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard
      accentColor="cyan"
      hover
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
              color: plugin.color, textShadow: `0 0 8px ${plugin.color}60`,
            }}>
              {plugin.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(136,146,176,0.4)' }}>
              by {plugin.author}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'rgba(136,146,176,0.7)', lineHeight: 1.5, marginBottom: '8px' }}>
            {plugin.description}
          </p>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {plugin.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                padding: '2px 6px', borderRadius: '3px',
                background: `${TAG_COLORS[tag] || '#4a5568'}20`,
                border: `1px solid ${TAG_COLORS[tag] || '#4a5568'}40`,
                color: TAG_COLORS[tag] || '#8892b0',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#f0e040' }}>
              <Star size={10} /> {plugin.stars.toLocaleString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#8892b0' }}>
              <GitFork size={10} /> {plugin.forks}
            </span>
          </div>
          <a href={plugin.url} target="_blank" rel="noreferrer">
            <NeonButton color="cyan" size="sm" variant="ghost" icon={<ExternalLink size={11} />}>
              View
            </NeonButton>
          </a>
        </div>
      </div>

      {/* Install command */}
      <div
        onClick={handleCopy}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,0,0,0.5)', borderRadius: '6px',
          padding: '8px 10px', cursor: 'pointer',
          border: '1px solid rgba(0,245,255,0.1)',
          transition: 'border-color 0.2s ease',
        }}
        title="Click to copy"
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00f5ff', flex: 1 }}>
          $ {plugin.install}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: copied ? '#00ff88' : 'rgba(136,146,176,0.3)' }}>
          {copied ? 'COPIED!' : 'COPY'}
        </span>
      </div>
    </GlassCard>
  )
}

export const PluginBrowser: React.FC = () => {
  const [filter, setFilter] = useState('')

  const filtered = PLUGINS.filter(p =>
    !filter ||
    p.name.includes(filter.toLowerCase()) ||
    p.description.toLowerCase().includes(filter.toLowerCase()) ||
    p.tags.some(t => t.includes(filter.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#00ff88', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
          🧩 Plugin Browser
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(136,146,176,0.5)' }}>
          Curated from awesome-claude-plugins • quemsah/awesome-claude-plugins
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search plugins by name, tag, or feature…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: '8px', color: '#e8eaf6',
          fontFamily: 'var(--font-mono)', fontSize: '12px',
          padding: '10px 14px', outline: 'none', width: '100%',
        }}
      />

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <PluginCard plugin={p} />
          </motion.div>
        ))}
      </div>

      <GlassCard accentColor="green" style={{ padding: '12px 16px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(0,255,136,0.6)', textAlign: 'center' }}>
          Browse the full ecosystem at{' '}
          <a href="https://github.com/quemsah/awesome-claude-plugins" target="_blank" rel="noreferrer"
            style={{ color: '#00ff88', textDecoration: 'none' }}>
            github.com/quemsah/awesome-claude-plugins ↗
          </a>
        </p>
      </GlassCard>
    </div>
  )
}

