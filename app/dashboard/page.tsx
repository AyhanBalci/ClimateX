"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { Lead, Planning, Vastgoedticket, Werkbon } from "../lib/types";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardKpis from "../components/dashboard/DashboardKpis";
import LeadsTable from "../components/dashboard/LeadsTable";
import LeadDetail from "../components/dashboard/LeadDetail";
import OffertesOverview from "../components/dashboard/OffertesOverview";
import ProductsManager from "../components/dashboard/ProductsManager";
import WerkbonnenOverview from "../components/dashboard/WerkbonnenOverview";
import WerkbonDetail from "../components/dashboard/WerkbonDetail";
import FacturenOverview from "../components/dashboard/FacturenOverview";
import VastgoedticketenOverview from "../components/dashboard/VastgoedticketenOverview";
import VastgoedticketDetail from "../components/dashboard/VastgoedticketDetail";
import PlanningAgenda from "../components/dashboard/PlanningAgenda";
import PlanningDetail from "../components/dashboard/PlanningDetail";
import DashboardOverzicht from "../components/dashboard/DashboardOverzicht";
import MeldingenPaneel from "../components/dashboard/MeldingenPaneel";
import { SESSIE_VERLOPEN_EVENT } from "../lib/dashboardFetch";
import AgentPaneel from "../components/dashboard/AgentPaneel";
import KlantenOverzicht from "../components/dashboard/KlantenOverzicht";
import KlantProfiel from "../components/dashboard/KlantProfiel";

