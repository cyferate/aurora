import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { CRTOverlay } from './components/ui/CRTOverlay'
import { ProviderFlow } from './components/visualizer/ProviderFlow'
import { TokenOdometer } from './components/panels/TokenOdometer'
import { KeyManager } from './components/panels/KeyManager'
import { MoAConsole } from './components/panels/MoAConsole'
import { PluginBrowser } from './components/panels/PluginBrowser'
import { FocusMode } from './components/panels/FocusMode'
import { OmniRushPanel } from './components/panels/OmniRushPanel'
import { Settings } from './components/panels/Settings'
import { useAuroraStore } from './store'
import { useWebSocket } from './hooks/useWebSocket'
import { useProviderStatus } from './hooks/useProviderStatus'

const TAB_CONTENT: Record<string, React.ReactNode> = {}

function MainContent() {
  const { activeTab } = useAuroraStore()

  const content: Record<string, React.ReactNode> = {
    visualizer: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
        <TokenOdometer />
        <div style={{ flex: 1, minHeight: 0 }}>
          <ProviderFlow />
        </div>
      </div>
    ),
    keys:     <KeyManager />,
    moa:      <MoAConsole />,
    plugins:  <PluginBrowser />,
    focus:    <FocusMode />,
    omnirush: <OmniRushPanel />,
    settings: <Settings />,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ height: '100%' }}
      >
        {content[activeTab] || content.visualizer}
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  // Initialize WebSocket and provider status hooks
  useWebSocket()
  useProviderStatus()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* CRT overlay effect */}
      <CRTOverlay />

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
        }}>
          {/* Top bar */}
          <div style={{
            padding: '16px 24px 0',
            borderBottom: '1px solid rgba(0,245,255,0.06)',
            background: 'rgba(6,6,16,0.6)',
            backdropFilter: 'blur(8px)',
          }}>
            {/* Breadcrumb */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'rgba(136,146,176,0.4)',
              letterSpacing: '0.1em',
              paddingBottom: '14px',
            }}>
              AURORA / {TAB_LABEL_MAP[useAuroraStore.getState().activeTab]}
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
          }}>
            <MainContent />
          </div>
        </main>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}

const TAB_LABEL_MAP: Record<string, string> = {
  visualizer: 'Live Visualizer',
  keys:       'API Key Manager',
  moa:        'Mixture of Agents',
  plugins:    'Plugin Browser',
  focus:      'Focus Mode',
  omnirush:   'OmniRush',
  settings:   'Settings',
}

// Fix: TopBar needs reactive store
function TopBreadcrumb() {
  const { activeTab } = useAuroraStore()
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '11px',
      color: 'rgba(136,146,176,0.4)', letterSpacing: '0.1em', paddingBottom: '14px',
    }}>
      AURORA / {TAB_LABEL_MAP[activeTab]}
    </div>
  )
}

function AppFixed() {
  useWebSocket()
  useProviderStatus()
  const { activeTab } = useAuroraStore()

  const content: Record<string, React.ReactNode> = {
    visualizer: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TokenOdometer />
        <ProviderFlow />
      </div>
    ),
    keys:     <KeyManager />,
    moa:      <MoAConsole />,
    plugins:  <PluginBrowser />,
    focus:    <FocusMode />,
    omnirush: <OmniRushPanel />,
    settings: <Settings />,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CRTOverlay />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <div style={{
            padding: '14px 24px',
            borderBottom: '1px solid rgba(0,245,255,0.06)',
            background: 'rgba(6,6,16,0.8)',
            backdropFilter: 'blur(8px)',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'rgba(136,146,176,0.4)', letterSpacing: '0.1em',
            }}>
              AURORA / {TAB_LABEL_MAP[activeTab]}
            </span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {content[activeTab] || content.visualizer}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  )
}

export default AppFixed

