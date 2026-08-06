"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import { formatBedragRond } from "../../lib/formatters";
import {
  DashboardKpiCijfers,
  LEGE_DASHBOARD_DATA,
  abonneerOpDashboardWijzigingen,
  berekenKpis,
  fetchDashboardData,
} from "../../lib/dashboardData";

function formatPercentage(waarde: number): string {
  return `${Math.round(waarde * 10) / 10}%`;
}

export default function DashboardKpis() {
  const [cijfers, setCijfers] = useState<DashboardKpiCijfers>(() => berekenKpis(LEGE_DASHBOARD_DATA));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const vernieuw = useCallback(() => setRefreshKey((huidig) => huidig + 1), []);

  useEffect(() => {
    // Een trager verzoek van een vorige ronde mag een verser resultaat niet
    // overschrijven; realtime kan meerdere ladingen kort na elkaar starten.
    let verouderd = false;

    async function laadCijfers() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await fetchDashboardData();
      if (verouderd) return;

      if (fetchError) setError(fetchError);
      else setCijfers(berekenKpis(data));
      setLoading(false);
    }

    laadCijfers();

    return () => {
      verouderd = true;
    };
  }, [refreshKey]);

  // Realtime bijwerken zodra elders een offerte, werkbon, factuur of melding
  // verandert. Staat replicatie in Supabase uit, dan blijft "Vernieuwen" over.
  useEffect(() => abonneerOpDashboardWijzigingen(vernieuw), [vernieuw]);

  const omzet = [
    { label: "Omzet vandaag", value: formatBedragRond(cijfers.omzetVandaag) },
    { label: "Omzet deze week", value: formatBedragRond(cijfers.omzetDezeWeek) },
    { label: "Omzet deze maand", value: formatBedragRond(cijfers.omzetDezeMaand) },
    { label: "Omzet dit jaar", value: formatBedragRond(cijfers.omzetDitJaar) },
  ];

  const openstaand = [
    { label: "Open offertes", value: cijfers.openOffertes },
    { label: "Open werkbonnen", value: cijfers.openWerkbonnen },
    { label: "Open facturen", value: cijfers.openFacturen },
    { label: "Open servicemeldingen", value: cijfers.openServicemeldingen },
    { label: "Lead → offerte", value: formatPercentage(cijfers.conversieLeadNaarOfferte) },
    { label: "Offerte → opdracht", value: formatPercentage(cijfers.conversieOfferteNaarOpdracht) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bedrijfscijfers</p>
        <button
          onClick={vernieuw}
          disabled={loading}
          className="-mr-2 min-h-[44px] inline-flex items-center justify-center rounded-full px-3 py-2 text-xs text-cyan-300 transition hover:bg-white/5 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ↻ {loading ? "Bezig..." : "Vernieuwen"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {omzet.map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300 sm:text-3xl">{loading ? "…" : kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {openstaand.map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{loading ? "…" : kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
