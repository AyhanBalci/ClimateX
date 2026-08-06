import { AgentDefinition } from '@/lib/agents/types'

/**
 * Centrale registry van alle AI-agents op het platform.
 * Nieuwe agent toevoegen = 1 object toevoegen aan deze array +
 * de bijbehorende routes registreren onder app/agents/.
 */
export const AGENTS: AgentDefinition[] = [
  {
    id: 'google-ads',
    name: 'Google Ads Agent',
    tagline: 'Senior Google Ads specialist — 15+ jaar ervaring, gericht op winstgevendheid',
    status: 'live',
    icon: 'Target',
    accent: 'ice',
    route: '/agents/google-ads',
  },
  {
    id: 'seo',
    name: 'SEO Agent',
    tagline: 'Organische groei, technische SEO en contentgaten analyseren',
    status: 'coming-soon',
    icon: 'Search',
    accent: 'amber',
    route: '/agents/seo',
  },
  {
    id: 'social-media',
    name: 'Social Media Agent',
    tagline: 'Contentplanning en performance op Meta, LinkedIn en TikTok',
    status: 'coming-soon',
    icon: 'Share2',
    accent: 'ice',
    route: '/agents/social-media',
  },
  {
    id: 'email-marketing',
    name: 'E-mail Marketing Agent',
    tagline: 'Flows, segmentatie en deliverability optimaliseren',
    status: 'coming-soon',
    icon: 'Mail',
    accent: 'amber',
    route: '/agents/email-marketing',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Agent',
    tagline: 'Automatische opvolging van leads via WhatsApp Business',
    status: 'coming-soon',
    icon: 'MessageCircle',
    accent: 'ice',
    route: '/agents/whatsapp',
  },
  {
    id: 'climatex-crm',
    name: 'ClimateX CRM Agent',
    tagline: 'Leads prioriteren, conceptoffertes opstellen en klantcontact voorbereiden',
    status: 'live',
    icon: 'Handshake',
    accent: 'amber',
    route: '/dashboard',
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    tagline: 'Ticketanalyse en geautomatiseerde eerstelijns-antwoorden',
    status: 'coming-soon',
    icon: 'Headset',
    accent: 'ice',
    route: '/agents/customer-support',
  },
  {
    id: 'content',
    name: 'Content Agent',
    tagline: 'Advertentieteksten, landingspaginas en blogcontent genereren',
    status: 'coming-soon',
    icon: 'PenTool',
    accent: 'amber',
    route: '/agents/content',
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    tagline: 'Cross-kanaal attributie en omzetrapportage',
    status: 'coming-soon',
    icon: 'BarChart3',
    accent: 'ice',
    route: '/agents/analytics',
  },
]

export const getAgent = (id: string) => AGENTS.find((a) => a.id === id)
