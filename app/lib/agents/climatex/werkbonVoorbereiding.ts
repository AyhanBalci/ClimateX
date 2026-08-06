/**
 * ClimateX CRM Agent — werkbonnen voorbereiden
 *
 * Zet een geaccepteerde offerte om in een werkbonconcept: welke werkzaamheden,
 * welk materiaal en hoeveel tijd er waarschijnlijk nodig is.
 *
 * De materiaallijst is een startpunt, geen bestelling. De monteur past hem op
 * locatie aan; wat hier staat scheelt hem alleen het opnieuw intypen van de
 * standaardregels. De urenschatting werkt hetzelfde: die dient om de agenda te
 * vullen, niet om af te rekenen.
 */

import type { Lead, Offerte, Vastgoedticket } from '@/lib/types'
import type { WerkbonConcept } from './types'

/** Basisduur van een enkele installatie, in uren. */
const BASISDUUR_UREN = 3

/** Extra tijd per bijkomend laadpunt. */
const EXTRA_UUR_PER_LAADPUNT = 1.5

/** Vanaf deze kabellengte rekenen we extra tijd voor het traject. */
const LANG_TRAJECT_METERS = 20

type Bron = {
  lead?: Lead | null
  offerte?: Offerte | null
  ticket?: Vastgoedticket | null
}

function standaardMaterialen(
  aantalLaadpunten: number,
  kabelmeters: number | null
): WerkbonConcept['materialen'] {
  const regels: WerkbonConcept['materialen'] = [
    { omschrijving: 'Laadstation', aantal: aantalLaadpunten, eenheid: 'stuk' },
    { omschrijving: 'Aardlekautomaat type B', aantal: aantalLaadpunten, eenheid: 'stuk' },
    { omschrijving: 'Montagemateriaal en bevestiging', aantal: aantalLaadpunten, eenheid: 'set' },
  ]

  // Zonder opgemeten lengte zetten we bewust geen aantal neer: een verkeerd
  // getal op de bon is vervelender dan een leeg veld dat opvalt.
  if (kabelmeters !== null) {
    regels.push({ omschrijving: 'Installatiekabel YMVK', aantal: kabelmeters, eenheid: 'meter' })
  }

  regels.push({ omschrijving: 'Kabelgoot of beschermbuis', aantal: kabelmeters ?? 0, eenheid: 'meter' })

  return regels
}

export function maakWerkbonConcept(bron: Bron): WerkbonConcept {
  const { lead, offerte, ticket } = bron

  const aantalLaadpunten = Math.max(1, lead?.aantal_laadpunten ?? 1)
  const kabelmeters = lead?.kabellengte_meters ?? lead?.afstand_meterkast_meters ?? null

  const aandachtspunten: string[] = []

  if (kabelmeters === null) {
    aandachtspunten.push('Kabellengte is niet bekend. Meet die op voordat het materiaal wordt klaargelegd.')
  }

  if (lead?.aansluiting === '1-fase') {
    aandachtspunten.push('1-fase aansluiting: controleer of verzwaring nodig is voor het gekozen vermogen.')
  } else if (!lead?.aansluiting || lead.aansluiting === 'Onbekend') {
    aandachtspunten.push('Type aansluiting onbekend. Controleer de meterkast bij aankomst.')
  }

  if (lead?.huidige_meterkast) {
    aandachtspunten.push(`Meterkast omschreven als "${lead.huidige_meterkast}".`)
  }

  if (lead?.load_balancing || lead?.dynamic_load_balancing) {
    aandachtspunten.push('Load balancing instellen en samen met de klant controleren.')
  }

  if (aantalLaadpunten > 1) {
    aandachtspunten.push(`${aantalLaadpunten} laadpunten: verdeel de belasting over de fasen.`)
  }

  if (ticket?.prioriteit === 'Spoed') {
    aandachtspunten.push('Spoedmelding: neem contact op met de klant voordat je vertrekt.')
  }

  aandachtspunten.push('Laat de klant de werkbon digitaal ondertekenen voordat je vertrekt.')

  // Tijdsinschatting: basis plus opslag voor extra punten en lang traject.
  let uren = BASISDUUR_UREN + (aantalLaadpunten - 1) * EXTRA_UUR_PER_LAADPUNT
  if (kabelmeters !== null && kabelmeters > LANG_TRAJECT_METERS) uren += 1
  if (lead?.aansluiting === '1-fase') uren += 0.5

  const klantnaam = lead?.naam || ticket?.klant || ''
  const adres = [lead?.plaats, ticket?.locatie].filter(Boolean).join(' · ')

  return {
    leadId: lead?.id ?? null,
    offerteId: offerte?.id ?? null,
    ticketId: ticket?.id ?? null,
    klantnaam,
    adres,
    telefoon: lead?.telefoon || ticket?.telefoonnummer || '',
    werkzaamheden:
      offerte?.werkzaamheden ||
      [
        '- Leveren en installeren van het laadstation.',
        '- Aansluiten op de meterkast met een eigen groep en aardlekbeveiliging.',
        '- Testen, in bedrijf stellen en uitleg aan de klant.',
      ].join('\n'),
    materialen: standaardMaterialen(aantalLaadpunten, kabelmeters),
    geschatteUren: Math.round(uren * 4) / 4,
    aandachtspunten,
  }
}
