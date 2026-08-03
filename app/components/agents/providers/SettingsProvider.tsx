'use client'

import React, { createContext, useContext, useState } from 'react'
import { AgentSettings } from '@/lib/agents/types'

const DEFAULT_SETTINGS: AgentSettings = {
  maxCpa: 45,
  targetRoas: 5,
  monthlyBudget: 9000,
  dailyBudget: 300,
  marginPct: 32,
  avgOrderValue: 3200,
  closeRatePct: 24,
  targetRegion: 'Nederland (Randstad prioriteit)',
  services: ['Airco installatie', 'Onderhoudscontract', 'Zakelijke airco', 'Warmtepomp', 'Reparatie'],
}

interface SettingsContextValue {
  settings: AgentSettings
  updateSettings: (patch: Partial<AgentSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS)

  const updateSettings = (patch: Partial<AgentSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }))

  const resetSettings = () => setSettings(DEFAULT_SETTINGS)

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
