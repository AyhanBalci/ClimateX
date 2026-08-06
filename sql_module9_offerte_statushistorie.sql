-- ClimateX module 9: statushistorie voor offertes
--
-- Leads en servicemeldingen houden hun statusverloop al bij; offertes niet.
-- Daardoor was achteraf niet te zien wanneer een offerte verstuurd is of
-- wanneer de klant akkoord gaf.
--
-- Het loggen gebeurt met een databasetrigger en niet in de applicatie. De
-- offertestatus verandert namelijk via drie verschillende wegen: het CRM, de
-- functie klant_accepteer_offerte() vanuit het klantenportaal, en de bestaande
-- trigger offerte_geaccepteerd_automatisering(). Logging in de applicatie zou
-- de laatste twee missen.
--
-- Voer dit script uit in de Supabase SQL-editor. Er wordt geen bestaande tabel
-- of kolom gewijzigd.

create table if not exists offerte_status_historie (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  offerte_id uuid not null references offertes (id) on delete cascade,
  status text not null,
  -- Waar de wijziging vandaan kwam, voor als een status onverwacht wijzigt.
  bron text
);

create index if not exists offerte_status_historie_offerte_id_idx
  on offerte_status_historie (offerte_id, created_at desc);

-- 1. Trigger die elke statuswijziging vastlegt.
create or replace function log_offerte_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Alleen loggen als de status echt verandert. Een update van bijvoorbeeld de
  -- prijs mag geen extra regel in de historie opleveren.
  if tg_op = 'INSERT' then
    insert into offerte_status_historie (offerte_id, status, bron)
    values (new.id, new.status, 'aangemaakt');
  elsif new.status is distinct from old.status then
    insert into offerte_status_historie (offerte_id, status, bron)
    values (new.id, new.status, coalesce(current_setting('app.bron', true), 'systeem'));
  end if;

  return new;
end;
$$;

drop trigger if exists offerte_status_historie_trigger on offertes;
create trigger offerte_status_historie_trigger
  after insert or update on offertes
  for each row
  execute function log_offerte_status();

-- 2. Bestaande offertes krijgen een beginregel, zodat de tijdlijn niet leeg is
-- voor offertes die al bestonden voordat deze migratie draaide.
insert into offerte_status_historie (offerte_id, status, bron, created_at)
select o.id, o.status, 'bestaand', coalesce(o.datum::timestamptz, now())
from offertes o
where not exists (
  select 1 from offerte_status_historie h where h.offerte_id = o.id
);

-- 3. Rechten. Zelfde opzet als de andere tabellen: het CRM werkt met de
-- anon-key, een ingelogde klant mag alleen de eigen historie lezen.
alter table offerte_status_historie enable row level security;

drop policy if exists "CRM volledige toegang offerte_status_historie" on offerte_status_historie;
create policy "CRM volledige toegang offerte_status_historie"
  on offerte_status_historie
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "Klant ziet eigen offertehistorie" on offerte_status_historie;
create policy "Klant ziet eigen offertehistorie"
  on offerte_status_historie
  for select
  to authenticated
  using (
    exists (
      select 1
      from offertes o
      left join leads l on l.id = o.lead_id
      left join vastgoedtickets v on v.id = o.ticket_id
      where o.id = offerte_status_historie.offerte_id
        and (l.klant_user_id = auth.uid() or v.klant_user_id = auth.uid())
    )
  );
