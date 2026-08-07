"use client";

import { useState } from "react";
import { dashboardFetch } from "../../lib/dashboardFetch";

type GekoppeldRecord = {
  soort: string;
  aantal: number;
  kenmerken: string[];
  ookAanServicemelding?: boolean;
};

type Inventarisatie = {
  leadNaam: string;
  gekoppeld: GekoppeldRecord[];
  totaalRecords: number;
  bestandenInOpslag: number;
  waarschuwingen: string[];
};

type Props = {
  leadId: string;
  leadNaam: string;
  /** Wordt aangeroepen zodra de lead daadwerkelijk verwijderd is. */
  onVerwijderd: () => void;
};

/**
 * Definitief verwijderen van een testlead, inclusief alles wat eraan hangt.
 *
 * De gewone verwijderknop blokkeert zodra er offertes, werkbonnen of facturen
 * aan een lead hangen, en dat blijft zo. Dit is de bewuste uitzondering, met
 * drie drempels ervoor: de beheerder moet hem eerst openklappen, dan de
 * inventarisatie opvragen en bekijken, en pas daarna een vaste tekst intypen.
 * Zonder die stappen gebeurt er niets.
 */
export default function LeadDefinitiefVerwijderen({ leadId, leadNaam, onVerwijderd }: Props) {
  const [open, setOpen] = useState(false);
  const [inventarisatie, setInventarisatie] = useState<Inventarisatie | null>(null);
  const [bevestiging, setBevestiging] = useState("");
  const [bezig, setBezig] = useState<"inventarisatie" | "verwijderen" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultaat, setResultaat] = useState<Record<string, number> | null>(null);

  const BEVESTIGINGSTEKST = "DEFINITIEF VERWIJDEREN";

  const haalInventarisatie = async () => {
    if (bezig) return;
    setBezig("inventarisatie");
    setError(null);
    try {
      const respons = await dashboardFetch("/api/leads/verwijder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, actie: "inventarisatie" }),
      });
      const data = await respons.json();
      if (!respons.ok) {
        setError(data.error || "Kon niet ophalen wat er aan deze lead hangt.");
        return;
      }
      setInventarisatie(data.inventarisatie as Inventarisatie);
      setOpen(true);
    } catch (fout) {
      setError(fout instanceof Error ? fout.message : "Kon de gegevens niet ophalen.");
    } finally {
      setBezig(null);
    }
  };

  const verwijderDefinitief = async () => {
    if (bezig || bevestiging !== BEVESTIGINGSTEKST) return;
    setBezig("verwijderen");
    setError(null);
    try {
      const respons = await dashboardFetch("/api/leads/verwijder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, actie: "definitief", bevestiging }),
      });
      const data = await respons.json();
      if (!respons.ok) {
        setError(
          data.details?.length
            ? `${data.error} (${data.details.join("; ")})`
            : data.error || "Verwijderen is mislukt."
        );
        return;
      }
      setResultaat(data.resultaat.verwijderd as Record<string, number>);
    } catch (fout) {
      setError(fout instanceof Error ? fout.message : "Verwijderen is mislukt.");
    } finally {
      setBezig(null);
    }
  };

  // Na afloop laten zien wát er weg is, zodat controleerbaar blijft wat er
  // gebeurd is in plaats van alleen "gelukt".
  if (resultaat) {
    return (
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/5 p-4">
        <p className="text-sm font-semibold text-emerald-300">Lead definitief verwijderd</p>
        <ul className="mt-2 space-y-1 text-xs text-emerald-100/80">
          {Object.entries(resultaat).map(([soort, aantal]) => (
            <li key={soort}>
              · {aantal} {soort.toLowerCase()}
            </li>
          ))}
        </ul>
        <button
          onClick={onVerwijderd}
          className="mt-4 min-h-[44px] rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Terug naar het overzicht
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        <button
          onClick={haalInventarisatie}
          disabled={bezig !== null}
          className="min-h-[44px] rounded-full border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bezig === "inventarisatie" ? "Bezig met opzoeken…" : "Definitief verwijderen inclusief gekoppelde data"}
        </button>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-rose-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-rose-400/30 bg-rose-500/5 p-4 sm:p-6">
      <h4 className="text-base font-semibold text-rose-200">
        Definitief verwijderen: {inventarisatie?.leadNaam || leadNaam}
      </h4>
      <p className="mt-2 text-sm text-slate-300">
        Dit verwijdert de lead en alle onderstaande gegevens, inclusief de bijbehorende bestanden in de opslag. Dit
        kan niet ongedaan worden gemaakt.
      </p>

      {inventarisatie && inventarisatie.gekoppeld.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-slate-200">
          {inventarisatie.gekoppeld.map((regel) => (
            <li key={regel.soort} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold">{regel.aantal}×</span>
              <span>{regel.soort}</span>
              {regel.kenmerken.length > 0 ? (
                <span className="text-xs text-slate-500">({regel.kenmerken.slice(0, 6).join(", ")})</span>
              ) : null}
              {regel.ookAanServicemelding ? (
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-amber-300">
                  ook bij servicemelding
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-400">Er hangen geen gekoppelde records aan deze lead.</p>
      )}

      {inventarisatie && inventarisatie.waarschuwingen.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Let op</p>
          <ul className="mt-1 space-y-1 text-xs text-amber-100/80">
            {inventarisatie.waarschuwingen.map((waarschuwing, index) => (
              <li key={index}>· {waarschuwing}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <label className="mt-5 block text-sm text-slate-300">
        Typ <span className="font-mono font-semibold text-rose-200">{BEVESTIGINGSTEKST}</span> om te bevestigen
        <input
          type="text"
          value={bevestiging}
          onChange={(event) => setBevestiging(event.target.value)}
          autoComplete="off"
          className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-rose-300"
        />
      </label>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={verwijderDefinitief}
          disabled={bevestiging !== BEVESTIGINGSTEKST || bezig !== null}
          className="min-h-[44px] rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {bezig === "verwijderen" ? "Bezig met verwijderen…" : "Ja, definitief verwijderen"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setBevestiging("");
            setError(null);
          }}
          disabled={bezig !== null}
          className="min-h-[44px] rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
