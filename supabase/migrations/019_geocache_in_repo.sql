-- The town-centre geocode cache, written down at last.
-- Safe to re-run; mirrored into supabase/schema.sql for fresh projects.
--
-- `geocache` was created by hand in the SQL editor when city-level geocoding
-- was first set up and never saved to the repository. Every existing database
-- already has it. A fresh one built from schema.sql did not — and since 017
-- alters its policies, a fresh install stopped with "relation geocache does not
-- exist". This puts the table where a new project will create it.
--
-- One row per place name, filled from scripts/geocode_cities.py; the
-- coordinates are copied onto company_locations (see HANDOFF.md, "Map and
-- geocoding"). Members may read and write it: it holds town centres, nothing
-- about anybody.

create table if not exists geocache (
  place       text primary key,
  latitude    double precision,
  longitude   double precision,
  county      text,
  created_at  timestamptz not null default now()
);

alter table geocache enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='geocache' and policyname='geocache_read') then
    create policy geocache_read on geocache for select using ((select is_member()));
  end if;
  if not exists (select 1 from pg_policies where tablename='geocache' and policyname='geocache_write') then
    create policy geocache_write on geocache for insert with check ((select is_member()));
  end if;
  if not exists (select 1 from pg_policies where tablename='geocache' and policyname='geocache_update') then
    create policy geocache_update on geocache for update
      using ((select is_member())) with check ((select is_member()));
  end if;
end $$;
