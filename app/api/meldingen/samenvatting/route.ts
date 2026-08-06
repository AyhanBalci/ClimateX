import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import {
  resend,
  isResendConfigured,
  FROM_EMAIL,
  REPLY_TO,
  waarschuwBijAfwijkendAfzenderdomein,
} from "../../../lib/resend";
import { meldingenSamenvattingEmail } from "../../../lib/emailTemplates";
import { Melding } from "../../../lib/types";
import { weigerZonderDashboardSessie } from "../../../lib/dashboardAuth";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "ayhan-b@outlook.com";

/**
 * Stuurt de beheerder een samenvatting van de ongelezen meldingen.
 *
 * Dit is een POST en geen GET omdat de aanroep e-mail verstuurt en dus niet
 * herhaalbaar mag zijn bij het voorladen van een link. Aan te roepen vanuit het
 * dashboard of vanaf een geplande taak.
 */
export async function POST(request: Request) {
  // Deze route verstuurt e-mail naar de beheerder; alleen een ingelogde
  // beheerder mag dat in gang zetten.
  const geweigerd = weigerZonderDashboardSessie(request);
  if (geweigerd) return geweigerd;

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase is niet geconfigureerd." }, { status: 500 });
  }
  if (!isResendConfigured || !resend) {
    return NextResponse.json({ error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." }, { status: 500 });
  }

  const { data, error: fetchError } = await supabase
    .from("meldingen")
    .select("*")
    .eq("gelezen", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const meldingen = (data as Melding[]) || [];

  // Geen ongelezen meldingen is geen fout. Een lege samenvatting versturen zou
  // de beheerder alleen maar ruis opleveren.
  if (meldingen.length === 0) {
    return NextResponse.json({ verstuurd: false, reden: "Geen ongelezen meldingen." });
  }

  waarschuwBijAfwijkendAfzenderdomein("meldingenSamenvatting");

  const template = meldingenSamenvattingEmail(meldingen);

  const { data: verzonden, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: REPLY_TO,
    subject: template.subject,
    html: template.html,
  });

  if (sendError) {
    console.error(`[meldingenSamenvatting] MISLUKT naar=${ADMIN_EMAIL} fout=${sendError.message}`);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  console.log(
    `[meldingenSamenvatting] VERSTUURD naar=${ADMIN_EMAIL} aantal=${meldingen.length} ` +
      `message-id=${verzonden?.id ?? "onbekend"}`
  );

  return NextResponse.json({ verstuurd: true, aantal: meldingen.length, naar: ADMIN_EMAIL });
}
