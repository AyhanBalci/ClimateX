// ── Agent platform ──────────────────────────────────────────────
export type AgentStatus = 'live' | 'coming-soon'

export interface AgentDefinition {
  id: string
  name: string
  tagline: string
  status: AgentStatus
  icon: string // lucide-react icon name, resolved in AgentsHub
  accent: 'ice' | 'amber'
  route: string
}

// ── Google Ads domain ───────────────────────────────────────────
export interface GoogleAdsAccount {
  id: string
  name: string
  customerId: string
  currency: 'EUR'
}

export type CampaignStatus = 'Actief' | 'Gepauzeerd' | 'Concept'
export type BidStrategy =
  | 'Maximaliseer conversies'
  | 'Doel-ROAS'
  | 'Doel-CPA'
  | 'Handmatige CPC'
  | 'Maximaliseer klikken'

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  dailyBudget: number
  bidStrategy: BidStrategy
  targetRoas?: number
  clicks: number
  impressions: number
  cost: number
  conversions: number
  conversionValue: number
  service: string
  location: string
}

export interface AdGroup {
  id: string
  campaignId: string
  name: string
  clicks: number
  impressions: number
  cost: number
  conversions: number
  ctr: number
  avgCpc: number
}

export interface KeywordRow {
  id: string
  campaignId: string
  adGroupId: string
  keyword: string
  matchType: 'Exact' | 'Woordgroep' | 'Ruime targeting'
  clicks: number
  impressions: number
  cost: number
  conversions: number
  qualityScore: number
  avgCpc: number
  status: 'Actief' | 'Aanbevolen: pauzeren'
}

export interface SearchTermRow {
  id: string
  campaignId: string
  term: string
  clicks: number
  cost: number
  conversions: number
  suggestion: 'toevoegen als zoekwoord' | 'uitsluiten (negatief)' | 'geen actie'
}

export interface ResponsiveSearchAd {
  id: string
  campaignId: string
  adGroupId: string
  headlines: string[]
  descriptions: string[]
  ctr: number
  conversions: number
  strength: 'Uitstekend' | 'Goed' | 'Gemiddeld' | 'Slecht'
}

export type Priority = 'Kritiek' | 'Hoog' | 'Gemiddeld' | 'Laag'

export interface Recommendation {
  id: string
  priority: Priority
  category: string
  title: string
  problem: string
  why: string
  impact: string
  action: string
  campaignId?: string
}

export interface Automation {
  id: string
  name: string
  description: string
  frequency: string
  enabled: boolean
  lastRun: string
}

export interface AgentSettings {
  maxCpa: number
  targetRoas: number
  monthlyBudget: number
  dailyBudget: number
  marginPct: number
  avgOrderValue: number
  closeRatePct: number
  targetRegion: string
  services: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
