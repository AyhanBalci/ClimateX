/**
 * Prijsopbouw van een product.
 *
 * Een product heeft een verkoopprijs en losse installatiekosten. Offertes en de
 * catalogus tonen die soms apart en soms als één bedrag, en beide moeten op
 * hetzelfde totaal uitkomen. Daarom staat de opbouw hier op één plek.
 *
 * Bedragen worden op centen afgerond, zoals ook in factuurActions gebeurt.
 */

/** Wordt gebruikt als een product geen eigen BTW-percentage heeft. */
export const STANDAARD_BTW_PERCENTAGE = 21;

export type PrijsOpbouw = {
  /** Product zonder installatie, exclusief BTW. */
  product: number;
  /** Installatiekosten, exclusief BTW. */
  installatie: number;
  /** Product plus installatie, exclusief BTW. */
  subtotaal: number;
  btwPercentage: number;
  btw: number;
  /** Subtotaal plus BTW. */
  totaal: number;
};

function afrondenOpCenten(waarde: number): number {
  return Math.round(waarde * 100) / 100;
}

function naarBedrag(waarde: number | null | undefined): number {
  if (waarde === null || waarde === undefined) return 0;
  const getal = typeof waarde === "number" ? waarde : Number(waarde);
  // Een onleesbare of negatieve waarde mag het totaal niet stiekem verlagen.
  return Number.isFinite(getal) && getal > 0 ? getal : 0;
}

export function berekenPrijsOpbouw(product: {
  prijs?: number | null;
  installatiekosten?: number | null;
  btw_percentage?: number | null;
}): PrijsOpbouw {
  const productPrijs = naarBedrag(product.prijs);
  const installatie = naarBedrag(product.installatiekosten);
  const subtotaal = afrondenOpCenten(productPrijs + installatie);

  const ruwPercentage = product.btw_percentage;
  const btwPercentage =
    ruwPercentage === null || ruwPercentage === undefined || !Number.isFinite(Number(ruwPercentage))
      ? STANDAARD_BTW_PERCENTAGE
      : Number(ruwPercentage);

  const btw = afrondenOpCenten((subtotaal * btwPercentage) / 100);

  return {
    product: afrondenOpCenten(productPrijs),
    installatie: afrondenOpCenten(installatie),
    subtotaal,
    btwPercentage,
    btw,
    totaal: afrondenOpCenten(subtotaal + btw),
  };
}

/**
 * Brutomarge op de verkoopprijs, in procenten. Geeft null als er geen
 * inkoopprijs bekend is, zodat het scherm een streepje kan tonen in plaats van
 * een misleidende 100%.
 */
export function berekenMarge(product: {
  prijs?: number | null;
  inkoopprijs?: number | null;
}): number | null {
  const verkoop = naarBedrag(product.prijs);
  const inkoop = naarBedrag(product.inkoopprijs);
  if (inkoop <= 0 || verkoop <= 0) return null;
  return Math.round(((verkoop - inkoop) / verkoop) * 1000) / 10;
}
