"use client";

import { motion } from "framer-motion";

const stappen = [
  {
    nr: "01",
    titel: "Offerte & advies",
    omschrijving: "Gratis adviesgesprek, meterkastbeoordeling op afstand en een vaste offerte zonder verborgen kosten.",
    kpi: "Gratis",
  },
  {
    nr: "02",
    titel: "Meterkastbeoordeling",
    omschrijving: "Onze specialist controleert uw groepenkast, aansluiting en bekabelingsroute voor een veilige installatie.",
    kpi: "< 48 uur",
  },
  {
    nr: "03",
    titel: "Installatie",
    omschrijving: "Gecertificeerde monteur installeert uw laadpaal, trekt de kabel en koppelt alles aan met load balancing indien gewenst.",
    kpi: "1 dag",
  },
  {
    nr: "04",
    titel: "Oplevering & garantie",
    omschrijving: "Volledige test, uitleg, opleverdocument en garantiepapieren. U rijdt dezelfde dag nog elektrisch thuis.",
    kpi: "2–5 jaar",
  },
];

export default function InstallatieProces() {
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
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Installatieproces</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Van offerte tot laadpaal, in vier stappen.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-7 text-slate-400">
          Wij regelen alles van A tot Z — u hoeft alleen ja te zeggen.
        </p>
      </motion.div>

      <div className="relative mt-14">
        <div className="absolute left-0 right-0 top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />
        <div className="grid gap-5 lg:grid-cols-4">
          {stappen.map((stap, i) => (
            <motion.div
              key={stap.nr}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-7 shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-bold text-cyan-300">
                  {stap.nr}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {stap.kpi}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{stap.titel}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{stap.omschrijving}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
