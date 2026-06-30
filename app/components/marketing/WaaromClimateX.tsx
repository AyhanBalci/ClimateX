"use client";

import { motion } from "framer-motion";
import { Award, BadgeCheck, ShieldCheck, Zap } from "lucide-react";

const waarom = [
  { icon: BadgeCheck, titel: "Gecertificeerde installateurs", tekst: "Al onze monteurs zijn opgeleid en gecertificeerd voor veilige, vakkundige installaties." },
  { icon: ShieldCheck, titel: "Vaste prijs, geen verrassingen", tekst: "U weet vooraf precies waar u aan toe bent — geen verborgen kosten achteraf." },
  { icon: Zap, titel: "Snel geïnstalleerd", tekst: "Meestal binnen één dag een werkende laadpaal, inclusief test en oplevering." },
  { icon: Award, titel: "Uitgebreide garantie", tekst: "Standaard garantie op zowel installatie als materiaal, voor langdurige zekerheid." },
];

export default function WaaromClimateX() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Waarom ClimateX</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Premium laadoplossingen, zonder compromissen.
        </h2>
      </motion.div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {waarom.map((item, i) => (
          <motion.div
            key={item.titel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-7 shadow-lg shadow-black/10 transition-colors hover:border-cyan-300/30"
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
  );
}