type View = "overzicht" | "agent" | "klanten" | "leads" | "offertes" | "producten" | "werkbonnen" | "facturen" | "tickets" | "planning";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessieGecontroleerd, setSessieGecontroleerd] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [bezigMetInloggen, setBezigMetInloggen] = useState(false);
  const [sessieVerlopen, setSessieVerlopen] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [view, setView] = useState<View>("overzicht");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedKlant, setSelectedKlant] = useState<Lead | null>(null);
  const [selectedWerkbon, setSelectedWerkbon] = useState<Werkbon | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Vastgoedticket | null>(null);
  const [selectedPlanning, setSelectedPlanning] = useState<Planning | null>(null);

  // Bestaande sessie herkennen, zodat verversen niet uitlogt. Het cookie is
  // httpOnly en dus niet uit JavaScript te lezen; alleen de server kan zeggen
  // of het geldig is.
  useEffect(() => {
    let verouderd = false;

    async function controleerSessie() {
      try {
        const response = await fetch("/api/dashboard/session");
        const data = await response.json();
        if (!verouderd) setIsAuthenticated(Boolean(data.ingelogd));
      } catch {
        if (!verouderd) setIsAuthenticated(false);
      } finally {
        if (!verouderd) setSessieGecontroleerd(true);
      }
    }

    controleerSessie();
    return () => {
      verouderd = true;
    };
  }, []);

  // De sessie is acht uur geldig en kan dus verlopen terwijl dit scherm openstaat.
  // Zonder deze twee vangnetten bleef het dashboard er ingelogd uitzien en gaf
  // elke knop los de melding "Niet ingelogd in de beheeromgeving.", zonder dat
  // duidelijk werd dat er opnieuw ingelogd moest worden.
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Een beveiligde route gaf 401: de sessie is voorbij.
    function opSessieVerlopen() {
      setIsAuthenticated(false);
      setSessieVerlopen(true);
    }

    // 2. Terug op dit tabblad na een tijd weg te zijn geweest: even navragen,
    //    zodat de gebruiker het merkt vóór hij iets probeert te versturen.
    async function controleerBijTerugkeer() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/dashboard/session");
        const data = await response.json();
        if (!data.ingelogd) opSessieVerlopen();
      } catch {
        // Geen verbinding is geen reden om iemand uit te loggen.
      }
    }

    window.addEventListener(SESSIE_VERLOPEN_EVENT, opSessieVerlopen);
    document.addEventListener("visibilitychange", controleerBijTerugkeer);

    return () => {
      window.removeEventListener(SESSIE_VERLOPEN_EVENT, opSessieVerlopen);
      document.removeEventListener("visibilitychange", controleerBijTerugkeer);
    };
  }, [isAuthenticated]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (bezigMetInloggen) return;

    setBezigMetInloggen(true);
    setLoginError("");
    try {
      const response = await fetch("/api/dashboard/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wachtwoord: password }),
      });
      const data = await response.json();

      if (response.ok && data.ingelogd) {
        setIsAuthenticated(true);
        setSessieVerlopen(false);
        // Het wachtwoord niet langer dan nodig in het geheugen houden.
        setPassword("");
      } else {
        setLoginError(data.error || "Wachtwoord onjuist.");
      }
    } catch {
      setLoginError("Inloggen is mislukt. Controleer uw verbinding en probeer het opnieuw.");
    } finally {
      setBezigMetInloggen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/dashboard/session", { method: "DELETE" });
    } finally {
      setIsAuthenticated(false);
      setSessieVerlopen(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchLeads() {
      setLeadsLoading(true);
      setLeadsError(null);

      if (!isSupabaseConfigured || !supabase) {
        setLeadsError(
          "Supabase is niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in."
        );
        setLeadsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setLeadsError(fetchError.message);
      } else {
        setLeads((data as Lead[]) || []);
      }
      setLeadsLoading(false);
    }

    fetchLeads();
  }, [isAuthenticated]);

  const handleLeadUpdated = (leadId: string, newStatus: string) => {
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)));
    setSelectedLead((current) => (current && current.id === leadId ? { ...current, status: newStatus } : current));
  };

  const handleLeadDeleted = (leadId: string) => {
    setLeads((current) => current.filter((lead) => lead.id !== leadId));
    setSelectedLead((current) => (current && current.id === leadId ? null : current));
  };

  const handleFactuurCreated = () => {
    setView("facturen");
    setSelectedWerkbon(null);
  };

  const handleOpenWerkbon = (werkbon: Werkbon) => {
    setView("werkbonnen");
    setSelectedWerkbon(werkbon);
    setSelectedTicket(null);
    setSelectedPlanning(null);
  };

  const handleOpenPlanning = (planning: Planning) => {
    setView("planning");
    setSelectedPlanning(planning);
    setSelectedTicket(null);
    setSelectedWerkbon(null);
  };

  // Voorkomt dat het inlogscherm kort opflitst terwijl de sessie nog wordt
  // gecontroleerd bij een gebruiker die al is ingelogd.
  if (!sessieGecontroleerd) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-sm text-slate-400">Bezig met laden...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-xl shadow-black/20">
          <h1 className="text-3xl font-semibold">Dashboard login</h1>
          <p className="mt-4 text-slate-400">Voer het beheerderswachtwoord in om de dashboarddemo te bekijken.</p>
          {sessieVerlopen ? (
            <p role="status" className="mt-4 rounded-3xl border border-amber-300/20 bg-amber-400/5 p-4 text-sm text-amber-200">
              Uw sessie is verlopen. Log opnieuw in; uw laatste handeling is niet uitgevoerd.
            </p>
          ) : null}
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <label className="block text-sm text-slate-300">
              Wachtwoord
              <input
                type="password"
                required
                autoComplete="current-password"
                aria-invalid={loginError ? true : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
            </label>
            {loginError ? (
              <p role="alert" className="text-sm text-rose-400">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={bezigMetInloggen}
              className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bezigMetInloggen ? "Bezig met inloggen…" : "Inloggen"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 sm:px-10 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Beheeromgeving</p>
            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">ClimateX CRM Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <MeldingenPaneel />
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Uitloggen
            </button>
          </div>
        </div>

        <div className="mb-6">
          <DashboardStats leads={leads} />
        </div>

        <div className="mb-6">
          <DashboardKpis />
        </div>

        <div role="tablist" aria-label="Dashboardonderdelen" className="mb-6 flex gap-2 overflow-x-auto">
          {(
            [
              { key: "overzicht", label: "Overzicht" },
              { key: "agent", label: "Agent" },
              { key: "klanten", label: "Klanten" },
              { key: "leads", label: "Leads" },
              { key: "offertes", label: "Offertes" },
              { key: "producten", label: "Producten" },
              { key: "werkbonnen", label: "Werkbonnen" },
              { key: "facturen", label: "Facturen" },
              { key: "tickets", label: "Servicemeldingen" },
              { key: "planning", label: "Planning" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={view === tab.key}
              onClick={() => {
                setView(tab.key);
                setSelectedLead(null);
                setSelectedKlant(null);
                setSelectedWerkbon(null);
                setSelectedTicket(null);
                setSelectedPlanning(null);
              }}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition ${
                view === tab.key ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === "overzicht" ? (
          <DashboardOverzicht />
        ) : view === "agent" ? (
          <AgentPaneel />
        ) : view === "klanten" ? (
          selectedKlant ? (
            <KlantProfiel
              key={selectedKlant.id}
              lead={selectedKlant}
              onBack={() => setSelectedKlant(null)}
              onOpenWerkbon={handleOpenWerkbon}
              onOpenPlanning={handleOpenPlanning}
            />
          ) : (
            <KlantenOverzicht onSelectKlant={setSelectedKlant} />
          )
        ) : view === "leads" ? (
          selectedLead ? (
            <LeadDetail
              key={selectedLead.id}
              lead={selectedLead}
              onBack={() => setSelectedLead(null)}
              onLeadUpdated={handleLeadUpdated}
              onOpenWerkbon={handleOpenWerkbon}
              onOpenPlanning={handleOpenPlanning}
            />
          ) : (
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
              <h2 className="text-xl font-semibold">Leads</h2>
              {leadsLoading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}
              {leadsError ? <p className="mt-6 text-sm text-rose-400">{leadsError}</p> : null}
              {!leadsLoading && !leadsError ? (
                <div className="mt-6">
                  <LeadsTable
                    leads={leads}
                    onSelectLead={setSelectedLead}
                    onLeadUpdated={handleLeadUpdated}
                    onLeadDeleted={handleLeadDeleted}
                  />
                </div>
              ) : null}
            </section>
          )
        ) : view === "offertes" ? (
          <OffertesOverview onOpenWerkbon={handleOpenWerkbon} onOpenPlanning={handleOpenPlanning} />
        ) : view === "producten" ? (
          <ProductsManager />
        ) : view === "werkbonnen" ? (
          selectedWerkbon ? (
            <WerkbonDetail
              key={selectedWerkbon.id}
              werkbon={selectedWerkbon}
              onBack={() => setSelectedWerkbon(null)}
              onWerkbonUpdated={setSelectedWerkbon}
              onFactuurCreated={handleFactuurCreated}
              onOpenPlanning={handleOpenPlanning}
            />
          ) : (
            <WerkbonnenOverview onSelectWerkbon={setSelectedWerkbon} />
          )
        ) : view === "facturen" ? (
          <FacturenOverview />
        ) : view === "tickets" ? (
          selectedTicket ? (
            <VastgoedticketDetail
              key={selectedTicket.id}
              ticket={selectedTicket}
              onBack={() => setSelectedTicket(null)}
              onOpenWerkbon={handleOpenWerkbon}
              onOpenPlanning={handleOpenPlanning}
            />
          ) : (
            <VastgoedticketenOverview onSelectTicket={setSelectedTicket} />
          )
        ) : (
          selectedPlanning ? (
            <PlanningDetail
              key={selectedPlanning.id}
              planning={selectedPlanning}
              onBack={() => setSelectedPlanning(null)}
              onPlanningUpdated={setSelectedPlanning}
              onPlanningDeleted={() => setSelectedPlanning(null)}
              onOpenWerkbon={handleOpenWerkbon}
            />
          ) : (
            <PlanningAgenda onSelectPlanning={setSelectedPlanning} />
          )
        )}
      </div>
    </main>
  );
}
