"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingDown } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
}

export default function BesparingsCalculator() {
  const [kmPerJaar, setKmPerJaar] = useState(15000);
  const [verbruik, setVerbruik] = useState(18);
  const [openbaarPrijs, setOpenbaarPrijs] = useState(0.59);
  const [thuisPrijs, setThuisPrijs] = useState(0.28);

  const resultaat = useMemo(() => {
    const kwhPerJaar = (kmPerJaar / 100) * verbruik;
    const kostenOpenbaar = kwhPerJaar * openbaarPrijs;
    const kostenThuis = kwhPerJaar * thuisPrijs;
    const besparingPerJaar = Math.max(0, kostenOpenbaar - kostenThuis);
    const besparingPerMaand = besparingPerJaar / 12;
    const investering = 1295 + 350;
    const terugverdientijdMaanden = besparingPerMaand > 0 ? investering / besparingPerMaand : null;
    return { besparingPerJaar, besparingPerMaand, terugverdientijdMaanden };
  }, [kmPerJaar, verbruik, openbaarPrijs, thuisPrijs]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <TrendingDown className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">Besparingscalculator</p>
          <p className="text-sm text-slate-400">Bereken uw besparing t.o.v. openbaar laden</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Kilometers per jaar: {kmPerJaar.toLocaleString("nl-NL")} km</span>
            <input type="range" min={2000} max={40000} step={500} value={kmPerJaar} onChange={(e) => setKmPerJaar(Number(e.target.value))} className="w-full accent-emerald-400" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Gemiddeld verbruik: {verbruik} kWh / 100 km</span>
            <input type="range" min={12} max={28} step={0.5} value={verbruik} onChange={(e) => setVerbruik(Number(e.target.value))} className="w-full accent-emerald-400" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Huidige openbare laadprijs: {formatCurrency(openbaarPrijs)} / kWh</span>
            <input type="range" min={0.3} max={0.9} step={0.01} value={openbaarPrijs} onChange={(e) => setOpenbaarPrijs(Number(e.target.value))} className="w-full accent-emerald-400" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Thuis stroomprijs: {formatCurrency(thuisPrijs)} / kWh</span>
            <input type="range" min={0.15} max={0.5} step={0.01} value={thuisPrijs} onChange={(e) => setThuisPrijs(Number(e.target.value))} className="w-full accent-emerald-400" />
          </label>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-[#090909] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Uw besparing</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-slate-400">Per maand</p>
              <p className="text-2xl font-semibold text-emerald-300">
                <AnimatedNumber value={resultaat.besparingPerMaand} format={(n) => formatCurrency(n)} />
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Per jaar</p>
              <p className="text-2xl font-semibold text-white">
                <AnimatedNumber value={resultaat.besparingPerJaar} format={(n) => formatCurrency(n)} />
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Geschatte terugverdientijd laadpaal</p>
              <p className="text-2xl font-semibold text-white">
                {resultaat.terugverdientijdMaanden ? `${Math.round(resultaat.terugverdientijdMaanden)} maanden` : "—"}
              </p>
              {resultaat.terugverdientijdMaanden ? (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (24 / Math.max(resultaat.terugverdientijdMaanden, 1)) * 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <Link
            href="/#contact"
            className="mt-6 block w-full rounded-full bg-emerald-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Start met besparen
          </Link>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Dit is een indicatie op basis van uw invoer en gemiddelde marktprijzen. Werkelijke besparing is afhankelijk van uw energiecontract en laadgedrag.
          </p>
        </div>
      </div>
    </div>
  );
}
