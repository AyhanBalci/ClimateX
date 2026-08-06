"use client";

import { useEffect, useMemo, useState } from "react";
import { Factuur, Lead, Offerte, Werkbon } from "../../lib/types";
import { HOUSING_OPTIONS, STATUS_OPTIONS } from "../../lib/constants";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { formatBedragRond, formatDatum } from "../../lib/formatters";

type Props = {
  onSelectKlant: (lead: Lead) => void;
};

/** Samenvatting per klant, zodat de lijst meer toont dan alleen NAW-gegevens. */
type KlantSamenvatting = {
  offertes: number;
  werkbonnen: number;
  openstaandBedrag: number;
  omzet: number;
};

const LEGE_SAMENVATTING: KlantSamenvatting = {
  offertes: 0,
  werkbonnen: 0,
  openstaandBedrag: 0,
  omzet: 0,
};

export default function KlantenOverzicht({ onSelectKlant }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [samenvattingen, setSamenvattingen] = useState<Record<string, KlantSamenvatting>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zoekterm, setZoekterm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [plaatsFilter, setPlaatsFilter] = useState("Alle");
  const [woningFilter, setWoningFilter] = useState("Alle");
  const [alleenKlanten, setAlleenKlanten] = useState(false);

  useEffect(() => {
    async function fetchKlanten() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const [leadsRes, offertesRes, werkbonnenRes, facturenRes] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("offertes").select("id, lead_id, prijs, status"),
        supabase.from("werkbonnen").select("id, lead_id"),
        supabase.from("facturen").select("id, lead_id, totaal, status"),
      ]);

      const fout =
        leadsRes.error?.message ||
        offertesRes.error?.message ||
        werkbonnenRes.error?.message ||
        facturenRes.error?.message;

      if (fout) {
        setError(fout);
        setLoading(false);
        return;
      }

      setLeads((leadsRes.data as Lead[]) || []);

      const perKlant: Record<string, KlantSamenvatting> = {};
      const zorgVoor = (leadId: string | null) => {
        if (!leadId) return null;
        if (!perKlant[leadId]) perKlant[leadId] = { ...LEGE_SAMENVATTING };
        return perKlant[leadId];
      };

      ((offertesRes.data as Offerte[]) || []).forEach((offerte) => {
        const regel = zorgVoor(offerte.lead_id);
        if (regel) regel.offertes += 1;
      });

      ((werkbonnenRes.data as Werkbon[]) || []).forEach((werkbon) => {
        const regel = zorgVoor(werkbon.lead_id);
        if (regel) regel.werkbonnen += 1;
      });

      ((facturenRes.data as Factuur[]) || []).forEach((factuur) => {
        const regel = zorgVoor(factuur.lead_id);
        if (!regel) return;
        if (factuur.status === "Betaald") regel.omzet += factuur.totaal || 0;
        else regel.openstaandBedrag += factuur.totaal || 0;
      });

      setSamenvattingen(perKlant);
      setLoading(false);
    }

    fetchKlanten();
  }, []);

  const plaatsen = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.plaats).filter(Boolean))).sort(),
    [leads]
  );

  const gefilterd = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    return leads.filter((lead) => {
      const samenvatting = samenvattingen[lead.id] || LEGE_SAMENVATTING;

      if (statusFilter !== "Alle" && lead.status !== statusFilter) return false;
      if (plaatsFilter !== "Alle" && lead.plaats !== plaatsFilter) return false;
      if (woningFilter !== "Alle" && lead.type_woning !== woningFilter) return false;
      // "Alleen klanten" = iedereen met minstens één opdracht in het systeem.
      if (alleenKlanten && samenvatting.werkbonnen === 0 && lead.status !== "Gewonnen") return false;

      if (!term) return true;
      return [lead.naam, lead.email, lead.telefoon, lead.plaats, lead.type_woning]
        .filter(Boolean)
        .some((veld) => String(veld).toLowerCase().includes(term));
    });
  }, [leads, samenvattingen, zoekterm, statusFilter, plaatsFilter, woningFilter, alleenKlanten]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Klanten</h2>
        <p className="text-sm text-slate-400">
          {gefilterd.length} van {leads.length} klanten
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="sr-only" htmlFor="klant-zoek">
          Zoek een klant
        </label>
        <input
          id="klant-zoek"
          type="search"
          placeholder="Zoek op naam, e-mail, telefoon of plaats"
          value={zoekterm}
          onChange={(event) => setZoekterm(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2 lg:col-span-2"
        />
        <select
          aria-label="Filter op status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle statussen</option>
          {STATUS_OPTIONS.map((optie) => (
            <option key={optie} value={optie}>
              {optie}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter op plaats"
          value={plaatsFilter}
          onChange={(event) => setPlaatsFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle plaatsen</option>
          {plaatsen.map((plaats) => (
            <option key={plaats} value={plaats}>
              {plaats}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter op type woning"
          value={woningFilter}
          onChange={(event) => setWoningFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle woningtypes</option>
          {HOUSING_OPTIONS.map((optie) => (
            <option key={optie} value={optie}>
              {optie}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={alleenKlanten}
            onChange={(event) => setAlleenKlanten(event.target.checked)}
            className="h-5 w-5 accent-cyan-400"
          />
          Alleen klanten met opdracht
        </label>
      </div>

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
      {error ? (
        <p role="alert" className="mt-6 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {!loading && !error && gefilterd.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          {leads.length === 0
            ? "Er zijn nog geen klanten. Zodra een aanvraag binnenkomt, verschijnt die hier."
            : "Geen klanten gevonden voor deze zoekopdracht of filters."}
        </p>
      ) : null}

      {!loading && !error && gefilterd.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Plaats</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Offertes</th>
                  <th className="px-4 py-3">Werkbonnen</th>
                  <th className="px-4 py-3">Omzet</th>
                  <th className="px-4 py-3">Openstaand</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {gefilterd.map((lead) => {
                  const samenvatting = samenvattingen[lead.id] || LEGE_SAMENVATTING;
                  return (
                    <tr key={lead.id} className="border-b border-white/5 text-slate-300">
                      <td className="px-4 py-3">
                        <p className="text-white">{lead.naam}</p>
                        <p className="text-xs text-slate-500">Sinds {formatDatum(lead.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">{lead.plaats || "—"}</td>
                      <td className="px-4 py-3">
                        <p>{lead.email || "—"}</p>
                        <p className="text-xs text-slate-500">{lead.telefoon || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{samenvatting.offertes}</td>
                      <td className="px-4 py-3">{samenvatting.werkbonnen}</td>
                      <td className="px-4 py-3">{formatBedragRond(samenvatting.omzet)}</td>
                      <td className="px-4 py-3">
                        {samenvatting.openstaandBedrag > 0 ? (
                          <span className="text-amber-300">{formatBedragRond(samenvatting.openstaandBedrag)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectKlant(lead)}
                          className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                        >
                          Profiel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 lg:hidden">
            {gefilterd.map((lead) => {
              const samenvatting = samenvattingen[lead.id] || LEGE_SAMENVATTING;
              return (
                <div key={lead.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{lead.naam}</p>
                      <p className="mt-1 truncate text-sm text-slate-400">{lead.plaats || "—"}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                      {lead.status}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Offertes</dt>
                      <dd className="text-slate-300">{samenvatting.offertes}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Werkbonnen</dt>
                      <dd className="text-slate-300">{samenvatting.werkbonnen}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Omzet</dt>
                      <dd className="text-slate-300">{formatBedragRond(samenvatting.omzet)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Openstaand</dt>
                      <dd className={samenvatting.openstaandBedrag > 0 ? "text-amber-300" : "text-slate-300"}>
                        {samenvatting.openstaandBedrag > 0 ? formatBedragRond(samenvatting.openstaandBedrag) : "—"}
                      </dd>
                    </div>
                  </dl>
                  <button
                    onClick={() => onSelectKlant(lead)}
                    className="mt-4 w-full rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Profiel openen →
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
