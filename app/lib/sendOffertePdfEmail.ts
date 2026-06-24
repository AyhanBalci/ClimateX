import { resend, isResendConfigured } from "./resend";
import { offertePdfEmail } from "./emailTemplates";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ClimateX <offerte@climate-x.nl>";

export async function sendOffertePdfEmail(
  klantEmail: string,
  klantNaam: string,
  offertenummer: string,
  pdfBuffer: Buffer
) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." };
  }

  const template = offertePdfEmail(klantNaam, offertenummer);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: klantEmail,
    subject: template.subject,
    html: template.html,
    attachments: [
      {
        filename: `${offertenummer}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    console.error(`[sendOffertePdfEmail] Resend gaf een fout bij verzenden naar ${klantEmail}:`, error);
    return { error: error.message };
  }

  console.log(`[sendOffertePdfEmail] Offerte ${offertenummer} per e-mail verstuurd naar ${klantEmail}.`);
  return { error: null };
}
