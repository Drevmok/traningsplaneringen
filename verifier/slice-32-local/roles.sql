-- Local stand-in for a Supabase project's built-in roles (NOT for the real project).
-- Mirrors what Supabase creates before any user SQL runs: the API roles, the
-- authenticator login role PostgREST uses, the auth schema owned by the auth server,
-- and the default privileges that grant new public tables to the API roles.
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role authenticator login noinherit password 'local-only';
grant anon, authenticated, service_role to authenticator;
create role supabase_auth_admin login createrole noinherit password 'local-only';
create schema auth authorization supabase_auth_admin;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
