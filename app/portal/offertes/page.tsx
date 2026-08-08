"use client";

import { useEffect, useState } from "react";
import PortalShell from "../../components/portal/PortalShell";
import { PortalFout, PortalLaden, PortalLeeg } from "../../components/portal/PortalStatus";
import { usePortalSession } from "../../lib/portalAuth";
import { getMyLeadAndTicketIds, getMyOffertes } from "../../lib/portalData";
import { klantAccepteerOfferte } from "../../lib/klantOfferteActions";
import { AKKOORDTEKST } from "../../lib/offerteAcceptatie";
import { Offerte } from "../../lib/types";
import { formatBedragRond, formatDatum, formatDatumTijd } from "../../lib/formatters";
import { offerteStatusWeergave } from "../../lib/offerteStatus";

/**
 * De PDF-bibliotheek weegt ruim 400 kB en wordt pas gebruikt zodra iemand op
 * downloaden klikt. Door haar hier op te halen in plaats van bovenaan te
 * importeren, blijft ze buiten de bundel die bij het openen van het scherm laadt.
 */
async function downloadOffertePdfLui(...argumenten: Parameters<typeof import("../../lib/generateOffertePdf")["downloadOffertePdf"]>) {
  const pdfModule = await import("../../lib/generateOffertePdf");
  pdfModule.downloadOffertePdf(...argumenten);
}



export default function PortalOffertesPage() {
  const { session } = usePortalSession();
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Het vinkje per offerte. Zonder aangevinkt vakje blijft de knop uit, en
  // weigert ook de server het akkoord.
  const [aangevinkt, setAangevinkt] = useState<Record<string, boolean>>({});

  // Opnieuw laden gebeurt door deze teller op te hogen; het effect hieronder
  // hangt eraan. Datzelfde patroon staat elders in het dashboard en houdt de
  // ophaallogica binnen het effect, waar de lintregels hem willen hebben.
  const [herlaadTeller, setHerlaadTeller] = useState(0);
  const herlaad = () => setHerlaadTeller((huidig) => huidig + 1);

  useEffect(() => {
    const gebruikerId = session?.user.id;
    if (!gebruikerId) return;

    let verouderd = false;

    async function laadOffertes(id: string) {
      setLoading(true);
      setError(null);
      try {
        const { leadIds, ticketIds } = await getMyLeadAndTicketIds(id);
        const data = await getMyOffertes(leadIds, ticketIds);
        if (!verouderd) setOffertes(data);
      } catch (err) {
        if (!verouderd) setError(err instanceof Error ? err.message : "Onbekende fout.");
      } finally {
        // Altijd, ook bij een fout: anders blijft het scherm eindeloos laden.
        if (!verouderd) setLoading(false);
      }
    }

    laadOffertes(gebruikerId);

    return () => {
      verouderd = true;
    };
  }, [session?.user.id, herlaadTeller]);

  const handleAccepteren = async (offerteId: string) => {
    if (busyId || !aangevinkt[offerteId]) return;
    setBusyId(offerteId);
    setError(null);

    const resultaat = await klantAccepteerOfferte(offerteId, true);
    if (resultaat.error) {
      setError(resultaat.error);
    } else {
      // Ook bij een offerte die al geaccepteerd bleek: opnieuw ophalen zodat
      // het scherm de vastgelegde stand toont in plaats van de oude.
      herlaad();
    }
    setBusyId(null);
  };

  const handleDownload = (offerte: Offerte) => {
    if (offerte.leads) {
      downloadOffertePdfLui(offerte, {
        naam: offerte.leads.naam,
        telefoon: offerte.leads.telefoon,
        email: offerte.leads.email,
        plaats: offerte.leads.plaats,
        type_woning: offerte.leads.type_woning,
      });
    } else if (offerte.vastgoedtickets) {
      downloadOffertePdfLui(offerte, {
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
        <p className="mt-2 text-sm text-slate-400">Bekijk uw offertes, download de PDF of accepteer digitaal.</p>

        {loading ? <PortalLaden wat="offertes" /> : null}
        {!loading && error ? <PortalFout wat="offertes" onOpnieuw={herlaad} /> : null}

        {!loading && offertes.length === 0 ? (
          <PortalLeeg tekst="U heeft nog geen offertes. Zodra wij een offerte voor u opstellen, verschijnt die hier." />
        ) : null}

        <div className="mt-6 space-y-4">
          {offertes.map((offerte) => (
            <div key={offerte.id} className="rounded-3xl border border-white/10 bg-[#090909] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{offerte.offertenummer}</p>
                  <p className="text-sm text-slate-400">{formatDatum(offerte.datum)} &middot; {offerte.merk} {offerte.model}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-cyan-300">{formatBedragRond(offerte.prijs)}</p>
                  <p className="text-xs text-slate-400">{offerteStatusWeergave(offerte.status, offerte.datum).klantLabel}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleDownload(offerte)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  PDF downloaden
                </button>
              </div>

              {offerte.geaccepteerd_op ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Offerte geaccepteerd</p>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    U heeft deze offerte digitaal geaccepteerd op {formatDatumTijd(offerte.geaccepteerd_op)}.
                  </p>
                  <p className="mt-2 text-xs text-emerald-100/60">&ldquo;{AKKOORDTEKST}&rdquo;</p>
                </div>
              ) : offerte.status === "Verstuurd" &&
                !offerteStatusWeergave(offerte.status, offerte.datum).verlopen ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(aangevinkt[offerte.id])}
                      onChange={(event) =>
                        setAangevinkt((huidig) => ({ ...huidig, [offerte.id]: event.target.checked }))
                      }
                      className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400"
                    />
                    <span>{AKKOORDTEKST}</span>
                  </label>
                  <button
                    onClick={() => handleAccepteren(offerte.id)}
                    disabled={!aangevinkt[offerte.id] || busyId === offerte.id}
                    className="mt-4 min-h-[44px] w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    {busyId === offerte.id ? "Bezig met accepteren..." : "Offerte accepteren"}
                  </button>
                  <p className="mt-2 text-xs text-slate-500">
                    Na accepteren leggen wij datum, tijd en de inhoud van deze offerte vast.
                  </p>
                </div>
              ) : null}

              {offerteStatusWeergave(offerte.status, offerte.datum).verlopen ? (
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  De geldigheidstermijn van deze offerte is verstreken, daarom kunt u er geen akkoord meer op geven.
                  Neem contact met ons op via 06 1400 4488 als u alsnog wilt doorgaan; wij maken dan een nieuwe
                  offerte met actuele prijzen.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
