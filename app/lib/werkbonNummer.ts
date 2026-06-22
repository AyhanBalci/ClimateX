import { supabase } from "./supabase";

export async function getNextWerkbonNummer(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `WB-${year}-`;

  if (!supabase) {
    return `${prefix}0001`;
  }

  const { data } = await supabase
    .from("werkbonnen")
    .select("werkbonnummer")
    .like("werkbonnummer", `${prefix}%`)
    .order("werkbonnummer", { ascending: false })
    .limit(1);

  const last = data && data[0] ? data[0].werkbonnummer : null;
  const lastNumber = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0;
  const next = lastNumber + 1;

  return `${prefix}${String(next).padStart(4, "0")}`;
}
