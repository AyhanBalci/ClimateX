import React from 'react'
import clsx from 'clsx'
import { Priority } from '@/lib/agents/types'

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'ice' | 'amber' | 'good' | 'bad' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-white/5 text-white/60 border-white/10',
    ice: 'bg-agentice-500/10 text-agentice-300 border-agentice-500/25',
    amber: 'bg-agentamber-500/10 text-agentamber-300 border-agentamber-500/25',
    good: 'bg-agentgood/10 text-agentgood border-agentgood/25',
    bad: 'bg-agentbad/10 text-agentbad border-agentbad/25',
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', tones[tone])}>
      {children}
    </span>
  )
}

const PRIORITY_STYLES: Record<Priority, string> = {
  Kritiek: 'bg-agentcrit/15 text-agentcrit border-agentcrit/40',
  Hoog: 'bg-agentamber-500/15 text-agentamber-300 border-agentamber-500/40',
  Gemiddeld: 'bg-agentice-500/15 text-agentice-300 border-agentice-500/40',
  Laag: 'bg-white/8 text-white/50 border-white/15',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={clsx('inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', PRIORITY_STYLES[priority])}>
      {priority}
    </span>
  )
}
