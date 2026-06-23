"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Bestand } from "../../lib/types";

const BUCKET = "climatex-bestanden";

type Props = {
  userId: string;
  categorieen: string[];
  leadId?: string;
  ticketId?: string;
};

export default function PortalFileUpload({ userId, categorieen, leadId, ticketId }: Props) {
  const [bestanden, setBestanden] = useState<Bestand[]>([]);
  const [categorie, setCategorie] = useState(categorieen[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBestanden() {
      if (!supabase) return;
      let query = supabase.from("bestanden").select("*").order("created_at", { ascending: false });
      if (ticketId) query = query.eq("ticket_id", ticketId);
      else if (leadId) query = query.eq("lead_id", leadId);

      const { data, error: fetchError } = await query;
      if (fetchError) setError(fetchError.message);
      else setBestanden((data as Bestand[]) || []);
    }
    fetchBestanden();
  }, [leadId, ticketId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    setError(null);

    const path = `klant-uploads/${userId}/${ticketId || leadId || "algemeen"}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);

    if (uploadError) {
      setError(`Uploaden is mislukt: ${uploadError.message}`);
      setUploading(false);
      event.target.value = "";
      return;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data, error: insertError } = await supabase
      .from("bestanden")
      .insert({
        lead_id: leadId || null,
        ticket_id: ticketId || null,
        categorie,
        bestandsnaam: file.name,
        pad: path,
        url: urlData.publicUrl,
        zichtbaar_voor_klant: true,
      })
      .select()
      .single();

    if (insertError) {
      setError(`Opslaan is mislukt: ${insertError.message}`);
    } else {
      setBestanden((current) => [data as Bestand, ...current]);
    }
    setUploading(false);
    event.target.value = "";
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
          {uploading ? "Bezig met uploaden..." : "+ Foto uploaden"}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}

      {bestanden.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bestanden.map((bestand) => (
            <a
              key={bestand.id}
              href={bestand.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-[#090909] p-2 text-xs text-slate-300 hover:border-cyan-300/40"
            >
              <p className="truncate text-cyan-300">{bestand.bestandsnaam}</p>
              <p className="mt-1 text-slate-500">{bestand.categorie}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Nog geen foto&apos;s geüpload.</p>
      )}
    </div>
  );
}
