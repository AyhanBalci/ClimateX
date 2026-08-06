"use client";

import { useCallback, useEffect, useState } from "react";
import { Melding } from "../../lib/types";
import { isSupabaseConfigured } from "../../lib/supabase";
import { formatDatumTijd } from "../../lib/formatters";
import {
  abonneerOpMeldingen,
  fetchMeldingen,
  markeerAllesGelezen,
  markeerGelezen,
} from "../../lib/meldingActions";

/** Kleur per soort, zodat de lijst in één oogopslag te scannen is. */
const SOORT_KLEUREN: Record<string, string> = {
  offerte: "#a78bfa",
  servicemelding: "#fb923c",
  werkbon: "#34d399",
  factuur: "#facc15",
};

const SOORT_LABELS: Record<string, string> = {
  offerte: "Offerte",
  servicemelding: "Servicemelding",
  werkbon: "Werkbon",
  factuur: "Factuur",
};

export default function MeldingenPaneel() {
  const [meldingen, setMeldingen] = useState<Melding[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const vernieuw = useCallback(() => setRefreshKey((huidig) => huidig + 1), []);

  useEffect(() => {
    let verouderd = false;

    async function laadMeldingen() {
      if (!isSupabaseConfigured) {
        setError("Supabase is niet geconfigureerd.");
        return;
      }

      setLoading(true);
      const { data, error: fetchError } = await fetchMeldingen();
      if (verouderd) return;

      if (fetchError) setError(fetchError);
      else {
        setError(null);
        setMeldingen(data);
      }
      setLoading(false);
    }

    laadMeldingen();

    return () => {
      verouderd = true;
    };
  }, [refreshKey]);

  useEffect(() => abonneerOpMeldingen(vernieuw), [vernieuw]);

  const ongelezen = meldingen.filter((melding) => !melding.gelezen).length;

  const handleMarkeer = async (melding: Melding) => {
    if (melding.gelezen) return;

    // Vooruitlopen op het antwoord: de teller hoort meteen te zakken.
    setMeldingen((huidig) =>
      huidig.map((item) => (item.id === melding.id ? { ...item, gelezen: true } : item))
    );

    const { error: markeerError } = await markeerGelezen(melding.id);
    if (markeerError) {
      setError(markeerError);
      vernieuw();
    }
  };

  const handleMarkeerAlles = async () => {
    setMeldingen((huidig) => huidig.map((item) => ({ ...item, gelezen: true })));
    const { error: markeerError } = await markeerAllesGelezen();
    if (markeerError) {
      setError(markeerError);
      vernieuw();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((huidig) => !huidig)}
        aria-expanded={open}
        aria-label={
          ongelezen > 0 ? `Meldingen, ${ongelezen} ongelezen` : "Meldingen, geen ongelezen berichten"
        }
        className="relative rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
      >
        Meldingen
        {ongelezen > 0 ? (
          <span className="ml-2 inline-flex min-w-[1.5rem] justify-center rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-bold text-slate-950">
            {ongelezen}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">Meldingen</p>
            <div className="flex gap-2">
              <button
                onClick={vernieuw}
                disabled={loading}
                className="text-xs text-cyan-300 transition hover:text-cyan-200 disabled:opacity-60"
              >
                ↻ {loading ? "Bezig..." : "Vernieuwen"}
              </button>
              {ongelezen > 0 ? (
                <button
                  onClick={handleMarkeerAlles}
                  className="text-xs text-slate-400 transition hover:text-white"
                >
                  Alles gelezen
                </button>
              ) : null}
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-xs text-rose-400">
              {error}
            </p>
          ) : null}

          {!error && meldingen.length === 0 && !loading ? (
            <p className="mt-3 text-sm text-slate-400">
              Nog geen meldingen. Nieuwe offertes, servicemeldingen, afgeronde werkbonnen en betaalde facturen
              verschijnen hier vanzelf.
            </p>
          ) : null}

          {meldingen.length > 0 ? (
            <ul className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">
              {meldingen.map((melding) => (
                <li key={melding.id}>
                  <button
                    onClick={() => handleMarkeer(melding)}
                    style={{ borderLeftColor: SOORT_KLEUREN[melding.soort] || "#22d3ee" }}
                    className={`block w-full rounded-2xl border border-white/10 border-l-4 p-3 text-left transition hover:bg-white/5 ${
                      melding.gelezen ? "bg-black/20 opacity-60" : "bg-[#090909]"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {SOORT_LABELS[melding.soort] || melding.soort}
                      </p>
                      {!melding.gelezen ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{melding.titel}</p>
                    {melding.omschrijving ? (
                      <p className="mt-1 text-xs text-slate-400">{melding.omschrijving}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">{formatDatumTijd(melding.created_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
