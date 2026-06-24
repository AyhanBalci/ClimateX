import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import { buildOffertePdfDocument } from "../../../lib/generateOffertePdf";
import { sendOffertePdfEmail } from "../../../lib/sendOffertePdfEmail";
import { Offerte } from "../../../lib/types";

export async function POST(request: NextRequest) {
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

  return NextResponse.json({ success: true });
}
