import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ExternalLink, HelpCircle, Info, ShieldCheck } from "lucide-react";
import SiteNav from "../../components/marketing/SiteNav";
import StickyMobileCta from "../../components/marketing/StickyMobileCta";
import WhatsAppButton from "../../components/WhatsAppButton";
import Footer from "../../components/marketing/Footer";
import FaqAccordion from "../../components/marketing/FaqAccordion";
import CtaBand from "../../components/marketing/CtaBand";
import JsonLd from "../../components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, artikelJsonLd } from "../../lib/seo";
import { ARTIKELEN, getArtikel, getGerelateerdeArtikelen } from "../../lib/kennisbank/artikelen";
import type { Blok } from "../../lib/kennisbank/types";
import { formatDutchDate } from "../../lib/dateUtils";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTIKELEN.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const artikel = getArtikel(slug);
  if (!artikel) return { title: "Artikel niet gevonden" };
  return {
    title: artikel.titel,
    description: artikel.samenvatting,
    alternates: { canonical: `/kennisbank/${artikel.slug}` },
  };
}

function datumNl(iso: string): string {
  return formatDutchDate(new Date(iso));
}

function BlokWeergave({ blok }: { blok: Blok }) {
  if (blok.type === "alinea") {
    return <p className="text-[15px] leading-8 text-slate-300">{blok.tekst}</p>;
  }

  if (blok.type === "lijst") {
    return (
      <ul className="space-y-2.5">
        {blok.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[15px] leading-7 text-slate-300">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/5 p-5">
      <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-cyan-200">
        <Info className="h-4 w-4" /> {blok.titel}
      </p>
      <p className="text-sm leading-7 text-slate-300">{blok.tekst}</p>
    </div>
  );
}

export default async function ArtikelPage({ params }: Params) {
  const { slug } = await params;
  const artikel = getArtikel(slug);
  if (!artikel) notFound();

  const gerelateerd = getGerelateerdeArtikelen(artikel);

  return (
    <>
      <JsonLd
        data={[
          artikelJsonLd(artikel),
          breadcrumbJsonLd([
            { naam: "Kennisbank", pad: "/kennisbank" },
            { naam: artikel.titel, pad: `/kennisbank/${artikel.slug}` },
          ]),
          faqJsonLd(artikel.faqs),
        ]}
      />
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <article>
          {/* Kop */}
          <header className="relative overflow-hidden bg-[#060606] px-6 pb-14 pt-12 sm:px-10 sm:pb-16 sm:pt-16 lg:px-16">
            <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)] blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Link href="/kennisbank" className="transition hover:text-white">
                  Kennisbank
                </Link>
                <span>/</span>
                <span className="text-slate-300">{artikel.categorie}</span>
              </nav>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">{artikel.categorie}</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {artikel.titel}
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-400">{artikel.samenvatting}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {artikel.leestijd} min lezen
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Bronnen gecontroleerd op {datumNl(artikel.gecontroleerdOp)}
                </span>
              </div>
            </div>
          </header>

          {/* Inhoud */}
          <div className="px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
            <div className="mx-auto max-w-3xl space-y-12">
              {artikel.secties.map((sectie) => (
                <section key={sectie.kop} className="space-y-5">
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">{sectie.kop}</h2>
                  {sectie.blokken.map((blok, i) => (
                    <BlokWeergave key={i} blok={blok} />
                  ))}
                </section>
              ))}
            </div>
          </div>

          {/* Bronnen */}
          <section className="bg-[#070707] px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-2 text-lg font-semibold text-white">Bronnen</h2>
              <p className="mb-6 text-sm leading-6 text-slate-500">
                Subsidiebedragen, termijnen en regelgeving kunnen wijzigen. Raadpleeg bij twijfel altijd de
                officiële bron.
              </p>
              <ul className="space-y-3">
                {artikel.bronnen.map((bron) => (
                  <li key={bron.url}>
                    <a
                      href={bron.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-sm transition hover:border-cyan-300/25"
                    >
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <span>
                        <span className="block font-medium text-white">{bron.titel}</span>
                        <span className="block text-xs text-slate-500">{bron.organisatie}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Veelgestelde vragen */}
          {artikel.faqs.length > 0 ? (
            <section className="px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-lg font-semibold text-white">Veelgestelde vragen</h2>
                </div>
                <FaqAccordion faqs={artikel.faqs} />
              </div>
            </section>
          ) : null}

          {/* Gerelateerd */}
          {gerelateerd.length > 0 ? (
            <section className="bg-[#070707] px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
              <div className="mx-auto max-w-6xl">
                <h2 className="mb-8 text-lg font-semibold text-white">Lees ook</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {gerelateerd.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/kennisbank/${item.slug}`}
                      className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition-colors hover:border-cyan-300/30"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
                        {item.categorie}
                      </p>
                      <h3 className="mt-3 text-base font-semibold leading-6 text-white transition-colors group-hover:text-cyan-200">
                        {item.titel}
                      </h3>
                      <span className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" /> {item.leestijd} min lezen
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="px-6 py-16 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
              <CtaBand />
            </div>
          </section>
        </article>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
      <Footer />
    </>
  );
}
