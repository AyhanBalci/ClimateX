"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { portaalTerugkeerUrl } from "../../lib/siteUrl";

function PortalLoginFormulier() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reden waarom de klant hier terechtkwam, doorgegeven door PortalAuthGuard
  // nadat Supabase een verlopen of ongeldige link afwees.
  const zoekParameters = useSearchParams();
  const linkFout = zoekParameters.get("fout");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
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
        // Niet window.location.origin: een klant die op climate-x.nl zonder
        // www binnenkomt zou dan een tweede adres opleveren dat óók in de
        // Supabase-allowlist moet staan. Eén vast adres houdt die lijst kort.
        emailRedirectTo: portaalTerugkeerUrl(),
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

        {linkFout && !sent ? (
          <div className="mt-6 rounded-3xl border border-amber-300/30 bg-amber-400/10 p-5 text-sm text-amber-100">
            {linkFout === "verlopen" ? (
              <>
                <p className="font-semibold text-amber-200">Deze inloglink is verlopen</p>
                <p className="mt-1">
                  Een inloglink is beperkt geldig en kan maar één keer gebruikt worden. Vul hieronder uw
                  e-mailadres in, dan sturen wij direct een nieuwe link.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-amber-200">Inloggen via de link is niet gelukt</p>
                <p className="mt-1">
                  Vul hieronder uw e-mailadres in om een nieuwe inloglink te ontvangen.
                </p>
              </>
            )}
          </div>
        ) : null}

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
                required
                autoComplete="email"
                aria-invalid={error ? true : undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-rose-400">
                {error}
              </p>
            ) : null}
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

/**
 * useSearchParams vereist een Suspense-grens; zonder die grens weigert de
 * build deze pagina statisch te genereren.
 */
export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <p className="text-sm text-slate-400">Bezig met laden...</p>
        </main>
      }
    >
      <PortalLoginFormulier />
    </Suspense>
  );
}
