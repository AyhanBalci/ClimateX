import { resend, isResendConfigured } from "./resend";
import { customerConfirmationEmail, adminNotificationEmail, LeadEmailData } from "./emailTemplates";

/**
 * Het afzenderadres moet op een in Resend geverifieerd domein staan. Geverifieerd
 * is `send.climate-x.nl`, niet het hoofddomein: dat laatste is bij TransIP in
 * gebruik voor de gewone mailbox en heeft geen Resend-DKIM. Staat hier een adres
 * op een niet-geverifieerd domein, dan weigert Resend elke ontvanger behalve het
 * eigen accountadres — waardoor de interne melding wél aankomt en de
 * klantbevestiging stil sneuvelt.
 */
const GEVERIFIEERD_DOMEIN = "send.climate-x.nl";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `ClimateX <offerte@${GEVERIFIEERD_DOMEIN}>`;
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "ayhan-b@outlook.com";

/** Antwoorden van klanten komen binnen op het algemene postvak, niet op het verzendadres. */
const REPLY_TO = process.env.RESEND_REPLY_TO_EMAIL || "info@climate-x.nl";

/** Haalt het domein uit "Naam <adres@domein>" of uit een kaal e-mailadres. */
function afzenderDomein(from: string): string {
  const adres = from.match(/<([^>]+)>/)?.[1] ?? from;
  return adres.split("@")[1]?.trim().toLowerCase() ?? "";
}

export async function sendOfferteEmails(lead: LeadEmailData) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in.", klantMailVerstuurd: false };
  }

  // Vroegtijdige waarschuwing: op een niet-geverifieerd domein weigert Resend
  // alle ontvangers behalve het accountadres, wat er precies uitziet als "alleen
  // de klantmail komt niet aan".
  const domein = afzenderDomein(FROM_EMAIL);
  if (domein !== GEVERIFIEERD_DOMEIN) {
    console.warn(
      `[sendOfferteEmails] Afzenderdomein "${domein}" wijkt af van het geverifieerde domein ` +
        `"${GEVERIFIEERD_DOMEIN}". Controleer RESEND_FROM_EMAIL in Vercel; Resend weigert dan ` +
        `waarschijnlijk elke ontvanger behalve het eigen accountadres.`
    );
  }

  const customer = customerConfirmationEmail(lead);
  const admin = adminNotificationEmail(lead);

  const verzendingen = [
    { label: "klant", to: lead.email, subject: customer.subject, html: customer.html },
    { label: "beheerder", to: ADMIN_EMAIL, subject: admin.subject, html: admin.html },
  ];

  const results = await Promise.allSettled(
    verzendingen.map((v) =>
      resend!.emails.send({ from: FROM_EMAIL, to: v.to, replyTo: REPLY_TO, subject: v.subject, html: v.html }),
    )
  );

  const errors: string[] = [];
  let klantMailVerstuurd = false;

  results.forEach((result, index) => {
    const { label, to } = verzendingen[index];
    const context = `van=${FROM_EMAIL} naar=${label}(${to})`;

    if (result.status === "rejected") {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`[sendOfferteEmails] MISLUKT ${context} status=exception fout=${reason}`);
      errors.push(`E-mail naar ${label} mislukt: ${reason}`);
    } else if (result.value.error) {
      const { name, message } = result.value.error;
      console.error(`[sendOfferteEmails] MISLUKT ${context} status=${name} fout=${message}`);
      errors.push(`E-mail naar ${label} mislukt: ${message}`);
    } else {
      if (label === "klant") klantMailVerstuurd = true;
      console.log(`[sendOfferteEmails] VERSTUURD ${context} message-id=${result.value.data?.id ?? "onbekend"}`);
    }
  });

  return { error: errors.length > 0 ? errors.join(" | ") : null, klantMailVerstuurd };
}
