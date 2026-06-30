"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Award, BatteryCharging, MessageCircle, Phone, ShieldCheck, Sparkles, Zap } from "lucide-react";
import WhatsAppButton from "./components/WhatsAppButton";
import SiteNav from "./components/marketing/SiteNav";
import StickyMobileCta from "./components/marketing/StickyMobileCta";
import WaaromClimateX from "./components/marketing/WaaromClimateX";
import OnzeLaadpaalmerken from "./components/marketing/OnzeLaadpaalmerken";
import InstallatieProces from "./components/marketing/InstallatieProces";
import ReviewsSection from "./components/marketing/ReviewsSection";
import CtaBand from "./components/marketing/CtaBand";
import FaqSection from "./components/home/FaqSection";

const contactNumber = "06 1400 4488";
const whatsappLink = "https://wa.me/31614004488";

const housingOptions = ["Appartement", "Gezinswoning", "Vrijstaande woning", "Bent u aannemer of VvE?"];
const aansluitingOptions = ["1-fase", "3-fase", "Weet ik niet"];

const heroBadges = [
  { icon: ShieldCheck, label: "Gecertificeerde installateurs" },
  { icon: Award, label: "Garantie op installatie" },
  { icon: BatteryCharging, label: "500+ projecten" },
];

export default function HomeClient() {
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    postcode: "",
    woningType: "Gezinswoning",
    aantalLaadpunten: "1",
    elektrischVoertuig: "Ja",
    automerk: "",
    automodel: "",
    aansluiting: "1-fase",
    parkeerplaats: "",
    loadBalancing: false,
    dynamicLoadBalancing: false,
    bericht: "",
  });
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("Verzenden...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          source: "website",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setFormMessage(result.message || "Bedankt. Wij nemen binnen 24 uur contact met u op.");
        setFormState({
          name: "",
          phone: "",
          email: "",
          postcode: "",
          woningType: "Gezinswoning",
          aantalLaadpunten: "1",
          elektrischVoertuig: "Ja",
          automerk: "",
          automodel: "",
          aansluiting: "1-fase",
          parkeerplaats: "",
          loadBalancing: false,
          dynamicLoadBalancing: false,
          bericht: "",
        });
      } else {
        setFormMessage(result.error || "Er is iets misgegaan. Probeer het later opnieuw.");
      }
    } catch {
      setFormMessage("Er is iets misgegaan. Probeer het later opnieuw.");
    }
  };

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        {/* Hero */}
        <section id="home" className="relative overflow-hidden bg-[#060606] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-transparent" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl space-y-9"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Slimme energieoplossingen voor woningen en bedrijven
              </div>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Laden, opnieuw
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                  doordacht.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                Premium laadpalen, vakkundig geïnstalleerd voor thuis, zakelijk en VvE — met slim laden en load balancing als standaard.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100"
                >
                  <Zap className="h-4 w-4" /> Gratis offerte aanvragen
                </a>
                <a
                  href="tel:+31614004488"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> Bel direct
                </a>
                <a
                  href={whatsappLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-7">
                {heroBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-sm text-slate-400">
                    <badge.icon className="h-4 w-4 text-cyan-300" />
                    {badge.label}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-md"
            >
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),_transparent_45%)]" />
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <BatteryCharging className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Live</span>
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.3em] text-slate-400">Installatie &amp; service</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Vakkundig geïnstalleerd</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Vaste prijs inclusief meterkastcontrole, testresultaten en oplevering door een gecertificeerde installateur.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {["Vaste prijs", "Load balancing", "Garantie", "Snelle service"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <WaaromClimateX />
          </div>
        </section>

        <section className="bg-[#070707] px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <OnzeLaadpaalmerken />
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <InstallatieProces />
          </div>
        </section>

        <section className="bg-[#070707] px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <ReviewsSection />
          </div>
        </section>

        <section id="faq" className="px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <FaqSection />
          </div>
        </section>

        <section className="px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <CtaBand />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-[#070707] px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Contact</p>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Vraag nu uw gratis offerte aan.
                </h2>
                <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  Vul het formulier in of bel direct voor een gratis adviesgesprek. Wij nemen binnen 24 uur contact met u op.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Telefoon</p>
                    <a href="tel:+31614004488" className="mt-3 block text-xl font-semibold text-white">{contactNumber}</a>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">E-mail</p>
                    <p className="mt-3 text-xl font-semibold text-white">contact@climatex.nl</p>
                  </div>
                </div>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
                >
                  <MessageCircle className="h-4 w-4" /> Gratis adviesgesprek via WhatsApp
                </a>
              </div>
              <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
                <div className="grid gap-5">
                  {[
                    { name: "name", label: "Naam", type: "text", placeholder: "Jouw naam" },
                    { name: "phone", label: "Telefoonnummer", type: "tel", placeholder: "06 1400 4488" },
                    { name: "email", label: "E-mailadres", type: "email", placeholder: "naam@voorbeeld.nl" },
                    { name: "postcode", label: "Postcode", type: "text", placeholder: "1234 AB" },
                  ].map((field) => (
                    <label key={field.name} className="space-y-2 text-sm text-slate-300">
                      <span>{field.label}</span>
                      <input
                        type={field.type}
                        value={formState[field.name as keyof typeof formState] as string}
                        placeholder={field.placeholder}
                        onChange={(event) => handleFormChange(field.name, event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </label>
                  ))}
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Type woning</span>
                    <select
                      value={formState.woningType}
                      onChange={(event) => handleFormChange("woningType", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    >
                      {housingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Aantal laadpunten</span>
                      <input
                        type="number"
                        min={1}
                        value={formState.aantalLaadpunten}
                        onChange={(event) => handleFormChange("aantalLaadpunten", event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Heeft u al een elektrische auto?</span>
                      <select
                        value={formState.elektrischVoertuig}
                        onChange={(event) => handleFormChange("elektrischVoertuig", event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      >
                        <option value="Ja">Ja</option>
                        <option value="Nee, binnenkort">Nee, binnenkort</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Automerk (optioneel)</span>
                      <input
                        type="text"
                        value={formState.automerk}
                        placeholder="Bijv. Tesla, Volkswagen"
                        onChange={(event) => handleFormChange("automerk", event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Automodel (optioneel)</span>
                      <input
                        type="text"
                        value={formState.automodel}
                        placeholder="Bijv. Model 3, ID.4"
                        onChange={(event) => handleFormChange("automodel", event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Aansluiting</span>
                      <select
                        value={formState.aansluiting}
                        onChange={(event) => handleFormChange("aansluiting", event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      >
                        {aansluitingOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Parkeerplaats</span>
                      <input
                        type="text"
                        value={formState.parkeerplaats}
                        placeholder="Bijv. eigen oprit, garage, openbare weg"
                        onChange={(event) => handleFormChange("parkeerplaats", event.target.value)}
                        className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={formState.loadBalancing}
                        onChange={(event) => handleFormChange("loadBalancing", event.target.checked)}
                        className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-300 focus:ring-cyan-300"
                      />
                      Interesse in load balancing
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={formState.dynamicLoadBalancing}
                        onChange={(event) => handleFormChange("dynamicLoadBalancing", event.target.checked)}
                        className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-300 focus:ring-cyan-300"
                      />
                      Interesse in dynamic load balancing
                    </label>
                  </div>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Bericht</span>
                    <textarea
                      rows={4}
                      value={formState.bericht}
                      placeholder="Korte omschrijving van uw wens, bijv. afstand tot de meterkast of kabellengte"
                      onChange={(event) => handleFormChange("bericht", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                </div>
                <button type="submit" className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                  Gratis offerte aanvragen
                </button>
                {formMessage ? (
                  <p className="mt-4 text-sm text-slate-300">{formMessage}</p>
                ) : null}
              </form>
            </div>
          </div>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
