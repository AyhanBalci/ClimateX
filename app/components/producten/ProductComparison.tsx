"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Scale, Sparkles } from "lucide-react";
import { ProductWithBrand } from "../../lib/producten/types";
import { formatPrijs, productDisplayName, productHref } from "../../lib/producten/helpers";

/**
 * Ja/nee-cel. Het icoon is decoratief; de betekenis staat als tekst in de cel
 * zodat schermlezers "Ja" of "Nee" voorlezen in plaats van een icoonnaam.
 */
function BoolCell({ value }: { value: boolean }) {
  return (
    <>
      {value ? (
        <Check className="mx-auto h-5 w-5 text-emerald-300" aria-hidden="true" />
      ) : (
        <Minus className="mx-auto h-5 w-5 text-slate-600" aria-hidden="true" />
      )}
      <span className="sr-only">{value ? "Ja" : "Nee"}</span>
    </>
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

/** Kolom met het kenmerk blijft staan tijdens horizontaal scrollen op smalle schermen. */
const KENMERK_KOLOM = "sticky left-0 z-10 bg-slate-950/95 backdrop-blur-sm";

export default function ProductComparison({
  products,
  defaultSelected,
}: {
  products: ProductWithBrand[];
  defaultSelected?: string[];
}) {
  const initial = defaultSelected ?? products.slice(0, 4).map((p) => `${p.merkSlug}/${p.productSlug}`);
  const [actief, setActief] = useState<string[]>(initial);
  const [alleenVerschillen, setAlleenVerschillen] = useState(false);

  const toggle = (ref: string) => {
    setActief((cur) => (cur.includes(ref) ? cur.filter((r) => r !== ref) : [...cur, ref]));
  };

  const zichtbaar = products.filter((p) => actief.includes(`${p.merkSlug}/${p.productSlug}`));

  // Bij het vergelijken zijn juist de rijen interessant waar producten van elkaar
  // afwijken; rijen met overal dezelfde waarde kunnen desgewenst verborgen worden.
  const rijen = useMemo(() => {
    if (!alleenVerschillen || zichtbaar.length < 2) return ROWS;
    return ROWS.filter((row) => {
      const waarden = zichtbaar.map((p) => String(row.get(p)));
      return new Set(waarden).size > 1;
    });
  }, [alleenVerschillen, zichtbaar]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Productvergelijking</p>
            <p className="text-sm text-slate-400">Vergelijk laadpalen naast elkaar</p>
          </div>
        </div>

        {zichtbaar.length >= 2 ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={alleenVerschillen}
              onChange={(e) => setAlleenVerschillen(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-cyan-400"
            />
            Toon alleen verschillen
          </label>
        ) : null}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {products.map((p) => {
          const ref = `${p.merkSlug}/${p.productSlug}`;
          const geselecteerd = actief.includes(ref);
          return (
            <button
              key={ref}
              onClick={() => toggle(ref)}
              aria-pressed={geselecteerd}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                geselecteerd
                  ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 bg-white/5 text-slate-500 hover:text-slate-300"
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
        <>
          {zichtbaar.length > 3 ? (
            <p className="mb-3 text-xs text-slate-500 sm:hidden">Veeg opzij om alle geselecteerde laadpalen te zien.</p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">
                Vergelijking van {zichtbaar.length} laadpalen op prijs, vermogen, laadfuncties en garantie
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className={`${KENMERK_KOLOM} px-3 py-3 text-left text-xs uppercase tracking-[0.16em] text-slate-500`}
                  >
                    Kenmerk
                  </th>
                  {zichtbaar.map((p) => (
                    <th key={`${p.merkSlug}-${p.productSlug}`} scope="col" className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold text-slate-950"
                          style={{ background: p.brand.accentHex }}
                          aria-hidden="true"
                        >
                          {p.brand.monogram}
                        </span>
                        {p.badges[0] ? (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                            <Sparkles className="h-3 w-3" aria-hidden="true" /> {p.badges[0]}
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
                {rijen.map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                    <th scope="row" className={`${KENMERK_KOLOM} px-3 py-3 text-left font-normal text-slate-400`}>
                      {row.label}
                    </th>
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

                {rijen.length === 0 ? (
                  <tr>
                    <td colSpan={zichtbaar.length + 1} className="px-3 py-8 text-center text-sm text-slate-500">
                      Deze laadpalen hebben op alle vergeleken kenmerken dezelfde waarde.
                    </td>
                  </tr>
                ) : null}

                <tr>
                  <td className={`${KENMERK_KOLOM} px-3 py-4`} />
                  {zichtbaar.map((p) => (
                    <td key={`${p.merkSlug}-${p.productSlug}-cta`} className="px-3 py-4 text-center">
                      <Link
                        href={productHref(p)}
                        className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                      >
                        Bekijken
                        <span className="sr-only"> — {productDisplayName(p)}</span>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
