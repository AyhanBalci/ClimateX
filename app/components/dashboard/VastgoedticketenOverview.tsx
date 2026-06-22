"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Vastgoedticket } from "../../lib/types";
import { VASTGOEDTICKET_PRIORITEIT_OPTIONS, VASTGOEDTICKET_STATUS_OPTIONS } from "../../lib/constants";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { createTicket } from "../../lib/ticketActions";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

function startOfWeek() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day + 1);
  return monday;
}

const emptyForm = {
  klant: "",
  locatie: "",
  contactpersoon: "",
  telefoonnummer: "",
  type_melding: "",
  prioriteit: "Normaal",
  omschrijving: "",
};

type Props = {
  onSelectTicket: (ticket: Vastgoedticket) => void;
};

export default function VastgoedticketenOverview({ onSelectTicket }: Props) {
  const [tickets, setTickets] = useState<Vastgoedticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [omzetUitTickets, setOmzetUitTickets] = useState(0);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const [ticketsRes, facturenRes] = await Promise.all([
        supabase.from("vastgoedtickets").select("*").order("datum", { ascending: false }),
        supabase.from("facturen").select("totaal, status, ticket_id").not("ticket_id", "is", null).eq("status", "Betaald"),
      ]);

      if (ticketsRes.error) {
        setError(ticketsRes.error.message);
      } else {
        setTickets((ticketsRes.data as Vastgoedticket[]) || []);
      }

      if (!facturenRes.error) {
        setOmzetUitTickets((facturenRes.data || []).reduce((sum, factuur) => sum + (factuur.totaal || 0), 0));
      }

      setLoading(false);
    }

    fetchTickets();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "Alle" || ticket.status === statusFilter;
      const matchesSearch =
        !term ||
        ticket.klant.toLowerCase().includes(term) ||
        ticket.ticketnummer.toLowerCase().includes(term) ||
        ticket.locatie.toLowerCase().includes(term) ||
        (ticket.contactpersoon || "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  const monday = startOfWeek();
  const openTickets = tickets.filter((ticket) => ticket.status !== "Afgerond").length;
  const spoedTickets = tickets.filter((ticket) => ticket.prioriteit === "Spoed" && ticket.status !== "Afgerond").length;
  const ticketsDezeWeek = tickets.filter((ticket) => new Date(ticket.datum) >= monday).length;
  const afgerondeTickets = tickets.filter((ticket) => ticket.status === "Afgerond").length;

  const kpis = [
    { label: "Open tickets", value: openTickets },
    { label: "Spoedtickets", value: spoedTickets },
    { label: "Tickets deze week", value: ticketsDezeWeek },
    { label: "Afgeronde tickets", value: afgerondeTickets },
    {
      label: "Omzet uit tickets",
      value: new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(omzetUitTickets),
    },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.klant.trim() || !form.locatie.trim()) {
      setError("Vul minimaal klant en locatie in.");
      return;
    }

    const { data, error: createError } = await createTicket({
      klant: form.klant.trim(),
      locatie: form.locatie.trim(),
      contactpersoon: form.contactpersoon.trim(),
      telefoonnummer: form.telefoonnummer.trim(),
      type_melding: form.type_melding.trim(),
      prioriteit: form.prioriteit,
      omschrijving: form.omschrijving.trim(),
    });

    if (createError || !data) {
      setError(createError || "Ticket aanmaken is mislukt.");
      return;
    }

    setError(null);
    setTickets((current) => [data as Vastgoedticket, ...current]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Vastgoedtickets</h2>
        <button
          onClick={() => setShowForm((current) => !current)}
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          {showForm ? "Annuleren" : "+ Nieuw ticket"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300 sm:text-3xl">{loading ? "…" : kpi.value}</p>
          </div>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-[#090909] p-5 sm:grid-cols-2 sm:p-6">
          <input
            type="text"
            placeholder="Klant"
            value={form.klant}
            onChange={(event) => setForm((current) => ({ ...current, klant: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Locatie"
            value={form.locatie}
            onChange={(event) => setForm((current) => ({ ...current, locatie: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Contactpersoon"
            value={form.contactpersoon}
            onChange={(event) => setForm((current) => ({ ...current, contactpersoon: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Telefoonnummer"
            value={form.telefoonnummer}
            onChange={(event) => setForm((current) => ({ ...current, telefoonnummer: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Type melding (bijv. lekkage, storing)"
            value={form.type_melding}
            onChange={(event) => setForm((current) => ({ ...current, type_melding: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <select
            value={form.prioriteit}
            onChange={(event) => setForm((current) => ({ ...current, prioriteit: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          >
            {VASTGOEDTICKET_PRIORITEIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            placeholder="Omschrijving van de melding"
            value={form.omschrijving}
            onChange={(event) => setForm((current) => ({ ...current, omschrijving: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <button type="submit" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:col-span-2">
            Ticket aanmaken
          </button>
        </form>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Zoek op klant, ticketnummer, locatie of contactpersoon"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle statussen</option>
          {VASTGOEDTICKET_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

      {!loading && filtered.length === 0 ? <p className="mt-6 text-sm text-slate-400">Geen tickets gevonden.</p> : null}

      {!loading && filtered.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Ticketnummer</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Locatie</th>
                  <th className="px-4 py-3">Prioriteit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-white/5 text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 text-white">{ticket.ticketnummer}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(ticket.datum)}</td>
                    <td className="px-4 py-3">{ticket.klant}</td>
                    <td className="px-4 py-3">{ticket.locatie}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                          ticket.prioriteit === "Spoed"
                            ? "bg-rose-500/10 text-rose-300"
                            : ticket.prioriteit === "Hoog"
                              ? "bg-amber-400/10 text-amber-300"
                              : "bg-white/5 text-slate-300"
                        }`}
                      >
                        {ticket.prioriteit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectTicket(ticket)}
                        className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                      >
                        Openen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{ticket.ticketnummer}</p>
                    <p className="mt-1 text-sm text-slate-400">{ticket.klant}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {ticket.locatie} · {ticket.prioriteit}
                </p>
                <button
                  onClick={() => onSelectTicket(ticket)}
                  className="mt-4 w-full rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  Openen →
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
