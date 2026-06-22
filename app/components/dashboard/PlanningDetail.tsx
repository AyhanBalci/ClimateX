"use client";

import { FormEvent, useEffect, useState } from "react";
import { Planning, Vastgoedticket, Werkbon } from "../../lib/types";
import { PLANNING_STATUS_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { deletePlanning, updatePlanningStatus } from "../../lib/planningActions";

function formatDateTime(datum: string, tijd: string) {
  return `${new Date(datum).toLocaleDateString("nl-NL")} ${tijd.slice(0, 5)}`;
}

type Props = {
  planning: Planning;
  onBack: () => void;
  onPlanningUpdated: (planning: Planning) => void;
  onPlanningDeleted: () => void;
  onOpenWerkbon: (werkbon: Werkbon) => void;
};

export default function PlanningDetail({ planning, onBack, onPlanningUpdated, onPlanningDeleted, onOpenWerkbon }: Props) {
  const [current, setCurrent] = useState(planning);
  const [ticket, setTicket] = useState<Vastgoedticket | null>(null);
  const [werkbon, setWerkbon] = useState<Werkbon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [form, setForm] = useState({
    titel: planning.titel,
    klantnaam: planning.klantnaam || "",
    medewerker: planning.medewerker,
    datum: planning.datum,
    starttijd: planning.starttijd.slice(0, 5),
    eindtijd: planning.eindtijd.slice(0, 5),
    adres: planning.adres || "",
    telefoon: planning.telefoon || "",
    omschrijving: planning.omschrijving || "",
  });

  useEffect(() => {
    async function fetchLinks() {
      if (!supabase) return;
      if (planning.ticket_id) {
        const { data } = await supabase.from("vastgoedtickets").select("*").eq("id", planning.ticket_id).single();
        setTicket((data as Vastgoedticket) || null);
      }
      if (planning.werkbon_id) {
        const { data } = await supabase.from("werkbonnen").select("*").eq("id", planning.werkbon_id).single();
        setWerkbon((data as Werkbon) || null);
      }
    }
    fetchLinks();
  }, [planning.ticket_id, planning.werkbon_id]);

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true);
    const { error: statusError } = await updatePlanningStatus(current, status);
    setUpdatingStatus(false);

    if (statusError) {
      setError(statusError);
      return;
    }
    setError(null);
    const updated = { ...current, status };
    setCurrent(updated);
    onPlanningUpdated(updated);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    const { data, error: updateError } = await supabase
      .from("planning")
      .update({
        titel: form.titel.trim(),
        klantnaam: form.klantnaam.trim(),
        medewerker: form.medewerker.trim(),
        datum: form.datum,
        starttijd: form.starttijd,
        eindtijd: form.eindtijd,
        adres: form.adres.trim(),
        telefoon: form.telefoon.trim(),
        omschrijving: form.omschrijving.trim(),
      })
      .eq("id", current.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setError(null);
    setCurrent(data as Planning);
    onPlanningUpdated(data as Planning);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Afspraak "${current.titel}" verwijderen?`);
    if (!confirmed) return;

    const { error: deleteError } = await deletePlanning(current.id);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    onPlanningDeleted();
  };

  const mapsUrl = current.adres ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current.adres)}` : null;
  const telUrl = current.telefoon ? `tel:${current.telefoon.replace(/\s+/g, "")}` : null;

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cyan-300 transition hover:text-cyan-200">
        ← Terug naar agenda
      </button>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">{current.planning_nummer}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{current.titel}</h2>
            <p className="mt-1 text-sm text-slate-400">{formatDateTime(current.datum, current.starttijd)} - {current.eindtijd.slice(0, 5)}</p>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-300">{current.status}</span>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Onderweg", status: "Onderweg" },
            { label: "Aangekomen", status: "Aangekomen" },
            { label: "Werk gestart", status: "Bezig" },
            { label: "Werk afgerond", status: "Afgerond" },
          ].map((action) => (
            <button
              key={action.status}
              onClick={() => handleStatusChange(action.status)}
              disabled={updatingStatus || current.status === action.status}
              className="rounded-2xl bg-cyan-400 px-4 py-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              📍 Route (Google Maps)
            </a>
          ) : null}
          {telUrl ? (
            <a href={telUrl} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              📞 Bel klant
            </a>
          ) : null}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Klant", value: current.klantnaam || "—" },
            { label: "Medewerker", value: current.medewerker },
            { label: "Adres", value: current.adres || "—" },
            { label: "Telefoon", value: current.telefoon || "—" },
            { label: "Omschrijving", value: current.omschrijving || "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm text-slate-200">{item.value}</p>
            </div>
          ))}
        </dl>
      </div>

      {ticket ? (
        <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Gekoppeld vastgoedticket</h3>
          <div className="mt-3 rounded-3xl border border-white/10 bg-[#090909] p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{ticket.ticketnummer}</p>
            <p className="mt-1 text-slate-400">{ticket.klant} · {ticket.locatie}</p>
            <p className="mt-1 text-slate-400">Status: {ticket.status}</p>
          </div>
        </div>
      ) : null}

      {werkbon ? (
        <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Gekoppelde werkbon</h3>
          <div className="mt-3 rounded-3xl border border-white/10 bg-[#090909] p-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{werkbon.werkbonnummer}</p>
                <p className="mt-1 text-slate-400">{werkbon.klantnaam} · status: {werkbon.status}</p>
              </div>
              <button
                onClick={() => onOpenWerkbon(werkbon)}
                className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Openen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Afspraak bewerken</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Titel"
            value={form.titel}
            onChange={(event) => setForm((c) => ({ ...c, titel: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <input
            type="text"
            placeholder="Klantnaam"
            value={form.klantnaam}
            onChange={(event) => setForm((c) => ({ ...c, klantnaam: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Medewerker"
            value={form.medewerker}
            onChange={(event) => setForm((c) => ({ ...c, medewerker: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="date"
            value={form.datum}
            onChange={(event) => setForm((c) => ({ ...c, datum: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={form.starttijd}
              onChange={(event) => setForm((c) => ({ ...c, starttijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={form.eindtijd}
              onChange={(event) => setForm((c) => ({ ...c, eindtijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>
          <input
            type="text"
            placeholder="Adres"
            value={form.adres}
            onChange={(event) => setForm((c) => ({ ...c, adres: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Telefoonnummer"
            value={form.telefoon}
            onChange={(event) => setForm((c) => ({ ...c, telefoon: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <textarea
            rows={2}
            placeholder="Omschrijving"
            value={form.omschrijving}
            onChange={(event) => setForm((c) => ({ ...c, omschrijving: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <select
            value={current.status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          >
            {PLANNING_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Opslaan
            </button>
            <button type="button" onClick={handleDelete} className="rounded-full bg-rose-500/10 px-6 py-3 text-sm text-rose-300 transition hover:bg-rose-500/20">
              Afspraak verwijderen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
