import { supabase } from "./supabase";
import type { Melding } from "./types";

/** Hoeveel meldingen het paneel toont. Ouder blijft in de database staan. */
export const MELDINGEN_LIMIET = 30;

export async function fetchMeldingen(): Promise<{ data: Melding[]; error: string | null }> {
  if (!supabase) {
    return { data: [], error: "Supabase is niet geconfigureerd." };
  }

  const { data, error } = await supabase
    .from("meldingen")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MELDINGEN_LIMIET);

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: (data as Melding[]) || [], error: null };
}

export async function markeerGelezen(meldingId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }
  const { error } = await supabase.from("meldingen").update({ gelezen: true }).eq("id", meldingId);
  return { error: error ? error.message : null };
}

export async function markeerAllesGelezen() {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }
  // Alleen de ongelezen bijwerken, zodat we niet de hele tabel aanraken.
  const { error } = await supabase.from("meldingen").update({ gelezen: true }).eq("gelezen", false);
  return { error: error ? error.message : null };
}

/**
 * Luistert op nieuwe meldingen. Staat realtime replicatie in Supabase uit, dan
 * gebeurt er niets bijzonders: het paneel heeft zijn eigen vernieuwknop.
 */
export function abonneerOpMeldingen(onNieuweMelding: () => void): () => void {
  if (!supabase) return () => {};

  const kanaal = supabase.channel("meldingen-stroom");
  kanaal.on("postgres_changes", { event: "*", schema: "public", table: "meldingen" }, onNieuweMelding);
  kanaal.subscribe();

  return () => {
    supabase?.removeChannel(kanaal);
  };
}
