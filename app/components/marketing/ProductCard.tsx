"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Clock, ShieldCheck, Sparkles } from "lucide-react";
import ProductImagePlaceholder from "../ProductImagePlaceholder";
import { Product } from "../../lib/types";
import { getMerkInfo } from "../../lib/laadpaalMerken";

function formatPrice(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value) + " incl. installatie";
}

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const info = getMerkInfo(product.merk);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-xl shadow-black/30 transition-colors hover:border-cyan-300/30"
    >
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:p-8">
        <div>
          {product.afbeelding_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.afbeelding_url}
              alt={`${product.merk} ${product.model}`}
              loading="lazy"
              className="h-56 w-full rounded-[1.5rem] object-cover sm:h-64"
            />
          ) : (
            <div className="h-56 sm:h-64">
              <ProductImagePlaceholder label={`${product.merk} ${product.model}`} />
            </div>
          )}

          {info ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#090909] p-4">
                <Clock className="h-4 w-4 text-cyan-300" />
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Levertijd</p>
                <p className="mt-1 text-sm font-semibold text-white">{info.levertijd}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#090909] p-4">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Garantie</p>
                <p className="mt-1 text-sm font-semibold text-white">{info.garantie}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{product.merk}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{product.model}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{product.beschrijving}</p>

          {info && info.voordelen.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {info.voordelen.map((voordeel) => (
                <li key={voordeel} className="flex items-start gap-2 text-sm text-slate-300">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {voordeel}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <span className="rounded-2xl bg-slate-900/80 px-3 py-2.5 text-xs uppercase tracking-[0.16em] text-slate-300">
              Laadvermogen {product.koelvermogen}
            </span>
            <span className="flex items-center gap-1.5 rounded-2xl bg-slate-900/80 px-3 py-2.5 text-xs uppercase tracking-[0.16em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> {product.verwarmvermogen}
            </span>
            <span className="rounded-2xl bg-slate-900/80 px-3 py-2.5 text-xs uppercase tracking-[0.16em] text-slate-300 sm:col-span-2">
              Geschikt voor: {product.energieklasse}
            </span>
          </div>

          <div className="mt-6 flex flex-1 flex-col justify-end gap-4">
            <p className="text-2xl font-semibold text-white">{formatPrice(product.prijs)}</p>
            <a
              href="#offerte"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Offerte aanvragen
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
