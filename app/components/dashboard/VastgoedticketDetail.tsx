"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Factuur,
  Offerte,
  Planning,
  Product,
  TicketNotitie,
  TicketStatusHistorie,
  Vastgoedticket,
  Werkbon,
} from "../../lib/types";
import { VASTGOEDTICKET_STATUS_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import {
  markTicketAfgerond,
  markTicketOfferteVerstuurd,
  updateTicketOfferteStatus,
  updateTicketStatus,
} from "../../lib/ticketActions";
import { createFactuurFromWerkbon, markFactuurBetaald } from "../../lib/factuurActions";
import { createPlanning } from "../../lib/planningActions";
import { toDateKey } from "../../lib/dateUtils";
import { getNextOfferteNummer } from "../../lib/offerteNummer";
import { downloadFactuurPdf } from "../../lib/generateFactuurPdf";
import FileUpload from "./FileUpload";
import KlantAccountKoppeling from "./KlantAccountKoppeling";
import OfferteActieKnoppen from "./OfferteActieKnoppen";
import OfferteKoppelingen from "./OfferteKoppelingen";
import { formatBedragRond, formatDatum, formatDatumTijd } from "../../lib/formatters";



type Props = {
  ticket: Vastgoedticket;
  onBack: () => void;
  onOpenWerkbon: (werkbon: Werkbon) => void;
  onOpenPlanning: (planning: Planning) => void;
};

export default function VastgoedticketDetail({ ticket, onBack, onOpenWerkbon, onOpenPlanning }: Props) {
  const [notities, setNotities] = useState<TicketNotitie[]>([]);
  const [historie, setHistorie] = useState<TicketStatusHistorie[]>([]);
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [afspraken, setAfspraken] = useState<Planning[]>([]);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [planningForm, setPlanningForm] = useState({
    medewerker: "",
    datum: toDateKey(new Date()),
    starttijd: "09:00",
    eindtijd: "10:00",
  });
  const [werkbonnen, setWerkbonnen] = useState<Werkbon[]>([]);
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [producten, setProducten] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [toewijzing, setToewijzing] = useState({
    medewerker: ticket.medewerker || "",
    monteur: ticket.monteur || "",
    geplande_datum: ticket.geplande_datum || "",
    geplande_tijd: ticket.geplande_tijd || "",
  });

  const [savingPlanning, setSavingPlanning] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingToewijzing, setSavingToewijzing] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [savingOfferte, setSavingOfferte] = useState(false);
  const [offerteActionId, setOfferteActionId] = useState<string | null>(null);
  const [werkbonActionId, setWerkbonActionId] = useState<string | null>(null);
  const [factuurActionId, setFactuurActionId] = useState<string | null>(null);
  const [savingAfgerond, setSavingAfgerond] = useState(false);

  const [offerteForm, setOfferteForm] = useState({
    productId: "",
    merk: "",
    model: "",
    prijs: "",
    werkzaamheden: "",
    opmerkingen: "",
  });

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const [notitiesRes, historieRes, offertesRes, werkbonnenRes, facturenRes, productenRes, afsprakenRes] = await Promise.all([
        supabase.from("ticket_notities").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: false }),
        supabase
          .from("ticket_status_historie")
          .select("*")
          .eq("ticket_id", ticket.id)
          .order("created_at", { ascending: false }),
        supabase.from("offertes").select("*").eq("ticket_id", ticket.id).order("datum", { ascending: false }),
        supabase.from("werkbonnen").select("*").eq("ticket_id", ticket.id).order("datum", { ascending: false }),
        supabase.from("facturen").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: false }),
        supabase.from("producten").select("*").eq("actief", true).order("merk", { ascending: true }),
        supabase.from("planning").select("*").eq("ticket_id", ticket.id).order("datum", { ascending: false }),
      ]);

      if (
        notitiesRes.error ||
        historieRes.error ||
        offertesRes.error ||
        werkbonnenRes.error ||
        facturenRes.error ||
        productenRes.error ||
        afsprakenRes.error
      ) {
        setError(
          notitiesRes.error?.message ||
            historieRes.error?.message ||
            offertesRes.error?.message ||
            werkbonnenRes.error?.message ||
            facturenRes.error?.message ||
            productenRes.error?.message ||
            afsprakenRes.error?.message ||
            "Onbekende fout."
        );
      } else {
        setNotities((notitiesRes.data as TicketNotitie[]) || []);
        setHistorie((historieRes.data as TicketStatusHistorie[]) || []);
        setOffertes((offertesRes.data as Offerte[]) || []);
        setWerkbonnen((werkbonnenRes.data as Werkbon[]) || []);
        setFacturen((facturenRes.data as Factuur[]) || []);
        setProducten((productenRes.data as Product[]) || []);
        setAfspraken((afsprakenRes.data as Planning[]) || []);
      }
      setLoading(false);
    }

    fetchDetails();
  }, [ticket.id]);

  const werkbonByOfferteId = useMemo(() => {
    const map: Record<string, Werkbon> = {};
    werkbonnen.forEach((werkbon) => {
      if (werkbon.offerte_id) map[werkbon.offerte_id] = werkbon;
    });
    return map;
  }, [werkbonnen]);

  const planningByWerkbonId = useMemo(() => {
    const map: Record<string, Planning> = {};
    afspraken.forEach((planning) => {
      if (planning.werkbon_id) map[planning.werkbon_id] = planning;
    });
    return map;
  }, [afspraken]);

  const handlePlanAfspraak = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingPlanning) return;
    if (!planningForm.medewerker.trim()) {
      setError("Vul een medewerker in om de afspraak in te plannen.");
      return;
    }

    setSavingPlanning(true);
    try {
      const { data, error: createError } = await createPlanning({
        titel: `Ticket ${currentTicket.ticketnummer}`,
        klantnaam: currentTicket.klant,
        ticket_id: currentTicket.id,
        medewerker: planningForm.medewerker.trim(),
        datum: planningForm.datum,
        starttijd: planningForm.starttijd,
        eindtijd: planningForm.eindtijd,
        adres: currentTicket.locatie,
        telefoon: currentTicket.telefoonnummer || "",
      });

      if (createError || !data) {
        setError(createError || "Afspraak inplannen is mislukt.");
        return;
      }
      setError(null);
      setAfspraken((current) => [data as Planning, ...current]);
      setShowPlanningForm(false);
    } finally {
      setSavingPlanning(false);
    }
  };

  const timeline = useMemo(() => {
    const items = [
      { id: "created", label: "Ticket aangemaakt", created_at: currentTicket.created_at },
      ...historie.map((entry) => ({
        id: entry.id,
        label: `Status gewijzigd naar "${entry.status}"`,
        created_at: entry.created_at,
      })),
      ...notities.map((note) => ({
        id: note.id,
        label: note.tekst,
        created_at: note.created_at,
      })),
    ];
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [currentTicket.created_at, historie, notities]);

  const handleStatusChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingStatus) return;

    setSavingStatus(true);
    try {
      const { error: statusError } = await updateTicketStatus(ticket.id, newStatus);
      if (statusError) {
        setError(statusError);
        return;
      }
      setError(null);
      setCurrentTicket((current) => ({ ...current, status: newStatus }));
      setHistorie((current) => [
        { id: `local-${Date.now()}`, ticket_id: ticket.id, status: newStatus, created_at: new Date().toISOString() },
        ...current,
      ]);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleToewijzingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || savingToewijzing) return;

    setSavingToewijzing(true);
    try {
      const { error: updateError } = await supabase
        .from("vastgoedtickets")
        .update({
          medewerker: toewijzing.medewerker.trim(),
          monteur: toewijzing.monteur.trim(),
          geplande_datum: toewijzing.geplande_datum || null,
          geplande_tijd: toewijzing.geplande_tijd.trim(),
        })
        .eq("id", ticket.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }
      setError(null);
      setCurrentTicket((current) => ({
        ...current,
        medewerker: toewijzing.medewerker.trim(),
        monteur: toewijzing.monteur.trim(),
        geplande_datum: toewijzing.geplande_datum || null,
        geplande_tijd: toewijzing.geplande_tijd.trim(),
      }));
    } finally {
      setSavingToewijzing(false);
    }
  };

  const handleAddNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newNote.trim() || !supabase || savingNote) return;

    setSavingNote(true);
    try {
      const { data, error: insertError } = await supabase
        .from("ticket_notities")
        .insert({ ticket_id: ticket.id, tekst: newNote.trim() })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }
      setNotities((current) => [data as TicketNotitie, ...current]);
      setNewNote("");
      setError(null);
    } finally {
      setSavingNote(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = producten.find((item) => item.id === productId);
    setOfferteForm((current) => ({
      ...current,
      productId,
      merk: product?.merk || "",
      model: product?.model || "",
      prijs: product ? String(product.prijs) : current.prijs,
    }));
  };

  const handleAddOfferte = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || savingOfferte) return;

    const prijsValue = Number(offerteForm.prijs);
    if (!offerteForm.merk.trim() || !offerteForm.model.trim() || !prijsValue) {
      setError("Kies een product en vul een geldige totaalprijs in voor de offerte.");
      return;
    }

    setSavingOfferte(true);
    try {
      const offertenummer = await getNextOfferteNummer();

      const { data, error: insertError } = await supabase
        .from("offertes")
        .insert({
          ticket_id: ticket.id,
          offertenummer,
          merk: offerteForm.merk.trim(),
          model: offerteForm.model.trim(),
          prijs: prijsValue,
          werkzaamheden: offerteForm.werkzaamheden.trim(),
          opmerkingen: offerteForm.opmerkingen.trim(),
          status: "Concept",
          datum: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setOffertes((current) => [data as Offerte, ...current]);
      setOfferteForm({ productId: "", merk: "", model: "", prijs: "", werkzaamheden: "", opmerkingen: "" });
      setError(null);
    } finally {
      setSavingOfferte(false);
    }
  };

  const handleMarkVerstuurd = async (offerte: Offerte) => {
    if (offerteActionId) return;

    setOfferteActionId(offerte.id);
    try {
      const { error: markError } = await markTicketOfferteVerstuurd(offerte.id, ticket.id);
      if (markError) {
        setError(markError);
        return;
      }
      setError(null);
      setOffertes((current) => current.map((item) => (item.id === offerte.id ? { ...item, status: "Verstuurd" } : item)));
      setCurrentTicket((current) => ({ ...current, status: "Offerte verstuurd" }));
    } finally {
      setOfferteActionId(null);
    }
  };

  const handleStatusBeslissing = async (offerte: Offerte, status: "Geaccepteerd" | "Afgewezen") => {
    if (offerteActionId) return;

    setOfferteActionId(offerte.id);
    try {
      const { error: statusError } = await updateTicketOfferteStatus(offerte.id, ticket.id, status);
      if (statusError) {
        setError(statusError);
        return;
      }
      setError(null);
      setOffertes((current) => current.map((item) => (item.id === offerte.id ? { ...item, status } : item)));
      if (status === "Geaccepteerd") {
        setCurrentTicket((current) => ({ ...current, status: "Offerte akkoord" }));
      }
    } finally {
      setOfferteActionId(null);
    }
  };

  const handleCreateFactuur = async (werkbon: Werkbon) => {
    if (werkbonActionId) return;

    setWerkbonActionId(werkbon.id);
    try {
      const offerte = offertes.find((item) => item.id === werkbon.offerte_id) || null;
      const { data, error: createError } = await createFactuurFromWerkbon(werkbon, offerte, ticket.id);
      if (createError || !data) {
        setError(createError || "Factuur aanmaken is mislukt.");
        return;
      }
      setError(null);
      setFacturen((current) => [data as Factuur, ...current]);
      setWerkbonnen((current) => current.map((item) => (item.id === werkbon.id ? { ...item, status: "Gefactureerd" } : item)));
      const { error: statusError } = await updateTicketStatus(ticket.id, "Factuur verstuurd");
      if (!statusError) {
        setCurrentTicket((current) => ({ ...current, status: "Factuur verstuurd" }));
      }
    } finally {
      setWerkbonActionId(null);
    }
  };

  const handleMarkBetaald = async (factuur: Factuur) => {
    if (factuurActionId) return;

    setFactuurActionId(factuur.id);
    try {
      const { error: markError } = await markFactuurBetaald(factuur.id);
      if (markError) {
        setError(markError);
        return;
      }
      setError(null);
      setFacturen((current) =>
        current.map((item) => (item.id === factuur.id ? { ...item, status: "Betaald", betaaldatum: new Date().toISOString() } : item))
      );
    } finally {
      setFactuurActionId(null);
    }
  };

  const handleMarkAfgerond = async () => {
    if (savingAfgerond) return;

    setSavingAfgerond(true);
    try {
      const { error: afgerondError } = await markTicketAfgerond(ticket.id);
      if (afgerondError) {
        setError(afgerondError);
        return;
      }
      setError(null);
      setCurrentTicket((current) => ({ ...current, status: "Afgerond" }));
      setNewStatus("Afgerond");
      setHistorie((current) => [
        { id: `local-${Date.now()}`, ticket_id: ticket.id, status: "Afgerond", created_at: new Date().toISOString() },
        ...current,
      ]);
    } finally {
      setSavingAfgerond(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cyan-300 transition hover:text-cyan-200">
        ← Terug naar ticketoverzicht
      </button>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Vastgoedticket</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{currentTicket.ticketnummer}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
              {currentTicket.status}
            </span>
            {currentTicket.status !== "Afgerond" ? (
              <button
                onClick={handleMarkAfgerond}
                disabled={savingAfgerond}
                className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingAfgerond ? "Bezig…" : "Markeer als afgerond"}
              </button>
            ) : null}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Klant", value: currentTicket.klant },
            { label: "Locatie", value: currentTicket.locatie },
            { label: "Contactpersoon", value: currentTicket.contactpersoon || "—" },
            { label: "Telefoonnummer", value: currentTicket.telefoonnummer || "—" },
            { label: "Type melding", value: currentTicket.type_melding || "—" },
            { label: "Prioriteit", value: currentTicket.prioriteit },
            { label: "Datum", value: formatDatumTijd(currentTicket.datum) },
            { label: "Omschrijving", value: currentTicket.omschrijving || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm text-slate-200">{item.value}</p>
            </div>
          ))}
        </dl>

        {error ? (
          <p role="alert" className="mt-6 text-sm text-rose-400">
            {error}
          </p>
        ) : null}
        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

        <div className="mt-6">
          <KlantAccountKoppeling
            naam={currentTicket.klant}
            leadId={undefined}
            ticketId={currentTicket.id}
            klantUserId={currentTicket.klant_user_id}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Status wijzigen</h3>
          <form onSubmit={handleStatusChange} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={newStatus}
              onChange={(event) => setNewStatus(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            >
              {VASTGOEDTICKET_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={savingStatus}
              className="shrink-0 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingStatus ? "Bezig met opslaan…" : "Opslaan"}
            </button>
          </form>

          <h3 className="mt-8 text-lg font-semibold text-white">Toewijzing</h3>
          <form onSubmit={handleToewijzingSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Medewerker"
              value={toewijzing.medewerker}
              onChange={(event) => setToewijzing((current) => ({ ...current, medewerker: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Installateur"
              value={toewijzing.monteur}
              onChange={(event) => setToewijzing((current) => ({ ...current, monteur: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="date"
              value={toewijzing.geplande_datum}
              onChange={(event) => setToewijzing((current) => ({ ...current, geplande_datum: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={toewijzing.geplande_tijd}
              onChange={(event) => setToewijzing((current) => ({ ...current, geplande_tijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={savingToewijzing}
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {savingToewijzing ? "Bezig met opslaan…" : "Toewijzing opslaan"}
            </button>
          </form>

          <h3 className="mt-8 text-lg font-semibold text-white">Notitie toevoegen</h3>
          <form onSubmit={handleAddNote} className="mt-4 space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Schrijf een notitie over dit ticket"
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            />
            <button
              type="submit"
              disabled={savingNote}
              className="w-full rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {savingNote ? "Bezig met opslaan…" : "Notitie opslaan"}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Tijdlijn</h3>
          <div className="mt-4 space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDatumTijd(item.created_at)}</p>
                <p className="mt-2 text-sm text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Nieuwe offerte</h3>
        <form onSubmit={handleAddOfferte} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={offerteForm.productId}
            onChange={(event) => handleProductSelect(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          >
            <option value="">Kies een product...</option>
            {producten.map((product) => (
              <option key={product.id} value={product.id}>
                {product.merk} {product.model}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="Totaalprijs (€)"
            value={offerteForm.prijs}
            onChange={(event) => setOfferteForm((current) => ({ ...current, prijs: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <textarea
            rows={3}
            placeholder="Werkzaamheden (één per regel)"
            value={offerteForm.werkzaamheden}
            onChange={(event) => setOfferteForm((current) => ({ ...current, werkzaamheden: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <textarea
            rows={2}
            placeholder="Opmerkingen voor de offerte"
            value={offerteForm.opmerkingen}
            onChange={(event) => setOfferteForm((current) => ({ ...current, opmerkingen: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <button
            type="submit"
            disabled={savingOfferte}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {savingOfferte ? "Bezig met genereren…" : "Offerte genereren"}
          </button>
        </form>

        {offertes.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm uppercase tracking-[0.18em] text-slate-500">Gekoppelde offertes</h4>
            {offertes.map((offerte) => (
              <div key={offerte.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{offerte.offertenummer}</p>
                    <p className="mt-1 text-slate-400">{offerte.merk} {offerte.model}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {offerte.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-400">{formatBedragRond(offerte.prijs)} · {formatDatumTijd(offerte.datum)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OfferteActieKnoppen
                    offerte={offerte}
                    klant={{
                      naam: currentTicket.klant,
                      telefoon: currentTicket.telefoonnummer || "",
                      email: "",
                      plaats: currentTicket.locatie,
                      type_woning: "",
                    }}
                  />
                  {offerte.status === "Concept" ? (
                    <button
                      onClick={() => handleMarkVerstuurd(offerte)}
                      disabled={offerteActionId === offerte.id}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {offerteActionId === offerte.id ? "Bezig…" : "Markeer als verstuurd"}
                    </button>
                  ) : null}
                  {offerte.status === "Verstuurd" ? (
                    <>
                      <button
                        onClick={() => handleStatusBeslissing(offerte, "Geaccepteerd")}
                        disabled={offerteActionId === offerte.id}
                        className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Geaccepteerd
                      </button>
                      <button
                        onClick={() => handleStatusBeslissing(offerte, "Afgewezen")}
                        disabled={offerteActionId === offerte.id}
                        className="rounded-full bg-rose-500/10 px-4 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Afgewezen
                      </button>
                    </>
                  ) : null}
                  {offerte.status === "Geaccepteerd" ? (
                    <OfferteKoppelingen
                      werkbon={werkbonByOfferteId[offerte.id] || null}
                      planning={
                        werkbonByOfferteId[offerte.id]
                          ? planningByWerkbonId[werkbonByOfferteId[offerte.id].id] || null
                          : null
                      }
                      onOpenWerkbon={onOpenWerkbon}
                      onOpenPlanning={onOpenPlanning}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Gekoppelde werkbonnen</h3>
        {werkbonnen.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nog geen werkbonnen. Maak er één aan vanuit een geaccepteerde offerte.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {werkbonnen.map((werkbon) => (
              <div key={werkbon.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-white">{werkbon.werkbonnummer}</p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {werkbon.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-400">{werkbon.monteur || "Nog geen installateur toegewezen"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => onOpenWerkbon(werkbon)}
                    className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Openen
                  </button>
                  {werkbon.status === "Gereed" ? (
                    <button
                      onClick={() => handleCreateFactuur(werkbon)}
                      disabled={werkbonActionId === werkbon.id}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {werkbonActionId === werkbon.id ? "Bezig…" : "Maak factuur"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Gekoppelde facturen</h3>
        {facturen.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nog geen facturen. Maak er één aan vanuit een gereed werkbon.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {facturen.map((factuur) => (
              <div key={factuur.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-white">{factuur.factuurnummer}</p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {factuur.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-400">{formatBedragRond(factuur.totaal)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadFactuurPdf(factuur)}
                    className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    PDF downloaden
                  </button>
                  {factuur.status !== "Betaald" ? (
                    <button
                      onClick={() => handleMarkBetaald(factuur)}
                      disabled={factuurActionId === factuur.id}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {factuurActionId === factuur.id ? "Bezig…" : "Markeer betaald"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Planning</h3>
          <button
            onClick={() => setShowPlanningForm((current) => !current)}
            className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {showPlanningForm ? "Annuleren" : "+ Plan afspraak"}
          </button>
        </div>

        {showPlanningForm ? (
          <form onSubmit={handlePlanAfspraak} className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-[#090909] p-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Medewerker"
              value={planningForm.medewerker}
              onChange={(event) => setPlanningForm((current) => ({ ...current, medewerker: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="date"
              value={planningForm.datum}
              onChange={(event) => setPlanningForm((current) => ({ ...current, datum: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={planningForm.starttijd}
              onChange={(event) => setPlanningForm((current) => ({ ...current, starttijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={planningForm.eindtijd}
              onChange={(event) => setPlanningForm((current) => ({ ...current, eindtijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={savingPlanning}
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {savingPlanning ? "Bezig met inplannen…" : "Inplannen"}
            </button>
          </form>
        ) : null}

        {afspraken.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nog geen afspraken ingepland voor dit ticket.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {afspraken.map((afspraak) => (
              <div key={afspraak.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090909] p-3 text-sm">
                <div>
                  <p className="font-semibold text-white">{formatDatum(afspraak.datum)} {afspraak.starttijd.slice(0, 5)}</p>
                  <p className="text-slate-400">{afspraak.medewerker} · {afspraak.status}</p>
                </div>
                <button
                  onClick={() => onOpenPlanning(afspraak)}
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  Openen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Foto&apos;s en bestanden</h3>
        <div className="mt-4">
          <FileUpload ticketId={ticket.id} categorieen={["Voor", "Tijdens", "Na", "Overig"]} />
        </div>
      </div>
    </div>
  );
}
