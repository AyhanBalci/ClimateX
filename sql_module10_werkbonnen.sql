-- ClimateX module 10: werkbonnen
--
-- De werkbon had één vrij tekstveld voor materialen en registreerde geen uren.
-- Daardoor was er niets uit te rekenen: niet het materiaalverbruik, niet de
-- bestede tijd en niet wat er doorbelast moet worden op de factuur.
--
-- Deze migratie voegt twee tabellen toe. De bestaande kolom `materialen` op
-- werkbonnen blijft staan en wordt niet gemigreerd of leeggemaakt: daar staat
-- bij bestaande werkbonnen vrije tekst in die niet betrouwbaar in regels te
-- splitsen is. Het scherm toont die tekst voortaan als toelichting naast de
-- regels.
--
-- Voer dit script uit in de Supabase SQL-editor.

-- 1. Materiaalregels.
create table if not exists werkbon_materialen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  werkbon_id uuid not null references werkbonnen (id) on delete cascade,
  omschrijving text not null,
  aantal numeric(10, 2) not null default 1,
  eenheid text not null default 'stuk',
  -- Prijs per eenheid, exclusief BTW. Leeg betekent: niet doorbelasten.
  eenheidsprijs numeric(10, 2)
);

create index if not exists werkbon_materialen_werkbon_id_idx
  on werkbon_materialen (werkbon_id);

-- 2. Urenregistratie. Meerdere regels per werkbon, zodat een klus over
-- meerdere dagen of meerdere monteurs uit elkaar te houden is.
create table if not exists werkbon_uren (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  werkbon_id uuid not null references werkbonnen (id) on delete cascade,
  monteur text not null,
  datum date not null default current_date,
  uren numeric(6, 2) not null default 0,
  omschrijving text,
  -- Uurtarief exclusief BTW. Leeg betekent: niet doorbelasten.
  uurtarief numeric(10, 2)
);

create index if not exists werkbon_uren_werkbon_id_idx
  on werkbon_uren (werkbon_id);

-- 3. Rechten. Zelfde opzet als de bestaande tabellen: het CRM werkt met de
-- anon-key, een ingelogde klant mag alleen de eigen regels lezen.
alter table werkbon_materialen enable row level security;
alter table werkbon_uren enable row level security;

drop policy if exists "CRM volledige toegang werkbon_materialen" on werkbon_materialen;
create policy "CRM volledige toegang werkbon_materialen"
  on werkbon_materialen
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Klant ziet eigen werkbonmaterialen" on werkbon_materialen;
create policy "Klant ziet eigen werkbonmaterialen"
  on werkbon_materialen
  for select
  to authenticated
  using (
    exists (
      select 1
      from werkbonnen w
      left join leads l on l.id = w.lead_id
      left join vastgoedtickets v on v.id = w.ticket_id
      where w.id = werkbon_materialen.werkbon_id
        and (l.klant_user_id = auth.uid() or v.klant_user_id = auth.uid())
    )
  );

drop policy if exists "CRM volledige toegang werkbon_uren" on werkbon_uren;
create policy "CRM volledige toegang werkbon_uren"
  on werkbon_uren
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Klant ziet eigen werkbonuren" on werkbon_uren;
create policy "Klant ziet eigen werkbonuren"
  on werkbon_uren
  for select
  to authenticated
  using (
    exists (
      select 1
      from werkbonnen w
      left join leads l on l.id = w.lead_id
      left join vastgoedtickets v on v.id = w.ticket_id
      where w.id = werkbon_uren.werkbon_id
        and (l.klant_user_id = auth.uid() or v.klant_user_id = auth.uid())
    )
  );
