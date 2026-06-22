import { supabase } from "./supabase";
import { getNextWerkbonNummer } from "./werkbonNummer";
import { Lead, Offerte } from "./types";

export async function createWerkbonFromOfferte(lead: Lead, offerte: Offerte) {
  if (!supabase) {
    return { data: null, error: "Supabase is niet geconfigureerd." };
  }

  const werkbonnummer = await getNextWerkbonNummer();

  const { data, error } = await supabase
    .from("werkbonnen")
    .insert({
      werkbonnummer,
      lead_id: lead.id,
      offerte_id: offerte.id,
      datum: new Date().toISOString(),
      klantnaam: lead.naam,
      adres: lead.plaats,
      telefoon: lead.telefoon,
      werkzaamheden: offerte.werkzaamheden || `${offerte.merk} ${offerte.model}`,
      status: "Concept",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}
