-- Träningsplaneraren — Slice 68 «Föreningens redskap», fil 1 av 2: tabell + RLS
-- Klistra in i Supabase → SQL Editor → Run, EFTER schema-31, schema-32 och Slice 36
-- (club_templates). Säker att köra om: IF NOT EXISTS / DROP … IF EXISTS.
-- Additivt. Ingen DELETE, inget --replace. Ändrar inte club_templates, exercises eller redskap.
--
-- En rad (id = 'club') = föreningens tillgängliga redskap.
-- piece_ids = jsonb-array med id från appens EQUIPMENT_PIECES som föreningen har.
-- Tom array är giltig («inget av de 15»). Ingen rad = inte ifylld (appen räknar då alla 15 som tillgängliga).
--
-- Regler:
--   * Alla med publishable key (roll anon) får SELECT.
--   * Admin (private.is_admin(), schema-32) får SELECT, INSERT och UPDATE.
--   * Ingen får DELETE via API: ingen delete-policy, ingen delete-grant.
--   * Tränare har inga konton. En inloggad icke-admin får samma läsning som anon, ingen skrivning.
--   * service_role får inget på tabellen.
-- Körs bara efter merge, och bara efter Christoffers separata ja. Agenter kör aldrig filen.

begin;

create table if not exists public.club_equipment (
  id          text primary key default 'club' check (id = 'club'),
  piece_ids   jsonb not null
              check (jsonb_typeof(piece_ids) = 'array'),
  updated_at  timestamptz not null default now(),
  updated_by  text
);

alter table public.club_equipment add column if not exists piece_ids  jsonb not null default '[]'::jsonb;
alter table public.club_equipment add column if not exists updated_at timestamptz not null default now();
alter table public.club_equipment add column if not exists updated_by text;

-- default-värdet ovan gäller bara add column if not exists på en redan skapad tabell
-- utan kolumnen; den vanliga create-satsen kräver en explicit lista vid insert.

drop trigger if exists club_equipment_touch on public.club_equipment;
create trigger club_equipment_touch before insert or update on public.club_equipment
  for each row execute function public.touch_row();

drop trigger if exists club_equipment_stamp on public.club_equipment;
create trigger club_equipment_stamp before insert or update on public.club_equipment
  for each row execute function private.stamp_updated_by();

alter table public.club_equipment enable row level security;

revoke all on public.club_equipment from anon, authenticated, service_role;
grant select on public.club_equipment to anon, authenticated;
grant insert, update on public.club_equipment to authenticated;

drop policy if exists club_equipment_read_public on public.club_equipment;
create policy club_equipment_read_public on public.club_equipment
  for select to anon, authenticated
  using (true);

drop policy if exists club_equipment_admin_insert on public.club_equipment;
create policy club_equipment_admin_insert on public.club_equipment
  for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists club_equipment_admin_update on public.club_equipment;
create policy club_equipment_admin_update on public.club_equipment
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- (ingen DELETE-policy med avsikt)

commit;
