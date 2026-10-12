# Slice 36 local stand-in

Local only — never the real Supabase project. Same stack as `../slice-32-local` (PG17 + PostgREST + GoTrue + SMTP sink + gateway) with
the Slice 33 login mail, its own dir `/tmp/s36` and ports 54740–54745 (preview 4200), plus
`slice-36/sql/36-01-table.sql` → `36-02-rls-grants.sql` → `36-03-smoke.sql` applied to the local Postgres.

```bash
bash verifier/slice-36-local/up.sh     # fresh: setup + start + users + 36-01/02/03 (prints 8 × ok = t)
bash verifier/slice-36-local/rls.sh    # AC18/19 curl checks (publishable key, non-admin, admin)
bash verifier/slice-36-local/down.sh
```

Users: `admin@test.local` and `admin2@test.local` (admins), `nonadmin@test.local`. Login codes land in `/tmp/s36/mail`.
