import { NextResponse } from "next/server";
import { weigerZonderDashboardSessie } from "../../../lib/dashboardAuth";
import { maakBeheerClient } from "../../../lib/server/supabaseBeheer";
import {
  BEVESTIGINGSTEKST,
  inventariseerLead,
  verwijderLeadDefinitief,
} from "../../../lib/server/leadVerwijderen";

/**
 * Definitief verwijderen van een testlead, inclusief gekoppelde data.
 *
 * Twee acties in één route:
 *   inventarisatie — telt op wat er zou verdwijnen, verandert niets
 *   definitief     — voert de verwijdering uit, met verplichte bevestigingstekst
 *
 * De gewone verwijderknop (leadActions.deleteLead) blijft ongemoeid en blokkeert
 * nog steeds zodra er documenten aan een lead hangen. Deze route is de bewuste
 * uitzondering daarop en vraagt daarom om een letterlijk ingetypte bevestiging.
 */

type Verzoek = {
  leadId?: string;
  actie?: "inventarisatie" | "definitief";
  bevestiging?: string;
};

export async function POST(request: Request) {
  const geweigerd = weigerZonderDashboardSessie(request);
  if (geweigerd) return geweigerd;

  const client = maakBeheerClient();
  if (!client) {
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

  const leadId = typeof body.leadId === "string" ? body.leadId.trim() : "";
  if (!leadId) {
    return NextResponse.json({ error: "leadId is verplicht." }, { status: 400 });
  }

  const actie = body.actie === "definitief" ? "definitief" : "inventarisatie";

  const inventarisatie = await inventariseerLead(client, leadId);
  if (!inventarisatie.leadBestaat) {
    return NextResponse.json({ error: "Lead niet gevonden." }, { status: 404 });
  }

  if (actie === "inventarisatie") {
    return NextResponse.json({ actie, inventarisatie, bevestigingstekst: BEVESTIGINGSTEKST });
  }

  // De bevestiging is een vaste tekst en niet de klantnaam: die hoeft daarvoor
  // niet over de lijn, en een vaste tekst is niet per ongeluk goed te typen.
  if (body.bevestiging !== BEVESTIGINGSTEKST) {
    return NextResponse.json(
      { error: `Typ "${BEVESTIGINGSTEKST}" om te bevestigen.` },
      { status: 400 }
    );
  }

  const resultaat = await verwijderLeadDefinitief(client, leadId);

  // Uitsluitend aantallen in de logging. Geen naam, geen id, geen adres: die
  // regels belanden bij de hostingpartij en hoeven daar niets over een klant
  // prijs te geven.
  const samenvatting = Object.entries(resultaat.verwijderd)
    .map(([soort, aantal]) => `${soort.toLowerCase()}=${aantal}`)
    .join(" ");
  console.log(
    `[leadVerwijderen] ${resultaat.gelukt ? "voltooid" : "MISLUKT"} ` +
      `${samenvatting} opslagobjecten=${resultaat.opslagobjecten}` +
      (resultaat.fouten.length > 0 ? ` fouten=${resultaat.fouten.length}` : "")
  );

  if (!resultaat.gelukt) {
    return NextResponse.json(
      {
        error:
          "Het verwijderen is niet volledig gelukt. De lead is bewust blijven staan zodat de resterende gegevens terug te vinden zijn.",
        details: resultaat.fouten,
        verwijderd: resultaat.verwijderd,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ actie, resultaat });
}
