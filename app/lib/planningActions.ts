import { supabase } from "./supabase";
import { getNextPlanningNummer } from "./planningNummer";
import { MEDEWERKER_KLEUREN } from "./constants";
import { Planning } from "./types";

export function getMedewerkerKleur(medewerker: string): string {
  if (!medewerker) return MEDEWERKER_KLEUREN[0];
  let hash = 0;
  for (let i = 0; i < medewerker.length; i++) {
    hash = (hash * 31 + medewerker.charCodeAt(i)) % 997;
  }
  return MEDEWERKER_KLEUREN[hash % MEDEWERKER_KLEUREN.length];
}

type CreatePlanningPayload = {
  titel: string;
  omschrijving?: string;
  klantnaam?: string;
  lead_id?: string | null;
  ticket_id?: string | null;
  werkbon_id?: string | null;
  medewerker: string;
  datum: string;
  starttijd: string;
  eindtijd: string;
  adres?: string;
  telefoon?: string;
  opmerkingen?: string;
};

export async function createPlanning(payload: CreatePlanningPayload) {
  if (!supabase) {
    return { data: null, error: "Supabase is niet geconfigureerd." };
  }

  const planning_nummer = await getNextPlanningNummer();

  const { data, error } = await supabase
    .from("planning")
    .insert({
      planning_nummer,
      titel: payload.titel,
      omschrijving: payload.omschrijving || null,
      klantnaam: payload.klantnaam || null,
      lead_id: payload.lead_id || null,
      ticket_id: payload.ticket_id || null,
      werkbon_id: payload.werkbon_id || null,
      medewerker: payload.medewerker,
      datum: payload.datum,
      starttijd: payload.starttijd,
      eindtijd: payload.eindtijd,
      status: "Ingepland",
      kleur: getMedewerkerKleur(payload.medewerker),
      adres: payload.adres || null,
      telefoon: payload.telefoon || null,
      opmerkingen: payload.opmerkingen || null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

const PLANNING_TO_WERKBON_STATUS: Record<string, string> = {
  Ingepland: "Gepland",
  Onderweg: "Onderweg",
  Aangekomen: "Bezig",
  Bezig: "Bezig",
  Afgerond: "Gereed",
};

const PLANNING_TO_TICKET_STATUS: Record<string, string> = {
  Ingepland: "Werk ingepland",
  Onderweg: "Monteur onderweg",
  Aangekomen: "Op locatie",
  Afgerond: "Afgerond",
};

export async function updatePlanningStatus(planning: Planning, status: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: planningError } = await supabase.from("planning").update({ status }).eq("id", planning.id);
  if (planningError) {
    return { error: planningError.message };
  }

  if (planning.werkbon_id && PLANNING_TO_WERKBON_STATUS[status]) {
    const { error: werkbonError } = await supabase
      .from("werkbonnen")
      .update({ status: PLANNING_TO_WERKBON_STATUS[status] })
      .eq("id", planning.werkbon_id);
    if (werkbonError) {
      return { error: werkbonError.message };
    }
  }

  if (planning.ticket_id && PLANNING_TO_TICKET_STATUS[status]) {
    const { error: ticketError } = await supabase
      .from("vastgoedtickets")
      .update({ status: PLANNING_TO_TICKET_STATUS[status] })
      .eq("id", planning.ticket_id);
    if (ticketError) {
      return { error: ticketError.message };
    }
    await supabase
      .from("ticket_status_historie")
      .insert({ ticket_id: planning.ticket_id, status: PLANNING_TO_TICKET_STATUS[status] });
  }

  return { error: null };
}

export async function deletePlanning(planningId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }
  const { error } = await supabase.from("planning").delete().eq("id", planningId);
  return { error: error ? error.message : null };
}
