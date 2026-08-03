"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Award,
  BatteryCharging,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  Quote,
  Star,
  Users,
  Zap,
} from "lucide-react";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import WhatsAppButton from "../components/WhatsAppButton";
import CtaBand from "../components/marketing/CtaBand";
import Footer from "../components/marketing/Footer";
import { PROJECTEN, type Project } from "../lib/projectenData";

const TYPE_FILTERS = ["Alle", "Particulier", "Zakelijk", "VvE"] as const;
type Filter = (typeof TYPE_FILTERS)[number];

function TypeBadge({ type }: { type: Project["type"] }) {
  const styles: Record<Project["type"], string> = {
    Particulier: "bg-cyan-400/10 text-cyan-300 border-cyan-300/20",
    Zakelijk: "bg-purple-400/10 text-purple-300 border-purple-300/20",
    VvE: "bg-emerald-400/10 text-emerald-300 border-emerald-300/20",
  };
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles[type]}`}>
      {type}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.07, ease: "easeOut" }}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-xl shadow-black/20"
    >
      {/* Header image placeholder */}
      <div
        className="relative h-48 overflow-hidden sm:h-56"
        style={{ background: `linear-gradient(135deg, ${project.gradientFrom}22, ${project.gradientTo}44)` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${project.gradientFrom}33 0%, ${project.gradientTo}22 100%)` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(255,255,255,0.06),_transparent_60%)]" />
        {/* Icon visual */}
        <div className="absolute left-7 top-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
          {project.type === "VvE" ? (
            <Users className="h-7 w-7 text-white" />
          ) : project.type === "Zakelijk" ? (
            <Award className="h-7 w-7 text-white" />
          ) : (
            <BatteryCharging className="h-7 w-7 text-white" />
          )}
        </div>
        <div className="absolute right-6 top-6">
          <TypeBadge type={project.type} />
        </div>
        <div className="absolute bottom-5 left-7">
          <p className="text-xs text-white/50">Vervang door echte foto →</p>
        </div>
      </div>

      <div className="p-7">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {project.plaats}, {project.provincie}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {project.datum}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {project.installatieduur}</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {project.aantalLaadpunten} laadpunt{project.aantalLaadpunten > 1 ? "en" : ""}</span>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-white">{project.titel}</h2>
        <p className="mt-1 text-sm text-slate-400">{project.subtitel}</p>

        {/* Key specs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Laadpaal</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{project.laadpaal}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Automerk</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{project.automerk}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Type</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{project.woningType}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
              {tag}
            </span>
          ))}
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 flex w-full items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400 transition hover:text-white"
        >
          <span>{expanded ? "Minder details" : "Meer details & review"}</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="mt-5 space-y-6">
                {/* Werkzaamheden */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Werkzaamheden</p>
                  <ul className="space-y-2">
                    {project.werkzaamheden.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bijzonderheden + Resultaat */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bijzonderheden</p>
                    <p className="text-sm leading-6 text-slate-300">{project.bijzonderheden}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/5 p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/60">Resultaat</p>
                    <p className="text-sm leading-6 text-slate-300">{project.resultaat}</p>
                  </div>
                </div>

                {/* Review */}
                <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950 p-6">
                  <Quote className="absolute right-5 top-5 h-7 w-7 text-white/5" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: project.review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">&ldquo;{project.review.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 text-xs font-bold text-cyan-200">
                      {project.review.naam.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{project.review.naam}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {project.plaats} · {project.type}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/producten/${project.laadpaalSlug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                  >
                    <BatteryCharging className="h-4 w-4" /> Bekijk de {project.laadpaal}
                  </Link>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
                  >
                    <Car className="h-4 w-4" /> Vergelijkbaar project?
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default function ProjectenClient() {
  const [filter, setFilter] = useState<Filter>("Alle");

  const gefilterd = filter === "Alle" ? PROJECTEN : PROJECTEN.filter((p) => p.type === filter);

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Gerealiseerde projecten</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                500+ installaties door heel Nederland.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
                Van een enkele laadpaal op de eigen oprit tot een volledig laadpark voor een bedrijfsvloot — bekijk onze gerealiseerde projecten.
              </p>
            </div>
            {/* KPIs */}
            <div className="mt-10 flex flex-wrap gap-4">
              {[
                { label: "Installaties", value: "500+" },
                { label: "Laadpunten", value: "1.200+" },
                { label: "Beoordeling", value: "4,9/5" },
                { label: "Provincies", value: "12" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-white">{kpi.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter + grid */}
        <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-7xl">
            {/* Filters */}
            <div className="mb-10 flex flex-wrap gap-2">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    filter === f
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                {gefilterd.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            {gefilterd.length === 0 ? (
              <p className="mt-12 text-center text-sm text-slate-500">Geen projecten gevonden voor dit filter.</p>
            ) : null}

            {/* Placeholder note */}
            <div className="mt-12 rounded-2xl border border-dashed border-white/10 p-6 text-center">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-400">Eigen projecten toevoegen:</span> Bewerk{" "}
                <code className="rounded bg-white/5 px-2 py-0.5 text-xs text-cyan-300">app/lib/projectenData.ts</code>{" "}
                en voeg uw eigen foto&apos;s toe in de headerafbeelding van elke ProjectCard.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <CtaBand />
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
