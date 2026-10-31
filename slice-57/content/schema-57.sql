-- Slice 57 — default_station_layout (redigerbar 2,5D-stationsskiss, redo för 3D senare)
-- Christoffer klistrar in själv i Supabase SQL Editor efter OK. Körs INTE av agenter.
-- Additiv: ny kolumn, null för alla befintliga rader. Idempotent (kan köras igen).
-- Bygger på slice-31/content/schema-31.sql (exercises, redskap, check_exercise_redskap).

alter table public.exercises
  add column if not exists default_station_layout jsonb
    check (default_station_layout is null or jsonb_typeof(default_station_layout) = 'object');

-- Bara Teknik får layout, precis som default_station_equipment.
alter table public.exercises drop constraint if exists exercises_layout_teknik_only;
alter table public.exercises add constraint exercises_layout_teknik_only
  check (default_station_layout is null
         or (block_type = 'techniques' and default_station_equipment is not null));

-- Form: { "v": 1, "poses": [ { "pieceId": text, "x": 0..1, "z": 0..1, "yaw": -pi..pi } ] }
-- Regler: v = 1; högst 72 poser (8 slots × 9); varje pieceId finns i default_station_equipment;
-- antal poser per pieceId = slotens count (C1: förråd och skiss alltid samma).
create or replace function public.check_exercise_layout() returns trigger
language plpgsql set search_path = '' as $$
declare
  pose jsonb;
  slot jsonb;
  n int;
begin
  if new.default_station_layout is null then return new; end if;
  if coalesce((new.default_station_layout ->> 'v')::int, 0) <> 1 then
    raise exception 'okänd layoutversion i %', new.id;
  end if;
  if jsonb_typeof(new.default_station_layout -> 'poses') <> 'array' then
    raise exception 'layout saknar poses i %', new.id;
  end if;
  if jsonb_array_length(new.default_station_layout -> 'poses') > 72 then
    raise exception 'för många redskap i skissen (%).', new.id;
  end if;
  for pose in select * from jsonb_array_elements(new.default_station_layout -> 'poses') loop
    if (pose ->> 'x')::float8 not between 0 and 1
       or (pose ->> 'z')::float8 not between 0 and 1
       or abs((pose ->> 'yaw')::float8) > 3.1416 then
      raise exception 'ogiltig position för % i %', pose ->> 'pieceId', new.id;
    end if;
  end loop;
  -- Varje slot: exakt count poser. Varje pose: pieceId finns som slot.
  for slot in select * from jsonb_array_elements(new.default_station_equipment) loop
    select count(*) into n from jsonb_array_elements(new.default_station_layout -> 'poses') p
      where p ->> 'pieceId' = slot ->> 'pieceId';
    if n <> (slot ->> 'count')::int then
      raise exception 'skiss och redskap stämmer inte för % i %', slot ->> 'pieceId', new.id;
    end if;
  end loop;
  if exists (
    select 1 from jsonb_array_elements(new.default_station_layout -> 'poses') p
    where not exists (
      select 1 from jsonb_array_elements(new.default_station_equipment) s
      where s ->> 'pieceId' = p ->> 'pieceId')
  ) then
    raise exception 'skissen har redskap som inte finns i listan (%).', new.id;
  end if;
  return new;
end $$;

drop trigger if exists exercises_layout_check on public.exercises;
create trigger exercises_layout_check before insert or update on public.exercises
  for each row execute function public.check_exercise_layout();

-- RLS: inga nya policies behövs. Kolumnen ligger på public.exercises och omfattas av
-- Slice 31/32:s befintliga policies (alla läser publicerade rader; bara admin skriver).
-- Verifiera efteråt (läsning, inga ändringar):
--   select column_name, data_type from information_schema.columns
--    where table_schema = 'public' and table_name = 'exercises' and column_name = 'default_station_layout';
--   select count(*) from public.exercises where default_station_layout is not null;  -- 0 direkt efter
