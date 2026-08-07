export type Lead = {
  id: string;
  created_at: string;
  naam: string;
  telefoon: string;
  email: string;
  plaats: string;
  type_woning: string;
  opmerkingen: string;
  status: string;
  klant_user_id?: string | null;
  aantal_laadpunten?: number | null;
  automerk?: string | null;
  automodel?: string | null;
  elektrisch_voertuig?: boolean | null;
  aansluiting?: string | null;
  huidige_meterkast?: string | null;
  parkeerplaats?: string | null;
  afstand_meterkast_meters?: number | null;
  kabellengte_meters?: number | null;
  load_balancing?: boolean | null;
  dynamic_load_balancing?: boolean | null;
};

export type LeadNotitie = {
  id: string;
  lead_id: string;
  tekst: string;
  created_at: string;
};

export type LeadStatusHistorie = {
  id: string;
  lead_id: string;
  status: string;
  created_at: string;
};

export type Offerte = {
  id: string;
  lead_id: string | null;
  ticket_id: string | null;
  datum: string;
  merk: string;
  model: string;
  prijs: number;
  status: string;
  offertenummer: string;
  werkzaamheden: string | null;
  opmerkingen: string | null;
  /**
   * Tijdstip waarop de klant deze offerte digitaal accepteerde. Wordt via een
   * join meegeladen waar dat nodig is; is leeg als er geen acceptatie is.
   */
  geaccepteerd_op?: string | null;
  leads?: { naam: string; telefoon: string; email: string; plaats: string; type_woning: string } | null;
  vastgoedtickets?: { klant: string; locatie: string; contactpersoon: string | null; telefoonnummer: string | null } | null;
};

export type OfferteStatusHistorieRegel = {
  id: string;
  created_at: string;
  offerte_id: string;
  status: string;
  bron: string | null;
};

export type Product = {
  id: string;
  created_at: string;
  merk: string;
  model: string;
  beschrijving: string;
  // Veldnaam in de database is ongewijzigd gebleven (koelvermogen), maar wordt nu gebruikt voor het laadvermogen (bv. "11 kW").
  koelvermogen: string;
  // Veldnaam ongewijzigd (verwarmvermogen), gebruikt voor slimme functies (bv. "App-besturing, load balancing").
  verwarmvermogen: string;
  // Veldnaam ongewijzigd (energieklasse), gebruikt voor "geschikt voor" (Thuis / Zakelijk / Beide).
  energieklasse: string;
  prijs: number;
  afbeelding_url: string | null;
  actief: boolean;
  handleiding_url?: string | null;
  categorie?: string | null;
  inkoopprijs?: number | null;
  adviesprijs?: number | null;
  installatiekosten?: number | null;
  btw_percentage?: number | null;
};

export type Werkbon = {
  id: string;
  created_at: string;
  werkbonnummer: string;
  lead_id: string | null;
  offerte_id: string | null;
  ticket_id: string | null;
  datum: string;
  klantnaam: string;
  adres: string | null;
  telefoon: string | null;
  monteur: string | null;
  werkzaamheden: string | null;
  materialen: string | null;
  opmerkingen: string | null;
  status: string;
  handtekening_klant: string | null;
  handtekening_monteur: string | null;
  serienummer?: string | null;
  testresultaten?: string | null;
};

export type WerkbonMateriaal = {
  id: string;
  created_at: string;
  werkbon_id: string;
  omschrijving: string;
  aantal: number;
  eenheid: string;
  /** Prijs per eenheid excl. BTW. Leeg betekent: niet doorbelasten. */
  eenheidsprijs: number | null;
};

export type WerkbonUur = {
  id: string;
  created_at: string;
  werkbon_id: string;
  monteur: string;
  datum: string;
  uren: number;
  omschrijving: string | null;
  /** Uurtarief excl. BTW. Leeg betekent: niet doorbelasten. */
  uurtarief: number | null;
};

export type Factuur = {
  id: string;
  created_at: string;
  factuurnummer: string;
  lead_id: string | null;
  klant: string;
  offerte_id: string | null;
  werkbon_id: string | null;
  ticket_id: string | null;
  bedrag: number;
  btw: number;
  totaal: number;
  status: string;
  betaaldatum: string | null;
  betaallink?: string | null;
  vervaldatum?: string | null;
  laatste_herinnering?: string | null;
};

export type Bestand = {
  id: string;
  created_at: string;
  lead_id: string | null;
  werkbon_id: string | null;
  factuur_id: string | null;
  ticket_id: string | null;
  categorie: string;
  bestandsnaam: string;
  pad: string;
  url: string;
  zichtbaar_voor_klant?: boolean;
  grootte?: number | null;
  mimetype?: string | null;
};

export type Vastgoedticket = {
  id: string;
  created_at: string;
  ticketnummer: string;
  datum: string;
  klant: string;
  locatie: string;
  contactpersoon: string | null;
  telefoonnummer: string | null;
  type_melding: string | null;
  prioriteit: string;
  omschrijving: string | null;
  status: string;
  medewerker: string | null;
  monteur: string | null;
  geplande_datum: string | null;
  geplande_tijd: string | null;
  klant_user_id?: string | null;
};

export type TicketNotitie = {
  id: string;
  ticket_id: string;
  tekst: string;
  created_at: string;
};

export type TicketStatusHistorie = {
  id: string;
  ticket_id: string;
  status: string;
  created_at: string;
};

export type KlantProfiel = {
  id: string;
  user_id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  rol: string;
  created_at: string;
};

export type TicketKlantBericht = {
  id: string;
  ticket_id: string;
  klant_user_id: string | null;
  tekst: string;
  created_at: string;
};

export type KlantContactpersoon = {
  id: string;
  created_at: string;
  lead_id: string;
  naam: string;
  functie: string | null;
  email: string | null;
  telefoon: string | null;
  is_primair: boolean;
};

export type KlantAdres = {
  id: string;
  created_at: string;
  lead_id: string;
  soort: string;
  straat: string | null;
  huisnummer: string | null;
  postcode: string | null;
  plaats: string | null;
  land: string;
  is_primair: boolean;
};

export type Melding = {
  id: string;
  created_at: string;
  /** offerte, servicemelding, werkbon of factuur. */
  soort: string;
  titel: string;
  omschrijving: string | null;
  gelezen: boolean;
  lead_id: string | null;
  offerte_id: string | null;
  werkbon_id: string | null;
  factuur_id: string | null;
  ticket_id: string | null;
};

export type Planning = {
  id: string;
  created_at: string;
  planning_nummer: string;
  titel: string;
  omschrijving: string | null;
  klant_id: string | null;
  klantnaam: string | null;
  lead_id: string | null;
  ticket_id: string | null;
  werkbon_id: string | null;
  medewerker: string;
  datum: string;
  starttijd: string;
  eindtijd: string;
  status: string;
  kleur: string;
  adres: string | null;
  telefoon: string | null;
  opmerkingen: string | null;
};
