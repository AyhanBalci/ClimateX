"use client";

import { useEffect, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyLeadAndTicketIds, getMyOffertes } from "../../lib/portalData";
import { klantAccepteerOfferte } from "../../lib/klantOfferteActions";
import { downloadOffertePdf } from "../../lib/generateOffertePdf";
import { Offerte } from "../../lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("nl-NL");
}

const STATUS_LABEL: Record<string, string> = {
  Concept: "Wordt voorbereid",
  Verstuurd: "Wacht op uw akkoord",
  Geaccepteerd: "Akkoord gegeven",
  Afgewezen: "Afgewezen",
};

export default function PortalOffertesPage() {
  const { session } = usePortalSession();
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchOffertes() {
    if (!session?.user.id) return;
    setLoading(true);
    try {
      const { leadIds, ticketIds } = await getMyLeadAndTicketIds(session.user.id);
      const data = await getMyOffertes(leadIds, ticketIds);
      setOffertes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    }
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      if (!session?.user.id) return;
      setLoading(true);
      try {
        const { leadIds, ticketIds } = await getMyLeadAndTicketIds(session.user.id);
        const data = await getMyOffertes(leadIds, ticketIds);
        setOffertes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout.");
      }
      setLoading(false);
    }
    load();
  }, [session?.user.id]);

  const handleAkkoord = async (offerteId: string) => {
    setBusyId(offerteId);
    setError(null);
    const { error: akkoordError } = await klantAccepteerOfferte(offerteId);
    if (akkoordError) {
      setError("Het akkoord geven is niet gelukt. Probeer het opnieuw of neem contact met ons op.");
    } else {
      await fetchOffertes();
    }
    setBusyId(null);
  };

  const handleDownload = (offerte: Offerte) => {
    if (offerte.leads) {
      downloadOffertePdf(offerte, {
        naam: offerte.leads.naam,
        telefoon: offerte.leads.telefoon,
        email: offerte.leads.email,
        plaats: offerte.leads.plaats,
        type_woning: offerte.leads.type_woning,
      });
    } else if (offerte.vastgoedtickets) {
      downloadOffertePdf(offerte, {
        naam: offerte.vastgoedtickets.klant,
        telefoon: offerte.vastgoedtickets.telefoonnummer || "",
        email: "",
        plaats: offerte.vastgoedtickets.locatie,
        type_woning: "",
      });
    }
  };

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Mijn offertes</h2>
        <p className="mt-2 text-sm text-slate-400">Bekijk uw offertes, download de PDF of geef akkoord.</p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}

        {!loading && offertes.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">U heeft nog geen offertes.</p>
        ) : null}

        <div className="mt-6 space-y-4">
          {offertes.map((offerte) => (
            <div key={offerte.id} className="rounded-3xl border border-white/10 bg-[#090909] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{offerte.offertenummer}</p>
                  <p className="text-sm text-slate-400">{formatDate(offerte.datum)} &middot; {offerte.merk} {offerte.model}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-cyan-300">{formatCurrency(offerte.prijs)}</p>
                  <p className="text-xs text-slate-400">{STATUS_LABEL[offerte.status] || offerte.status}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleDownload(offerte)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  PDF downloaden
                </button>
                {offerte.status === "Verstuurd" ? (
                  <button
                    onClick={() => handleAkkoord(offerte.id)}
                    disabled={busyId === offerte.id}
                    className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {busyId === offerte.id ? "Bezig..." : "Akkoord geven"}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
