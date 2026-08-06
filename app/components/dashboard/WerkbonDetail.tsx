"use client";

import { FormEvent, useEffect, useState } from "react";
import { Factuur, Offerte, Planning, Werkbon } from "../../lib/types";
import { WERKBON_STATUS_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { downloadWerkbonPdf } from "../../lib/generateWerkbonPdf";
import { createFactuurFromWerkbon } from "../../lib/factuurActions";
import { createPlanning } from "../../lib/planningActions";
import HandtekeningPad from "./HandtekeningPad";
import WerkbonRegels from "./WerkbonRegels";
import { toDateKey } from "../../lib/dateUtils";
import { formatDatum } from "../../lib/formatters";
import FileUpload from "./FileUpload";

type Props = {
  werkbon: Werkbon;
  onBack: () => void;
  onWerkbonUpdated: (werkbon: Werkbon) => void;
  onFactuurCreated: (factuur: Factuur) => void;
  onOpenPlanning: (planning: Planning) => void;
};

export default function WerkbonDetail({ werkbon, onBack, onWerkbonUpdated, onFactuurCreated, onOpenPlanning }: Props) {
  const [offerte, setOfferte] = useState<Offerte | null>(null);
  const [afspraken, setAfspraken] = useState<Planning[]>([]);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [planningForm, setPlanningForm] = useState({
    medewerker: "",
    datum: toDateKey(new Date()),
    starttijd: "09:00",
    eindtijd: "10:00",
  });
  const [form, setForm] = useState({
    klantnaam: werkbon.klantnaam,
    adres: werkbon.adres || "",
    telefoon: werkbon.telefoon || "",
    monteur: werkbon.monteur || "",
    serienummer: werkbon.serienummer || "",
    testresultaten: werkbon.testresultaten || "",
    werkzaamheden: werkbon.werkzaamheden || "",
    materialen: werkbon.materialen || "",
    opmerkingen: werkbon.opmerkingen || "",
    status: werkbon.status,
    handtekening_klant: werkbon.handtekening_klant || "",
    handtekening_monteur: werkbon.handtekening_monteur || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingFactuur, setCreatingFactuur] = useState(false);
  const [savingPlanning, setSavingPlanning] = useState(false);
  const [mailBezig, setMailBezig] = useState(false);
  const [mailFeedback, setMailFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfferte() {
      if (!supabase || !werkbon.offerte_id) return;
      const { data } = await supabase.from("offertes").select("*").eq("id", werkbon.offerte_id).single();
      setOfferte((data as Offerte) || null);
    }
    fetchOfferte();
  }, [werkbon.offerte_id]);

  useEffect(() => {
    async function fetchAfspraken() {
      if (!supabase) return;
      const { data } = await supabase.from("planning").select("*").eq("werkbon_id", werkbon.id).order("datum", { ascending: false });
      setAfspraken((data as Planning[]) || []);
    }
    fetchAfspraken();
  }, [werkbon.id]);

  const handlePlanAfspraak = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingPlanning) return;
    if (!planningForm.medewerker.trim()) {
      setError("Vul een medewerker in om de afspraak in te plannen.");
      return;
    }

    setSavingPlanning(true);
    try {
      const { data, error: createError } = await createPlanning({
        titel: `Werkbon ${werkbon.werkbonnummer}`,
        klantnaam: werkbon.klantnaam,
        werkbon_id: werkbon.id,
        lead_id: werkbon.lead_id,
        ticket_id: werkbon.ticket_id,
        medewerker: planningForm.medewerker.trim(),
        datum: planningForm.datum,
        starttijd: planningForm.starttijd,
        eindtijd: planningForm.eindtijd,
        adres: werkbon.adres || "",
        telefoon: werkbon.telefoon || "",
      });

      if (createError || !data) {
        setError(createError || "Afspraak inplannen is mislukt.");
        return;
      }
      setError(null);
      setAfspraken((current) => [data as Planning, ...current]);
      setShowPlanningForm(false);
    } finally {
      setSavingPlanning(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || saving) return;

    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("werkbonnen")
      .update({
        klantnaam: form.klantnaam.trim(),
        adres: form.adres.trim(),
        telefoon: form.telefoon.trim(),
        monteur: form.monteur.trim(),
        serienummer: form.serienummer.trim(),
        testresultaten: form.testresultaten.trim(),
        werkzaamheden: form.werkzaamheden.trim(),
        materialen: form.materialen.trim(),
        opmerkingen: form.opmerkingen.trim(),
        status: form.status,
        handtekening_klant: form.handtekening_klant.trim(),
        handtekening_monteur: form.handtekening_monteur.trim(),
      })
      .eq("id", werkbon.id)
      .select()
      .single();

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setError(null);
    onWerkbonUpdated(data as Werkbon);
  };

  /**
   * De PDF wordt uitgeprint en ondertekend, dus hij moet exact overeenkomen met
   * wat er is opgeslagen. Zolang er niet-opgeslagen wijzigingen openstaan, zou
   * een ondertekend papier iets anders vermelden dan het dossier.
   */
  const heeftNietOpgeslagenWijzigingen = (Object.keys(form) as (keyof typeof form)[]).some((veld) => {
    const opgeslagen = (werkbon as unknown as Record<string, unknown>)[veld];
    return form[veld] !== ((opgeslagen as string | null) ?? "");
  });

  const handleVerstuurPdf = async () => {
    if (mailBezig) return;

    setMailBezig(true);
    setMailFeedback(null);
    try {
      const response = await fetch("/api/werkbonnen/verstuur-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ werkbonId: werkbon.id }),
      });
      const data = await response.json();
      setMailFeedback(
        response.ok ? `Werkbon is per e-mail verstuurd naar ${data.naar}.` : data.error || "Versturen is mislukt."
      );
    } catch (fout) {
      setMailFeedback(fout instanceof Error ? fout.message : "Versturen is mislukt.");
    } finally {
      setMailBezig(false);
    }
  };

  const handleCreateFactuur = async () => {
    if (creatingFactuur) return;
    setCreatingFactuur(true);
    const { data, error: createError } = await createFactuurFromWerkbon(
      { ...werkbon, status: form.status },
      offerte
    );
    setCreatingFactuur(false);

    if (createError || !data) {
      setError(createError || "Factuur aanmaken is mislukt.");
      return;
    }
    setError(null);
    setForm((current) => ({ ...current, status: "Gefactureerd" }));
    onWerkbonUpdated({ ...werkbon, status: "Gefactureerd" });
    onFactuurCreated(data as Factuur);
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cyan-300 transition hover:text-cyan-200">
        ← Terug naar werkbonoverzicht
      </button>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Werkbon</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{werkbon.werkbonnummer}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadWerkbonPdf(werkbon)}
              disabled={heeftNietOpgeslagenWijzigingen}
              title={
                heeftNietOpgeslagenWijzigingen
                  ? "Sla eerst uw wijzigingen op, anders wijkt de PDF af van het dossier."
                  : undefined
              }
              className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              PDF downloaden
            </button>
            <button
              onClick={handleVerstuurPdf}
              disabled={mailBezig || heeftNietOpgeslagenWijzigingen}
              title={
                heeftNietOpgeslagenWijzigingen
                  ? "Sla eerst uw wijzigingen op, anders wijkt de verstuurde PDF af van het dossier."
                  : undefined
              }
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mailBezig ? "Bezig met versturen..." : "Verstuur per e-mail"}
            </button>
            {form.status === "Gereed" ? (
              <button
                onClick={handleCreateFactuur}
                disabled={creatingFactuur}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {creatingFactuur ? "Bezig..." : "Maak factuur"}
              </button>
            ) : null}
            {mailFeedback ? (
              <p role="status" aria-live="polite" className="w-full text-xs text-slate-400">
                {mailFeedback}
              </p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-rose-400">
            {error}
          </p>
        ) : null}

        {heeftNietOpgeslagenWijzigingen ? (
          <p role="status" className="mt-4 text-sm text-amber-300">
            U heeft wijzigingen die nog niet zijn opgeslagen. Sla ze eerst op; daarna kunt u de PDF downloaden.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Klantnaam"
            value={form.klantnaam}
            onChange={(event) => setForm((current) => ({ ...current, klantnaam: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Adres"
            value={form.adres}
            onChange={(event) => setForm((current) => ({ ...current, adres: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Telefoon"
            value={form.telefoon}
            onChange={(event) => setForm((current) => ({ ...current, telefoon: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Installateur"
            value={form.monteur}
            onChange={(event) => setForm((current) => ({ ...current, monteur: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Serienummer laadpaal"
            value={form.serienummer}
            onChange={(event) => setForm((current) => ({ ...current, serienummer: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <textarea
            rows={2}
            placeholder="Testresultaten (bijv. doormeten aansluiting, testlading)"
            value={form.testresultaten}
            onChange={(event) => setForm((current) => ({ ...current, testresultaten: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <textarea
            rows={3}
            placeholder="Werkzaamheden"
            value={form.werkzaamheden}
            onChange={(event) => setForm((current) => ({ ...current, werkzaamheden: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <textarea
            rows={3}
            placeholder="Toelichting materialen (losse regels staan hieronder)"
            value={form.materialen}
            onChange={(event) => setForm((current) => ({ ...current, materialen: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <textarea
            rows={2}
            placeholder="Opmerkingen"
            value={form.opmerkingen}
            onChange={(event) => setForm((current) => ({ ...current, opmerkingen: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <HandtekeningPad
            label="Handtekening klant"
            waarde={form.handtekening_klant}
            onChange={(waarde) => setForm((current) => ({ ...current, handtekening_klant: waarde }))}
          />
          <HandtekeningPad
            label="Handtekening installateur"
            waarde={form.handtekening_monteur}
            onChange={(waarde) => setForm((current) => ({ ...current, handtekening_monteur: waarde }))}
          />
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          >
            {WERKBON_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 sm:col-span-2"
          >
            {saving ? "Bezig met opslaan..." : "Opslaan"}
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Materiaal en uren</h3>
        <div className="mt-4">
          <WerkbonRegels werkbonId={werkbon.id} monteur={werkbon.monteur} />
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Planning</h3>
          <button
            onClick={() => setShowPlanningForm((current) => !current)}
            className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {showPlanningForm ? "Annuleren" : "+ Plan afspraak"}
          </button>
        </div>

        {showPlanningForm ? (
          <form onSubmit={handlePlanAfspraak} className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-[#090909] p-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Medewerker"
              value={planningForm.medewerker}
              onChange={(event) => setPlanningForm((current) => ({ ...current, medewerker: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="date"
              value={planningForm.datum}
              onChange={(event) => setPlanningForm((current) => ({ ...current, datum: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={planningForm.starttijd}
              onChange={(event) => setPlanningForm((current) => ({ ...current, starttijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="time"
              value={planningForm.eindtijd}
              onChange={(event) => setPlanningForm((current) => ({ ...current, eindtijd: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={savingPlanning}
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {savingPlanning ? "Bezig met inplannen…" : "Inplannen"}
            </button>
          </form>
        ) : null}

        {afspraken.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nog geen afspraken ingepland voor deze werkbon.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {afspraken.map((afspraak) => (
              <div key={afspraak.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090909] p-3 text-sm">
                <div>
                  <p className="font-semibold text-white">{formatDatum(afspraak.datum)} {afspraak.starttijd.slice(0, 5)}</p>
                  <p className="text-slate-400">{afspraak.medewerker} · {afspraak.status}</p>
                </div>
                <button
                  onClick={() => onOpenPlanning(afspraak)}
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  Openen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Foto&apos;s en documenten</h3>
        <div className="mt-4">
          <FileUpload werkbonId={werkbon.id} categorieen={["Foto voor", "Foto na", "Opleverfoto", "Overig"]} />
        </div>
      </div>
    </div>
  );
}
