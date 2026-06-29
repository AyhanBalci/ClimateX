"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "../../components/portal/PortalShell";
import { usePortalSession } from "../../lib/portalAuth";
import { supabase } from "../../lib/supabase";
import { createStoringAlsKlant } from "../../lib/ticketActions";
import { VASTGOEDTICKET_PRIORITEIT_OPTIONS } from "../../lib/constants";

export default function PortalStoringPage() {
  const { session } = usePortalSession();
  const router = useRouter();
  const [klantNaam, setKlantNaam] = useState("");
  const [form, setForm] = useState({
    locatie: "",
    telefoonnummer: "",
    prioriteit: "Normaal",
    omschrijving: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiel() {
      if (!session?.user.id || !supabase) return;
      const { data } = await supabase
        .from("klantprofielen")
        .select("naam, telefoon")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) {
        setKlantNaam(data.naam || "");
        setForm((current) => ({ ...current, telefoonnummer: data.telefoon || "" }));
      }
    }
    fetchProfiel();
  }, [session?.user.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user.id) return;

    if (!form.locatie.trim() || !form.omschrijving.trim()) {
      setError("Vul minimaal de locatie en een omschrijving van de storing in.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const { data, error: createError } = await createStoringAlsKlant({
      klantUserId: session.user.id,
      klant: klantNaam || session.user.email || "Klant",
      locatie: form.locatie.trim(),
      telefoonnummer: form.telefoonnummer.trim(),
      prioriteit: form.prioriteit,
      omschrijving: form.omschrijving.trim(),
    });
    setSubmitting(false);

    if (createError || !data) {
      setError(createError || "Storing melden is mislukt.");
      return;
    }

    setSuccess(`Uw storing is gemeld onder nummer ${data.ticketnummer}. Wij nemen zo snel mogelijk contact met u op.`);
    setForm({ locatie: "", telefoonnummer: form.telefoonnummer, prioriteit: "Normaal", omschrijving: "" });
    setTimeout(() => router.push(`/portal/tickets/${data.id}`), 1500);
  };

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Storing melden</h2>
        <p className="mt-2 text-sm text-slate-400">
          Heeft u een storing aan uw laadpaal? Meld dit hier en wij plannen zo snel mogelijk een servicebezoek in.
        </p>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Locatie / adres laadpaal"
            value={form.locatie}
            onChange={(event) => setForm((current) => ({ ...current, locatie: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <input
            type="text"
            placeholder="Telefoonnummer voor contact"
            value={form.telefoonnummer}
            onChange={(event) => setForm((current) => ({ ...current, telefoonnummer: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <select
            value={form.prioriteit}
            onChange={(event) => setForm((current) => ({ ...current, prioriteit: event.target.value }))}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          >
            {VASTGOEDTICKET_PRIORITEIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <textarea
            rows={4}
            placeholder="Omschrijf de storing, bijv. laadpaal laadt niet op of geeft een foutmelding"
            value={form.omschrijving}
            onChange={(event) => setForm((current) => ({ ...current, omschrijving: event.target.value }))}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 sm:col-span-2"
          >
            {submitting ? "Bezig met melden..." : "Storing melden"}
          </button>
        </form>
      </section>
    </PortalShell>
  );
}
