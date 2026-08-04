import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import SiteNav from "../../../components/marketing/SiteNav";
import StickyMobileCta from "../../../components/marketing/StickyMobileCta";
import WhatsAppButton from "../../../components/WhatsAppButton";
import Footer from "../../../components/marketing/Footer";
import FaqAccordion from "../../../components/marketing/FaqAccordion";
import ProductGallery from "../../../components/producten/ProductGallery";
import SpecTable from "../../../components/producten/SpecTable";
import DownloadsList from "../../../components/producten/DownloadsList";
import RelatedProducts from "../../../components/producten/RelatedProducts";
import { getBrand } from "../../../lib/producten/brands";
import { getProduct, PRODUCTS, STANDAARD_INSTALLATIE } from "../../../lib/producten/products";
import { formatPrijs, getRelatedProducts, productDisplayName, productImagePath } from "../../../lib/producten/helpers";
import JsonLd from "../../../components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "../../../lib/seo";

type Params = { params: Promise<{ merk: string; product: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ merk: p.merkSlug, product: p.productSlug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { merk, product: productSlug } = await params;
  const product = getProduct(merk, productSlug);
  const brand = getBrand(merk);
  if (!product || !brand) return { title: "Product niet gevonden" };
  return {
    title: `${productDisplayName(product)} laadpaal | Inclusief installatie`,
    description: `${product.beschrijving} Vanaf ${formatPrijs(product.vanafPrijs)} inclusief installatie. ${product.specs.garantieLabel}.`,
    keywords: [`${brand.naam} laadpaal`, product.model, "laadpaal thuis", "laadpaal installeren", "laadpaal inclusief installatie"],
    alternates: { canonical: `/producten/${brand.slug}/${product.productSlug}` },
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { merk, product: productSlug } = await params;
  const product = getProduct(merk, productSlug);
  const brand = getBrand(merk);
  if (!product || !brand) notFound();

  const gerelateerd = getRelatedProducts(product, 3);

  const structuredData = [
    productJsonLd(product, brand, [
      productImagePath(product, "hero"),
      productImagePath(product, "angle"),
      productImagePath(product, "front"),
    ]),
    breadcrumbJsonLd([
      { naam: "Producten", pad: "/producten" },
      { naam: brand.naam, pad: `/producten/${brand.slug}` },
      { naam: productDisplayName(product), pad: `/producten/${brand.slug}/${product.productSlug}` },
    ]),
    faqJsonLd(product.faqs),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#060606] px-6 pb-16 pt-12 sm:px-10 sm:pb-20 sm:pt-16 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href="/producten" className="transition hover:text-white">Producten</Link>
              <span>/</span>
              <Link href={`/producten/${brand.slug}`} className="transition hover:text-white">{brand.naam}</Link>
              <span>/</span>
              <span className="text-slate-300">{product.model}</span>
            </nav>
            <div className="grid gap-10 lg:grid-cols-[1fr_460px] lg:items-start">
              <div className="space-y-7">
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-slate-950"
                      style={{ background: brand.accentHex }}
                    >
                      {brand.monogram}
                    </span>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">{brand.naam}</p>
                  </div>
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">{product.model}</h1>
                  <p className="mt-3 text-lg text-slate-400">{product.tagline}</p>
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">{product.beschrijving}</p>
                <div className="flex flex-wrap gap-2.5">
                  {product.geschiktVoor.map((g) => (
                    <span key={g} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold capitalize text-cyan-300">
                      {g}
                    </span>
                  ))}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-400">
                    {product.specs.garantieLabel}
                  </span>
                  {product.badges.map((b) => (
                    <span key={b} className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                      {b}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vanaf prijs incl. installatie</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{formatPrijs(product.vanafPrijs)}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:ml-8 sm:flex-row">
                    <Link href="/#contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100">
                      <Zap className="h-4 w-4" /> Vraag offerte aan
                    </Link>
                    <Link href="/calculator" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm text-white transition hover:bg-white/10">
                      Bereken mijn prijs
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ProductGallery product={product} />
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/5">
                  {[
                    { icon: Clock, label: "Installatietijd", value: product.specs.installatietijd },
                    { icon: ShieldCheck, label: "Garantie", value: product.specs.garantieLabel.split(" ")[0] + " " + product.specs.garantieLabel.split(" ")[1] },
                    { icon: BadgeCheck, label: "Certificaat", value: "NEN 1010" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-950/90 p-4 text-center">
                      <item.icon className="mx-auto h-4 w-4 text-cyan-300" />
                      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Voordelen + Specificaties */}
        <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-emerald-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Belangrijkste voordelen</p>
                </div>
                <ul className="space-y-3">
                  {product.voordelen.map((v) => (
                    <li key={v} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span className="text-sm leading-6 text-slate-300">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Technische specificaties</p>
                </div>
                <SpecTable product={product} />
              </div>
            </div>
          </div>
        </section>

        {/* Installatie */}
        <section className="bg-[#070707] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Installatie</p>
                </div>
                <h2 className="mb-6 text-2xl font-semibold text-white sm:text-3xl">Volledig ontzorgd, inclusief garantie.</h2>
                <ul className="space-y-3">
                  {[...STANDAARD_INSTALLATIE, `Gemiddelde installatietijd: ${product.specs.installatietijd}`].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span className="text-sm leading-6 text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-8 text-center">
                <Zap className="mx-auto h-10 w-10 text-cyan-300" />
                <p className="mt-5 text-3xl font-semibold text-white">{formatPrijs(product.vanafPrijs)}</p>
                <p className="mt-1 text-sm text-slate-500">inclusief installatie, excl. eventueel extra meterkastwerk</p>
                <div className="mt-6 space-y-2 text-left">
                  {["Vaste prijs — geen verrassingen", product.specs.garantieLabel, "Gratis advies & meterkastcheck"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> {item}
                    </div>
                  ))}
                </div>
                <Link href="/#contact" className="mt-7 block w-full rounded-full bg-white py-3.5 text-center text-sm font-semibold text-black transition hover:bg-slate-100">
                  Gratis offerte aanvragen
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex items-center gap-3">
              <Download className="h-5 w-5 text-cyan-300" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Downloads & documentatie</p>
            </div>
            <DownloadsList downloads={product.downloads} />
          </div>
        </section>

        {/* FAQ */}
        {product.faqs.length > 0 ? (
          <section className="bg-[#070707] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-10 flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Veelgestelde vragen over de {productDisplayName(product)}
                </p>
              </div>
              <FaqAccordion faqs={product.faqs} />
            </div>
          </section>
        ) : null}

        {/* Gerelateerde producten */}
        {gerelateerd.length > 0 ? (
          <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-8 text-2xl font-semibold text-white">Andere laadpalen die u misschien interesseren</h2>
              <RelatedProducts products={gerelateerd} />
            </div>
          </section>
        ) : null}

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
      <Footer />
    </>
  );
}
