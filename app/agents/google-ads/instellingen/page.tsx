'use client'

import React, { useState } from 'react'
import { Card, CardHeader } from '@/components/agents/ui/Card'
import { Button } from '@/components/agents/ui/Button'
import { useSettings } from '@/components/agents/providers/SettingsProvider'
import { Check } from 'lucide-react'

export default function AgentSettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  // Het formulier is een concept-kopie van de opgeslagen instellingen. Zodra de
  // store een andere waarde levert (client-hydratie vanuit localStorage, of een
  // wijziging in een ander tabblad) nemen we die over. Dit is React's patroon
  // voor het bijstellen van state tijdens render.
  const [syncedFrom, setSyncedFrom] = useState(settings)
  if (syncedFrom !== settings) {
    setSyncedFrom(settings)
    setForm(settings)
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const save = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="max-w-3xl space-y-5">
      <Card>
        <CardHeader title="Doelstellingen & marges" subtitle="Deze waarden sturen alle berekeningen, aanbevelingen en AI-antwoorden" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Maximale CPA (€)" value={form.maxCpa} onChange={(v) => set('maxCpa', v)} />
          <Field label="Gewenste ROAS (x)" value={form.targetRoas} onChange={(v) => set('targetRoas', v)} step={0.1} />
          <Field label="Maandbudget (€)" value={form.monthlyBudget} onChange={(v) => set('monthlyBudget', v)} />
          <Field label="Dagbudget (€)" value={form.dailyBudget} onChange={(v) => set('dailyBudget', v)} />
          <Field label="Marge (%)" value={form.marginPct} onChange={(v) => set('marginPct', v)} />
          <Field label="Gemiddelde orderwaarde (€)" value={form.avgOrderValue} onChange={(v) => set('avgOrderValue', v)} />
          <Field label="Sluitingspercentage (%)" value={form.closeRatePct} onChange={(v) => set('closeRatePct', v)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Doelregio" />
        <input
          className="w-full rounded-xl bg-agentbase-700/60 border border-agentbase-border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-agentice-400/50"
          value={form.targetRegion}
          onChange={(e) => set('targetRegion', e.target.value)}
        />
      </Card>

      <Card>
        <CardHeader title="Diensten" subtitle="Gebruikt om campagnestructuur en aanbevelingen te matchen" />
        <div className="flex flex-wrap gap-2">
          {form.services.map((s, i) => (
            <span key={s} className="group flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/70">
              {s}
              <button
                onClick={() => set('services', form.services.filter((_, idx) => idx !== i))}
                className="text-white/30 group-hover:text-white/70"
              >
                ×
              </button>
            </span>
          ))}
          <AddServiceInput onAdd={(s) => set('services', [...form.services, s])} />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save}>Instellingen opslaan</Button>
        <Button variant="secondary" onClick={resetSettings}>Standaardwaarden herstellen</Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-agentgood">
            <Check size={14} /> Opgeslagen
          </span>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="text-xs text-white/45 mb-1.5 block">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-xl bg-agentbase-700/60 border border-agentbase-border px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-agentice-400/50"
      />
    </label>
  )
}

function AddServiceInput({ onAdd }: { onAdd: (s: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && value.trim()) {
          onAdd(value.trim())
          setValue('')
        }
      }}
      placeholder="+ Dienst toevoegen"
      className="rounded-full bg-transparent border border-dashed border-white/15 px-3 py-1 text-xs text-white/50 placeholder:text-white/30 focus:outline-none focus:border-agentice-400/50 w-36"
    />
  )
}
