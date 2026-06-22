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
