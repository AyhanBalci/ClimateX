/**
 * ClimateX CRM Agent — leadanalyse en prioritering
 *
 * Zet een binnengekomen lead om in een score, een urgentie en een concrete
 * volgende stap. De regels staan hier expliciet in plaats van in een taalmodel,
 * zodat een verkoper altijd kan navragen waarom een lead bovenaan staat en het
 * antwoord morgen hetzelfde is als vandaag.
 *
 * De weging is afgeleid van hoe dit werk in de praktijk loopt: een klant met
 * een auto die er al staat en een geschikte meterkast is dichter bij een
 * opdracht dan iemand die zich oriënteert. Zakelijke aanvragen en meerdere
 * laadpunten wegen zwaarder omdat de opdrachtwaarde hoger ligt.
 */

import type { Lead } from '@/lib/types'
import type { LeadAnalyse, LeadUrgentie } from './types'

/** Na hoeveel uur een onaangeraakte nieuwe lead als blijven liggen geldt. */
const SNELLE_OPVOLGING_UREN = 4

/** Hoeveel dagen een lead oud mag zijn voordat de urgentie zakt. */
const VEROUDERD_NA_DAGEN = 14

type Signaal = { punt: string; effect: number }

function urenSinds(tijdstip: string, nu: Date): number | null {
  const datum = new Date(tijdstip)
  if (Number.isNaN(datum.getTime())) return null
  return (nu.getTime() - datum.getTime()) / (1000 * 60 * 60)
}

/**
 * Zakelijke aanvragen leiden vaker tot meerdere laadpunten en een hogere
 * opdrachtwaarde, dus die krijgen voorrang.
 */
const ZAKELIJKE_WONINGTYPES = ['Kantoorruimte', 'Winkelruimte', 'Bent u aannemer?']

export function analyseerLead(lead: Lead, nu: Date = new Date()): LeadAnalyse {
  const signalen: Signaal[] = []
  const ontbrekend: string[] = []

  // ── Basis: elke lead begint neutraal ──
  let score = 40

  // ── Koopbereidheid ──
  if (lead.elektrisch_voertuig === true) {
    signalen.push({ punt: 'Heeft al een elektrische auto', effect: 20 })
  } else if (lead.elektrisch_voertuig === false) {
    signalen.push({ punt: 'Auto nog niet in bezit, oriënteert zich', effect: -10 })
  } else {
    ontbrekend.push('Is er al een elektrische auto?')
  }

  // ── Opdrachtwaarde ──
  const laadpunten = lead.aantal_laadpunten ?? 0
  if (laadpunten >= 5) {
    signalen.push({ punt: `${laadpunten} laadpunten gevraagd`, effect: 20 })
  } else if (laadpunten > 1) {
    signalen.push({ punt: `${laadpunten} laadpunten gevraagd`, effect: 10 })
  }

  if (ZAKELIJKE_WONINGTYPES.includes(lead.type_woning)) {
    signalen.push({ punt: 'Zakelijke aanvraag', effect: 12 })
  }

  // ── Technische haalbaarheid ──
  if (lead.aansluiting === '3-fase') {
    signalen.push({ punt: '3-fase aansluiting aanwezig, geen verzwaring nodig', effect: 10 })
  } else if (lead.aansluiting === '1-fase') {
    signalen.push({ punt: '1-fase aansluiting, mogelijk verzwaring nodig', effect: -5 })
  } else {
    ontbrekend.push('Type aansluiting (1-fase of 3-fase)')
  }

  if (lead.parkeerplaats) {
    signalen.push({ punt: 'Eigen parkeerplaats bekend', effect: 5 })
  } else {
    ontbrekend.push('Waar komt de laadpaal te staan?')
  }

  const afstand = lead.afstand_meterkast_meters
  if (typeof afstand === 'number') {
    if (afstand > 25) {
      signalen.push({ punt: `${afstand} meter tot de meterkast, extra graafwerk`, effect: -8 })
    } else if (afstand <= 10) {
      signalen.push({ punt: `Korte kabelafstand (${afstand} meter)`, effect: 5 })
    }
  } else {
    ontbrekend.push('Afstand tot de meterkast')
  }

  // ── Bereikbaarheid ──
  if (!lead.telefoon) ontbrekend.push('Telefoonnummer')
  if (!lead.email) ontbrekend.push('E-mailadres')
  if (!lead.telefoon && !lead.email) {
    signalen.push({ punt: 'Geen enkel contactgegeven, niet op te volgen', effect: -30 })
  }

  // ── Ouderdom en opvolging ──
  const uren = urenSinds(lead.created_at, nu)
  if (uren !== null) {
    if (lead.status === 'Nieuw' && uren > SNELLE_OPVOLGING_UREN) {
      signalen.push({
        punt: `Al ${Math.floor(uren)} uur niet opgevolgd`,
        effect: Math.min(15, Math.floor(uren / 8) * 5),
      })
    }
    if (uren / 24 > VEROUDERD_NA_DAGEN) {
      signalen.push({ punt: `Ouder dan ${VEROUDERD_NA_DAGEN} dagen`, effect: -15 })
    }
  }

  // ── Status: afgeronde leads horen niet meer bovenaan ──
  if (lead.status === 'Gewonnen' || lead.status === 'Verloren') {
    signalen.push({ punt: `Lead is al ${lead.status.toLowerCase()}`, effect: -60 })
  } else if (lead.status === 'Offerte verstuurd') {
    signalen.push({ punt: 'Offerte ligt bij de klant, wacht op besluit', effect: -5 })
  }

  score += signalen.reduce((som, signaal) => som + signaal.effect, 0)
  // De score is een prioriteitsvolgorde, geen kans. Buiten 0-100 zegt hij niets meer.
  score = Math.max(0, Math.min(100, score))

  return {
    leadId: lead.id,
    score,
    urgentie: bepaalUrgentie(score, lead, uren),
    signalen,
    ontbrekendeGegevens: ontbrekend,
    volgendeStap: bepaalVolgendeStap(lead, ontbrekend),
  }
}

