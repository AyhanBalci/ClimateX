"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Bestand } from "../../lib/types";

const BUCKET = "climatex-bestanden";

type Props = {
  werkbonId?: string;
  factuurId?: string;
  leadId?: string;
  categorieen: string[];
};

export default function FileUpload({ werkbonId, factuurId, leadId, categorieen }: Props) {
  const [bestanden, setBestanden] = useState<Bestand[]>([]);
  const [categorie, setCategorie] = useState(categorieen[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBestanden() {
      if (!supabase) return;

      let query = supabase.from("bestanden").select("*").order("created_at", { ascending: false });
      if (werkbonId) query = query.eq("werkbon_id", werkbonId);
      else if (factuurId) query = query.eq("factuur_id", factuurId);
      else if (leadId) query = query.eq("lead_id", leadId);

      const { data, error: fetchError } = await query;
      if (fetchError) setError(fetchError.message);
      else setBestanden((data as Bestand[]) || []);
    }

    fetchBestanden();
  }, [werkbonId, factuurId, leadId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    setError(null);

    const path = `${werkbonId || factuurId || leadId || "overig"}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);

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
        categorie,
        bestandsnaam: file.name,
        pad: path,
        url: urlData.publicUrl,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setBestanden((current) => [data as Bestand, ...current]);
    }
    setUploading(false);
    event.target.value = "";
  };

  const handleDelete = async (bestand: Bestand) => {
    if (!supabase) return;
    const confirmed = window.confirm(`Bestand "${bestand.bestandsnaam}" verwijderen?`);
    if (!confirmed) return;

    await supabase.storage.from(BUCKET).remove([bestand.pad]);
    const { error: deleteError } = await supabase.from("bestanden").delete().eq("id", bestand.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setBestanden((current) => current.filter((item) => item.id !== bestand.id));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
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
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}

      {bestanden.length > 0 ? (
        <div className="mt-4 space-y-2">
          {bestanden.map((bestand) => (
            <div
              key={bestand.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090909] p-3 text-sm"
            >
              <a href={bestand.url} target="_blank" rel="noreferrer" className="truncate text-cyan-300 hover:underline">
                {bestand.bestandsnaam}
              </a>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">{bestand.categorie}</span>
                <button
                  onClick={() => handleDelete(bestand)}
                  className="rounded-full bg-rose-500/10 px-2 py-1 text-xs text-rose-300 transition hover:bg-rose-500/20"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Nog geen bestanden geüpload.</p>
      )}
    </div>
  );
}
