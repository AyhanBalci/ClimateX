"use client";

import Link from "next/link";
import { MessageCircle, Phone, Zap } from "lucide-react";

export default function StickyMobileCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden"
    >
      <div className="grid grid-cols-3 gap-2">
        <a
          href="tel:+31614004488"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-[11px] font-semibold text-white transition active:scale-95"
        >
          <Phone className="h-4 w-4" /> Bel
        </a>
        <a
          href="https://wa.me/31614004488"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 py-2.5 text-[11px] font-semibold text-emerald-300 transition active:scale-95"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <Link
          href="/#contact"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-cyan-400 py-2.5 text-[11px] font-semibold text-slate-950 transition active:scale-95"
        >
          <Zap className="h-4 w-4" /> Offerte
        </Link>
      </div>
    </div>
  );
}
