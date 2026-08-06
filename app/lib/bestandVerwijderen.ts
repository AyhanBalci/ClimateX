/**
 * Aanroep van de beveiligde verwijderroute.
 *
 * Verwijderen gebeurt sinds de beveiligingsfix niet meer in de browser met de
 * anon-key, maar server-side met de service-role key achter een
 * dashboardsessie. Deze helper zit ertussen zodat elk scherm dezelfde weg
 * neemt en er geen tweede plek ontstaat die het alsnog rechtstreeks doet.
 */

const ROUTE = "/api/bestanden/verwijder";

type Antwoord = { error: string | null };

async function roepAan(body: Record<string, string>): Promise<Antwoord> {
  try {
    const respons = await fetch(ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (respons.ok) return { error: null };

    const data = await respons.json().catch(() => ({}));
    return { error: data.error || `Verwijderen is mislukt (status ${respons.status}).` };
  } catch (fout) {
    return { error: fout instanceof Error ? fout.message : "Verwijderen is mislukt." };
  }
}

/** Verwijdert een geregistreerd bestand: eerst het object, daarna de rij. */
export async function verwijderBestand(bestandId: string): Promise<Antwoord> {
  return roepAan({ bestandId });
}

/**
 * Ruimt een object op dat wel in de opslag staat maar geen rij in `bestanden`
 * heeft. Gebeurt als een upload slaagde maar het wegschrijven daarna mislukte.
 * De server weigert dit pad als er tóch een rij naar verwijst.
 */
export async function verwijderWeesbestand(pad: string): Promise<Antwoord> {
  return roepAan({ pad });
}

/**
 * Verwijdert meerdere objecten, bijvoorbeeld alle bestanden bij een lead.
 * Geeft de eerste fout terug maar probeert wel alles: een enkel mislukt object
 * mag de rest niet laten staan in een publieke bucket.
 */
export async function verwijderBestanden(bestandIds: string[]): Promise<Antwoord> {
  let eersteFout: string | null = null;

  for (const id of bestandIds) {
    const { error } = await verwijderBestand(id);
    if (error && !eersteFout) eersteFout = error;
  }

  return { error: eersteFout };
}
