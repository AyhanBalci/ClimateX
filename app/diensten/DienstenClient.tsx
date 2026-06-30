"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Gauge,
  Home as HomeIcon,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import CtaBand from "../components/marketing/CtaBand";

const diensten = [
  { icon: HomeIcon, titel: "Laadpaal thuis", omschrijving: "Veilig en snel laden op uw eigen oprit of in de garage, volledig op maat geïnstalleerd." },
  { icon: Building2, titel: "Zakelijke laadpalen", omschrijving: "Laadoplossingen voor bedrijfsterreinen, wagenparken en personeelsparkeerplaatsen." },
  { icon: Building2, titel: "VvE laadoplossingen", omschrijving: "Eerlijke verdeling van laadcapaciteit voor meerdere bewoners in één pand of parkeergarage." },
  { icon: Wrench, titel: "Onderhoud", omschrijving: "Periodieke controle en onderhoud zodat uw laadpaal altijd veilig en betrouwbaar blijft werken." },
  { icon: Zap, titel: "Storingen", omschrijving: "Snelle storingsdienst, ook melden via het klantenportaal, met servicebezoek op korte termijn." },
  { icon: Sparkles, titel: "Slim laden", omschrijving: "Laad automatisch op de goedkoopste momenten of op zelf opgewekte zonne-energie." },
  { icon: Gauge, titel: "Load balancing", omschrijving: "Verdeel beschikbare stroom automatisch over meerdere laadpunten zonder de hoofdaansluiting te overbelasten." },
  { icon: Gauge, titel: "Dynamic load balancing", omschrijving: "Slimme, realtime sturing van laadvermogen op basis van het actuele verbruik in uw pand." },
  { icon: PlugZap, titel: "Meterkast uitbreiden", omschrijving: "Wij beoordelen en breiden uw meterkast uit indien nodig voor een veilige aansluiting." },
  { icon: ShieldCheck, titel: "Advies", omschrijving: "Onafhankelijk advies over de beste laadoplossing voor uw woning of organisatie." },
];

const binnenkort = [
  { titel: "Zonnepanelen", omschrijving: "Wek uw eigen stroom op en laad uw auto met groene energie." },
  { titel: "Thuisbatterijen", omschrijving: "Sla zelf opgewekte energie op en gebruik deze wanneer u die nodig heeft." },
  { titel: "Warmtepompen", omschrijving: "Duurzaam verwarmen, los van gas, met subsidiemogelijkheden." },
];

export default function DienstenClient() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Diensten</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Alles voor slim en veilig laden.
            </h1>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {diensten.map((dienst, i) => (
                <motion.div
                  key={dienst.titel}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-7 transition-colors hover:border-cyan-300/30"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <dienst.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{dienst.titel}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{dienst.omschrijving}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Binnenkort beschikbaar</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Op weg naar volledig duurzame energie.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Naast laadpalen breidt ClimateX binnenkort uit met de volgende energieoplossingen.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {binnenkort.map((item) => (
                <div key={item.titel} className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Binnenkort
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.titel}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.omschrijving}</p>
                </div>
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
