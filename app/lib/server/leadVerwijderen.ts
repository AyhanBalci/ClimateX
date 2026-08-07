/**
 * Definitief verwijderen van een lead, inclusief alles wat eraan hangt.
 *
 * BEDOELD GEBRUIK
 * ───────────────
 * Het opruimen van testaanvragen. De gewone verwijderknop blijft geblokkeerd
 * zodra er offertes, werkbonnen of facturen aan een lead hangen; dat zijn
 * zakelijke documenten met een eigen nummerreeks. Deze functie omzeilt die
 * blokkade bewust en hoort alleen gebruikt te worden als iemand die documenten
 * echt wil weggooien.
 *
 * WAAROM ALLES EXPLICIET WORDT VERWIJDERD
 * ───────────────────────────────────────
 * Een deel van de verwijzingen naar `leads` is aangemaakt door migraties in dit
 * project en heeft `on delete cascade`. Van de oudere tabellen (offertes,
 * werkbonnen, facturen, planning, bestanden, notities, statushistorie) is dat
 * niet vastgelegd in een migratiebestand, dus het cascade-gedrag daarvan is
 * onbekend. In plaats van daarop te gokken verwijdert deze module alles zelf,
 * van kind naar ouder. Dat werkt ongeacht hoe de sleutels ingesteld staan en
 * laat gegarandeerd geen weesrecords achter.
 *
 * WAT BEWUST BLIJFT STAAN
 * ───────────────────────
 * Servicemeldingen en alles wat daaraan hangt, het klantaccount in het
 * portaal, andere leads, en de productcatalogus. Een servicemelding is een
 * eigen klantrecord en hoort niet als bijvangst te verdwijnen.
 */

import type { BeheerClient } from "./supabaseBeheer";
import { verwijderOpslagObjecten } from "./supabaseBeheer";

export type GekoppeldRecord = {
  soort: string;
  aantal: number;
  /** Korte aanduidingen, zoals offertenummers. Nooit klantgegevens. */
  kenmerken: string[];
  /** Waar of deze records ook aan een servicemelding hangen. */
  ookAanServicemelding?: boolean;
};

export type LeadInventarisatie = {
  leadBestaat: boolean;
  /** Alleen om te tonen welke lead het is; komt niet in de logging. */
  leadNaam: string;
  gekoppeld: GekoppeldRecord[];
  totaalRecords: number;
  bestandenInOpslag: number;
  /** Punten die de beheerder moet weten vóór hij bevestigt. */
  waarschuwingen: string[];
};

/** De tekst die de beheerder letterlijk moet intypen om te bevestigen. */
export const BEVESTIGINGSTEKST = "DEFINITIEF VERWIJDEREN";

type Ids = {
  offertes: string[];
  werkbonnen: string[];
  facturen: string[];
};

/** Haalt de id's op van de records die direct aan de lead hangen. */
async function verzamelIds(client: BeheerClient, leadId: string): Promise<Ids> {
  const [offertes, werkbonnen, facturen] = await Promise.all([
    client.from("offertes").select("id").eq("lead_id", leadId),
    client.from("werkbonnen").select("id").eq("lead_id", leadId),
    client.from("facturen").select("id").eq("lead_id", leadId),
  ]);

  return {
    offertes: (offertes.data || []).map((r) => r.id as string),
    werkbonnen: (werkbonnen.data || []).map((r) => r.id as string),
    facturen: (facturen.data || []).map((r) => r.id as string),
  };
}

/**
 * Somt op wat er verdwijnt als deze lead definitief wordt verwijderd.
 * Verandert niets; bedoeld om de beheerder te laten zien waar hij ja op zegt.
 */
