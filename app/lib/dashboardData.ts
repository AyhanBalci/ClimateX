/**
 * Ophalen van de dashboardgegevens uit Supabase.
 *
 * De rekenregels staan bewust in `dashboardBerekeningen.ts`: die hebben geen
 * databaseverbinding nodig en zijn daardoor los te controleren.
 */

import { supabase } from "./supabase";
import {
  DashboardData,
  DashboardFactuur,
  DashboardLead,
  DashboardOfferte,
  DashboardTicket,
  DashboardWerkbon,
  LEGE_DASHBOARD_DATA,
} from "./dashboardBerekeningen";

export * from "./dashboardBerekeningen";

export async function fetchDashboardData(): Promise<{ data: DashboardData; error: string | null }> {
  if (!supabase) {
    return { data: LEGE_DASHBOARD_DATA, error: "Supabase is niet geconfigureerd." };
  }

  const [leadsRes, offertesRes, werkbonnenRes, facturenRes, ticketsRes] = await Promise.all([
    supabase.from("leads").select("id, naam, status, created_at"),
    supabase.from("offertes").select("id, offertenummer, status, prijs, datum"),
    supabase.from("werkbonnen").select("id, werkbonnummer, klantnaam, status, created_at"),
    supabase.from("facturen").select("id, factuurnummer, klant, status, totaal, betaaldatum, created_at"),
    supabase.from("vastgoedtickets").select("id, ticketnummer, klant, status, prioriteit, created_at"),
  ]);

  const fout =
    leadsRes.error?.message ||
    offertesRes.error?.message ||
    werkbonnenRes.error?.message ||
    facturenRes.error?.message ||
    ticketsRes.error?.message ||
    null;

  if (fout) {
    return { data: LEGE_DASHBOARD_DATA, error: fout };
  }

  return {
    data: {
      leads: (leadsRes.data as DashboardLead[]) || [],
      offertes: (offertesRes.data as DashboardOfferte[]) || [],
      werkbonnen: (werkbonnenRes.data as DashboardWerkbon[]) || [],
      facturen: (facturenRes.data as DashboardFactuur[]) || [],
      tickets: (ticketsRes.data as DashboardTicket[]) || [],
    },
    error: null,
  };
}

/**
 * Luistert op wijzigingen in de tabellen die het dashboard toont en roept
 * `onWijziging` aan zodra er iets verandert. Staat realtime replicatie in
 * Supabase uit, dan gebeurt er niets bijzonders: de knop "Vernieuwen" blijft de
 * terugvaloptie.
 */
export function abonneerOpDashboardWijzigingen(onWijziging: () => void): () => void {
  if (!supabase) return () => {};

  const tabellen = ["leads", "offertes", "werkbonnen", "facturen", "vastgoedtickets"];
  const kanaal = supabase.channel("dashboard-wijzigingen");

  tabellen.forEach((tabel) => {
    kanaal.on("postgres_changes", { event: "*", schema: "public", table: tabel }, onWijziging);
  });

  kanaal.subscribe();

  return () => {
    supabase?.removeChannel(kanaal);
  };
}
