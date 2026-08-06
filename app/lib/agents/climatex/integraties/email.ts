/**
 * E-mailkoppeling
 *
 * Dit project verstuurt al e-mail via Resend (zie app/lib/resend.ts). Die weg
 * blijft de standaard: het afzenderdomein is geverifieerd en de bestaande
 * offerte-, werkbon- en herinneringsmails lopen er al overheen.
 *
 * GMAIL ALS ALTERNATIEF
 * ─────────────────────
 * Gmail is interessant zodra berichten in de verzonden items van het
 * bedrijfsaccount moeten staan, zodat collega's de correspondentie terugzien.
 *
 * 1. Zet de Gmail API aan in Google Cloud Console.
 * 2. Gebruik een serviceaccount met domain-wide delegation, of OAuth voor het
 *    bedrijfsaccount met scope gmail.send.
 * 3. Zet GMAIL_AFZENDER en de bijbehorende sleutels in de omgeving.
 * 4. Implementeer `verstuur` hieronder met
 *    POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
 *    en een RFC 2822-bericht in base64url.
 *
 * Let op: de agent levert concepten. Of een concept daadwerkelijk verstuurd
 * wordt, is altijd een handeling van een medewerker. Deze koppeling verstuurt
 * dus nooit iets uit zichzelf.
 */

import type { Koppeling, KoppelingResultaat } from './index'

export interface EmailBericht {
  aan: string
  onderwerp: string
  tekst: string
  /** Optionele bijlage, bijvoorbeeld een offerte- of werkbon-PDF. */
  bijlage?: { bestandsnaam: string; inhoud: Buffer }
}

export interface EmailKoppeling extends Koppeling {
  verstuur(bericht: EmailBericht): Promise<KoppelingResultaat>
}

const ACTIVATIESTAPPEN = [
  'Standaard loopt e-mail via Resend; zet daarvoor RESEND_API_KEY.',
  'Wil je Gmail gebruiken: zet de Gmail API aan en configureer GMAIL_AFZENDER.',
]

export function maakEmailKoppeling(): EmailKoppeling {
  const viaResend = Boolean(process.env.RESEND_API_KEY)
  const viaGmail = Boolean(process.env.GMAIL_AFZENDER)

  return {
    naam: viaGmail ? 'Gmail' : 'Resend',
    isGeconfigureerd: viaResend || viaGmail,
    activatiestappen: ACTIVATIESTAPPEN,

    async verstuur(bericht) {
      if (!viaResend && !viaGmail) {
        return {
          gelukt: false,
          melding: 'Er is geen e-mailkoppeling geconfigureerd.',
          handmatigeStap: `Verstuur het bericht "${bericht.onderwerp}" zelf naar ${bericht.aan}.`,
        }
      }

      // De bestaande verzendfuncties in app/lib/ (sendOffertePdfEmail,
      // sendWerkbonPdfEmail) doen dit al voor hun eigen soort bericht. Deze
      // koppeling is bedoeld voor de vrije berichten die de agent opstelt en
      // wordt geïmplementeerd zodra er een scherm is dat ze verstuurt.
      return {
        gelukt: false,
        melding: 'De vrije e-mailkoppeling is nog niet geïmplementeerd.',
        handmatigeStap: 'Kopieer het concept naar uw mailprogramma en verstuur het daar.',
      }
    },
  }
}
