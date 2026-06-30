"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Heart, Target, Users } from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import WaaromClimateX from "../components/marketing/WaaromClimateX";
import CtaBand from "../components/marketing/CtaBand";

const waarden = [
  { icon: Target, titel: "Vakmanschap", tekst: "Elke installatie wordt uitgevoerd door gecertificeerde installateurs, volgens de hoogste veiligheidsnormen." },
  { icon: Heart, titel: "Persoonlijk advies", tekst: "Wij denken mee over de beste oplossing voor uw situatie, zonder onnodige verkooppraatjes." },
  { icon: Users, titel: "Voor iedereen", tekst: "Van particuliere woningen tot complexe zakelijke en VvE-projecten." },
  { icon: BadgeCheck, titel: "Transparantie", tekst: "Vaste prijzen, duidelijke garantievoorwaarden en heldere communicatie van begin tot eind." },
];

export default function OverOnsClient() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Over ons</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Specialist in laadoplossingen, met oog voor detail.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-400">
              ClimateX installeert premium laadpalen voor woningen, bedrijven en VvE&apos;s door heel Nederland. Wij geloven in vakmanschap, transparantie en duurzame energieoplossingen die echt werken.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Onze waarden</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Waar wij voor staan.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {waarden.map((item, i) => (
                <motion.div
                  key={item.titel}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-7 transition-colors hover:border-cyan-300/30"
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

        <section className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <WaaromClimateX />
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <CtaBand />
          </div>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
