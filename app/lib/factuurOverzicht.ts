/**
 * Overzichten en export over facturen.
 *
 * De BTW-opstelling en de export moeten precies dezelfde bedragen tonen als de
 * facturen zelf. Daarom leest alles hier uit de opgeslagen velden `bedrag`,
 * `btw` en `totaal` en wordt de BTW nergens opnieuw uitgerekend: een factuur
 * die ooit met een ander tarief is gemaakt, moet in het overzicht blijven
 * kloppen met wat de klant heeft ontvangen.
 */

import type { Factuur } from "./types";

/** Standaardtermijn als een factuur geen eigen vervaldatum heeft. */
export const STANDAARD_BETAALTERMIJN_DAGEN = 14;

function naarDatum(waarde: string | null | undefined): Date | null {
  if (!waarde) return null;
  const datum = new Date(waarde);
  return Number.isNaN(datum.getTime()) ? null : datum;
}

/**
 * De uiterste betaaldatum. Staat die niet op de factuur, dan geldt de
 * standaardtermijn gerekend vanaf de aanmaakdatum.
 */
export function vervaldatumVan(factuur: Factuur): Date | null {
  const eigen = naarDatum(factuur.vervaldatum);
  if (eigen) return eigen;

  const aangemaakt = naarDatum(factuur.created_at);
  if (!aangemaakt) return null;

  const afgeleid = new Date(aangemaakt);
  afgeleid.setDate(afgeleid.getDate() + STANDAARD_BETAALTERMIJN_DAGEN);
  return afgeleid;
}

/**
 * Een factuur is achterstallig zodra de termijn voorbij is en er nog niet
 * betaald is. Een betaalde factuur is nooit achterstallig, ook niet als die te
 * laat betaald werd: dan is er niets meer op te volgen.
 */
export function isAchterstallig(factuur: Factuur, nu: Date = new Date()): boolean {
  if (factuur.status === "Betaald") return false;
  // Een concept ligt nog niet bij de klant, dus daar loopt geen termijn op.
  if (factuur.status === "Concept") return false;

  const vervalt = vervaldatumVan(factuur);
  if (!vervalt) return false;
  return vervalt.getTime() < nu.getTime();
}

/** Aantal dagen dat een factuur over de termijn is. Nul als die nog loopt. */
export function dagenTeLaat(factuur: Factuur, nu: Date = new Date()): number {
  if (!isAchterstallig(factuur, nu)) return 0;
  const vervalt = vervaldatumVan(factuur);
  if (!vervalt) return 0;
  const milliseconden = nu.getTime() - vervalt.getTime();
  return Math.floor(milliseconden / (1000 * 60 * 60 * 24));
}

export type BtwPeriode = {
  /** Bijvoorbeeld "2026 Q3". */
  label: string;
  jaar: number;
  kwartaal: number;
  /** Omzet exclusief BTW. */
  bedrag: number;
  btw: number;
  totaal: number;
  aantal: number;
};

/**
 * BTW-opstelling per kwartaal over de betaalde facturen, nieuwste eerst.
 *
 * Alleen betaalde facturen tellen mee, geteld op betaaldatum. Dat sluit aan op
 * hoe de omzet elders in het dashboard gedefinieerd is.
 */
export function berekenBtwOverzicht(facturen: Factuur[]): BtwPeriode[] {
  const perPeriode = new Map<string, BtwPeriode>();

  facturen.forEach((factuur) => {
    if (factuur.status !== "Betaald") return;
    const betaald = naarDatum(factuur.betaaldatum);
    if (!betaald) return;

    const jaar = betaald.getFullYear();
    const kwartaal = Math.floor(betaald.getMonth() / 3) + 1;
    const sleutel = `${jaar}-${kwartaal}`;

    const bestaand = perPeriode.get(sleutel) || {
      label: `${jaar} Q${kwartaal}`,
      jaar,
      kwartaal,
      bedrag: 0,
      btw: 0,
      totaal: 0,
      aantal: 0,
    };

    bestaand.bedrag += factuur.bedrag || 0;
    bestaand.btw += factuur.btw || 0;
    bestaand.totaal += factuur.totaal || 0;
    bestaand.aantal += 1;

    perPeriode.set(sleutel, bestaand);
  });

  return Array.from(perPeriode.values())
    .map((periode) => ({
      ...periode,
      bedrag: Math.round(periode.bedrag * 100) / 100,
      btw: Math.round(periode.btw * 100) / 100,
      totaal: Math.round(periode.totaal * 100) / 100,
    }))
    .sort((a, b) => b.jaar - a.jaar || b.kwartaal - a.kwartaal);
}

/** Zet een waarde veilig in een CSV-veld. */
function csvVeld(waarde: string | number | null | undefined): string {
  if (waarde === null || waarde === undefined) return "";
  const tekst = String(waarde);
  // Puntkomma, aanhalingsteken en regeleinde breken anders de kolomindeling.
  if (/[";\n\r]/.test(tekst)) {
    return `"${tekst.replace(/"/g, '""')}"`;
  }
  return tekst;
}

/** Bedrag met komma als decimaalteken, zoals Nederlandse boekhoudpakketten verwachten. */
function csvBedrag(waarde: number | null | undefined): string {
  if (waarde === null || waarde === undefined || Number.isNaN(waarde)) return "";
  return waarde.toFixed(2).replace(".", ",");
}

function csvDatum(waarde: string | null | undefined): string {
  const datum = naarDatum(waarde);
  if (!datum) return "";
  const jaar = datum.getFullYear();
  const maand = String(datum.getMonth() + 1).padStart(2, "0");
  const dag = String(datum.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

export const CSV_KOPPEN = [
  "Factuurnummer",
  "Klant",
  "Factuurdatum",
  "Vervaldatum",
  "Bedrag excl. BTW",
  "BTW",
  "Totaal incl. BTW",
  "Status",
  "Betaaldatum",
];

/**
 * Facturen als CSV met puntkomma als scheidingsteken, want dat is wat Excel in
 * een Nederlandse regio-instelling zonder gedoe opent.
 */
export function maakFacturenCsv(facturen: Factuur[]): string {
  const regels = facturen.map((factuur) =>
    [
      csvVeld(factuur.factuurnummer),
      csvVeld(factuur.klant),
      csvVeld(csvDatum(factuur.created_at)),
      csvVeld(csvDatum(vervaldatumVan(factuur)?.toISOString() ?? null)),
      csvVeld(csvBedrag(factuur.bedrag)),
      csvVeld(csvBedrag(factuur.btw)),
      csvVeld(csvBedrag(factuur.totaal)),
      csvVeld(factuur.status),
      csvVeld(csvDatum(factuur.betaaldatum)),
    ].join(";")
  );

  return [CSV_KOPPEN.join(";"), ...regels].join("\r\n");
}
