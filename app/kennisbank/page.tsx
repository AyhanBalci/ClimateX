import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/marketing/Footer";
import CtaBand from "../components/marketing/CtaBand";
import JsonLd from "../components/seo/JsonLd";
import { breadcrumbJsonLd } from "../lib/seo";
import { ARTIKELEN, CATEGORIEEN } from "../lib/kennisbank/artikelen";

export const metadata: Metadata = {
  title: "Kennisbank | Alles over laadpalen, subsidie en regelgeving",
  description:
    "Praktische uitleg over laadpalen: 1-fase of 3-fase, load balancing, MID-meters, veilig laden en de actuele subsidieregelingen voor bedrijven en VvE's.",
  alternates: { canonical: "/kennisbank" },
};

export default function KennisbankPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ naam: "Kennisbank", pad: "/kennisbank" }])} />
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BookOpen className="h-5 w-5 text-cyan-300" />
            </span>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Kennisbank</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Alles wat u moet weten over laden.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Van het verschil tussen 1-fase en 3-fase tot de actuele subsidieregelingen. Alle informatie over
              subsidies en regelgeving is gecontroleerd bij de officiële bron, met bronvermelding per artikel.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-6xl space-y-14">
            {CATEGORIEEN.map((categorie) => {
              const artikelen = ARTIKELEN.filter((a) => a.categorie === categorie);
              if (artikelen.length === 0) return null;

              return (
                <div key={categorie}>
                  <div className="mb-6 flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">{categorie}</h2>
                    <span className="text-sm text-slate-600">{artikelen.length}</span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artikelen.map((artikel) => (
                      <Link
                        key={artikel.slug}
                        href={`/kennisbank/${artikel.slug}`}
                        className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition-colors hover:border-cyan-300/30"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
                          {artikel.categorie}
                        </p>
                        <h3 className="mt-3 text-base font-semibold leading-6 text-white transition-colors group-hover:text-cyan-200">
                          {artikel.titel}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{artikel.samenvatting}</p>
                        <span className="mt-5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" /> {artikel.leestijd} min lezen
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <CtaBand />
          </div>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
      <Footer />
    </>
  );
}
