export type LeadEmailData = {
  naam: string;
  telefoon: string;
  email: string;
  plaats: string;
  type_woning: string;
  opmerkingen: string;
};

function escapeHtml(value: string) {
  return (value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderEmailLayout(title: string, introHtml: string, lead: LeadEmailData, closingHtml: string) {
  const rows: [string, string][] = [
    ["Naam", lead.naam],
    ["Telefoonnummer", lead.telefoon],
    ["E-mailadres", lead.email],
    ["Plaats", lead.plaats],
    ["Type woning", lead.type_woning],
    ["Opmerkingen", lead.opmerkingen || "-"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:160px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="background-color:#f4f4f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="background-color:#0a0a0a;padding:24px 32px;">
          <table role="presentation" width="100%">
            <tr>
              <td style="vertical-align:middle;">
                <span style="display:inline-block;background-color:#22d3ee;color:#0a0a0a;font-weight:bold;font-size:14px;border-radius:8px;padding:6px 10px;margin-right:10px;">CX</span>
                <span style="color:#ffffff;font-size:20px;font-weight:bold;vertical-align:middle;">ClimateX</span>
              </td>
              <td style="text-align:right;color:#9ca3af;font-size:13px;vertical-align:middle;">06 1400 4488</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:18px;color:#111827;">${escapeHtml(title)}</h1>
          <div style="font-size:14px;line-height:1.6;color:#374151;">${introHtml}</div>
          <table role="presentation" width="100%" style="margin-top:20px;border-top:1px solid #e5e7eb;padding-top:8px;">
            ${rowsHtml}
          </table>
          <div style="margin-top:24px;font-size:14px;line-height:1.6;color:#374151;">${closingHtml}</div>
        </td>
      </tr>
      <tr>
        <td style="background-color:#f9fafb;padding:16px 32px;text-align:center;color:#9ca3af;font-size:12px;">
          ClimateX — Premium airco-installatie met montage en service — 06 1400 4488
        </td>
      </tr>
    </table>
  </div>`;
}

export function customerConfirmationEmail(lead: LeadEmailData) {
  const subject = "Uw aanvraag bij ClimateX is ontvangen";
  const html = renderEmailLayout(
    subject,
    `<p>Bedankt voor uw aanvraag bij ClimateX.</p>
     <p>Wij hebben uw aanvraag goed ontvangen en nemen binnen 24 uur contact met u op.</p>
     <p style="margin-top:16px;font-weight:bold;color:#111827;">Uw gegevens:</p>`,
    lead,
    `<p>Met vriendelijke groet,</p><p><strong>ClimateX</strong><br/>06 1400 4488</p>`
  );
  return { subject, html };
}

export function adminNotificationEmail(lead: LeadEmailData) {
  const subject = "Nieuwe offerteaanvraag ClimateX";
  const html = renderEmailLayout(
    subject,
    `<p>Er is een nieuwe offerteaanvraag ontvangen.</p>
     <p style="margin-top:16px;font-weight:bold;color:#111827;">Gegevens:</p>`,
    lead,
    ""
  );
  return { subject, html };
}
