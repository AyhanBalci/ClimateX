import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  resend,
  isResendConfigured,
  FROM_EMAIL,
  REPLY_TO,
  waarschuwBijAfwijkendAfzenderdomein,
} from "../../../lib/resend";
import { portalUitnodigingEmail } from "../../../lib/emailTemplates";
import { weigerZonderDashboardSessie } from "../../../lib/dashboardAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://climate-x.nl";

export async function POST(request: NextRequest) {
  // Autorisatie via de dashboardsessie, gelijk aan de andere beveiligde routes.
  //
  // Hier stond een gedeeld geheim in de header, dat de beheerder bij elke actie
  // intypte. Dat geheim werd vergeleken met PORTAL_ADMIN_SECRET terwijl het
  // scherm om het dashboardwachtwoord vroeg; zolang beide dezelfde waarde
  // hadden viel dat niet op, maar zodra ze uiteenliepen weigerde deze route
  // elke aanroep met "Niet toegestaan.".
  //
  // Een tweede wachtwoord voegde bovendien weinig toe: wie de dashboardsessie
  // heeft, kan sowieso al alle klantgegevens inzien en facturen versturen. Het
  // sessiecookie is httpOnly, ondertekend en verloopt na acht uur, waar het
  // gedeelde geheim bij elke aanroep opnieuw over de lijn ging.
  const geweigerd = weigerZonderDashboardSessie(request);
  if (geweigerd) return geweigerd;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is niet geconfigureerd op de server." },
      { status: 500 }
    );
  }

  let body: { email?: string; naam?: string; leadId?: string; ticketId?: string; sendEmail?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const { email, naam, leadId, ticketId, sendEmail } = body;

  if (!email || !naam) {
    return NextResponse.json({ error: "E-mailadres en naam zijn verplicht." }, { status: 400 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${SITE_URL}/portal/dashboard` },
  });

  if (linkError || !linkData?.user) {
    return NextResponse.json(
      { error: linkError?.message || "Aanmaken van het klantaccount is mislukt." },
      { status: 500 }
    );
  }

  const userId = linkData.user.id;
  const inlogLink = linkData.properties?.action_link || null;

  await adminClient.from("klantprofielen").upsert(
    { user_id: userId, naam, email, rol: "klant" },
    { onConflict: "user_id" }
  );

  if (leadId) {
    await adminClient.from("leads").update({ klant_user_id: userId }).eq("id", leadId);
  }
  if (ticketId) {
    await adminClient.from("vastgoedtickets").update({ klant_user_id: userId }).eq("id", ticketId);
  }

  let emailVerstuurd = false;
  let emailError: string | null = null;

  if (sendEmail && inlogLink && isResendConfigured && resend) {
    waarschuwBijAfwijkendAfzenderdomein("portal/invite");
    const template = portalUitnodigingEmail(naam, inlogLink);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: template.subject,
      html: template.html,
    });
    if (error) {
      console.error(
        `[portal/invite] MISLUKT van=${FROM_EMAIL} naar=${email} status=${error.name} fout=${error.message}`
      );
      emailError = error.message;
    } else {
      console.log(`[portal/invite] VERSTUURD van=${FROM_EMAIL} naar=${email} message-id=${data?.id ?? "onbekend"}`);
      emailVerstuurd = true;
    }
  }

  return NextResponse.json({ link: inlogLink, emailVerstuurd, emailError });
}
