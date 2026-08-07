import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Gedeelde serverlaag voor handelingen die RLS moeten omzeilen.
 *
 * Dit bestand mag UITSLUITEND vanuit route handlers worden geïmporteerd. De
 * service-role key die hier gelezen wordt heeft volledige toegang tot de
 * database en de opslag; belandt die in een clientbundel, dan ligt de hele
 * administratie op straat.
 *
 * Elke aanroeper hoort eerst `weigerZonderDashboardSessie` te draaien.
 */

export const BESTANDEN_BUCKET = "climatex-bestanden";

export type BeheerClient = SupabaseClient;

/**
 * Geeft een client met service-role rechten, of null als de sleutel ontbreekt.
 * Null betekent: de aanroepende route hoort met 503 te antwoorden in plaats van
 * stilletjes minder te doen dan gevraagd.
 */
export function maakBeheerClient(): BeheerClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sleutel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sleutel) return null;

  return createClient(url, sleutel, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Verwijdert objecten uit de opslag.
 *
 * Supabase accepteert meerdere paden tegelijk, maar geeft dan één gezamenlijke
 * uitkomst. We verwijderen daarom in blokken en melden per blok, zodat één
 * onbereikbaar object de rest niet tegenhoudt. Een pad dat al weg is levert
 * geen fout op, dus opnieuw proberen is veilig.
 */
export async function verwijderOpslagObjecten(
  client: BeheerClient,
  paden: string[]
): Promise<{ verwijderd: number; fouten: string[] }> {
  const schoon = paden.filter((pad) => typeof pad === "string" && pad.trim().length > 0);
  if (schoon.length === 0) return { verwijderd: 0, fouten: [] };

  const BLOKGROOTTE = 50;
  const fouten: string[] = [];
  let verwijderd = 0;

  for (let i = 0; i < schoon.length; i += BLOKGROOTTE) {
    const blok = schoon.slice(i, i + BLOKGROOTTE);
    const { error } = await client.storage.from(BESTANDEN_BUCKET).remove(blok);
    if (error) fouten.push(error.message);
    else verwijderd += blok.length;
  }

  return { verwijderd, fouten };
}
