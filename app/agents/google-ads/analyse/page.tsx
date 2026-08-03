'use client'

import React, { useState } from 'react'
import { Smartphone, Monitor, Tablet } from 'lucide-react'
import { Card, CardHeader } from '@/components/agents/ui/Card'
import { Badge } from '@/components/agents/ui/Badge'
import {
  CAMPAIGNS,
  AD_GROUPS,
  KEYWORDS,
  SEARCH_TERMS,
  RSA_ADS,
  DEVICE_BREAKDOWN,
  COMPETITION,
} from '@/lib/agents/data/mockGoogleAds'
import { formatCurrency, formatCurrency2, formatPct } from '@/lib/agents/calculations'

const SECTIONS = ['Zoekwoorden', 'Advertentiegroepen', 'Advertenties (RSA)', 'Zoektermen', 'Apparaten & tijdstip', 'Concurrentie'] as const

export default function CampaignAnalysis() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]>('Zoekwoorden')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              active === s ? 'bg-agentice-500/10 border-agentice-500/30 text-agentice-300' : 'border-white/10 text-white/45 hover:text-white/75'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {active === 'Zoekwoorden' && <KeywordsTable />}
      {active === 'Advertentiegroepen' && <AdGroupsTable />}
      {active === 'Advertenties (RSA)' && <RsaTable />}
      {active === 'Zoektermen' && <SearchTermsTable />}
      {active === 'Apparaten & tijdstip' && <DeviceSection />}
      {active === 'Concurrentie' && <CompetitionSection />}
    </div>
  )
}

function campaignName(id: string) {
  return CAMPAIGNS.find((c) => c.id === id)?.name ?? id
}

function KeywordsTable() {
  return (
    <Card>
      <CardHeader title="Zoekwoorden" subtitle="Quality Score, biedstrategie-effect en conversieprestatie per zoekwoord" />
      <Table
        head={['Zoekwoord', 'Campagne', 'Type', 'QS', 'Klikken', 'Kosten', 'Conv.', 'Gem. CPC', 'Status']}
        rows={KEYWORDS.map((k) => [
          <span key="keyword" className="text-white/90 font-medium">{k.keyword}</span>,
          <span key="campaign" className="text-white/45 text-xs">{campaignName(k.campaignId)}</span>,
          k.matchType,
          <QsBadge key="qs" score={k.qualityScore} />,
          k.clicks,
          formatCurrency2(k.cost),
          k.conversions,
          formatCurrency2(k.avgCpc),
          <Badge key="status" tone={k.status === 'Actief' ? 'good' : 'bad'}>{k.status}</Badge>,
        ])}
      />
    </Card>
  )
}

function QsBadge({ score }: { score: number }) {
  const tone: 'good' | 'ice' | 'bad' = score >= 7 ? 'good' : score >= 5 ? 'ice' : 'bad'
  return <Badge tone={tone}>{score}/10</Badge>
}

function AdGroupsTable() {
  return (
    <Card>
      <CardHeader title="Advertentiegroepen" subtitle="Budgetverdeling en efficiëntie per advertentiegroep" />
      <Table
        head={['Advertentiegroep', 'Campagne', 'Klikken', 'CTR', 'Kosten', 'Conv.', 'Gem. CPC']}
        rows={AD_GROUPS.map((ag) => [
          <span key="name" className="text-white/90 font-medium">{ag.name}</span>,
          <span key="campaign" className="text-white/45 text-xs">{campaignName(ag.campaignId)}</span>,
          ag.clicks,
          formatPct(ag.ctr),
          formatCurrency2(ag.cost),
          ag.conversions,
          formatCurrency2(ag.avgCpc),
        ])}
      />
    </Card>
  )
}

function RsaTable() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {RSA_ADS.map((ad) => (
        <Card key={ad.id}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40">{campaignName(ad.campaignId)}</span>
            <Badge tone={ad.strength === 'Uitstekend' ? 'good' : ad.strength === 'Slecht' ? 'bad' : 'neutral'}>
              {ad.strength}
            </Badge>
          </div>
          <div className="space-y-1 mb-3">
            {ad.headlines.map((h) => (
              <div key={h} className="text-sm text-white/85">{h}</div>
            ))}
          </div>
          <p className="text-xs text-white/40 mb-3">{ad.descriptions.join(' · ')}</p>
          <div className="flex gap-4 text-xs">
            <span className="text-white/50">CTR: <span className="font-mono text-white/80">{formatPct(ad.ctr)}</span></span>
            <span className="text-white/50">Conversies: <span className="font-mono text-white/80">{ad.conversions}</span></span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function SearchTermsTable() {
  return (
    <Card>
      <CardHeader title="Zoektermen" subtitle="Daadwerkelijke zoekopdrachten die tot een klik leidden" />
      <Table
        head={['Zoekterm', 'Campagne', 'Klikken', 'Kosten', 'Conv.', 'Advies']}
        rows={SEARCH_TERMS.map((s) => [
          <span key="term" className="text-white/90">{s.term}</span>,
          <span key="campaign" className="text-white/45 text-xs">{campaignName(s.campaignId)}</span>,
          s.clicks,
          formatCurrency2(s.cost),
          s.conversions,
          <Badge key="suggestion" tone={s.suggestion === 'toevoegen als zoekwoord' ? 'good' : s.suggestion === 'uitsluiten (negatief)' ? 'bad' : 'neutral'}>
            {s.suggestion}
          </Badge>,
        ])}
      />
    </Card>
  )
}

function DeviceSection() {
  const icons = { Mobiel: Smartphone, Desktop: Monitor, Tablet: Tablet }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {DEVICE_BREAKDOWN.map((d) => {
        const Icon = icons[d.device as keyof typeof icons]
        return (
          <Card key={d.device}>
            <div className="flex items-center gap-2 mb-4">
              <Icon size={16} className="text-white/40" />
              <span className="text-sm font-medium text-white/80">{d.device}</span>
            </div>
            <div className="font-mono text-2xl text-white mb-1">{Math.round(d.share * 100)}%</div>
            <div className="text-xs text-white/40 mb-3">van totaal verkeer</div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-agentice-400" style={{ width: `${d.share * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>Kosten</span>
              <span className="font-mono text-white/80">{formatCurrency(d.cost)}</span>
            </div>
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>Conversies</span>
              <span className="font-mono text-white/80">{d.conversions}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function CompetitionSection() {
  return (
    <Card>
      <CardHeader title="Concurrentie-inzichten" subtitle="Impressiedeel en positionering t.o.v. concurrenten op search" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {COMPETITION.map((c) => (
          <div key={c.metric} className="rounded-xl border border-white/8 p-4">
            <div className="text-xs text-white/40 mb-2">{c.metric}</div>
            <div className="font-mono text-xl text-white">{c.value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-white/35 border-b border-white/5">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="text-white/80">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
