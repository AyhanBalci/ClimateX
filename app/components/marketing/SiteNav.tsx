"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BatteryCharging, Menu, Phone, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Producten" },
  { href: "/calculator", label: "Calculator" },
  { href: "/diensten", label: "Diensten" },
  { href: "/projecten", label: "Projecten" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/8 bg-zinc-950/85 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-transparent bg-zinc-950/50 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
            <BatteryCharging className="h-4 w-4" />
          </span>
          <span className="text-sm tracking-tight">ClimateX</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+31614004488"
            className="hidden items-center gap-1.5 text-sm text-slate-400 transition hover:text-white sm:flex lg:flex"
          >
            <Phone className="h-3.5 w-3.5 text-cyan-300" />
            <span className="hidden xl:inline">06 1400 4488</span>
          </a>
          <Link
            href="/#contact"
            className="hidden rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-md shadow-white/10 transition hover:bg-slate-100 active:scale-95 sm:inline-flex"
          >
            Gratis offerte
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.18 }}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-2xl px-4 py-3.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <a
                  href="tel:+31614004488"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 text-sm text-white"
                >
                  <Phone className="h-4 w-4" /> Bellen
                </a>
                <Link
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full bg-white py-3 text-sm font-semibold text-black"
                >
                  Gratis offerte
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
