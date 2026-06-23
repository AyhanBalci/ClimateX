"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PortalShell from "../../components/portal/PortalShell";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyTickets } from "../../lib/portalData";
import { Vastgoedticket } from "../../lib/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

export default function PortalTicketsPage() {
  const { session } = usePortalSession();
  const [tickets, setTickets] = useState<Vastgoedticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user.id) return;
      setLoading(true);
      try {
        const data = await getMyTickets(session.user.id);
        setTickets(data);
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
        <h2 className="text-xl font-semibold text-white">Mijn meldingen</h2>
        <p className="mt-2 text-sm text-slate-400">Bekijk de status van uw meldingen, foto&apos;s en berichten.</p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}
        {!loading && tickets.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">U heeft nog geen meldingen.</p>
        ) : null}

        <div className="mt-6 space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/portal/tickets/${ticket.id}`}
              className="block rounded-3xl border border-white/10 bg-[#090909] p-5 transition hover:border-cyan-300/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{ticket.ticketnummer}</p>
                  <p className="text-sm text-slate-400">{formatDate(ticket.datum)} &middot; {ticket.locatie}</p>
                </div>
                <p className="text-sm font-semibold text-cyan-300">{ticket.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
