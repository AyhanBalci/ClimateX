import React from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { AppShell } from '@/components/agents/layout/AppShell'
import { Card } from '@/components/agents/ui/Card'
import { Badge } from '@/components/agents/ui/Badge'
import { AGENTS } from '@/lib/agents/registry'

export default function AgentsHubPage() {
  const live = AGENTS.filter((a) => a.status === 'live')
  const upcoming = AGENTS.filter((a) => a.status === 'coming-soon')

  return (
    <AppShell title="AI Agent Center" subtitle="Alle AI-specialisten voor ClimateX op één plek">
      <Section title="Actief" count={live.length}>
        {live.map((agent) => (
          <AgentCard key={agent.id} id={agent.id} name={agent.name} tagline={agent.tagline} status={agent.status} icon={agent.icon} accent={agent.accent} route={agent.route} />
        ))}
      </Section>

      <Section title="Binnenkort beschikbaar" count={upcoming.length}>
        {upcoming.map((agent) => (
          <AgentCard key={agent.id} id={agent.id} name={agent.name} tagline={agent.tagline} status={agent.status} icon={agent.icon} accent={agent.accent} route={agent.route} />
        ))}
      </Section>
    </AppShell>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-agentdisplay text-sm font-medium text-white/70">{title}</h2>
        <span className="text-xs text-white/30">{count}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>
    </div>
  )
}

function AgentCard({
  id,
  name,
  tagline,
  status,
  icon,
  accent,
  route,
}: {
  id: string
  name: string
  tagline: string
  status: 'live' | 'coming-soon'
  icon: string
  accent: 'ice' | 'amber'
  route: string
}) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.Bot
  const isLive = status === 'live'
  const accentClasses = accent === 'ice' ? 'from-agentice-400 to-agentice-600' : 'from-agentamber-400 to-agentamber-600'

  const content = (
    <Card hover className={isLive ? 'h-full' : 'h-full opacity-70'}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentClasses} flex items-center justify-center`}>
          <Icon size={18} className="text-agentbase-950" />
        </div>
        <Badge tone={isLive ? 'good' : 'neutral'}>{isLive ? 'Actief' : 'Binnenkort'}</Badge>
      </div>
      <h3 className="font-agentdisplay text-sm font-semibold text-white mb-1">{name}</h3>
      <p className="text-xs text-white/45 leading-relaxed">{tagline}</p>
    </Card>
  )

  if (!isLive) return <div key={id}>{content}</div>
  return (
    <Link href={route} key={id} className="block">
      {content}
    </Link>
  )
}
