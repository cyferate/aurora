import { create } from 'zustand'

export type ProviderStatus = 'active' | 'cooldown' | 'error' | 'offline' | 'unknown'
export type ActiveTab = 'visualizer' | 'keys' | 'moa' | 'plugins' | 'focus' | 'omnirush' | 'settings'

export interface Provider {
  name: string
  status: ProviderStatus
  model: string
  requestCount: number
  errorCount: number
  lastUsed: number | null
  avgLatency: number
}

export interface RequestEvent {
  id: string
  timestamp: number
  provider: string
  model: string
  tokensIn: number
  tokensOut: number
  tokensSaved: number
  latencyMs: number
  status: 'success' | 'fallback' | 'error'
}

export interface ApiKey {
  id: number
  provider: string
  keyHint: string
  status: 'active' | 'cooldown' | 'exhausted'
  cooldownUntil: number | null
  usageCount: number
}

interface AuroraState {
  activeTab: ActiveTab
  proxyOnline: boolean
  totalTokensIn: number
  totalTokensOut: number
  totalTokensSaved: number
  totalRequests: number
  providers: Provider[]
  recentRequests: RequestEvent[]
  apiKeys: ApiKey[]
  wsConnected: boolean
  activeProvider: string | null
  routingAnimation: { from: string; to: string; status: 'routing' | 'fallback' | 'success' | 'error' } | null

  setActiveTab: (tab: ActiveTab) => void
  setProxyOnline: (online: boolean) => void
  addRequest: (evt: RequestEvent) => void
  updateProvider: (name: string, update: Partial<Provider>) => void
  setApiKeys: (keys: ApiKey[]) => void
  setWsConnected: (connected: boolean) => void
  setRoutingAnimation: (anim: AuroraState['routingAnimation']) => void
}

const DEFAULT_PROVIDERS: Provider[] = [
  { name: 'openrouter', status: 'unknown', model: 'deepseek/deepseek-r1:free', requestCount: 0, errorCount: 0, lastUsed: null, avgLatency: 0 },
  { name: 'nvidia',     status: 'unknown', model: 'meta/llama-3.1-405b-instruct', requestCount: 0, errorCount: 0, lastUsed: null, avgLatency: 0 },
  { name: 'groq',       status: 'unknown', model: 'llama-3.3-70b-versatile', requestCount: 0, errorCount: 0, lastUsed: null, avgLatency: 0 },
  { name: 'gemini',     status: 'unknown', model: 'gemini-2.0-flash-exp', requestCount: 0, errorCount: 0, lastUsed: null, avgLatency: 0 },
  { name: 'ollama',     status: 'unknown', model: 'llama3.2', requestCount: 0, errorCount: 0, lastUsed: null, avgLatency: 0 },
]

export const useAuroraStore = create<AuroraState>((set) => ({
  activeTab: 'visualizer',
  proxyOnline: false,
  totalTokensIn: 0,
  totalTokensOut: 0,
  totalTokensSaved: 0,
  totalRequests: 0,
  providers: DEFAULT_PROVIDERS,
  recentRequests: [],
  apiKeys: [],
  wsConnected: false,
  activeProvider: null,
  routingAnimation: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setProxyOnline: (online) => set({ proxyOnline: online }),

  addRequest: (evt) => set((state) => ({
    totalRequests: state.totalRequests + 1,
    totalTokensIn: state.totalTokensIn + evt.tokensIn,
    totalTokensOut: state.totalTokensOut + evt.tokensOut,
    totalTokensSaved: state.totalTokensSaved + evt.tokensSaved,
    recentRequests: [evt, ...state.recentRequests].slice(0, 100),
    activeProvider: evt.provider,
  })),

  updateProvider: (name, update) => set((state) => ({
    providers: state.providers.map(p => p.name === name ? { ...p, ...update } : p)
  })),

  setApiKeys: (keys) => set({ apiKeys: keys }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  setRoutingAnimation: (anim) => set({ routingAnimation: anim }),
}))

