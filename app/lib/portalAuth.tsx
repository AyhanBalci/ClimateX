"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";

type PortalAuthContextValue = {
  session: Session | null;
  loading: boolean;
};

const PortalAuthContext = createContext<PortalAuthContextValue>({ session: null, loading: true });

export function usePortalSession() {
  return useContext(PortalAuthContext);
}

/**
 * Leest een inlogfout uit de terugkeer-URL van Supabase.
 *
 * Bij een verlopen of al gebruikte link stuurt Supabase de klant terug met
 * error-parameters. Die staan afhankelijk van de gekozen flow in de query of
 * in het hash-gedeelte, dus we kijken op beide plekken. Zonder dit belandde de
 * klant op een leeg inlogscherm zonder te weten waarom hij niet binnen was.
 */
function leesInlogfout(): string | null {
  if (typeof window === "undefined") return null;

  const uitQuery = new URLSearchParams(window.location.search);
  const uitHash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = uitQuery.get("error_code") || uitHash.get("error_code");
  const fout = uitQuery.get("error") || uitHash.get("error");

  if (!code && !fout) return null;
  // Alleen de soort doorgeven, nooit de omschrijving uit de URL: die komt van
  // buiten en hoort niet ongefilterd op het scherm te belanden.
  if (code === "otp_expired") return "verlopen";
  return "mislukt";
}

/**
 * Houdt de portaalsessie bij en stelt die beschikbaar aan de hele boom.
 *
 * Deze provider hoort in de layout van /portal te staan, dus BOVEN de
 * pagina's. Eerder zat hij in PortalAuthGuard, die door PortalShell werd
 * gerenderd; PortalShell is op zijn beurt het resultaat van een pagina.
 * Daardoor stond de provider onder de pagina in de boom en las elke pagina de
 * standaardwaarde van de context uit: session bleef null, ook bij een prima
 * ingelogde klant. De pagina's stopten dan met laden voordat ze begonnen
 * waren en bleven eindeloos "Bezig met laden..." tonen.
 */
export function PortalSessieProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    // Zonder configuratie blijft loading op false staan (zie useState
    // hierboven), zodat de guard meteen een nette melding kan tonen in plaats
    // van een oneindige laadtekst.
    if (!isSupabaseConfigured || !supabase) return;

    let verouderd = false;

    supabase.auth.getSession().then(({ data }) => {
      if (verouderd) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nieuweSessie) => {
      setSession(nieuweSessie);
      setLoading(false);
    });

    return () => {
      verouderd = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return <PortalAuthContext.Provider value={{ session, loading }}>{children}</PortalAuthContext.Provider>;
}

/**
 * Bewaakt de beveiligde portaalpagina's: wie niet is ingelogd gaat naar de
 * inlogpagina, met de reden erbij als de link verlopen was.
 */
export function PortalAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, loading } = usePortalSession();

  useEffect(() => {
    if (loading || session) return;
    const fout = leesInlogfout();
    router.replace(fout ? `/portal/login?fout=${fout}` : "/portal/login");
  }, [loading, session, router]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <p className="max-w-md text-center text-sm text-slate-400">
          Het klantenportaal is op dit moment niet beschikbaar. Probeer het later opnieuw of neem contact met ons
          op via 06 1400 4488.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-sm text-slate-400">Bezig met laden...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

export async function portalSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
