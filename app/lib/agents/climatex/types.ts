/**
 * ClimateX CRM Agent — domeintypen
 *
 * De agent levert nooit rechtstreeks een wijziging af in de database. Alles wat
 * hij produceert is een *voorstel* dat een medewerker bekijkt en bevestigt.
 * Dat is een bewuste keuze: het gaat om offertes, prijzen en klantcontact, en
 * een fout die ongezien naar buiten gaat kost geld of vertrouwen.
 */

/** Hoe zeker de agent is van een voorstel. Bepaalt hoe nadrukkelijk het scherm om controle vraagt. */
export type Zekerheid = 'hoog' | 'gemiddeld' | 'laag'

/** Waar een voorstel over gaat. */
export type VoorstelSoort =
  | 'lead-prioriteit'
  | 'offerte-concept'
  | 'klantantwoord'
  | 'werkbon-concept'
  | 'planning-advies'
  | 'email-concept'
  | 'whatsapp-concept'

export interface AgentVoorstel<T = unknown> {
  id: string
  soort: VoorstelSoort
  /** Korte kop voor in de lijst. */
  titel: string
  /** Waarom de agent dit voorstelt, in gewone taal en met cijfers waar dat kan. */
  onderbouwing: string[]
  zekerheid: Zekerheid
  /** De inhoud van het voorstel; de vorm hangt af van de soort. */
  inhoud: T
  /** Records waar dit voorstel op slaat, zodat het scherm kan doorlinken. */
  bronnen: {
    leadId?: string
    offerteId?: string
    werkbonId?: string
    ticketId?: string
    planningId?: string
  }
  /** Handelingen die een medewerker nog moet doen voordat dit naar buiten kan. */
  controlepunten: string[]
}

// ── Leadanalyse ────────────────────────────────────────────────────

export type LeadUrgentie = 'direct bellen' | 'vandaag' | 'deze week' | 'later'

export interface LeadAnalyse {
  leadId: string
  /** 0-100. Hoger betekent: eerder oppakken. */
  score: number
  urgentie: LeadUrgentie
  /** Losse punten die de score omhoog of omlaag duwden. */
  signalen: { punt: string; effect: number }[]
  /** Wat er ontbreekt om een offerte te kunnen maken. */
  ontbrekendeGegevens: string[]
  /** Concrete eerstvolgende stap. */
  volgendeStap: string
}

// ── Offerteconcept ─────────────────────────────────────────────────

export interface OfferteConcept {
  leadId: string
  /** Voorgesteld product uit de catalogus. */
  productId: string | null
  merk: string
  model: string
  /** Verkoopprijs excl. btw. */
  prijs: number
  installatiekosten: number
  btwPercentage: number
  totaalInclBtw: number
  werkzaamheden: string
  opmerkingen: string
  /** Waarom juist dit product bij deze klant past. */
  productMotivatie: string[]
  /** Zaken die de prijs kunnen veranderen en die eerst uitgezocht moeten worden. */
  aannames: string[]
}

// ── Klantvraag ─────────────────────────────────────────────────────

export interface KlantAntwoord {
  vraag: string
  antwoord: string
  /** Waar het antwoord vandaan komt: kennisbankartikel, CRM-record of vaste regel. */
  bronnen: { titel: string; verwijzing: string }[]
  /** Waar of de agent het antwoord zelf niet met zekerheid kon geven. */
  vereistMens: boolean
}

// ── Werkbonconcept ─────────────────────────────────────────────────

export interface WerkbonConcept {
  leadId: string | null
  offerteId: string | null
  ticketId: string | null
  klantnaam: string
  adres: string
  telefoon: string
  werkzaamheden: string
  /** Voorgestelde materiaalregels op basis van de offerte en de situatie. */
  materialen: { omschrijving: string; aantal: number; eenheid: string }[]
  /** Ingeschatte tijd, als hulp bij het inplannen. */
  geschatteUren: number
  aandachtspunten: string[]
}

// ── Planningsadvies ────────────────────────────────────────────────

export interface PlanningVoorstel {
  datum: string
  starttijd: string
  eindtijd: string
  medewerker: string
  /** Waarom dit moment: reistijd, werkdruk, urgentie. */
  motivatie: string[]
}

// ── Berichten ──────────────────────────────────────────────────────

export type BerichtKanaal = 'email' | 'whatsapp'

export interface BerichtConcept {
  kanaal: BerichtKanaal
  /** Alleen gevuld bij e-mail. */
  onderwerp?: string
  tekst: string
  /** Naar wie het bericht zou gaan. Nooit automatisch verstuurd. */
  ontvanger: { naam: string; adres: string }
  /** Stukken die de medewerker zelf moet controleren of invullen. */
  invulpunten: string[]
}
