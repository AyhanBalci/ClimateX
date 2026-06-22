"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { toDateKey, addDays, startOfWeek } from "../../lib/dateUtils";

export default function PlanningKpis() {
  const [afsprakenVandaag, setAfsprakenVandaag] = useState(0);
  const [afsprakenDezeWeek, setAfsprakenDezeWeek] = useState(0);
  const [openstaand, setOpenstaand] = useState(0);
  const [afgerond, setAfgerond] = useState(0);
  const [ingeplandeMonteurs, setIngeplandeMonteurs] = useState(0);
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

      const today = new Date();
      const todayKey = toDateKey(today);
      const weekStart = toDateKey(startOfWeek(today));
      const weekEnd = toDateKey(addDays(startOfWeek(today), 6));

      const [vandaagRes, weekRes, alleRes] = await Promise.all([
        supabase.from("planning").select("id").eq("datum", todayKey),
        supabase.from("planning").select("id").gte("datum", weekStart).lte("datum", weekEnd),
        supabase.from("planning").select("id, status, medewerker, datum"),
      ]);

      if (vandaagRes.error || weekRes.error || alleRes.error) {
        setError(vandaagRes.error?.message || weekRes.error?.message || alleRes.error?.message || "Onbekende fout.");
        setLoading(false);
        return;
      }

      setAfsprakenVandaag(vandaagRes.data?.length || 0);
      setAfsprakenDezeWeek(weekRes.data?.length || 0);

      const alle = alleRes.data || [];
      setOpenstaand(alle.filter((item) => item.status !== "Afgerond" && item.status !== "Geannuleerd").length);
      setAfgerond(alle.filter((item) => item.status === "Afgerond").length);

      const monteurs = new Set(
        alle
          .filter((item) => item.status !== "Afgerond" && item.status !== "Geannuleerd" && item.datum >= todayKey)
          .map((item) => item.medewerker)
      );
      setIngeplandeMonteurs(monteurs.size);

      setLoading(false);
    }

    fetchKpis();
  }, [refreshKey]);

  const kpis = [
    { label: "Afspraken vandaag", value: afsprakenVandaag },
    { label: "Afspraken deze week", value: afsprakenDezeWeek },
    { label: "Openstaande afspraken", value: openstaand },
    { label: "Afgeronde afspraken", value: afgerond },
    { label: "Ingeplande monteurs", value: ingeplandeMonteurs },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Planning</p>
        <button onClick={() => setRefreshKey((current) => current + 1)} className="text-xs text-cyan-300 transition hover:text-cyan-200">
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
