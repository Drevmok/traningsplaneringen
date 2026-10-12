-- Slice 36 Verifier: offline Security-Advisor-style checks (read-only). Run on a LOCAL stand-in.
select 'secdef funcs in public' k, coalesce(string_agg(p.oid::regprocedure::text, ', '), '(none)') v
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prosecdef
union all
select 'funcs w/o fixed search_path (public/private)', coalesce(string_agg(p.oid::regprocedure::text, ', '), '(none)')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public','private') and not exists (select 1 from unnest(coalesce(p.proconfig,'{}')) c where c like 'search_path=%')
union all
select 'public tables without RLS', coalesce(string_agg(c.relname, ', '), '(none)')
  from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('r','p') and not c.relrowsecurity
union all
select 'views in public', coalesce(string_agg(c.relname || ' ' || coalesce(array_to_string(c.reloptions, ','), ''), ', '), '(none)')
  from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('v','m')
union all
select 'non-trigger public funcs EXECUTE by anon/authenticated', coalesce(string_agg(p.oid::regprocedure::text, ', '), '(none)')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prorettype <> 'trigger'::regtype
    and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))
union all
select 'club_templates triggers', string_agg(t.tgname || '→' || t.tgfoid::regproc::text, ', ')
  from pg_trigger t where t.tgrelid = 'public.club_templates'::regclass and not t.tgisinternal
union all
select 'service_role on club_templates (any priv incl TRUNCATE/MAINTAIN)',
  (select string_agg(p, ',') from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
    where has_table_privilege('service_role', 'public.club_templates', p))
union all
select 'service_role on admins', (select string_agg(p, ',') from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p
    where has_table_privilege('service_role', 'public.admins', p));
