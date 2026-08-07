"use client";

import { useEffect } from "react";

/**
 * Vangnet voor onverwachte fouten in de beheeromgeving.
 *
 * Zonder dit bestand nam één kapotte widget de hele pagina mee: Next.js liet
 * dan zijn eigen scherm zien met "This page couldn't load", zonder te vertellen
 * wat er misging of wat je eraan kon doen. Voor een beheerder die midden in een
 * offerte zit is dat een doodlopende weg.
 *
 * Next.js roept dit onderdeel aan bij een fout ergens onder /dashboard, en
 * geeft `reset` mee om het scherm opnieuw op te bouwen zonder de pagina te
 * herladen. De sessie blijft daarbij gewoon staan.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In de serverlogging van Vercel terug te vinden. De digest is het
    // kenmerk waarmee Next.js een productiefout aan een stacktrace koppelt.
    console.error(`[dashboard] onverwachte fout${error.digest ? ` digest=${error.digest}` : ""}`, error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16 text-white sm:px-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300/80">Beheeromgeving</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Er ging iets mis op dit scherm</h1>
        <p className="mt-4 text-slate-400">
          Een onderdeel van het dashboard kon niet geladen worden. Uw gegevens zijn niet gewijzigd en u bent nog
          steeds ingelogd. Probeer het opnieuw; blijft het misgaan, dan helpt het om de melding hieronder door te
          geven.
        </p>

        {error.digest ? (
          <p className="mt-4 rounded-3xl border border-white/10 bg-[#090909] p-4 font-mono text-xs text-slate-400">
            Kenmerk: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="min-h-[44px] rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Opnieuw proberen
          </button>
          <a
            href="/dashboard"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Dashboard herladen
          </a>
        </div>
      </div>
    </main>
  );
}
