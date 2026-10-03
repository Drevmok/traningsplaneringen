-- Slice 32 · valfri slutkontroll (ändrar inget). Förväntat: published 51 (eller fler), inga pending ännu,
-- redskap 15, admins 1, och ingen tabell utan RLS i public.
select status, count(*) from public.exercises group by status order by status;
select (select count(*) from public.redskap) as redskap, (select count(*) from public.admins) as admins;
select relname as tabell_utan_rls from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
