-- ClimateX module 11: facturen
--
-- Voegt drie kolommen toe aan de bestaande tabel `facturen`. Er wordt niets
-- hernoemd of verwijderd; bedrag, btw, totaal en status houden hun betekenis.
--
-- Voer dit script uit in de Supabase SQL-editor.

alter table facturen
  -- Betaallink van de betaaldienst (bijvoorbeeld Mollie of een Tikkie). Wordt
  -- in het CRM ingevuld en meegestuurd in de herinneringsmail.
  add column if not exists betaallink text,
  -- Uiterste betaaldatum. Leeg betekent: de standaardtermijn vanaf de
  -- factuurdatum, die de applicatie zelf uitrekent.
  add column if not exists vervaldatum date,
  -- Wanneer voor het laatst een herinnering is verstuurd. Voorkomt dat een
  -- klant bij elke klik opnieuw een mail krijgt.
  add column if not exists laatste_herinnering timestamptz;

-- Bestaande facturen krijgen een vervaldatum op basis van hun aanmaakdatum,
-- zodat het overzicht niet plotseling alles als "geen termijn" toont.
update facturen
set vervaldatum = (created_at + interval '14 days')::date
where vervaldatum is null;
