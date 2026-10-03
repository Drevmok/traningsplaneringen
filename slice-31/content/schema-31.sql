-- Träningsplaneraren — shared bank, Slice 31 (read-only)
-- Run once in Supabase → SQL Editor (paste + Run). Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE.
-- Then run the generated seed file (tools/bank/out/bank-seed.sql, see migration-plan.md).
--
-- Rules this file enforces:
--   * Only two tables are readable by the app: public.redskap and public.exercises.
--   * Anyone with the public (publishable / anon) key may SELECT. Nobody may INSERT/UPDATE/DELETE
--     through the public API in Slice 31 (no write policies exist; grants revoked).
--   * Status 'pending' rows (Slice 32) are never readable with the public key.
--   * Limits mirror the app's own-exercise limits (ownActivities.ts / import-schema.md v1).

begin;

-- ---------------------------------------------------------------- types
do $$ begin
  create type public.block_type as enum ('gathering', 'warmup', 'techniques', 'strength', 'fun_and_games');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.difficulty as enum ('intro', 'easy', 'medium', 'hard');
exception when duplicate_object then null; end $$;

-- published = in Biblioteket for everyone
-- hidden    = "Dold": not listed, but still resolvable by id so old passes / mallar / share links keep their text
-- pending   = Slice 32: written by a bot, waiting for an admin's Godkänn (never visible to coaches)
do $$ begin
  create type public.exercise_status as enum ('published', 'hidden', 'pending');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- redskap
-- Reference list. The app's icons, StationSketch marks, hall zones and Förrådslista are CODE
-- (equipmentPieces.ts, equipmentMark.tsx, StationSketch.tsx, hallSuggest.ts), so adding a row here
-- does NOT add a new piece to the app — that stays a code slice. The app uses this table for labels
-- (labelSv) of ids it already knows, and the DB uses it to validate exercise redskap ids.
create table if not exists public.redskap (
  id          text primary key check (id ~ '^eq-[a-z0-9-]{2,40}$'),
  label_sv    text not null check (char_length(label_sv) between 1 and 40),
  visual_key  text not null check (char_length(visual_key) between 1 and 60),
  sort_order  integer not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- exercises
create table if not exists public.exercises (
  id                        text primary key
                            check (id ~ '^(gather|warm|tech|strength|fun)-[a-z0-9-]{2,60}$'),
  block_type                public.block_type not null,
  title                     text not null check (char_length(title) between 1 and 80),
  duration_minutes_default  integer not null check (duration_minutes_default between 1 and 180),
  summary                   text not null check (char_length(summary) between 1 and 240),      -- Varför
  how_to                    text not null check (char_length(how_to) between 1 and 800),       -- "1. …\n2. …" (1–4 steps, app re-checks)
  watch_for                 text not null check (char_length(watch_for) between 1 and 240),    -- Se upp för
  watch_for_required        boolean not null default true,
  safety_line               text check (safety_line is null or char_length(safety_line) between 1 and 240), -- Säkerhet
  visual_key                text not null check (char_length(visual_key) between 1 and 60),
  difficulty                public.difficulty not null default 'easy',
  tags                      text[] not null default '{}'
                            check (cardinality(tags) <= 8),
  default_station_equipment jsonb
                            check (default_station_equipment is null or jsonb_typeof(default_station_equipment) = 'array'),
  legacy_equipment          text[],                                   -- Activity.equipment (legacy free text; 1 seed uses it)
  progression_of            text references public.exercises(id) on delete set null deferrable initially deferred,
  regression_of             text references public.exercises(id) on delete set null deferrable initially deferred,
  experienced_coach_only    boolean not null default false,
  new_coach_ok              boolean not null default false,
  needs_coach_review        boolean not null default false,
  source                    jsonb                                     -- { url, creator, title?, startSeconds? }
                            check (
                              source is null or (
                                jsonb_typeof(source) = 'object'
                                and source ->> 'url' like 'https://%'
                                and char_length(source ->> 'url') <= 300
                                and char_length(coalesce(source ->> 'creator', '')) between 1 and 80
                              )
                            ),
  status                    public.exercise_status not null default 'published',
  sort_order                integer not null default 10000,          -- keeps today's Biblioteket order
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  updated_by                text,                                     -- 'seed-script' · admin e-mail · 'bot:planner' (Slice 32)
  -- same rule as needsSafetyLine(): every block except Samling needs a Säkerhet line
  constraint exercises_safety_required check (block_type = 'gathering' or safety_line is not null),
  -- redskap suggestions only on Teknik (Slice 13 / import-schema v1)
  constraint exercises_redskap_teknik_only check (block_type = 'techniques' or default_station_equipment is null)
);

create index if not exists exercises_status_sort_idx on public.exercises (status, sort_order);

-- Redskap ids inside default_station_equipment must exist in public.redskap; count 1–9; max 8 slots.
create or replace function public.check_exercise_redskap() returns trigger
language plpgsql set search_path = '' as $$
declare slot jsonb;
begin
  if new.default_station_equipment is null then return new; end if;
  if jsonb_array_length(new.default_station_equipment) > 8 then
    raise exception 'högst 8 redskap per station (%).', new.id;
  end if;
  for slot in select * from jsonb_array_elements(new.default_station_equipment) loop
    if not exists (select 1 from public.redskap r where r.id = slot ->> 'pieceId') then
      raise exception 'okänt redskap % i %', slot ->> 'pieceId', new.id;
    end if;
    if coalesce((slot ->> 'count')::int, 0) not between 1 and 9 then
      raise exception 'antal 1–9 för % i %', slot ->> 'pieceId', new.id;
    end if;
  end loop;
  return new;
end $$;

-- updated_at always moves; id never changes (passes reference it).
create or replace function public.touch_row() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.id is distinct from old.id then
    raise exception 'id kan inte ändras (%)', old.id;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists exercises_redskap_check on public.exercises;
create trigger exercises_redskap_check before insert or update on public.exercises
  for each row execute function public.check_exercise_redskap();

drop trigger if exists exercises_touch on public.exercises;
create trigger exercises_touch before insert or update on public.exercises
  for each row execute function public.touch_row();

drop trigger if exists redskap_touch on public.redskap;
create trigger redskap_touch before insert or update on public.redskap
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------- row-level security
alter table public.redskap   enable row level security;
alter table public.exercises enable row level security;

-- Least privilege: the public roles may only read.
revoke all on public.redskap, public.exercises from anon, authenticated;
grant select on public.redskap, public.exercises to anon, authenticated;

drop policy if exists redskap_read_all on public.redskap;
create policy redskap_read_all on public.redskap
  for select to anon, authenticated
  using (true);

drop policy if exists exercises_read_public on public.exercises;
create policy exercises_read_public on public.exercises
  for select to anon, authenticated
  using (status in ('published', 'hidden'));

-- No INSERT / UPDATE / DELETE policies in Slice 31 → every write through the public API is refused.
-- Seeding is done by pasting bank-seed.sql into the SQL Editor (runs as the project owner).

commit;
