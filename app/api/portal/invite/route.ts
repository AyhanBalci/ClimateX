import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, isResendConfigured } from "../../../lib/resend";
import { portalUitnodigingEmail } from "../../../lib/emailTemplates";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.PORTAL_ADMIN_SECRET;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ClimateX <offerte@climate-x.nl>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://climate-x.nl";

export async function POST(request: NextRequest) {
  if (!ADMIN_SECRET || request.headers.get("x-portal-admin-secret") !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Niet toegestaan." }, { status: 401 });
  }

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
    const template = portalUitnodigingEmail(naam, inlogLink);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: template.subject,
      html: template.html,
    });
    if (error) {
      emailError = error.message;
    } else {
      emailVerstuurd = true;
    }
  }

  return NextResponse.json({ link: inlogLink, emailVerstuurd, emailError });
}
