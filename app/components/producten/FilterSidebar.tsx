"use client";

import type { ReactNode } from "react";
import { Brand } from "../../lib/producten/types";
import { ProductFilters, PRICE_RANGE, VERMOGEN_OPTIES } from "../../lib/producten/helpers";

interface Props {
  brands: Brand[];
  showBrandFilter: boolean;
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
  resultCount: number;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-white/8 py-5 first:pt-0 last:border-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-slate-300 transition hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-transparent text-cyan-400 accent-cyan-400"
      />
      {label}
    </label>
  );
}

export default function FilterSidebar({ brands, showBrandFilter, filters, onChange, resultCount }: Props) {
  const toggle = <K extends keyof ProductFilters>(key: K, value: NonNullable<ProductFilters[K]>) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = <T,>(arr: T[] | undefined, value: T): T[] => {
    const current = arr ?? [];
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  };

  const reset = () =>
    onChange({ zoekterm: filters.zoekterm });

  const heeftActieveFilters =
    (filters.merken && filters.merken.length > 0) ||
    filters.minVermogen ||
    (filters.fase && filters.fase.length > 0) ||
    (filters.kabel && filters.kabel.length > 0) ||
    filters.rfid ||
    filters.midMeter ||
    filters.loadBalancing ||
    filters.dynamicLoadBalancing ||
    (filters.doelgroep && filters.doelgroep.length > 0) ||
    filters.maxPrijs;

  return (
    <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Filters</p>
        {heeftActieveFilters ? (
          <button onClick={reset} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
            Wissen
          </button>
        ) : null}
      </div>
      <p className="mb-4 text-xs text-slate-500">{resultCount} {resultCount === 1 ? "resultaat" : "resultaten"}</p>

      {showBrandFilter ? (
        <Section title="Merk">
          {brands.map((b) => (
            <Checkbox
              key={b.slug}
              label={b.naam}
              checked={filters.merken?.includes(b.slug) ?? false}
              onChange={() => toggle("merken", toggleArrayValue(filters.merken, b.slug))}
            />
          ))}
        </Section>
      ) : null}

      <Section title="Vermogen">
        {VERMOGEN_OPTIES.map((v) => (
          <Checkbox
            key={v}
            label={`Vanaf ${v} kW`}
            checked={filters.minVermogen === v}
            onChange={(checked) => toggle("minVermogen", checked ? v : (0 as never))}
          />
        ))}
      </Section>

      <Section title="Aansluiting">
        <Checkbox label="1-fase" checked={filters.fase?.includes("1-fase") ?? false} onChange={() => toggle("fase", toggleArrayValue(filters.fase, "1-fase"))} />
        <Checkbox label="3-fase" checked={filters.fase?.includes("3-fase") ?? false} onChange={() => toggle("fase", toggleArrayValue(filters.fase, "3-fase"))} />
      </Section>

      <Section title="Kabel">
        <Checkbox label="Met vaste kabel" checked={filters.kabel?.includes("vast") ?? false} onChange={() => toggle("kabel", toggleArrayValue(filters.kabel, "vast"))} />
        <Checkbox label="Zonder vaste kabel (los)" checked={filters.kabel?.includes("los") ?? false} onChange={() => toggle("kabel", toggleArrayValue(filters.kabel, "los"))} />
      </Section>

      <Section title="Slimme functies">
        <Checkbox label="RFID-ondersteuning" checked={filters.rfid ?? false} onChange={(v) => toggle("rfid", v)} />
        <Checkbox label="MID-meter" checked={filters.midMeter ?? false} onChange={(v) => toggle("midMeter", v)} />
        <Checkbox label="Load balancing" checked={filters.loadBalancing ?? false} onChange={(v) => toggle("loadBalancing", v)} />
        <Checkbox label="Dynamic load balancing" checked={filters.dynamicLoadBalancing ?? false} onChange={(v) => toggle("dynamicLoadBalancing", v)} />
      </Section>

      <Section title="Geschikt voor">
        <Checkbox
          label="Thuis (particulier)"
          checked={filters.doelgroep?.includes("particulier") ?? false}
          onChange={() => toggle("doelgroep", toggleArrayValue(filters.doelgroep, "particulier"))}
        />
        <Checkbox
          label="Zakelijk"
          checked={filters.doelgroep?.includes("zakelijk") ?? false}
          onChange={() => toggle("doelgroep", toggleArrayValue(filters.doelgroep, "zakelijk"))}
        />
        <Checkbox
          label="VvE"
          checked={filters.doelgroep?.includes("vve") ?? false}
          onChange={() => toggle("doelgroep", toggleArrayValue(filters.doelgroep, "vve"))}
        />
      </Section>

      <Section title="Prijs">
        <input
          type="range"
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={50}
          value={filters.maxPrijs ?? PRICE_RANGE.max}
          onChange={(e) => toggle("maxPrijs", Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <p className="mt-1 text-xs text-slate-500">
          Tot €{(filters.maxPrijs ?? PRICE_RANGE.max).toLocaleString("nl-NL")}
        </p>
      </Section>
    </aside>
  );
}
