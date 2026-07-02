"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Award, BadgeCheck, CheckCircle2, Heart, Target, Users, Zap } from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import CtaBand from "../components/marketing/CtaBand";
import Footer from "../components/marketing/Footer";

const kernwaarden = [
  { icon: Target, titel: "Vakmanschap", tekst: "Elke installatie wordt uitgevoerd door NEN 1010 en EVSRB gecertificeerde installateurs, conform de hoogste veiligheidsnormen." },
  { icon: Heart, titel: "Persoonlijk advies", tekst: "Wij denken mee over de beste oplossing voor uw situatie, zonder onnodige verkooppraatjes of standaardoplossingen." },
  { icon: Users, titel: "Voor iedereen", tekst: "Van een particuliere gezinswoning tot complexe zakelijke projecten en VvE-installaties — wij bedienen alle segmenten." },
  { icon: BadgeCheck, titel: "Transparantie", tekst: "Vaste prijzen, duidelijke garantievoorwaarden en heldere communicatie van de eerste offerte tot de oplevering." },
  { icon: Award, titel: "Kwaliteit boven alles", tekst: "Wij werken uitsluitend met A-merk laadpalen en gebruiken hoogwaardig installatiemateriaal voor een duurzaam resultaat." },
  { icon: Zap, titel: "Innovatie", tekst: "Wij volgen de nieuwste ontwikkelingen in laadtechnologie, energiemanagement en slim laden op de voet." },
];

const tijdlijn = [
  { jaar: "2019", titel: "Oprichting ClimateX", omschrijving: "ClimateX is opgericht met als missie het toegankelijk maken van thuisladen voor iedere autorijder in Nederland." },
  { jaar: "2020", titel: "Eerste 100 installaties", omschrijving: "Na een vliegende start bereiken we de eerste 100 gerealiseerde laadpalen, voornamelijk in de regio Utrecht en Amsterdam." },
  { jaar: "2021", titel: "Uitbreiding naar VvE-markt", omschrijving: "We starten met gespecialiseerde laadoplossingen voor VvE's en appartementencomplexen — een nieuwe groeimarkt." },
  { jaar: "2022", titel: "Lancering zakelijke laadpalen", omschrijving: "ClimateX richt zich actief op bedrijven en wagenparken met dynamic load balancing oplossingen." },
  { jaar: "2023", titel: "500+ installaties bereikt", omschrijving: "Een mijlpaal: meer dan 500 tevreden klanten en 1.200+ laadpunten in heel Nederland." },
  { jaar: "2024", titel: "Premium portfolio uitgebreid", omschrijving: "Zeven topmerken in ons portfolio — Alfen, Zaptec, Easee, Wallbox, ABB, EVBox en Smappee." },
  { jaar: "2025+", titel: "Zonnepanelen & thuisbatterijen", omschrijving: "Uitbreiding naar zonnepanelen en thuisbatterijen als logische volgende stap in de energietransitie." },
];

const team = [
  { naam: "Mark van den Berg", rol: "Oprichter & directeur", initialen: "MB", specialisme: "Strategie & klantenadvies" },
  { naam: "Joost Vermeer", rol: "Technisch directeur", initialen: "JV", specialisme: "Installatie & engineering" },
  { naam: "Lisa de Groot", rol: "Projectmanager", initialen: "LG", specialisme: "VvE & zakelijke projecten" },
  { naam: "Sander Koopmans", rol: "Lead installateur", initialen: "SK", specialisme: "NEN 1010 & EVSRB" },
  { naam: "Emma Visser", rol: "Klantadviseur", initialen: "EV", specialisme: "Particulier & advies op maat" },
  { naam: "Tom Bakker", rol: "Service & onderhoud", initialen: "TB", specialisme: "Storingen & nazorg" },
];

