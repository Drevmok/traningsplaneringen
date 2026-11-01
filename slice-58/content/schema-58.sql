-- Slice 58 — VALFRI skärpning av check_exercise_layout (y + surface). Behövs INTE för ★ A1.
-- Christoffer klistrar in själv i Supabase SQL Editor om han vill. Körs INTE av agenter.
-- Idempotent. Ändrar bara funktionen; trigger och kolumn från schema-57.sql ligger kvar.

create or replace function public.check_exercise_layout() returns trigger
language plpgsql set search_path = '' as $$
declare
  pose jsonb;
  slot jsonb;
  n int;
  surf jsonb;
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
       or abs((pose ->> 'yaw')::float8) > 3.1416
       or (pose ? 'y' and (pose ->> 'y')::float8 not between 0 and 1) then
      raise exception 'ogiltig position för % i %', pose ->> 'pieceId', new.id;
    end if;
  end loop;
  surf := new.default_station_layout -> 'surface';
  if surf is not null and (
       jsonb_typeof(surf) <> 'object'
       or coalesce((surf ->> 'w')::int, 0) not between 0 and 2
       or coalesce((surf ->> 'h')::int, 0) not between 0 and 2) then
    raise exception 'ogiltig skissyta i %', new.id;
  end if;
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

-- Verifiera efteråt (läsning):
--   select count(*) from public.exercises where default_station_layout is not null;
-- Återställning: klistra in funktionen från slice-57/content/schema-57.sql igen.
