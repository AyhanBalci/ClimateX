"use client";

import Link from "next/link";
import { BatteryCharging, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

const diensten = [
  "Laadpaal thuis",
  "Zakelijke laadpalen",
  "VvE laadoplossingen",
  "Load balancing",
  "Dynamic load balancing",
  "Onderhoud & storing",
];

const producten = [
  "Alfen Eve Pro-line",
  "Zaptec Go",
  "Wallbox Pulsar Plus",
  "Easee One",
  "EVBox Elvi",
  "ABB Terra AC",
];

const certificaten = ["NEN 1010 gecertificeerd", "EVSRB erkend installateur", "Keurmerk Laadpalen", "VCA gecertificeerd", "ISO 9001"];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#040404]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <BatteryCharging className="h-4.5 w-4.5" />
              </span>
              ClimateX
            </Link>
            <p className="max-w-xs text-sm leading-7 text-slate-400">
              Specialist in het installeren van premium laadpalen voor woningen, bedrijven en VvE&apos;s door heel Nederland.
            </p>
            <div className="space-y-2.5 text-sm text-slate-400">
              <a href="tel:+31614004488" className="flex items-center gap-2.5 transition hover:text-white">
                <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-300" /> 06 1400 4488
              </a>
              <a href="mailto:contact@climatex.nl" className="flex items-center gap-2.5 transition hover:text-white">
                <Mail className="h-3.5 w-3.5 shrink-0 text-cyan-300" /> contact@climatex.nl
              </a>
              <span className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" /> Nederland
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {["LinkedIn", "Instagram", "Facebook"].map((label) => (
                <span
                  key={label}
                  className="flex cursor-default items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-500"
                >
                  <ExternalLink className="h-3 w-3" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Diensten */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Diensten</p>
            <ul className="space-y-3">
              {diensten.map((d) => (
                <li key={d}>
                  <Link href="/diensten" className="text-sm text-slate-400 transition hover:text-white">
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bedrijf */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bedrijf</p>
            <ul className="space-y-3">
              {[
                { href: "/over-ons", label: "Over ons" },
                { href: "/waarom-climatex", label: "Waarom ClimateX" },
                { href: "/projecten", label: "Projecten" },
                { href: "/reviews", label: "Reviews" },
                { href: "/calculator", label: "Calculator" },
                { href: "/#contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Producten */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Producten</p>
            <ul className="space-y-3">
              {producten.map((p) => (
                <li key={p}>
                  <Link href="/products" className="text-sm text-slate-400 transition hover:text-white">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Openingstijden</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex justify-between gap-4"><span>Maandag – Vrijdag</span><span>08:00 – 18:00</span></li>
                <li className="flex justify-between gap-4"><span>Zaterdag</span><span>09:00 – 15:00</span></li>
                <li className="flex justify-between gap-4"><span>Zondag</span><span className="text-slate-600">Gesloten</span></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Keurmerken</p>
              <ul className="space-y-2">
                {certificaten.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/60" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} ClimateX. Alle rechten voorbehouden.</p>
          <div className="flex gap-5 text-xs text-slate-600">
            <span className="cursor-default hover:text-slate-400 transition">Privacybeleid</span>
            <span className="cursor-default hover:text-slate-400 transition">Algemene voorwaarden</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
