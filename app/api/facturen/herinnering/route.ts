import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import {
  resend,
  isResendConfigured,
  FROM_EMAIL,
  REPLY_TO,
  waarschuwBijAfwijkendAfzenderdomein,
} from "../../../lib/resend";
import { factuurHerinneringEmail } from "../../../lib/emailTemplates";
import { dagenTeLaat, isAchterstallig } from "../../../lib/factuurOverzicht";
import { formatBedrag } from "../../../lib/formatters";
import { Factuur } from "../../../lib/types";
import { weigerZonderDashboardSessie } from "../../../lib/dashboardAuth";

export async function POST(request: NextRequest) {
  // Deze route verstuurt e-mail met klantgegevens; alleen een ingelogde
  // beheerder mag dat in gang zetten.
  const geweigerd = weigerZonderDashboardSessie(request);
  if (geweigerd) return geweigerd;

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase is niet geconfigureerd." }, { status: 500 });
  }
  if (!isResendConfigured || !resend) {
    return NextResponse.json({ error: "Resend is niet geconfigureerd. Stel RESEND_API_KEY in." }, { status: 500 });
  }

  let body: { factuurId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  if (!body.factuurId) {
    return NextResponse.json({ error: "factuurId is verplicht." }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("facturen")
    .select("*, leads(naam, email)")
    .eq("id", body.factuurId)
    .maybeSingle();

  if (fetchError || !data) {
    return NextResponse.json({ error: fetchError?.message || "Factuur niet gevonden." }, { status: 404 });
  }

  const factuur = data as Factuur & { leads?: { naam: string; email: string } | null };

  // Een betaalde factuur mag nooit een herinnering krijgen. Die controle staat
  // bewust op de server: de knop in het CRM kan verouderde gegevens tonen als
  // iemand anders de factuur net op betaald heeft gezet.
  if (factuur.status === "Betaald") {
    return NextResponse.json({ error: "Deze factuur is al betaald." }, { status: 400 });
  }
  if (!isAchterstallig(factuur)) {
    return NextResponse.json(
      { error: "De betaaltermijn van deze factuur is nog niet verstreken." },
      { status: 400 }
    );
  }

  const klantEmail = factuur.leads?.email || "";
  if (!klantEmail) {
    return NextResponse.json({ error: "Geen e-mailadres bekend voor deze klant." }, { status: 400 });
  }

  waarschuwBijAfwijkendAfzenderdomein("factuurHerinnering");

  const template = factuurHerinneringEmail(
    factuur.klant || factuur.leads?.naam || "",
    factuur.factuurnummer,
    formatBedrag(factuur.totaal),
    dagenTeLaat(factuur),
    factuur.betaallink || null
  );

  const { data: verzonden, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: klantEmail,
    replyTo: REPLY_TO,
    subject: template.subject,
    html: template.html,
  });

  if (sendError) {
    console.error(
      `[factuurHerinnering] MISLUKT van=${FROM_EMAIL} naar=${klantEmail} ` +
        `factuur=${factuur.factuurnummer} fout=${sendError.message}`
    );
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  console.log(
    `[factuurHerinnering] VERSTUURD van=${FROM_EMAIL} naar=${klantEmail} ` +
      `factuur=${factuur.factuurnummer} message-id=${verzonden?.id ?? "onbekend"}`
  );

  const verstuurdOp = new Date().toISOString();
  await supabase.from("facturen").update({ laatste_herinnering: verstuurdOp }).eq("id", factuur.id);

  return NextResponse.json({ verstuurd: true, naar: klantEmail, verstuurdOp });
}
