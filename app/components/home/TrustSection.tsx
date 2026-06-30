"use client";

import { motion } from "framer-motion";
import { Award, BadgeCheck, Building2, ShieldCheck, Star, Users, Wrench, Zap } from "lucide-react";

const waarom = [
  { icon: BadgeCheck, titel: "Gecertificeerde installateurs", tekst: "Al onze monteurs zijn opgeleid en gecertificeerd voor veilige, vakkundige installaties." },
  { icon: ShieldCheck, titel: "Vaste prijs, geen verrassingen", tekst: "U weet vooraf precies waar u aan toe bent — geen verborgen kosten achteraf." },
  { icon: Zap, titel: "Snel geïnstalleerd", tekst: "Meestal binnen één dag een werkende laadpaal, inclusief test en oplevering." },
  { icon: Award, titel: "Uitgebreide garantie", tekst: "Standaard garantie op zowel installatie als materiaal, voor langdurige zekerheid." },
];

const proces = [
  { stap: "01", titel: "Offerte & advies", tekst: "Gratis en vrijblijvend advies over de beste laadoplossing voor uw situatie." },
  { stap: "02", titel: "Meterkastbeoordeling", tekst: "Wij beoordelen uw meterkast en de gewenste locatie, eventueel op basis van foto's." },
  { stap: "03", titel: "Installatie", tekst: "Veilige, vakkundige installatie door een gecertificeerde monteur." },
  { stap: "04", titel: "Oplevering & garantie", tekst: "U ontvangt testresultaten, garantiebewijs en persoonlijke uitleg." },
];

const reviews = [
  { naam: "Familie de Vries", plaats: "Utrecht", quote: "Binnen een week een laadpaal én duidelijk advies over load balancing. Top geregeld van begin tot eind." },
  { naam: "Bedrijfspand Noord BV", plaats: "Amsterdam", quote: "ClimateX heeft 6 laadpunten op ons terrein geïnstalleerd met slimme verdeling. Werkt feilloos." },
  { naam: "VvE De Hoek", plaats: "Rotterdam", quote: "Eerlijke verdeling van laadcapaciteit voor alle bewoners, prettig en transparant traject." },
];

const partners = ["Alfen", "Zaptec", "Wallbox", "Easee", "ABB", "EVBox", "Smappee"];

export default function TrustSection() {
  return (
    <div className="space-y-20">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Waarom ClimateX</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Premium laadoplossingen, zonder compromissen.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {waarom.map((item, i) => (
            <motion.div
              key={item.titel}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{item.titel}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.tekst}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Installatieproces</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Van offerte tot werkende laadpaal.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proces.map((item, i) => (
            <motion.div
              key={item.stap}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              className="relative rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6"
            >
              <span className="text-3xl font-bold text-white/10">{item.stap}</span>
              <h3 className="mt-2 text-base font-semibold text-white">{item.titel}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.tekst}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-8">
          <Wrench className="h-6 w-6 text-cyan-300" />
          <p className="mt-4 text-3xl font-semibold text-white">500+</p>
          <p className="mt-1 text-sm text-slate-400">Gerealiseerde laadpaalprojecten voor woningen, bedrijven en VvE&apos;s.</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-8">
          <Users className="h-6 w-6 text-cyan-300" />
          <p className="mt-4 text-3xl font-semibold text-white">4,9 / 5</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2">Gemiddelde klantbeoordeling</span>
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Reviews</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Wat klanten van ClimateX zeggen.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.naam} className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">&ldquo;{review.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-white">{review.naam}</p>
              <p className="text-xs text-slate-500">{review.plaats}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-cyan-300/80">
          <Building2 className="h-4 w-4" /> Partners
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          {partners.map((partner) => (
            <span key={partner} className="text-lg font-semibold tracking-tight text-slate-500 transition hover:text-white">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
