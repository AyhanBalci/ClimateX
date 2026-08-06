/**
 * ClimateX CRM Agent — klantvragen beantwoorden
 *
 * Beantwoordt vragen op twee manieren, in deze volgorde:
 *
 *   1. Vragen over het eigen dossier ("wanneer komt de monteur?", "is mijn
 *      factuur al betaald?") uit de CRM-gegevens van die klant.
 *   2. Algemene vragen over laadpalen, subsidie en regelgeving uit de
 *      kennisbank, met de officiële bron erbij.
 *
 * Wat de agent níet doet, is een antwoord bedenken. Vindt hij geen bron, dan
 * zegt hij dat en zet hij de vraag door naar een mens. Bij subsidiebedragen en
 * regelgeving is een plausibel klinkend maar verzonnen antwoord schadelijker
 * dan geen antwoord: de klant rekent zich rijk en wij mogen het uitleggen.
 */

import { ARTIKELEN } from '@/lib/kennisbank/artikelen'
import type { Artikel } from '@/lib/kennisbank/types'
import type { Factuur, Offerte, Planning, Werkbon } from '@/lib/types'
import { formatBedrag, formatDatum } from '@/lib/formatters'
import { geldigTot, offerteStatusWeergave } from '@/lib/offerteStatus'
import type { KlantAntwoord } from './types'

/** Woorden die in vrijwel elke vraag staan en dus niets onderscheiden. */
const STOPWOORDEN = new Set([
  'de', 'het', 'een', 'en', 'of', 'is', 'zijn', 'wat', 'hoe', 'waarom', 'wanneer', 'waar',
  'ik', 'mijn', 'me', 'mij', 'u', 'uw', 'we', 'wij', 'je', 'jij', 'jullie',
  'voor', 'van', 'op', 'in', 'met', 'aan', 'bij', 'te', 'dat', 'die', 'dit', 'deze',
  'kan', 'kun', 'kunt', 'moet', 'mag', 'heb', 'heeft', 'hebben', 'wordt', 'worden',
  'er', 'nog', 'ook', 'als', 'dan', 'niet', 'geen', 'wel', 'maar', 'om', 'naar',
])

/** Vanaf deze score beschouwen we een kennisbanktreffer als bruikbaar. */
const DREMPEL_BRUIKBAAR = 2

function normaliseer(tekst: string): string[] {
  return tekst
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((woord) => woord.length > 2 && !STOPWOORDEN.has(woord))
}

/** Overlap tussen de vraag en een stuk tekst, waarbij langere woorden zwaarder wegen. */
function overlapScore(vraagWoorden: string[], tekst: string): number {
  const doel = new Set(normaliseer(tekst))
  return vraagWoorden.reduce((score, woord) => {
    if (doel.has(woord)) return score + (woord.length >= 6 ? 2 : 1)
    return score
  }, 0)
}

type KennisTreffer = {
  artikel: Artikel
  score: number
  antwoord: string
}

function zoekInKennisbank(vraag: string): KennisTreffer | null {
  const woorden = normaliseer(vraag)
  if (woorden.length === 0) return null

  let beste: KennisTreffer | null = null

  for (const artikel of ARTIKELEN) {
    // Een FAQ die op de vraag lijkt is het meest directe antwoord dat er is.
    for (const faq of artikel.faqs) {
      const score = overlapScore(woorden, faq.vraag) * 2 + overlapScore(woorden, faq.antwoord)
      if (!beste || score > beste.score) {
        beste = { artikel, score, antwoord: faq.antwoord }
      }
    }

    // Anders de samenvatting van het artikel als geheel.
    const artikelScore =
      overlapScore(woorden, artikel.titel) * 2 + overlapScore(woorden, artikel.samenvatting)
    if (!beste || artikelScore > beste.score) {
      beste = { artikel, score: artikelScore, antwoord: artikel.samenvatting }
    }
  }

  return beste && beste.score >= DREMPEL_BRUIKBAAR ? beste : null
}

export type KlantDossier = {
  klantnaam: string
  offertes: Offerte[]
  werkbonnen: Werkbon[]
  facturen: Factuur[]
  planningen: Planning[]
}

/** Onderwerpen waarover we in het dossier kunnen kijken. */
type DossierOnderwerp = 'offerte' | 'afspraak' | 'factuur' | 'werkbon'

function herkenDossierOnderwerp(vraag: string): DossierOnderwerp | null {
  const woorden = normaliseer(vraag)
  const bevat = (...termen: string[]) => termen.some((t) => woorden.includes(t))

  // "Wanneer komt de monteur" gaat over de afspraak, ook zonder het woord agenda.
  if (bevat('afspraak', 'monteur', 'installatie', 'geplande', 'planning', 'komt', 'langs')) return 'afspraak'
  if (bevat('offerte', 'prijs', 'aanbieding', 'voorstel')) return 'offerte'
  if (bevat('factuur', 'betaald', 'betaling', 'rekening', 'betalen')) return 'factuur'
  if (bevat('werkbon', 'opgeleverd', 'uitgevoerd')) return 'werkbon'
  return null
}

