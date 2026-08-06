import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import { buildWerkbonPdfDocument } from "../../../lib/generateWerkbonPdf";
import { sendWerkbonPdfEmail } from "../../../lib/sendWerkbonPdfEmail";
import { Werkbon } from "../../../lib/types";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: "Supabase is niet geconfigureerd." }, { status: 500 });
  }

  let body: { werkbonId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  if (!body.werkbonId) {
    return NextResponse.json({ error: "werkbonId is verplicht." }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("werkbonnen")
    .select("*, leads(naam, email), vastgoedtickets(klant, contactpersoon)")
    .eq("id", body.werkbonId)
    .maybeSingle();

  if (fetchError || !data) {
    return NextResponse.json({ error: fetchError?.message || "Werkbon niet gevonden." }, { status: 404 });
  }

  const werkbon = data as Werkbon & {
    leads?: { naam: string; email: string } | null;
    vastgoedtickets?: { klant: string; contactpersoon: string | null } | null;
  };

  // Het e-mailadres staat bij de lead. Een werkbon die alleen aan een
  // servicemelding hangt heeft dat adres niet, en dan is versturen zinloos.
  const klantEmail = werkbon.leads?.email || "";
  const klantNaam = werkbon.klantnaam || werkbon.leads?.naam || werkbon.vastgoedtickets?.klant || "";

  if (!klantEmail) {
    return NextResponse.json(
      { error: "Geen e-mailadres bekend voor deze klant. Koppel de werkbon aan een lead met e-mailadres." },
      { status: 400 }
    );
  }

  const pdfDoc = buildWerkbonPdfDocument(werkbon);
  const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

  const { error: sendError } = await sendWerkbonPdfEmail(
    klantEmail,
    klantNaam,
    werkbon.werkbonnummer,
    pdfBuffer
  );

  if (sendError) {
    return NextResponse.json({ error: sendError }, { status: 500 });
  }

  return NextResponse.json({ verstuurd: true, naar: klantEmail });
}
