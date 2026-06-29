import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { validateLead } from "../../lib/validateLead";
import { STATUS_OPTIONS } from "../../lib/constants";
import { sendOfferteEmails } from "../../lib/sendOfferteEmails";

export async function POST(request: Request) {
  const data = await request.json();

  const lead = {
    naam: data.name,
    telefoon: data.phone,
    email: data.email,
    plaats: data.plaats || data.postcode,
    type_woning: data.woningType,
    opmerkingen: data.bericht,
    status: STATUS_OPTIONS[0],
    aantal_laadpunten: data.aantalLaadpunten ? Number(data.aantalLaadpunten) : null,
    automerk: data.automerk || null,
    automodel: data.automodel || null,
    elektrisch_voertuig: data.elektrischVoertuig ? data.elektrischVoertuig === "Ja" : null,
    aansluiting: data.aansluiting || null,
    parkeerplaats: data.parkeerplaats || null,
    load_balancing: Boolean(data.loadBalancing),
    dynamic_load_balancing: Boolean(data.dynamicLoadBalancing),
  };

  const validationError = validateLead(lead);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase is niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.",
      },
      { status: 500 }
    );
  }

  const { data: insertedLead, error } = await supabase.from("leads").insert(lead).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("lead_status_historie").insert({ lead_id: insertedLead.id, status: insertedLead.status });

  try {
    const { error: emailError } = await sendOfferteEmails({
      naam: lead.naam,
      telefoon: lead.telefoon,
      email: lead.email,
      plaats: lead.plaats,
      type_woning: lead.type_woning,
      opmerkingen: lead.opmerkingen,
    });
    if (emailError) {
      console.error("E-mail verzenden mislukt:", emailError);
    }
  } catch (emailException) {
    console.error("E-mail verzenden mislukt (onverwachte fout):", emailException);
  }

  return NextResponse.json({ message: "Bedankt. Wij nemen binnen 24 uur contact met u op." });
}