function beantwoordUitDossier(
  vraag: string,
  dossier: KlantDossier,
  nu: Date
): KlantAntwoord | null {
  const onderwerp = herkenDossierOnderwerp(vraag)
  if (!onderwerp) return null

  if (onderwerp === 'afspraak') {
    // Alleen afspraken die nog komen; een klant vraagt zelden naar het verleden.
    const komend = dossier.planningen
      .filter((p) => p.status !== 'Geannuleerd' && new Date(`${p.datum}T00:00:00`) >= new Date(nu.toDateString()))
      .sort((a, b) => a.datum.localeCompare(b.datum) || a.starttijd.localeCompare(b.starttijd))[0]

    if (!komend) {
      return {
        vraag,
        antwoord:
          'Er staat op dit moment geen afspraak gepland. Zodra de installatie ingepland is, ontvangt u van ons een bevestiging.',
        bronnen: [{ titel: 'Planning', verwijzing: 'CRM' }],
        vereistMens: false,
      }
    }

    return {
      vraag,
      antwoord: `De afspraak staat gepland op ${formatDatum(komend.datum)} tussen ${komend.starttijd.slice(0, 5)} en ${komend.eindtijd.slice(0, 5)} uur. ${komend.medewerker} voert de installatie uit.`,
      bronnen: [{ titel: `Afspraak ${komend.planning_nummer}`, verwijzing: komend.id }],
      vereistMens: false,
    }
  }

  if (onderwerp === 'offerte') {
    const laatste = [...dossier.offertes].sort((a, b) => b.datum.localeCompare(a.datum))[0]
    if (!laatste) {
      return {
        vraag,
        antwoord: 'Er staat nog geen offerte voor u klaar. Wij nemen contact op zodra deze gereed is.',
        bronnen: [{ titel: 'Offertes', verwijzing: 'CRM' }],
        vereistMens: false,
      }
    }

    const weergave = offerteStatusWeergave(laatste.status, laatste.datum, nu)
    const geldig = geldigTot(laatste.datum)
    const staat = weergave.verlopen
      ? `De geldigheidstermijn is verstreken op ${formatDatum(geldig)}.`
      : `De offerte is geldig tot ${formatDatum(geldig)}.`

    return {
      vraag,
      antwoord: `Offerte ${laatste.offertenummer} van ${formatBedrag(laatste.prijs)} heeft de status "${weergave.klantLabel}". ${staat}`,
      bronnen: [{ titel: `Offerte ${laatste.offertenummer}`, verwijzing: laatste.id }],
      vereistMens: weergave.verlopen,
    }
  }

  if (onderwerp === 'factuur') {
    const open = dossier.facturen.filter((f) => f.status !== 'Betaald')
    if (dossier.facturen.length === 0) {
      return {
        vraag,
        antwoord: 'Er staat op dit moment geen factuur voor u open.',
        bronnen: [{ titel: 'Facturen', verwijzing: 'CRM' }],
        vereistMens: false,
      }
    }

    if (open.length === 0) {
      return {
        vraag,
        antwoord: 'Al uw facturen zijn voldaan. Er staat niets meer open.',
        bronnen: [{ titel: 'Facturen', verwijzing: 'CRM' }],
        vereistMens: false,
      }
    }

    const totaal = open.reduce((som, f) => som + (f.totaal || 0), 0)
    const nummers = open.map((f) => f.factuurnummer).join(', ')
    return {
      vraag,
      antwoord: `Er ${open.length === 1 ? 'staat 1 factuur' : `staan ${open.length} facturen`} open (${nummers}) voor een totaalbedrag van ${formatBedrag(totaal)}.`,
      bronnen: open.map((f) => ({ titel: `Factuur ${f.factuurnummer}`, verwijzing: f.id })),
      vereistMens: false,
    }
  }

  // werkbon
  const laatsteWerkbon = [...dossier.werkbonnen].sort((a, b) => b.datum.localeCompare(a.datum))[0]
  if (!laatsteWerkbon) {
    return {
      vraag,
      antwoord: 'Er is nog geen werkbon voor u aangemaakt. Die volgt zodra de installatie is uitgevoerd.',
      bronnen: [{ titel: 'Werkbonnen', verwijzing: 'CRM' }],
      vereistMens: false,
    }
  }

  return {
    vraag,
    antwoord: `Werkbon ${laatsteWerkbon.werkbonnummer} van ${formatDatum(laatsteWerkbon.datum)} heeft de status "${laatsteWerkbon.status}".`,
    bronnen: [{ titel: `Werkbon ${laatsteWerkbon.werkbonnummer}`, verwijzing: laatsteWerkbon.id }],
    vereistMens: false,
  }
}

/**
 * Beantwoordt een klantvraag. Zonder dossier worden alleen algemene vragen
 * beantwoord; dat is precies wat er op de publieke website nodig is.
 */
export function beantwoordKlantvraag(
  vraag: string,
  dossier: KlantDossier | null = null,
  nu: Date = new Date()
): KlantAntwoord {
  const schoon = vraag.trim()

  if (schoon.length < 3) {
    return {
      vraag: schoon,
      antwoord: 'De vraag is te kort om te beantwoorden. Kunt u iets meer toelichten wat u wilt weten?',
      bronnen: [],
      vereistMens: true,
    }
  }

  if (dossier) {
    const uitDossier = beantwoordUitDossier(schoon, dossier, nu)
    if (uitDossier) return uitDossier
  }

  const treffer = zoekInKennisbank(schoon)
  if (treffer) {
    return {
      vraag: schoon,
      antwoord: treffer.antwoord,
      bronnen: [
        { titel: treffer.artikel.titel, verwijzing: `/kennisbank/${treffer.artikel.slug}` },
        ...treffer.artikel.bronnen.map((b) => ({ titel: `${b.titel} (${b.organisatie})`, verwijzing: b.url })),
      ],
      vereistMens: false,
    }
  }

  return {
    vraag: schoon,
    antwoord:
      'Hier heb ik geen onderbouwd antwoord op. Een collega neemt contact met u op om dit goed uit te zoeken.',
    bronnen: [],
    vereistMens: true,
  }
}
