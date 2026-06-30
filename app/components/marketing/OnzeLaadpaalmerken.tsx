"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LAADPAAL_MERKEN } from "../../lib/laadpaalMerken";

export default function OnzeLaadpaalmerken() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Onze laadpaalmerken</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Premium kwaliteit, voor elke situatie.
          </h2>
        </div>
        <Link href="/products" className="hidden text-sm font-semibold text-cyan-300 transition hover:text-cyan-200 sm:inline-flex">
          Bekijk alle producten →
        </Link>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LAADPAAL_MERKEN.map((merk, i) => (
          <motion.div
            key={merk.merk}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 transition-colors hover:border-cyan-300/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 text-sm font-bold text-cyan-300">
              {merk.monogram}
            </span>
            <h3 className="mt-4 text-base font-semibold text-white">{merk.merk}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{merk.beschrijving}</p>
          </motion.div>
        ))}
      </div>
      <Link href="/products" className="mt-8 inline-flex text-sm font-semibold text-cyan-300 transition hover:text-cyan-200 sm:hidden">
        Bekijk alle producten →
      </Link>
    </div>
  );
}
