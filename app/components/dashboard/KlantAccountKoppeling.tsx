"use client";

import { useState } from "react";

type Props = {
  naam: string;
  email?: string;
  leadId?: string;
  ticketId?: string;
  klantUserId?: string | null;
};

export default function KlantAccountKoppeling({ naam, email: emailProp, leadId, ticketId, klantUserId }: Props) {
  const [email, setEmail] = useState(emailProp || "");
  const [adminWachtwoord, setAdminWachtwoord] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callInvite = async (sendEmail: boolean) => {
    if (!adminWachtwoord) {
      setError("Vul het dashboardwachtwoord in om deze actie te bevestigen.");
      return;
    }
    if (!email) {
      setError("Deze klant heeft geen e-mailadres.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/portal/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-admin-secret": adminWachtwoord },
        body: JSON.stringify({ email, naam, leadId, ticketId, sendEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Actie is mislukt.");
      } else {
        setLink(data.link);
        if (sendEmail) {
          setMessage(
            data.emailVerstuurd
              ? "Uitnodiging is verstuurd per e-mail."
              : `E-mail versturen is niet gelukt${data.emailError ? `: ${data.emailError}` : ""}. Gebruik de link hieronder.`
          );
        } else {
          setMessage("Klantaccount is aangemaakt. Gebruik de link hieronder om de klant toegang te geven.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#090909] p-5">
      <h4 className="text-sm font-semibold text-white">Klantenportaal</h4>
      {klantUserId ? (
        <p className="mt-2 text-xs text-emerald-300">Deze klant heeft al toegang tot het klantenportaal.</p>
      ) : (
        <p className="mt-2 text-xs text-slate-400">Deze klant heeft nog geen toegang tot het klantenportaal.</p>
      )}

      <div className="mt-3 space-y-2">
        <input
          type="email"
          placeholder="E-mailadres van de klant"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white outline-none focus:border-cyan-300"
        />
        <input
          type="password"
          placeholder="Dashboardwachtwoord ter bevestiging"
          value={adminWachtwoord}
          onChange={(event) => setAdminWachtwoord(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white outline-none focus:border-cyan-300"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => callInvite(false)}
          disabled={busy}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          Klantaccount aanmaken
        </button>
        <button
          onClick={() => callInvite(true)}
          disabled={busy}
          className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          Portal uitnodiging sturen
        </button>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
      {message ? <p className="mt-2 text-xs text-cyan-300">{message}</p> : null}
      {link ? (
        <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 p-2">
          <p className="break-all text-xs text-slate-300">{link}</p>
        </div>
      ) : null}
    </div>
  );
}
