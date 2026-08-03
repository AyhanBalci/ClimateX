import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import SiteNav from "../../components/marketing/SiteNav";
import StickyMobileCta from "../../components/marketing/StickyMobileCta";
import WhatsAppButton from "../../components/WhatsAppButton";
import Footer from "../../components/marketing/Footer";
import QuoteForm from "../../components/QuoteForm";
import CatalogClient from "../../components/producten/CatalogClient";
import { BRANDS, getBrand } from "../../lib/producten/brands";
import { withBrand } from "../../lib/producten/helpers";
import { getProductsByBrand } from "../../lib/producten/products";

type Params = { params: Promise<{ merk: string }> };

export function generateStaticParams() {
  return BRANDS.map((b) => ({ merk: b.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { merk } = await params;
  const brand = getBrand(merk);
  if (!brand) return { title: "Merk niet gevonden" };
  return {
    title: `${brand.naam} laadpalen | Inclusief installatie`,
    description: `${brand.beschrijving} Bekijk alle ${brand.naam}-laadpalen, specificaties en prijzen. Inclusief installatie en ${brand.garantie.toLowerCase()}.`,
    alternates: { canonical: `/producten/${brand.slug}` },
  };
}

export default async function MerkPage({ params }: Params) {
  const { merk } = await params;
  const brand = getBrand(merk);
  if (!brand) notFound();

  const products = getProductsByBrand(brand.slug).map(withBrand);

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/producten" className="transition hover:text-white">Producten</Link>
              <span>/</span>
              <span className="text-slate-300">{brand.naam}</span>
            </nav>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-slate-950"
                    style={{ background: brand.accentHex }}
                  >
                    {brand.monogram}
                  </span>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Merk</p>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{brand.naam} laadpalen</h1>
                <p className="mt-4 text-base leading-7 text-slate-400">{brand.langeBeschrijving}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 sm:w-64">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" /> {brand.garantie}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Truck className="h-4 w-4 text-cyan-300" /> Levertijd {brand.levertijd}
                </div>
                {brand.voordelen.map((v) => (
                  <div key={v} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> {v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-2xl font-semibold text-white">
              Alle {brand.naam}-laadpalen <span className="text-slate-500">({products.length})</span>
            </h2>
            <CatalogClient products={products} brands={BRANDS} showBrandFilter={false} />
          </div>

          <section id="offerte" className="mt-24">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-sm uppercase tracking-[0.24em] text-emerald-300/80">Offerte</p>
              <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white">
                Vraag een gratis offerte aan voor een {brand.naam}-laadpaal.
              </h2>
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
