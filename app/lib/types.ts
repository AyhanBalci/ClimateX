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
  lead_id: string;
  datum: string;
  merk: string;
  model: string;
  prijs: number;
  status: string;
  offertenummer: string;
  werkzaamheden: string | null;
  opmerkingen: string | null;
  leads?: { naam: string; telefoon: string; email: string; plaats: string; type_woning: string } | null;
};

export type Product = {
  id: string;
  created_at: string;
  merk: string;
  model: string;
  beschrijving: string;
  koelvermogen: string;
  verwarmvermogen: string;
  energieklasse: string;
  prijs: number;
  afbeelding_url: string | null;
  actief: boolean;
};

export type Werkbon = {
  id: string;
  created_at: string;
  werkbonnummer: string;
  lead_id: string;
  offerte_id: string | null;
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
};

export type Factuur = {
  id: string;
  created_at: string;
  factuurnummer: string;
  lead_id: string | null;
  klant: string;
  offerte_id: string | null;
  werkbon_id: string | null;
  bedrag: number;
  btw: number;
  totaal: number;
  status: string;
  betaaldatum: string | null;
};

export type Bestand = {
  id: string;
  created_at: string;
  lead_id: string | null;
  werkbon_id: string | null;
  factuur_id: string | null;
  categorie: string;
  bestandsnaam: string;
  pad: string;
  url: string;
};
