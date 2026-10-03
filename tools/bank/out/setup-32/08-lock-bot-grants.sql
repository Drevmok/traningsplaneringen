-- Slice 32 · fix C2: the bot key (service_role) may only read/insert/update exercises.
-- Removes its rights on the admin list and its write rights on redskap.
-- Your own SQL Editor and Table Editor are not affected (they run as postgres).
-- Safe to run twice, also after an earlier version of this file. Expect the check below to show:
--   admins (none) · exercises INSERT, SELECT, UPDATE · redskap SELECT · maintain false (n/a before Postgres 17)
begin;
revoke all on public.admins from service_role;
revoke insert, update, delete, truncate, references, trigger on public.redskap from service_role;
revoke delete, truncate, references, trigger on public.exercises from service_role;
-- also clears MAINTAIN (Postgres 17), which the lines above don't cover
revoke all on public.exercises, public.redskap from service_role;
grant select on public.redskap to service_role;
grant select, insert, update on public.exercises to service_role;
commit;

-- Check. MAINTAIN is not listed in information_schema, so it is asked for separately (Postgres 17+ only).
select t.table_name,
  coalesce((select string_agg(g.privilege_type, ', ' order by g.privilege_type)
            from information_schema.role_table_grants g
            where g.table_schema = 'public' and g.table_name = t.table_name and g.grantee = 'service_role'), '(none)') as rights,
  case when current_setting('server_version_num')::int >= 170000
       then has_table_privilege('service_role', 'public.' || t.table_name, 'MAINTAIN')::text
       else 'n/a' end as maintain
from (values ('admins'), ('exercises'), ('redskap')) as t(table_name)
order by t.table_name;
