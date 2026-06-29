-- ClimateX: herstel RLS-lek op leads en offertes
-- Probleem: een ingelogde klant kan momenteel ALLE leads en offertes zien,
-- niet alleen de eigen. Oorzaak: er staat nog een oude/overgebleven policy
-- op deze twee tabellen die "authenticated" (of all) te ruim toegang geeft.
--
-- Deze fix verwijdert ALLE bestaande policies op leads en offertes (ongeacht
-- naam), en zet voor elke tabel exact twee schone policies terug:
--   1. CRM (anon-key) houdt volledige toegang -> dashboard blijft werken.
--   2. Een ingelogde klant ziet alleen rijen die aan zijn eigen account
--      gekoppeld zijn (alleen lezen, geen schrijfrechten via deze policy).
--
-- Voer dit script uit in de Supabase SQL-editor. Er wordt geen data
-- verwijderd en geen kolom aangepast.

alter table leads enable row level security;
alter table offertes enable row level security;

-- 1. Alle bestaande policies op leads en offertes verwijderen, ongeacht naam.
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('leads', 'offertes')
  loop
    execute format('drop policy if exists %I on %I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- 2. Leads: CRM (anon) houdt volledige toegang.
create policy "CRM volledige toegang leads"
  on leads
  for all
  to anon
  using (true)
  with check (true);

-- 3. Leads: klant ziet uitsluitend zijn eigen lead(s).
create policy "Klant ziet eigen leads"
  on leads
  for select
  to authenticated
  using (auth.uid() = klant_user_id);

-- 4. Offertes: CRM (anon) houdt volledige toegang.
create policy "CRM volledige toegang offertes"
  on offertes
  for all
  to anon
  using (true)
  with check (true);

-- 5. Offertes: klant ziet uitsluitend offertes die horen bij zijn eigen
-- lead (via lead_id) of zijn eigen vastgoedticket (via ticket_id).
create policy "Klant ziet eigen offertes"
  on offertes
  for select
  to authenticated
  using (
    exists (
      select 1 from leads
      where leads.id = offertes.lead_id
        and leads.klant_user_id = auth.uid()
    )
    or exists (
      select 1 from vastgoedtickets
      where vastgoedtickets.id = offertes.ticket_id
        and vastgoedtickets.klant_user_id = auth.uid()
    )
  );
