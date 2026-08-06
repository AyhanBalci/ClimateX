"use client";

import { useEffect, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyFacturen, getMyLeadAndTicketIds } from "../../lib/portalData";
import { FACTUUR_STATUS_LABELS } from "../../lib/constants";
import { Factuur } from "../../lib/types";
import { formatBedrag, formatDatum } from "../../lib/formatters";

/**
 * De PDF-bibliotheek weegt ruim 400 kB en wordt pas gebruikt zodra iemand op
 * downloaden klikt. Door haar hier op te halen in plaats van bovenaan te
 * importeren, blijft ze buiten de bundel die bij het openen van het scherm laadt.
 */
async function downloadFactuurPdfLui(...argumenten: Parameters<typeof import("../../lib/generateFactuurPdf")["downloadFactuurPdf"]>) {
  const pdfModule = await import("../../lib/generateFactuurPdf");
  pdfModule.downloadFactuurPdf(...argumenten);
}




export default function PortalFacturenPage() {
  const { session } = usePortalSession();
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user.id) return;
      setLoading(true);
      try {
        const { leadIds, ticketIds } = await getMyLeadAndTicketIds(session.user.id);
        const data = await getMyFacturen(leadIds, ticketIds);
        setFacturen(data);
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
        <h2 className="text-xl font-semibold text-white">Mijn facturen</h2>
        <p className="mt-2 text-sm text-slate-400">Bekijk uw facturen en download de PDF.</p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}
        {!loading && facturen.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">U heeft nog geen facturen.</p>
        ) : null}

        <div className="mt-6 space-y-4">
          {facturen.map((factuur) => (
            <div key={factuur.id} className="rounded-3xl border border-white/10 bg-[#090909] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{factuur.factuurnummer}</p>
                  <p className="text-sm text-slate-400">{formatDatum(factuur.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-cyan-300">{formatBedrag(factuur.totaal)}</p>
                  <p className="text-xs text-slate-400">{FACTUUR_STATUS_LABELS[factuur.status] || factuur.status}</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => downloadFactuurPdfLui(factuur)}
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
