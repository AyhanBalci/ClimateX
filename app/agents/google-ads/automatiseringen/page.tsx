'use client'

import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { Card } from '@/components/agents/ui/Card'
import { AUTOMATIONS as INITIAL } from '@/lib/agents/data/mockAutomations'

export default function Automations() {
  const [automations, setAutomations] = useState(INITIAL)

  const toggle = (id: string) =>
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))

  return (
    <div className="space-y-3">
      {automations.map((a) => (
        <Card key={a.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">{a.name}</h3>
              <p className="text-xs text-white/50 leading-relaxed max-w-xl mb-2">{a.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-white/35">
                <span className="flex items-center gap-1"><Clock size={11} /> {a.frequency}</span>
                <span>Laatst uitgevoerd: {a.lastRun}</span>
              </div>
            </div>
            <button
              onClick={() => toggle(a.id)}
              className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${a.enabled ? 'bg-agentice-500' : 'bg-white/10'}`}
              aria-label={`${a.name} ${a.enabled ? 'uitschakelen' : 'inschakelen'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${a.enabled ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}
