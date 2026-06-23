"use client";

import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyFacturen, getMyLeadAndTicketIds, getMyOffertes, getMyPlanning, getMyTickets } from "../../lib/portalData";
import { Factuur, Offerte, Planning, Vastgoedticket } from "../../lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

export default function PortalDashboardPage() {
  const { session } = usePortalSession();
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [planning, setPlanning] = useState<Planning[]>([]);
  const [tickets, setTickets] = useState<Vastgoedticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user.id) return;
      setLoading(true);
      setError(null);
      try {
        const { leadIds, ticketIds } = await getMyLeadAndTicketIds(session.user.id);
        const [offertesData, facturenData, planningData, ticketsData] = await Promise.all([
          getMyOffertes(leadIds, ticketIds),
          getMyFacturen(leadIds, ticketIds),
          getMyPlanning(leadIds, ticketIds),
          getMyTickets(session.user.id),
        ]);
        setOffertes(offertesData);
        setFacturen(facturenData);
        setPlanning(planningData);
        setTickets(ticketsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout.");
      }
      setLoading(false);
    }

    fetchData();
  }, [session?.user.id]);

  const openOffertes = offertes.filter((o) => o.status === "Concept" || o.status === "Verstuurd");
  const openFacturen = facturen.filter((f) => f.status !== "Betaald");
  const todayKey = new Date().toISOString().slice(0, 10);
  const geplandeAfspraken = planning.filter((p) => p.datum >= todayKey && p.status !== "Afgerond" && p.status !== "Geannuleerd");
  const openTickets = tickets.filter((t) => t.status !== "Afgerond");

  const laatsteUpdates = useMemo(() => {
    const items = [
      ...offertes.map((o) => ({ datum: o.datum, label: `Offerte ${o.offertenummer}: ${o.status}` })),
      ...facturen.map((f) => ({ datum: f.created_at, label: `Factuur ${f.factuurnummer}: ${f.status}` })),
      ...tickets.map((t) => ({ datum: t.datum, label: `Melding ${t.ticketnummer}: ${t.status}` })),
    ];
    return items.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).slice(0, 6);
  }, [offertes, facturen, tickets]);

  const kpis = [
    { label: "Open offertes", value: openOffertes.length },
    { label: "Open facturen", value: openFacturen.length },
    { label: "Geplande afspraken", value: geplandeAfspraken.length },
    { label: "Open meldingen", value: openTickets.length },
  ];

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Welkom terug</h2>
        <p className="mt-2 text-sm text-slate-400">Hier vindt u een overzicht van uw lopende zaken bij ClimateX.</p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}

        {!loading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-300 sm:text-3xl">{kpi.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Laatste statusupdates</h3>
        {laatsteUpdates.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nog geen updates beschikbaar.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {laatsteUpdates.map((update, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(update.datum)}</p>
                <p className="mt-2 text-sm text-slate-200">{update.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {geplandeAfspraken.length > 0 ? (
        <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Geplande afspraken</h3>
          <div className="mt-4 space-y-3">
            {geplandeAfspraken.map((afspraak) => (
              <div key={afspraak.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="font-semibold text-white">{formatDate(afspraak.datum)} om {afspraak.starttijd.slice(0, 5)}</p>
                <p className="mt-1 text-sm text-slate-400">{afspraak.titel}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {openFacturen.length > 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          U heeft {openFacturen.length} openstaande factuur/facturen ter waarde van{" "}
          {formatCurrency(openFacturen.reduce((sum, f) => sum + (f.totaal || 0), 0))}.
        </p>
      ) : null}
    </PortalShell>
  );
}
