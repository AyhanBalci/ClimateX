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
  leads?: { naam: string } | null;
};
