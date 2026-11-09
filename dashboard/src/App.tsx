import React, { useState } from 'react'
import { HeroPage } from './components/hero/HeroPage'
import { SimpleDashboard } from './components/panels/SimpleDashboard'
import './styles/aurora-hero.css'

type View = 'hero' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('hero')

  return (
    <>
      {view === 'hero' && (
        <HeroPage onDashboard={() => setView('dashboard')} />
      )}
      {view === 'dashboard' && (
        <SimpleDashboard onBack={() => setView('hero')} />
      )}
    </>
  )
}
