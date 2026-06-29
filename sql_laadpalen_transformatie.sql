-- ClimateX: transformatie van airco naar laadpalen
-- Voer dit script uit in de Supabase SQL-editor.
-- Alle bestaande tabellen, RLS-policies en data blijven behouden;
-- dit script voegt alleen kolommen en één nieuwe policy toe.

-- 1. Leads: laadpaal-intakevelden (vervangen de airco-specifieke vragen in het leadformulier)
alter table leads add column if not exists aantal_laadpunten integer;
alter table leads add column if not exists automerk text;
alter table leads add column if not exists automodel text;
alter table leads add column if not exists elektrisch_voertuig boolean default false;
alter table leads add column if not exists aansluiting text;
alter table leads add column if not exists huidige_meterkast text;
alter table leads add column if not exists parkeerplaats text;
alter table leads add column if not exists afstand_meterkast_meters numeric;
alter table leads add column if not exists kabellengte_meters numeric;
alter table leads add column if not exists load_balancing boolean default false;
alter table leads add column if not exists dynamic_load_balancing boolean default false;

-- 2. Werkbonnen: laadpaalinstallatie-gegevens
alter table werkbonnen add column if not exists serienummer text;
alter table werkbonnen add column if not exists testresultaten text;

-- 3. Producten: handleiding-url (nieuw klantenportaal-onderdeel "Handleidingen")
-- Let op: koelvermogen / verwarmvermogen / energieklasse zijn bewust NIET hernoemd
-- (bestaande architectuur blijft staan) maar worden nu gebruikt voor laadvermogen,
-- slimme functies en "geschikt voor". Alleen handleiding_url is een echt nieuwe kolom.
alter table producten add column if not exists handleiding_url text;

-- 4. Nieuwe RLS-policy: klant mag zelf een storing (vastgoedticket) aanmaken
-- vanuit het klantenportaal ("Storing melden"). Dit bestond nog niet; klanten
-- konden tot nu toe alleen hun eigen tickets BEKIJKEN, niet aanmaken.
drop policy if exists "Klant meldt eigen storing" on vastgoedtickets;
create policy "Klant meldt eigen storing"
  on vastgoedtickets
  for insert
  to authenticated
  with check (auth.uid() = klant_user_id);

-- Bijbehorende policy zodat de status-historie van een zelf aangemaakte storing
-- ook opgeslagen kan worden door de klant.
drop policy if exists "Klant logt historie eigen storing" on ticket_status_historie;
create policy "Klant logt historie eigen storing"
  on ticket_status_historie
  for insert
  to authenticated
  with check (
    exists (
      select 1 from vastgoedtickets
      where vastgoedtickets.id = ticket_status_historie.ticket_id
        and vastgoedtickets.klant_user_id = auth.uid()
    )
  );
