/**
 * De publieke basis-URL van ClimateX, op één plek.
 *
 * WAAROM DIT BESTAAT
 * ──────────────────
 * De basis-URL stond op drie plekken los van elkaar: een hardcoded
 * vercel.app-adres in seo.ts, een omgevingsvariabele met terugval in de
 * uitnodigingsroute, en window.location.origin op de portaallogin. Een
 * uitnodiging die vanuit productie werd verstuurd kon daardoor naar
 * localhost verwijzen, en de canonieke URL's wezen naar een ander domein dan
 * waar de site draait.
 *
 * DE REGEL
 * ────────
 * In productie kan hier nooit een localhost-adres uit komen. Staat er toch
 * zo'n waarde in de omgeving, dan wordt die genegeerd en volgt een luide
 * melding in de logging. Een uitnodigingsmail naar een klant met een
 * localhost-link is erger dan een verkeerd geconfigureerde variabele: de klant
 * loopt vast en wij zien het niet.
 *
 * Buiten productie mag localhost gewoon; daar is het juist de bedoeling.
 */

/** Het adres waar de productieomgeving draait. */
export const CANONIEKE_PRODUCTIE_URL = "https://www.climate-x.nl";

/** Adres dat de ontwikkelserver gebruikt als er niets is ingesteld. */
const STANDAARD_ONTWIKKEL_URL = "http://localhost:3000";

function zonderSlotSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function isLokaalAdres(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?/i.test(url.trim());
}

let alGewaarschuwd = false;

/**
 * De basis-URL zonder afsluitende slash, bijvoorbeeld "https://www.climate-x.nl".
 *
 * Werkt zowel op de server als in de browser: NEXT_PUBLIC_SITE_URL en NODE_ENV
 * zijn op beide plekken beschikbaar.
 */
export function publiekeSiteUrl(): string {
  const ingesteld = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isProductie = process.env.NODE_ENV === "production";

  if (ingesteld) {
    if (!isProductie) return zonderSlotSlash(ingesteld);

    if (!isLokaalAdres(ingesteld)) return zonderSlotSlash(ingesteld);

    // Productie met een localhost-waarde: negeren, maar wel hard melden.
    if (!alGewaarschuwd) {
      alGewaarschuwd = true;
      console.error(
        "[siteUrl] NEXT_PUBLIC_SITE_URL wijst in productie naar een lokaal adres en wordt genegeerd. " +
          `Er wordt teruggevallen op ${CANONIEKE_PRODUCTIE_URL}. Zet deze variabele in Vercel op de ` +
          "productie-URL, of haal hem daar weg."
      );
    }
    return CANONIEKE_PRODUCTIE_URL;
  }

  return isProductie ? CANONIEKE_PRODUCTIE_URL : STANDAARD_ONTWIKKEL_URL;
}

/** Bouwt een absolute URL op de publieke basis. */
export function siteUrlVoor(pad: string): string {
  const basis = publiekeSiteUrl();
  return `${basis}${pad.startsWith("/") ? pad : `/${pad}`}`;
}

/**
 * Waar de klant terechtkomt na het openen van een inlog- of uitnodigingslink.
 *
 * Dit adres moet in Supabase onder Authentication → URL Configuration bij de
 * Redirect URLs staan. Staat het er niet bij, dan negeert Supabase het en
 * stuurt hij de klant naar de Site URL die daar is ingesteld; dat is precies
 * hoe een klant op localhost kon belanden.
 */
export function portaalTerugkeerUrl(): string {
  return siteUrlVoor("/portal/dashboard");
}
