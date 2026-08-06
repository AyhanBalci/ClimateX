"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { Bestand } from "../../lib/types";
import { formatDatumTijd } from "../../lib/formatters";
import { verwijderBestand, verwijderWeesbestand } from "../../lib/bestandVerwijderen";
import {
  ACCEPT_ATTRIBUUT,
  MAX_BESTANDSGROOTTE_MB,
  bestandssoort,
  controleerBestand,
  formatBestandsgrootte,
  isAfbeelding,
  raadMimetypeUitNaam,
  veiligePadnaam,
} from "../../lib/bestanden";

const BUCKET = "climatex-bestanden";

type Props = {
  werkbonId?: string;
  factuurId?: string;
  leadId?: string;
  ticketId?: string;
  categorieen: string[];
};

export default function FileUpload({ werkbonId, factuurId, leadId, ticketId, categorieen }: Props) {
  const [bestanden, setBestanden] = useState<Bestand[]>([]);
  const [categorie, setCategorie] = useState(categorieen[0]);
  const [uploading, setUploading] = useState(false);
  const [verwijderId, setVerwijderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bekijkBestand, setBekijkBestand] = useState<Bestand | null>(null);

  useEffect(() => {
    async function fetchBestanden() {
      if (!supabase) return;

      let query = supabase.from("bestanden").select("*").order("created_at", { ascending: false });
      if (werkbonId) query = query.eq("werkbon_id", werkbonId);
      else if (factuurId) query = query.eq("factuur_id", factuurId);
      else if (ticketId) query = query.eq("ticket_id", ticketId);
      else if (leadId) query = query.eq("lead_id", leadId);

      const { data, error: fetchError } = await query;
      if (fetchError) setError(fetchError.message);
      else setBestanden((data as Bestand[]) || []);
    }

    fetchBestanden();
  }, [werkbonId, factuurId, leadId, ticketId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase || uploading) return;

    // Eerst controleren, dan pas uploaden. Anders is een te groot of verkeerd
    // bestand al onderweg voordat we het kunnen tegenhouden.
    const controle = controleerBestand(file);
    if (!controle.toegestaan) {
      setError(controle.reden);
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    const mimetype = file.type || raadMimetypeUitNaam(file.name);
    const map = werkbonId || factuurId || ticketId || leadId || "overig";
    const path = `${map}/${veiligePadnaam(file.name)}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: mimetype || undefined,
    });

    if (uploadError) {
      setError(`Upload mislukt: ${uploadError.message}`);
      setUploading(false);
      event.target.value = "";
      return;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data, error: insertError } = await supabase
      .from("bestanden")
      .insert({
        werkbon_id: werkbonId || null,
        factuur_id: factuurId || null,
        lead_id: leadId || null,
        ticket_id: ticketId || null,
        categorie,
        bestandsnaam: file.name,
        pad: path,
        url: urlData.publicUrl,
        grootte: file.size,
        mimetype: mimetype || null,
      })
      .select()
      .single();

    if (insertError) {
      // Het bestand staat al in de opslag maar heeft geen regel in de database.
      // Zonder opruimen blijft het als wees achter en is het nergens meer
      // zichtbaar of te verwijderen. Opruimen loopt via de server, want de
      // browser mag sinds de beveiligingsfix niets meer uit de opslag halen.
      await verwijderWeesbestand(path);
      setError(insertError.message);
    } else {
      setBestanden((current) => [data as Bestand, ...current]);
    }
    setUploading(false);
    event.target.value = "";
  };

  const handleDelete = async (bestand: Bestand) => {
    if (!supabase || verwijderId) return;
    const confirmed = window.confirm(`Bestand "${bestand.bestandsnaam}" verwijderen?`);
    if (!confirmed) return;

    setVerwijderId(bestand.id);
    try {
      // De server verwijdert het object en de rij in één stap, achter de
      // dashboardsessie. Het opslagpad wordt daar uit de database gehaald en
      // niet vanuit hier meegestuurd.
      const { error: verwijderFout } = await verwijderBestand(bestand.id);
      if (verwijderFout) {
        setError(verwijderFout);
        return;
      }
      setError(null);
      setBestanden((current) => current.filter((item) => item.id !== bestand.id));
      setBekijkBestand((huidig) => (huidig && huidig.id === bestand.id ? null : huidig));
    } finally {
      setVerwijderId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Categorie van het bestand"
          value={categorie}
          onChange={(event) => setCategorie(event.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
        >
          {categorieen.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="cursor-pointer rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">
          {uploading ? "Bezig met uploaden..." : "+ Bestand uploaden"}
          <input
            type="file"
            accept={ACCEPT_ATTRIBUUT}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-slate-500">Foto&apos;s, PDF&apos;s en documenten tot {MAX_BESTANDSGROOTTE_MB} MB.</p>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {bestanden.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {bestanden.map((bestand) => {
            const afbeelding = isAfbeelding(bestand.bestandsnaam, bestand.mimetype);
            return (
              <li
                key={bestand.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#090909] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {afbeelding ? (
                    <button
                      onClick={() => setBekijkBestand(bestand)}
                      aria-label={`${bestand.bestandsnaam} groter bekijken`}
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40"
                    >
                      <Image
                        src={bestand.url}
                        alt=""
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {bestandssoort(bestand.bestandsnaam, bestand.mimetype)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-white">{bestand.bestandsnaam}</p>
                    <p className="text-xs text-slate-500">
                      {bestand.categorie} · {formatBestandsgrootte(bestand.grootte)} ·{" "}
                      {formatDatumTijd(bestand.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <a
                    href={bestand.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                  >
                    Bekijken
                  </a>
                  <a
                    href={bestand.url}
                    download={bestand.bestandsnaam}
                    className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Downloaden
                  </a>
                  <button
                    onClick={() => handleDelete(bestand)}
                    disabled={verwijderId === bestand.id}
                    aria-label={`${bestand.bestandsnaam} verwijderen`}
                    className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verwijderId === bestand.id ? "Bezig…" : "Verwijderen"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Nog geen bestanden geüpload.</p>
      )}

      {bekijkBestand ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Voorbeeld van ${bekijkBestand.bestandsnaam}`}
          onClick={() => setBekijkBestand(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-full max-w-3xl overflow-auto rounded-3xl border border-white/10 bg-slate-950 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm text-white">{bekijkBestand.bestandsnaam}</p>
              <button
                onClick={() => setBekijkBestand(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
              >
                Sluiten
              </button>
            </div>
            <div className="relative mt-3 h-[60vh] w-full">
              <Image
                src={bekijkBestand.url}
                alt={bekijkBestand.bestandsnaam}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
