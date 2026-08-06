-- ClimateX module 8: producten
--
-- Voegt kolommen toe aan de bestaande tabel `producten`. Er wordt geen kolom
-- hernoemd of verwijderd: de bestaande kolom `prijs` blijft de verkoopprijs en
-- houdt precies de betekenis die offertes en de productcatalogus er nu al aan
-- geven.
--
-- Voer dit script uit in de Supabase SQL-editor.

alter table producten
  -- Productcategorie, zodat de catalogus meer dan alleen laadpalen aankan.
  add column if not exists categorie text not null default 'Laadpaal',
  -- Inkoopprijs: alleen voor intern gebruik, nooit richting de klant.
  add column if not exists inkoopprijs numeric(10, 2),
  -- Adviesprijs van de fabrikant, als vergelijking naast de eigen verkoopprijs.
  add column if not exists adviesprijs numeric(10, 2),
  -- Installatiekosten staan los van de productprijs, zodat een offerte het
  -- product en het werk apart kan tonen.
  add column if not exists installatiekosten numeric(10, 2) not null default 0,
  -- BTW-percentage per product. Standaard het algemene tarief.
  add column if not exists btw_percentage numeric(5, 2) not null default 21;

create index if not exists producten_categorie_idx on producten (categorie);

-- Bestaande rijen krijgen expliciet de standaardwaarden mee, zodat er geen
-- product zonder categorie of BTW-tarief achterblijft.
update producten
set categorie = coalesce(nullif(trim(categorie), ''), 'Laadpaal')
where categorie is null or trim(categorie) = '';
