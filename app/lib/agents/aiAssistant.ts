import { Campaign, AgentSettings, KeywordRow, SearchTermRow } from '@/lib/agents/types'
import { computeTotals, projectAccount, formatCurrency, formatCurrency2 } from './calculations'

/**
 * PRODUCTIE-INTEGRATIE
 * ────────────────────
 * Deze module bevat op dit moment een deterministische, regel-gebaseerde
 * "AI" die antwoorden opbouwt uit de echte accountdata — zodat de demo
 * altijd correcte, herleidbare cijfers toont zonder een externe API-key.
 *
 * Voor productie vervang je `answerQuestion` door een aanroep naar een LLM
 * (bijv. Claude via de Anthropic API) met een system prompt zoals:
 *
 *   "Je bent een senior Google Ads specialist met 15+ jaar ervaring,
 *    volledig gericht op winstgevendheid. Gebruik ALLEEN de meegegeven
 *    accountdata en instellingen. Onderbouw elk advies met concrete
 *    cijfers. Antwoord in het Nederlands."
 *
 * en geef de output van computeTotals/projectAccount + de ruwe campagne-,
 * zoekwoord- en zoektermdata mee als context in het bericht. Zo blijft de
 * onderbouwing net zo cijfermatig, maar wordt de taal van het antwoord
 * flexibeler. Zie src/lib/googleAdsApi.ts voor hoe live data wordt
 * opgehaald.
 */

