"use client";

import { useEffect, useMemo, useState } from "react";
import { Factuur } from "../../lib/types";
import { FACTUUR_STATUS_OPTIONS } from "../../lib/constants";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { markFactuurBetaald } from "../../lib/factuurActions";
import { downloadFactuurPdf } from "../../lib/generateFactuurPdf";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

export default function FacturenOverview() {
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("Alle");

  useEffect(() => {
    async function fetchFacturen() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("facturen")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setFacturen((data as Factuur[]) || []);
      }
      setLoading(false);
    }

    fetchFacturen();
  }, []);

  const filtered = useMemo(() => {
    return facturen.filter((factuur) => statusFilter === "Alle" || factuur.status === statusFilter);
  }, [facturen, statusFilter]);

  const handleMarkBetaald = async (factuur: Factuur) => {
    const { error: markError } = await markFactuurBetaald(factuur.id);
    if (markError) {
      setError(markError);
      return;
    }
    setError(null);
    setFacturen((current) =>
      current.map((item) =>
        item.id === factuur.id ? { ...item, status: "Betaald", betaaldatum: new Date().toISOString() } : item
      )
    );
  };

  const totaalOpenstaand = facturen
    .filter((factuur) => factuur.status !== "Betaald")
    .reduce((sum, factuur) => sum + (factuur.totaal || 0), 0);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Facturen</h2>
        <p className="text-sm text-slate-400">
          {facturen.length} facturen · {formatCurrency(totaalOpenstaand)} openstaand
        </p>
      </div>

      <div className="mt-4">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle statussen</option>
          {FACTUUR_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
      {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Er zijn nog geen facturen. Maak een factuur aan vanuit een gereed werkbon.</p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Factuurnummer</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Totaal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Betaaldatum</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((factuur) => (
                  <tr key={factuur.id} className="border-b border-white/5 text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 text-white">{factuur.factuurnummer}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(factuur.created_at)}</td>
                    <td className="px-4 py-3">{factuur.klant}</td>
                    <td className="px-4 py-3">{formatCurrency(factuur.totaal)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                        {factuur.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {factuur.betaaldatum ? formatDate(factuur.betaaldatum) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => downloadFactuurPdf(factuur)}
                          className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          PDF
                        </button>
                        {factuur.status !== "Betaald" ? (
                          <button
                            onClick={() => handleMarkBetaald(factuur)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                          >
                            Markeer betaald
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {filtered.map((factuur) => (
              <div key={factuur.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{factuur.factuurnummer}</p>
                    <p className="mt-1 text-sm text-slate-400">{factuur.klant}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {factuur.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  {formatCurrency(factuur.totaal)} · {formatDate(factuur.created_at)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadFactuurPdf(factuur)}
                    className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    PDF downloaden
                  </button>
                  {factuur.status !== "Betaald" ? (
                    <button
                      onClick={() => handleMarkBetaald(factuur)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                    >
                      Markeer betaald
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
