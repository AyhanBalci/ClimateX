"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CheckCircle2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { supabase } from "../../lib/supabase";

const BUCKET = "climatex-bestanden";

type FotoCategorie = "Meterkast" | "Parkeerplaats";

export default function MeterkastCheck() {
  const [naam, setNaam] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [meterkastFoto, setMeterkastFoto] = useState<File | null>(null);
  const [parkeerplaatsFoto, setParkeerplaatsFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFile = (categorie: FotoCategorie) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (categorie === "Meterkast") setMeterkastFoto(file);
    else setParkeerplaatsFoto(file);
  };

  const uploadFoto = async (leadId: string, categorie: FotoCategorie, file: File) => {
    if (!supabase) return;
    const path = `meterkastcheck/${leadId}/${Date.now()}-${categorie.toLowerCase()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: insertError } = await supabase.from("bestanden").insert({
      lead_id: leadId,
      categorie,
      bestandsnaam: file.name,
      pad: path,
      url: urlData.publicUrl,
      zichtbaar_voor_klant: false,
    });
    if (insertError) throw new Error(insertError.message);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!naam.trim() || !telefoon.trim() || !email.trim() || !postcode.trim()) {
      setError("Vul uw naam, telefoonnummer, e-mailadres en postcode in.");
      return;
    }
    if (!meterkastFoto && !parkeerplaatsFoto) {
      setError("Voeg minimaal één foto toe (meterkast of parkeerplaats).");
      return;
    }
    if (!supabase) {
      setError("Supabase is niet geconfigureerd.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: naam,
          phone: telefoon,
          email,
          postcode,
          woningType: "Gezinswoning",
          bericht: "Aanvraag gratis meterkastbeoordeling (Meterkastcheck op de website).",
          source: "meterkastcheck",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Aanvraag versturen is mislukt.");
      }

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email.trim())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (leadError || !lead) throw new Error("Lead kon niet worden gevonden voor foto-koppeling.");

      if (meterkastFoto) await uploadFoto(lead.id, "Meterkast", meterkastFoto);
      if (parkeerplaatsFoto) await uploadFoto(lead.id, "Parkeerplaats", parkeerplaatsFoto);

      setSuccess(true);
      setNaam("");
      setTelefoon("");
      setEmail("");
      setPostcode("");
      setMeterkastFoto(null);
      setParkeerplaatsFoto(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/5 p-10 text-center shadow-2xl shadow-black/30">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
        <h3 className="mt-4 text-xl font-semibold text-white">Bedankt! Uw foto&apos;s zijn ontvangen.</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Onze installateurs bekijken uw situatie en nemen binnen 24 uur contact met u op met een gratis beoordeling en advies.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10"
        >
          Nog een aanvraag indienen
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <UploadCloud className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Meterkastcheck</p>
          <p className="text-sm text-slate-400">Upload foto&apos;s, wij beoordelen uw situatie gratis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Naam"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
          />
          <input
            type="tel"
            placeholder="Telefoonnummer"
            value={telefoon}
            onChange={(e) => setTelefoon(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
          />
          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
          />
          <input
            type="text"
            placeholder="Postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
          />
        </div>

        <div className="grid gap-4">
          {([
            { label: "Foto meterkast", file: meterkastFoto, categorie: "Meterkast" as const },
            { label: "Foto parkeerplaats", file: parkeerplaatsFoto, categorie: "Parkeerplaats" as const },
          ]).map((item) => (
            <label
              key={item.categorie}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-4 text-sm text-slate-300 transition hover:border-cyan-300/40"
            >
              <span className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-slate-500" />
                {item.file ? item.file.name : item.label}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-cyan-300">Kiezen</span>
              <input type="file" accept="image/*" onChange={handleFile(item.categorie)} className="hidden" />
            </label>
          ))}
        </div>

        {error ? <p className="lg:col-span-2 text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="lg:col-span-2 rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {submitting ? "Bezig met versturen..." : "Vraag gratis beoordeling aan"}
        </button>
        <p className="lg:col-span-2 text-xs leading-5 text-slate-500">
          Uw foto&apos;s worden rechtstreeks en veilig naar ons team verstuurd voor een vrijblijvende beoordeling.
        </p>
      </form>
    </div>
  );
}
