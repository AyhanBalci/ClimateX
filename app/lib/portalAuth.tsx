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

export function PortalAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (!data.session) {
        const fout = leesInlogfout();
        router.replace(fout ? `/portal/login?fout=${fout}` : "/portal/login");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        const fout = leesInlogfout();
        router.replace(fout ? `/portal/login?fout=${fout}` : "/portal/login");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

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

  return <PortalAuthContext.Provider value={{ session, loading }}>{children}</PortalAuthContext.Provider>;
}

export async function portalSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
