/**
 * Totalen van materiaalregels en urenregistratie op een werkbon.
 *
 * Deze bedragen komen zowel op het scherm, in de PDF als (via de factuur) bij
 * de klant terecht. Ze staan daarom op één plek, zodat die drie het nooit
 * oneens kunnen zijn.
 *
 * Een regel zonder prijs telt bewust niet mee in het bedrag maar wel in de
 * aantallen: materiaal dat uit voorraad komt of garantie-uren staan wel op de
 * werkbon, maar worden niet doorbelast.
 */

import type { WerkbonMateriaal, WerkbonUur } from "./types";

function afrondenOpCenten(waarde: number): number {
  return Math.round(waarde * 100) / 100;
}

function naarGetal(waarde: number | string | null | undefined): number {
  if (waarde === null || waarde === undefined || waarde === "") return 0;
  const getal = typeof waarde === "number" ? waarde : Number(waarde);
  return Number.isFinite(getal) ? getal : 0;
}

export type WerkbonTotalen = {
  /** Aantal materiaalregels. */
  materiaalRegels: number;
  /** Bedrag van de materiaalregels die een prijs hebben, excl. BTW. */
  materiaalBedrag: number;
  /** Alle geregistreerde uren, ook de niet-doorbelaste. */
  totaalUren: number;
  /** Bedrag van de urenregels die een tarief hebben, excl. BTW. */
  arbeidBedrag: number;
  /** Materiaal plus arbeid, excl. BTW. */
  totaalExclBtw: number;
};

export function berekenWerkbonTotalen(
  materialen: WerkbonMateriaal[],
  uren: WerkbonUur[]
): WerkbonTotalen {
  const materiaalBedrag = materialen.reduce((som, regel) => {
    const prijs = regel.eenheidsprijs;
    if (prijs === null || prijs === undefined) return som;
    return som + naarGetal(regel.aantal) * naarGetal(prijs);
  }, 0);

  const totaalUren = uren.reduce((som, regel) => som + naarGetal(regel.uren), 0);

  const arbeidBedrag = uren.reduce((som, regel) => {
    const tarief = regel.uurtarief;
    if (tarief === null || tarief === undefined) return som;
    return som + naarGetal(regel.uren) * naarGetal(tarief);
  }, 0);

  const afgerondMateriaal = afrondenOpCenten(materiaalBedrag);
  const afgerondArbeid = afrondenOpCenten(arbeidBedrag);

  return {
    materiaalRegels: materialen.length,
    materiaalBedrag: afgerondMateriaal,
    totaalUren: Math.round(totaalUren * 100) / 100,
    arbeidBedrag: afgerondArbeid,
    totaalExclBtw: afrondenOpCenten(afgerondMateriaal + afgerondArbeid),
  };
}

/** Uren als "7:30" in plaats van "7,5", zoals op een urenstaat gebruikelijk is. */
export function formatUren(uren: number): string {
  const veilig = Number.isFinite(uren) && uren > 0 ? uren : 0;
  const volleUren = Math.floor(veilig);
  const minuten = Math.round((veilig - volleUren) * 60);
  // Afronden kan op 60 minuten uitkomen; dat hoort een uur erbij te zijn.
  if (minuten === 60) return `${volleUren + 1}:00`;
  return `${volleUren}:${String(minuten).padStart(2, "0")}`;
}
