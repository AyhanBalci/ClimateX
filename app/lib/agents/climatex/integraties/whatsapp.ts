/**
 * WhatsApp-koppeling — WhatsApp Business Platform (Meta Cloud API)
 *
 * ACTIVEREN
 * ─────────
 * 1. Maak een Meta Business-account en een WhatsApp Business-app.
 * 2. Koppel een telefoonnummer en noteer het phone number ID.
 * 3. Zet in de omgeving:
 *      WHATSAPP_PHONE_NUMBER_ID=...
 *      WHATSAPP_ACCESS_TOKEN=...        (permanent token van een systeemgebruiker)
 * 4. Implementeer `verstuur` met
 *    POST https://graph.facebook.com/v21.0/{phone-number-id}/messages
 *
 * TWEE REGELS DIE HET ONTWERP BEPALEN
 * ───────────────────────────────────
 * 1. Buiten een lopend gesprek mag je alleen een vooraf goedgekeurd sjabloon
 *    sturen. Vrije tekst kan uitsluitend binnen 24 uur na een bericht van de
 *    klant. Daarom draagt elk bericht hieronder een `sjabloonNaam`: zonder
 *    goedgekeurd sjabloon weigert Meta de aflevering.
 * 2. De klant moet aantoonbaar toestemming hebben gegeven voor WhatsApp-
 *    contact. Die toestemming vastleggen is geen technische maar een
 *    juridische eis, en hoort in het CRM bij de klant te staan voordat deze
 *    koppeling gebruikt wordt.
 *
 * Zolang dat niet geregeld is blijft het bij een concept dat een medewerker
 * zelf verstuurt vanaf de zakelijke telefoon.
 */

import type { Koppeling, KoppelingResultaat } from './index'

export interface WhatsappBericht {
  /** Telefoonnummer in internationaal formaat, bijvoorbeeld 31612345678. */
  naar: string
  tekst: string
  /** Naam van het bij Meta goedgekeurde sjabloon. */
  sjabloonNaam?: string
  /** Waar of de klant binnen 24 uur zelf een bericht stuurde. */
  binnenGesprek?: boolean
}

export interface WhatsappKoppeling extends Koppeling {
  verstuur(bericht: WhatsappBericht): Promise<KoppelingResultaat>
}

const ACTIVATIESTAPPEN = [
  'Maak een WhatsApp Business-app aan in Meta Business.',
  'Koppel een telefoonnummer en noteer het phone number ID.',
  'Zet WHATSAPP_PHONE_NUMBER_ID en WHATSAPP_ACCESS_TOKEN in de omgeving.',
  'Laat de berichtsjablonen goedkeuren door Meta.',
  'Leg per klant vast dat er toestemming is voor WhatsApp-contact.',
]

/** Meta accepteert alleen internationale nummers zonder plus of spaties. */
export function normaliseerNederlandsNummer(nummer: string): string | null {
  const cijfers = nummer.replace(/[^\d+]/g, '')
  if (cijfers.startsWith('+31')) return cijfers.slice(1)
  if (cijfers.startsWith('31') && cijfers.length >= 11) return cijfers
  if (cijfers.startsWith('06') && cijfers.length === 10) return `31${cijfers.slice(1)}`
  if (cijfers.startsWith('0') && cijfers.length === 10) return `31${cijfers.slice(1)}`
  return null
}

export function maakWhatsappKoppeling(): WhatsappKoppeling {
  const geconfigureerd = Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN
  )

  return {
    naam: 'WhatsApp Business',
    isGeconfigureerd: geconfigureerd,
    activatiestappen: ACTIVATIESTAPPEN,

    async verstuur(bericht) {
      const nummer = normaliseerNederlandsNummer(bericht.naar)

      if (!nummer) {
        return {
          gelukt: false,
          melding: `"${bericht.naar}" is geen bruikbaar telefoonnummer.`,
          handmatigeStap: 'Controleer het telefoonnummer bij de klant.',
        }
      }

      if (!geconfigureerd) {
        return {
          gelukt: false,
          melding: 'WhatsApp Business is niet gekoppeld.',
          handmatigeStap: `Stuur het bericht zelf naar ${bericht.naar} vanaf de zakelijke telefoon.`,
        }
      }

      // Zonder goedgekeurd sjabloon en buiten een lopend gesprek weigert Meta
      // de aflevering. Dat hier tegenhouden scheelt een mislukte verzending
      // die pas achteraf opvalt.
      if (!bericht.binnenGesprek && !bericht.sjabloonNaam) {
        return {
          gelukt: false,
          melding: 'Buiten een lopend gesprek is een door Meta goedgekeurd sjabloon verplicht.',
          handmatigeStap: 'Kies een goedgekeurd sjabloon of wacht tot de klant zelf reageert.',
        }
      }

      return {
        gelukt: false,
        melding: 'De WhatsApp-koppeling is geconfigureerd maar nog niet geïmplementeerd.',
        handmatigeStap: 'Stuur het bericht voorlopig met de hand.',
      }
    },
  }
}