export default function OverOnsClient() {
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
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Over ClimateX</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Specialist in laadoplossingen,
                <br />
                <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  met oog voor detail.
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Opgericht in 2019 met een simpele missie: zorgen dat iedere elektrische automobilist thuis, op het werk of bij de VvE veilig en slim kan laden.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Ons verhaal */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Ons verhaal</p>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Gestart vanuit passie voor duurzame energie.
                </h2>
                <div className="space-y-4 text-sm leading-7 text-slate-400">
                  <p>
                    ClimateX is in 2019 opgericht door Mark van den Berg, een ervaren elektrotechnicus die zag hoe moeilijk het was voor automobilisten om een betrouwbare installateur voor een laadpaal te vinden. De markt was versnipperd, prijzen waren ondoorzichtig en de kwaliteit varieerde sterk.
                  </p>
                  <p>
                    Met een kleine groep gecertificeerde monteurs begon ClimateX in de regio Utrecht. De nadruk lag van meet af aan op vakmanschap, transparante prijzen en persoonlijk advies — waarden die nog steeds de kern vormen van ons bedrijf.
                  </p>
                  <p>
                    Inmiddels hebben we meer dan 500 installaties gerealiseerd voor particulieren, bedrijven en VvE&apos;s door heel Nederland, met een gemiddelde beoordeling van 4,9/5.
                  </p>
                </div>
                <Link href="/waarom-climatex" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                  Waarom ClimateX kiezen →
                </Link>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "2019", label: "Opgericht" },
                  { value: "500+", label: "Installaties" },
                  { value: "4,9/5", label: "Beoordeling" },
                  { value: "12", label: "Provincies" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                    className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-7"
                  >
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Missie & Visie */}
        <section className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 sm:grid-cols-2">
              {[
                {
                  label: "Onze missie",
                  titel: "Elektrisch rijden toegankelijk maken voor iedereen.",
                  tekst:
                    "Wij zorgen dat iedere elektrische automobilist thuis, op het werk of bij zijn VvE veilig en eenvoudig kan laden — voor een eerlijke, vaste prijs, geïnstalleerd door gecertificeerde specialisten.",
                },
                {
                  label: "Onze visie",
                  titel: "Slimme energie als fundament van de toekomst.",
                  tekst:
                    "Wij geloven dat de energietransitie begint bij slimme keuzes thuis. Laadpalen, zonnepanelen en thuisbatterijen vormen samen het fundament van een duurzame, onafhankelijke energiehuishouding.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-8"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">{item.label}</p>
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.titel}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.tekst}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Kernwaarden */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-14 max-w-2xl"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Kernwaarden</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Waar wij elke dag voor staan.
              </h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {kernwaarden.map((item, i) => (
                <motion.div
                  key={item.titel}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease: "easeOut" }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/90 p-7 transition-colors hover:border-cyan-300/25"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-white">{item.titel}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.tekst}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Ons team</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  De mensen achter ClimateX.
                </h2>
              </div>
              <p className="max-w-xs text-sm text-slate-500">
                Vervang de placeholders door échte teamfoto&apos;s in het TeamCard-component.
              </p>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((lid, i) => (
                <motion.div
                  key={lid.naam}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease: "easeOut" }}
                  className="flex items-center gap-5 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6"
                >
                  {/* Avatar placeholder — vervang door <img> voor echte foto */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 text-lg font-bold text-cyan-200">
                    {lid.initialen}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{lid.naam}</p>
                    <p className="text-sm text-cyan-300/70">{lid.rol}</p>
                    <p className="mt-1 text-xs text-slate-500">{lid.specialisme}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tijdlijn */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-14 max-w-2xl"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Onze geschiedenis</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Van startup tot marktleider.
              </h2>
            </motion.div>
            <div className="relative pl-6 sm:pl-10">
              <div className="absolute bottom-0 left-0 top-2 w-px bg-gradient-to-b from-cyan-400/40 via-white/10 to-transparent" />
              <div className="space-y-8">
                {tijdlijn.map((item, i) => (
                  <motion.div
                    key={item.jaar}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                    className="relative"
                  >
                    <span className="absolute -left-[1.625rem] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-cyan-400/40 bg-zinc-950 sm:-left-[2.625rem]">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    </span>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                      <span className="text-sm font-bold text-cyan-300 sm:w-12 sm:shrink-0">{item.jaar}</span>
                      <div>
                        <p className="font-semibold text-white">{item.titel}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.omschrijving}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 pl-6 sm:pl-10">
              {[
                "NEN 1010 gecertificeerd",
                "EVSRB erkend",
                "4,9/5 beoordeling",
                "ISO 9001",
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
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
