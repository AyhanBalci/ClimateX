import { supabase } from "./supabase";

export async function updateLeadStatus(leadId: string, newStatus: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: updateError } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
  if (updateError) {
    return { error: updateError.message };
  }

  const { error: historieError } = await supabase
    .from("lead_status_historie")
    .insert({ lead_id: leadId, status: newStatus });
  if (historieError) {
    return { error: historieError.message };
  }

  return { error: null };
}
