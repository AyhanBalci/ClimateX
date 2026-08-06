"use client";

import { FormEvent, useEffect, useState } from "react";
import { WerkbonMateriaal, WerkbonUur } from "../../lib/types";
import { supabase } from "../../lib/supabase";
import { formatBedrag, formatDatum } from "../../lib/formatters";
import { berekenWerkbonTotalen, formatUren } from "../../lib/werkbonRegels";
import { toDateKey } from "../../lib/dateUtils";

type Props = {
  werkbonId: string;
  /** Standaardmonteur voor een nieuwe urenregel. */
  monteur: string | null;
};

const LEEG_MATERIAAL = { omschrijving: "", aantal: "1", eenheid: "stuk", eenheidsprijs: "" };
const EENHEDEN = ["stuk", "meter", "uur", "set", "rol"];

export default function WerkbonRegels({ werkbonId, monteur }: Props) {
  const [materialen, setMaterialen] = useState<WerkbonMateriaal[]>([]);
  const [uren, setUren] = useState<WerkbonUur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  const [materiaalForm, setMateriaalForm] = useState(LEEG_MATERIAAL);
  const [uurForm, setUurForm] = useState({
    monteur: monteur || "",
    datum: toDateKey(new Date()),
    uren: "",
    omschrijving: "",
    uurtarief: "",
  });

  useEffect(() => {
    let verouderd = false;

    async function fetchRegels() {
      if (!supabase) {
        setError("Supabase is niet geconfigureerd.");
        return;
      }

      setLoading(true);
      const [materiaalRes, urenRes] = await Promise.all([
        supabase.from("werkbon_materialen").select("*").eq("werkbon_id", werkbonId).order("created_at"),
        supabase.from("werkbon_uren").select("*").eq("werkbon_id", werkbonId).order("datum"),
      ]);

      if (verouderd) return;

      const fout = materiaalRes.error?.message || urenRes.error?.message;
      if (fout) setError(fout);
      else {
        setError(null);
        setMaterialen((materiaalRes.data as WerkbonMateriaal[]) || []);
        setUren((urenRes.data as WerkbonUur[]) || []);
      }
      setLoading(false);
    }

    fetchRegels();

    return () => {
      verouderd = true;
    };
  }, [werkbonId]);

  const totalen = berekenWerkbonTotalen(materialen, uren);

  const handleMateriaalToevoegen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || bezig || !materiaalForm.omschrijving.trim()) return;

    setBezig("materiaal");
    try {
      const { data, error: insertError } = await supabase
        .from("werkbon_materialen")
        .insert({
          werkbon_id: werkbonId,
          omschrijving: materiaalForm.omschrijving.trim(),
          aantal: Number(materiaalForm.aantal) || 1,
          eenheid: materiaalForm.eenheid,
          // Leeg laten betekent: wel op de bon, niet doorbelasten.
          eenheidsprijs: materiaalForm.eenheidsprijs.trim() ? Number(materiaalForm.eenheidsprijs) : null,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }
      setError(null);
      setMaterialen((huidig) => [...huidig, data as WerkbonMateriaal]);
      setMateriaalForm(LEEG_MATERIAAL);
    } finally {
      setBezig(null);
    }
  };

  const handleUurToevoegen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || bezig) return;
    if (!uurForm.monteur.trim() || !Number(uurForm.uren)) {
      setError("Vul een monteur en een aantal uren in.");
      return;
    }

    setBezig("uur");
    try {
      const { data, error: insertError } = await supabase
        .from("werkbon_uren")
        .insert({
          werkbon_id: werkbonId,
          monteur: uurForm.monteur.trim(),
          datum: uurForm.datum,
          uren: Number(uurForm.uren),
          omschrijving: uurForm.omschrijving.trim() || null,
          uurtarief: uurForm.uurtarief.trim() ? Number(uurForm.uurtarief) : null,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }
      setError(null);
      setUren((huidig) => [...huidig, data as WerkbonUur]);
      setUurForm((huidig) => ({ ...huidig, uren: "", omschrijving: "" }));
    } finally {
      setBezig(null);
    }
  };

  const handleVerwijderen = async (tabel: "werkbon_materialen" | "werkbon_uren", id: string) => {
    if (!supabase || bezig) return;

    setBezig(id);
    try {
      const { error: deleteError } = await supabase.from(tabel).delete().eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setError(null);
      if (tabel === "werkbon_materialen") setMaterialen((huidig) => huidig.filter((regel) => regel.id !== id));
      else setUren((huidig) => huidig.filter((regel) => regel.id !== id));
    } finally {
      setBezig(null);
    }
  };

  const invoerKlasse =
    "w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300";

  return (
    <div>
      {error ? (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-slate-400">Bezig met laden...</p> : null}

      <h4 className="text-sm font-semibold text-white">Materiaallijst</h4>
      {materialen.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Nog geen materiaalregels.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {materialen.map((regel) => (
            <li
              key={regel.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-white">{regel.omschrijving}</p>
                <p className="text-xs text-slate-400">
                  {regel.aantal} {regel.eenheid}
                  {regel.eenheidsprijs !== null
                    ? ` × ${formatBedrag(regel.eenheidsprijs)} = ${formatBedrag(
                        Number(regel.aantal) * Number(regel.eenheidsprijs)
                      )}`
                    : " · niet doorbelast"}
                </p>
              </div>
              <button
                onClick={() => handleVerwijderen("werkbon_materialen", regel.id)}
                disabled={bezig === regel.id}
                className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Verwijderen
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleMateriaalToevoegen} className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Omschrijving materiaal"
          value={materiaalForm.omschrijving}
          onChange={(event) => setMateriaalForm((huidig) => ({ ...huidig, omschrijving: event.target.value }))}
          className={`${invoerKlasse} sm:col-span-2`}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            step="0.01"
            aria-label="Aantal"
            placeholder="Aantal"
            value={materiaalForm.aantal}
            onChange={(event) => setMateriaalForm((huidig) => ({ ...huidig, aantal: event.target.value }))}
            className={invoerKlasse}
          />
          <select
            aria-label="Eenheid"
            value={materiaalForm.eenheid}
            onChange={(event) => setMateriaalForm((huidig) => ({ ...huidig, eenheid: event.target.value }))}
            className={invoerKlasse}
          >
            {EENHEDEN.map((eenheid) => (
              <option key={eenheid} value={eenheid}>
                {eenheid}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Prijs per eenheid (leeg = niet doorbelasten)"
          value={materiaalForm.eenheidsprijs}
          onChange={(event) => setMateriaalForm((huidig) => ({ ...huidig, eenheidsprijs: event.target.value }))}
          className={invoerKlasse}
        />
        <button
          type="submit"
          disabled={bezig === "materiaal"}
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {bezig === "materiaal" ? "Bezig met opslaan…" : "Materiaal toevoegen"}
        </button>
      </form>

      <h4 className="mt-8 text-sm font-semibold text-white">Urenregistratie</h4>
      {uren.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Nog geen uren geregistreerd.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {uren.map((regel) => (
            <li
              key={regel.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-white">
                  {regel.monteur} · {formatUren(Number(regel.uren))} uur
                </p>
                <p className="text-xs text-slate-400">
                  {formatDatum(regel.datum)}
                  {regel.omschrijving ? ` · ${regel.omschrijving}` : ""}
                  {regel.uurtarief !== null
                    ? ` · ${formatBedrag(Number(regel.uren) * Number(regel.uurtarief))}`
                    : " · niet doorbelast"}
                </p>
              </div>
              <button
                onClick={() => handleVerwijderen("werkbon_uren", regel.id)}
                disabled={bezig === regel.id}
                className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Verwijderen
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUurToevoegen} className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Monteur"
          value={uurForm.monteur}
          onChange={(event) => setUurForm((huidig) => ({ ...huidig, monteur: event.target.value }))}
          className={invoerKlasse}
        />
        <input
          type="date"
          aria-label="Datum"
          value={uurForm.datum}
          onChange={(event) => setUurForm((huidig) => ({ ...huidig, datum: event.target.value }))}
          className={invoerKlasse}
        />
        <input
          type="number"
          min={0}
          step="0.25"
          placeholder="Aantal uren"
          value={uurForm.uren}
          onChange={(event) => setUurForm((huidig) => ({ ...huidig, uren: event.target.value }))}
          className={invoerKlasse}
        />
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Uurtarief (leeg = niet doorbelasten)"
          value={uurForm.uurtarief}
          onChange={(event) => setUurForm((huidig) => ({ ...huidig, uurtarief: event.target.value }))}
          className={invoerKlasse}
        />
        <input
          type="text"
          placeholder="Omschrijving werkzaamheden"
          value={uurForm.omschrijving}
          onChange={(event) => setUurForm((huidig) => ({ ...huidig, omschrijving: event.target.value }))}
          className={`${invoerKlasse} sm:col-span-2`}
        />
        <button
          type="submit"
          disabled={bezig === "uur"}
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {bezig === "uur" ? "Bezig met opslaan…" : "Uren toevoegen"}
        </button>
      </form>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Materiaalregels", waarde: String(totalen.materiaalRegels) },
          { label: "Materiaal excl. BTW", waarde: formatBedrag(totalen.materiaalBedrag) },
          { label: "Totaal uren", waarde: `${formatUren(totalen.totaalUren)} uur` },
          { label: "Arbeid excl. BTW", waarde: formatBedrag(totalen.arbeidBedrag) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{kpi.label}</dt>
            <dd className="mt-2 text-lg font-semibold text-white">{kpi.waarde}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-slate-300">
        Totaal door te belasten: <span className="font-semibold text-white">{formatBedrag(totalen.totaalExclBtw)}</span>{" "}
        excl. BTW
      </p>
    </div>
  );
}
