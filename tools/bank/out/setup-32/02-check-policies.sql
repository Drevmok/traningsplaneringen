-- Slice 32 · steg 8 kontroll. Klistra in och kör (Run). Ska visa fem rader:
-- admins_read_self, exercises_admin_insert, exercises_admin_read_all, exercises_admin_update, exercises_read_public
select policyname from pg_policies
where schemaname = 'public' and tablename in ('admins', 'exercises')
order by policyname;
