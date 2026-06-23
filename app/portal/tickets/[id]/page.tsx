"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PortalShell from "../../../components/portal/PortalShell";
import PortalFileUpload from "../../../components/portal/PortalFileUpload";
import { usePortalSession } from "../../../lib/portalAuth";
import { addTicketBericht, getMyTicketById, getTicketBerichten } from "../../../lib/portalData";
import { TICKET_FOTO_CATEGORIE_OPTIONS } from "../../../lib/constants";
import { TicketKlantBericht, Vastgoedticket } from "../../../lib/types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
}

export default function PortalTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;
  const { session } = usePortalSession();

  const [ticket, setTicket] = useState<Vastgoedticket | null>(null);
  const [berichten, setBerichten] = useState<TicketKlantBericht[]>([]);
  const [nieuwBericht, setNieuwBericht] = useState("");
  const [loading, setLoading] = useState(true);
  const [versturen, setVersturen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    try {
      const [ticketData, berichtenData] = await Promise.all([
        getMyTicketById(ticketId),
        getTicketBerichten(ticketId),
      ]);
      setTicket(ticketData);
      setBerichten(berichtenData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    }
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ticketData, berichtenData] = await Promise.all([
          getMyTicketById(ticketId),
          getTicketBerichten(ticketId),
        ]);
        setTicket(ticketData);
        setBerichten(berichtenData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout.");
      }
      setLoading(false);
    }
    load();
  }, [ticketId]);

  const handleBerichtVersturen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nieuwBericht.trim() || !session?.user.id) return;
    setVersturen(true);
    const { error: berichtError } = await addTicketBericht(ticketId, session.user.id, nieuwBericht.trim());
    if (berichtError) {
      setError("Het versturen van uw bericht is mislukt.");
    } else {
      setNieuwBericht("");
      await fetchAll();
    }
    setVersturen(false);
  };

  if (loading) {
    return (
      <PortalShell>
        <p className="text-sm text-slate-400">Bezig met laden...</p>
      </PortalShell>
    );
  }

  if (!ticket) {
    return (
      <PortalShell>
        <p className="text-sm text-rose-400">Deze melding is niet gevonden.</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">{ticket.ticketnummer}</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{ticket.locatie}</h2>
        <p className="mt-2 text-sm text-slate-400">{ticket.omschrijving}</p>
        <p className="mt-4 inline-block rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
          Status: {ticket.status}
        </p>
        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Foto&apos;s</h3>
        <p className="mt-2 text-sm text-slate-400">Hier vindt u foto&apos;s van deze melding en kunt u zelf foto&apos;s toevoegen.</p>
        <div className="mt-4">
          {session?.user.id ? (
            <PortalFileUpload userId={session.user.id} ticketId={ticket.id} categorieen={TICKET_FOTO_CATEGORIE_OPTIONS} />
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Berichten</h3>
        <div className="mt-4 space-y-3">
          {berichten.length === 0 ? (
            <p className="text-sm text-slate-400">Nog geen berichten.</p>
          ) : (
            berichten.map((bericht) => (
              <div key={bericht.id} className="rounded-2xl border border-white/10 bg-[#090909] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDateTime(bericht.created_at)}</p>
                <p className="mt-2 text-sm text-slate-200">{bericht.tekst}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleBerichtVersturen} className="mt-5 space-y-3">
          <textarea
            value={nieuwBericht}
            onChange={(event) => setNieuwBericht(event.target.value)}
            placeholder="Schrijf hier uw bericht..."
            rows={3}
            className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <button
            type="submit"
            disabled={versturen || !nieuwBericht.trim()}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {versturen ? "Bezig met versturen..." : "Bericht versturen"}
          </button>
        </form>
      </section>
    </PortalShell>
  );
}
