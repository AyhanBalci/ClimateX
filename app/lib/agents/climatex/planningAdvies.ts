/**
 * ClimateX CRM Agent — planningsadvies
 *
 * Stelt momenten voor om een klus in te plannen, op basis van wat er al in de
 * agenda staat. De agent boekt niets: hij levert kandidaten met een motivatie,
 * en de planner kiest.
 *
 * Er wordt bewust gerekend met hele werkdagen en vaste starttijden in plaats
 * van met exacte reistijden. Reistijd tussen twee adressen is zonder
 * routeservice niet te bepalen, en een geschatte reistijd die er naast zit
 * geeft een monteur een planning die niet haalbaar is. Wat wél kan is kijken
 * of iemand al in dezelfde plaats werkt; dat weegt hier mee.
 */

import type { Planning } from '@/lib/types'
import { addDays, toDateKey } from '@/lib/dateUtils'
import type { PlanningVoorstel } from './types'

/** Werkdag loopt van 8:00 tot 17:00. */
const WERKDAG_START = 8
const WERKDAG_EIND = 17

/** Standaard startmomenten; een monteur begint liever niet halverwege een uur. */
const STARTMOMENTEN = [8, 9, 10, 13, 14]

/** Hoeveel uur een monteur per dag aan klussen besteedt voordat het te vol wordt. */
const MAX_UREN_PER_DAG = 8

type Opties = {
  /** Hoeveel dagen vooruit gekeken wordt. */
  horizonDagen?: number
  /** Alleen deze monteurs meenemen. Leeg betekent: alle bekende. */
  monteurs?: string[]
  /** Plaats van de klus, om te zien of iemand al in de buurt is. */
  plaats?: string | null
  /** Hoeveel voorstellen er teruggegeven worden. */
  aantalVoorstellen?: number
}

function tijdNaarUren(tijd: string): number {
  const [uur, minuut] = tijd.split(':').map(Number)
  return (Number.isFinite(uur) ? uur : 0) + (Number.isFinite(minuut) ? minuut : 0) / 60
}

function urenNaarTijd(uren: number): string {
  const uur = Math.floor(uren)
  const minuut = Math.round((uren - uur) * 60)
  return `${String(uur).padStart(2, '0')}:${String(minuut).padStart(2, '0')}`
}

function isWeekend(datum: Date): boolean {
  const dag = datum.getDay()
  return dag === 0 || dag === 6
}

/** Afspraken die niet meer meetellen omdat ze afgezegd zijn. */
function teltMee(afspraak: Planning): boolean {
  return afspraak.status !== 'Geannuleerd'
}

/**
 * Zoekt vrije momenten van `duurUren` in de agenda van elke monteur.
 */
export function steldPlanningVoor(
  bestaandeAfspraken: Planning[],
  duurUren: number,
  opties: Opties = {},
  nu: Date = new Date()
): PlanningVoorstel[] {
  const horizon = opties.horizonDagen ?? 14
  const gewenstAantal = opties.aantalVoorstellen ?? 3
  const duur = Math.max(0.5, duurUren)

  const relevante = bestaandeAfspraken.filter(teltMee)

  const monteurs =
    opties.monteurs && opties.monteurs.length > 0
      ? opties.monteurs
      : Array.from(new Set(relevante.map((a) => a.medewerker).filter(Boolean)))

  if (monteurs.length === 0) {
    return []
  }

  const voorstellen: PlanningVoorstel[] = []

  // Vanaf morgen: vandaag inplannen zonder overleg met de klant is zelden reëel.
  for (let dagOffset = 1; dagOffset <= horizon && voorstellen.length < gewenstAantal * 3; dagOffset++) {
    const dag = addDays(nu, dagOffset)
    if (isWeekend(dag)) continue

    const datumSleutel = toDateKey(dag)

    for (const monteur of monteurs) {
      const opDeze = relevante.filter((a) => a.datum === datumSleutel && a.medewerker === monteur)

      const geboekteUren = opDeze.reduce(
        (som, a) => som + Math.max(0, tijdNaarUren(a.eindtijd) - tijdNaarUren(a.starttijd)),
        0
      )
      if (geboekteUren + duur > MAX_UREN_PER_DAG) continue

      for (const startUur of STARTMOMENTEN) {
        const eindUur = startUur + duur
        if (eindUur > WERKDAG_EIND || startUur < WERKDAG_START) continue

        const botst = opDeze.some((a) => {
          const aStart = tijdNaarUren(a.starttijd)
          const aEind = tijdNaarUren(a.eindtijd)
          return startUur < aEind && eindUur > aStart
        })
        if (botst) continue

        const motivatie: string[] = []
        motivatie.push(
          opDeze.length === 0
            ? `${monteur} heeft deze dag nog niets staan.`
            : `${monteur} heeft deze dag ${opDeze.length} ${opDeze.length === 1 ? 'afspraak' : 'afspraken'} en ruimte over.`
        )

        // In dezelfde plaats werken scheelt reistijd; dat is het enige
        // locatiesignaal dat we zonder routeservice betrouwbaar hebben.
        if (opties.plaats) {
          const zelfdePlaats = opDeze.some((a) =>
            (a.adres || '').toLowerCase().includes(opties.plaats!.toLowerCase())
          )
          if (zelfdePlaats) {
            motivatie.push(`Werkt die dag al in ${opties.plaats}, dus weinig extra reistijd.`)
          }
        }

        motivatie.push(`Ingeschatte duur: ${duur} uur.`)

        voorstellen.push({
          datum: datumSleutel,
          starttijd: urenNaarTijd(startUur),
          eindtijd: urenNaarTijd(eindUur),
          medewerker: monteur,
          motivatie,
        })
        break // per monteur per dag één voorstel; anders vult de lijst zich met varianten
      }
    }
  }

  // Voorstellen waarbij de monteur al in de buurt werkt eerst, daarna op datum.
  return voorstellen
    .sort((a, b) => {
      const aBuurt = a.motivatie.some((m) => m.includes('weinig extra reistijd')) ? 1 : 0
      const bBuurt = b.motivatie.some((m) => m.includes('weinig extra reistijd')) ? 1 : 0
      if (aBuurt !== bBuurt) return bBuurt - aBuurt
      return a.datum.localeCompare(b.datum) || a.starttijd.localeCompare(b.starttijd)
    })
    .slice(0, gewenstAantal)
}
