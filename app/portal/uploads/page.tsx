"use client";

import { useEffect, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import PortalFileUpload from "../../components/portal/PortalFileUpload";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyLeadAndTicketIds } from "../../lib/portalData";
import { KLANT_UPLOAD_CATEGORIE_OPTIONS } from "../../lib/constants";

export default function PortalUploadsPage() {
  const { session } = usePortalSession();
  const [leadId, setLeadId] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIds() {
      if (!session?.user.id) return;
      setLoading(true);
      const { leadIds, ticketIds } = await getMyLeadAndTicketIds(session.user.id);
      setLeadId(leadIds[0] || null);
      setTicketId(ticketIds[0] || null);
      setLoading(false);
    }
    fetchIds();
  }, [session?.user.id]);

  return (
    <PortalShell>
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Foto&apos;s uploaden</h2>
        <p className="mt-2 text-sm text-slate-400">
          Voeg foto&apos;s toe van uw binnenruimte, buitenmuur, meterkast, de gewenste plek voor de airco, of overige foto&apos;s.
        </p>

        {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

        {!loading && !leadId && !ticketId ? (
          <p className="mt-6 text-sm text-slate-400">
            Er is nog geen aanvraag aan uw account gekoppeld. Neem contact met ons op als u foto&apos;s wilt aanleveren.
          </p>
        ) : null}

        {!loading && session?.user.id && (leadId || ticketId) ? (
          <div className="mt-6">
            <PortalFileUpload
              userId={session.user.id}
              leadId={leadId || undefined}
              ticketId={leadId ? undefined : ticketId || undefined}
              categorieen={KLANT_UPLOAD_CATEGORIE_OPTIONS}
            />
          </div>
        ) : null}
      </section>
    </PortalShell>
  );
}
