'use client'

import React, { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { Card } from '@/components/agents/ui/Card'
import { PriorityBadge } from '@/components/agents/ui/Badge'
import { Button } from '@/components/agents/ui/Button'
import { CAMPAIGNS, KEYWORDS, SEARCH_TERMS, RSA_ADS } from '@/lib/agents/data/mockGoogleAds'
import { generateRecommendations } from '@/lib/agents/optimizationEngine'
import { useSettings } from '@/components/agents/providers/SettingsProvider'
import { Priority, Recommendation } from '@/lib/agents/types'
import { createMockClient } from '@/lib/agents/googleAdsApi'

const PRIORITIES: Priority[] = ['Kritiek', 'Hoog', 'Gemiddeld', 'Laag']

export default function Optimizations() {
  const { settings } = useSettings()
  const allRecs = useMemo(
    () => generateRecommendations(CAMPAIGNS, KEYWORDS, SEARCH_TERMS, RSA_ADS, settings),
    [settings],
  )
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<Priority | 'Alle'>('Alle')
  const [pending, setPending] = useState<Recommendation | null>(null)

  const visible = allRecs.filter((r) => filter === 'Alle' || r.priority === filter)

  const client = useMemo(() => createMockClient(), [])

  async function confirmApply() {
    if (!pending) return
    await client.applyChange('acc-1', { type: 'budget', campaignId: pending.campaignId ?? '', payload: { recommendationId: pending.id } })
    setApplied((prev) => new Set(prev).add(pending.id))
    setPending(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {(['Alle', ...PRIORITIES] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === p ? 'bg-agentice-500/10 border-agentice-500/30 text-agentice-300' : 'border-white/10 text-white/45 hover:text-white/75'
              }`}
            >
              {p} {p !== 'Alle' && `(${allRecs.filter((r) => r.priority === p).length})`}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/35 flex items-center gap-1.5">
          <AlertTriangle size={13} /> De AI voert nooit automatisch wijzigingen door
        </span>
      </div>

      <div className="space-y-3">
        {visible.map((rec) => (
          <Card key={rec.id} className={applied.has(rec.id) ? 'opacity-50' : ''}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <PriorityBadge priority={rec.priority} />
                  <span className="text-[11px] uppercase tracking-wide text-white/30">{rec.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{rec.title}</h3>

                <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <dt className="text-white/35 mb-1">Probleem</dt>
                    <dd className="text-white/70 leading-relaxed">{rec.problem}</dd>
                  </div>
                  <div>
                    <dt className="text-white/35 mb-1">Waarom dit belangrijk is</dt>
                    <dd className="text-white/70 leading-relaxed">{rec.why}</dd>
                  </div>
                  <div>
                    <dt className="text-white/35 mb-1">Verwachte impact</dt>
                    <dd className="text-white/70 leading-relaxed">{rec.impact}</dd>
                  </div>
                </dl>

                <div className="mt-3 text-xs text-agentice-300 bg-agentice-500/5 border border-agentice-500/15 rounded-lg px-3 py-2 inline-block">
                  Actie: {rec.action}
                </div>
              </div>

              <div className="shrink-0">
                {applied.has(rec.id) ? (
                  <span className="flex items-center gap-1.5 text-xs text-agentgood font-medium">
                    <CheckCircle2 size={14} /> Toegepast
                  </span>
                ) : (
                  <Button size="sm" onClick={() => setPending(rec)}>
                    Toepassen
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {visible.length === 0 && (
          <Card className="text-center py-10 text-sm text-white/40">Geen aanbevelingen in deze prioriteit.</Card>
        )}
      </div>

      {pending && (
        <ConfirmModal rec={pending} onCancel={() => setPending(null)} onConfirm={confirmApply} />
      )}
    </div>
  )
}

function ConfirmModal({ rec, onCancel, onConfirm }: { rec: Recommendation; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-agentbase-border bg-agentbase-850 p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-agentdisplay text-sm font-semibold text-white">Wijziging goedkeuren</h3>
          <button onClick={onCancel} className="text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-white/70 mb-2">{rec.title}</p>
        <p className="text-xs text-white/45 mb-5">{rec.action}</p>
        <p className="text-[11px] text-white/30 mb-5">
          Deze wijziging wordt pas naar Google Ads verzonden nadat je hier expliciet bevestigt.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Annuleren</Button>
          <Button size="sm" onClick={onConfirm}>Bevestigen & toepassen</Button>
        </div>
      </div>
    </div>
  )
}
