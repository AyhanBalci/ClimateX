"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Factuur,
  KlantAdres,
  KlantContactpersoon,
  Lead,
  LeadNotitie,
  LeadStatusHistorie,
  Offerte,
  Planning,
  Werkbon,
} from "../../lib/types";
import { KLANT_ADRES_SOORT_OPTIONS, KLANT_DOCUMENT_CATEGORIE_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { formatBedragRond, formatDatum, formatDatumTijd } from "../../lib/formatters";
import FileUpload from "./FileUpload";

type Props = {
  lead: Lead;
  onBack: () => void;
  onOpenWerkbon: (werkbon: Werkbon) => void;
  onOpenPlanning: (planning: Planning) => void;
};

type GeschiedenisItem = {
  id: string;
  soort: string;
  titel: string;
  detail: string;
  tijdstip: string;
};

const LEEG_CONTACT = { naam: "", functie: "", email: "", telefoon: "" };
const LEEG_ADRES = {
  soort: KLANT_ADRES_SOORT_OPTIONS[0],
  straat: "",
  huisnummer: "",
  postcode: "",
  plaats: "",
};

export default function KlantProfiel({ lead, onBack, onOpenWerkbon, onOpenPlanning }: Props) {
  const [contactpersonen, setContactpersonen] = useState<KlantContactpersoon[]>([]);
  const [adressen, setAdressen] = useState<KlantAdres[]>([]);
  const [notities, setNotities] = useState<LeadNotitie[]>([]);
  const [historie, setHistorie] = useState<LeadStatusHistorie[]>([]);
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [werkbonnen, setWerkbonnen] = useState<Werkbon[]>([]);
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [planningen, setPlanningen] = useState<Planning[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactForm, setContactForm] = useState(LEEG_CONTACT);
  const [adresForm, setAdresForm] = useState(LEEG_ADRES);
  const [nieuweNotitie, setNieuweNotitie] = useState("");
  const [bezig, setBezig] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiel() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const [contactRes, adresRes, notitieRes, historieRes, offerteRes, werkbonRes, factuurRes, planningRes] =
        await Promise.all([
          supabase.from("klant_contactpersonen").select("*").eq("lead_id", lead.id).order("created_at"),
          supabase.from("klant_adressen").select("*").eq("lead_id", lead.id).order("created_at"),
          supabase.from("lead_notities").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
          supabase
            .from("lead_status_historie")
            .select("*")
            .eq("lead_id", lead.id)
            .order("created_at", { ascending: false }),
          supabase.from("offertes").select("*").eq("lead_id", lead.id),
          supabase.from("werkbonnen").select("*").eq("lead_id", lead.id),
          supabase.from("facturen").select("*").eq("lead_id", lead.id),
          supabase.from("planning").select("*").eq("lead_id", lead.id),
        ]);

      const fout =
        contactRes.error?.message ||
        adresRes.error?.message ||
        notitieRes.error?.message ||
        historieRes.error?.message ||
        offerteRes.error?.message ||
        werkbonRes.error?.message ||
        factuurRes.error?.message ||
        planningRes.error?.message;

      if (fout) {
        setError(fout);
      } else {
        setContactpersonen((contactRes.data as KlantContactpersoon[]) || []);
        setAdressen((adresRes.data as KlantAdres[]) || []);
        setNotities((notitieRes.data as LeadNotitie[]) || []);
        setHistorie((historieRes.data as LeadStatusHistorie[]) || []);
        setOffertes((offerteRes.data as Offerte[]) || []);
        setWerkbonnen((werkbonRes.data as Werkbon[]) || []);
        setFacturen((factuurRes.data as Factuur[]) || []);
        setPlanningen((planningRes.data as Planning[]) || []);
      }
      setLoading(false);
    }

    fetchProfiel();
  }, [lead.id]);

  const omzet = facturen
    .filter((factuur) => factuur.status === "Betaald")
    .reduce((som, factuur) => som + (factuur.totaal || 0), 0);
  const openstaand = facturen
    .filter((factuur) => factuur.status !== "Betaald")
    .reduce((som, factuur) => som + (factuur.totaal || 0), 0);

  /** Alles wat er ooit met deze klant gebeurd is, op één tijdlijn. */
  const geschiedenis = useMemo<GeschiedenisItem[]>(() => {
    const items: GeschiedenisItem[] = [
      {
        id: `aangemaakt-${lead.id}`,
        soort: "Klant",
        titel: "Klant aangemaakt",
        detail: lead.plaats || "",
        tijdstip: lead.created_at,
      },
      ...historie.map((regel) => ({
        id: `status-${regel.id}`,
        soort: "Status",
        titel: `Status naar "${regel.status}"`,
        detail: "",
        tijdstip: regel.created_at,
      })),
      ...notities.map((notitie) => ({
        id: `notitie-${notitie.id}`,
        soort: "Notitie",
        titel: notitie.tekst,
        detail: "",
        tijdstip: notitie.created_at,
      })),
      ...offertes.map((offerte) => ({
        id: `offerte-${offerte.id}`,
        soort: "Offerte",
        titel: `${offerte.offertenummer} · ${formatBedragRond(offerte.prijs)}`,
        detail: offerte.status,
        tijdstip: offerte.datum,
      })),
      ...werkbonnen.map((werkbon) => ({
        id: `werkbon-${werkbon.id}`,
        soort: "Werkbon",
        titel: werkbon.werkbonnummer,
        detail: werkbon.status,
        tijdstip: werkbon.created_at,
      })),
      ...facturen.map((factuur) => ({
        id: `factuur-${factuur.id}`,
        soort: "Factuur",
        titel: `${factuur.factuurnummer} · ${formatBedragRond(factuur.totaal)}`,
        detail: factuur.status,
        tijdstip: factuur.created_at,
      })),
      ...planningen.map((planning) => ({
        id: `planning-${planning.id}`,
        soort: "Afspraak",
        titel: `${planning.titel} · ${planning.medewerker}`,
        detail: planning.status,
        tijdstip: planning.datum,
      })),
    ];

    return items
      .filter((item) => item.tijdstip && !Number.isNaN(new Date(item.tijdstip).getTime()))
      .sort((a, b) => new Date(b.tijdstip).getTime() - new Date(a.tijdstip).getTime());
  }, [lead, historie, notities, offertes, werkbonnen, facturen, planningen]);

  const handleContactToevoegen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || bezig || !contactForm.naam.trim()) return;

    setBezig("contact");
    try {
      const { data, error: insertError } = await supabase
        .from("klant_contactpersonen")
        .insert({
          lead_id: lead.id,
          naam: contactForm.naam.trim(),
          functie: contactForm.functie.trim() || null,
          email: contactForm.email.trim() || null,
          telefoon: contactForm.telefoon.trim() || null,
          // De eerste contactpersoon is meteen de hoofdcontactpersoon.
          is_primair: contactpersonen.length === 0,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }
      setError(null);
      setContactpersonen((huidig) => [...huidig, data as KlantContactpersoon]);
      setContactForm(LEEG_CONTACT);
    } finally {
      setBezig(null);
    }
  };

  const handleContactVerwijderen = async (id: string) => {
    if (!supabase || bezig) return;
    if (!window.confirm("Deze contactpersoon verwijderen?")) return;

    setBezig(`contact-${id}`);
    try {
      const { error: deleteError } = await supabase.from("klant_contactpersonen").delete().eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setError(null);
      setContactpersonen((huidig) => huidig.filter((persoon) => persoon.id !== id));
    } finally {
      setBezig(null);
    }
  };

  const handleAdresToevoegen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || bezig) return;
    if (!adresForm.straat.trim() && !adresForm.postcode.trim()) {
      setError("Vul minimaal een straat of postcode in.");
      return;
    }

    setBezig("adres");
    try {
      const { data, error: insertError } = await supabase
        .from("klant_adressen")
        .insert({
          lead_id: lead.id,
          soort: adresForm.soort,
          straat: adresForm.straat.trim() || null,
          huisnummer: adresForm.huisnummer.trim() || null,
          postcode: adresForm.postcode.trim() || null,
          plaats: adresForm.plaats.trim() || lead.plaats || null,
          is_primair: adressen.length === 0,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }
      setError(null);
      setAdressen((huidig) => [...huidig, data as KlantAdres]);
      setAdresForm(LEEG_ADRES);
    } finally {
      setBezig(null);
    }
  };

  const handleAdresVerwijderen = async (id: string) => {
    if (!supabase || bezig) return;
    if (!window.confirm("Dit adres verwijderen?")) return;

    setBezig(`adres-${id}`);
    try {
      const { error: deleteError } = await supabase.from("klant_adressen").delete().eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setError(null);
      setAdressen((huidig) => huidig.filter((adres) => adres.id !== id));
    } finally {
      setBezig(null);
    }
  };

  const handleNotitieToevoegen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || bezig || !nieuweNotitie.trim()) return;

    setBezig("notitie");
    try {
      const { data, error: insertError } = await supabase
        .from("lead_notities")
        .insert({ lead_id: lead.id, tekst: nieuweNotitie.trim() })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }
      setError(null);
      setNotities((huidig) => [data as LeadNotitie, ...huidig]);
      setNieuweNotitie("");
    } finally {
      setBezig(null);
    }
  };

  const invoerKlasse =
    "w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300";
  const kaartKlasse = "mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8";

  return (
    <div>
      <button onClick={onBack} className="text-sm text-cyan-300 transition hover:text-cyan-200">
        ← Terug naar klanten
      </button>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-rose-400">
          {error}
        </p>
      ) : null}
      {loading ? <p className="mt-4 text-sm text-slate-400">Bezig met laden...</p> : null}

      <div className={kaartKlasse}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Klantprofiel</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{lead.naam}</h2>
            <p className="mt-1 text-sm text-slate-400">Klant sinds {formatDatum(lead.created_at)}</p>
          </div>
          <span className="self-start rounded-full bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
            {lead.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "E-mail", waarde: lead.email || "—" },
            { label: "Telefoon", waarde: lead.telefoon || "—" },
            { label: "Plaats", waarde: lead.plaats || "—" },
            { label: "Type woning", waarde: lead.type_woning || "—" },
            { label: "Omzet", waarde: formatBedragRond(omzet) },
            { label: "Openstaand", waarde: openstaand > 0 ? formatBedragRond(openstaand) : "—" },
            { label: "Aantal offertes", waarde: String(offertes.length) },
            { label: "Aantal werkbonnen", waarde: String(werkbonnen.length) },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</dt>
              <dd className="mt-2 break-words text-sm text-slate-200">{item.waarde}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={kaartKlasse}>
        <h3 className="text-lg font-semibold text-white">Contactpersonen</h3>
        {contactpersonen.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Nog geen contactpersonen vastgelegd.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {contactpersonen.map((persoon) => (
              <li
                key={persoon.id}
                className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-[#090909] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {persoon.naam}
                    {persoon.is_primair ? (
                      <span className="ml-2 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                        Hoofdcontact
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-400">
                    {[persoon.functie, persoon.email, persoon.telefoon].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <button
                  onClick={() => handleContactVerwijderen(persoon.id)}
                  disabled={bezig === `contact-${persoon.id}`}
                  className="shrink-0 self-start rounded-full bg-rose-500/10 px-4 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                  Verwijderen
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleContactToevoegen} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Naam"
            value={contactForm.naam}
            onChange={(event) => setContactForm((huidig) => ({ ...huidig, naam: event.target.value }))}
            className={invoerKlasse}
          />
          <input
            type="text"
            placeholder="Functie"
            value={contactForm.functie}
            onChange={(event) => setContactForm((huidig) => ({ ...huidig, functie: event.target.value }))}
            className={invoerKlasse}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={contactForm.email}
            onChange={(event) => setContactForm((huidig) => ({ ...huidig, email: event.target.value }))}
            className={invoerKlasse}
          />
          <input
            type="tel"
            placeholder="Telefoon"
            value={contactForm.telefoon}
            onChange={(event) => setContactForm((huidig) => ({ ...huidig, telefoon: event.target.value }))}
            className={invoerKlasse}
          />
          <button
            type="submit"
            disabled={bezig === "contact"}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {bezig === "contact" ? "Bezig met opslaan…" : "Contactpersoon toevoegen"}
          </button>
        </form>
      </div>

      <div className={kaartKlasse}>
        <h3 className="text-lg font-semibold text-white">Adressen</h3>
        {adressen.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Nog geen adressen vastgelegd.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {adressen.map((adres) => {
              const regel = [
                [adres.straat, adres.huisnummer].filter(Boolean).join(" "),
                [adres.postcode, adres.plaats].filter(Boolean).join(" "),
                adres.land,
              ]
                .filter(Boolean)
                .join(", ");
              const kaartUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(regel)}`;
              return (
                <li
                  key={adres.id}
                  className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-[#090909] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{adres.soort}</p>
                    <p className="mt-1 break-words text-sm text-slate-200">{regel}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={kaartUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
                    >
                      Route
                    </a>
                    <button
                      onClick={() => handleAdresVerwijderen(adres.id)}
                      disabled={bezig === `adres-${adres.id}`}
                      className="rounded-full bg-rose-500/10 px-4 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Verwijderen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={handleAdresToevoegen} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            aria-label="Soort adres"
            value={adresForm.soort}
            onChange={(event) => setAdresForm((huidig) => ({ ...huidig, soort: event.target.value }))}
            className={invoerKlasse}
          >
            {KLANT_ADRES_SOORT_OPTIONS.map((optie) => (
              <option key={optie} value={optie}>
                {optie}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Straat"
            value={adresForm.straat}
            onChange={(event) => setAdresForm((huidig) => ({ ...huidig, straat: event.target.value }))}
            className={invoerKlasse}
          />
          <input
            type="text"
            placeholder="Huisnummer"
            value={adresForm.huisnummer}
            onChange={(event) => setAdresForm((huidig) => ({ ...huidig, huisnummer: event.target.value }))}
            className={invoerKlasse}
          />
          <input
            type="text"
            placeholder="Postcode"
            value={adresForm.postcode}
            onChange={(event) => setAdresForm((huidig) => ({ ...huidig, postcode: event.target.value }))}
            className={invoerKlasse}
          />
          <input
            type="text"
            placeholder="Plaats"
            value={adresForm.plaats}
            onChange={(event) => setAdresForm((huidig) => ({ ...huidig, plaats: event.target.value }))}
            className={invoerKlasse}
          />
          <button
            type="submit"
            disabled={bezig === "adres"}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bezig === "adres" ? "Bezig met opslaan…" : "Adres toevoegen"}
          </button>
        </form>
      </div>

      <div className={kaartKlasse}>
        <h3 className="text-lg font-semibold text-white">Notities</h3>
        <form onSubmit={handleNotitieToevoegen} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Notitie toevoegen"
            value={nieuweNotitie}
            onChange={(event) => setNieuweNotitie(event.target.value)}
            className={invoerKlasse}
          />
          <button
            type="submit"
            disabled={bezig === "notitie" || !nieuweNotitie.trim()}
            className="shrink-0 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bezig === "notitie" ? "Bezig…" : "Toevoegen"}
          </button>
        </form>
        {notities.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nog geen notities.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {notities.map((notitie) => (
              <li key={notitie.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <p className="text-sm text-slate-200">{notitie.tekst}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDatumTijd(notitie.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={kaartKlasse}>
        <h3 className="text-lg font-semibold text-white">Documenten</h3>
        <div className="mt-4">
          <FileUpload leadId={lead.id} categorieen={KLANT_DOCUMENT_CATEGORIE_OPTIONS} />
        </div>
      </div>

      <div className={kaartKlasse}>
        <h3 className="text-lg font-semibold text-white">Geschiedenis</h3>
        {geschiedenis.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Nog geen geschiedenis.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {geschiedenis.map((item) => (
              <li key={item.id} className="rounded-2xl border border-white/10 bg-[#090909] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.soort}</span>{" "}
                    {item.titel}
                  </p>
                  <p className="text-xs text-slate-500">{formatDatum(item.tijdstip)}</p>
                </div>
                {item.detail ? <p className="mt-1 text-sm text-slate-400">{item.detail}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </div>

      {werkbonnen.length > 0 || planningen.length > 0 ? (
        <div className={kaartKlasse}>
          <h3 className="text-lg font-semibold text-white">Snel openen</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {werkbonnen.map((werkbon) => (
              <button
                key={werkbon.id}
                onClick={() => onOpenWerkbon(werkbon)}
                className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Werkbon {werkbon.werkbonnummer}
              </button>
            ))}
            {planningen.map((planning) => (
              <button
                key={planning.id}
                onClick={() => onOpenPlanning(planning)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Afspraak {formatDatum(planning.datum)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
