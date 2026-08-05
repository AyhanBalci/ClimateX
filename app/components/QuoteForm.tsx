"use client";

import { FormEvent, useState } from "react";
import { validateLead } from "../lib/validateLead";
import { HOUSING_OPTIONS, AANSLUITING_OPTIONS } from "../lib/constants";

const initialState = {
  name: "",
  phone: "",
  email: "",
  plaats: "",
  woningType: "Gezinswoning",
  aantalLaadpunten: "1",
  elektrischVoertuig: "Ja",
  aansluiting: "1-fase",
  parkeerplaats: "",
  opmerkingen: "",
};

type Status = "idle" | "verzenden" | "fout" | "verzonden";

export default function QuoteForm() {
  const [formState, setFormState] = useState(initialState);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (field: keyof typeof initialState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Voorkomt dubbele leads wanneer er tijdens het verzenden nogmaals wordt geklikt.
    if (status === "verzenden") return;

    const validationError = validateLead({
      naam: formState.name,
      telefoon: formState.phone,
      email: formState.email,
      plaats: formState.plaats,
      type_woning: formState.woningType,
    });
    if (validationError) {
      setStatus("fout");
      setFormMessage(validationError);
      return;
    }

    setStatus("verzenden");
    setFormMessage("Verzenden…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          phone: formState.phone,
          email: formState.email,
          plaats: formState.plaats,
          woningType: formState.woningType,
          aantalLaadpunten: formState.aantalLaadpunten,
          elektrischVoertuig: formState.elektrischVoertuig,
          aansluiting: formState.aansluiting,
          parkeerplaats: formState.parkeerplaats,
          bericht: formState.opmerkingen,
          source: "products-offerteformulier",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatus("verzonden");
        setFormMessage(result.message || "Bedankt. Wij nemen binnen 24 uur contact met u op.");
        setFormState(initialState);
      } else {
        setStatus("fout");
        setFormMessage(result.error || "Er is iets misgegaan. Probeer het later opnieuw.");
      }
    } catch {
      setStatus("fout");
      setFormMessage("Er is iets misgegaan. Probeer het later opnieuw of bel ons op 06 1400 4488.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20"
    >
      <div className="grid gap-5">
        {(
          [
            { name: "name", label: "Naam", type: "text", placeholder: "Uw naam", autoComplete: "name" },
            { name: "phone", label: "Telefoonnummer", type: "tel", placeholder: "06 1400 4488", autoComplete: "tel" },
            { name: "email", label: "E-mailadres", type: "email", placeholder: "naam@voorbeeld.nl", autoComplete: "email" },
            { name: "plaats", label: "Plaats", type: "text", placeholder: "Bijv. Rotterdam", autoComplete: "address-level2" },
          ] as const
        ).map((field) => (
          <label key={field.name} className="space-y-2 text-sm text-slate-300">
            <span>
              {field.label} <span className="text-cyan-300/70">*</span>
            </span>
            <input
              type={field.type}
              value={formState[field.name]}
              placeholder={field.placeholder}
              onChange={(event) => handleChange(field.name, event.target.value)}
              required
              autoComplete={field.autoComplete}
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
        ))}
        <label className="space-y-2 text-sm text-slate-300">
          <span>Type woning</span>
          <select
            value={formState.woningType}
            onChange={(event) => handleChange("woningType", event.target.value)}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
          >
            {HOUSING_OPTIONS.map((option) => (
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
              onChange={(event) => handleChange("aantalLaadpunten", event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Heeft u al een elektrische auto?</span>
            <select
              value={formState.elektrischVoertuig}
              onChange={(event) => handleChange("elektrischVoertuig", event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            >
              <option value="Ja">Ja</option>
              <option value="Nee, binnenkort">Nee, binnenkort</option>
            </select>
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Aansluiting</span>
            <select
              value={formState.aansluiting}
              onChange={(event) => handleChange("aansluiting", event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            >
              {AANSLUITING_OPTIONS.map((option) => (
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
              placeholder="Bijv. eigen oprit, garage"
              onChange={(event) => handleChange("parkeerplaats", event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
        </div>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Opmerkingen</span>
          <textarea
            rows={4}
            value={formState.opmerkingen}
            placeholder="Eventuele opmerkingen of vragen"
            onChange={(event) => handleChange("opmerkingen", event.target.value)}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "verzenden"}
        className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "verzenden" ? "Bezig met verzenden…" : "Offerte aanvragen"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        Velden met <span className="text-cyan-300/70">*</span> zijn verplicht. Vrijblijvend, reactie binnen 24 uur.
      </p>

      {/* Meldingen worden aangekondigd door schermlezers; fouten dringender dan bevestigingen. */}
      <p
        role={status === "fout" ? "alert" : "status"}
        aria-live={status === "fout" ? "assertive" : "polite"}
        className={`mt-4 text-sm ${
          status === "fout" ? "text-rose-300" : status === "verzonden" ? "text-emerald-300" : "text-slate-300"
        }`}
      >
        {formMessage}
      </p>
    </form>
  );
}
