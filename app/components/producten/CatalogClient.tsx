"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Brand, ProductWithBrand } from "../../lib/producten/types";
import { filterProducts, ProductFilters } from "../../lib/producten/helpers";
import ProductCard from "./ProductCard";
import FilterSidebar from "./FilterSidebar";

interface Props {
  products: ProductWithBrand[];
  brands: Brand[];
  showBrandFilter?: boolean;
}

export default function CatalogClient({ products, brands, showBrandFilter = true }: Props) {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const resultaten = useMemo(() => filterProducts(products, filters), [products, filters]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filters.zoekterm ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, zoekterm: e.target.value }))}
            placeholder="Zoek op merk, model of kenmerk…"
            className="w-full rounded-full border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 lg:hidden"
        >
          {filtersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <FilterSidebar
            brands={brands}
            showBrandFilter={showBrandFilter}
            filters={filters}
            onChange={setFilters}
            resultCount={resultaten.length}
          />
        </div>

        <div>
          {resultaten.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/50 px-6 py-16 text-center">
              <p className="text-sm text-slate-400">Geen laadpalen gevonden die aan deze filters voldoen.</p>
              <button
                onClick={() => setFilters({})}
                className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Filters wissen
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {resultaten.map((product) => (
                <ProductCard key={`${product.merkSlug}-${product.productSlug}`} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
