import { resend, isResendConfigured } from "./resend";
import { customerConfirmationEmail, adminNotificationEmail, LeadEmailData } from "./emailTemplates";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ClimateX <offerte@climate-x.nl>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "ayhan-b@outlook.com";

export async function sendOfferteEmails(lead: LeadEmailData) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." };
  }

  const customer = customerConfirmationEmail(lead);
  const admin = adminNotificationEmail(lead);

  const verzendingen = [
    { label: "klant", to: lead.email, subject: customer.subject, html: customer.html },
    { label: "beheerder", to: ADMIN_EMAIL, subject: admin.subject, html: admin.html },
  ];

  const results = await Promise.allSettled(
    verzendingen.map((v) => resend!.emails.send({ from: FROM_EMAIL, to: v.to, subject: v.subject, html: v.html }))
  );

  const errors: string[] = [];
  results.forEach((result, index) => {
    const { label, to } = verzendingen[index];
    if (result.status === "rejected") {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`[sendOfferteEmails] Verzenden naar ${label} (${to}) gaf een onverwachte fout:`, reason);
      errors.push(`E-mail naar ${label} mislukt: ${reason}`);
    } else if (result.value.error) {
      console.error(`[sendOfferteEmails] Resend gaf een fout bij verzenden naar ${label} (${to}):`, result.value.error);
      errors.push(`E-mail naar ${label} mislukt: ${result.value.error.message}`);
    } else {
      console.log(`[sendOfferteEmails] E-mail naar ${label} (${to}) verstuurd. Resend id: ${result.value.data?.id}`);
    }
  });

  return { error: errors.length > 0 ? errors.join(" | ") : null };
}
