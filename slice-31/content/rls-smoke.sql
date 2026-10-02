-- Verifier: RLS smoke test. Paste in Supabase → SQL Editor → Run.
-- Everything runs inside one transaction and ends with ROLLBACK → nothing is changed.
-- Expect only NOTICE lines starting with PASS; any FAIL aborts with an error.
-- Part 1 = Slice 31 (anon read-only). Part 2 = Slice 32 (run only after schema-32.sql; edit the two e-mails).

begin;

-- a pending row the public must never see (inserted as owner, rolled back at the end)
insert into public.exercises (id, block_type, title, duration_minutes_default, summary, how_to, watch_for, safety_line, visual_key, status, updated_by)
values ('tech-rls-smoke', 'techniques', 'RLS smoke', 5, 'x', '1. x', 'x', 'x', 'tech-x', 'pending', 'rls-smoke');

-- ---------------------------------------------------------------- Part 1: anon
set local role anon;
do $$
declare n int;
begin
  select count(*) into n from public.exercises;
  if n < 1 then raise exception 'FAIL anon reads no exercises'; end if;
  raise notice 'PASS anon reads % exercises', n;

  select count(*) into n from public.exercises where status = 'pending';
  if n <> 0 then raise exception 'FAIL anon sees % pending rows', n; end if;
  raise notice 'PASS anon sees no pending rows';

  select count(*) into n from public.redskap;
  if n < 15 then raise exception 'FAIL anon reads only % redskap', n; end if;
  raise notice 'PASS anon reads % redskap', n;

  begin
    update public.exercises set title = title where id = 'tech-kullerbytta';
    raise exception 'FAIL anon UPDATE allowed';
  exception when insufficient_privilege then raise notice 'PASS anon UPDATE refused';
  end;
  begin
    insert into public.exercises (id, block_type, title, duration_minutes_default, summary, how_to, watch_for, visual_key)
    values ('gather-rls-anon', 'gathering', 'x', 3, 'x', '1. x', 'x', 'x');
    raise exception 'FAIL anon INSERT allowed';
  exception when insufficient_privilege then raise notice 'PASS anon INSERT refused';
  end;
  begin
    delete from public.exercises where id = 'tech-kullerbytta';
    raise exception 'FAIL anon DELETE allowed';
  exception when insufficient_privilege then raise notice 'PASS anon DELETE refused';
  end;
  begin
    update public.redskap set label_sv = label_sv where id = 'eq-kon';
    raise exception 'FAIL anon redskap UPDATE allowed';
  exception when insufficient_privilege then raise notice 'PASS anon redskap UPDATE refused';
  end;
end $$;
reset role;

-- ---------------------------------------------------------------- Part 2: Slice 32 (delete from here down when testing Slice 31 only)
-- Signed-in NON-admin (any auth.users row that is not in public.admins)
select set_config('request.jwt.claims', json_build_object('sub', (select id from auth.users where id not in (select user_id from public.admins) limit 1), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare n int;
begin
  if (select auth.uid()) is null then raise notice 'SKIP no non-admin user exists — add one in Authentication → Users to test this part'; return; end if;
  update public.exercises set title = title where id = 'tech-kullerbytta';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL non-admin UPDATE changed % rows', n; end if;
  raise notice 'PASS non-admin UPDATE changes nothing';
  select count(*) into n from public.exercises where status = 'pending';
  if n <> 0 then raise exception 'FAIL non-admin sees pending'; end if;
  raise notice 'PASS non-admin sees no pending rows';
end $$;
reset role;

-- Admin (first row in public.admins)
select set_config('request.jwt.claims', json_build_object('sub', (select user_id from public.admins limit 1), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare n int; who text;
begin
  if (select auth.uid()) is null then raise exception 'FAIL public.admins is empty'; end if;
  select count(*) into n from public.exercises where status = 'pending';
  if n < 1 then raise exception 'FAIL admin cannot see pending'; end if;
  raise notice 'PASS admin sees pending rows';
  update public.exercises set status = 'hidden' where id = 'tech-rls-smoke' returning updated_by into who;
  if who is null then raise exception 'FAIL admin UPDATE refused'; end if;
  raise notice 'PASS admin UPDATE allowed, updated_by = %', who;
  begin
    delete from public.exercises where id = 'tech-rls-smoke';
    raise exception 'FAIL admin hard DELETE allowed';
  exception when insufficient_privilege then raise notice 'PASS admin DELETE refused (soft hide only)';
  end;
  begin
    insert into public.admins (user_id, email) values (gen_random_uuid(), 'x@example.se');
    raise exception 'FAIL admin can add admins from the app';
  exception when insufficient_privilege then raise notice 'PASS admins list not writable from the app';
  end;
end $$;
reset role;

rollback;
