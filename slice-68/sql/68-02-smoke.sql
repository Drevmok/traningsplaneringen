-- Träningsplaneraren — Slice 68 «Föreningens redskap», fil 2 av 2: läsande smoke
-- Klistra in efter 68-01-club-equipment.sql. Säker att köra om. Skriver inte, tar inte bort.
-- Förväntat: sex rader med ok = true. Körs bara efter merge, efter Christoffers separata ja.
-- Agenter kör aldrig filen mot live.

select 'table'::text as check,
       (to_regclass('public.club_equipment') is not null) as ok;

select 'rls'::text as check,
       (select relrowsecurity from pg_class where oid = 'public.club_equipment'::regclass) as ok;

select 'anon_select_only'::text as check,
       has_table_privilege('anon', 'public.club_equipment', 'select')
       and not has_table_privilege('anon', 'public.club_equipment', 'insert')
       and not has_table_privilege('anon', 'public.club_equipment', 'update')
       and not has_table_privilege('anon', 'public.club_equipment', 'delete') as ok;

select 'auth_no_delete'::text as check,
       not has_table_privilege('authenticated', 'public.club_equipment', 'delete')
       and not has_table_privilege('service_role', 'public.club_equipment', 'delete')
       and not has_table_privilege('service_role', 'public.club_equipment', 'select') as ok;

select 'no_delete_policy'::text as check,
       not exists (
         select 1 from pg_policies
         where schemaname = 'public' and tablename = 'club_equipment' and cmd in ('DELETE', 'ALL')
       ) as ok;

select 'policy_count'::text as check,
       (select count(*) from pg_policies
        where schemaname = 'public' and tablename = 'club_equipment') = 3 as ok;
