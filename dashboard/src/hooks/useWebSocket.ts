import { useEffect, useRef } from 'react'
import { useAuroraStore, RequestEvent } from '../store'

const WS_URL = 'ws://localhost:8083'
const HEALTH_URL = 'http://localhost:8082/health'

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const { setWsConnected, setProxyOnline, addRequest, updateProvider, setRoutingAnimation } = useAuroraStore()

  // Health check every 5s
  useEffect(() => {
    const check = async () => {
      try {
        const resp = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) })
        setProxyOnline(resp.ok)
      } catch {
        setProxyOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [setProxyOnline])

  // WebSocket for real-time events
  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          setWsConnected(true)
          console.log('[AURORA WS] Connected')
        }

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data)
            handleEvent(data)
          } catch {}
        }

        ws.onclose = () => {
          setWsConnected(false)
          // Reconnect after 3s
          setTimeout(connect, 3000)
        }

        ws.onerror = () => {
          ws.close()
        }
      } catch {}
    }

    const handleEvent = (data: Record<string, unknown>) => {
      const type = data.type as string
      if (type === 'request_complete') {
        const evt = data.payload as RequestEvent
        addRequest(evt)
        updateProvider(evt.provider, {
          status: 'active',
          requestCount: 0, // Will be updated from stats
          lastUsed: Date.now(),
          avgLatency: evt.latencyMs,
        })
        setRoutingAnimation({ from: 'user', to: evt.provider, status: 'success' })
        setTimeout(() => setRoutingAnimation(null), 2000)
      } else if (type === 'provider_fallback') {
        const p = data.from as string
        const to = data.to as string
        updateProvider(p, { status: 'cooldown' })
        setRoutingAnimation({ from: p, to, status: 'fallback' })
      } else if (type === 'provider_error') {
        const p = data.provider as string
        updateProvider(p, { status: 'error' })
      }
    }

    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [setWsConnected, addRequest, updateProvider, setRoutingAnimation])
}

