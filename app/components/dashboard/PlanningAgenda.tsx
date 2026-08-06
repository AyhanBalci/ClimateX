"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Planning, Werkbon } from "../../lib/types";
import { PLANNING_STATUS_OPTIONS } from "../../lib/constants";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { createPlanning, verplaatsPlanning } from "../../lib/planningActions";
import {
  addDays,
  formatDutchDate,
  formatDutchMonthYear,
  formatDutchWeekday,
  startOfMonthGrid,
  startOfWeek,
  toDateKey,
} from "../../lib/dateUtils";
import PlanningKpis from "./PlanningKpis";

type ViewMode = "dag" | "week" | "maand";

const emptyForm = {
  titel: "",
  klantnaam: "",
  medewerker: "",
  datum: toDateKey(new Date()),
  starttijd: "09:00",
  eindtijd: "10:00",
  adres: "",
  telefoon: "",
  omschrijving: "",
  werkbon_id: "",
};

/** Werkbonnen in deze statussen zijn al uitgevoerd en hoeven niet meer ingepland. */
const AFGEHANDELDE_WERKBON_STATUSSEN = ["Gereed", "Gefactureerd"];

type Props = {
  onSelectPlanning: (planning: Planning) => void;
};

export default function PlanningAgenda({ onSelectPlanning }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [afspraken, setAfspraken] = useState<Planning[]>([]);
  const [medewerkers, setMedewerkers] = useState<string[]>([]);
  const [medewerkerFilter, setMedewerkerFilter] = useState("Alle");
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [openWerkbonnen, setOpenWerkbonnen] = useState<Werkbon[]>([]);
  // Id van de afspraak die op dit moment versleept wordt, plus de dag waarboven
  // de cursor hangt. Beide alleen voor de weergave tijdens het slepen.
  const [sleependeId, setSleependeId] = useState<string | null>(null);
  const [sleepDoel, setSleepDoel] = useState<string | null>(null);

  const range = useMemo(() => {
    if (viewMode === "dag") {
      return { from: currentDate, to: currentDate };
    }
    if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      return { from: start, to: addDays(start, 6) };
    }
    const start = startOfMonthGrid(currentDate);
    return { from: start, to: addDays(start, 41) };
  }, [viewMode, currentDate]);

  useEffect(() => {
    async function fetchMedewerkers() {
      if (!supabase) return;
      const { data } = await supabase.from("planning").select("medewerker");
      const unique = Array.from(new Set((data || []).map((item) => item.medewerker).filter(Boolean)));
      setMedewerkers(unique.sort());
    }
    fetchMedewerkers();
  }, []);

  // Werkbonnen die nog uitgevoerd moeten worden, zodat ze rechtstreeks vanuit de
  // agenda ingepland kunnen worden in plaats van alleen vanuit de werkbon zelf.
  useEffect(() => {
    async function fetchOpenWerkbonnen() {
      if (!supabase) return;
      const { data } = await supabase
        .from("werkbonnen")
        .select("*")
        .not("status", "in", `(${AFGEHANDELDE_WERKBON_STATUSSEN.join(",")})`)
        .order("datum", { ascending: false });
      setOpenWerkbonnen((data as Werkbon[]) || []);
    }
    fetchOpenWerkbonnen();
  }, []);

  useEffect(() => {
    // De periode verandert bij elke klik op vorige/volgende. Zonder deze vlag kan
    // een trager verzoek van een eerdere periode later binnenkomen dan het verzoek
    // van de periode die nu in beeld staat, waardoor de agenda de afspraken van de
    // verkeerde week toont onder de juiste datumkoppen.
    let verouderd = false;

    async function fetchAfspraken() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      let query = supabase
        .from("planning")
        .select("*")
        .gte("datum", toDateKey(range.from))
        .lte("datum", toDateKey(range.to))
        .order("datum", { ascending: true })
        .order("starttijd", { ascending: true });

      if (medewerkerFilter !== "Alle") query = query.eq("medewerker", medewerkerFilter);
      if (statusFilter !== "Alle") query = query.eq("status", statusFilter);

      const { data, error: fetchError } = await query;
      if (verouderd) return;

      if (fetchError) setError(fetchError.message);
      else setAfspraken((data as Planning[]) || []);
      setLoading(false);
    }

    fetchAfspraken();

    return () => {
      verouderd = true;
    };
  }, [range, medewerkerFilter, statusFilter]);

  const gekozenWerkbon = openWerkbonnen.find((werkbon) => werkbon.id === form.werkbon_id) || null;

  /**
   * Neemt de klantgegevens van de gekozen werkbon over. Al ingevulde velden
   * blijven staan, zodat een handmatige correctie niet overschreven wordt.
   */
  const handleWerkbonKeuze = (werkbonId: string) => {
    const werkbon = openWerkbonnen.find((item) => item.id === werkbonId);
    setForm((current) => {
      if (!werkbon) return { ...current, werkbon_id: "" };
      return {
        ...current,
        werkbon_id: werkbonId,
        titel: current.titel || `Werkbon ${werkbon.werkbonnummer}`,
        klantnaam: current.klantnaam || werkbon.klantnaam,
        adres: current.adres || werkbon.adres || "",
        telefoon: current.telefoon || werkbon.telefoon || "",
        medewerker: current.medewerker || werkbon.monteur || "",
      };
    });
  };

  /**
   * Verplaatst een gesleepte afspraak naar de dag waarop losgelaten wordt. De
   * agenda loopt vooruit op het antwoord van Supabase zodat de kaart direct
   * meeschuift; mislukt het opslaan, dan gaat de agenda terug naar de oude staat.
   */
  const handleDropOpDag = async (dag: Date) => {
    const planningId = sleependeId;
    setSleependeId(null);
    setSleepDoel(null);
    if (!planningId) return;

    const nieuweDatum = toDateKey(dag);
    const afspraak = afspraken.find((item) => item.id === planningId);
    if (!afspraak || afspraak.datum === nieuweDatum) return;

    const vorigeAfspraken = afspraken;
    setAfspraken((current) =>
      current.map((item) => (item.id === planningId ? { ...item, datum: nieuweDatum } : item))
    );

    const { error: verplaatsError } = await verplaatsPlanning(planningId, nieuweDatum);
    if (verplaatsError) {
      setAfspraken(vorigeAfspraken);
      setError(`Verplaatsen is mislukt: ${verplaatsError}`);
      return;
    }
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!form.titel.trim() || !form.medewerker.trim() || !form.datum) {
      setError("Vul minimaal titel, medewerker en datum in.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: createError } = await createPlanning({
        titel: form.titel.trim(),
        klantnaam: form.klantnaam.trim(),
        medewerker: form.medewerker.trim(),
        datum: form.datum,
        starttijd: form.starttijd,
        eindtijd: form.eindtijd,
        adres: form.adres.trim(),
        telefoon: form.telefoon.trim(),
        omschrijving: form.omschrijving.trim(),
        werkbon_id: form.werkbon_id || null,
        lead_id: gekozenWerkbon?.lead_id || null,
        ticket_id: gekozenWerkbon?.ticket_id || null,
      });

      if (createError || !data) {
        setError(createError || "Afspraak aanmaken is mislukt.");
        return;
      }

      setError(null);
      setAfspraken((current) => [...current, data as Planning].sort((a, b) => a.starttijd.localeCompare(b.starttijd)));
      if (!medewerkers.includes(form.medewerker.trim())) {
        setMedewerkers((current) => [...current, form.medewerker.trim()].sort());
      }
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (viewMode === "dag") setCurrentDate((current) => addDays(current, -1));
    else if (viewMode === "week") setCurrentDate((current) => addDays(current, -7));
    else setCurrentDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (viewMode === "dag") setCurrentDate((current) => addDays(current, 1));
    else if (viewMode === "week") setCurrentDate((current) => addDays(current, 7));
    else setCurrentDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const periodeLabel =
    viewMode === "dag"
      ? formatDutchDate(currentDate)
      : viewMode === "week"
        ? `${formatDutchDate(range.from)} - ${formatDutchDate(range.to)}`
        : formatDutchMonthYear(currentDate);

  const afsprakenOpDag = (date: Date) => afspraken.filter((item) => item.datum === toDateKey(date));

  const weekDagen = useMemo(() => {
    const start = viewMode === "maand" ? startOfMonthGrid(currentDate) : startOfWeek(currentDate);
    const aantalDagen = viewMode === "maand" ? 42 : 7;
    return Array.from({ length: aantalDagen }, (_, index) => addDays(start, index));
  }, [viewMode, currentDate]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Planning &amp; Agenda</h2>
        <button
          onClick={() => setShowForm((current) => !current)}
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          {showForm ? "Annuleren" : "+ Nieuwe afspraak"}
        </button>
      </div>

      <div className="mt-6">
        <PlanningKpis />
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-[#090909] p-5 sm:grid-cols-2 sm:p-6">
          <label className="block text-xs uppercase tracking-[0.18em] text-slate-400 sm:col-span-2">
            Werkbon inplannen (optioneel)
            <select
              value={form.werkbon_id}
              onChange={(event) => handleWerkbonKeuze(event.target.value)}
              className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-300"
            >
              <option value="">Losse afspraak zonder werkbon</option>
              {openWerkbonnen.map((werkbon) => (
                <option key={werkbon.id} value={werkbon.id}>
                  {werkbon.werkbonnummer} · {werkbon.klantnaam} ({werkbon.status})
                </option>
              ))}
            </select>
          </label>
          <input
            type="text"
            placeholder="Titel (bijv. Installatie laadpaal)"
            value={form.titel}
            onChange={(event) => setForm((current) => ({ ...current, titel: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <input
            type="text"
            placeholder="Klantnaam"
            value={form.klantnaam}
            onChange={(event) => setForm((current) => ({ ...current, klantnaam: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Monteur"
            list="planning-medewerkers"
            value={form.medewerker}
            onChange={(event) => setForm((current) => ({ ...current, medewerker: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <datalist id="planning-medewerkers">
            {medewerkers.map((medewerker) => (
              <option key={medewerker} value={medewerker} />
            ))}
          </datalist>
          <input
            type="date"
            value={form.datum}
            onChange={(event) => setForm((current) => ({ ...current, datum: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={form.starttijd}
              onChange={(event) => setForm((current) => ({ ...current, starttijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={form.eindtijd}
              onChange={(event) => setForm((current) => ({ ...current, eindtijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
          </div>
          <input
            type="text"
            placeholder="Adres"
            value={form.adres}
            onChange={(event) => setForm((current) => ({ ...current, adres: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Telefoonnummer"
            value={form.telefoon}
            onChange={(event) => setForm((current) => ({ ...current, telefoon: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <textarea
            rows={2}
            placeholder="Omschrijving"
            value={form.omschrijving}
            onChange={(event) => setForm((current) => ({ ...current, omschrijving: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {submitting ? "Bezig met inplannen…" : "Afspraak inplannen"}
          </button>
        </form>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
            Vandaag
          </button>
          <button onClick={goPrev} className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
            ← Vorige
          </button>
          <button onClick={goNext} className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
            Volgende →
          </button>
        </div>
        <p className="text-sm font-semibold text-white">{periodeLabel}</p>
        <div className="flex gap-2">
          {(["dag", "week", "maand"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`min-h-[44px] inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                viewMode === mode ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={medewerkerFilter}
          onChange={(event) => setMedewerkerFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle medewerkers</option>
          {medewerkers.map((medewerker) => (
            <option key={medewerker} value={medewerker}>
              {medewerker}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
        >
          <option value="Alle">Alle statussen</option>
          {PLANNING_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {viewMode !== "dag" ? (
        <p className="mt-4 text-xs text-slate-500">
          Tip: sleep een afspraak naar een andere dag om die te verplaatsen. Op een touchscreen doet u dat via de
          datum in het afspraakscherm.
        </p>
      ) : null}

      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

      {!loading && viewMode === "dag" ? (
        <div className="mt-6 space-y-3">
          {afsprakenOpDag(currentDate).length === 0 ? (
            <p className="text-sm text-slate-400">Geen afspraken op deze dag.</p>
          ) : (
            afsprakenOpDag(currentDate).map((afspraak) => (
              <button
                key={afspraak.id}
                onClick={() => onSelectPlanning(afspraak)}
                style={{ borderLeftColor: afspraak.kleur }}
                className="block w-full rounded-2xl border border-white/10 border-l-4 bg-[#090909] p-4 text-left transition hover:bg-white/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{afspraak.starttijd.slice(0, 5)} - {afspraak.eindtijd.slice(0, 5)} · {afspraak.titel}</p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">{afspraak.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{afspraak.medewerker} {afspraak.klantnaam ? `· ${afspraak.klantnaam}` : ""}</p>
              </button>
            ))
          )}
        </div>
      ) : null}

      {!loading && viewMode === "week" ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDagen.map((dag) => (
            <div
              key={toDateKey(dag)}
              onDragOver={(event) => {
                event.preventDefault();
                setSleepDoel(toDateKey(dag));
              }}
              onDragLeave={() => setSleepDoel((current) => (current === toDateKey(dag) ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                handleDropOpDag(dag);
              }}
              className={`rounded-2xl border bg-[#090909] p-3 transition ${
                sleepDoel === toDateKey(dag) ? "border-cyan-300 bg-cyan-400/5" : "border-white/10"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {formatDutchWeekday(dag)} {dag.getDate()}
              </p>
              <div className="mt-2 space-y-2">
                {afsprakenOpDag(dag).map((afspraak) => (
                  <button
                    key={afspraak.id}
                    draggable
                    onDragStart={() => setSleependeId(afspraak.id)}
                    onDragEnd={() => {
                      setSleependeId(null);
                      setSleepDoel(null);
                    }}
                    onClick={() => onSelectPlanning(afspraak)}
                    title="Sleep naar een andere dag om te verplaatsen"
                    style={{ borderLeftColor: afspraak.kleur }}
                    className={`block w-full cursor-grab rounded-xl border border-white/10 border-l-4 bg-black/40 p-2 text-left text-xs transition hover:bg-white/5 active:cursor-grabbing ${
                      sleependeId === afspraak.id ? "opacity-40" : ""
                    }`}
                  >
                    <p className="font-semibold text-white">{afspraak.starttijd.slice(0, 5)} {afspraak.titel}</p>
                    <p className="text-slate-400">{afspraak.medewerker}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && viewMode === "maand" ? (
        <div className="mt-6 grid grid-cols-7 gap-2">
          {weekDagen.map((dag) => {
            const items = afsprakenOpDag(dag);
            const isCurrentMonth = dag.getMonth() === currentDate.getMonth();
            return (
              <button
                key={toDateKey(dag)}
                onClick={() => {
                  setCurrentDate(dag);
                  setViewMode("dag");
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setSleepDoel(toDateKey(dag));
                }}
                onDragLeave={() => setSleepDoel((current) => (current === toDateKey(dag) ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDropOpDag(dag);
                }}
                className={`min-h-[90px] rounded-xl border p-2 text-left transition hover:bg-white/5 ${
                  sleepDoel === toDateKey(dag) ? "border-cyan-300 bg-cyan-400/5" : "border-white/10"
                } ${isCurrentMonth ? "bg-[#090909]" : "bg-black/20 opacity-50"}`}
              >
                <p className="text-xs text-slate-400">{dag.getDate()}</p>
                <div className="mt-1 space-y-1">
                  {items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      draggable
                      onDragStart={(event) => {
                        event.stopPropagation();
                        setSleependeId(item.id);
                      }}
                      onDragEnd={() => {
                        setSleependeId(null);
                        setSleepDoel(null);
                      }}
                      title="Sleep naar een andere dag om te verplaatsen"
                      className={`block cursor-grab truncate rounded-full px-2 py-0.5 text-[10px] text-white active:cursor-grabbing ${
                        sleependeId === item.id ? "opacity-40" : ""
                      }`}
                      style={{ backgroundColor: `${item.kleur}33` }}
                    >
                      {item.starttijd.slice(0, 5)} {item.medewerker}
                    </span>
                  ))}
                  {items.length > 3 ? <p className="text-[10px] text-slate-500">+{items.length - 3} meer</p> : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
