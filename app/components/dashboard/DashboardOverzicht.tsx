"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { isSupabaseConfigured } from "../../lib/supabase";
import { formatBedragRond, formatDatumTijd } from "../../lib/formatters";
import {
  FACTUUR_STATUS_OPTIONS,
  MEDEWERKER_KLEUREN,
  OFFERTE_STATUS_OPTIONS,
  VASTGOEDTICKET_STATUS_OPTIONS,
} from "../../lib/constants";
import {
  DashboardData,
  LEGE_DASHBOARD_DATA,
  abonneerOpDashboardWijzigingen,
  fetchDashboardData,
  omzetPerMaand,
  recenteActiviteiten,
  verdeelPerStatus,
} from "../../lib/dashboardData";

const TOOLTIP_STIJL = {
  background: "#090909",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff",
};

const AS_STIJL = { fill: "#94a3b8", fontSize: 11 };

/** Kleur per soort activiteit, zodat de lijst in één oogopslag te scannen is. */
const ACTIVITEIT_KLEUREN: Record<string, string> = {
  Lead: "#22d3ee",
  Offerte: "#a78bfa",
  Werkbon: "#34d399",
  Factuur: "#facc15",
  Servicemelding: "#fb923c",
};

export default function DashboardOverzicht() {
  const [data, setData] = useState<DashboardData>(LEGE_DASHBOARD_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const vernieuw = useCallback(() => setRefreshKey((huidig) => huidig + 1), []);

  useEffect(() => {
    // Realtime kan meerdere ladingen kort na elkaar starten. Deze vlag voorkomt
    // dat een traag antwoord van een vorige ronde het verse overzicht overschrijft.
    let verouderd = false;

    async function laadData() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const { data: verse, error: fetchError } = await fetchDashboardData();
      if (verouderd) return;

      if (fetchError) setError(fetchError);
      else setData(verse);
      setLoading(false);
    }

    laadData();

    return () => {
      verouderd = true;
    };
  }, [refreshKey]);

  useEffect(() => abonneerOpDashboardWijzigingen(vernieuw), [vernieuw]);

  const omzetReeks = omzetPerMaand(data.facturen, 12);
  const heeftOmzet = omzetReeks.some((maand) => maand.omzet > 0);

  const offerteVerdeling = verdeelPerStatus(data.offertes, OFFERTE_STATUS_OPTIONS);
  const factuurVerdeling = verdeelPerStatus(data.facturen, FACTUUR_STATUS_OPTIONS);
  const ticketVerdeling = verdeelPerStatus(data.tickets, VASTGOEDTICKET_STATUS_OPTIONS);
  const activiteiten = recenteActiviteiten(data, 12);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Overzicht</h2>
        <button
          onClick={vernieuw}
          disabled={loading}
          className="self-start text-xs text-cyan-300 transition hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          ↻ {loading ? "Bezig..." : "Vernieuwen"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

      {!loading && !error ? (
        <>
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-white">Omzet per maand</h3>
            <p className="mt-1 text-xs text-slate-500">
              Betaalde facturen over de laatste twaalf maanden, geteld op betaaldatum.
            </p>
            {heeftOmzet ? (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={omzetReeks} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="omzetVerloop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="maand" tick={AS_STIJL} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={AS_STIJL}
                      axisLine={false}
                      tickLine={false}
                      width={64}
                      tickFormatter={(waarde: number) => formatBedragRond(waarde)}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STIJL}
                      labelStyle={{ color: "#94a3b8" }}
                      formatter={(waarde: number) => [formatBedragRond(waarde), "Omzet"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="omzet"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fill="url(#omzetVerloop)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Nog geen betaalde facturen. Zodra een factuur op betaald staat, verschijnt de omzet hier.
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              { titel: "Offertes per status", verdeling: offerteVerdeling },
              { titel: "Facturen per status", verdeling: factuurVerdeling },
              { titel: "Servicemeldingen per status", verdeling: ticketVerdeling },
            ].map((blok) => (
              <div key={blok.titel} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-white">{blok.titel}</h3>
                {blok.verdeling.length > 0 ? (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={blok.verdeling} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="status" tick={AS_STIJL} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={AS_STIJL} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                        <Tooltip
                          contentStyle={TOOLTIP_STIJL}
                          cursor={{ fill: "rgba(255,255,255,0.04)" }}
                          formatter={(waarde: number) => [waarde, "Aantal"]}
                        />
                        <Bar dataKey="aantal" radius={[6, 6, 0, 0]}>
                          {blok.verdeling.map((regel, index) => (
                            <Cell key={regel.status} fill={MEDEWERKER_KLEUREN[index % MEDEWERKER_KLEUREN.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">Nog geen gegevens.</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-white">Recente activiteiten</h3>
            {activiteiten.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {activiteiten.map((activiteit) => (
                  <li
                    key={activiteit.id}
                    style={{ borderLeftColor: ACTIVITEIT_KLEUREN[activiteit.soort] }}
                    className="rounded-2xl border border-white/10 border-l-4 bg-black/40 p-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{activiteit.soort}</span>{" "}
                        {activiteit.titel}
                      </p>
                      <p className="text-xs text-slate-500">{formatDatumTijd(activiteit.tijdstip)}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{activiteit.omschrijving}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Nog geen activiteiten.</p>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
