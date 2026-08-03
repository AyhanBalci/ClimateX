import Link from "next/link";
import { BadgeCheck, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { ProductWithBrand } from "../../lib/producten/types";
import { formatPrijs, productDisplayName, productHref, productImagePath } from "../../lib/producten/helpers";

function slimmeFuncties(product: ProductWithBrand): string[] {
  const items: string[] = [];
  if (product.specs.dynamicLoadBalancing) items.push("Dynamic load balancing");
  else if (product.specs.loadBalancing) items.push("Load balancing");
  if (product.specs.rfid) items.push("RFID");
  if (product.specs.midMeter) items.push("MID-meter");
  if (product.specs.app) items.push("App-besturing");
  return items.slice(0, 3);
}

export default function ProductCard({ product }: { product: ProductWithBrand }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 shadow-lg shadow-black/20 transition-colors hover:border-cyan-300/30">
      <Link href={productHref(product)} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImagePath(product, "hero")}
          alt={productDisplayName(product)}
          loading="lazy"
          className="h-52 w-full bg-slate-900 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-slate-950"
            style={{ background: product.brand.accentHex }}
          >
            {product.brand.monogram}
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.brand.naam}</p>
          {product.badges[0] ? (
            <span className="ml-auto rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
              {product.badges[0]}
            </span>
          ) : null}
        </div>

        <Link href={productHref(product)} className="mt-3 block">
          <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-cyan-200">{product.model}</h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-400">{product.tagline}</p>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
          <Gauge className="h-3.5 w-3.5 text-cyan-300" />
          {product.specs.vermogenLabel}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {slimmeFuncties(product).map((f) => (
            <span key={f} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
              <Sparkles className="h-3 w-3 text-cyan-300" /> {f}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" /> {product.specs.garantieLabel}
        </div>

        <div className="mt-5 flex flex-1 items-end justify-between gap-3 border-t border-white/5 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Vanaf</p>
            <p className="text-lg font-semibold text-white">{formatPrijs(product.vanafPrijs)}</p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-slate-100"
          >
            <BadgeCheck className="h-3.5 w-3.5" /> Offerte
          </Link>
        </div>
      </div>
    </article>
  );
}
