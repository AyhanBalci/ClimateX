import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const isResendConfigured = Boolean(apiKey);

export const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Afzenderinstellingen op één plek. Deze stonden eerder als losse kopie in elk
 * bestand dat mail verstuurt, waardoor een correctie op de ene plek de andere
 * twee niet bereikte en die stilzwijgend vanaf een niet-geverifieerd domein
 * bleven versturen.
 *
 * Het afzenderadres moet op een in Resend geverifieerd domein staan. Geverifieerd
 * is `send.climate-x.nl`, niet het hoofddomein: dat laatste is bij TransIP in
 * gebruik voor de gewone mailbox en heeft geen Resend-DKIM. Staat hier een adres
 * op een niet-geverifieerd domein, dan weigert Resend elke ontvanger behalve het
 * eigen accountadres.
 */
export const GEVERIFIEERD_DOMEIN = "send.climate-x.nl";

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `ClimateX <offerte@${GEVERIFIEERD_DOMEIN}>`;

/** Antwoorden van klanten komen binnen op het algemene postvak, niet op het verzendadres. */
export const REPLY_TO = process.env.RESEND_REPLY_TO_EMAIL || "info@climate-x.nl";

/** Haalt het domein uit "Naam <adres@domein>" of uit een kaal e-mailadres. */
function afzenderDomein(from: string): string {
  const adres = from.match(/<([^>]+)>/)?.[1] ?? from;
  return adres.split("@")[1]?.trim().toLowerCase() ?? "";
}

/**
 * Waarschuwt zodra er vanaf een ander domein wordt verstuurd dan het
 * geverifieerde. Zonder deze melding ziet die situatie eruit als "alleen
 * sommige ontvangers krijgen niets", wat lastig te herleiden is.
 */
export function waarschuwBijAfwijkendAfzenderdomein(context: string) {
  const domein = afzenderDomein(FROM_EMAIL);
  if (domein !== GEVERIFIEERD_DOMEIN) {
    console.warn(
      `[${context}] Afzenderdomein "${domein}" wijkt af van het geverifieerde domein ` +
        `"${GEVERIFIEERD_DOMEIN}". Controleer RESEND_FROM_EMAIL in Vercel; Resend weigert dan ` +
        `waarschijnlijk elke ontvanger behalve het eigen accountadres.`
    );
  }
}
