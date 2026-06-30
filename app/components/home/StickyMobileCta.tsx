"use client";

import { MessageCircle, Phone, Zap } from "lucide-react";

export default function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl sm:hidden">
      <div className="grid grid-cols-3 gap-2">
        <a
          href="tel:+31614004488"
          className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white"
        >
          <Phone className="h-4 w-4" /> Bel
        </a>
        <a
          href="https://wa.me/31614004488"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href="#contact"
          className="flex flex-col items-center gap-1 rounded-2xl bg-cyan-400 py-2 text-xs font-semibold text-slate-950"
        >
          <Zap className="h-4 w-4" /> Offerte
        </a>
      </div>
    </div>
  );
}
