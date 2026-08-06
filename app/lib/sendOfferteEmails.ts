import {
  resend,
  isResendConfigured,
  FROM_EMAIL,
  REPLY_TO,
  waarschuwBijAfwijkendAfzenderdomein,
} from "./resend";
import { customerConfirmationEmail, adminNotificationEmail, LeadEmailData } from "./emailTemplates";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "ayhan-b@outlook.com";

export async function sendOfferteEmails(lead: LeadEmailData) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in.", klantMailVerstuurd: false };
  }

  waarschuwBijAfwijkendAfzenderdomein("sendOfferteEmails");

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
