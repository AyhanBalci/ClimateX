'use client'

import React from 'react'
import { MousePointerClick, Eye, Percent, Coins, Target, TrendingUp, Wallet, ShoppingBag } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts'
import { Card, CardHeader } from '@/components/agents/ui/Card'
import { KpiCard } from '@/components/agents/ui/KpiCard'
import { Badge } from '@/components/agents/ui/Badge'
import { CAMPAIGNS, DAILY_TREND, HOUR_OF_DAY } from '@/lib/agents/data/mockGoogleAds'
import { computeTotals, formatCurrency, formatCurrency2, formatNumber, formatPct } from '@/lib/agents/calculations'
import { useSettings } from '@/components/agents/providers/SettingsProvider'

export default function Overview() {
  const { settings } = useSettings()
  const totals = computeTotals(CAMPAIGNS)
  const activeCampaigns = CAMPAIGNS.filter((c) => c.status === 'Actief')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Klikken" value={formatNumber(totals.clicks)} icon={MousePointerClick} sub="Laatste 30 dagen" />
        <KpiCard label="Vertoningen" value={formatNumber(totals.impressions)} icon={Eye} sub="Laatste 30 dagen" />
        <KpiCard label="CTR" value={formatPct(totals.ctr)} icon={Percent} gauge={totals.ctr / 8} sub="Accountgemiddelde" />
        <KpiCard label="Gem. CPC" value={formatCurrency2(totals.avgCpc)} icon={Coins} sub="Per klik" />
        <KpiCard
          label="CPA"
          value={formatCurrency2(totals.cpa)}
          icon={Target}
          gauge={1 - Math.min(1, totals.cpa / settings.maxCpa)}
          delta={{ value: totals.cpa <= settings.maxCpa ? 'Binnen max. CPA' : 'Boven max. CPA', direction: totals.cpa <= settings.maxCpa ? 'flat' : 'up', good: totals.cpa <= settings.maxCpa }}
        />
        <KpiCard label="Conversies" value={formatNumber(totals.conversions)} icon={ShoppingBag} sub="Laatste 30 dagen" />
        <KpiCard label="Conversiewaarde" value={formatCurrency(totals.conversionValue)} icon={Wallet} sub="Laatste 30 dagen" />
        <KpiCard
          label="ROAS"
          value={`${totals.roas.toFixed(1)}x`}
          icon={TrendingUp}
          gauge={totals.roas / (settings.targetRoas * 1.4)}
          delta={{ value: `Doel: ${settings.targetRoas}x`, direction: totals.roas >= settings.targetRoas ? 'up' : 'down', good: totals.roas >= settings.targetRoas }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader title="Kosten & conversies" subtitle="Laatste 30 dagen" />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={DAILY_TREND}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4CC3F0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4CC3F0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1B1E24" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={{ background: '#131519', border: '1px solid #20242B', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="cost" name="Kosten (€)" stroke="#4CC3F0" fill="url(#costGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Budget vs. besteding" subtitle="Vandaag" />
          <div className="space-y-3 mt-1">
            {activeCampaigns.slice(0, 5).map((c) => {
              const used = Math.min(1, (c.cost / 30) / c.dailyBudget)
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 truncate max-w-[140px]">{c.name}</span>
                    <span className="font-mono text-white/40">€{c.dailyBudget}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${used > 0.95 ? 'bg-agentamber-400' : 'bg-agentice-400'}`}
                      style={{ width: `${used * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Campagnes" subtitle={`${activeCampaigns.length} actief van ${CAMPAIGNS.length} totaal`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/35 border-b border-white/5">
                <th className="pb-2 pr-4 font-medium">Campagne</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium text-right">Kosten</th>
                <th className="pb-2 pr-4 font-medium text-right">Conv.</th>
                <th className="pb-2 pr-4 font-medium text-right">CPA</th>
                <th className="pb-2 font-medium text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {CAMPAIGNS.map((c) => {
                const cpa = c.conversions ? c.cost / c.conversions : 0
                const roas = c.cost ? c.conversionValue / c.cost : 0
                return (
                  <tr key={c.id} className="text-white/80">
                    <td className="py-2.5 pr-4 font-medium text-white/90">{c.name}</td>
                    <td className="py-2.5 pr-4">
                      <Badge tone={c.status === 'Actief' ? 'good' : 'neutral'}>{c.status}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular">{formatCurrency(c.cost)}</td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular">{c.conversions}</td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular">{formatCurrency2(cpa)}</td>
                    <td className={`py-2.5 text-right font-mono tabular ${roas >= settings.targetRoas ? 'text-agentgood' : 'text-agentbad'}`}>
                      {roas.toFixed(1)}x
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Conversies per tijdstip" subtitle="Beste momenten om budget te verhogen" />
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={HOUR_OF_DAY}>
            <CartesianGrid stroke="#1B1E24" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: '#131519', border: '1px solid #20242B', borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="conversions" name="Conversies" fill="#4CC3F0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