export async function inventariseerLead(
  client: BeheerClient,
  leadId: string
): Promise<LeadInventarisatie> {
  const { data: lead } = await client
    .from("leads")
    .select("id, naam, klant_user_id")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) {
    return {
      leadBestaat: false,
      leadNaam: "",
      gekoppeld: [],
      totaalRecords: 0,
      bestandenInOpslag: 0,
      waarschuwingen: [],
    };
  }

  const ids = await verzamelIds(client, leadId);
  const waarschuwingen: string[] = [];

  const [
    offertes,
    werkbonnen,
    facturen,
    planning,
    notities,
    historie,
    contactpersonen,
    adressen,
    bestanden,
  ] = await Promise.all([
    client.from("offertes").select("offertenummer, ticket_id").eq("lead_id", leadId),
    client.from("werkbonnen").select("werkbonnummer, ticket_id").eq("lead_id", leadId),
    client.from("facturen").select("factuurnummer, status, ticket_id").eq("lead_id", leadId),
    client.from("planning").select("planning_nummer").eq("lead_id", leadId),
    client.from("lead_notities").select("id").eq("lead_id", leadId),
    client.from("lead_status_historie").select("id").eq("lead_id", leadId),
    client.from("klant_contactpersonen").select("id").eq("lead_id", leadId),
    client.from("klant_adressen").select("id").eq("lead_id", leadId),
    client.from("bestanden").select("id, pad").eq("lead_id", leadId),
  ]);

  // Bestanden die indirect aan de lead hangen, via zijn werkbonnen of facturen.
  const indirecteBestanden: { id: string; pad: string }[] = [];
  if (ids.werkbonnen.length > 0) {
    const { data } = await client.from("bestanden").select("id, pad").in("werkbon_id", ids.werkbonnen);
    indirecteBestanden.push(...((data || []) as { id: string; pad: string }[]));
  }
  if (ids.facturen.length > 0) {
    const { data } = await client.from("bestanden").select("id, pad").in("factuur_id", ids.facturen);
    indirecteBestanden.push(...((data || []) as { id: string; pad: string }[]));
  }

  const alleBestandIds = new Set([
    ...((bestanden.data || []) as { id: string }[]).map((b) => b.id),
    ...indirecteBestanden.map((b) => b.id),
  ]);

  // Records die óók aan een servicemelding hangen, verdwijnen mee. Dat is de
  // belangrijkste waarschuwing: de melding zelf blijft staan maar raakt wel
  // zijn offerte of werkbon kwijt.
  const gedeeld =
    ((offertes.data || []) as { ticket_id: string | null }[]).some((r) => r.ticket_id) ||
    ((werkbonnen.data || []) as { ticket_id: string | null }[]).some((r) => r.ticket_id) ||
    ((facturen.data || []) as { ticket_id: string | null }[]).some((r) => r.ticket_id);

  if (gedeeld) {
    waarschuwingen.push(
      "Een of meer van deze documenten hangen óók aan een servicemelding. De melding zelf blijft bestaan, maar raakt dat document kwijt."
    );
  }

  const betaaldeFacturen = ((facturen.data || []) as { status: string }[]).filter(
    (f) => f.status === "Betaald"
  ).length;
  if (betaaldeFacturen > 0) {
    waarschuwingen.push(
      `Er ${betaaldeFacturen === 1 ? "is 1 betaalde factuur" : `zijn ${betaaldeFacturen} betaalde facturen`} gekoppeld. Betaalde facturen horen bij uw administratie; controleer of u die echt mag weggooien.`
    );
  }

  if ((lead as { klant_user_id?: string | null }).klant_user_id) {
    waarschuwingen.push(
      "Deze lead is gekoppeld aan een klantaccount in het portaal. Dat account blijft bestaan en wordt niet verwijderd."
    );
  }

  const gekoppeld: GekoppeldRecord[] = [
    {
      soort: "Offertes",
      aantal: (offertes.data || []).length,
      kenmerken: ((offertes.data || []) as { offertenummer: string }[]).map((r) => r.offertenummer),
      ookAanServicemelding: ((offertes.data || []) as { ticket_id: string | null }[]).some((r) => r.ticket_id),
    },
    {
      soort: "Werkbonnen",
      aantal: (werkbonnen.data || []).length,
      kenmerken: ((werkbonnen.data || []) as { werkbonnummer: string }[]).map((r) => r.werkbonnummer),
      ookAanServicemelding: ((werkbonnen.data || []) as { ticket_id: string | null }[]).some((r) => r.ticket_id),
    },
    {
      soort: "Facturen",
      aantal: (facturen.data || []).length,
      kenmerken: ((facturen.data || []) as { factuurnummer: string }[]).map((r) => r.factuurnummer),
      ookAanServicemelding: ((facturen.data || []) as { ticket_id: string | null }[]).some((r) => r.ticket_id),
    },
    {
      soort: "Afspraken",
      aantal: (planning.data || []).length,
      kenmerken: ((planning.data || []) as { planning_nummer: string }[]).map((r) => r.planning_nummer),
    },
    { soort: "Notities", aantal: (notities.data || []).length, kenmerken: [] },
    { soort: "Statushistorie", aantal: (historie.data || []).length, kenmerken: [] },
    { soort: "Contactpersonen", aantal: (contactpersonen.data || []).length, kenmerken: [] },
    { soort: "Adressen", aantal: (adressen.data || []).length, kenmerken: [] },
    { soort: "Bestanden", aantal: alleBestandIds.size, kenmerken: [] },
  ].filter((regel) => regel.aantal > 0);

  return {
    leadBestaat: true,
    leadNaam: (lead as { naam: string }).naam,
    gekoppeld,
    totaalRecords: gekoppeld.reduce((som, regel) => som + regel.aantal, 0),
    bestandenInOpslag: alleBestandIds.size,
    waarschuwingen,
  };
}

export type VerwijderResultaat = {
  gelukt: boolean;
  /** Wat er per soort daadwerkelijk is verwijderd. */
  verwijderd: Record<string, number>;
  opslagobjecten: number;
  fouten: string[];
};

