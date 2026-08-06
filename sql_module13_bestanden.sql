-- ClimateX module 13: bestanden
--
-- Voegt twee kolommen toe aan de bestaande tabel `bestanden`, zodat het
-- overzicht kan tonen hoe groot een bestand is en wat voor soort het is zonder
-- dat uit de bestandsnaam te moeten raden.
--
-- Voer dit script uit in de Supabase SQL-editor.

alter table bestanden
  -- Omvang in bytes, zoals de browser die bij het uploaden doorgeeft.
  add column if not exists grootte bigint,
  -- Het MIME-type, bijvoorbeeld image/jpeg of application/pdf.
  add column if not exists mimetype text;

-- LET OP: de opslag zelf staat los van dit script.
--
-- De applicatie schrijft naar de bucket `climatex-bestanden`. Controleer in het
-- Supabase-dashboard onder Storage of die bucket bestaat en of de policies
-- kloppen:
--
--   1. Maak de bucket `climatex-bestanden` aan als die er nog niet is.
--   2. De bucket staat op publiek, omdat de applicatie met getPublicUrl werkt
--      en die links in het CRM, de PDF's en het klantenportaal gebruikt.
--      Zet je de bucket op privé, dan moeten die plekken overstappen op
--      ondertekende URL's; alleen deze kolommen toevoegen is dan niet genoeg.
--   3. Zorg dat de anon-rol mag uploaden, lezen en verwijderen in deze bucket,
--      anders mislukt het uploaden vanuit het dashboard.
