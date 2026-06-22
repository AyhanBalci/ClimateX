import { supabase } from "./supabase";
import { getNextTicketNummer } from "./ticketNummer";
import { getNextWerkbonNummer } from "./werkbonNummer";
import { Offerte, Vastgoedticket } from "./types";

export async function updateTicketStatus(ticketId: string, status: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: ticketError } = await supabase.from("vastgoedtickets").update({ status }).eq("id", ticketId);
  if (ticketError) {
    return { error: ticketError.message };
  }

  const { error: historieError } = await supabase.from("ticket_status_historie").insert({ ticket_id: ticketId, status });
  if (historieError) {
    return { error: historieError.message };
  }

  return { error: null };
}

export async function createTicket(payload: {
  klant: string;
  locatie: string;
  contactpersoon: string;
  telefoonnummer: string;
  type_melding: string;
  prioriteit: string;
  omschrijving: string;
}) {
  if (!supabase) {
    return { data: null, error: "Supabase is niet geconfigureerd." };
  }

  const ticketnummer = await getNextTicketNummer();

  const { data, error } = await supabase
    .from("vastgoedtickets")
    .insert({
      ticketnummer,
      datum: new Date().toISOString(),
      klant: payload.klant,
      locatie: payload.locatie,
      contactpersoon: payload.contactpersoon,
      telefoonnummer: payload.telefoonnummer,
      type_melding: payload.type_melding,
      prioriteit: payload.prioriteit,
      omschrijving: payload.omschrijving,
      status: "Nieuw",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  await supabase.from("ticket_status_historie").insert({ ticket_id: data.id, status: "Nieuw" });

  return { data, error: null };
}

export async function markTicketOfferteVerstuurd(offerteId: string, ticketId: string) {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: offerteError } = await supabase.from("offertes").update({ status: "Verstuurd" }).eq("id", offerteId);
  if (offerteError) {
    return { error: offerteError.message };
  }

  return updateTicketStatus(ticketId, "Offerte verstuurd");
}

export async function updateTicketOfferteStatus(offerteId: string, ticketId: string, status: "Geaccepteerd" | "Afgewezen") {
  if (!supabase) {
    return { error: "Supabase is niet geconfigureerd." };
  }

  const { error: offerteError } = await supabase.from("offertes").update({ status }).eq("id", offerteId);
  if (offerteError) {
    return { error: offerteError.message };
  }

  if (status === "Geaccepteerd") {
    return updateTicketStatus(ticketId, "Offerte akkoord");
  }

  return { error: null };
}

export async function createWerkbonFromTicket(ticket: Vastgoedticket, offerte: Offerte | null) {
  if (!supabase) {
    return { data: null, error: "Supabase is niet geconfigureerd." };
  }

  const werkbonnummer = await getNextWerkbonNummer();

  const { data, error } = await supabase
    .from("werkbonnen")
    .insert({
      werkbonnummer,
      ticket_id: ticket.id,
      offerte_id: offerte?.id ?? null,
      datum: new Date().toISOString(),
      klantnaam: ticket.klant,
      adres: ticket.locatie,
      telefoon: ticket.telefoonnummer,
      monteur: ticket.monteur,
      werkzaamheden: offerte?.werkzaamheden || ticket.omschrijving || "",
      status: "Concept",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const { error: statusError } = await updateTicketStatus(ticket.id, "Werk ingepland");
  if (statusError) {
    return { data, error: statusError };
  }

  return { data, error: null };
}

export async function markTicketAfgerond(ticketId: string) {
  return updateTicketStatus(ticketId, "Afgerond");
}
