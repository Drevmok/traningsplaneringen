-- Träningsplaneraren — Slice 36 «Föreningens mallar», file 2 of 3: who may read and write
-- Paste in Supabase → SQL Editor → Run, after 36-01-table.sql. Safe to re-run.
--
-- Rules:
--   * Anyone with the publishable key (sb_publishable_…, role anon) may SELECT rows with hidden = false.
--   * Admins (public.admins via private.is_admin(), from schema-32.sql) may SELECT all rows,
--     INSERT and UPDATE (publish, overwrite, Dölj för alla, Visa igen).
--   * Nobody may DELETE through the API: no delete policy, no delete grant.
--   * Coaches have no accounts. A non-admin signed-in user gets the same read as anon and no writes.
--   * service_role (sb_secret_…) gets nothing on this table: no bot writes in Slice 36.

begin;

alter table public.club_templates enable row level security;

-- ---------------------------------------------------------------- grants (least privilege)
revoke all on public.club_templates from anon, authenticated, service_role;
grant select on public.club_templates to anon, authenticated;
grant insert, update on public.club_templates to authenticated;   -- still gated by the policies below

-- ---------------------------------------------------------------- policies
drop policy if exists club_templates_read_public on public.club_templates;
create policy club_templates_read_public on public.club_templates
  for select to anon, authenticated
  using (not hidden);

drop policy if exists club_templates_admin_read_all on public.club_templates;
create policy club_templates_admin_read_all on public.club_templates
  for select to authenticated
  using ((select private.is_admin()));                          -- admins also see hidden rows

drop policy if exists club_templates_admin_insert on public.club_templates;
create policy club_templates_admin_insert on public.club_templates
  for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists club_templates_admin_update on public.club_templates;
create policy club_templates_admin_update on public.club_templates
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- (no DELETE policy on purpose)

commit;
