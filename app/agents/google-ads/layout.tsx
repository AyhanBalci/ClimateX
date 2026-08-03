import React from 'react'
import { AppShell } from '@/components/agents/layout/AppShell'
import { AgentTabs } from '@/components/agents/layout/AgentTabs'

const TABS = [
  { to: '/agents/google-ads', label: 'Overzicht', end: true },
  { to: '/agents/google-ads/analyse', label: 'Campagne-analyse' },
  { to: '/agents/google-ads/optimalisaties', label: 'Optimalisaties' },
  { to: '/agents/google-ads/automatiseringen', label: 'Automatiseringen' },
  { to: '/agents/google-ads/chat', label: 'AI-chat' },
  { to: '/agents/google-ads/instellingen', label: 'Instellingen' },
]

export default function GoogleAdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Google Ads Agent" subtitle="Senior specialist — 15+ jaar ervaring, gericht op winstgevendheid">
      <AgentTabs tabs={TABS} />
      {children}
    </AppShell>
  )
}
