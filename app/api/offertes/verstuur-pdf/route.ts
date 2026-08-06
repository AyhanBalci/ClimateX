import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import { buildOffertePdfDocument } from "../../../lib/generateOffertePdf";
import { sendOffertePdfEmail } from "../../../lib/sendOffertePdfEmail";
import { Offerte } from "../../../lib/types";
import { weigerZonderDashboardSessie } from "../../../lib/dashboardAuth";

export async function POST(request: NextRequest) {
  // Deze route verstuurt e-mail met klantgegevens; alleen een ingelogde
  // beheerder mag dat in gang zetten.
  const geweigerd = weigerZonderDashboardSessie(request);
  if (geweigerd) return geweigerd;

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase is niet geconfigureerd." }, { status: 500 });
  }

  let body: { offerteId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  if (!body.offerteId) {
    return NextResponse.json({ error: "offerteId is verplicht." }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("offertes")
    .select("*, leads(naam, telefoon, email, plaats, type_woning), vastgoedtickets(klant, locatie, contactpersoon, telefoonnummer)")
    .eq("id", body.offerteId)
    .maybeSingle();

  if (fetchError || !data) {
    return NextResponse.json({ error: fetchError?.message || "Offerte niet gevonden." }, { status: 404 });
  }

  const offerte = data as Offerte;

  const klant = {
    naam: offerte.leads?.naam || offerte.vastgoedtickets?.klant || "",
    telefoon: offerte.leads?.telefoon || offerte.vastgoedtickets?.telefoonnummer || "",
    email: offerte.leads?.email || "",
    plaats: offerte.leads?.plaats || offerte.vastgoedtickets?.locatie || "",
    type_woning: offerte.leads?.type_woning || "",
  };

  if (!klant.email) {
    return NextResponse.json({ error: "Geen e-mailadres bekend voor deze klant." }, { status: 400 });
  }

  const pdfDoc = buildOffertePdfDocument(offerte, klant);
  const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

  const { error: sendError } = await sendOffertePdfEmail(klant.email, klant.naam, offerte.offertenummer, pdfBuffer);

  if (sendError) {
    return NextResponse.json({ error: sendError }, { status: 500 });
  }

  // De offerte ligt nu bij de klant, dus mag hij niet langer als concept in het
  // CRM en het portaal staan. Zonder deze stap moest een beheerder daarna nog
  // handmatig "Markeer als verstuurd" aanklikken, en zag de klant in het portaal
  // "Wordt voorbereid" terwijl de offerte al in zijn mailbox lag.
  // Alleen vanuit Concept, zodat een reeds geaccepteerde of afgewezen offerte
  // niet wordt teruggezet wanneer de PDF opnieuw wordt verstuurd.
  let statusBijgewerkt = false;
  if (offerte.status === "Concept") {
    const { error: statusError } = await supabase
      .from("offertes")
      .update({ status: "Verstuurd" })
      .eq("id", offerte.id)
      .eq("status", "Concept");

    if (statusError) {
      console.error(
        `[verstuur-pdf] Offerte ${offerte.offertenummer} is gemaild, maar de status kon niet ` +
          `naar "Verstuurd" worden gezet: ${statusError.message}`
      );
    } else {
      statusBijgewerkt = true;
      console.log(`[verstuur-pdf] Offerte ${offerte.offertenummer} gemaild en status op "Verstuurd" gezet.`);
    }
  }

  return NextResponse.json({ success: true, statusBijgewerkt });
}
