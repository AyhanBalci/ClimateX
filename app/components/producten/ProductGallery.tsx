"use client";

import { useState } from "react";
import { Product, ImageVariant } from "../../lib/producten/types";
import { productImagePath } from "../../lib/producten/helpers";

const VARIANTS: { key: ImageVariant; label: string }[] = [
  { key: "hero", label: "Overzicht" },
  { key: "angle", label: "Hoekaanzicht" },
  { key: "front", label: "Vooraanzicht" },
  { key: "side", label: "Zijaanzicht" },
  { key: "detail", label: "Detail" },
  { key: "installed", label: "Geïnstalleerd" },
];

export default function ProductGallery({ product }: { product: Product }) {
  const [actief, setActief] = useState<ImageVariant>("hero");

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10">
      <div className="h-64 sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImagePath(product, actief)}
          alt={`${product.model} — ${VARIANTS.find((v) => v.key === actief)?.label}`}
          className="h-full w-full bg-slate-900 object-cover"
        />
      </div>
      <div className="grid grid-cols-6 gap-px bg-white/5">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            onClick={() => setActief(v.key)}
            aria-label={v.label}
            className={`relative h-14 overflow-hidden bg-slate-950/90 transition ${
              actief === v.key ? "ring-2 ring-inset ring-cyan-300" : "opacity-60 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={productImagePath(product, v.key)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