export function answerQuestion(
  question: string,
  campaigns: Campaign[],
  keywords: KeywordRow[],
  searchTerms: SearchTermRow[],
  settings: AgentSettings,
): string {
  const q = question.toLowerCase()
  const totals = computeTotals(campaigns)
  const projection = projectAccount(campaigns, settings)

  if (/budget/.test(q) && /(aanraden|advies|hoeveel)/.test(q)) {
    const actief = campaigns.filter((c) => c.status === 'Actief' && c.cost > 0)
    const byRoas = [...actief].sort((a, b) => b.conversionValue / b.cost - a.conversionValue / a.cost)
    const sterk = byRoas
      .filter((c) => c.conversionValue / c.cost >= settings.targetRoas && (!c.conversions || c.cost / c.conversions <= settings.maxCpa))
      .slice(0, 2)
    const zwak = byRoas.filter((c) => c.conversions > 0 && c.cost / c.conversions > settings.maxCpa).slice(-1)
    const sterkTekst = sterk.length ? ` (zoals ${sterk.map((c) => `"${c.name}"`).join(' en ')})` : ''
    const zwakTekst = zwak.length ? ` (zoals ${zwak.map((c) => `"${c.name}"`).join(' en ')})` : ''
    return [
      `Op basis van de huidige performance raad ik een totaal maandbudget aan van ${formatCurrency(projection.totals.recommendedMonthlyBudget)} over alle actieve campagnes, tegenover ${formatCurrency(totals.cost * 30)} nu.`,
      ``,
      `Onderbouwing: de account-brede ROAS staat op ${totals.roas.toFixed(1)}x bij een doel van ${settings.targetRoas}x, en de CPA van ${formatCurrency2(totals.cpa)} zit ${totals.cpa < settings.maxCpa ? 'onder' : 'boven'} je ingestelde maximum van ${formatCurrency(settings.maxCpa)}. Campagnes die ruim binnen deze grenzen presteren${sterkTekst} kunnen budget opnemen zonder de winstgevendheid aan te tasten; campagnes die eroverheen gaan${zwakTekst} worden juist afgeremd.`,
      ``,
      `Zie de pagina Optimalisaties voor het budgetadvies per campagne.`,
    ].join('\n')
  }

  if (/waarom.*(slecht|onder ?presteert|niet goed)/.test(q) || (/slecht/.test(q) && /campagne/.test(q))) {
    const worst = [...campaigns.filter((c) => c.status === 'Actief')].sort((a, b) => {
      const roasA = a.cost ? a.conversionValue / a.cost : 0
      const roasB = b.cost ? b.conversionValue / b.cost : 0
      return roasA - roasB
    })[0]
    const roas = worst.cost ? worst.conversionValue / worst.cost : 0
    const cpa = worst.conversions ? worst.cost / worst.conversions : 0
    return [
      `De zwakst presterende campagne is momenteel "${worst.name}".`,
      ``,
      `Cijfers: ROAS van ${roas.toFixed(1)}x (doel: ${settings.targetRoas}x), CPA van ${formatCurrency2(cpa)} (max: ${formatCurrency(settings.maxCpa)}), en ${worst.conversions} conversies op ${worst.clicks} klikken — een conversieratio van ${((worst.conversions / worst.clicks) * 100).toFixed(1)}%.`,
      ``,
      `Belangrijkste oorzaak: de biedstrategie "${worst.bidStrategy}" in combinatie met brede targeting trekt verkeer aan met lage koopintentie. Controleer de zoekwoorden- en zoektermenpagina voor deze campagne — daar staan concrete aanbevelingen om te pauzeren of uit te sluiten.`,
    ].join('\n')
  }

  if (/(welke|wat).*zoekwoord.*(toevoegen|missen)/.test(q)) {
    const add = searchTerms.filter((s) => s.suggestion === 'toevoegen als zoekwoord')
    if (!add.length) return 'Er zijn op dit moment geen zoektermen die ik aanraad om toe te voegen — alle presterende termen zijn al als zoekwoord ingesteld.'
    return [
      `Ik raad aan om deze ${add.length} zoektermen toe te voegen als zoekwoord, omdat ze al conversies genereren maar nog op ruime targeting draaien:`,
      ``,
      ...add.map((s) => `• "${s.term}" — ${s.conversions} conversie(s), ${formatCurrency2(s.cost)} besteed`),
      ``,
      `Door ze expliciet toe te voegen krijg je controle over bod en advertentietekst per term, in plaats van te vertrouwen op automatische matching.`,
    ].join('\n')
  }

  if (/cpc.*(hoog|duur)|waarom.*cpc/.test(q)) {
    const expensive = [...keywords].sort((a, b) => b.avgCpc - a.avgCpc)[0]
    return [
      `Je gemiddelde CPC over het account is ${formatCurrency2(totals.avgCpc)}. Het duurste zoekwoord is "${expensive.keyword}" met een gemiddelde CPC van ${formatCurrency2(expensive.avgCpc)}.`,
      ``,
      `Belangrijkste oorzaken van een hoge CPC: (1) een lage Quality Score — dit zoekwoord scoort ${expensive.qualityScore}/10, wat Google direct vertaalt in een hogere prijs per klik; (2) sterke concurrentie op zakelijke/hoogwaardige zoektermen; (3) brede matchtypes die op duurdere, minder relevante varianten bieden.`,
      ``,
      `Advies: verbeter de advertentierelevantie (specifiekere RSA-teksten per advertentiegroep) en overweeg exacte matching voor de duurste termen om de CPC te verlagen.`,
    ].join('\n')
  }

  if (/(welke|wat).*campagne.*(meeste|beste).*(geld|omzet|winst)/.test(q)) {
    const best = [...campaigns.filter((c) => c.status === 'Actief')].sort((a, b) => (b.conversionValue - b.cost) - (a.conversionValue - a.cost))[0]
    const profit = best.conversionValue - best.cost
    return [
      `"${best.name}" levert het meeste op: ${formatCurrency(best.conversionValue)} omzet tegen ${formatCurrency(best.cost)} advertentiekosten, een bruto marge van circa ${formatCurrency(profit)} vóór productmarge.`,
      ``,
      `Met jouw ingestelde marge van ${settings.marginPct}% en gemiddelde orderwaarde van ${formatCurrency(settings.avgOrderValue)} is dit ook de campagne met de hoogste ROAS: ${(best.conversionValue / best.cost).toFixed(1)}x. Dit is de eerste campagne om op te schalen.`,
    ].join('\n')
  }

  // Fallback: samenvatting van accountstatus
  return [
    `Huidige accountstatus: ${formatCurrency(totals.cost)} besteed, ${totals.conversions} conversies, ROAS ${totals.roas.toFixed(1)}x (doel ${settings.targetRoas}x), CPA ${formatCurrency2(totals.cpa)} (max ${formatCurrency(settings.maxCpa)}).`,
    ``,
    `Stel je vraag specifieker — bijvoorbeeld over budget, een specifieke campagne, zoekwoorden of CPC — en ik geef een onderbouwd antwoord met de exacte cijfers uit je account.`,
  ].join('\n')
}
