import {
  resend,
  isResendConfigured,
  FROM_EMAIL,
  REPLY_TO,
  waarschuwBijAfwijkendAfzenderdomein,
} from "./resend";
import { offertePdfEmail } from "./emailTemplates";

export async function sendOffertePdfEmail(
  klantEmail: string,
  klantNaam: string,
  offertenummer: string,
  pdfBuffer: Buffer
) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." };
  }

  waarschuwBijAfwijkendAfzenderdomein("sendOffertePdfEmail");

  const template = offertePdfEmail(klantNaam, offertenummer);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: klantEmail,
    replyTo: REPLY_TO,
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
    console.error(
      `[sendOffertePdfEmail] MISLUKT van=${FROM_EMAIL} naar=${klantEmail} ` +
        `offerte=${offertenummer} status=${error.name} fout=${error.message}`
    );
    return { error: error.message };
  }

  console.log(
    `[sendOffertePdfEmail] VERSTUURD van=${FROM_EMAIL} naar=${klantEmail} ` +
      `offerte=${offertenummer} message-id=${data?.id ?? "onbekend"}`
  );
  return { error: null };
}
