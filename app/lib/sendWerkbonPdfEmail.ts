import {
  resend,
  isResendConfigured,
  FROM_EMAIL,
  REPLY_TO,
  waarschuwBijAfwijkendAfzenderdomein,
} from "./resend";
import { werkbonPdfEmail } from "./emailTemplates";

export async function sendWerkbonPdfEmail(
  klantEmail: string,
  klantNaam: string,
  werkbonnummer: string,
  pdfBuffer: Buffer
) {
  if (!isResendConfigured || !resend) {
    return { error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." };
  }

  waarschuwBijAfwijkendAfzenderdomein("sendWerkbonPdfEmail");

  const template = werkbonPdfEmail(klantNaam, werkbonnummer);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: klantEmail,
    replyTo: REPLY_TO,
    subject: template.subject,
    html: template.html,
    attachments: [
      {
        filename: `${werkbonnummer}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    console.error(
      `[sendWerkbonPdfEmail] MISLUKT van=${FROM_EMAIL} naar=${klantEmail} ` +
        `werkbon=${werkbonnummer} status=${error.name} fout=${error.message}`
    );
    return { error: error.message };
  }

  console.log(
    `[sendWerkbonPdfEmail] VERSTUURD van=${FROM_EMAIL} naar=${klantEmail} ` +
      `werkbon=${werkbonnummer} message-id=${data?.id ?? "onbekend"}`
  );
  return { error: null };
}
