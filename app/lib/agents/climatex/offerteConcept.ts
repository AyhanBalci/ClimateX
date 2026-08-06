/**
 * ClimateX CRM Agent — conceptoffertes
 *
 * Kiest uit de eigen productcatalogus het laadstation dat bij de situatie van
 * de klant past, en bouwt daar een prijsopbouw omheen.
 *
 * Het uitgangspunt is dat de agent nooit een prijs verzint. Elk bedrag komt uit
 * de producttabel of uit `berekenPrijsOpbouw`, dezelfde functie die het
 * productscherm gebruikt. Wat de agent wél doet, is kiezen en motiveren — en
 * eerlijk zijn over wat hij niet weet, via `aannames`.
 */

import type { Lead, Product } from '@/lib/types'
import { berekenPrijsOpbouw, STANDAARD_BTW_PERCENTAGE } from '@/lib/productPrijzen'
import type { OfferteConcept } from './types'

/** Meerprijs per meter kabel boven de standaardlengte, excl. btw. */
const KABEL_PRIJS_PER_METER = 12.5

/** Lengte die in de standaard installatiekosten zit inbegrepen. */
const INBEGREPEN_KABELMETERS = 10

/**
 * Een laadpaal van 11 kW vraagt een 3-fase aansluiting. Heeft de klant die
 * niet, dan is een 1-fase model van 3,7 kW de eerlijke keuze: een zwaarder
 * station zou zonder verzwaring toch niet sneller laden.
 */
function pastBijAansluiting(product: Product, aansluiting: string | null | undefined): boolean {
  const vermogen = (product.koelvermogen || '').toLowerCase()
  const isZwaar = /11\s*kw|22\s*kw/.test(vermogen)
  if (aansluiting === '1-fase' && isZwaar) return false
  return true
}

function isZakelijk(lead: Lead): boolean {
  return ['Kantoorruimte', 'Winkelruimte', 'Bent u aannemer?'].includes(lead.type_woning)
}

/**
 * Kiest het passende product. Er wordt niet op de duurste maar op de meest
 * passende gemikt: een te zwaar station dat de aansluiting niet aankan levert
 * een ontevreden klant en een discussie over meerwerk op.
 */
function kiesProduct(lead: Lead, producten: Product[]): { product: Product | null; motivatie: string[] } {
  const motivatie: string[] = []
  const bruikbaar = producten.filter((p) => p.actief && pastBijAansluiting(p, lead.aansluiting))

  if (bruikbaar.length === 0) {
    return { product: null, motivatie: ['Geen actief product in de catalogus dat bij deze aansluiting past.'] }
  }

  const geschiktVoor = isZakelijk(lead) ? 'zakelijk' : 'thuis'
  const opDoelgroep = bruikbaar.filter((p) => (p.energieklasse || '').toLowerCase().includes(geschiktVoor))
  const kandidaten = opDoelgroep.length > 0 ? opDoelgroep : bruikbaar

  if (opDoelgroep.length > 0) {
    motivatie.push(`Geschikt voor ${geschiktVoor}gebruik, passend bij een ${lead.type_woning.toLowerCase()}.`)
  }

  // Load balancing is nodig zodra er meerdere laadpunten komen of de klant er
  // expliciet om vraagt; anders kan de meterkast overbelast raken.
  const wilBalancing = Boolean(lead.load_balancing || lead.dynamic_load_balancing || (lead.aantal_laadpunten ?? 0) > 1)
  const metBalancing = kandidaten.filter((p) => /load ?balanc/i.test(p.verwarmvermogen || ''))
  const definitief = wilBalancing && metBalancing.length > 0 ? metBalancing : kandidaten

  if (wilBalancing) {
    motivatie.push(
      metBalancing.length > 0
        ? 'Met load balancing, omdat er meerdere laadpunten komen of de klant daarom vroeg.'
        : 'Let op: er is om load balancing gevraagd, maar geen enkel actief product vermeldt die functie.'
    )
  }

  if (lead.aansluiting === '1-fase') {
    motivatie.push('Model voor 1-fase gekozen; een 11 kW-station zou zonder verzwaring niet sneller laden.')
  } else if (lead.aansluiting === '3-fase') {
    motivatie.push('3-fase aansluiting aanwezig, dus het volle laadvermogen is bruikbaar.')
  }

  // Bij gelijke geschiktheid het voordeligste model: dat is het makkelijkst te
  // verkopen en laat ruimte om desgewenst op te waarderen.
  const gekozen = [...definitief].sort((a, b) => (a.prijs || 0) - (b.prijs || 0))[0]
  motivatie.push(`Voordeligste passende model uit ${definitief.length} kandidaten.`)

  return { product: gekozen, motivatie }
}