function bepaalUrgentie(score: number, lead: Lead, uren: number | null): LeadUrgentie {
  if (lead.status === 'Gewonnen' || lead.status === 'Verloren') return 'later'

  // Een nieuwe lead die net binnen is verdient hoe dan ook snel een belletje:
  // de kans dat iemand een concurrent belt is in de eerste uren het grootst.
  if (lead.status === 'Nieuw' && uren !== null && uren <= SNELLE_OPVOLGING_UREN) {
    return 'direct bellen'
  }

  if (score >= 75) return 'direct bellen'
  if (score >= 55) return 'vandaag'
  if (score >= 35) return 'deze week'
  return 'later'
}

function bepaalVolgendeStap(lead: Lead, ontbrekend: string[]): string {
  if (lead.status === 'Gewonnen') return 'Geen actie nodig, opdracht is binnen.'
  if (lead.status === 'Verloren') return 'Geen actie nodig, lead is afgesloten.'

  if (!lead.telefoon && !lead.email) {
    return 'Geen contactgegevens bekend. Controleer de aanvraag in het formulier.'
  }

  if (lead.status === 'Offerte verstuurd') {
    return 'Bel na over de verstuurde offerte en vraag of er nog vragen zijn.'
  }

  if (lead.status === 'Nieuw') {
    const via = lead.telefoon ? 'Bel' : 'Mail'
    return ontbrekend.length > 0
      ? `${via} de klant en vraag naar: ${ontbrekend.slice(0, 3).join(', ').toLowerCase()}.`
      : `${via} de klant. Alle gegevens voor een offerte zijn compleet.`
  }

  return ontbrekend.length > 0
    ? `Vul ontbrekende gegevens aan: ${ontbrekend.slice(0, 3).join(', ').toLowerCase()}.`
    : 'Maak een offerte op; de gegevens zijn compleet.'
}

/**
 * Sorteert leads op wat er als eerste opgepakt moet worden. Bij een gelijke
 * score wint de oudste lead, zodat er niets onderop blijft liggen.
 */
export function prioriteerLeads(leads: Lead[], nu: Date = new Date()): LeadAnalyse[] {
  return leads
    .map((lead) => ({ analyse: analyseerLead(lead, nu), aangemaakt: new Date(lead.created_at).getTime() }))
    .sort((a, b) => b.analyse.score - a.analyse.score || a.aangemaakt - b.aangemaakt)
    .map((regel) => regel.analyse)
}
