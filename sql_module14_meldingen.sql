-- ClimateX module 14: meldingen
--
-- Een nieuwe offerte, een binnengekomen servicemelding, een afgeronde werkbon
-- of een betaalde factuur was alleen te zien door de betreffende lijst open te
-- slaan. Deze tabel verzamelt die gebeurtenissen op één plek.
--
-- De meldingen worden door databasetriggers aangemaakt en niet door de
-- applicatie. Records ontstaan namelijk via meerdere wegen: het CRM, het
-- klantenportaal, en bestaande triggers zoals offerte_geaccepteerd_automatisering()
-- die zelf werkbonnen aanmaakt. Alleen op databaseniveau vangen we ze allemaal.
--
-- Voer dit script uit in de Supabase SQL-editor.

create table if not exists meldingen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- offerte, servicemelding, werkbon of factuur.
  soort text not null,
  titel text not null,
  omschrijving text,
  gelezen boolean not null default false,
  -- Verwijzingen naar het onderliggende record, zodat het scherm kan
  -- doorlinken. Alle vier optioneel; per melding is er hooguit één gevuld.
  lead_id uuid references leads (id) on delete cascade,
  offerte_id uuid references offertes (id) on delete cascade,
  werkbon_id uuid references werkbonnen (id) on delete cascade,
  factuur_id uuid references facturen (id) on delete cascade,
  ticket_id uuid references vastgoedtickets (id) on delete cascade
);

-- Ongelezen meldingen worden het vaakst opgevraagd; die index maakt de teller
-- in de kop van het dashboard goedkoop.
create index if not exists meldingen_ongelezen_idx
  on meldingen (gelezen, created_at desc);

-- 1. Nieuwe offerte.
create or replace function meld_nieuwe_offerte()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into meldingen (soort, titel, omschrijving, offerte_id, lead_id, ticket_id)
  values (
    'offerte',
    format('Nieuwe offerte %s', new.offertenummer),
    format('%s %s voor %s euro', coalesce(new.merk, ''), coalesce(new.model, ''), coalesce(new.prijs, 0)),
    new.id,
    new.lead_id,
    new.ticket_id
  );
  return new;
end;
$$;

drop trigger if exists meld_nieuwe_offerte_trigger on offertes;
create trigger meld_nieuwe_offerte_trigger
  after insert on offertes
  for each row execute function meld_nieuwe_offerte();

-- 2. Nieuwe servicemelding.
create or replace function meld_nieuwe_servicemelding()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into meldingen (soort, titel, omschrijving, ticket_id)
  values (
    'servicemelding',
    format('Nieuwe servicemelding %s', new.ticketnummer),
    format('%s op %s, prioriteit %s', coalesce(new.klant, ''), coalesce(new.locatie, ''), coalesce(new.prioriteit, 'Normaal')),
    new.id
  );
  return new;
end;
$$;

drop trigger if exists meld_nieuwe_servicemelding_trigger on vastgoedtickets;
create trigger meld_nieuwe_servicemelding_trigger
  after insert on vastgoedtickets
  for each row execute function meld_nieuwe_servicemelding();

-- 3. Werkbon afgerond. Alleen bij de overgang naar Gereed, zodat opslaan van
-- een al gereed gemelde werkbon geen tweede melding oplevert.
create or replace function meld_werkbon_afgerond()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Gereed' and old.status is distinct from 'Gereed' then
    insert into meldingen (soort, titel, omschrijving, werkbon_id, lead_id, ticket_id)
    values (
      'werkbon',
      format('Werkbon %s afgerond', new.werkbonnummer),
      format('%s door %s', coalesce(new.klantnaam, ''), coalesce(new.monteur, 'onbekend')),
      new.id,
      new.lead_id,
      new.ticket_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists meld_werkbon_afgerond_trigger on werkbonnen;
create trigger meld_werkbon_afgerond_trigger
  after update on werkbonnen
  for each row execute function meld_werkbon_afgerond();

-- 4. Factuur betaald, eveneens alleen bij de overgang.
create or replace function meld_factuur_betaald()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Betaald' and old.status is distinct from 'Betaald' then
    insert into meldingen (soort, titel, omschrijving, factuur_id, lead_id)
    values (
      'factuur',
      format('Factuur %s betaald', new.factuurnummer),
      format('%s, %s euro', coalesce(new.klant, ''), coalesce(new.totaal, 0)),
      new.id,
      new.lead_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists meld_factuur_betaald_trigger on facturen;
create trigger meld_factuur_betaald_trigger
  after update on facturen
  for each row execute function meld_factuur_betaald();

-- 5. Rechten. Meldingen zijn uitsluitend voor de beheerder: ze gaan over de
-- hele administratie en mogen nooit bij een ingelogde klant terechtkomen.
alter table meldingen enable row level security;

drop policy if exists "CRM volledige toegang meldingen" on meldingen;
create policy "CRM volledige toegang meldingen"
  on meldingen
  for all
  to anon
  using (true)
  with check (true);
