"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Clock } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { LAADPAAL_MERKEN, getMerkInfo } from "../../lib/laadpaalMerken";

const laadpalen = [
  { naam: "Wallbox Pulsar Plus", merk: "Wallbox", prijs: 999 },
  { naam: "Zaptec Go", merk: "Zaptec", prijs: 1095 },
  { naam: "Alfen Eve Single Pro-line", merk: "Alfen", prijs: 1295 },
  { naam: "Easee One", merk: "Easee", prijs: 1395 },
  { naam: "EVBox Elvi", merk: "EVBox", prijs: 1650 },
  { naam: "ABB Terra AC Wallbox", merk: "ABB", prijs: 1795 },
  { naam: "Smappee EV Wall Business", merk: "Smappee", prijs: 1895 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function PrijsCalculator() {
  const [laadpaal, setLaadpaal] = useState(laadpalen[2].naam);
  const [kabellengte, setKabellengte] = useState(10);
  const [meterkast, setMeterkast] = useState(false);
  const [graafwerk, setGraafwerk] = useState(false);
  const [loadBalancing, setLoadBalancing] = useState(false);
  const [dynamicLoadBalancing, setDynamicLoadBalancing] = useState(false);

  const breakdown = useMemo(() => {
    const product = laadpalen.find((p) => p.naam === laadpaal) ?? laadpalen[0];
    const basisinstallatie = 350;
    const kabelkosten = Math.max(0, kabellengte - 10) * 18;
    const meterkastkosten = meterkast ? 450 : 0;
    const graafkosten = graafwerk ? 375 : 0;
    const loadBalancingKosten = loadBalancing ? 195 : 0;
    const dynamicKosten = dynamicLoadBalancing ? 295 : 0;

    const installatiekosten = basisinstallatie + kabelkosten + meterkastkosten + graafkosten + loadBalancingKosten + dynamicKosten;
    const totaal = product.prijs + installatiekosten;

    let installatietijd = "Halve dag";
    if (meterkast || graafwerk) installatietijd = "Hele dag";
    if (meterkast && graafwerk) installatietijd = "1 – 2 dagen";

    return { product, basisinstallatie, kabelkosten, meterkastkosten, graafkosten, loadBalancingKosten, dynamicKosten, installatiekosten, totaal, installatietijd };
  }, [laadpaal, kabellengte, meterkast, graafwerk, loadBalancing, dynamicLoadBalancing]);

  const merkInfo = getMerkInfo(breakdown.product.merk);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Prijscalculator</p>
          <p className="text-sm text-slate-400">Realtime indicatie van uw totaalprijs</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Laadpaal</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {laadpalen.map((p) => {
                const info = LAADPAAL_MERKEN.find((m) => m.merk === p.merk);
                const isActive = laadpaal === p.naam;
                return (
                  <button
                    key={p.naam}
                    type="button"
                    onClick={() => setLaadpaal(p.naam)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      isActive ? "border-cyan-300/60 bg-cyan-400/10" : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 text-xs font-bold text-cyan-300">
                      {info?.monogram ?? p.merk.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-medium text-white">{p.naam}</span>
                      <span className="block text-xs text-slate-400">{formatCurrency(p.prijs)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Kabellengte: {kabellengte} meter</span>
            <input
              type="range"
              min={5}
              max={40}
              value={kabellengte}
              onChange={(e) => setKabellengte(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <p className="text-xs text-slate-500">De eerste 10 meter zijn inbegrepen in de basisinstallatie.</p>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Meterkast uitbreiden", value: meterkast, setter: setMeterkast },
              { label: "Graafwerk nodig", value: graafwerk, setter: setGraafwerk },
              { label: "Load balancing", value: loadBalancing, setter: setLoadBalancing },
              { label: "Dynamic load balancing", value: dynamicLoadBalancing, setter: setDynamicLoadBalancing },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-black/40 text-cyan-300"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <motion.div layout className="rounded-[1.75rem] border border-white/10 bg-[#090909] p-6">
          {merkInfo ? (
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 text-sm font-bold text-cyan-300">
                {merkInfo.monogram}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{breakdown.product.naam}</p>
                <p className="text-xs text-slate-500">{merkInfo.garantie}</p>
              </div>
            </div>
          ) : null}

          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prijsopbouw</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>{breakdown.product.naam}</span><span>{formatCurrency(breakdown.product.prijs)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Basisinstallatie</span><span>{formatCurrency(breakdown.basisinstallatie)}</span></div>
            {breakdown.kabelkosten > 0 ? <div className="flex justify-between text-slate-400"><span>Extra kabellengte</span><span>{formatCurrency(breakdown.kabelkosten)}</span></div> : null}
            {breakdown.meterkastkosten > 0 ? <div className="flex justify-between text-slate-400"><span>Meterkast uitbreiden</span><span>{formatCurrency(breakdown.meterkastkosten)}</span></div> : null}
            {breakdown.graafkosten > 0 ? <div className="flex justify-between text-slate-400"><span>Graafwerk</span><span>{formatCurrency(breakdown.graafkosten)}</span></div> : null}
            {breakdown.loadBalancingKosten > 0 ? <div className="flex justify-between text-slate-400"><span>Load balancing</span><span>{formatCurrency(breakdown.loadBalancingKosten)}</span></div> : null}
            {breakdown.dynamicKosten > 0 ? <div className="flex justify-between text-slate-400"><span>Dynamic load balancing</span><span>{formatCurrency(breakdown.dynamicKosten)}</span></div> : null}
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-300" /> Geschatte installatietijd: {breakdown.installatietijd}
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="text-sm text-slate-400">Totaalprijs (indicatie)</p>
            <p className="mt-1 text-3xl font-semibold text-white">
              <AnimatedNumber value={breakdown.totaal} format={(n) => formatCurrency(Math.round(n))} />
            </p>
          </div>
          <Link
            href="/#contact"
            className="mt-6 block w-full rounded-full bg-cyan-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Vraag exacte offerte aan
          </Link>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Dit is een indicatieprijs op basis van standaardsituaties. De definitieve prijs stellen wij vast na een (foto)beoordeling van uw meterkast en installatielocatie.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
