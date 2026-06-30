"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Zap } from "lucide-react";

type Answers = {
  segment: "particulier" | "zakelijk";
  woning: string;
  automerk: string;
  aantalAutos: string;
  aansluiting: "1-fase" | "3-fase" | "Weet ik niet";
  oprit: "ja" | "nee";
  loadBalancing: boolean;
  dynamicLoadBalancing: boolean;
};

const initialAnswers: Answers = {
  segment: "particulier",
  woning: "Gezinswoning",
  automerk: "",
  aantalAutos: "1",
  aansluiting: "1-fase",
  oprit: "ja",
  loadBalancing: false,
  dynamicLoadBalancing: false,
};

function recommend(answers: Answers) {
  if (answers.segment === "zakelijk" || Number(answers.aantalAutos) >= 3 || answers.dynamicLoadBalancing) {
    return {
      naam: "ABB Terra AC Wallbox",
      uitleg:
        "Voor zakelijk gebruik of meerdere voertuigen adviseren wij een robuuste laadpaal met dynamic load balancing, zodat uw hoofdaansluiting nooit overbelast raakt.",
      prijs: "vanaf €1.795",
    };
  }
  if (answers.loadBalancing || Number(answers.aantalAutos) === 2) {
    return {
      naam: "Easee One",
      uitleg:
        "Met twee auto's of de wens voor load balancing is Easee One een uitstekende keuze: compact, slim en eenvoudig uit te breiden.",
      prijs: "vanaf €1.395",
    };
  }
  if (answers.aansluiting === "3-fase") {
    return {
      naam: "Zaptec Go",
      uitleg: "Op een 3-fase aansluiting laadt u met Zaptec Go snel en slim, met ingebouwde load balancing.",
      prijs: "vanaf €1.095",
    };
  }
  return {
    naam: "Wallbox Pulsar Plus",
    uitleg: "Voor thuisgebruik op een 1-fase aansluiting is de Wallbox Pulsar Plus compact, betaalbaar en slim.",
    prijs: "vanaf €999",
  };
}

const steps = ["segment", "woning", "voertuig", "aansluiting", "wensen"] as const;

export default function LaadpaalWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [finished, setFinished] = useState(false);

  const result = useMemo(() => recommend(answers), [answers]);
  const step = steps[stepIndex];
  const progress = ((stepIndex + (finished ? 1 : 0)) / steps.length) * 100;

  const next = () => {
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
    else setFinished(true);
  };
  const back = () => {
    if (finished) {
      setFinished(false);
      return;
    }
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };
  const restart = () => {
    setAnswers(initialAnswers);
    setStepIndex(0);
    setFinished(false);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Laadpaal keuzehulp</p>
            <p className="text-sm text-slate-400">In 5 stappen naar uw ideale laadpaal</p>
          </div>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">
          Stap {finished ? steps.length : stepIndex + 1} van {steps.length}
        </span>
      </div>

      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {step === "segment" ? (
              <div>
                <h3 className="text-xl font-semibold text-white">Voor wie is de laadpaal?</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(["particulier", "zakelijk"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswers((a) => ({ ...a, segment: option }))}
                      className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium capitalize transition ${
                        answers.segment === option
                          ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200"
                          : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === "woning" ? (
              <div>
                <h3 className="text-xl font-semibold text-white">Wat is uw type woning of locatie?</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Gezinswoning", "Appartement", "Vrijstaande woning", "Bedrijfspand / VvE"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswers((a) => ({ ...a, woning: option }))}
                      className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition ${
                        answers.woning === option
                          ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200"
                          : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === "voertuig" ? (
              <div>
                <h3 className="text-xl font-semibold text-white">Vertel ons over uw voertuig(en)</h3>
                <div className="mt-5 grid gap-4">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Automerk (optioneel)</span>
                    <input
                      type="text"
                      value={answers.automerk}
                      onChange={(e) => setAnswers((a) => ({ ...a, automerk: e.target.value }))}
                      placeholder="Bijv. Tesla, Volkswagen, Kia"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Aantal elektrische auto&apos;s</span>
                    <select
                      value={answers.aantalAutos}
                      onChange={(e) => setAnswers((a) => ({ ...a, aantalAutos: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3 of meer</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            {step === "aansluiting" ? (
              <div>
                <h3 className="text-xl font-semibold text-white">Wat is uw aansluiting en parkeersituatie?</h3>
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(["1-fase", "3-fase", "Weet ik niet"] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setAnswers((a) => ({ ...a, aansluiting: option }))}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          answers.aansluiting === option
                            ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200"
                            : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["ja", "nee"] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setAnswers((a) => ({ ...a, oprit: option }))}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          answers.oprit === option
                            ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200"
                            : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        {option === "ja" ? "Ik heb een eigen oprit" : "Geen eigen oprit"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === "wensen" ? (
              <div>
                <h3 className="text-xl font-semibold text-white">Heeft u specifieke wensen?</h3>
                <div className="mt-5 grid gap-3">
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={answers.loadBalancing}
                      onChange={(e) => setAnswers((a) => ({ ...a, loadBalancing: e.target.checked }))}
                      className="h-5 w-5 rounded border-white/20 bg-black/40 text-cyan-300"
                    />
                    Load balancing (verdeel stroom slim over laadpunten)
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={answers.dynamicLoadBalancing}
                      onChange={(e) => setAnswers((a) => ({ ...a, dynamicLoadBalancing: e.target.checked }))}
                      className="h-5 w-5 rounded border-white/20 bg-black/40 text-cyan-300"
                    />
                    Dynamic load balancing (realtime sturing op basis van verbruik)
                  </label>
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
              <Check className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-emerald-300/80">Aanbevolen voor u</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{result.naam}</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{result.uitleg}</p>
            <p className="mt-4 text-lg font-semibold text-cyan-300">{result.prijs}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-slate-100"
              >
                Vraag offerte aan
              </Link>
              <button
                onClick={restart}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Opnieuw beginnen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!finished ? (
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Terug
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {stepIndex === steps.length - 1 ? "Toon advies" : "Volgende"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
