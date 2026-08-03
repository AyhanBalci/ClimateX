"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Scale, Sparkles } from "lucide-react";
import { ProductWithBrand } from "../../lib/producten/types";
import { formatPrijs, productDisplayName, productHref } from "../../lib/producten/helpers";

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto h-5 w-5 text-emerald-300" aria-label="Ja" />
  ) : (
    <Minus className="mx-auto h-5 w-5 text-slate-600" aria-label="Nee" />
  );
}

const ROWS: { key: string; label: string; get: (p: ProductWithBrand) => string | boolean }[] = [
  { key: "prijs", label: "Vanaf prijs", get: (p) => formatPrijs(p.vanafPrijs) },
  { key: "vermogen", label: "Laadvermogen", get: (p) => p.specs.vermogenLabel },
  { key: "kabel", label: "Vaste kabel", get: (p) => p.specs.kabel === "vast" },
  { key: "rfid", label: "RFID", get: (p) => p.specs.rfid },
  { key: "lb", label: "Load balancing", get: (p) => p.specs.loadBalancing },
  { key: "dlb", label: "Dynamic load balancing", get: (p) => p.specs.dynamicLoadBalancing },
  { key: "mid", label: "MID-meter", get: (p) => p.specs.midMeter },
  { key: "garantie", label: "Garantie", get: (p) => p.specs.garantieLabel },
  { key: "thuis", label: "Geschikt voor thuis", get: (p) => p.geschiktVoor.includes("particulier") },
  { key: "zakelijk", label: "Geschikt voor zakelijk", get: (p) => p.geschiktVoor.includes("zakelijk") },
];

export default function ProductComparison({ products, defaultSelected }: { products: ProductWithBrand[]; defaultSelected?: string[] }) {
  const initial = defaultSelected ?? products.slice(0, 4).map((p) => `${p.merkSlug}/${p.productSlug}`);
  const [actief, setActief] = useState<string[]>(initial);

  const toggle = (ref: string) => {
    setActief((cur) => (cur.includes(ref) ? cur.filter((r) => r !== ref) : [...cur, ref]));
  };

  const zichtbaar = products.filter((p) => actief.includes(`${p.merkSlug}/${p.productSlug}`));

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Scale className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Productvergelijking</p>
          <p className="text-sm text-slate-400">Vergelijk laadpalen naast elkaar</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {products.map((p) => {
          const ref = `${p.merkSlug}/${p.productSlug}`;
          return (
            <button
              key={ref}
              onClick={() => toggle(ref)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                actief.includes(ref) ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/5 text-slate-500"
              }`}
            >
              {productDisplayName(p)}
            </button>
          );
        })}
      </div>

      {zichtbaar.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">Selecteer minimaal één laadpaal om te vergelijken.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs uppercase tracking-[0.16em] text-slate-500">Kenmerk</th>
                {zichtbaar.map((p) => (
                  <th key={`${p.merkSlug}-${p.productSlug}`} className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold text-slate-950"
                        style={{ background: p.brand.accentHex }}
                      >
                        {p.brand.monogram}
                      </span>
                      {p.badges[0] ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                          <Sparkles className="h-3 w-3" /> {p.badges[0]}
                        </span>
                      ) : null}
                      <p className="text-sm font-semibold text-white">{p.brand.naam}</p>
                      <p className="text-xs text-slate-500">{p.model}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                  <td className="px-3 py-3 text-slate-400">{row.label}</td>
                  {zichtbaar.map((p) => {
                    const value = row.get(p);
                    return (
                      <td key={`${p.merkSlug}-${p.productSlug}`} className="px-3 py-3 text-center text-slate-200">
                        {typeof value === "boolean" ? <BoolCell value={value} /> : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="px-3 py-4" />
                {zichtbaar.map((p) => (
                  <td key={`${p.merkSlug}-${p.productSlug}-cta`} className="px-3 py-4 text-center">
                    <Link
                      href={productHref(p)}
                      className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                    >
                      Bekijken
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
