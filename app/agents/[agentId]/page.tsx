import React from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { AppShell } from '@/components/agents/layout/AppShell'
import { Card } from '@/components/agents/ui/Card'
import { getAgent } from '@/lib/agents/registry'

export default async function AgentPlaceholderPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const { agentId } = await params
  const agent = getAgent(agentId)
  const Icon = agent ? (Icons as unknown as Record<string, Icons.LucideIcon>)[agent.icon] ?? Icons.Bot : Icons.Bot

  return (
    <AppShell title={agent?.name ?? 'Agent'} subtitle="Deze agent is nog in ontwikkeling">
      <Card className="max-w-xl mx-auto mt-12 text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <Icon size={24} className="text-white/40" />
        </div>
        <h2 className="font-agentdisplay text-lg font-semibold text-white mb-2">{agent?.name ?? 'Agent'}</h2>
        <p className="text-sm text-white/45 mb-6 max-w-sm mx-auto">
          {agent?.tagline ?? 'Deze agent wordt binnenkort toegevoegd aan het platform.'} Deze module volgt
          dezelfde architectuur als de Google Ads Agent en wordt als volgende uitgebouwd.
        </p>
        <Link href="/agents" className="text-sm text-agentice-300 underline underline-offset-4 hover:text-agentice-200">
          Terug naar het AI Agent Center
        </Link>
      </Card>
    </AppShell>
  )
}
