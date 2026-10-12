-- Träningsplaneraren — Slice 36 «Föreningens mallar», file 1 of 3: the table
-- Paste in Supabase → SQL Editor → Run. Run AFTER schema-31.sql and schema-32.sql (already live).
-- Safe to re-run: IF NOT EXISTS / OR REPLACE / DROP … IF EXISTS. Changes no existing table.
--
-- One row = one club template (föreningsmall). payload = the app's SharePass v1 JSON
-- (app/src/lib/sharePass.ts, same shape Spara som mall stores in savedTemplates.ts),
-- WITHOUT hallPlacements (E1: dropped on publish; the check below refuses them).
-- hidden = «Dölj för alla» (F1: no real delete; «Visa igen» sets it back to false).

begin;

create table if not exists public.club_templates (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(btrim(title)) between 1 and 80),
  total_minutes  integer not null check (total_minutes between 1 and 240),
  payload        jsonb not null
                 check (jsonb_typeof(payload) = 'object')
                 check (payload ->> 'v' = '1')
                 check (jsonb_typeof(payload -> 'blocks') = 'array')
                 check (not (payload ? 'hallPlacements'))
                 check (pg_column_size(payload) <= 65536),
  hidden         boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     text
);

-- Columns added later on a re-run of an older draft of this file.
alter table public.club_templates add column if not exists hidden     boolean not null default false;
alter table public.club_templates add column if not exists sort_order integer not null default 0;
alter table public.club_templates add column if not exists updated_by text;

-- ---------------------------------------------------------------- indexes
-- One title per club: publishing a pass with a title that already exists = overwrite (F1).
create unique index if not exists club_templates_title_key
  on public.club_templates (lower(btrim(title)));
-- The coach list: visible rows in list order.
create index if not exists club_templates_visible_idx
  on public.club_templates (sort_order, title) where not hidden;

-- ---------------------------------------------------------------- updated_at / updated_by
-- Reuses the Slice 31/32 functions: public.touch_row() (updated_at, id never changes)
-- and private.stamp_updated_by() (admin e-mail from auth.users, cannot be faked by the client).
drop trigger if exists club_templates_touch on public.club_templates;
create trigger club_templates_touch before insert or update on public.club_templates
  for each row execute function public.touch_row();

drop trigger if exists club_templates_stamp on public.club_templates;
create trigger club_templates_stamp before insert or update on public.club_templates
  for each row execute function private.stamp_updated_by();

commit;
