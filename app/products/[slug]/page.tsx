import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Award,
  BadgeCheck,
  BatteryCharging,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import SiteNav from "../../components/marketing/SiteNav";
import StickyMobileCta from "../../components/marketing/StickyMobileCta";
import WhatsAppButton from "../../components/WhatsAppButton";
import Footer from "../../components/marketing/Footer";
import ProductImagePlaceholder from "../../components/ProductImagePlaceholder";
import FaqAccordion from "../../components/marketing/FaqAccordion";
import { LAADPAAL_SPECIFICATIES, getSpecBySlug } from "../../lib/laadpaalSpecificaties";
import { supabase } from "../../lib/supabase";
import { Product } from "../../lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const spec = getSpecBySlug(slug);
  if (!spec) return { title: "Product niet gevonden" };
  return {
    title: `${spec.merk} ${spec.model} laadpaal | Inclusief installatie`,
    description: `${spec.beschrijving} Vanaf €${spec.vanafPrijs} inclusief installatie. Levertijd: ${spec.levertijd}. ${spec.garantie} garantie.`,
    keywords: [`${spec.merk} laadpaal`, `${spec.model}`, "laadpaal thuis", "laadpaal installeren", "laadpaal inclusief installatie"],
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const spec = getSpecBySlug(slug);
  if (!spec) notFound();

  let gerelateerdeProducten: Product[] = [];
  if (supabase) {
    const relMerken = spec.gerelateerd.map((s) => {
      const rel = LAADPAAL_SPECIFICATIES.find((r) => r.slug === s);
      return rel?.merk ?? "";
    }).filter(Boolean);
    if (relMerken.length > 0) {
      const { data } = await supabase
        .from("producten")
        .select("*")
        .in("merk", relMerken)
        .eq("actief", true)
        .limit(3);
      gerelateerdeProducten = (data as Product[]) ?? [];
    }
  }

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#060606] px-6 pb-16 pt-12 sm:px-10 sm:pb-20 sm:pt-16 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/products" className="transition hover:text-white">Producten</Link>
              <span>/</span>
              <span className="text-slate-300">{spec.merk} {spec.model}</span>
            </nav>
            <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
              <div className="space-y-7">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">{spec.merk}</p>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">{spec.model}</h1>
                  <p className="mt-3 text-lg text-slate-400">{spec.tagline}</p>
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">{spec.beschrijving}</p>
                <div className="flex flex-wrap gap-2.5">
                  {spec.geschiktVoor.map((g) => (
                    <span key={g} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">{g}</span>
                  ))}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-400">{spec.garantie} garantie</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-400">Levertijd {spec.levertijd}</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vanaf prijs incl. installatie</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{formatPrice(spec.vanafPrijs)}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:ml-8 sm:flex-row">
                    <Link href="/#contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100">
                      <Zap className="h-4 w-4" /> Offerte aanvragen
                    </Link>
                    <Link href="/calculator" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm text-white transition hover:bg-white/10">
                      Bereken mijn prijs
                    </Link>
                  </div>
                </div>
              </div>
              {/* Product image */}
              <div className="overflow-hidden rounded-[2rem] border border-white/10">
                <div className="h-64 sm:h-80">
                  <ProductImagePlaceholder label={`${spec.merk} ${spec.model}`} />
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/5">
                  {[
                    { icon: Clock, label: "Levertijd", value: spec.levertijd },
                    { icon: ShieldCheck, label: "Garantie", value: spec.garantie },
                    { icon: Award, label: "Certificaat", value: "NEN 1010" },
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
              {/* Voordelen */}
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-emerald-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Voordelen</p>
                </div>
                <ul className="space-y-3">
                  {spec.voordelen.map((v) => (
                    <li key={v} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span className="text-sm leading-6 text-slate-300">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Specificaties */}
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Specificaties</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  {spec.specificaties.map((row, i) => (
                    <div key={row.label} className={`flex items-center justify-between gap-4 px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}`}>
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-right font-medium text-white">{row.waarde}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slimme functies */}
        <section className="bg-[#070707] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Slimme functies</p>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Meer dan alleen laden.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spec.slimmeFuncties.map((f) => (
                <div key={f} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span className="text-sm leading-6 text-slate-300">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Installatie */}
        <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Installatie</p>
                </div>
                <h2 className="mb-6 text-2xl font-semibold text-white sm:text-3xl">Volledig ontzorgd, inclusief garantie.</h2>
                <ul className="space-y-3">
                  {spec.installatie.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span className="text-sm leading-6 text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-8 text-center">
                <BatteryCharging className="mx-auto h-10 w-10 text-cyan-300" />
                <p className="mt-5 text-3xl font-semibold text-white">{formatPrice(spec.vanafPrijs)}</p>
                <p className="mt-1 text-sm text-slate-500">inclusief installatie, excl. eventueel extra meerwerk</p>
                <div className="mt-6 space-y-2 text-left">
                  {[
                    "Vaste prijs — geen verrassingen",
                    `${spec.garantie} fabrieksgarantie`,
                    "Gratis advies & meterkastcheck",
                  ].map((item) => (
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

        {/* FAQ */}
        {spec.faqs.length > 0 ? (
          <section className="bg-[#070707] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-10 flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Veelgestelde vragen over de {spec.merk} {spec.model}</p>
              </div>
              <FaqAccordion faqs={spec.faqs} />
            </div>
          </section>
        ) : null}

        {/* Gerelateerde producten */}
        {gerelateerdeProducten.length > 0 ? (
          <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-8 text-2xl font-semibold text-white">Andere laadpalen die u misschien interesseren</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {gerelateerdeProducten.map((product) => {
                  const relSlug = LAADPAAL_SPECIFICATIES.find((s) => s.merk === product.merk)?.slug;
                  return (
                    <div key={product.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
                      <div className="h-40">
                        <ProductImagePlaceholder label={`${product.merk} ${product.model}`} />
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{product.merk}</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">{product.model}</h3>
                        <p className="mt-2 text-sm text-slate-400 line-clamp-2">{product.beschrijving}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">
                            {new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(product.prijs)} incl.
                          </p>
                          {relSlug ? (
                            <Link href={`/products/${relSlug}`} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                              Bekijken
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
