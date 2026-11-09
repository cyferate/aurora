import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  Node, Edge, useNodesState, useEdgesState, addEdge,
  Background, Controls, MiniMap,
  MarkerType, Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuroraStore } from '../../store'
import { GlassCard } from '../ui/GlassCard'

// ── Custom Provider Node ──────────────────────────────────────────────────────
const PROVIDER_COLORS: Record<string, string> = {
  user:        '#00f5ff',
  proxy:       '#8844ff',
  openrouter:  '#00ff88',
  nvidia:      '#00b8ff',
  groq:        '#ff8800',
  gemini:      '#ff00aa',
  ollama:      '#f0e040',
}

const PROVIDER_ICONS: Record<string, string> = {
  user:       '🖥️',
  proxy:      '⚡',
  openrouter: '🔀',
  nvidia:     '🖥',
  groq:       '⚡',
  gemini:     '♊',
  ollama:     '🦙',
}

function ProviderNode({ data }: { data: any }) {
  const color = PROVIDER_COLORS[data.id] || '#00f5ff'
  const isActive = data.status === 'active'
  const isError  = data.status === 'error'
  const isCool   = data.status === 'cooldown'

  const borderColor = isError ? '#ff2244' : isCool ? '#f0e040' : color

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '12px',
      background: 'rgba(13,13,26,0.9)',
      border: `1.5px solid ${borderColor}`,
      boxShadow: isActive
        ? `0 0 20px ${color}60, 0 0 40px ${color}20`
        : `0 0 8px ${borderColor}30`,
      minWidth: '130px',
      backdropFilter: 'blur(12px)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '16px' }}>{PROVIDER_ICONS[data.id] || '🔌'}</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          color: borderColor,
          textShadow: `0 0 8px ${borderColor}`,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {data.label}
        </span>
      </div>
      {data.model && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'rgba(136,146,176,0.6)',
          letterSpacing: '0.05em',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '110px',
        }}>
          {data.model}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: isError ? '#ff2244' : isCool ? '#f0e040' : isActive ? '#00ff88' : '#4a5568',
          boxShadow: isActive ? '0 0 6px #00ff88' : 'none',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(136,146,176,0.5)', textTransform: 'uppercase' }}>
          {data.status || 'unknown'}
        </span>
        {data.requestCount > 0 && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', color: color }}>
            {data.requestCount} req
          </span>
        )}
      </div>
    </div>
  )
}

const nodeTypes = { providerNode: ProviderNode }

// ── Build nodes & edges from store state ──────────────────────────────────────
function buildGraph(providers: any[], routingAnim: any): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'user',
      type: 'providerNode',
      position: { x: 60, y: 220 },
      data: { id: 'user', label: 'Claude Code', status: 'active', model: 'ANTHROPIC_BASE_URL' },
      sourcePosition: Position.Right,
    },
    {
      id: 'proxy',
      type: 'providerNode',
      position: { x: 310, y: 220 },
      data: { id: 'proxy', label: 'AURORA Proxy', status: 'active', model: 'localhost:20128' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
  ]

  const providerPositions: Record<string, [number, number]> = {
    openrouter: [600, 60],
    nvidia:     [600, 160],
    groq:       [600, 260],
    gemini:     [600, 360],
    ollama:     [600, 460],
  }

  providers.forEach((p) => {
    const pos = providerPositions[p.name] || [600, 300]
    nodes.push({
      id: p.name,
      type: 'providerNode',
      position: { x: pos[0], y: pos[1] },
      data: {
        id: p.name,
        label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        status: p.status,
        model: p.model,
        requestCount: p.requestCount,
      },
      targetPosition: Position.Left,
    })
  })

  const isAnimating = !!routingAnim
  const animTo = routingAnim?.to
  const isFallback = routingAnim?.status === 'fallback'

  const edges: Edge[] = [
    // User → Proxy
    {
      id: 'user-proxy',
      source: 'user',
      target: 'proxy',
      style: { stroke: '#8844ff', strokeWidth: 2 },
      animated: isAnimating,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8844ff' },
    },
    // Proxy → each provider
    ...providers.map((p) => ({
      id: `proxy-${p.name}`,
      source: 'proxy',
      target: p.name,
      animated: isAnimating && animTo === p.name,
      style: {
        stroke: animTo === p.name
          ? (isFallback ? '#f0e040' : '#00ff88')
          : PROVIDER_COLORS[p.name] || '#4a5568',
        strokeWidth: animTo === p.name ? 3 : 1.5,
        opacity: !isAnimating || animTo === p.name ? 1 : 0.3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: animTo === p.name ? (isFallback ? '#f0e040' : '#00ff88') : PROVIDER_COLORS[p.name] || '#4a5568',
      },
    })),
  ]

  return { nodes, edges }
}

// ── Main Visualizer component ─────────────────────────────────────────────────
export const ProviderFlow: React.FC = () => {
  const { providers, routingAnimation, recentRequests } = useAuroraStore()
  const { nodes: initNodes, edges: initEdges } = buildGraph(providers, null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  // Sync node/edge state from store
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildGraph(providers, routingAnimation)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [providers, routingAnimation, setNodes, setEdges])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Flow canvas */}
      <GlassCard
        accentColor="cyan"
        style={{ flex: 1, minHeight: '420px', padding: '0', overflow: 'hidden', position: 'relative' }}
      >
        <div style={{
          position: 'absolute', top: '12px', left: '16px', zIndex: 10,
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'rgba(0,245,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase'
        }}>
          ⚡ Live Route Map
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          attributionPosition="bottom-right"
          style={{ background: 'transparent' }}
        >
          <Background color="rgba(0,245,255,0.04)" gap={30} size={1} />
          <Controls style={{ background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px' }} />
          <MiniMap
            style={{ background: 'rgba(6,6,16,0.9)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: '8px' }}
            nodeColor={(n) => PROVIDER_COLORS[n.id] || '#4a5568'}
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>
      </GlassCard>

      {/* Recent requests log */}
      <GlassCard accentColor="purple" style={{ padding: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#8844ff', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Request Log
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
          <AnimatePresence mode="popLayout">
            {recentRequests.length === 0 ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(136,146,176,0.3)', textAlign: 'center', padding: '20px' }}>
                Waiting for Claude Code requests...
              </div>
            ) : recentRequests.slice(0, 15).map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '4px 8px', borderRadius: '4px',
                  background: 'rgba(0,0,0,0.2)',
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                }}
              >
                <span style={{ color: req.status === 'success' ? '#00ff88' : req.status === 'fallback' ? '#f0e040' : '#ff2244', width: '8px', fontSize: '12px' }}>
                  {req.status === 'success' ? '✓' : req.status === 'fallback' ? '⚡' : '✗'}
                </span>
                <span style={{ color: PROVIDER_COLORS[req.provider] || '#8892b0', fontWeight: 600, minWidth: '80px' }}>
                  {req.provider}
                </span>
                <span style={{ color: 'rgba(136,146,176,0.6)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.model}
                </span>
                <span style={{ color: '#00f5ff' }}>{req.tokensOut || 0}t</span>
                <span style={{ color: '#00ff88' }}>−{req.tokensSaved || 0}</span>
                <span style={{ color: 'rgba(136,146,176,0.4)' }}>{req.latencyMs || 0}ms</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  )
}

