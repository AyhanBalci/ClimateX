-- ClimateX module 7: klantenbeheer
--
-- Voegt twee tabellen toe die aan een bestaande lead hangen. De lead is in dit
-- project al de klantrecord (facturen, werkbonnen en planning verwijzen er via
-- lead_id naar), dus er komt bewust GEEN aparte klantentabel bij. Dat zou elke
-- bestaande koppeling moeten verhuizen en levert niets op wat deze twee
-- tabellen niet ook geven.
--
-- Er wordt geen bestaande tabel of kolom gewijzigd en geen data verwijderd.
-- Voer dit script uit in de Supabase SQL-editor.

-- 1. Contactpersonen bij een klant.
create table if not exists klant_contactpersonen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references leads (id) on delete cascade,
  naam text not null,
  functie text,
  email text,
  telefoon text,
  -- De hoofdcontactpersoon staat bovenaan in het profiel.
  is_primair boolean not null default false
);

create index if not exists klant_contactpersonen_lead_id_idx
  on klant_contactpersonen (lead_id);

-- 2. Adressen bij een klant. Een klant kan een ander factuuradres dan
-- installatieadres hebben; daarom is dit een aparte tabel en geen kolom.
create table if not exists klant_adressen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references leads (id) on delete cascade,
  -- Installatie, Facturatie, Bezoek of Overig.
  soort text not null default 'Installatie',
  straat text,
  huisnummer text,
  postcode text,
  plaats text,
  land text not null default 'Nederland',
  is_primair boolean not null default false
);

create index if not exists klant_adressen_lead_id_idx
  on klant_adressen (lead_id);

-- 3. Rechten. Zelfde opzet als de bestaande tabellen: het CRM werkt met de
-- anon-key en houdt volledige toegang; een ingelogde klant mag uitsluitend de
-- eigen gegevens lezen en niets schrijven.
alter table klant_contactpersonen enable row level security;
alter table klant_adressen enable row level security;

drop policy if exists "CRM volledige toegang klant_contactpersonen" on klant_contactpersonen;
create policy "CRM volledige toegang klant_contactpersonen"
  on klant_contactpersonen
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Klant ziet eigen contactpersonen" on klant_contactpersonen;
create policy "Klant ziet eigen contactpersonen"
  on klant_contactpersonen
  for select
  to authenticated
  using (
    exists (
      select 1 from leads
      where leads.id = klant_contactpersonen.lead_id
        and leads.klant_user_id = auth.uid()
    )
  );

drop policy if exists "CRM volledige toegang klant_adressen" on klant_adressen;
create policy "CRM volledige toegang klant_adressen"
  on klant_adressen
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Klant ziet eigen adressen" on klant_adressen;
create policy "Klant ziet eigen adressen"
  on klant_adressen
  for select
  to authenticated
  using (
    exists (
      select 1 from leads
      where leads.id = klant_adressen.lead_id
        and leads.klant_user_id = auth.uid()
    )
  );
