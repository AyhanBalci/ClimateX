"use client";

import { motion } from "framer-motion";
import { Building2, Home as HomeIcon, MapPin, Users } from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import CtaBand from "../components/marketing/CtaBand";

const projecten = [
  {
    icon: Building2,
    titel: "Bedrijfspand Noord BV",
    plaats: "Amsterdam",
    omschrijving: "6 laadpunten met dynamic load balancing voor het wagenpark en bezoekers.",
    tags: ["Zakelijk", "Dynamic load balancing"],
  },
  {
    icon: Users,
    titel: "VvE De Hoek",
    plaats: "Rotterdam",
    omschrijving: "Eerlijke verdeling van laadcapaciteit voor 24 bewoners in de parkeergarage.",
    tags: ["VvE", "Load balancing"],
  },
  {
    icon: HomeIcon,
    titel: "Familie de Vries",
    plaats: "Utrecht",
    omschrijving: "Laadpaal op eigen oprit met slim laden op basis van zonnepanelen.",
    tags: ["Particulier", "Slim laden"],
  },
  {
    icon: Building2,
    titel: "Logistiek bedrijf Van Dam",
    plaats: "Tilburg",
    omschrijving: "12 laadpunten voor een elektrisch wagenpark, uitgebreid met toegangscontrole.",
    tags: ["Zakelijk", "Wagenpark"],
  },
  {
    icon: Users,
    titel: "VvE Parkzicht",
    plaats: "Den Haag",
    omschrijving: "Schaalbare laadinfrastructuur met ruimte voor toekomstige uitbreiding.",
    tags: ["VvE", "Schaalbaar"],
  },
  {
    icon: HomeIcon,
    titel: "Familie Jansen",
    plaats: "Eindhoven",
    omschrijving: "Twee laadpunten op één aansluiting dankzij load balancing.",
    tags: ["Particulier", "Load balancing"],
  },
];

export default function ProjectenClient() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Projecten</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              500+ gerealiseerde laadpaalprojecten.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Een greep uit onze projecten voor particulieren, bedrijven en VvE&apos;s door heel Nederland.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projecten.map((project, i) => (
                <motion.div
                  key={project.titel}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-7 transition-colors hover:border-cyan-300/30"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <project.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{project.titel}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {project.plaats}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{project.omschrijving}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <CtaBand />
          </div>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
