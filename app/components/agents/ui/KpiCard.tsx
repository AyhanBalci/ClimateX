import React from 'react'
import clsx from 'clsx'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: { value: string; direction: 'up' | 'down' | 'flat'; good: boolean }
  gauge?: number // 0-1, renders as a thermostat-style tick bar
  sub?: string
}

export function KpiCard({ label, value, icon: Icon, delta, gauge, sub }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-agentbase-border bg-agentbase-800/60 p-4 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">{label}</span>
        <Icon size={15} className="text-white/25 group-hover:text-agentice-400 transition-colors" />
      </div>
      <div className="font-mono text-2xl font-medium tabular text-white">{value}</div>
      {sub && <div className="text-[11px] text-white/35 mt-1">{sub}</div>}
      {delta && (
        <div
          className={clsx(
            'mt-2 inline-flex items-center gap-1 text-[11px] font-medium',
            delta.good ? 'text-agentgood' : 'text-agentbad',
          )}
        >
          {delta.direction === 'up' && <TrendingUp size={12} />}
          {delta.direction === 'down' && <TrendingDown size={12} />}
          {delta.direction === 'flat' && <Minus size={12} />}
          {delta.value}
        </div>
      )}
      {gauge !== undefined && (
        <div className="mt-3 h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-agentamber-500 via-agentamber-400 to-agentice-400"
            style={{ width: `${Math.min(100, Math.max(4, gauge * 100))}%` }}
          />
        </div>
      )}
    </div>
  )
}
