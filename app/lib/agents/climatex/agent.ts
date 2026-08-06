/**
 * ClimateX CRM Agent — orkestratie
 *
 * Brengt de losse modules samen tot één werklijst. De agent kijkt naar de
 * binnengekomen leads en levert per lead de voorstellen die op dat moment
 * zinvol zijn: een prioriteit, eventueel een conceptofferte, en een bericht om
 * contact te leggen.
 *
 * Deze functie werkt uitsluitend op gegevens die hij meekrijgt. Het ophalen
 * gebeurt in de route handler. Daardoor is de hele werkstroom te controleren
 * zonder database, en kan dezelfde logica later ook vanuit een geplande taak
 * draaien.
 */

import type { Lead, Planning, Product } from '@/lib/types'
import type { AiProvider } from './aiProvider'
import { maakBerichtConcept } from './berichten'
import { analyseerLead, prioriteerLeads } from './leadAnalyse'
import { maakOfferteConcept } from './offerteConcept'
import { steldPlanningVoor } from './planningAdvies'
import { maakWerkbonConcept } from './werkbonVoorbereiding'
import type { AgentVoorstel, LeadAnalyse, OfferteConcept, Zekerheid } from './types'

/**
 * Vanaf deze score is een lead compleet genoeg om er een conceptofferte bij te
 * maken. Daaronder ontbreken meestal gegevens die de prijs bepalen, en is een
 * concept meer werk om te corrigeren dan om opnieuw te maken.
 */
const DREMPEL_OFFERTECONCEPT = 55

/** Hoeveel leads er per ronde worden uitgewerkt. */
const MAX_UITGEWERKTE_LEADS = 10

function bepaalZekerheid(analyse: LeadAnalyse): Zekerheid {
  if (analyse.ontbrekendeGegevens.length === 0) return 'hoog'
  if (analyse.ontbrekendeGegevens.length <= 2) return 'gemiddeld'
  return 'laag'
}

function voorstelId(soort: string, leadId: string): string {
  return `${soort}-${leadId}`
}

export type AgentInvoer = {
  leads: Lead[]
  producten: Product[]
  planningen: Planning[]
  provider: AiProvider
  /** Alleen leads met deze statussen worden opgepakt. */
  statussen?: string[]
}

export type AgentRapport = {
  /** Naam van het gebruikte taalmodel, of de sjabloonmodus. */
  motor: string
  /** Alle leads, gesorteerd op wat als eerste opgepakt moet worden. */
  prioriteiten: LeadAnalyse[]
  voorstellen: AgentVoorstel[]
  /** Wat de agent bewust heeft laten liggen, zodat dat zichtbaar blijft. */
  overgeslagen: { leadId: string; reden: string }[]
}

/**
 * Statussen waarvoor opvolging nog zin heeft. Gewonnen en verloren leads
 * krijgen geen voorstellen meer.
 */
const STANDAARD_STATUSSEN = ['Nieuw', 'Gebeld', 'Offerte verstuurd']

