"use client";

import { motion } from "framer-motion";

const stappen = [
  { titel: "Offerte & advies", omschrijving: "U vraagt een vrijblijvende offerte aan, wij adviseren over de beste laadoplossing." },
  { titel: "Meterkastbeoordeling", omschrijving: "Onze installateur beoordeelt uw meterkast en de gewenste locatie van de laadpaal." },
  { titel: "Installatie", omschrijving: "Veilige, vakkundige installatie van uw laadpaal, meestal binnen één dag." },
  { titel: "Oplevering & garantie", omschrijving: "U ontvangt de testresultaten, garantie en een werkende laadpaal met persoonlijke uitleg." },
];

export default function InstallatieProces() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Installatieproces</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Van offerte tot werkende laadpaal.
        </h2>
      </motion.div>
      <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />
        {stappen.map((stap, index) => (
          <motion.div
            key={stap.titel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className="relative rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-7"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-sm font-semibold text-cyan-300">
              {index + 1}
            </span>
            <h3 className="mt-5 text-base font-semibold text-white">{stap.titel}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{stap.omschrijving}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
