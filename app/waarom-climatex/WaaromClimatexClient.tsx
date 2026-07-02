"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/marketing/Footer";

const werkwijzeStappen = [
  { nr: "01", titel: "Gratis advies & offerte", tekst: "U neemt contact op, wij beoordelen uw situatie op afstand of ter plaatse en sturen u een vaste offerte. Geen verrassingen achteraf." },
  { nr: "02", titel: "Meterkastbeoordeling", tekst: "Onze specialist beoordeelt uw meterkast, aansluiting en bekabelingsroute — op basis van foto's of ter plaatse." },
  { nr: "03", titel: "Installatie op afgesproken datum", tekst: "Een NEN 1010 gecertificeerde monteur installeert uw laadpaal op de afgesproken datum, doorgaans binnen drie weken." },
  { nr: "04", titel: "Oplevering & nazorg", tekst: "U ontvangt een volledig opleverdocument, instructie en garantiepapieren. Bij vragen staat u direct in contact met onze servicedienst." },
];

const waaromItems = [
  { icon: BadgeCheck, titel: "NEN 1010 & EVSRB gecertificeerd", tekst: "Al onze monteurs beschikken over de vereiste certificeringen voor het veilig en conform de norm installeren van laadpalen." },
  { icon: ShieldCheck, titel: "Vaste prijs — geen verrassingen", tekst: "U ontvangt een all-in offerte. Meerwerk of onverwachte kosten rekenen wij nooit door zonder uw akkoord vooraf." },
  { icon: Clock, titel: "Installatie binnen 3 weken", tekst: "Wij plannen snel en efficiënt. Gemiddeld staat uw laadpaal binnen drie weken na akkoord op de offerte." },
  { icon: Award, titel: "2–5 jaar garantie", tekst: "Op zowel de installatie als de geleverde laadpaal ontvangt u standaard garantie — afhankelijk van het gekozen merk." },
  { icon: Sparkles, titel: "Slim laden als standaard", tekst: "Wij adviseren altijd over de mogelijkheden van load balancing en slim laden op zonne-energie, ook als u er niet om vraagt." },
  { icon: HeartHandshake, titel: "Persoonlijk advies", tekst: "Geen callcenter, maar direct contact met een specialist die uw situatie kent en de beste oplossing voor u kiest." },
  { icon: Wrench, titel: "Onderhoud & storingsdienst", tekst: "Na installatie kunt u bij storingen direct contact opnemen. Wij regelen een servicebezoek op korte termijn." },
  { icon: Zap, titel: "Transparante prijzen", tekst: "Alle prijzen zijn inclusief installatie, meterkastcontrole en btw. U weet precies wat u betaalt — en wat u krijgt." },
];

const certificaten = [
  { titel: "NEN 1010", omschrijving: "De Nederlandse norm voor elektrische installaties in gebouwen." },
  { titel: "EVSRB", omschrijving: "Erkend installateur van elektrische voertuiglaadsystemen." },
  { titel: "Keurmerk Laadpalen", omschrijving: "Gecertificeerde installatie van gecontroleerde laadpalen." },
  { titel: "VCA", omschrijving: "Veiligheid, gezondheid en milieu op de werkplek." },
  { titel: "ISO 9001", omschrijving: "Kwaliteitsmanagementsysteem voor consistente dienstverlening." },
];

const visie = [
  "Elektrisch rijden moet voor iedereen toegankelijk en betaalbaar zijn — thuis, op het werk en in de VvE.",
  "Wij geloven dat een laadpaal meer is dan hardware: het is het begin van uw persoonlijke energietransitie.",
  "Slimme laadoplossingen in combinatie met zonne-energie zorgen voor maximale onafhankelijkheid en minimale energiekosten.",
  "Transparantie, veiligheid en vakmanschap zijn geen bijzaken — ze zijn de kern van onze dienstverlening.",
];

export default function WaaromClimatexClient() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#060606] px-6 pb-24 pt-16 sm:px-10 sm:pb-28 sm:pt-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.14),_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl space-y-7"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Waarom ClimateX</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Niet de goedkoopste,
                <br />
                <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  wel de beste keuze.
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Bij ClimateX draait alles om vakmanschap, transparantie en persoonlijk advies. Geen verborgen kosten, geen callcenter, geen compromissen op veiligheid.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-slate-100"
                >
                  <Zap className="h-4 w-4" /> Gratis offerte aanvragen
                </Link>
                <a
                  href="tel:+31614004488"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm text-white transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> Bel 06 1400 4488
                </a>
              </div>
            </motion.div>

            {/* Stat row */}
            <div className="mt-14 flex flex-wrap gap-4">
              {[
                { value: "500+", label: "Installaties" },
                { value: "4,9 / 5", label: "Beoordeling" },
                { value: "< 3 wkn", label: "Gemiddelde wachttijd" },
                { value: "0", label: "Verborgen kosten" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Onze werkwijze */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-14 max-w-2xl"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Onze werkwijze</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Stap voor stap naar uw laadpaal.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Wij regelen alles, u hoeft nergens over na te denken.
              </p>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {werkwijzeStappen.map((stap, i) => (
                <motion.div
                  key={stap.nr}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-7 shadow-xl shadow-black/20"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-bold text-cyan-300">{stap.nr}</span>
                  <div>
                    <h3 className="text-base font-semibold text-white">{stap.titel}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stap.tekst}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Waarom ons */}
        <section className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-14 max-w-2xl"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Onze beloften</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Waar u op kunt rekenen.
              </h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {waaromItems.map((item, i) => (
                <motion.div
                  key={item.titel}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease: "easeOut" }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/90 p-7 shadow-xl shadow-black/10 transition-colors hover:border-cyan-300/25"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-white">{item.titel}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.tekst}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Visie */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Onze visie</p>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Elektrisch rijden voor iedereen, bereikbaar en betaalbaar.
                </h2>
                <p className="text-sm leading-7 text-slate-400 sm:text-base">
                  Wij geloven dat de energietransitie niet alleen van grote bedrijven afhangt, maar ook van de installateur die ervoor zorgt dat u thuis kunt laden — veilig, slim en zonder gedoe.
                </p>
              </motion.div>
              <div className="grid gap-4">
                {visie.map((punt, i) => (
                  <motion.div
                    key={punt}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                    <p className="text-sm leading-6 text-slate-300">{punt}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certificeringen */}
        <section className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-14 max-w-2xl"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Kwaliteit & veiligheid</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Gecertificeerd, gekeurd en goedgekeurd.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Al onze installaties voldoen aan de Nederlandse en Europese normen. Onze monteurs worden regelmatig bijgeschoold.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {certificaten.map((cert, i) => (
                <motion.div
                  key={cert.titel}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6"
                >
                  <BadgeCheck className="h-6 w-6 text-cyan-300" />
                  <p className="mt-4 text-base font-semibold text-white">{cert.titel}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{cert.omschrijving}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <h3 className="text-xl font-semibold text-white">Overtuigd? Start vandaag.</h3>
                <p className="mt-1 text-sm text-slate-400">Gratis offerte, vrijblijvend advies, reactie binnen 24 uur.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/#contact" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100">
                  <Zap className="h-4 w-4" /> Gratis offerte
                </Link>
                <a href="https://wa.me/31614004488" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-6 py-3.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
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
