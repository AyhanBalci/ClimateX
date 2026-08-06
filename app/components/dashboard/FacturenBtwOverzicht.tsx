"use client";

import { useEffect, useState } from "react";
import { Factuur } from "../../lib/types";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { formatBedrag } from "../../lib/formatters";
import {
  berekenBtwOverzicht,
  dagenTeLaat,
  isAchterstallig,
  maakFacturenCsv,
} from "../../lib/factuurOverzicht";

/**
 * BTW-opstelling per kwartaal, het openstaande bedrag en een export van alle
 * facturen. Staat los van het factuuroverzicht omdat het over de hele
 * administratie gaat en niet over één factuur.
 */
export default function FacturenBtwOverzicht() {
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let verouderd = false;

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

      if (verouderd) return;

      if (fetchError) setError(fetchError.message);
      else setFacturen((data as Factuur[]) || []);
      setLoading(false);
    }

    fetchFacturen();

    return () => {
      verouderd = true;
    };
  }, [refreshKey]);

  const perioden = berekenBtwOverzicht(facturen);
  const achterstallig = facturen.filter((factuur) => isAchterstallig(factuur));
  const openstaandBedrag = facturen
    .filter((factuur) => factuur.status !== "Betaald")
    .reduce((som, factuur) => som + (factuur.totaal || 0), 0);

  const handleExport = () => {
    const csv = maakFacturenCsv(facturen);
    // Byte order mark, anders toont Excel de euro- en accenttekens verkeerd.
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `climatex-facturen-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">BTW-overzicht en export</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRefreshKey((huidig) => huidig + 1)}
            disabled={loading}
            className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ↻ {loading ? "Bezig..." : "Vernieuwen"}
          </button>
          <button
            onClick={handleExport}
            disabled={loading || facturen.length === 0}
            className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Exporteer als CSV
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-rose-400">
          {error}
        </p>
      ) : null}
      {loading ? <p className="mt-4 text-sm text-slate-400">Bezig met laden...</p> : null}

      {!loading && !error ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Facturen totaal", waarde: String(facturen.length) },
              { label: "Openstaand bedrag", waarde: formatBedrag(openstaandBedrag) },
              { label: "Achterstallig", waarde: String(achterstallig.length) },
              {
                label: "Langst openstaand",
                waarde:
                  achterstallig.length > 0
                    ? `${Math.max(...achterstallig.map((factuur) => dagenTeLaat(factuur)))} dagen`
                    : "—",
              },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{kpi.label}</dt>
                <dd className="mt-2 text-lg font-semibold text-white">{kpi.waarde}</dd>
              </div>
            ))}
          </dl>

          <h4 className="mt-6 text-sm font-semibold text-white">BTW per kwartaal</h4>
          <p className="mt-1 text-xs text-slate-500">
            Betaalde facturen, geteld op betaaldatum. De bedragen komen uit de factuur zelf en worden niet opnieuw
            berekend, zodat het overzicht klopt met wat de klant heeft ontvangen.
          </p>

          {perioden.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Nog geen betaalde facturen om aan te geven.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3">Facturen</th>
                    <th className="px-4 py-3">Excl. BTW</th>
                    <th className="px-4 py-3">BTW</th>
                    <th className="px-4 py-3">Incl. BTW</th>
                  </tr>
                </thead>
                <tbody>
                  {perioden.map((periode) => (
                    <tr key={periode.label} className="border-b border-white/5 text-slate-300">
                      <td className="whitespace-nowrap px-4 py-3 text-white">{periode.label}</td>
                      <td className="px-4 py-3">{periode.aantal}</td>
                      <td className="px-4 py-3">{formatBedrag(periode.bedrag)}</td>
                      <td className="px-4 py-3 text-cyan-300">{formatBedrag(periode.btw)}</td>
                      <td className="px-4 py-3">{formatBedrag(periode.totaal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
