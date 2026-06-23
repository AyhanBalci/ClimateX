import { supabase } from "./supabase";
import { Factuur, Offerte, Planning, TicketKlantBericht, Vastgoedticket, Werkbon } from "./types";

export async function getMyLeadAndTicketIds(userId: string) {
  if (!supabase) return { leadIds: [], ticketIds: [] };

  const [leadsRes, ticketsRes] = await Promise.all([
    supabase.from("leads").select("id").eq("klant_user_id", userId),
    supabase.from("vastgoedtickets").select("id").eq("klant_user_id", userId),
  ]);

  return {
    leadIds: (leadsRes.data || []).map((row) => row.id),
    ticketIds: (ticketsRes.data || []).map((row) => row.id),
  };
}

function buildOrFilter(leadIds: string[], ticketIds: string[]) {
  const parts: string[] = [];
  if (leadIds.length > 0) parts.push(`lead_id.in.(${leadIds.join(",")})`);
  if (ticketIds.length > 0) parts.push(`ticket_id.in.(${ticketIds.join(",")})`);
  return parts.join(",");
}

export async function getMyOffertes(leadIds: string[], ticketIds: string[]): Promise<Offerte[]> {
  if (!supabase || (leadIds.length === 0 && ticketIds.length === 0)) return [];
  const { data, error } = await supabase
    .from("offertes")
    .select("*, leads(naam, telefoon, email, plaats, type_woning), vastgoedtickets(klant, locatie, contactpersoon, telefoonnummer)")
    .or(buildOrFilter(leadIds, ticketIds))
    .order("datum", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Offerte[]) || [];
}

export async function getMyFacturen(leadIds: string[], ticketIds: string[]): Promise<Factuur[]> {
  if (!supabase || (leadIds.length === 0 && ticketIds.length === 0)) return [];
  const { data, error } = await supabase
    .from("facturen")
    .select("*")
    .or(buildOrFilter(leadIds, ticketIds))
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Factuur[]) || [];
}

export async function getMyWerkbonnen(leadIds: string[], ticketIds: string[]): Promise<Werkbon[]> {
  if (!supabase || (leadIds.length === 0 && ticketIds.length === 0)) return [];
  const { data, error } = await supabase
    .from("werkbonnen")
    .select("*")
    .or(buildOrFilter(leadIds, ticketIds))
    .order("datum", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Werkbon[]) || [];
}

export async function getMyTicketById(ticketId: string): Promise<Vastgoedticket | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("vastgoedtickets").select("*").eq("id", ticketId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Vastgoedticket) || null;
}

export async function getMyTickets(userId: string): Promise<Vastgoedticket[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vastgoedtickets")
    .select("*")
    .eq("klant_user_id", userId)
    .order("datum", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Vastgoedticket[]) || [];
}

export async function getMyPlanning(leadIds: string[], ticketIds: string[]): Promise<Planning[]> {
  if (!supabase || (leadIds.length === 0 && ticketIds.length === 0)) return [];
  const { data, error } = await supabase
    .from("planning")
    .select("*")
    .or(buildOrFilter(leadIds, ticketIds))
    .order("datum", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Planning[]) || [];
}

export async function getTicketBerichten(ticketId: string): Promise<TicketKlantBericht[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ticket_klant_berichten")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as TicketKlantBericht[]) || [];
}

export async function addTicketBericht(ticketId: string, userId: string, tekst: string) {
  if (!supabase) return { error: "Supabase is niet geconfigureerd." };
  const { error } = await supabase
    .from("ticket_klant_berichten")
    .insert({ ticket_id: ticketId, klant_user_id: userId, tekst });
  return { error: error ? error.message : null };
}
