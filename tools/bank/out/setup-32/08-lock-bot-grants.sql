-- Slice 32 · fix C2: the bot key (service_role) may only read/insert/update exercises.
-- Removes its rights on the admin list and its write rights on redskap.
-- Your own SQL Editor and Table Editor are not affected (they run as postgres).
-- Safe to run twice. Expect the check below to list only these rows:
--   exercises INSERT, SELECT, UPDATE  ·  redskap SELECT
begin;
revoke all on public.admins from service_role;
revoke insert, update, delete, truncate, references, trigger on public.redskap from service_role;
revoke delete, truncate, references, trigger on public.exercises from service_role;
grant select on public.redskap to service_role;
grant select, insert, update on public.exercises to service_role;
commit;

select table_name, string_agg(privilege_type, ', ' order by privilege_type) as rights
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'service_role'
group by table_name order by table_name;
