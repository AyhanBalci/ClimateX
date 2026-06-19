"use client";

import { useEffect, useState } from "react";
import { Offerte } from "../../lib/types";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function OffertesOverview() {
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffertes() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("offertes")
        .select("*, leads(naam)")
        .order("datum", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setOffertes((data as Offerte[]) || []);
      }
      setLoading(false);
    }

    fetchOffertes();
  }, []);

  const totaalWaarde = offertes.reduce((sum, offerte) => sum + (offerte.prijs || 0), 0);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Offertes</h2>
        <p className="text-sm text-slate-400">{offertes.length} offertes · totaal {formatCurrency(totaalWaarde)}</p>
      </div>

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
      {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}

      {!loading && !error && offertes.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Er zijn nog geen offertes. Voeg een offerte toe via een leaddetail.</p>
      ) : null}

      {!loading && !error && offertes.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Merk</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Prijs</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {offertes.map((offerte) => (
                  <tr key={offerte.id} className="border-b border-white/5 text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDateTime(offerte.datum)}</td>
                    <td className="px-4 py-3">{offerte.leads?.naam || "—"}</td>
                    <td className="px-4 py-3">{offerte.merk}</td>
                    <td className="px-4 py-3">{offerte.model}</td>
                    <td className="px-4 py-3">{formatCurrency(offerte.prijs)}</td>
                    <td className="px-4 py-3">{offerte.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {offertes.map((offerte) => (
              <div key={offerte.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="font-semibold text-white">{offerte.merk} {offerte.model}</p>
                <p className="mt-1 text-sm text-slate-400">{offerte.leads?.naam || "—"} · {formatDateTime(offerte.datum)}</p>
                <p className="mt-2 text-sm text-slate-200">{formatCurrency(offerte.prijs)} · {offerte.status}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
