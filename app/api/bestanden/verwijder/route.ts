import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { weigerZonderDashboardSessie } from "../../../lib/dashboardAuth";

/**
 * Verwijdert bestanden uit Supabase Storage én uit de tabel `bestanden`.
 *
 * WAAROM DEZE ROUTE BESTAAT
 * ─────────────────────────
 * Het verwijderen gebeurde eerder in de browser met de anon-key. Die key staat
 * in de JavaScript-bundle en is voor iedereen leesbaar, dus in combinatie met
 * een anon DELETE-policy kon iedere bezoeker elk bestand in de bucket wissen.
 * Door verwijderen hier te doen met de service-role key kan die policy weg.
 *
 * De service-role key omzeilt RLS volledig. Daarom staat de sessiecontrole
 * bovenaan en vóór alles: zonder geldige dashboardsessie komt er geen enkele
 * databaseaanroep aan te pas.
 */

const BUCKET = "climatex-bestanden";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Verzoek = {
  /** Normale modus: verwijder het bestand met dit id. */
  bestandId?: string;
  /** Weesmodus: verwijder dit opslagpad, mits geen enkele rij ernaar verwijst. */
  pad?: string;
};

export async function POST(request: Request) {
  // Eerst de sessie. Alles hieronder draait met een sleutel die RLS negeert.
  const geweigerd = weigerZonderDashboardSessie(request);
  if (geweigerd) return geweigerd;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is niet geconfigureerd op de server." },
      { status: 503 }
    );
  }

  let body: Verzoek;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const bestandId = typeof body.bestandId === "string" ? body.bestandId.trim() : "";
  const losPad = typeof body.pad === "string" ? body.pad.trim() : "";

  if (!bestandId && !losPad) {
    return NextResponse.json({ error: "Geef bestandId of pad mee." }, { status: 400 });
  }
  if (bestandId && losPad) {
    return NextResponse.json(
      { error: "Geef bestandId of pad mee, niet allebei." },
      { status: 400 }
    );
  }

  const beheerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Weesmodus ────────────────────────────────────────────────────
  // Bedoeld voor een upload die wel in de opslag belandde maar geen rij kreeg.
  // Alleen paden zonder rij mogen hier weg; anders zou een geldig dossier via
  // deze weg omzeild kunnen worden.
  if (losPad) {
    const { data: bestaandeRij, error: zoekFout } = await beheerClient
      .from("bestanden")
      .select("id")
      .eq("pad", losPad)
      .maybeSingle();

    if (zoekFout) {
      return NextResponse.json({ error: zoekFout.message }, { status: 500 });
    }

    if (bestaandeRij) {
      return NextResponse.json(
        {
          error:
            "Dit pad hoort bij een geregistreerd bestand. Verwijder het via bestandId in plaats van als wees.",
        },
        { status: 409 }
      );
    }

    const { error: opslagFout } = await beheerClient.storage.from(BUCKET).remove([losPad]);
    if (opslagFout) {
      console.error(`[bestandVerwijderen] wees mislukt fout=${opslagFout.message}`);
      return NextResponse.json({ error: opslagFout.message }, { status: 500 });
    }

    console.log("[bestandVerwijderen] weesbestand opgeruimd");
    return NextResponse.json({ verwijderd: true, modus: "wees" });
  }

  // ── Normale modus ────────────────────────────────────────────────
  // Het pad komt uit de database en nooit uit het verzoek. Zou de client het
  // pad meesturen, dan kon iemand met een sessie elk willekeurig object in de
  // bucket opgeven, ook objecten die niets met dat record te maken hebben.
  const { data: rij, error: leesFout } = await beheerClient
    .from("bestanden")
    .select("id, pad")
    .eq("id", bestandId)
    .maybeSingle();

  if (leesFout) {
    return NextResponse.json({ error: leesFout.message }, { status: 500 });
  }

  if (!rij) {
    // Al verwijderd, of een onbekend id. Voor de aanroeper is dat hetzelfde:
    // er valt niets meer te verwijderen.
    return NextResponse.json({ error: "Bestand niet gevonden." }, { status: 404 });
  }

  // Opslag eerst, dan de rij. Bij een publieke bucket is een achtergebleven
  // object erger dan een kapotte verwijzing: het blijft opvraagbaar voor wie de
  // URL ooit zag. Mislukt de rij daarna, dan meldt de route dat en is opnieuw
  // proberen veilig; een al verdwenen object opnieuw verwijderen geeft in
  // Supabase geen fout.
  const { error: opslagFout } = await beheerClient.storage.from(BUCKET).remove([rij.pad]);
  if (opslagFout) {
    console.error(`[bestandVerwijderen] opslag mislukt fout=${opslagFout.message}`);
    return NextResponse.json({ error: `Verwijderen uit de opslag is mislukt: ${opslagFout.message}` }, { status: 500 });
  }

  const { error: rijFout } = await beheerClient.from("bestanden").delete().eq("id", rij.id);
  if (rijFout) {
    console.error(`[bestandVerwijderen] rij mislukt fout=${rijFout.message}`);
    return NextResponse.json(
      {
        error: `Het bestand is uit de opslag verwijderd, maar de verwijzing bleef staan: ${rijFout.message}. Probeer het opnieuw.`,
      },
      { status: 500 }
    );
  }

  // Bewust geen bestandsnaam, pad, klantnaam of id in de logging: die regels
  // belanden bij de hostingpartij en hoeven daar geen klantgegevens te tonen.
  console.log("[bestandVerwijderen] bestand verwijderd");
  return NextResponse.json({ verwijderd: true, modus: "bestand" });
}
