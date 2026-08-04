"use client";

import { motion } from "framer-motion";
import { Award, BadgeCheck, Clock, ShieldCheck } from "lucide-react";

const waarom = [
  {
    icon: BadgeCheck,
    titel: "Gecertificeerde installateurs",
    tekst: "Al onze monteurs zijn NEN 1010 en EVSRB gecertificeerd voor veilige, vakkundige installaties.",
    kpi: "100%",
    kpiLabel: "gecertificeerd",
  },
  {
    icon: ShieldCheck,
    titel: "Vaste prijs, geen verrassingen",
    tekst: "U weet vooraf precies waar u aan toe bent — geen verborgen kosten of meerwerk achteraf.",
    kpi: "€ 0",
    kpiLabel: "onverwacht extra",
  },
  {
    icon: Clock,
    titel: "Snel geïnstalleerd",
    tekst: "Meestal binnen één dag een werkende laadpaal, inclusief test, keuring en oplevering.",
    kpi: "< 3 wkn",
    kpiLabel: "levertijd",
  },
  {
    icon: Award,
    titel: "Uitgebreide garantie",
    tekst: "Standaard 2–5 jaar garantie op zowel installatie als materiaal, voor langdurige zekerheid.",
    kpi: "5 jaar",
    kpiLabel: "max garantie",
  },
];

export default function WaaromClimateX() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Waarom ClimateX</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Premium laadoplossingen,
            <br className="hidden sm:block" /> zonder compromissen.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-7 text-slate-400">
          Laadoplossingen voor woningen, bedrijven en VvE&apos;s door heel Nederland, ge&iuml;nstalleerd door
          gecertificeerde monteurs.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {waarom.map((item, i) => (
          <motion.div
            key={item.titel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-7 shadow-xl shadow-black/20 transition-colors hover:border-cyan-300/30"
          >
            <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.07),_transparent_60%)]" />
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="mt-5 mb-4 border-t border-white/5 pt-5">
              <p className="text-2xl font-semibold text-white">{item.kpi}</p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-slate-500">{item.kpiLabel}</p>
            </div>
            <h3 className="text-base font-semibold text-white">{item.titel}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.tekst}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
