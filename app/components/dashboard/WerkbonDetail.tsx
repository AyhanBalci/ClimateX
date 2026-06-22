"use client";

import { FormEvent, useEffect, useState } from "react";
import { Factuur, Offerte, Werkbon } from "../../lib/types";
import { WERKBON_STATUS_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { downloadWerkbonPdf } from "../../lib/generateWerkbonPdf";
import { createFactuurFromWerkbon } from "../../lib/factuurActions";
import FileUpload from "./FileUpload";

type Props = {
  werkbon: Werkbon;
  onBack: () => void;
  onWerkbonUpdated: (werkbon: Werkbon) => void;
  onFactuurCreated: (factuur: Factuur) => void;
};

export default function WerkbonDetail({ werkbon, onBack, onWerkbonUpdated, onFactuurCreated }: Props) {
  const [offerte, setOfferte] = useState<Offerte | null>(null);
  const [form, setForm] = useState({
    klantnaam: werkbon.klantnaam,
    adres: werkbon.adres || "",
    telefoon: werkbon.telefoon || "",
    monteur: werkbon.monteur || "",
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

  useEffect(() => {
    async function fetchOfferte() {
      if (!supabase || !werkbon.offerte_id) return;
      const { data } = await supabase.from("offertes").select("*").eq("id", werkbon.offerte_id).single();
      setOfferte((data as Offerte) || null);
    }
    fetchOfferte();
  }, [werkbon.offerte_id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("werkbonnen")
      .update({
        klantnaam: form.klantnaam.trim(),
        adres: form.adres.trim(),
        telefoon: form.telefoon.trim(),
        monteur: form.monteur.trim(),
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

  const handleCreateFactuur = async () => {
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
              onClick={() => downloadWerkbonPdf({ ...werkbon, ...form })}
              className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              PDF downloaden
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
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

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
            placeholder="Monteur"
            value={form.monteur}
            onChange={(event) => setForm((current) => ({ ...current, monteur: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
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
            placeholder="Materialen"
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
          <input
            type="text"
            placeholder="Handtekening klant (naam ter bevestiging)"
            value={form.handtekening_klant}
            onChange={(event) => setForm((current) => ({ ...current, handtekening_klant: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Handtekening monteur (naam ter bevestiging)"
            value={form.handtekening_monteur}
            onChange={(event) => setForm((current) => ({ ...current, handtekening_monteur: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
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
        <h3 className="text-lg font-semibold text-white">Foto&apos;s en documenten</h3>
        <div className="mt-4">
          <FileUpload werkbonId={werkbon.id} categorieen={["Werkfoto", "Opleverfoto", "Overig"]} />
        </div>
      </div>
    </div>
  );
}
