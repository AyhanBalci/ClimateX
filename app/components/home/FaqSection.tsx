"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    vraag: "Hoe lang duurt het installeren van een laadpaal?",
    antwoord:
      "Een standaard installatie bij een woning duurt meestal één dagdeel. Bij zakelijke projecten of VvE's plannen wij dit in overleg, afhankelijk van het aantal laadpunten.",
  },
  {
    vraag: "Wat kost een laadpaal installeren?",
    antwoord:
      "De kosten zijn afhankelijk van uw laadpaal, kabellengte en eventuele meterkastuitbreiding. Gebruik onze prijscalculator voor een directe indicatie, of vraag een gratis offerte aan voor een exacte prijs.",
  },
  {
    vraag: "Hoe snel kan ik thuis laden?",
    antwoord:
      "De laadsnelheid hangt af van uw aansluiting en laadpaal. Op een 1-fase aansluiting laadt u tot 7,4 kW, op een 3-fase aansluiting tot 22 kW — ruim sneller dan een stopcontact.",
  },
  {
    vraag: "Welke garantie krijg ik?",
    antwoord:
      "Op zowel de installatie als de geleverde laadpaal ontvangt u standaard garantie, doorgaans tussen de 2 en 5 jaar afhankelijk van het merk.",
  },
  {
    vraag: "Wat is load balancing en heb ik dat nodig?",
    antwoord:
      "Load balancing verdeelt automatisch het beschikbare vermogen over meerdere laadpunten, zodat u nooit de hoofdaansluiting overbelast. Dit is vooral relevant bij meerdere auto's, zakelijke locaties en VvE's.",
  },
  {
    vraag: "Werkt mijn laadpaal samen met een slimme meter?",
    antwoord:
      "Ja, onze laadpalen zijn compatibel met slimme meters en kunnen worden gekoppeld aan energiemanagementsystemen voor optimaal en kostenefficiënt laden.",
  },
  {
    vraag: "Kan ik een zakelijke laadpaal voor meerdere auto's laten installeren?",
    antwoord:
      "Zeker. Voor wagenparken en bedrijfsterreinen adviseren wij laadoplossingen met (dynamic) load balancing, zodat u meerdere voertuigen tegelijk veilig kunt laden.",
  },
  {
    vraag: "Hoe werkt een laadoplossing voor een VvE?",
    antwoord:
      "Voor VvE's regelen wij een eerlijke verdeling van laadcapaciteit tussen bewoners, inclusief advies over de benodigde infrastructuur en eventuele subsidies.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12 max-w-2xl"
      >
        <p className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-cyan-300/80">
          <HelpCircle className="h-4 w-4" /> Veelgestelde vragen
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Alles wat u wilt weten over laadpalen.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
          Staat uw vraag er niet bij? Bel ons gerust op 06 1400 4488.
        </p>
      </motion.div>

      <div className="grid gap-2">
        {faqs.map((faq, index) => {
          const isOpen = open === index;
          return (
            <motion.div
              key={faq.vraag}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                isOpen ? "border-cyan-300/25 bg-slate-950/90" : "border-white/10 bg-slate-950/50"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className={`text-sm font-semibold transition-colors sm:text-base ${isOpen ? "text-white" : "text-slate-200"}`}>
                  {faq.vraag}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5"
                >
                  <ChevronDown className={`h-4 w-4 transition-colors ${isOpen ? "text-cyan-300" : "text-slate-400"}`} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="px-6 pb-6 text-sm leading-7 text-slate-400">{faq.antwoord}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
