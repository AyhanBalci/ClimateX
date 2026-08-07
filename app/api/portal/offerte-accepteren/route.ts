import { NextResponse } from "next/server";
import { maakBeheerClient } from "../../../lib/server/supabaseBeheer";
import { AKKOORDTEKST } from "../../../lib/offerteAcceptatie";
import { isVerlopen, geldigTot } from "../../../lib/offerteStatus";

/**
 * Digitaal accepteren van een offerte door de klant in het portaal.
 *
 * WAAROM DIT SERVER-SIDE MOET
 * ───────────────────────────
 * Een acceptatie is een rechtshandeling. Wie hem vanuit de browser zou mogen
 * wegschrijven, kan met de publieke anon-key een akkoord fabriceren op een
 * offerte die hem niet toebehoort. Daarom gebeurt alles hier:
 *
 * 1. Het toegangstoken uit de portaalsessie wordt bij Supabase geverifieerd.
 *    De gebruiker komt dus uit het token, nooit uit iets wat de client meestuurt.
 * 2. De offerte moet aantoonbaar bij die gebruiker horen, via de lead of de
 *    servicemelding waaraan zijn account gekoppeld is.
 * 3. Pas daarna wordt de acceptatie weggeschreven met de service-role key.
 *
 * Het offerte-id uit de body is dus nooit voldoende; het bepaalt alleen wélke
 * offerte gecontroleerd wordt.
 */

type Verzoek = { offerteId?: string; akkoord?: boolean };

export async function POST(request: Request) {
  const client = maakBeheerClient();
  if (!client) {
    return NextResponse.json(
      { error: "De acceptatiefunctie is niet beschikbaar. Neem contact met ons op." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  // De enige bron van waarheid over wie dit is.
  const { data: gebruiker, error: tokenFout } = await client.auth.getUser(token);
  if (tokenFout || !gebruiker?.user) {
    return NextResponse.json({ error: "Uw sessie is verlopen. Log opnieuw in." }, { status: 401 });
  }
  const userId = gebruiker.user.id;

  let body: Verzoek;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const offerteId = typeof body.offerteId === "string" ? body.offerteId.trim() : "";
  if (!offerteId) {
    return NextResponse.json({ error: "offerteId is verplicht." }, { status: 400 });
  }

  // Het vinkje is een inhoudelijke voorwaarde, geen opmaak. Zonder expliciet
  // akkoord wordt er niets vastgelegd, ook niet als de knop omzeild wordt.
  if (body.akkoord !== true) {
    return NextResponse.json(
      { error: "Vink eerst aan dat u akkoord gaat met de offerte en de voorwaarden." },
      { status: 400 }
    );
  }

  const { data: offerte, error: leesFout } = await client
    .from("offertes")
    .select("id, offertenummer, lead_id, ticket_id, status, datum, prijs, merk, model, werkzaamheden, opmerkingen")
    .eq("id", offerteId)
    .maybeSingle();

  if (leesFout) {
    return NextResponse.json({ error: "Kon de offerte niet ophalen." }, { status: 500 });
  }
  if (!offerte) {
    return NextResponse.json({ error: "Offerte niet gevonden." }, { status: 404 });
  }

  // ── Eigendomscontrole ──
  const [eigenLeads, eigenTickets] = await Promise.all([
    client.from("leads").select("id").eq("klant_user_id", userId),
    client.from("vastgoedtickets").select("id").eq("klant_user_id", userId),
  ]);

  const leadIds = new Set((eigenLeads.data || []).map((r) => r.id as string));
  const ticketIds = new Set((eigenTickets.data || []).map((r) => r.id as string));

  const magErbij =
    (offerte.lead_id && leadIds.has(offerte.lead_id as string)) ||
    (offerte.ticket_id && ticketIds.has(offerte.ticket_id as string));

  if (!magErbij) {
    // Bewust dezelfde melding als bij een onbekende offerte: dat verklapt niet
    // of een offerte met dit id bestaat.
    return NextResponse.json({ error: "Offerte niet gevonden." }, { status: 404 });
  }

  // ── Staat van de offerte ──
  const { data: bestaande } = await client
    .from("offerte_acceptaties")
    .select("geaccepteerd_op")
    .eq("offerte_id", offerteId)
    .maybeSingle();

  if (bestaande) {
    return NextResponse.json(
      { alGeaccepteerd: true, geaccepteerdOp: bestaande.geaccepteerd_op },
      { status: 409 }
    );
  }

  if (offerte.status !== "Verstuurd") {
    return NextResponse.json(
      { error: "Deze offerte kan niet meer geaccepteerd worden. Neem contact met ons op." },
      { status: 409 }
    );
  }

  if (isVerlopen(offerte.status as string, offerte.datum as string)) {
    return NextResponse.json(
      { error: "De geldigheidstermijn van deze offerte is verstreken. Neem contact met ons op voor een nieuwe offerte." },
      { status: 409 }
    );
  }

  // ── Vastleggen ──
  const geaccepteerdOp = new Date().toISOString();
  const momentopname = {
    offertenummer: offerte.offertenummer,
    datum: offerte.datum,
    geldigTot: geldigTot(offerte.datum as string).toISOString().slice(0, 10),
    merk: offerte.merk,
    model: offerte.model,
    prijs: offerte.prijs,
    werkzaamheden: offerte.werkzaamheden,
    opmerkingen: offerte.opmerkingen,
  };

  const { error: schrijfFout } = await client.from("offerte_acceptaties").insert({
    offerte_id: offerteId,
    geaccepteerd_op: geaccepteerdOp,
    klant_user_id: userId,
    akkoordtekst: AKKOORDTEKST,
    offerte_momentopname: momentopname,
  });

  if (schrijfFout) {
    // De unieke sleutel op offerte_id vangt twee gelijktijdige verzoeken op.
    if (schrijfFout.code === "23505") {
      const { data: nu } = await client
        .from("offerte_acceptaties")
        .select("geaccepteerd_op")
        .eq("offerte_id", offerteId)
        .maybeSingle();
      return NextResponse.json(
        { alGeaccepteerd: true, geaccepteerdOp: nu?.geaccepteerd_op ?? geaccepteerdOp },
        { status: 409 }
      );
    }
    console.error(`[offerteAccepteren] vastleggen mislukt code=${schrijfFout.code ?? "onbekend"}`);
    return NextResponse.json({ error: "Het accepteren is niet gelukt. Probeer het opnieuw." }, { status: 500 });
  }

  // Status als laatste. De bestaande automatisering hangt aan deze wijziging en
  // maakt werkbon en planning aan; die blijft dus ongewijzigd werken.
  const { error: statusFout } = await client
    .from("offertes")
    .update({ status: "Geaccepteerd" })
    .eq("id", offerteId)
    .eq("status", "Verstuurd");

  if (statusFout) {
    console.error(`[offerteAccepteren] status bijwerken mislukt code=${statusFout.code ?? "onbekend"}`);
    return NextResponse.json(
      {
        error:
          "Uw akkoord is vastgelegd, maar de verwerking is nog niet voltooid. Wij nemen contact met u op.",
      },
      { status: 500 }
    );
  }

  // Alleen het feit loggen, geen naam, e-mailadres, bedrag of offertenummer.
  console.log("[offerteAccepteren] offerte digitaal geaccepteerd");

  return NextResponse.json({ geaccepteerd: true, geaccepteerdOp });
}
