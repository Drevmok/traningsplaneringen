-- Slice 32 · fix for Security Advisor warnings 0028/0029 (stamp_updated_by).
-- Only for a project where the OLD 01-schema-32.sql already ran (function in public).
-- The current 01-schema-32.sql already contains this fix; running 07 after it changes nothing.
-- Moves the trigger function out of the public API and removes everyone's right to call it
-- directly. The trigger keeps working (triggers don't need EXECUTE). Safe to run twice.
-- Expect: Success, then the check below shows one row: private · stamp_updated_by · exercises_stamp.
begin;
create schema if not exists private;
do $$
begin
  if to_regprocedure('public.stamp_updated_by()') is not null then
    if to_regprocedure('private.stamp_updated_by()') is null then
      -- normal case: move it (same function, the trigger stays bound to it)
      alter function public.stamp_updated_by() set schema private;
    else
      -- both copies exist (old 01 re-run after the fix): keep private, drop the exposed one
      drop trigger if exists exercises_stamp on public.exercises;
      drop function public.stamp_updated_by();
    end if;
  end if;
end $$;
revoke all on function private.stamp_updated_by() from public, anon, authenticated, service_role;
drop trigger if exists exercises_stamp on public.exercises;
create trigger exercises_stamp before insert or update on public.exercises
  for each row execute function private.stamp_updated_by();
commit;

-- Check: one row, schema private, trigger exercises_stamp attached.
select n.nspname as schema, p.proname as function, t.tgname as trigger
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
join pg_namespace n on n.oid = p.pronamespace
where t.tgname = 'exercises_stamp';