export async function draaiAgent(invoer: AgentInvoer, nu: Date = new Date()): Promise<AgentRapport> {
  const { leads, producten, planningen, provider } = invoer
  const statussen = invoer.statussen ?? STANDAARD_STATUSSEN

  const prioriteiten = prioriteerLeads(leads, nu)
  const voorstellen: AgentVoorstel[] = []
  const overgeslagen: { leadId: string; reden: string }[] = []

  const leadPerId = new Map(leads.map((lead) => [lead.id, lead]))

  let uitgewerkt = 0

  for (const analyse of prioriteiten) {
    const lead = leadPerId.get(analyse.leadId)
    if (!lead) continue

    if (!statussen.includes(lead.status)) {
      overgeslagen.push({ leadId: lead.id, reden: `Status "${lead.status}" vraagt geen opvolging.` })
      continue
    }

    if (uitgewerkt >= MAX_UITGEWERKTE_LEADS) {
      overgeslagen.push({ leadId: lead.id, reden: 'Buiten de eerste tien; volgende ronde.' })
      continue
    }
    uitgewerkt++

    // ── 1. Prioriteit ──
    voorstellen.push({
      id: voorstelId('prioriteit', lead.id),
      soort: 'lead-prioriteit',
      titel: `${lead.naam} — ${analyse.urgentie}`,
      onderbouwing: [
        `Score ${analyse.score} van 100.`,
        ...analyse.signalen.map((s) => `${s.effect > 0 ? '+' : ''}${s.effect}: ${s.punt}`),
      ],
      zekerheid: bepaalZekerheid(analyse),
      inhoud: analyse,
      bronnen: { leadId: lead.id },
      controlepunten:
        analyse.ontbrekendeGegevens.length > 0
          ? [`Vraag na: ${analyse.ontbrekendeGegevens.join(', ').toLowerCase()}.`]
          : [],
    })

    // ── 2. Conceptofferte, alleen als de gegevens compleet genoeg zijn ──
    if (analyse.score >= DREMPEL_OFFERTECONCEPT && lead.status !== 'Offerte verstuurd') {
      const concept = maakOfferteConcept(lead, producten)

      if (concept.productId) {
        voorstellen.push({
          id: voorstelId('offerte', lead.id),
          soort: 'offerte-concept',
          titel: `Conceptofferte ${concept.merk} ${concept.model} voor ${lead.naam}`,
          onderbouwing: concept.productMotivatie,
          // Elke aanname kan de prijs omgooien, dus hoe meer aannames hoe
          // voorzichtiger het scherm hierover moet doen.
          zekerheid: concept.aannames.length <= 1 ? 'hoog' : concept.aannames.length <= 2 ? 'gemiddeld' : 'laag',
          inhoud: concept satisfies OfferteConcept,
          bronnen: { leadId: lead.id },
          controlepunten: concept.aannames,
        })
      } else {
        overgeslagen.push({
          leadId: lead.id,
          reden: 'Geen passend product in de catalogus voor deze aansluiting.',
        })
      }
    }

    // ── 3. Bericht om contact te leggen ──
    const aanleiding =
      lead.status === 'Offerte verstuurd'
        ? ({
            soort: 'offerte-opvolging' as const,
            klantnaam: lead.naam,
            offertenummer: '[invullen: offertenummer]',
            dagenGeleden: Math.max(
              1,
              Math.floor((nu.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))
            ),
          })
        : ({ soort: 'nieuwe-lead' as const, klantnaam: lead.naam, plaats: lead.plaats })

    const kanaal = lead.email ? ('email' as const) : ('whatsapp' as const)
    const bericht = await maakBerichtConcept(
      aanleiding,
      kanaal,
      { naam: lead.naam, adres: kanaal === 'email' ? lead.email : lead.telefoon },
      provider
    )

    voorstellen.push({
      id: voorstelId(kanaal, lead.id),
      soort: kanaal === 'email' ? 'email-concept' : 'whatsapp-concept',
      titel: `${kanaal === 'email' ? 'E-mail' : 'WhatsApp'} aan ${lead.naam}`,
      onderbouwing: [analyse.volgendeStap],
      zekerheid: 'gemiddeld',
      inhoud: bericht,
      bronnen: { leadId: lead.id },
      controlepunten: bericht.invulpunten,
    })
  }

  // ── 4. Planningsadvies voor leads die al gewonnen zijn ──
  const gewonnen = leads.filter((lead) => lead.status === 'Gewonnen')
  for (const lead of gewonnen.slice(0, 3)) {
    const analyse = analyseerLead(lead, nu)
    const duur = 3 + Math.max(0, (lead.aantal_laadpunten ?? 1) - 1) * 1.5
    const momenten = steldPlanningVoor(planningen, duur, { plaats: lead.plaats, aantalVoorstellen: 2 }, nu)

    // De werkbon staat los van de planning: ook zonder vrij agendamoment hoort
    // hij klaar te staan, zodat de monteur de standaardregels niet opnieuw
    // hoeft in te typen.
    const werkbon = maakWerkbonConcept({ lead })
    voorstellen.push({
      id: voorstelId('werkbon', lead.id),
      soort: 'werkbon-concept',
      titel: `Werkbon voorbereiden voor ${lead.naam}`,
      onderbouwing: [
        `Ingeschatte duur ${werkbon.geschatteUren} uur.`,
        `${werkbon.materialen.length} materiaalregels voorgesteld.`,
      ],
      zekerheid: werkbon.aandachtspunten.length <= 2 ? 'hoog' : 'gemiddeld',
      inhoud: werkbon,
      bronnen: { leadId: lead.id },
      controlepunten: werkbon.aandachtspunten,
    })

    if (momenten.length === 0) continue

    voorstellen.push({
      id: voorstelId('planning', lead.id),
      soort: 'planning-advies',
      titel: `Installatie inplannen voor ${lead.naam}`,
      onderbouwing: momenten.map(
        (m) => `${m.datum} ${m.starttijd}-${m.eindtijd} met ${m.medewerker}: ${m.motivatie.join(' ')}`
      ),
      zekerheid: bepaalZekerheid(analyse),
      inhoud: momenten,
      bronnen: { leadId: lead.id },
      controlepunten: ['Stem het moment af met de klant voordat je het vastlegt.'],
    })
  }

  return {
    motor: provider.naam,
    prioriteiten,
    voorstellen,
    overgeslagen,
  }
}
