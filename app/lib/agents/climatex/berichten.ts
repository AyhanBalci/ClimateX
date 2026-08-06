/**
 * ClimateX CRM Agent — e-mail- en WhatsApp-concepten
 *
 * Dit is de enige module waar een taalmodel iets te zeggen heeft, en zelfs
 * daar alleen over de formulering. De feiten — bedragen, namen, data,
 * offertenummers — worden hier ingevuld en staan al vast voordat het model
 * iets ziet. Levert het model niets op, dan wordt het sjabloon gebruikt en
 * gaat er precies dezelfde informatie de deur uit, alleen wat stijver
 * geformuleerd.
 *
 * Niets wordt verstuurd. Elk concept komt in het scherm te staan met de
 * punten die een medewerker nog moet nalopen.
 */

import type { AiProvider } from './aiProvider'
import { SYSTEEM_INSTRUCTIE } from './aiProvider'
import type { BerichtConcept, BerichtKanaal } from './types'

/**
 * WhatsApp leest slecht bij lange lappen tekst; boven deze lengte kort de
 * agent het bericht in en verwijst hij naar de e-mail.
 */
const WHATSAPP_MAX_TEKENS = 700

export type BerichtAanleiding =
  | { soort: 'nieuwe-lead'; klantnaam: string; plaats: string }
  | { soort: 'offerte-verstuurd'; klantnaam: string; offertenummer: string; bedrag: string; geldigTot: string }
  | { soort: 'offerte-opvolging'; klantnaam: string; offertenummer: string; dagenGeleden: number }
  | { soort: 'afspraak-bevestiging'; klantnaam: string; datum: string; tijdvak: string; monteur: string }
  | { soort: 'werk-afgerond'; klantnaam: string; werkbonnummer: string }
  | { soort: 'factuur-herinnering'; klantnaam: string; factuurnummer: string; bedrag: string; dagenTeLaat: number }

/**
 * De feitelijke inhoud per aanleiding. Het taalmodel mag deze regels
 * herschrijven, maar krijgt ze als de enige toegestane bron van informatie.
 */
function sjabloon(aanleiding: BerichtAanleiding, kanaal: BerichtKanaal): { onderwerp: string; regels: string[] } {
  const kort = kanaal === 'whatsapp'

  switch (aanleiding.soort) {
    case 'nieuwe-lead':
      return {
        onderwerp: 'Uw aanvraag voor een laadpaal',
        regels: [
          `Beste ${aanleiding.klantnaam},`,
          '',
          `Bedankt voor uw aanvraag voor een laadpaal in ${aanleiding.plaats}.`,
          'Wij nemen binnen één werkdag contact met u op om de situatie door te nemen en een passende offerte op te stellen.',
          'Om de offerte kloppend te maken helpt het als u weet welk type aansluiting uw meterkast heeft en op welke afstand het laadpunt komt.',
        ],
      }

    case 'offerte-verstuurd':
      return {
        onderwerp: `Uw offerte ${aanleiding.offertenummer}`,
        regels: [
          `Beste ${aanleiding.klantnaam},`,
          '',
          `Hierbij ontvangt u offerte ${aanleiding.offertenummer} voor ${aanleiding.bedrag}.`,
          `De offerte is geldig tot ${aanleiding.geldigTot}.`,
          kort
            ? 'De volledige offerte staat in uw e-mail.'
            : 'In de bijlage vindt u de volledige specificatie van het laadstation en de installatie.',
          'Heeft u vragen of wilt u akkoord geven? Laat het ons weten.',
        ],
      }

    case 'offerte-opvolging':
      return {
        onderwerp: `Vraag over offerte ${aanleiding.offertenummer}`,
        regels: [
          `Beste ${aanleiding.klantnaam},`,
          '',
          `${aanleiding.dagenGeleden} dagen geleden stuurden wij u offerte ${aanleiding.offertenummer}.`,
          'Wij zijn benieuwd of u er al naar heeft kunnen kijken.',
          'Zijn er punten die nog onduidelijk zijn, of wilt u iets aangepast zien? Dan denken we graag mee.',
        ],
      }

    case 'afspraak-bevestiging':
      return {
        onderwerp: `Bevestiging installatieafspraak ${aanleiding.datum}`,
        regels: [
          `Beste ${aanleiding.klantnaam},`,
          '',
          `Wij bevestigen de afspraak voor de installatie op ${aanleiding.datum} tussen ${aanleiding.tijdvak}.`,
          `${aanleiding.monteur} komt de installatie uitvoeren.`,
          'Wilt u ervoor zorgen dat de meterkast en de plek van het laadpunt vrij toegankelijk zijn?',
          'Komt het onverhoopt niet uit, laat het ons dan tijdig weten.',
        ],
      }

    case 'werk-afgerond':
      return {
        onderwerp: `Werkbon ${aanleiding.werkbonnummer}`,
        regels: [
          `Beste ${aanleiding.klantnaam},`,
          '',
          'De installatie is afgerond en het laadstation is getest en in bedrijf gesteld.',
          `De werkbon met nummer ${aanleiding.werkbonnummer} vindt u in de bijlage.`,
          'Heeft u nog vragen over het gebruik? Neem gerust contact met ons op.',
        ],
      }

    case 'factuur-herinnering':
      return {
        onderwerp: `Herinnering factuur ${aanleiding.factuurnummer}`,
        regels: [
          `Beste ${aanleiding.klantnaam},`,
          '',
          `Onze administratie laat zien dat factuur ${aanleiding.factuurnummer} van ${aanleiding.bedrag} nog openstaat.`,
          `De betaaltermijn is ${aanleiding.dagenTeLaat} ${aanleiding.dagenTeLaat === 1 ? 'dag' : 'dagen'} verstreken.`,
          'Heeft u de betaling inmiddels gedaan, dan kunt u deze bericht als niet verzonden beschouwen.',
          'Klopt er iets niet aan de factuur? Laat het ons weten, dan zoeken we het samen uit.',
        ],
      }
  }
}

