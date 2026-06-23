import { supabase } from "./supabase";

export async function klantAccepteerOfferte(offerteId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error } = await supabase.rpc("klant_accepteer_offerte", { p_offerte_id: offerteId });
  return { error: error ? error.message : null };
}
