"use client";

import { useEffect, useMemo, useState } from "react";
import { Werkbon } from "../../lib/types";
import { WERKBON_STATUS_OPTIONS } from "../../lib/constants";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

type Props = {
  onSelectWerkbon: (werkbon: Werkbon) => void;
};

export default function WerkbonnenOverview({ onSelectWerkbon }: Props) {
  const [werkbonnen, setWerkbonnen] = useState<Werkbon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Alle");

  useEffect(() => {
    async function fetchWerkbonnen() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("werkbonnen")
        .select("*")
        .order("datum", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setWerkbonnen((data as Werkbon[]) || []);
      }
      setLoading(false);
    }

    fetchWerkbonnen();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return werkbonnen.filter((werkbon) => {
      const matchesStatus = statusFilter === "Alle" || werkbon.status === statusFilter;
      const matchesSearch =
        !term ||
        werkbon.klantnaam.toLowerCase().includes(term) ||
        werkbon.werkbonnummer.toLowerCase().includes(term) ||
        (werkbon.adres || "").toLowerCase().includes(term) ||
        (werkbon.monteur || "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [werkbonnen, search, statusFilter]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Werkbonnen</h2>
        <p className="text-sm text-slate-400">
          {filtered.length} van {werkbonnen.length} werkbonnen
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Zoek op klant, werkbonnummer, adres of monteur"
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
          {WERKBON_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
      {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Geen werkbonnen gevonden.</p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Werkbonnummer</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Adres</th>
                  <th className="px-4 py-3">Monteur</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((werkbon) => (
                  <tr key={werkbon.id} className="border-b border-white/5 text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 text-white">{werkbon.werkbonnummer}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(werkbon.datum)}</td>
                    <td className="px-4 py-3">{werkbon.klantnaam}</td>
                    <td className="px-4 py-3">{werkbon.adres || "—"}</td>
                    <td className="px-4 py-3">{werkbon.monteur || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                        {werkbon.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectWerkbon(werkbon)}
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
            {filtered.map((werkbon) => (
              <div key={werkbon.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{werkbon.werkbonnummer}</p>
                    <p className="mt-1 text-sm text-slate-400">{werkbon.klantnaam}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {werkbon.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {werkbon.adres || "—"} · {werkbon.monteur || "—"}
                </p>
                <button
                  onClick={() => onSelectWerkbon(werkbon)}
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
