"use client";

/**
 * Gedeelde statusweergave voor de portaalpagina's.
 *
 * Alle drie de overzichten toonden bij een mislukte query hooguit een kale
 * regel tekst, en bij een lege lijst niets bijzonders. Door dit op één plek te
 * regelen krijgt de klant overal dezelfde, begrijpelijke boodschap en is er
 * altijd een weg vooruit.
 */

export function PortalLaden({ wat }: { wat: string }) {
  return (
    <p role="status" aria-live="polite" className="mt-6 text-sm text-slate-400">
      Bezig met het ophalen van uw {wat}...
    </p>
  );
}

export function PortalFout({ wat, onOpnieuw }: { wat: string; onOpnieuw: () => void }) {
  return (
    <div role="alert" className="mt-6 rounded-3xl border border-amber-300/30 bg-amber-400/5 p-5">
      <p className="text-sm font-semibold text-amber-200">Uw {wat} konden niet geladen worden</p>
      <p className="mt-1 text-sm text-amber-100/80">
        Er ging iets mis bij het ophalen van uw gegevens. Uw gegevens zijn niet gewijzigd. Probeer het opnieuw;
        blijft het misgaan, bel ons dan gerust op 06 1400 4488.
      </p>
      <button
        onClick={onOpnieuw}
        className="mt-4 min-h-[44px] rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}

export function PortalLeeg({ tekst }: { tekst: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-[#090909] p-5">
      <p className="text-sm text-slate-400">{tekst}</p>
    </div>
  );
}
