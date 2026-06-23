"use client";

import { FormEvent, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Vul uw e-mailadres in.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError("De inlogomgeving is momenteel niet beschikbaar.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/portal/dashboard`,
      },
    });

    setLoading(false);

    if (otpError) {
      setError("Het versturen van de inloglink is mislukt. Probeer het later opnieuw.");
      return;
    }

    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">ClimateX Klantenportaal</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Inloggen</h1>
        <p className="mt-4 text-sm text-slate-400">
          Vul uw e-mailadres in. U ontvangt direct een inloglink per e-mail — een wachtwoord is niet nodig.
        </p>

        {sent ? (
          <div className="mt-8 rounded-3xl border border-cyan-300/30 bg-cyan-400/10 p-5 text-sm text-cyan-200">
            Bekijk uw e-mail. Wij hebben een inloglink gestuurd naar <strong>{email}</strong>. Klik op de link om
            direct ingelogd te worden.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm text-slate-300">
              E-mailadres
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
            </label>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading ? "Bezig met versturen..." : "Stuur inloglink"}
            </button>
          </form>
        )}

        <p className="mt-8 text-xs text-slate-500">
          Heeft u nog geen toegang tot het klantenportaal? Neem contact met ons op via 06 1400 4488.
        </p>
      </div>
    </main>
  );
}
