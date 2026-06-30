"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Zap } from "lucide-react";

export default function CtaBand() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-emerald-500/10 p-10 text-center shadow-2xl shadow-black/30 sm:p-16"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.12),_transparent_60%)]" />
      <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Klaar voor uw eigen laadpaal?
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
        Vraag vrijblijvend een gratis offerte aan. Onze specialisten denken graag met u mee over de beste laadoplossing.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/#contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100"
        >
          <Zap className="h-4 w-4" /> Gratis offerte aanvragen
        </Link>
        <a
          href="tel:+31614004488"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
        >
          <Phone className="h-4 w-4" /> Bel direct
        </a>
        <a
          href="https://wa.me/31614004488"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </motion.div>
  );
}
