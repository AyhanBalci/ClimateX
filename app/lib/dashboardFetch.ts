/**
 * Aanroepen naar routes die achter de dashboardsessie zitten.
 *
 * WAAROM DIT BESTAAT
 * ──────────────────
 * Een dashboardsessie is acht uur geldig, maar het dashboard controleerde die
 * alleen bij het laden van de pagina. Bleef een tabblad langer openstaan, dan
 * bleef het scherm gewoon staan terwijl de sessie al verlopen was. Elke actie
 * gaf dan "Niet ingelogd in de beheeromgeving." als losse foutmelding, zonder
 * dat duidelijk werd dát je uitgelogd was of wat je eraan kon doen.
 *
 * Deze helper doet twee dingen:
 * 1. Hij stuurt het sessiecookie expliciet mee. Bij een verzoek naar dezelfde
 *    site doet de browser dat standaard al, maar door het op te schrijven kan
 *    het niet stilzwijgend verdwijnen als er ooit iets aan de opzet verandert.
 * 2. Bij een 401 laat hij de rest van het dashboard weten dat de sessie voorbij
 *    is, zodat er één duidelijke melding komt in plaats van een cryptische fout
 *    per knop.
 *
 * Gebruik dit uitsluitend voor routes die `weigerZonderDashboardSessie` draaien.
 * `/api/portal/invite` hoort er nadrukkelijk NIET bij: die geeft 401 bij een
 * verkeerd portaalwachtwoord, en een typefout daar mag je niet uit het
 * dashboard gooien.
 */

/** Wordt op `window` afgevuurd zodra een beveiligde route 401 teruggeeft. */
export const SESSIE_VERLOPEN_EVENT = "climatex:sessie-verlopen";

export async function dashboardFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const respons = await fetch(url, { ...init, credentials: "same-origin" });

  if (respons.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSIE_VERLOPEN_EVENT));
  }

  return respons;
}
