import { resend, isResendConfigured } from "./resend";
import { customerConfirmationEmail, adminNotificationEmail, LeadEmailData } from "./emailTemplates";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ClimateX <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "ayhan-b@outlook.com";

export async function sendOfferteEmails(lead: LeadEmailData) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." };
  }

  const customer = customerConfirmationEmail(lead);
  const admin = adminNotificationEmail(lead);

  const results = await Promise.allSettled([
    resend.emails.send({ from: FROM_EMAIL, to: lead.email, subject: customer.subject, html: customer.html }),
    resend.emails.send({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject: admin.subject, html: admin.html }),
  ]);

  const errors: string[] = [];
  results.forEach((result, index) => {
    const label = index === 0 ? "klant" : "beheerder";
    if (result.status === "rejected") {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push(`E-mail naar ${label} mislukt: ${reason}`);
    } else if (result.value.error) {
      errors.push(`E-mail naar ${label} mislukt: ${result.value.error.message}`);
    }
  });

  return { error: errors.length > 0 ? errors.join(" | ") : null };
}
