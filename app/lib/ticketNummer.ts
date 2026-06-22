import { supabase } from "./supabase";

export async function getNextTicketNummer(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VT-${year}-`;

  if (!supabase) {
    return `${prefix}0001`;
  }

  const { data } = await supabase
    .from("vastgoedtickets")
    .select("ticketnummer")
    .like("ticketnummer", `${prefix}%`)
    .order("ticketnummer", { ascending: false })
    .limit(1);

  const last = data && data[0] ? data[0].ticketnummer : null;
  const lastNumber = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0;
  const next = lastNumber + 1;

  return `${prefix}${String(next).padStart(4, "0")}`;
}
