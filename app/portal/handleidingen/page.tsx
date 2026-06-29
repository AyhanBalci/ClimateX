"use client";

import { useEffect, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import { supabase } from "../../lib/supabase";
import { Product } from "../../lib/types";

export default function PortalHandleidingenPage() {
  const [producten, setProducten] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHandleidingen() {
      if (!supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("producten")
        .select("*")
        .not("handleiding_url", "is", null)
        .order("merk", { ascending: true });

      if (fetchError) setError(fetchError.message);
      else setProducten((data as Product[]) || []);
      setLoading(false);
    }
    fetchHandleidingen();
  }, []);

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Handleidingen</h2>
        <p className="mt-2 text-sm text-slate-400">Bekijk de handleiding van uw laadpaal.</p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}
        {!loading && !error && producten.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">Er zijn nog geen handleidingen beschikbaar.</p>
        ) : null}

        <div className="mt-6 space-y-3">
          {producten.map((product) => (
            <a
              key={product.id}
              href={product.handleiding_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#090909] p-4 transition hover:border-cyan-300/40"
            >
              <div>
                <p className="font-semibold text-white">{product.merk} {product.model}</p>
                <p className="mt-1 text-sm text-slate-400">Handleiding bekijken</p>
              </div>
              <span aria-hidden="true" className="text-cyan-300">→</span>
            </a>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
