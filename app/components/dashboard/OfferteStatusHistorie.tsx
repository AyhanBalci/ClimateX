"use client";

import { useEffect, useState } from "react";
import { OfferteStatusHistorieRegel } from "../../lib/types";
import { supabase } from "../../lib/supabase";
import { formatDatum, formatDatumTijd } from "../../lib/formatters";
import { geldigTot, isVerlopen } from "../../lib/offerteStatus";

type Props = {
  offerteId: string;
  offerteDatum: string;
  status: string;
};

/**
 * Toont wanneer een offerte van status wisselde en tot wanneer die geldig is.
 * De historie wordt pas opgehaald zodra de gebruiker het paneel opent: bij een
 * lijst met tientallen offertes zou vooraf laden even zoveel losse verzoeken
 * kosten voor gegevens die meestal niet bekeken worden.
 */
export default function OfferteStatusHistorie({ offerteId, offerteDatum, status }: Props) {
  const [open, setOpen] = useState(false);
  const [regels, setRegels] = useState<OfferteStatusHistorieRegel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let verouderd = false;

    async function fetchHistorie() {
      if (!supabase) {
        setError("Supabase is niet geconfigureerd.");
        return;
      }

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("offerte_status_historie")
        .select("*")
        .eq("offerte_id", offerteId)
        .order("created_at", { ascending: false });

      if (verouderd) return;

      if (fetchError) setError(fetchError.message);
      else {
        setError(null);
        setRegels((data as OfferteStatusHistorieRegel[]) || []);
      }
      setLoading(false);
    }

    fetchHistorie();

    return () => {
      verouderd = true;
    };
  }, [open, offerteId]);

  const verlopen = isVerlopen(status, offerteDatum);
  const geldigTotDatum = geldigTot(offerteDatum);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((huidig) => !huidig)}
        aria-expanded={open}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
      >
        {open ? "Verberg historie" : "Historie"}
      </button>

      {open ? (
        <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 p-3">
          <p className={`text-xs ${verlopen ? "text-amber-300" : "text-slate-400"}`}>
            {verlopen
              ? `Geldigheid verstreken op ${formatDatum(geldigTotDatum)}`
              : `Geldig tot ${formatDatum(geldigTotDatum)}`}
          </p>

          {loading ? <p className="mt-2 text-xs text-slate-400">Bezig met laden...</p> : null}
          {error ? (
            <p role="alert" className="mt-2 text-xs text-rose-400">
              {error}
            </p>
          ) : null}

          {!loading && !error && regels.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">
              Nog geen statuswijzigingen vastgelegd. De historie vult zich vanaf de eerstvolgende wijziging.
            </p>
          ) : null}

          {!loading && regels.length > 0 ? (
            <ol className="mt-2 space-y-1">
              {regels.map((regel) => (
                <li key={regel.id} className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-slate-200">{regel.status}</span>
                  <span className="text-slate-500">
                    {formatDatumTijd(regel.created_at)}
                    {regel.bron ? ` · ${regel.bron}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
