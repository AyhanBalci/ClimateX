import { supabase } from "./supabase";

export async function getNextFactuurNummer(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  if (!supabase) {
    return `${prefix}0001`;
  }

  const { data } = await supabase
    .from("facturen")
    .select("factuurnummer")
    .like("factuurnummer", `${prefix}%`)
    .order("factuurnummer", { ascending: false })
    .limit(1);

  const last = data && data[0] ? data[0].factuurnummer : null;
  const lastNumber = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0;
  const next = lastNumber + 1;

  return `${prefix}${String(next).padStart(4, "0")}`;
}
