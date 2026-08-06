/**
 * Agendakoppeling — Google Calendar
 *
 * ACTIVEREN
 * ─────────
 * De Google Calendar API kan niet vanuit de browser worden aangeroepen: dat
 * vereist een OAuth-token dat nooit client-side mag staan. De koppeling loopt
 * daarom via een route handler op de server.
 *
 * 1. Maak een project in Google Cloud Console en zet de Calendar API aan.
 * 2. Maak een serviceaccount aan en deel de ClimateX-agenda met het
 *    e-mailadres van dat account (rechten: "Wijzigingen aanbrengen").
 *    Een serviceaccount heeft de voorkeur boven OAuth per gebruiker: de
 *    agenda hoort bij het bedrijf, niet bij één medewerker, en er is dan geen
 *    refresh token dat kan verlopen als iemand uit dienst gaat.
 * 3. Zet in de omgeving:
 *      GOOGLE_CALENDAR_ID=...            (het agenda-id, vaak een e-mailadres)
 *      GOOGLE_SERVICE_ACCOUNT_EMAIL=...
 *      GOOGLE_SERVICE_ACCOUNT_KEY=...    (de private key, met \n als echte newlines)
 * 4. Vervang `plaatsAfspraak` hieronder door een aanroep naar
 *    POST https://www.googleapis.com/calendar/v3/calendars/{id}/events
 *    met een JWT die je met de serviceaccount-sleutel ondertekent.
 *
 * De planningsmodule blijft ongewijzigd: die levert datum, tijd en monteur, en
 * hoeft niet te weten waar dat terechtkomt.
 */

import type { Koppeling, KoppelingResultaat } from './index'

export interface AgendaAfspraak {
  titel: string
  omschrijving: string
  /** ISO-datum, bijvoorbeeld 2026-08-12. */
  datum: string
  starttijd: string
  eindtijd: string
  /** E-mailadres van de monteur, als die in de agenda uitgenodigd moet worden. */
  monteurEmail?: string
  locatie?: string
}

export interface AgendaKoppeling extends Koppeling {
  plaatsAfspraak(afspraak: AgendaAfspraak): Promise<KoppelingResultaat>
}

const ACTIVATIESTAPPEN = [
  'Zet de Google Calendar API aan in Google Cloud Console.',
  'Maak een serviceaccount en deel de ClimateX-agenda met dat e-mailadres.',
  'Zet GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL en GOOGLE_SERVICE_ACCOUNT_KEY in de omgeving.',
]

function isGeconfigureerd(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  )
}

/**
 * Geeft de agendakoppeling. Zolang de sleutels ontbreken levert die een
 * resultaat op dat de planner vertelt wat hij met de hand moet doen.
 */
export function maakAgendaKoppeling(): AgendaKoppeling {
  const geconfigureerd = isGeconfigureerd()

  return {
    naam: 'Google Calendar',
    isGeconfigureerd: geconfigureerd,
    activatiestappen: ACTIVATIESTAPPEN,

    async plaatsAfspraak(afspraak) {
      if (!geconfigureerd) {
        return {
          gelukt: false,
          melding: 'Google Calendar is niet gekoppeld.',
          handmatigeStap: `Zet de afspraak "${afspraak.titel}" op ${afspraak.datum} van ${afspraak.starttijd} tot ${afspraak.eindtijd} zelf in de agenda.`,
        }
      }

      // Zie de stappen bovenaan dit bestand; hier komt de aanroep naar de
      // Calendar API. Tot die tijd melden we eerlijk dat er niets gebeurd is,
      // in plaats van te doen alsof de afspraak geplaatst is.
      return {
        gelukt: false,
        melding: 'De agendakoppeling is geconfigureerd maar nog niet geïmplementeerd.',
        handmatigeStap: 'Plaats de afspraak voorlopig met de hand in Google Calendar.',
      }
    },
  }
}
