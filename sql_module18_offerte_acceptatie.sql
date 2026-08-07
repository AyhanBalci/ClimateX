-- ClimateX module 18: digitaal accepteren van offertes
--
-- De klant gaf akkoord met één knop in het portaal. Daarvan bleef alleen
-- status = 'Geaccepteerd' over. Niet vastgelegd werd: wanneer er akkoord is
-- gegeven, door welk account, met welke tekst, en waarmee precies akkoord is
-- gegaan. Bij een geschil over de prijs valt er dan niets aan te tonen.
--
-- Deze migratie voegt een acceptatietabel toe en beschermt een geaccepteerde
-- offerte tegen stille wijzigingen. Er wordt geen bestaande kolom gewijzigd of
-- verwijderd.
--
-- Voer dit script uit in de Supabase SQL-editor.

-- 1. De acceptatie zelf.
create table if not exists offerte_acceptaties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Uniek: hiermee is dubbele acceptatie op databaseniveau onmogelijk, ook als
  -- twee verzoeken tegelijk binnenkomen. De applicatie controleert het ook,
  -- maar die controle kent een racevenster en deze niet.
  offerte_id uuid not null unique references offertes (id) on delete cascade,
  geaccepteerd_op timestamptz not null default now(),
  -- Het portaalaccount dat akkoord gaf. Server-side vastgesteld uit het
  -- toegangstoken, nooit uit iets wat de browser meestuurt.
  klant_user_id uuid not null,
  -- De tekst die de klant letterlijk heeft aangevinkt. Verandert die tekst
  -- later, dan blijft hier staan waarmee déze klant akkoord ging.
  akkoordtekst text not null,
  -- De offerte zoals die op het moment van accepteren was: nummer, bedrag,
  -- product, werkzaamheden en geldigheidsdatum. Hiermee is achteraf aantoonbaar
  -- waarmee akkoord is gegeven, ook als de offerte daarna zou wijzigen.
  offerte_momentopname jsonb not null
);

create index if not exists offerte_acceptaties_offerte_id_idx
  on offerte_acceptaties (offerte_id);

-- 2. Een geaccepteerde offerte mag niet stilzwijgend wijzigen.
--
-- Status mag wél veranderen: de bestaande automatisering zet daar processen op
-- in gang. Geblokkeerd worden de commerciële velden, want die bepalen waar de
-- klant ja tegen zei. Is een wijziging nodig, dan hoort er een nieuwe offerte
-- te komen met een eigen nummer.
create or replace function blokkeer_wijziging_geaccepteerde_offerte()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from offerte_acceptaties a where a.offerte_id = old.id) then
    if new.prijs is distinct from old.prijs
       or new.merk is distinct from old.merk
       or new.model is distinct from old.model
       or new.werkzaamheden is distinct from old.werkzaamheden
       or new.opmerkingen is distinct from old.opmerkingen
       or new.datum is distinct from old.datum
       or new.offertenummer is distinct from old.offertenummer
    then
      raise exception
        'Offerte % is door de klant geaccepteerd en mag inhoudelijk niet meer wijzigen. Maak een nieuwe offerte.',
        old.offertenummer
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists blokkeer_wijziging_geaccepteerde_offerte_trigger on offertes;
create trigger blokkeer_wijziging_geaccepteerde_offerte_trigger
  before update on offertes
  for each row
  execute function blokkeer_wijziging_geaccepteerde_offerte();

-- 3. Rechten. De acceptatie wordt uitsluitend server-side weggeschreven met de
-- service-role key, dus anon en authenticated krijgen alleen leesrechten.
-- Zonder schrijfrecht kan niemand vanuit de browser een akkoord fabriceren.
alter table offerte_acceptaties enable row level security;

drop policy if exists "CRM leest acceptaties" on offerte_acceptaties;
create policy "CRM leest acceptaties"
  on offerte_acceptaties
  for select
  to anon
  using (true);

drop policy if exists "Klant leest eigen acceptaties" on offerte_acceptaties;
create policy "Klant leest eigen acceptaties"
  on offerte_acceptaties
  for select
  to authenticated
  using (klant_user_id = auth.uid());

-- 4. Bestaande geaccepteerde offertes krijgen GEEN acceptatierecord.
--
-- Dat is bewust. Van die offertes is niet bekend wanneer of door wie akkoord
-- is gegeven; een record met een verzonnen tijdstip zou juist het tegendeel
-- doen van wat deze tabel moet bereiken. Ze houden hun status en zijn te
-- herkennen doordat er geen acceptatie bij hoort.
