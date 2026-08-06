"use client";

import { useState } from "react";
import { Offerte } from "../../lib/types";
import { downloadOffertePdf, KlantGegevens } from "../../lib/generateOffertePdf";

type Props = {
  offerte: Offerte;
  klant: KlantGegevens;
  className?: string;
  /** Wordt aangeroepen zodra de server de status op "Verstuurd" heeft gezet. */
  onVerstuurd?: (offerteId: string) => void;
};

export default function OfferteActieKnoppen({ offerte, klant, className, onVerstuurd }: Props) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVerstuur = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/offertes/verstuur-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerteId: offerte.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setFeedback(
          data.statusBijgewerkt
            ? "PDF is per e-mail verstuurd. Status staat nu op Verstuurd."
            : "PDF is per e-mail verstuurd naar de klant."
        );
        if (data.statusBijgewerkt) onVerstuurd?.(offerte.id);
      } else {
        setFeedback(data.error || "Versturen is mislukt.");
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Versturen is mislukt.");
    }
    setBusy(false);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => downloadOffertePdf(offerte, klant)}
          className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Genereer PDF
        </button>
        <button
          onClick={handleVerstuur}
          disabled={busy}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {busy ? "Bezig met versturen..." : "Verstuur PDF per e-mail"}
        </button>
      </div>
      {feedback ? (
        <p role="status" aria-live="polite" className="mt-1 text-xs text-slate-400">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
