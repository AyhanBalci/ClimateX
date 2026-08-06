import { OFFERTE_GELDIGHEID_DAGEN } from "./constants";

/**
 * Gedeelde statuslogica voor offertes, zodat het CRM en het klantenportaal
 * nooit een andere staat tonen voor dezelfde offerte.
 *
 * "Verlopen" is bewust géén waarde in de database. De geldigheidsdatum volgt
 * rechtstreeks uit de offertedatum, dus die staat afleiden is altijd actueel;
 * hem opslaan zou een achtergrondtaak vereisen die statussen bijwerkt en kan
 * verouderen zodra die taak een keer niet draait.
 */
export type OfferteStatusWeergave = {
  /** Statuswaarde zoals die in de database staat. */
  ruw: string;
  /** Label voor beheerders in het CRM. */
  label: string;
  /** Label voor de klant in het portaal, in klanttaal. */
  klantLabel: string;
  /** Waar of de geldigheidstermijn is verstreken zonder besluit van de klant. */
  verlopen: boolean;
};

export function geldigTot(offerteDatum: string | Date): Date {
  const datum = offerteDatum instanceof Date ? new Date(offerteDatum) : new Date(offerteDatum);
  datum.setDate(datum.getDate() + OFFERTE_GELDIGHEID_DAGEN);
  return datum;
}

/**
 * Een offerte is verlopen zodra de geldigheidstermijn voorbij is terwijl er nog
 * geen besluit is genomen. Een geaccepteerde of afgewezen offerte verloopt niet:
 * daar is de uitkomst al bekend.
 */
export function isVerlopen(status: string, offerteDatum: string | Date, nu: Date = new Date()): boolean {
  if (status !== "Verstuurd") return false;
  return geldigTot(offerteDatum).getTime() < nu.getTime();
}

const BEHEER_LABELS: Record<string, string> = {
  Concept: "Concept",
  Verstuurd: "Verstuurd",
  Geaccepteerd: "Geaccepteerd",
  Afgewezen: "Afgewezen",
};

const KLANT_LABELS: Record<string, string> = {
  Concept: "Wordt voorbereid",
  Verstuurd: "Wacht op uw akkoord",
  Geaccepteerd: "Akkoord gegeven",
  Afgewezen: "Afgewezen",
};

export function offerteStatusWeergave(
  status: string,
  offerteDatum: string | Date,
  nu: Date = new Date()
): OfferteStatusWeergave {
  const verlopen = isVerlopen(status, offerteDatum, nu);

  return {
    ruw: status,
    label: verlopen ? "Verlopen" : BEHEER_LABELS[status] ?? status,
    klantLabel: verlopen ? "Geldigheid verstreken" : KLANT_LABELS[status] ?? status,
    verlopen,
  };
}