/** Punten die een medewerker sowieso moet nalopen, per aanleiding. */
function controlepunten(aanleiding: BerichtAanleiding, kanaal: BerichtKanaal): string[] {
  const punten: string[] = []

  if (kanaal === 'whatsapp') {
    punten.push('Controleer of de klant toestemming heeft gegeven voor WhatsApp-contact.')
  }

  switch (aanleiding.soort) {
    case 'offerte-verstuurd':
      punten.push('Controleer of de PDF daadwerkelijk als bijlage meegaat.')
      break
    case 'afspraak-bevestiging':
      punten.push('Controleer datum, tijdvak en monteur tegen de agenda.')
      break
    case 'factuur-herinnering':
      punten.push('Controleer of de betaling niet net binnengekomen is.')
      break
    case 'offerte-opvolging':
      punten.push('Kijk of de offerte inmiddels is geaccepteerd of afgewezen.')
      break
    default:
      break
  }

  return punten
}

function voegAfsluitingToe(regels: string[]): string {
  return [...regels, '', 'Met vriendelijke groet,', 'ClimateX'].join('\n')
}

/**
 * Verkort een bericht voor WhatsApp zonder informatie weg te laten die de
 * klant nodig heeft: er blijft altijd een verwijzing naar de e-mail staan.
 */
function pasAanVoorWhatsapp(tekst: string): string {
  if (tekst.length <= WHATSAPP_MAX_TEKENS) return tekst
  const afgekapt = tekst.slice(0, WHATSAPP_MAX_TEKENS).split('\n').slice(0, -1).join('\n')
  return `${afgekapt}\n\nDe volledige toelichting hebben wij u per e-mail gestuurd.\n\nMet vriendelijke groet,\nClimateX`
}

/**
 * Bouwt een concept. Is er een taalmodel gekoppeld, dan mag dat de formulering
 * verzorgen op basis van uitsluitend de sjabloonregels; anders wordt het
 * sjabloon zelf gebruikt.
 */
export async function maakBerichtConcept(
  aanleiding: BerichtAanleiding,
  kanaal: BerichtKanaal,
  ontvanger: { naam: string; adres: string },
  provider: AiProvider
): Promise<BerichtConcept> {
  const { onderwerp, regels } = sjabloon(aanleiding, kanaal)
  const sjabloontekst = voegAfsluitingToe(regels)

  let tekst = sjabloontekst

  if (provider.isTaalmodel) {
    const opdracht = [
      kanaal === 'whatsapp'
        ? 'Herschrijf onderstaande punten tot één kort WhatsApp-bericht. Maximaal 6 zinnen, geen opmaakkoppen.'
        : 'Herschrijf onderstaande punten tot een lopende e-mail.',
      '',
      'Je mag de formulering en volgorde verbeteren, maar voeg NIETS toe:',
      'geen bedragen, geen datums, geen termijnen, geen toezeggingen die er niet staan.',
      '',
      'Punten:',
      ...regels.filter((r) => r.trim()).map((r) => `- ${r}`),
    ].join('\n')

    const gegenereerd = await provider.genereerTekst([
      { rol: 'systeem', inhoud: SYSTEEM_INSTRUCTIE },
      { rol: 'gebruiker', inhoud: opdracht },
    ])

    // Het model kan uitvallen of niets bruikbaars teruggeven. Het sjabloon is
    // dan geen noodgreep maar een volwaardig alternatief met dezelfde inhoud.
    if (gegenereerd) tekst = gegenereerd
  }

  if (kanaal === 'whatsapp') tekst = pasAanVoorWhatsapp(tekst)

  const punten = controlepunten(aanleiding, kanaal)
  if (provider.isTaalmodel) {
    punten.unshift(`Tekst is geformuleerd door ${provider.naam}; lees hem na voor verzending.`)
  }
  if (!ontvanger.adres) {
    punten.unshift(kanaal === 'email' ? 'Geen e-mailadres bekend.' : 'Geen telefoonnummer bekend.')
  }

  return {
    kanaal,
    onderwerp: kanaal === 'email' ? onderwerp : undefined,
    tekst,
    ontvanger,
    invulpunten: punten,
  }
}

/**
 * Bouwt hetzelfde bericht voor beide kanalen, zodat een medewerker kan kiezen
 * of hij mailt of appt zonder er twee keer om te hoeven vragen.
 */
export async function maakBerichtenVoorBeideKanalen(
  aanleiding: BerichtAanleiding,
  ontvanger: { naam: string; email: string; telefoon: string },
  provider: AiProvider
): Promise<{ email: BerichtConcept; whatsapp: BerichtConcept }> {
  const [email, whatsapp] = await Promise.all([
    maakBerichtConcept(aanleiding, 'email', { naam: ontvanger.naam, adres: ontvanger.email }, provider),
    maakBerichtConcept(aanleiding, 'whatsapp', { naam: ontvanger.naam, adres: ontvanger.telefoon }, provider),
  ])
  return { email, whatsapp }
}
