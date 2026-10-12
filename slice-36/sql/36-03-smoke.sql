-- Träningsplaneraren — Slice 36, file 3 of 3: read-only checks (changes nothing)
-- Paste in Supabase → SQL Editor → Run, after files 1 and 2. Every row should say ok = true.
-- The real "coach cannot write" test is done with the publishable key from outside (checklist AC 18).

select 'rls on' as check_name,
       (select relrowsecurity from pg_class where oid = 'public.club_templates'::regclass) as ok
union all
select 'anon may only select',
       has_table_privilege('anon', 'public.club_templates', 'select')
       and not has_table_privilege('anon', 'public.club_templates', 'insert')
       and not has_table_privilege('anon', 'public.club_templates', 'update')
       and not has_table_privilege('anon', 'public.club_templates', 'delete')
union all
select 'nobody may delete',
       not has_table_privilege('authenticated', 'public.club_templates', 'delete')
       and not has_table_privilege('service_role', 'public.club_templates', 'delete')
union all
select 'no delete policy',
       not exists (select 1 from pg_policies where tablename = 'club_templates' and cmd in ('DELETE', 'ALL'))
union all
select 'four policies',
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'club_templates') = 4
union all
select 'admin check reused',
       exists (select 1 from pg_policies where tablename = 'club_templates' and with_check like '%is_admin%')
union all
select 'triggers in place',
       (select count(*) from pg_trigger where tgrelid = 'public.club_templates'::regclass and not tgisinternal) = 2
union all
select 'two admins listed',
       (select count(*) from public.admins) = 2;
