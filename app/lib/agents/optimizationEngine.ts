import {
  Campaign,
  KeywordRow,
  SearchTermRow,
  ResponsiveSearchAd,
  Recommendation,
  AgentSettings,
} from '@/lib/agents/types'
import { projectCampaign, sum } from './calculations'

let counter = 0
const id = () => `rec-${++counter}`

/**
 * Deze engine simuleert het analytische redeneerproces van een senior
 * Google Ads specialist: elke regel hieronder correspondeert met een
 * concrete controle die een specialist handmatig zou uitvoeren.
 * In productie voedt de echte Google Ads API (via googleAdsApi.ts) deze
 * functie met live data; de logica hieronder blijft ongewijzigd.
 */
export function generateRecommendations(
  campaigns: Campaign[],
  keywords: KeywordRow[],
  searchTerms: SearchTermRow[],
  ads: ResponsiveSearchAd[],
  settings: AgentSettings,
): Recommendation[] {
  const recs: Recommendation[] = []

  // 1. Budget: campagnes met ruimte om op te schalen of die afgeremd moeten worden
  campaigns
    .filter((c) => c.status === 'Actief')
    .forEach((c) => {
      const proj = projectCampaign(c, settings)
      const cpa = c.conversions ? c.cost / c.conversions : 0
      const roas = c.cost ? c.conversionValue / c.cost : 0

      if (roas >= settings.targetRoas * 1.15 && cpa <= settings.maxCpa * 0.8 && c.conversions >= 10) {
        recs.push({
          id: id(),
          priority: 'Hoog',
          category: 'Budget',
          title: `Verhoog het budget van ${c.name}`,
          problem: `${c.name} draait een ROAS van ${roas.toFixed(1)}x tegen een CPA van €${cpa.toFixed(2)}, ruim binnen de gestelde grenzen.`,
          why: 'Deze campagne is winstgevend en heeft aantoonbaar meer volume aangekund dan het huidige budget toelaat — winst blijft nu liggen.',
          impact: `Verwachte extra omzet bij opschalen naar €${proj.recommendedDailyBudget}/dag: circa ${formatDelta(proj.expectedRevenue)}.`,
          action: `Verhoog het dagbudget van €${c.dailyBudget} naar €${proj.recommendedDailyBudget}.`,
          campaignId: c.id,
        })
      }

      if (cpa > settings.maxCpa * 1.2 && c.conversions > 0) {
        recs.push({
          id: id(),
          priority: 'Kritiek',
          category: 'Budget',
          title: `Verlaag het budget van ${c.name}`,
          problem: `De CPA van ${c.name} ligt op €${cpa.toFixed(2)}, ${Math.round((cpa / settings.maxCpa - 1) * 100)}% boven de ingestelde maximale CPA van €${settings.maxCpa}.`,
          why: 'Elke extra conversie op deze campagne kost meer dan de marge toelaat — verder opschalen vergroot het verlies.',
          impact: `Bij ongewijzigd beleid loopt het maandelijkse verlies op tot circa €${Math.round((cpa - settings.maxCpa) * c.conversions * 4.3)}.`,
          action: `Verlaag het dagbudget van €${c.dailyBudget} naar €${Math.max(10, Math.round(c.dailyBudget * 0.7))} en herzie de biedstrategie.`,
          campaignId: c.id,
        })
      }

      if (c.conversions === 0 && c.cost > settings.dailyBudget * 5) {
        recs.push({
          id: id(),
          priority: 'Kritiek',
          category: 'Budget',
          title: `${c.name} genereert geen conversies`,
          problem: `€${c.cost.toFixed(0)} besteed zonder één geregistreerde conversie.`,
          why: 'Zonder trackingsignaal kan geen enkele biedstrategie automatisch optimaliseren — dit is puur weggegooid budget.',
          impact: `Directe besparing van €${c.dailyBudget}/dag totdat de oorzaak is opgelost.`,
          action: 'Pauzeer de campagne en controleer conversietracking voordat deze wordt herstart.',
          campaignId: c.id,
        })
      }
    })

  // 2. Zoekwoorden: lage quality score / geen conversies bij significant volume
  keywords.forEach((k) => {
    const campaign = campaigns.find((c) => c.id === k.campaignId)
    if (k.status === 'Aanbevolen: pauzeren') {
      recs.push({
        id: id(),
        priority: k.cost > 500 ? 'Hoog' : 'Gemiddeld',
        category: 'Zoekwoorden',
        title: `Pauzeer zoekwoord "${k.keyword}"`,
        problem: `Quality Score ${k.qualityScore}/10, €${k.cost.toFixed(0)} besteed voor slechts ${k.conversions} conversie(s) in ${campaign?.name ?? 'deze campagne'}.`,
        why: 'Ruime targeting op een generieke term trekt veel irrelevant verkeer aan, wat de gemiddelde CPC voor de hele advertentiegroep opdrijft.',
        impact: `Directe besparing van circa €${Math.round(k.cost * 0.6)}/maand bij pauzering.`,
        action: 'Pauzeer dit zoekwoord en vervang door specifiekere exacte/woordgroep-varianten.',
        campaignId: k.campaignId,
      })
    }
  })

  // 3. Zoektermen: nieuwe keywords toevoegen of uitsluiten
  const toAdd = searchTerms.filter((s) => s.suggestion === 'toevoegen als zoekwoord')
  const toExclude = searchTerms.filter((s) => s.suggestion === 'uitsluiten (negatief)')

  if (toAdd.length) {
    recs.push({
      id: id(),
      priority: 'Gemiddeld',
      category: 'Zoektermen',
      title: `Voeg ${toAdd.length} presterende zoektermen toe als zoekwoord`,
      problem: `${toAdd.length} zoektermen genereren conversies maar staan nog niet als zoekwoord ingesteld: ${toAdd.map((s) => `"${s.term}"`).join(', ')}.`,
      why: 'Door ze expliciet als zoekwoord toe te voegen krijg je controle over bod en advertentietekst, in plaats van afhankelijk te zijn van ruime matching.',
      impact: `Deze termen genereerden samen al ${toAdd.reduce((a, s) => a + s.conversions, 0)} conversies tegen €${toAdd.reduce((a, s) => a + s.cost, 0).toFixed(0)}.`,
      action: 'Voeg deze zoektermen toe als exact/woordgroep zoekwoord in de bijbehorende advertentiegroep.',
    })
  }

  if (toExclude.length) {
    recs.push({
      id: id(),
      priority: 'Hoog',
      category: 'Negatieve zoekwoorden',
      title: `Voeg ${toExclude.length} negatieve zoekwoorden toe`,
      problem: `Irrelevante zoektermen zoals ${toExclude.map((s) => `"${s.term}"`).join(', ')} genereren klikken zonder conversies.`,
      why: 'Deze termen sluiten niet aan bij koopintentie (bijv. vacatures, doe-het-zelf, gratis informatie) en verspillen budget dat naar converterende termen kan gaan.',
      impact: `Bespaart circa €${toExclude.reduce((a, s) => a + s.cost, 0).toFixed(0)}/maand, direct herinvesteerbaar in presterende zoekwoorden.`,
      action: 'Voeg deze zoektermen toe als negatief zoekwoord op campagne- of accountniveau.',
    })
  }

  // 4. RSA's met lage CTR / zwakke advertentiesterkte
  ads.forEach((ad) => {
    const campaign = campaigns.find((c) => c.id === ad.campaignId)
    if (ad.strength === 'Slecht' || ad.ctr < 3) {
      recs.push({
        id: id(),
        priority: 'Gemiddeld',
        category: 'Advertentieteksten',
        title: `Deze advertentie heeft een lage CTR (${campaign?.name ?? ''})`,
        problem: `CTR van ${ad.ctr.toFixed(1)}% en advertentiesterkte "${ad.strength}" — ruim onder het accountgemiddelde.`,
        why: 'Een lage CTR verlaagt de Quality Score, wat de CPC voor alle zoekwoorden in deze advertentiegroep verhoogt.',
        impact: 'Een sterkere advertentie kan de CTR met 40–80% verbeteren en de CPC met 10–20% verlagen.',
        action: 'Maak nieuwe advertentieteksten met sterkere call-to-actions en minimaal 3 unieke USP-koppen per advertentie.',
        campaignId: ad.campaignId,
      })
    }
  })

  // 5. Structuur: een campagne met een sterk afwijkende CPC bedient feitelijk een
  //    ander marktsegment en verdient een eigen campagne met eigen biedstrategie.
  const actief = campaigns.filter((c) => c.status === 'Actief' && c.clicks > 0)
  const accountCpc = sum(actief.map((c) => c.cost)) / Math.max(1, sum(actief.map((c) => c.clicks)))
  const afwijkend = [...actief]
    .map((c) => ({ campaign: c, cpc: c.cost / c.clicks }))
    .filter((x) => accountCpc > 0 && x.cpc >= accountCpc * 1.5)
    .sort((a, b) => b.cpc - a.cpc)[0]

  if (afwijkend) {
    const { campaign, cpc } = afwijkend
    recs.push({
      id: id(),
      priority: 'Laag',
      category: 'Structuur',
      title: `Maak een aparte campagne voor "${campaign.service}"`,
      problem: `${campaign.name} draait een gemiddelde CPC van €${cpc.toFixed(2)}, ${Math.round((cpc / accountCpc - 1) * 100)}% boven het accountgemiddelde van €${accountCpc.toFixed(2)}.`,
      why: 'Een sterk afwijkende CPC duidt op een ander marktsegment met eigen zoekintentie en dealwaarde — samenvoegen met het overige verkeer verwatert de relevantie en drijft de kosten op.',
      impact: 'Verwacht een hogere CTR en betere Quality Score door specifiekere advertentieteksten en landingspagina per doelgroep.',
      action: `Splits "${campaign.service}" naar een eigen campagne met een passende landingspagina en eigen biedstrategie.`,
      campaignId: campaign.id,
    })
  }

  const priorityOrder: Record<Recommendation['priority'], number> = { Kritiek: 0, Hoog: 1, Gemiddeld: 2, Laag: 3 }
  return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

function formatDelta(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
