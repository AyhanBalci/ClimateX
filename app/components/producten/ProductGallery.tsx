"use client";

import { useState } from "react";
import { Product, ImageVariant } from "../../lib/producten/types";
import { productDisplayName, productImagePath } from "../../lib/producten/helpers";

const VARIANTS: { key: ImageVariant; label: string }[] = [
  { key: "hero", label: "Overzicht" },
  { key: "angle", label: "Hoekaanzicht" },
  { key: "front", label: "Vooraanzicht" },
  { key: "side", label: "Zijaanzicht" },
  { key: "detail", label: "Detail" },
  { key: "installed", label: "Geïnstalleerd" },
];

/** Verhouding van de productbeelden (4:3), zodat de browser ruimte reserveert
 *  en de pagina niet verspringt terwijl de afbeelding laadt. */
const BEELD_BREEDTE = 1000;
const BEELD_HOOGTE = 750;

export default function ProductGallery({ product }: { product: Product }) {
  const [actief, setActief] = useState<ImageVariant>("hero");
  const actieveVariant = VARIANTS.find((v) => v.key === actief);
  const naam = productDisplayName(product);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10">
      <div className="h-64 sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImagePath(product, actief)}
          alt={`${naam} — ${actieveVariant?.label}`}
          width={BEELD_BREEDTE}
          height={BEELD_HOOGTE}
          // Dit is het grootste beeld boven de vouw op de productpagina.
          fetchPriority="high"
          decoding="async"
          className="h-full w-full bg-slate-900 object-cover"
        />
      </div>
      <div role="group" aria-label={`Afbeeldingen van de ${naam}`} className="grid grid-cols-6 gap-px bg-white/5">
        {VARIANTS.map((v) => {
          const geselecteerd = actief === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => setActief(v.key)}
              aria-label={v.label}
              aria-pressed={geselecteerd}
              className={`relative h-14 overflow-hidden bg-slate-950/90 transition ${
                geselecteerd ? "ring-2 ring-inset ring-cyan-300" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImagePath(product, v.key)}
                alt=""
                width={BEELD_BREEDTE}
                height={BEELD_HOOGTE}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
