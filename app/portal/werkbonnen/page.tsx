"use client";

import { useEffect, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyLeadAndTicketIds, getMyWerkbonnen } from "../../lib/portalData";
import { downloadWerkbonPdf } from "../../lib/generateWerkbonPdf";
import { Werkbon } from "../../lib/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

const STATUS_LABEL: Record<string, string> = {
  Concept: "Wordt voorbereid",
  Gepland: "Ingepland",
  Onderweg: "Monteur onderweg",
  Bezig: "Werk in uitvoering",
  Gereed: "Werk afgerond",
  Gefactureerd: "Afgerond en gefactureerd",
};

export default function PortalWerkbonnenPage() {
  const { session } = usePortalSession();
  const [werkbonnen, setWerkbonnen] = useState<Werkbon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user.id) return;
      setLoading(true);
      try {
        const { leadIds, ticketIds } = await getMyLeadAndTicketIds(session.user.id);
        const data = await getMyWerkbonnen(leadIds, ticketIds);
        setWerkbonnen(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout.");
      }
      setLoading(false);
    }
    fetchData();
  }, [session?.user.id]);

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Mijn werkbonnen</h2>
        <p className="mt-2 text-sm text-slate-400">Bekijk de status en geplande datum van uw werkbonnen.</p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}
        {!loading && werkbonnen.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">U heeft nog geen werkbonnen.</p>
        ) : null}

        <div className="mt-6 space-y-4">
          {werkbonnen.map((werkbon) => (
            <div key={werkbon.id} className="rounded-3xl border border-white/10 bg-[#090909] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{werkbon.werkbonnummer}</p>
                  <p className="text-sm text-slate-400">Gepland op {formatDate(werkbon.datum)}</p>
                </div>
                <p className="text-sm font-semibold text-cyan-300">{STATUS_LABEL[werkbon.status] || werkbon.status}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => downloadWerkbonPdf(werkbon)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  PDF downloaden
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
