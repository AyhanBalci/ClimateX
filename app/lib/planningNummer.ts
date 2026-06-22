import { supabase } from "./supabase";

export async function getNextPlanningNummer(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PL-${year}-`;

  if (!supabase) {
    return `${prefix}0001`;
  }

  const { data } = await supabase
    .from("planning")
    .select("planning_nummer")
    .like("planning_nummer", `${prefix}%`)
    .order("planning_nummer", { ascending: false })
    .limit(1);

  const last = data && data[0] ? data[0].planning_nummer : null;
  const lastNumber = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0;
  const next = lastNumber + 1;

  return `${prefix}${String(next).padStart(4, "0")}`;
}
