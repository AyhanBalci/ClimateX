import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/marketing/Footer";
import QuoteForm from "../components/QuoteForm";
import CatalogClient from "../components/producten/CatalogClient";
import ProductComparison from "../components/producten/ProductComparison";
import { BRANDS } from "../lib/producten/brands";
import { ALL_PRODUCTS } from "../lib/producten/helpers";

export const metadata: Metadata = {
  title: "Laadpalen | Alfen, Ratio, Easee, Wallbox & Zaptec",
  description:
    "Bekijk en vergelijk premium laadpalen van Alfen, Ratio, Easee, Wallbox en Zaptec. Filter op vermogen, load balancing, RFID en meer. Inclusief installatie en vaste prijs.",
  alternates: { canonical: "/producten" },
};

export default function ProductenPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Productcatalogus</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Laadpalen van Alfen, Ratio, Easee, Wallbox en Zaptec.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Alle prijzen zijn inclusief installatie door NEN 1010 gecertificeerde monteurs. Filter op vermogen, RFID,
              load balancing en meer, of vraag direct een gratis offerte aan.
            </p>
          </div>

          <div className="relative mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {BRANDS.map((b) => (
              <Link
                key={b.slug}
                href={`/producten/${b.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-slate-950"
                  style={{ background: b.accentHex }}
                >
                  {b.monogram}
                </span>
                {b.naam}
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <CatalogClient products={ALL_PRODUCTS} brands={BRANDS} showBrandFilter />
          </div>

          <section className="mx-auto mt-24 max-w-6xl">
            <ProductComparison products={ALL_PRODUCTS} />
          </section>

          <section id="offerte" className="mt-24">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-sm uppercase tracking-[0.24em] text-emerald-300/80">Offerte</p>
              <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white">
                Vraag een gratis offerte aan voor uw laadpaal.
              </h2>
              <p className="mt-3 text-center text-sm leading-7 text-slate-400">
                Vul het formulier in en wij nemen binnen 24 uur contact met u op.
              </p>
              <div className="mt-8">
                <QuoteForm />
              </div>
            </div>
          </section>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
      <Footer />
    </>
  );
}
