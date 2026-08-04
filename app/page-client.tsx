"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  BatteryCharging,
  Calculator,
  CheckCircle2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import WhatsAppButton from "./components/WhatsAppButton";
import SiteNav from "./components/marketing/SiteNav";
import StickyMobileCta from "./components/marketing/StickyMobileCta";
import WaaromClimateX from "./components/marketing/WaaromClimateX";
import OnzeLaadpaalmerken from "./components/marketing/OnzeLaadpaalmerken";
import InstallatieProces from "./components/marketing/InstallatieProces";
import CtaBand from "./components/marketing/CtaBand";
import FaqSection from "./components/home/FaqSection";
import Footer from "./components/marketing/Footer";

const contactNumber = "06 1400 4488";
const whatsappLink = "https://wa.me/31614004488";

const housingOptions = ["Appartement", "Gezinswoning", "Vrijstaande woning", "Bent u aannemer of VvE?"];
const aansluitingOptions = ["1-fase", "3-fase", "Weet ik niet"];

const kpis = [
  { value: "NEN 1010", label: "Gecertificeerd" },
  { value: "Vaste prijs", label: "Vooraf bekend" },
  { value: "< 3 wkn", label: "Levertijd" },
  { value: "Gratis", label: "Inspectie" },
];

const trustBadges = [
  { icon: BadgeCheck, label: "NEN 1010 gecertificeerd" },
  { icon: ShieldCheck, label: "Vaste prijs garantie" },
  { icon: Award, label: "EVSRB erkend installateur" },
];

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full max-w-md lg:max-w-none"
    >
      <div className="absolute -inset-16 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.18),_transparent_55%)]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <BatteryCharging className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Actieve sessie</p>
              <p className="text-xs text-slate-500">Alfen Eve Pro-line</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Laden
          </span>
        </div>
        <div className="my-8 flex flex-col items-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144" fill="none">
              <circle cx="72" cy="72" r="60" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="72" cy="72" r="60"
                stroke="url(#cg)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.78 * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
              />
              <defs>
                <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <p className="text-3xl font-semibold text-white">78%</p>
              <p className="text-xs text-slate-500">geladen</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Vermogen", value: "11,2 kW" },
            { label: "Bereik", value: "+187 km" },
            { label: "Duur", value: "2u 14m" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center">
              <p className="text-base font-semibold text-white">{stat.value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
          <span className="text-xs text-slate-500">Kosten deze sessie</span>
          <span className="text-sm font-semibold text-white">€ 5,24</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="absolute -left-6 top-10 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:-left-12"
      >
        <p className="text-xs text-slate-500">Installatie klaar in</p>
        <p className="mt-0.5 text-sm font-semibold text-white">&#60; 3 weken</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="absolute -right-4 bottom-16 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 shadow-xl backdrop-blur-xl sm:-right-8"
      >
        <p className="text-xs text-emerald-400/70">Besparing per jaar</p>
        <p className="mt-0.5 text-sm font-semibold text-emerald-300">tot € 1.800</p>
      </motion.div>
    </motion.div>
  );
}

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, source: "website" }),
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
        <section id="home" className="relative overflow-hidden bg-[#060606] px-6 pb-24 pt-16 sm:px-10 sm:pb-28 sm:pt-20 lg:px-16 lg:pb-32 lg:pt-24">
          <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.14),_transparent_55%)]" />
          <div className="absolute -left-40 top-48 h-80 w-80 rounded-full bg-emerald-500/8 blur-[120px]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950" />
          <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_480px] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Slimme laadoplossingen voor heel Nederland
              </div>
              <div>
                <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
                  Uw laadpaal,
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                    vakkundig geïnstalleerd.
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400 sm:text-xl">
                  Premium laadpalen van Alfen, Zaptec en Easee — geïnstalleerd door gecertificeerde specialisten. Vaste prijs. Gratis keuring. Klaar binnen drie weken.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur">
                    <badge.icon className="h-3.5 w-3.5 text-cyan-300" />
                    {badge.label}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black shadow-lg shadow-white/10 transition hover:bg-slate-100 active:scale-95"
                >
                  <Zap className="h-4 w-4" /> Gratis offerte aanvragen
                </Link>
                <a
                  href="tel:+31614004488"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> Bel {contactNumber}
                </a>
              </div>
              <div className="border-t border-white/10 pt-7">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  {kpis.map((kpi) => (
                    <div key={kpi.label}>
                      <span className="text-sm font-semibold text-white">{kpi.value}</span>
                      <span className="ml-1.5 text-sm text-slate-500">{kpi.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <div className="flex justify-center lg:justify-end">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-white/5 bg-[#070707] px-6 py-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "NEN 1010 Gecertificeerd",
              "EVSRB Erkend installateur",
              "Keurmerk Laadpalen",
              "VCA Gecertificeerd",
              "Vaste prijs vooraf",
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300/70" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Waarom ClimateX */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <WaaromClimateX />
          </div>
        </section>

        {/* Merken */}
        <section className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <OnzeLaadpaalmerken />
          </div>
        </section>

        {/* Installatieproces */}
        <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <InstallatieProces />
          </div>
        </section>

        {/* Calculator teaser */}
        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 px-8 py-10 sm:px-12"
            >
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_50%)]" />
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Calculator className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Bereken uw prijs direct</h3>
                    <p className="mt-0.5 text-sm text-slate-400">Indicatieprijs, besparing en de beste laadpaal voor uw situatie.</p>
                  </div>
                </div>
                <Link
                  href="/calculator"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  Open calculator →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-4xl">
            <FaqSection />
          </div>
        </section>

        {/* CTA band */}
        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <CtaBand />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-[#070707] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Contact</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Vraag nu uw gratis offerte aan.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                    Vul het formulier in of bel direct voor een gratis adviesgesprek. Wij nemen binnen 24 uur contact met u op.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <a href="tel:+31614004488" className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 transition hover:border-white/20">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Telefoon</p>
                    <p className="mt-3 text-lg font-semibold text-white">{contactNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">Ma–vr 08:00–18:00</p>
                  </a>
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">E-mail</p>
                    <p className="mt-3 text-lg font-semibold text-white">contact@climatex.nl</p>
                    <p className="mt-1 text-xs text-slate-500">Reactie binnen 24 uur</p>
                  </div>
                </div>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-6 py-3.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
                >
                  <MessageCircle className="h-4 w-4" /> Gratis adviesgesprek via WhatsApp
                </a>
                <div className="space-y-3 pt-1">
                  {[
                    "Gratis inspectie & advies",
                    "Vaste prijsgarantie — geen verrassingen",
                    "Geïnstalleerd binnen 3 weken",
                    "2–5 jaar garantie op installatie",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20 sm:p-10"
              >
                <p className="mb-6 text-xs uppercase tracking-[0.2em] text-slate-500">Gratis offerte aanvragen</p>
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
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15"
                      />
                    </label>
                  ))}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Type woning</span>
                      <select
                        value={formState.woningType}
                        onChange={(e) => handleFormChange("woningType", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                      >
                        {housingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Aantal laadpunten</span>
                      <input
                        type="number"
                        min={1}
                        value={formState.aantalLaadpunten}
                        onChange={(e) => handleFormChange("aantalLaadpunten", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                      />
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Elektrische auto?</span>
                      <select
                        value={formState.elektrischVoertuig}
                        onChange={(e) => handleFormChange("elektrischVoertuig", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                      >
                        <option value="Ja">Ja</option>
                        <option value="Nee, binnenkort">Nee, binnenkort</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Aansluiting</span>
                      <select
                        value={formState.aansluiting}
                        onChange={(e) => handleFormChange("aansluiting", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                      >
                        {aansluitingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Automerk (optioneel)</span>
                      <input
                        type="text"
                        value={formState.automerk}
                        placeholder="Tesla, Volkswagen…"
                        onChange={(e) => handleFormChange("automerk", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Parkeerplaats</span>
                      <input
                        type="text"
                        value={formState.parkeerplaats}
                        placeholder="Oprit, garage, openbaar…"
                        onChange={(e) => handleFormChange("parkeerplaats", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
                      <input type="checkbox" checked={formState.loadBalancing} onChange={(e) => handleFormChange("loadBalancing", e.target.checked)} className="h-5 w-5 rounded border-white/10 text-cyan-300" />
                      Interesse in load balancing
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
                      <input type="checkbox" checked={formState.dynamicLoadBalancing} onChange={(e) => handleFormChange("dynamicLoadBalancing", e.target.checked)} className="h-5 w-5 rounded border-white/10 text-cyan-300" />
                      Dynamic load balancing
                    </label>
                  </div>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Bericht (optioneel)</span>
                    <textarea
                      rows={3}
                      value={formState.bericht}
                      placeholder="Aanvullende informatie, bijv. afstand tot meterkast…"
                      onChange={(e) => handleFormChange("bericht", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-7 w-full rounded-full bg-white px-6 py-4 text-sm font-semibold text-black shadow-lg transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  Gratis offerte aanvragen
                </button>
                {formMessage ? <p className="mt-4 text-sm text-slate-300">{formMessage}</p> : null}
                <p className="mt-4 text-center text-xs text-slate-600">Vrijblijvend · Binnen 24 uur reactie · Geen spam</p>
              </form>
            </div>
          </div>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
      <Footer />
    </>
  );
}
