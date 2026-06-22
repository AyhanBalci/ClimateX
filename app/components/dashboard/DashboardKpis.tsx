"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function DashboardKpis() {
  const [openOffertes, setOpenOffertes] = useState(0);
  const [geplandeWerkbonnen, setGeplandeWerkbonnen] = useState(0);
  const [openFacturen, setOpenFacturen] = useState(0);
  const [omzetDezeMaand, setOmzetDezeMaand] = useState(0);
  const [betaaldeFacturenDezeMaand, setBetaaldeFacturenDezeMaand] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchKpis() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [offertesRes, werkbonnenRes, facturenRes] = await Promise.all([
        supabase.from("offertes").select("id").in("status", ["Concept", "Verstuurd"]),
        supabase.from("werkbonnen").select("id").eq("status", "Gepland"),
        supabase.from("facturen").select("id, status, totaal, betaaldatum"),
      ]);

      if (offertesRes.error || werkbonnenRes.error || facturenRes.error) {
        setError(
          offertesRes.error?.message || werkbonnenRes.error?.message || facturenRes.error?.message || "Onbekende fout."
        );
        setLoading(false);
        return;
      }

      setOpenOffertes(offertesRes.data?.length || 0);
      setGeplandeWerkbonnen(werkbonnenRes.data?.length || 0);

      const facturen = facturenRes.data || [];
      setOpenFacturen(facturen.filter((factuur) => factuur.status !== "Betaald").length);

      const betaaldDezeMaand = facturen.filter(
        (factuur) => factuur.status === "Betaald" && factuur.betaaldatum && factuur.betaaldatum >= startOfMonth
      );
      setBetaaldeFacturenDezeMaand(betaaldDezeMaand.length);
      setOmzetDezeMaand(betaaldDezeMaand.reduce((sum, factuur) => sum + (factuur.totaal || 0), 0));

      setLoading(false);
    }

    fetchKpis();
  }, [refreshKey]);

  const kpis = [
    { label: "Open offertes", value: openOffertes },
    { label: "Geplande werkbonnen", value: geplandeWerkbonnen },
    { label: "Open facturen", value: openFacturen },
    { label: "Omzet deze maand", value: formatCurrency(omzetDezeMaand) },
    { label: "Betaalde facturen deze maand", value: betaaldeFacturenDezeMaand },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bedrijfscijfers</p>
        <button
          onClick={() => setRefreshKey((current) => current + 1)}
          className="text-xs text-cyan-300 transition hover:text-cyan-200"
        >
          ↻ Vernieuwen
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300 sm:text-3xl">{loading ? "…" : kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