/**
 * Verwijdert de lead en alles wat eraan hangt, van kind naar ouder.
 *
 * De volgorde is niet vrij te kiezen. Facturen verwijzen naar werkbonnen en
 * offertes, werkbonnen naar offertes, planning en bestanden naar werkbonnen.
 * Wie de ouder eerst weghaalt, loopt tegen een sleutelfout aan of laat een
 * verweesde verwijzing achter.
 */
export async function verwijderLeadDefinitief(
  client: BeheerClient,
  leadId: string
): Promise<VerwijderResultaat> {
  const verwijderd: Record<string, number> = {};
  const fouten: string[] = [];

  const ids = await verzamelIds(client, leadId);

  // ── 1. Opslagobjecten ──
  // Eerst de bestanden, want zonder hun rij is het pad naar het object nergens
  // meer te vinden en blijft het als wees in een publieke bucket achter.
  const padenSet = new Map<string, string>();
  const { data: directeBestanden } = await client
    .from("bestanden")
    .select("id, pad")
    .eq("lead_id", leadId);
  ((directeBestanden || []) as { id: string; pad: string }[]).forEach((b) => padenSet.set(b.id, b.pad));

  for (const [kolom, waarden] of [
    ["werkbon_id", ids.werkbonnen],
    ["factuur_id", ids.facturen],
  ] as const) {
    if (waarden.length === 0) continue;
    const { data } = await client.from("bestanden").select("id, pad").in(kolom, waarden);
    ((data || []) as { id: string; pad: string }[]).forEach((b) => padenSet.set(b.id, b.pad));
  }

  const opslag = await verwijderOpslagObjecten(client, Array.from(padenSet.values()));
  fouten.push(...opslag.fouten);

  // ── 2. Bestandsrijen ──
  if (padenSet.size > 0) {
    const { error } = await client.from("bestanden").delete().in("id", Array.from(padenSet.keys()));
    if (error) fouten.push(`bestanden: ${error.message}`);
    else verwijderd["Bestanden"] = padenSet.size;
  }

  /** Verwijdert rijen en telt wat er weg is; slaat lege selecties over. */
  const verwijderIn = async (tabel: string, kolom: string, waarden: string[], label: string) => {
    if (waarden.length === 0) return;
    const { error, count } = await client
      .from(tabel)
      .delete({ count: "exact" })
      .in(kolom, waarden);
    if (error) fouten.push(`${tabel}: ${error.message}`);
    else if (count) verwijderd[label] = (verwijderd[label] || 0) + count;
  };

  const verwijderOpLead = async (tabel: string, label: string) => {
    const { error, count } = await client
      .from(tabel)
      .delete({ count: "exact" })
      .eq("lead_id", leadId);
    if (error) fouten.push(`${tabel}: ${error.message}`);
    else if (count) verwijderd[label] = (verwijderd[label] || 0) + count;
  };

  // ── 3. Kleinkinderen van werkbonnen en offertes ──
  await verwijderIn("werkbon_materialen", "werkbon_id", ids.werkbonnen, "Materiaalregels");
  await verwijderIn("werkbon_uren", "werkbon_id", ids.werkbonnen, "Urenregels");
  await verwijderIn("offerte_status_historie", "offerte_id", ids.offertes, "Offertehistorie");

  // ── 4. Meldingen, op elk van hun verwijzingen ──
  await verwijderOpLead("meldingen", "Meldingen");
  await verwijderIn("meldingen", "offerte_id", ids.offertes, "Meldingen");
  await verwijderIn("meldingen", "werkbon_id", ids.werkbonnen, "Meldingen");
  await verwijderIn("meldingen", "factuur_id", ids.facturen, "Meldingen");

  // ── 5. Records die naar werkbonnen wijzen ──
  await verwijderIn("planning", "werkbon_id", ids.werkbonnen, "Afspraken");
  await verwijderOpLead("planning", "Afspraken");

  // ── 6. Documenten, van kind naar ouder ──
  await verwijderOpLead("facturen", "Facturen");
  await verwijderOpLead("werkbonnen", "Werkbonnen");
  await verwijderOpLead("offertes", "Offertes");

  // ── 7. Directe kinderen van de lead ──
  await verwijderOpLead("lead_notities", "Notities");
  await verwijderOpLead("lead_status_historie", "Statushistorie");
  await verwijderOpLead("klant_contactpersonen", "Contactpersonen");
  await verwijderOpLead("klant_adressen", "Adressen");

  // ── 8. De lead zelf ──
  // Alleen als er hierboven niets misging: een half opgeruimde lead is beter
  // te herstellen dan losse records zonder lead om ze aan te herkennen.
  if (fouten.length === 0) {
    const { error } = await client.from("leads").delete().eq("id", leadId);
    if (error) fouten.push(`leads: ${error.message}`);
    else verwijderd["Lead"] = 1;
  }

  return {
    gelukt: fouten.length === 0,
    verwijderd,
    opslagobjecten: opslag.verwijderd,
    fouten,
  };
}
