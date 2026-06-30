"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Scale, Sparkles } from "lucide-react";
import { getMerkInfo } from "../../lib/laadpaalMerken";

type Laadpaal = {
  merk: string;
  model: string;
  prijs: string;
  laadvermogen: string;
  app: boolean;
  garantie: string;
  loadBalancing: boolean;
  dynamicLoadBalancing: boolean;
  thuis: boolean;
  zakelijk: boolean;
  aanbevolen?: boolean;
};

const laadpalen: Laadpaal[] = [
  { merk: "Alfen", model: "Eve Single Pro-line", prijs: "€1.295", laadvermogen: "11 kW", app: true, garantie: "3 jaar", loadBalancing: true, dynamicLoadBalancing: false, thuis: true, zakelijk: false },
  { merk: "Zaptec", model: "Zaptec Go", prijs: "€1.095", laadvermogen: "11 kW", app: true, garantie: "5 jaar", loadBalancing: true, dynamicLoadBalancing: false, thuis: true, zakelijk: false },
  { merk: "Wallbox", model: "Pulsar Plus", prijs: "€999", laadvermogen: "11 kW", app: true, garantie: "3 jaar", loadBalancing: false, dynamicLoadBalancing: false, thuis: true, zakelijk: false },
  { merk: "Easee", model: "Easee One", prijs: "€1.395", laadvermogen: "22 kW", app: true, garantie: "5 jaar", loadBalancing: true, dynamicLoadBalancing: true, thuis: true, zakelijk: true, aanbevolen: true },
  { merk: "ABB", model: "Terra AC Wallbox", prijs: "€1.795", laadvermogen: "22 kW", app: true, garantie: "2 jaar", loadBalancing: true, dynamicLoadBalancing: true, thuis: false, zakelijk: true },
];

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto h-5 w-5 text-emerald-300" aria-label="Ja" />
  ) : (
    <Minus className="mx-auto h-5 w-5 text-slate-600" aria-label="Nee" />
  );
}

const rows: { key: keyof Laadpaal; label: string }[] = [
  { key: "prijs", label: "Vanaf prijs" },
  { key: "laadvermogen", label: "Laadvermogen" },
  { key: "app", label: "App-besturing" },
  { key: "garantie", label: "Garantie" },
  { key: "loadBalancing", label: "Load balancing" },
  { key: "dynamicLoadBalancing", label: "Dynamic load balancing" },
  { key: "thuis", label: "Geschikt voor thuis" },
  { key: "zakelijk", label: "Geschikt voor zakelijk" },
];

export default function LaadpaalVergelijker() {
  const [actief, setActief] = useState<string[]>(laadpalen.map((p) => p.merk));

  const toggle = (merk: string) => {
    setActief((current) => (current.includes(merk) ? current.filter((m) => m !== merk) : [...current, merk]));
  };

  const zichtbaar = laadpalen.filter((p) => actief.includes(p.merk));

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Scale className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Laadpaalvergelijker</p>
          <p className="text-sm text-slate-400">Vergelijk de populairste merken naast elkaar</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {laadpalen.map((p) => (
          <button
            key={p.merk}
            onClick={() => toggle(p.merk)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
              actief.includes(p.merk)
                ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-200"
                : "border-white/10 bg-white/5 text-slate-500"
            }`}
          >
            {p.merk}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-500">Kenmerk</th>
              {zichtbaar.map((p) => {
                const info = getMerkInfo(p.merk);
                return (
                  <th key={p.merk} className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 text-xs font-bold text-cyan-300">
                        {info?.monogram ?? p.merk.slice(0, 2).toUpperCase()}
                      </span>
                      {p.aanbevolen ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                          <Sparkles className="h-3 w-3" /> Aanbevolen
                        </span>
                      ) : null}
                      <p className="text-sm font-semibold text-white">{p.merk}</p>
                      <p className="text-xs text-slate-500">{p.model}</p>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                <td className="px-3 py-3 text-slate-400">{row.label}</td>
                {zichtbaar.map((p) => (
                  <td key={p.merk} className="px-3 py-3 text-center text-slate-200">
                    {typeof p[row.key] === "boolean" ? <BoolCell value={p[row.key] as boolean} /> : (p[row.key] as string)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-3 py-4"></td>
              {zichtbaar.map((p) => (
                <td key={p.merk} className="px-3 py-4 text-center">
                  <Link
                    href="/#contact"
                    className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                  >
                    Offerte
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
