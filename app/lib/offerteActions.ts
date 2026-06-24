import { supabase } from "./supabase";
import { updateLeadStatus } from "./leadActions";

export async function markOfferteVerstuurd(offerteId: string, leadId: string | null) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: offerteError } = await supabase.from("offertes").update({ status: "Verstuurd" }).eq("id", offerteId);
  if (offerteError) {
    return { error: offerteError.message };
  }

  if (leadId) {
    const { error: leadError } = await updateLeadStatus(leadId, "Offerte verstuurd");
    if (leadError) {
      return { error: leadError };
    }
  }

  return { error: null };
}

export async function updateOfferteStatus(offerteId: string, leadId: string | null, status: "Geaccepteerd" | "Afgewezen") {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: offerteError } = await supabase.from("offertes").update({ status }).eq("id", offerteId);
  if (offerteError) {
    return { error: offerteError.message };
  }

  // Bij "Geaccepteerd" zet de database-trigger offerte_geaccepteerd_automatisering()
  // de leadstatus al op "Gewonnen" en maakt automatisch werkbon + planning aan.
  if (leadId && status === "Afgewezen") {
    const { error: leadError } = await updateLeadStatus(leadId, "Verloren");
    if (leadError) {
      return { error: leadError };
    }
  }

  return { error: null };
}
