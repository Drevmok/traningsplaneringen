-- Träningsplaneraren — Slice 32 additions: admins + admin writes (run after schema-31.sql)
-- Paste in Supabase → SQL Editor → Run. Safe to re-run.
--
-- Rules:
--   * Only signed-in users listed in public.admins can INSERT/UPDATE exercises (and see 'pending').
--   * Nobody can DELETE through the API (no delete policy, no delete grant) → "Dölj" = status 'hidden'.
--   * The admins list itself is edited only by the project owner in the SQL Editor (no write policy).
--   * The bot's secret key (sb_secret_…) bypasses RLS by design — it lives only on the box (bot-writes.md).

begin;

-- ---------------------------------------------------------------- admins
create table if not exists public.admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  email     text not null,
  added_at  timestamptz not null default now(),
  note      text
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

-- A signed-in user can see only their own admin row → the app asks "am I admin?" with one SELECT.
drop policy if exists admins_read_self on public.admins;
create policy admins_read_self on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Helper used by policies. In a non-exposed schema so it is not callable as an RPC endpoint.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------- exercises: admin policies
grant insert, update on public.exercises to authenticated;   -- still gated by the policies below
-- (no DELETE grant on purpose)
-- Bot (secret key → role service_role, bypasses RLS). Grant explicitly, still without DELETE.
revoke delete on public.exercises from service_role;
grant select, insert, update on public.exercises to service_role;
grant select on public.redskap to service_role;

drop policy if exists exercises_admin_read_all on public.exercises;
create policy exercises_admin_read_all on public.exercises
  for select to authenticated
  using ((select private.is_admin()));                        -- admins also see 'pending'

drop policy if exists exercises_admin_insert on public.exercises;
create policy exercises_admin_insert on public.exercises
  for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists exercises_admin_update on public.exercises;
create policy exercises_admin_update on public.exercises
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Redskap stay read-only for everyone (adding a piece is a code slice).

-- ---------------------------------------------------------------- who changed it
-- Admin writes: updated_by = their e-mail (cannot be faked from the client).
-- Bot writes (secret key, no user): keeps the value the bot sends, e.g. 'bot:planner'; else 'service'.
-- Lives in the non-exposed `private` schema and nobody may call it directly (Security Advisor
-- lints 0028/0029: no SECURITY DEFINER function reachable via /rest/v1/rpc). Triggers need no EXECUTE.
create or replace function private.stamp_updated_by() returns trigger
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is not null then
    select u.email into new.updated_by from auth.users u where u.id = uid;
  elsif new.updated_by is null then
    new.updated_by := 'service';
  end if;
  return new;
end $$;
revoke all on function private.stamp_updated_by() from public, anon, authenticated, service_role;

drop trigger if exists exercises_stamp on public.exercises;
create trigger exercises_stamp before insert or update on public.exercises
  for each row execute function private.stamp_updated_by();

-- An older run of this file put the function in public: remove that exposed copy (no trigger uses it now).
drop function if exists public.stamp_updated_by();

commit;

-- ---------------------------------------------------------------- one-time: make Christoffer admin
-- 1) Authentication → Users → Add user → (your e-mail) → create.  2) Then run:
--
--   insert into public.admins (user_id, email, note)
--   select id, email, 'owner' from auth.users where email = 'DIN-EPOST@exempel.se'
--   on conflict (user_id) do nothing;
--
-- Remove an admin:  delete from public.admins where email = '…';   (SQL Editor only)
