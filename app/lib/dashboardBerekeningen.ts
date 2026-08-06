/**
 * Rekenregels achter de dashboardcijfers.
 *
 * De KPI-kaarten, de grafieken en de activiteitenlijst putten uit dezelfde
 * definities. Dat is bewust: stonden die berekeningen los per component, dan kon
 * "omzet deze maand" op de ene kaart iets anders betekenen dan in de grafiek
 * eronder.
 *
 * Omzet is overal gelijk gedefinieerd als de som van `totaal` van facturen met
 * status "Betaald", geteld op de dag dat de factuur betaald werd. Een verstuurde
 * maar onbetaalde factuur telt dus niet mee.
 */

export type DashboardFactuur = {
  id: string;
  factuurnummer: string;
  klant: string;
  status: string;
  totaal: number;
  betaaldatum: string | null;
  created_at: string;
};

export type DashboardOfferte = {
  id: string;
  offertenummer: string;
  status: string;
  prijs: number;
  datum: string;
};

export type DashboardLead = {
  id: string;
  naam: string;
  status: string;
  created_at: string;
};

export type DashboardWerkbon = {
  id: string;
  werkbonnummer: string;
  klantnaam: string;
  status: string;
  created_at: string;
};

export type DashboardTicket = {
  id: string;
  ticketnummer: string;
  klant: string;
  status: string;
  prioriteit: string;
  created_at: string;
};

export type DashboardData = {
  leads: DashboardLead[];
  offertes: DashboardOfferte[];
  werkbonnen: DashboardWerkbon[];
  facturen: DashboardFactuur[];
  tickets: DashboardTicket[];
};

export const LEGE_DASHBOARD_DATA: DashboardData = {
  leads: [],
  offertes: [],
  werkbonnen: [],
  facturen: [],
  tickets: [],
};

/** Werkbonnen in deze statussen zijn afgehandeld en tellen niet als "open". */
const AFGEHANDELDE_WERKBON_STATUSSEN = ["Gereed", "Gefactureerd"];

/** Servicemeldingen in deze status zijn afgehandeld en tellen niet als "open". */
const AFGEHANDELDE_TICKET_STATUSSEN = ["Afgerond"];

function tijdstip(waarde: string | null): number | null {
  if (!waarde) return null;
  const datum = new Date(waarde);
  return Number.isNaN(datum.getTime()) ? null : datum.getTime();
}

/**
 * Omzet binnen een periode. `tot` is exclusief, zodat aaneengesloten periodes
 * (zoals de maanden in de grafiek) een factuur nooit dubbel tellen.
 */
export function berekenOmzet(facturen: DashboardFactuur[], vanaf: Date, tot?: Date): number {
  const vanafTijd = vanaf.getTime();
  const totTijd = tot ? tot.getTime() : Infinity;

  return facturen.reduce((som, factuur) => {
    if (factuur.status !== "Betaald") return som;
    const betaald = tijdstip(factuur.betaaldatum);
    if (betaald === null || betaald < vanafTijd || betaald >= totTijd) return som;
    return som + (factuur.totaal || 0);
  }, 0);
}

function startVanDag(datum: Date): Date {
  return new Date(datum.getFullYear(), datum.getMonth(), datum.getDate());
}

/** Maandag als eerste dag van de week, gelijk aan de agenda. */
function startVanWeek(datum: Date): Date {
  const resultaat = startVanDag(datum);
  const dag = resultaat.getDay() || 7;
  resultaat.setDate(resultaat.getDate() - dag + 1);
  return resultaat;
}

export type DashboardKpiCijfers = {
  omzetVandaag: number;
  omzetDezeWeek: number;
  omzetDezeMaand: number;
  omzetDitJaar: number;
  openOffertes: number;
  openWerkbonnen: number;
  openFacturen: number;
  openServicemeldingen: number;
  /** Aandeel leads waarvoor minstens één offerte is verstuurd. */
  conversieLeadNaarOfferte: number;
  /** Aandeel verstuurde offertes dat geaccepteerd is. */
  conversieOfferteNaarOpdracht: number;
};

