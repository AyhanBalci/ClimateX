'use client'

import React, { useCallback, useSyncExternalStore } from 'react'
import { AgentSettings } from '@/lib/agents/types'

const STORAGE_KEY = 'climatex-agent-settings-v1'

const DEFAULT_SETTINGS: AgentSettings = {
  maxCpa: 45,
  targetRoas: 5,
  monthlyBudget: 9000,
  dailyBudget: 300,
  marginPct: 32,
  avgOrderValue: 1600,
  closeRatePct: 24,
  targetRegion: 'Nederland (Randstad prioriteit)',
  services: ['Laadpaal thuis', 'Zakelijke laadpalen', 'VvE laadoplossingen', 'Solar laden', 'Onderhoud & storing'],
}

/**
 * De instellingen leven in een kleine external store in plaats van in component-state.
 * Zo blijven ze bewaard tussen paginanavigaties, overleven ze een refresh via
 * localStorage en blijven meerdere tabbladen in sync — zonder setState-in-effect.
 * De server rendert altijd DEFAULT_SETTINGS, waarna de client hydrateert.
 */
let currentSettings: AgentSettings = DEFAULT_SETTINGS
let initialised = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function readStorage(): AgentSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AgentSettings>
    // Over de defaults heen mergen zodat later toegevoegde velden altijd gevuld zijn.
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function writeStorage(value: AgentSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // localStorage vol of geblokkeerd: instellingen gelden dan alleen deze sessie.
  }
}

function subscribe(listener: () => void) {
  // React leest de snapshot opnieuw na subscribe, dus hier laden is hydration-veilig.
  if (!initialised) {
    initialised = true
    currentSettings = readStorage()
  }

  listeners.add(listener)

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    currentSettings = readStorage()
    emit()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = () => currentSettings
const getServerSnapshot = () => DEFAULT_SETTINGS

function setSettings(next: AgentSettings) {
  currentSettings = next
  writeStorage(next)
  emit()
}

/**
 * Behouden als expliciete boundary rond het agent-gedeelte: de store zelf is
 * globaal, maar dit maakt in de layout zichtbaar waar de instellingen gelden.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const updateSettings = useCallback((patch: Partial<AgentSettings>) => {
    setSettings({ ...currentSettings, ...patch })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return { settings, updateSettings, resetSettings }
}
