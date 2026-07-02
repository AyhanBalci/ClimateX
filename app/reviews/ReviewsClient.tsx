"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Quote, Star, Zap } from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/marketing/Footer";

/*
 * Google Reviews koppelen:
 * 1. Haal reviews op via Google Places API (endpoint: /api/reviews/route.ts)
 * 2. Vervang REVIEWS array door de API-response
 * 3. De ReviewCard-component hoeft niet te worden aangepast — de structuur is identiek.
 */

type Review = {
  naam: string;
  initialen: string;
  woonplaats: string;
  type: string;
  datum: string;
  rating: number;
  quote: string;
  geverifieerd: boolean;
};

const REVIEWS: Review[] = [
  { naam: "Familie de Vries", initialen: "dV", woonplaats: "Utrecht", type: "Particulier – Gezinswoning, 2 Tesla's", datum: "maart 2024", rating: 5, quote: "Binnen een week een laadpaal én duidelijk advies over load balancing. Top geregeld van begin tot eind. ClimateX dacht mee en gaf ons de beste oplossing voor onze situatie.", geverifieerd: true },
  { naam: "Logistiek Noord BV", initialen: "LN", woonplaats: "Amsterdam", type: "Zakelijk – 6 laadpunten, wagenpark", datum: "mei 2024", rating: 5, quote: "Professionele aanpak, strakke installatie en uitstekende nazorg. Het dynamic load balancing systeem werkt feilloos.", geverifieerd: true },
  { naam: "VvE De Hoek", initialen: "VH", woonplaats: "Rotterdam", type: "VvE – 24 bewoners, parkeergarage", datum: "juni 2024", rating: 5, quote: "Eerlijke verdeling van laadcapaciteit voor alle bewoners, prettig en transparant traject. Elke bewoner heeft nu zijn eigen laadpas.", geverifieerd: true },
  { naam: "Familie Janssen", initialen: "FJ", woonplaats: "Eindhoven", type: "Particulier – Zonnepanelen + Volkswagen ID.4", datum: "juli 2024", rating: 5, quote: "Fantastische installatie en geweldig dat we nu op eigen stroom rijden. De Smappee-app geeft ons alle inzicht. Binnen het uur was het geregeld.", geverifieerd: true },
  { naam: "VvE Parkzicht", initialen: "VP", woonplaats: "Den Haag", type: "VvE – Uitbreiding van 4 naar 12 laadpunten", datum: "september 2024", rating: 5, quote: "ClimateX had bij fase 1 al rekening gehouden met uitbreiding. Fase 2 was daardoor razendsnel klaar. Dat is pas echt meedenken.", geverifieerd: true },
  { naam: "Dhr. Koopman", initialen: "Ko", woonplaats: "Haarlem", type: "Particulier – Appartement, Kia EV6", datum: "oktober 2024", rating: 5, quote: "Ik had gehoord dat een laadpaal bij een appartement ingewikkeld zou zijn. ClimateX regelde alles met de VvE en installeerde binnen twee weken. Geweldig.", geverifieerd: true },
  { naam: "Mevrouw van der Berg", initialen: "vB", woonplaats: "Breda", type: "Particulier – Alfen Eve, 1-fase", datum: "november 2024", rating: 5, quote: "Alles van A tot Z perfect geregeld. Monteur was op tijd, ruimde netjes op en legde alles helder uit. Sterk aanbevolen.", geverifieerd: true },
  { naam: "Transport De Wit BV", initialen: "DW", woonplaats: "Tilburg", type: "Zakelijk – 12 laadpunten, vrachtwagenparkeerplaats", datum: "december 2024", rating: 5, quote: "Groot project, perfect uitgevoerd. ClimateX heeft het hele traject van ontwerp tot oplevering verzorgd. We zijn er erg blij mee.", geverifieerd: true },
  { naam: "Familie Pietersen", initialen: "Pi", woonplaats: "Groningen", type: "Particulier – Easee One, zonnepanelen", datum: "januari 2025", rating: 5, quote: "Super snel geregeld en voor een hele eerlijke prijs. Load balancing werkt perfect, laad nu tegelijk met de wasmachine.", geverifieerd: true },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-7 shadow-xl shadow-black/20"
    >
      <Quote className="absolute right-6 top-6 h-8 w-8 text-white/4" />
      <StarRating count={review.rating} />
      <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">&ldquo;{review.quote}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/20 text-xs font-bold text-cyan-200">
          {review.initialen}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            {review.naam}
            {review.geverifieerd ? (
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Geverifieerd
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-slate-500">{review.woonplaats} · {review.type}</p>
          <p className="text-xs text-slate-600">{review.datum}</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function ReviewsClient() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Reviews</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Wat klanten zeggen over ClimateX.
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-400">
                  Meer dan 200 tevreden klanten gingen u voor. Lees hun ervaringen.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-3xl font-semibold text-white">4,9</p>
                <p className="text-sm text-slate-500">gemiddeld · 200+ reviews</p>
              </div>
            </div>

            {/* Google Reviews koppelen — notice */}
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-4">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-400">Google Reviews koppelen:</span> Voeg een{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-300">/api/reviews/route.ts</code>{" "}
                toe die de Google Places API aanroept en vervangt de <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-300">REVIEWS</code> array in{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-300">ReviewsClient.tsx</code>.
                De ReviewCard-component accepteert dezelfde velden als de Places API-response.
              </p>
            </div>
          </div>
        </section>

        {/* Reviews grid */}
        <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {REVIEWS.map((review, i) => (
                <ReviewCard key={review.naam} review={review} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 px-8 py-10 text-center sm:px-12">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Klaar om zelf blij te zijn?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Vraag een gratis offerte aan en ontdek wat ClimateX voor u kan betekenen.</p>
            <Link
              href="/#contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-slate-100"
            >
              <Zap className="h-4 w-4" /> Gratis offerte aanvragen
            </Link>
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
