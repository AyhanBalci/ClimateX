"use client";

import { useState } from "react";
import { formatBedrag } from "../../lib/formatters";
import type { AgentVoorstel, LeadAnalyse, OfferteConcept, BerichtConcept } from "../../lib/agents/climatex/types";

type Rapport = {
  motor: string;
  prioriteiten: LeadAnalyse[];
  voorstellen: AgentVoorstel[];
  overgeslagen: { leadId: string; reden: string }[];
};

const ZEKERHEID_STIJL: Record<string, string> = {
  hoog: "bg-emerald-400/10 text-emerald-300",
  gemiddeld: "bg-amber-400/10 text-amber-300",
  laag: "bg-rose-400/10 text-rose-300",
};

const SOORT_LABELS: Record<string, string> = {
  "lead-prioriteit": "Prioriteit",
  "offerte-concept": "Conceptofferte",
  "klantantwoord": "Antwoord",
  "werkbon-concept": "Werkbon",
  "planning-advies": "Planning",
  "email-concept": "E-mail",
  "whatsapp-concept": "WhatsApp",
};

/** Toont de inhoud van een voorstel in de vorm die bij de soort hoort. */
function VoorstelInhoud({ voorstel }: { voorstel: AgentVoorstel }) {
  if (voorstel.soort === "offerte-concept") {
    const concept = voorstel.inhoud as OfferteConcept;
    return (
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {[
          { label: "Product", waarde: `${concept.merk} ${concept.model}` },
          { label: "Product excl. btw", waarde: formatBedrag(concept.prijs) },
          { label: "Installatie", waarde: formatBedrag(concept.installatiekosten) },
          { label: `Totaal incl. ${concept.btwPercentage}% btw`, waarde: formatBedrag(concept.totaalInclBtw) },
        ].map((regel) => (
          <div key={regel.label}>
            <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{regel.label}</dt>
            <dd className="text-slate-200">{regel.waarde}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (voorstel.soort === "email-concept" || voorstel.soort === "whatsapp-concept") {
    const bericht = voorstel.inhoud as BerichtConcept;
    return (
      <div className="mt-3">
        {bericht.onderwerp ? (
          <p className="text-sm text-slate-300">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Onderwerp</span>{" "}
            {bericht.onderwerp}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-slate-500">
          Aan {bericht.ontvanger.naam} ({bericht.ontvanger.adres || "adres onbekend"})
        </p>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/40 p-3 font-sans text-sm text-slate-200">
          {bericht.tekst}
        </pre>
        <button
          onClick={() => navigator.clipboard?.writeText(bericht.tekst)}
          className="mt-2 min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
        >
          Kopieer tekst
        </button>
      </div>
    );
  }

  if (voorstel.soort === "lead-prioriteit") {
    const analyse = voorstel.inhoud as LeadAnalyse;
    return (
      <p className="mt-3 text-sm text-slate-300">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Volgende stap</span>{" "}
        {analyse.volgendeStap}
      </p>
    );
  }

  return null;
}

export default function AgentPaneel() {
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [bezig, setBezig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draaiRonde = async () => {
    if (bezig) return;
    setBezig(true);
    setError(null);

    try {
      const antwoord = await fetch("/api/agent/analyse", { method: "POST" });
      const data = await antwoord.json();
      if (!antwoord.ok) {
        setError(data.error || "De agent kon niet draaien.");
        return;
      }
      setRapport(data as Rapport);
    } catch (fout) {
      setError(fout instanceof Error ? fout.message : "De agent kon niet draaien.");
    } finally {
      setBezig(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">CRM-agent</h2>
          <p className="mt-1 text-sm text-slate-400">
            Bekijkt de openstaande leads en stelt voor wat er als eerste opgepakt kan worden. De agent legt niets
            vast; elk voorstel controleert u zelf voordat het naar buiten gaat.
          </p>
        </div>
        <button
          onClick={draaiRonde}
          disabled={bezig}
          className="min-h-[44px] shrink-0 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bezig ? "Agent denkt na…" : "Analyseer leads"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {rapport ? (
        <>
          <p className="mt-4 text-xs text-slate-500">
            Motor: {rapport.motor} · {rapport.prioriteiten.length} leads bekeken ·{" "}
            {rapport.voorstellen.length} voorstellen
          </p>

          {rapport.voorstellen.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Geen voorstellen. Er staan op dit moment geen leads open die opvolging vragen.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {rapport.voorstellen.map((voorstel) => (
                <li key={voorstel.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {SOORT_LABELS[voorstel.soort] || voorstel.soort}
                      </p>
                      <p className="mt-1 font-semibold text-white">{voorstel.titel}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                        ZEKERHEID_STIJL[voorstel.zekerheid] || ZEKERHEID_STIJL.gemiddeld
                      }`}
                    >
                      {voorstel.zekerheid}
                    </span>
                  </div>

                  <VoorstelInhoud voorstel={voorstel} />

                  {voorstel.onderbouwing.length > 0 ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-cyan-300 transition hover:text-cyan-200">
                        Onderbouwing ({voorstel.onderbouwing.length})
                      </summary>
                      <ul className="mt-2 space-y-1 text-xs text-slate-400">
                        {voorstel.onderbouwing.map((regel, index) => (
                          <li key={index}>· {regel}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}

                  {voorstel.controlepunten.length > 0 ? (
                    <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                        Eerst controleren
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-amber-100/80">
                        {voorstel.controlepunten.map((punt, index) => (
                          <li key={index}>· {punt}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {rapport.overgeslagen.length > 0 ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-slate-500 transition hover:text-slate-300">
                Overgeslagen leads ({rapport.overgeslagen.length})
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                {rapport.overgeslagen.map((regel) => (
                  <li key={regel.leadId}>· {regel.reden}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
