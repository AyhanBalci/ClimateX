"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type FaqItem = { vraag: string; antwoord: string };

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="grid gap-2">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.vraag}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              isOpen ? "border-cyan-300/25 bg-slate-950/90" : "border-white/10 bg-slate-950/50"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className={`text-sm font-semibold transition-colors sm:text-base ${isOpen ? "text-white" : "text-slate-200"}`}>
                {faq.vraag}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <ChevronDown className={`h-4 w-4 transition-colors ${isOpen ? "text-cyan-300" : "text-slate-400"}`} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="ans"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="px-6 pb-6 text-sm leading-7 text-slate-400">{faq.antwoord}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
