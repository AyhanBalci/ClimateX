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
        router.replace("/portal/login");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        router.replace("/portal/login");
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
