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

/**
 * Verwijdert een lead met de bijbehorende notities, statushistorie, planning en
 * bestandsverwijzingen. Bedoeld om testaanvragen op te ruimen.
 *
 * Een lead met een offerte, werkbon of factuur wordt bewust geweigerd: dat zijn
 * zakelijke documenten met een eigen nummerreeks en administratieve waarde, die
 * horen niet als bijvangst van een opschoonactie te verdwijnen. De melding
 * vertelt precies wat er in de weg zit, zodat duidelijk is waarom.
 */
export async function deleteLead(leadId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const [offertes, werkbonnen, facturen] = await Promise.all([
    supabase.from("offertes").select("id").eq("lead_id", leadId),
    supabase.from("werkbonnen").select("id").eq("lead_id", leadId),
    supabase.from("facturen").select("id").eq("lead_id", leadId),
  ]);

  const leesFout = offertes.error || werkbonnen.error || facturen.error;
  if (leesFout) {
    return { error: `Kon niet controleren wat aan deze lead hangt: ${leesFout.message}` };
  }

  const blokkades = [
    { label: "offerte", aantal: offertes.data?.length ?? 0 },
    { label: "werkbon", aantal: werkbonnen.data?.length ?? 0 },
    { label: "factuur", aantal: facturen.data?.length ?? 0 },
  ].filter((item) => item.aantal > 0);

  if (blokkades.length > 0) {
    const omschrijving = blokkades
      .map((item) => `${item.aantal} ${item.label}${item.aantal === 1 ? "" : "s"}`)
      .join(" en ");
    return {
      error:
        `Deze lead kan niet worden verwijderd omdat er ${omschrijving} aan gekoppeld ${
          blokkades.reduce((som, item) => som + item.aantal, 0) === 1 ? "is" : "zijn"
        }. ` + `Verwijder die eerst, of zet de lead op "Verloren" om hem uit beeld te halen.`,
    };
  }

  // Deze records hebben zonder de lead geen betekenis meer en gaan mee.
  for (const tabel of ["lead_notities", "lead_status_historie", "planning", "bestanden"] as const) {
    const { error } = await supabase.from(tabel).delete().eq("lead_id", leadId);
    if (error) {
      return { error: `Opruimen van ${tabel} is mislukt: ${error.message}` };
    }
  }

  const { error: leadError } = await supabase.from("leads").delete().eq("id", leadId);
  if (leadError) {
    return { error: leadError.message };
  }

  return { error: null };
}