function beschrijfWerkzaamheden(lead: Lead, extraMeters: number): string {
  const regels = [
    'Leveren en installeren van het laadstation.',
    'Aansluiten op de meterkast met een eigen groep en aardlekbeveiliging.',
  ]

  const meters = lead.kabellengte_meters ?? lead.afstand_meterkast_meters
  regels.push(
    typeof meters === 'number'
      ? `Kabeltraject van circa ${meters} meter van meterkast naar laadpunt.`
      : 'Kabeltraject van meterkast naar laadpunt (lengte nog op te meten).'
  )

  if (extraMeters > 0) {
    regels.push(`Meerprijs voor ${extraMeters} meter kabel boven de inbegrepen ${INBEGREPEN_KABELMETERS} meter.`)
  }

  if (lead.load_balancing || lead.dynamic_load_balancing) {
    regels.push('Instellen van load balancing zodat de meterkast niet overbelast raakt.')
  }

  regels.push('Testen, in bedrijf stellen en uitleg aan de klant.')
  return regels.map((r) => `- ${r}`).join('\n')
}

export function maakOfferteConcept(lead: Lead, producten: Product[]): OfferteConcept {
  const { product, motivatie } = kiesProduct(lead, producten)
  const aannames: string[] = []

  const meters = lead.kabellengte_meters ?? lead.afstand_meterkast_meters
  const extraMeters =
    typeof meters === 'number' && meters > INBEGREPEN_KABELMETERS
      ? Math.ceil(meters - INBEGREPEN_KABELMETERS)
      : 0

  if (typeof meters !== 'number') {
    aannames.push(
      `Kabellengte onbekend. Er is gerekend met de inbegrepen ${INBEGREPEN_KABELMETERS} meter; meet dit op voordat de offerte de deur uit gaat.`
    )
  }

  if (!lead.aansluiting || lead.aansluiting === 'Onbekend') {
    aannames.push('Type aansluiting onbekend. Controleer of de meterkast 1-fase of 3-fase is.')
  }

  if (lead.huidige_meterkast) {
    aannames.push(`Meterkast omschreven als "${lead.huidige_meterkast}". Beoordeel of verzwaring nodig is.`)
  } else {
    aannames.push('Staat van de meterkast onbekend. Vraag een foto op of plan een schouw in.')
  }

  const aantal = Math.max(1, lead.aantal_laadpunten ?? 1)
  if (aantal > 1) {
    aannames.push(`Prijs geldt voor ${aantal} laadpunten; controleer of de aansluiting dat aankan.`)
  }

  const productPrijs = (product?.prijs ?? 0) * aantal
  const basisInstallatie = (product?.installatiekosten ?? 0) * aantal
  const installatiekosten = basisInstallatie + extraMeters * KABEL_PRIJS_PER_METER
  const btwPercentage = product?.btw_percentage ?? STANDAARD_BTW_PERCENTAGE

  const opbouw = berekenPrijsOpbouw({
    prijs: productPrijs,
    installatiekosten,
    btw_percentage: btwPercentage,
  })

  return {
    leadId: lead.id,
    productId: product?.id ?? null,
    merk: product?.merk ?? '',
    model: product?.model ?? '',
    prijs: opbouw.product,
    installatiekosten: opbouw.installatie,
    btwPercentage: opbouw.btwPercentage,
    totaalInclBtw: opbouw.totaal,
    werkzaamheden: beschrijfWerkzaamheden(lead, extraMeters),
    opmerkingen: aantal > 1 ? `Offerte voor ${aantal} laadpunten.` : '',
    productMotivatie: motivatie,
    aannames,
  }
}
