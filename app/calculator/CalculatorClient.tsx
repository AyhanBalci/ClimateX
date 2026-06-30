"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Camera, Compass, Scale, TrendingDown } from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import LaadpaalWizard from "../components/home/LaadpaalWizard";
import PrijsCalculator from "../components/home/PrijsCalculator";
import BesparingsCalculator from "../components/home/BesparingsCalculator";
import LaadpaalVergelijker from "../components/home/LaadpaalVergelijker";
import MeterkastCheck from "../components/home/MeterkastCheck";

const tabs = [
  { key: "wizard", label: "Keuzehulp", icon: Compass, component: LaadpaalWizard },
  { key: "prijs", label: "Prijscalculator", icon: Calculator, component: PrijsCalculator },
  { key: "besparing", label: "Besparing", icon: TrendingDown, component: BesparingsCalculator },
  { key: "vergelijk", label: "Vergelijken", icon: Scale, component: LaadpaalVergelijker },
  { key: "meterkast", label: "Meterkastcheck", icon: Camera, component: MeterkastCheck },
] as const;

export default function CalculatorClient() {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("wizard");
  const ActiveComponent = tabs.find((t) => t.key === active)?.component ?? LaadpaalWizard;

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Laadpaal calculator</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Ontdek wat bij u past, in een paar klikken.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Vind de beste laadpaal, bereken uw indicatieprijs en besparing, vergelijk merken naast elkaar of vraag een gratis meterkastbeoordeling aan.
            </p>
          </div>
        </section>

        <section className="sticky top-[73px] z-40 border-y border-white/5 bg-zinc-950/85 px-4 py-3 backdrop-blur-xl sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
