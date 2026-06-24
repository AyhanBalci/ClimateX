"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Lead, LeadNotitie, LeadStatusHistorie, Offerte, Planning, Product, Werkbon } from "../../lib/types";
import { STATUS_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { updateLeadStatus } from "../../lib/leadActions";
import { markOfferteVerstuurd, updateOfferteStatus } from "../../lib/offerteActions";
import { getNextOfferteNummer } from "../../lib/offerteNummer";
import KlantAccountKoppeling from "./KlantAccountKoppeling";
import OfferteActieKnoppen from "./OfferteActieKnoppen";
import OfferteKoppelingen from "./OfferteKoppelingen";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

type Props = {
  lead: Lead;
  onBack: () => void;
  onLeadUpdated: (leadId: string, newStatus: string) => void;
  onOpenWerkbon: (werkbon: Werkbon) => void;
  onOpenPlanning: (planning: Planning) => void;
};

export default function LeadDetail({ lead, onBack, onLeadUpdated, onOpenWerkbon, onOpenPlanning }: Props) {
  const [notities, setNotities] = useState<LeadNotitie[]>([]);
  const [historie, setHistorie] = useState<LeadStatusHistorie[]>([]);
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [producten, setProducten] = useState<Product[]>([]);
  const [werkbonnen, setWerkbonnen] = useState<Werkbon[]>([]);
  const [planningen, setPlanningen] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState(lead.status);

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

      const [notitiesRes, historieRes, offertesRes, productenRes, werkbonnenRes, planningRes] = await Promise.all([
        supabase.from("lead_notities").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
        supabase.from("lead_status_historie").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
        supabase.from("offertes").select("*").eq("lead_id", lead.id).order("datum", { ascending: false }),
        supabase.from("producten").select("*").eq("actief", true).order("merk", { ascending: true }),
        supabase.from("werkbonnen").select("*").eq("lead_id", lead.id),
        supabase.from("planning").select("*").eq("lead_id", lead.id),
      ]);

      if (notitiesRes.error || historieRes.error || offertesRes.error || productenRes.error || werkbonnenRes.error || planningRes.error) {
        setError(
          notitiesRes.error?.message ||
            historieRes.error?.message ||
            offertesRes.error?.message ||
            productenRes.error?.message ||
            werkbonnenRes.error?.message ||
            planningRes.error?.message ||
            "Onbekende fout."
        );
      } else {
        setNotities((notitiesRes.data as LeadNotitie[]) || []);
        setHistorie((historieRes.data as LeadStatusHistorie[]) || []);
        setOffertes((offertesRes.data as Offerte[]) || []);
        setProducten((productenRes.data as Product[]) || []);
        setWerkbonnen((werkbonnenRes.data as Werkbon[]) || []);
        setPlanningen((planningRes.data as Planning[]) || []);
      }
      setLoading(false);
    }

    fetchDetails();
  }, [lead.id]);

  const timeline = useMemo(() => {
    const items = [
      { id: "created", type: "aangemaakt" as const, label: "Lead aangemaakt", created_at: lead.created_at },
      ...historie.map((entry) => ({
        id: entry.id,
        type: "status" as const,
        label: `Status gewijzigd naar "${entry.status}"`,
        created_at: entry.created_at,
      })),
      ...notities.map((note) => ({
        id: note.id,
        type: "notitie" as const,
        label: note.tekst,
        created_at: note.created_at,
      })),
    ];
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [lead.created_at, historie, notities]);

  const werkbonByOfferteId = useMemo(() => {
    const map: Record<string, Werkbon> = {};
    werkbonnen.forEach((werkbon) => {
      if (werkbon.offerte_id) map[werkbon.offerte_id] = werkbon;
    });
    return map;
  }, [werkbonnen]);

  const planningByWerkbonId = useMemo(() => {
    const map: Record<string, Planning> = {};
    planningen.forEach((planning) => {
      if (planning.werkbon_id) map[planning.werkbon_id] = planning;
    });
    return map;
  }, [planningen]);

  const handleAddNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newNote.trim() || !supabase) return;

    const { data, error: insertError } = await supabase
      .from("lead_notities")
      .insert({ lead_id: lead.id, tekst: newNote.trim() })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNotities((current) => [data as LeadNotitie, ...current]);
    setNewNote("");
    setError(null);
  };

  const handleStatusChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { error: statusError } = await updateLeadStatus(lead.id, newStatus);
    if (statusError) {
      setError(statusError);
      return;
    }
    setError(null);
    setHistorie((current) => [
      { id: `local-${Date.now()}`, lead_id: lead.id, status: newStatus, created_at: new Date().toISOString() },
      ...current,
    ]);
    onLeadUpdated(lead.id, newStatus);
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
    if (!supabase) return;

    const prijsValue = Number(offerteForm.prijs);
    if (!offerteForm.merk.trim() || !offerteForm.model.trim() || !prijsValue) {
      setError("Kies een product en vul een geldige totaalprijs in voor de offerte.");
      return;
    }

    const offertenummer = await getNextOfferteNummer();

    const { data, error: insertError } = await supabase
      .from("offertes")
      .insert({
        lead_id: lead.id,
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
  };

  const handleMarkVerstuurd = async (offerte: Offerte) => {
    const { error: markError } = await markOfferteVerstuurd(offerte.id, lead.id);
    if (markError) {
      setError(markError);
      return;
    }
    setError(null);
    setOffertes((current) => current.map((item) => (item.id === offerte.id ? { ...item, status: "Verstuurd" } : item)));
    setHistorie((current) => [
      { id: `local-${Date.now()}`, lead_id: lead.id, status: "Offerte verstuurd", created_at: new Date().toISOString() },
      ...current,
    ]);
    onLeadUpdated(lead.id, "Offerte verstuurd");
  };

  const handleStatusBeslissing = async (offerte: Offerte, status: "Geaccepteerd" | "Afgewezen") => {
    const { error: statusError } = await updateOfferteStatus(offerte.id, lead.id, status);
    if (statusError) {
      setError(statusError);
      return;
    }
    setError(null);
    setOffertes((current) => current.map((item) => (item.id === offerte.id ? { ...item, status } : item)));
    const leadStatus = status === "Geaccepteerd" ? "Gewonnen" : "Verloren";
    setHistorie((current) => [
      { id: `local-${Date.now()}`, lead_id: lead.id, status: leadStatus, created_at: new Date().toISOString() },
      ...current,
    ]);
    onLeadUpdated(lead.id, leadStatus);
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cyan-300 transition hover:text-cyan-200">
        ← Terug naar leadoverzicht
      </button>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Lead</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{lead.naam}</h2>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
            {lead.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Telefoon", value: lead.telefoon },
            { label: "Email", value: lead.email },
            { label: "Plaats", value: lead.plaats },
            { label: "Type woning", value: lead.type_woning },
            { label: "Aangemaakt op", value: formatDateTime(lead.created_at) },
            { label: "Opmerkingen", value: lead.opmerkingen || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm text-slate-200">{item.value}</p>
            </div>
          ))}
        </dl>

        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}
        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

        <div className="mt-6">
          <KlantAccountKoppeling naam={lead.naam} email={lead.email} leadId={lead.id} klantUserId={lead.klant_user_id} />
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
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button type="submit" className="shrink-0 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Opslaan
            </button>
          </form>

          <h3 className="mt-8 text-lg font-semibold text-white">Notitie toevoegen</h3>
          <form onSubmit={handleAddNote} className="mt-4 space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Schrijf een notitie over deze lead"
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            />
            <button type="submit" className="w-full rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 sm:w-auto">
              Notitie opslaan
            </button>
          </form>

          <h3 className="mt-8 text-lg font-semibold text-white">Nieuwe offerte</h3>
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
              placeholder="Extra werkzaamheden (één per regel)"
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
            <button type="submit" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:col-span-2">
              Offerte genereren
            </button>
          </form>

          {offertes.length > 0 ? (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm uppercase tracking-[0.18em] text-slate-500">Offertehistorie</h4>
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
                  <p className="mt-2 text-slate-400">{formatCurrency(offerte.prijs)} · {formatDateTime(offerte.datum)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OfferteActieKnoppen offerte={offerte} klant={lead} />
                    {offerte.status === "Concept" ? (
                      <button
                        onClick={() => handleMarkVerstuurd(offerte)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
                      >
                        Markeer als verstuurd
                      </button>
                    ) : null}
                    {offerte.status === "Verstuurd" ? (
                      <>
                        <button
                          onClick={() => handleStatusBeslissing(offerte, "Geaccepteerd")}
                          className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/20"
                        >
                          Geaccepteerd
                        </button>
                        <button
                          onClick={() => handleStatusBeslissing(offerte, "Afgewezen")}
                          className="rounded-full bg-rose-500/10 px-4 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
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
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Tijdlijn</h3>
          <div className="mt-4 space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDateTime(item.created_at)}</p>
                <p className="mt-2 text-sm text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
