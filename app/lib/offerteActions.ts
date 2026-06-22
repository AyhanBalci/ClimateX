import { supabase } from "./supabase";
import { updateLeadStatus } from "./leadActions";

export async function markOfferteVerstuurd(offerteId: string, leadId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: offerteError } = await supabase.from("offertes").update({ status: "Verstuurd" }).eq("id", offerteId);
  if (offerteError) {
    return { error: offerteError.message };
  }

  const { error: leadError } = await updateLeadStatus(leadId, "Offerte verstuurd");
  if (leadError) {
    return { error: leadError };
  }

  return { error: null };
}
