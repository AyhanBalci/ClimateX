"use client";

import { useEffect, useMemo, useState } from "react";
import { Offerte, Planning, Werkbon } from "../../lib/types";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { markOfferteVerstuurd, updateOfferteStatus } from "../../lib/offerteActions";
import OfferteActieKnoppen from "./OfferteActieKnoppen";
import OfferteKoppelingen from "./OfferteKoppelingen";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

type Props = {
  onOpenWerkbon: (werkbon: Werkbon) => void;
  onOpenPlanning: (planning: Planning) => void;
};

export default function OffertesOverview({ onOpenWerkbon, onOpenPlanning }: Props) {
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [werkbonnen, setWerkbonnen] = useState<Werkbon[]>([]);
  const [planningen, setPlanningen] = useState<Planning[]>([]);
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

      const [offertesRes, werkbonnenRes, planningRes] = await Promise.all([
        supabase
          .from("offertes")
          .select("*, leads(naam, telefoon, email, plaats, type_woning), vastgoedtickets(klant, locatie, contactpersoon, telefoonnummer)")
          .order("datum", { ascending: false }),
        supabase.from("werkbonnen").select("*").not("offerte_id", "is", null),
        supabase.from("planning").select("*").not("werkbon_id", "is", null),
      ]);

      if (offertesRes.error || werkbonnenRes.error || planningRes.error) {
        setError(offertesRes.error?.message || werkbonnenRes.error?.message || planningRes.error?.message || "Onbekende fout.");
      } else {
        setOffertes((offertesRes.data as Offerte[]) || []);
        setWerkbonnen((werkbonnenRes.data as Werkbon[]) || []);
        setPlanningen((planningRes.data as Planning[]) || []);
      }
      setLoading(false);
    }

    fetchOffertes();
  }, []);

  const werkbonByOfferteId = useMemo(() => {
    const map: Record<string, Werkbon> = {};
    werkbonnen.forEach((werkbon) => {
      if (werkbon.offerte_id) map[werkbon.offerte_id] = werkbon;
    });
    return map;
  }, [werkbonnen]);

  const planningByWerkbonId = useMemo(() => {
    const map: Record<string, Planning> = {};
    planningen.forEach((planning) => {
      if (planning.werkbon_id) map[planning.werkbon_id] = planning;
    });
    return map;
  }, [planningen]);

  const handleMarkVerstuurd = async (offerte: Offerte) => {
    const { error: markError } = await markOfferteVerstuurd(offerte.id, offerte.lead_id);
    if (markError) {
      setError(markError);
      return;
    }
    setError(null);
    setOffertes((current) => current.map((item) => (item.id === offerte.id ? { ...item, status: "Verstuurd" } : item)));
  };

  const handleStatusBeslissing = async (offerte: Offerte, status: "Geaccepteerd" | "Afgewezen") => {
    const { error: statusError } = await updateOfferteStatus(offerte.id, offerte.lead_id, status);
    if (statusError) {
      setError(statusError);
      return;
    }
    setError(null);
    setOffertes((current) => current.map((item) => (item.id === offerte.id ? { ...item, status } : item)));
  };

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
                  <th className="px-4 py-3">Offertenummer</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Merk</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Prijs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {offertes.map((offerte) => (
                  <tr key={offerte.id} className="border-b border-white/5 text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 text-white">{offerte.offertenummer}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDateTime(offerte.datum)}</td>
                    <td className="px-4 py-3">{offerte.leads?.naam || offerte.vastgoedtickets?.klant || "—"}</td>
                    <td className="px-4 py-3">{offerte.merk}</td>
                    <td className="px-4 py-3">{offerte.model}</td>
                    <td className="px-4 py-3">{formatCurrency(offerte.prijs)}</td>
                    <td className="px-4 py-3">{offerte.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <OfferteActieKnoppen
                          offerte={offerte}
                          klant={{
                            naam: offerte.leads?.naam || offerte.vastgoedtickets?.klant || "",
                            telefoon: offerte.leads?.telefoon || offerte.vastgoedtickets?.telefoonnummer || "",
                            email: offerte.leads?.email || "",
                            plaats: offerte.leads?.plaats || offerte.vastgoedtickets?.locatie || "",
                            type_woning: offerte.leads?.type_woning || "",
                          }}
                        />
                        {offerte.status === "Concept" ? (
                          <button
                            onClick={() => handleMarkVerstuurd(offerte)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                          >
                            Verstuurd
                          </button>
                        ) : null}
                        {offerte.status === "Verstuurd" ? (
                          <>
                            <button
                              onClick={() => handleStatusBeslissing(offerte, "Geaccepteerd")}
                              className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/20"
                            >
                              Geaccepteerd
                            </button>
                            <button
                              onClick={() => handleStatusBeslissing(offerte, "Afgewezen")}
                              className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
                            >
                              Afgewezen
                            </button>
                          </>
                        ) : null}
                        {offerte.status === "Geaccepteerd" ? (
                          <OfferteKoppelingen
                            werkbon={werkbonByOfferteId[offerte.id] || null}
                            planning={
                              werkbonByOfferteId[offerte.id]
                                ? planningByWerkbonId[werkbonByOfferteId[offerte.id].id] || null
                                : null
                            }
                            onOpenWerkbon={onOpenWerkbon}
                            onOpenPlanning={onOpenPlanning}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {offertes.map((offerte) => (
              <div key={offerte.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="font-semibold text-white">{offerte.offertenummer}</p>
                <p className="mt-1 text-sm text-slate-400">{offerte.merk} {offerte.model}</p>
                <p className="mt-1 text-sm text-slate-400">{offerte.leads?.naam || offerte.vastgoedtickets?.klant || "—"} · {formatDateTime(offerte.datum)}</p>
                <p className="mt-2 text-sm text-slate-200">{formatCurrency(offerte.prijs)} · {offerte.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OfferteActieKnoppen
                    offerte={offerte}
                    klant={{
                      naam: offerte.leads?.naam || offerte.vastgoedtickets?.klant || "",
                      telefoon: offerte.leads?.telefoon || offerte.vastgoedtickets?.telefoonnummer || "",
                      email: offerte.leads?.email || "",
                      plaats: offerte.leads?.plaats || offerte.vastgoedtickets?.locatie || "",
                      type_woning: offerte.leads?.type_woning || "",
                    }}
                  />
                  {offerte.status === "Concept" ? (
                    <button
                      onClick={() => handleMarkVerstuurd(offerte)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                    >
                      Markeer als verstuurd
                    </button>
                  ) : null}
                  {offerte.status === "Verstuurd" ? (
                    <>
                      <button
                        onClick={() => handleStatusBeslissing(offerte, "Geaccepteerd")}
                        className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/20"
                      >
                        Geaccepteerd
                      </button>
                      <button
                        onClick={() => handleStatusBeslissing(offerte, "Afgewezen")}
                        className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"
                      >
                        Afgewezen
                      </button>
                    </>
                  ) : null}
                  {offerte.status === "Geaccepteerd" ? (
                    <OfferteKoppelingen
                      werkbon={werkbonByOfferteId[offerte.id] || null}
                      planning={
                        werkbonByOfferteId[offerte.id]
                          ? planningByWerkbonId[werkbonByOfferteId[offerte.id].id] || null
                          : null
                      }
                      onOpenWerkbon={onOpenWerkbon}
                      onOpenPlanning={onOpenPlanning}
                    />
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
