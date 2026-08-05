/**
 * Gedeelde opmaak voor bedragen en datums.
 *
 * Deze logica stond eerder als losse kopie in ruim twintig componenten, wat het
 * risico gaf dat schermen hetzelfde gegeven verschillend tonen. Gebruik altijd
 * een van onderstaande functies in plaats van een eigen Intl-aanroep.
 *
 * Bedragen kennen twee vormen, en dat onderscheid is bewust:
 * - `formatBedrag` toont centen en hoort bij financiële documenten (facturen)
 *   waar het exacte bedrag telt.
 * - `formatBedragRond` laat centen weg en hoort bij offertes, prijsindicaties en
 *   KPI's, waar afronding rustiger leest.
 */

const BEDRAG_MET_CENTEN = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

const BEDRAG_AFGEROND = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Bedrag inclusief centen, bijvoorbeeld "€ 1.295,00". */
export function formatBedrag(waarde: number | null | undefined): string {
  if (waarde === null || waarde === undefined || Number.isNaN(waarde)) return "—";
  return BEDRAG_MET_CENTEN.format(waarde);
}

/** Bedrag zonder centen, bijvoorbeeld "€ 1.295". */
export function formatBedragRond(waarde: number | null | undefined): string {
  if (waarde === null || waarde === undefined || Number.isNaN(waarde)) return "—";
  return BEDRAG_AFGEROND.format(waarde);
}

function naarDatum(waarde: string | Date | null | undefined): Date | null {
  if (!waarde) return null;
  const datum = waarde instanceof Date ? waarde : new Date(waarde);
  return Number.isNaN(datum.getTime()) ? null : datum;
}

/** Datum als "5-8-2026". Geeft "—" bij een ontbrekende of ongeldige waarde. */
export function formatDatum(waarde: string | Date | null | undefined): string {
  const datum = naarDatum(waarde);
  return datum ? datum.toLocaleDateString("nl-NL") : "—";
}

/** Datum en tijd als "05-08-2026 14:30". */
export function formatDatumTijd(waarde: string | Date | null | undefined): string {
  const datum = naarDatum(waarde);
  return datum ? datum.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" }) : "—";
}

/** Datum met een losse tijdstring, zoals bij planningen ("05-08-2026 09:00"). */
export function formatDatumMetTijd(datum: string | Date | null | undefined, tijd: string | null | undefined): string {
  const d = formatDatum(datum);
  if (d === "—") return "—";
  return tijd ? `${d} ${tijd.slice(0, 5)}` : d;
}