export function berekenKpis(data: DashboardData, nu: Date = new Date()): DashboardKpiCijfers {
  const beginDag = startVanDag(nu);
  const beginWeek = startVanWeek(nu);
  const beginMaand = new Date(nu.getFullYear(), nu.getMonth(), 1);
  const beginJaar = new Date(nu.getFullYear(), 0, 1);

  const openFacturen = data.facturen.filter((factuur) => factuur.status !== "Betaald").length;

  const openOffertes = data.offertes.filter(
    (offerte) => offerte.status === "Concept" || offerte.status === "Verstuurd"
  ).length;

  const openWerkbonnen = data.werkbonnen.filter(
    (werkbon) => !AFGEHANDELDE_WERKBON_STATUSSEN.includes(werkbon.status)
  ).length;

  const openServicemeldingen = data.tickets.filter(
    (ticket) => !AFGEHANDELDE_TICKET_STATUSSEN.includes(ticket.status)
  ).length;

  // Een lead is "geoffreerd" zodra de status voorbij het belstadium is. De
  // leadstatus is hier de bron en niet het aantal offertes, omdat één lead
  // meerdere offertes kan hebben en dat de teller anders boven 100% duwt.
  const geoffreerd = data.leads.filter((lead) =>
    ["Offerte verstuurd", "Gewonnen", "Verloren"].includes(lead.status)
  ).length;
  const gewonnen = data.leads.filter((lead) => lead.status === "Gewonnen").length;

  const beoordeeldeOffertes = data.offertes.filter((offerte) =>
    ["Verstuurd", "Geaccepteerd", "Afgewezen"].includes(offerte.status)
  ).length;
  const geaccepteerdeOffertes = data.offertes.filter((offerte) => offerte.status === "Geaccepteerd").length;

  return {
    omzetVandaag: berekenOmzet(data.facturen, beginDag),
    omzetDezeWeek: berekenOmzet(data.facturen, beginWeek),
    omzetDezeMaand: berekenOmzet(data.facturen, beginMaand),
    omzetDitJaar: berekenOmzet(data.facturen, beginJaar),
    openOffertes,
    openWerkbonnen,
    openFacturen,
    openServicemeldingen,
    conversieLeadNaarOfferte: data.leads.length > 0 ? (geoffreerd / data.leads.length) * 100 : 0,
    conversieOfferteNaarOpdracht:
      beoordeeldeOffertes > 0
        ? (geaccepteerdeOffertes / beoordeeldeOffertes) * 100
        : data.leads.length > 0
          ? (gewonnen / data.leads.length) * 100
          : 0,
  };
}

export type MaandOmzet = {
  /** Korte maandnaam voor de as, bijvoorbeeld "aug". */
  maand: string;
  omzet: number;
};

/** Omzet per maand over de laatste `aantalMaanden`, oudste maand eerst. */
export function omzetPerMaand(
  facturen: DashboardFactuur[],
  aantalMaanden = 12,
  nu: Date = new Date()
): MaandOmzet[] {
  return Array.from({ length: aantalMaanden }, (_, index) => {
    const verschuiving = aantalMaanden - 1 - index;
    const begin = new Date(nu.getFullYear(), nu.getMonth() - verschuiving, 1);
    const eind = new Date(nu.getFullYear(), nu.getMonth() - verschuiving + 1, 1);
    return {
      maand: begin.toLocaleDateString("nl-NL", { month: "short" }),
      omzet: berekenOmzet(facturen, begin, eind),
    };
  });
}

export type StatusVerdeling = {
  status: string;
  aantal: number;
};

export function verdeelPerStatus(items: { status: string }[], volgorde: string[]): StatusVerdeling[] {
  return volgorde
    .map((status) => ({ status, aantal: items.filter((item) => item.status === status).length }))
    .filter((regel) => regel.aantal > 0);
}

export type Activiteit = {
  id: string;
  soort: "Lead" | "Offerte" | "Werkbon" | "Factuur" | "Servicemelding";
  titel: string;
  omschrijving: string;
  tijdstip: string;
};

/** De laatst aangemaakte records over alle modules heen, nieuwste eerst. */
export function recenteActiviteiten(data: DashboardData, limiet = 12): Activiteit[] {
  const alles: Activiteit[] = [
    ...data.leads.map((lead) => ({
      id: `lead-${lead.id}`,
      soort: "Lead" as const,
      titel: lead.naam,
      omschrijving: `Nieuwe lead · ${lead.status}`,
      tijdstip: lead.created_at,
    })),
    ...data.werkbonnen.map((werkbon) => ({
      id: `werkbon-${werkbon.id}`,
      soort: "Werkbon" as const,
      titel: werkbon.werkbonnummer,
      omschrijving: `${werkbon.klantnaam} · ${werkbon.status}`,
      tijdstip: werkbon.created_at,
    })),
    ...data.facturen.map((factuur) => ({
      id: `factuur-${factuur.id}`,
      soort: "Factuur" as const,
      titel: factuur.factuurnummer,
      omschrijving: `${factuur.klant} · ${factuur.status}`,
      tijdstip: factuur.created_at,
    })),
    ...data.tickets.map((ticket) => ({
      id: `ticket-${ticket.id}`,
      soort: "Servicemelding" as const,
      titel: ticket.ticketnummer,
      omschrijving: `${ticket.klant} · ${ticket.status}`,
      tijdstip: ticket.created_at,
    })),
    // Offertes hebben geen created_at in deze selectie; de offertedatum is hier
    // het bruikbare tijdstip en volstaat voor een chronologische lijst.
    ...data.offertes.map((offerte) => ({
      id: `offerte-${offerte.id}`,
      soort: "Offerte" as const,
      titel: offerte.offertenummer,
      omschrijving: `Offerte · ${offerte.status}`,
      tijdstip: offerte.datum,
    })),
  ];

  return alles
    .filter((activiteit) => tijdstip(activiteit.tijdstip) !== null)
    .sort((a, b) => (tijdstip(b.tijdstip) as number) - (tijdstip(a.tijdstip) as number))
    .slice(0, limiet);
}
