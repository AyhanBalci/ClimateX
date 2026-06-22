import { supabase } from "./supabase";
import { getNextFactuurNummer } from "./factuurNummer";
import { Werkbon, Offerte } from "./types";

const BTW_PERCENTAGE = 0.21;

export async function createFactuurFromWerkbon(werkbon: Werkbon, offerte: Offerte | null, ticketId: string | null = null) {
  if (!supabase) {
    return { data: null, error: "Supabase is niet geconfigureerd." };
  }

  const factuurnummer = await getNextFactuurNummer();
  const bedrag = offerte?.prijs ?? 0;
  const btw = Math.round(bedrag * BTW_PERCENTAGE * 100) / 100;
  const totaal = Math.round((bedrag + btw) * 100) / 100;

  const { data, error } = await supabase
    .from("facturen")
    .insert({
      factuurnummer,
      lead_id: werkbon.lead_id,
      klant: werkbon.klantnaam,
      offerte_id: werkbon.offerte_id,
      werkbon_id: werkbon.id,
      ticket_id: ticketId ?? werkbon.ticket_id,
      bedrag,
      btw,
      totaal,
      status: "Concept",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const { error: werkbonError } = await supabase.from("werkbonnen").update({ status: "Gefactureerd" }).eq("id", werkbon.id);
  if (werkbonError) {
    return { data, error: werkbonError.message };
  }

  return { data, error: null };
}

export async function markFactuurBetaald(factuurId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error } = await supabase
    .from("facturen")
    .update({ status: "Betaald", betaaldatum: new Date().toISOString() })
    .eq("id", factuurId);

  return { error: error ? error.message : null };
}
