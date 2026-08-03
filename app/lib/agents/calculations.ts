import { Campaign, AgentSettings } from '@/lib/agents/types'

export interface AccountTotals {
  clicks: number
  impressions: number
  cost: number
  conversions: number
  conversionValue: number
  ctr: number
  avgCpc: number
  cpa: number
  roas: number
}

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

/** Aggregeert alle actieve campagnes tot account-brede KPI's. */
export function computeTotals(campaigns: Campaign[]): AccountTotals {
  const active = campaigns.filter((c) => c.status === 'Actief')
  const clicks = sum(active.map((c) => c.clicks))
  const impressions = sum(active.map((c) => c.impressions))
  const cost = sum(active.map((c) => c.cost))
  const conversions = sum(active.map((c) => c.conversions))
  const conversionValue = sum(active.map((c) => c.conversionValue))
  return {
    clicks,
    impressions,
    cost,
    conversions,
    conversionValue,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    avgCpc: clicks ? cost / clicks : 0,
    cpa: conversions ? cost / conversions : 0,
    roas: cost ? conversionValue / cost : 0,
  }
}

export interface CampaignProjection {
  campaignId: string
  currentCpa: number
  currentRoas: number
  recommendedDailyBudget: number
  recommendedMonthlyBudget: number
  expectedLeads: number
  expectedCostPerLead: number
  expectedRevenue: number
  expectedProfit: number
  expectedRoas: number
}

/**
 * Berekent aanbevolen budget en winstverwachting per campagne, gebaseerd op:
 * - historische conversieratio en CPA van de campagne (historische data)
 * - de marge en gemiddelde orderwaarde uit de instellingen (eigen marges/doelen)
 * - de maximale CPA en gewenste ROAS als grenswaarden (doelstellingen)
 *
 * Logica: als de historische CPA ruim onder de max-CPA zit en de ROAS het
 * doel haalt, is er ruimte om budget op te schalen (winstgevende marge over).
 * Zit de campagne boven de max-CPA, dan wordt het aanbevolen budget verlaagd
 * of gelijk gehouden totdat de efficiëntie verbetert.
 */
export function projectCampaign(campaign: Campaign, settings: AgentSettings): CampaignProjection {
  const currentCpa = campaign.conversions ? campaign.cost / campaign.conversions : 0
  const currentRoas = campaign.cost ? campaign.conversionValue / campaign.cost : 0
  const convRate = campaign.clicks ? campaign.conversions / campaign.clicks : 0

  // Efficiëntiefactor: hoe ver zit de campagne onder/boven de max CPA en gewenste ROAS
  const cpaHeadroom = currentCpa > 0 ? settings.maxCpa / currentCpa : 1
  const roasHeadroom = settings.targetRoas > 0 ? currentRoas / settings.targetRoas : 1

  // Schaalfactor tussen 0.6x (afschalen) en 1.6x (opschalen), gemiddelde van
  // beide signalen, gedempt zodat aanbevelingen nooit extreme sprongen maken.
  const rawScale = (cpaHeadroom + roasHeadroom) / 2
  const scale = Math.max(0.6, Math.min(1.6, rawScale))

  const recommendedDailyBudget = Math.round(campaign.dailyBudget * scale)
  const recommendedMonthlyBudget = recommendedDailyBudget * 30

  const expectedLeads = convRate > 0 ? Math.round((recommendedMonthlyBudget / (currentCpa || settings.maxCpa)) ) : 0
  const expectedCostPerLead = expectedLeads ? recommendedMonthlyBudget / expectedLeads : currentCpa
  const expectedRevenuePerLead = settings.avgOrderValue * (settings.closeRatePct / 100)
  const expectedRevenue = Math.round(expectedLeads * expectedRevenuePerLead)
  const expectedGrossProfit = Math.round(expectedRevenue * (settings.marginPct / 100))
  const expectedProfit = Math.round(expectedGrossProfit - recommendedMonthlyBudget)
  const expectedRoas = recommendedMonthlyBudget ? +(expectedRevenue / recommendedMonthlyBudget).toFixed(2) : 0

  return {
    campaignId: campaign.id,
    currentCpa,
    currentRoas,
    recommendedDailyBudget,
    recommendedMonthlyBudget,
    expectedLeads,
    expectedCostPerLead: Math.round(expectedCostPerLead * 100) / 100,
    expectedRevenue,
    expectedProfit,
    expectedRoas,
  }
}

export function projectAccount(campaigns: Campaign[], settings: AgentSettings) {
  const active = campaigns.filter((c) => c.status === 'Actief')
  const perCampaign = active.map((c) => projectCampaign(c, settings))
  return {
    perCampaign,
    totals: {
      recommendedMonthlyBudget: sum(perCampaign.map((p) => p.recommendedMonthlyBudget)),
      expectedLeads: sum(perCampaign.map((p) => p.expectedLeads)),
      expectedRevenue: sum(perCampaign.map((p) => p.expectedRevenue)),
      expectedProfit: sum(perCampaign.map((p) => p.expectedProfit)),
    },
  }
}

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export const formatCurrency2 = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n)

export const formatNumber = (n: number) => new Intl.NumberFormat('nl-NL').format(Math.round(n))

export const formatPct = (n: number) => `${n.toFixed(1)}%`
