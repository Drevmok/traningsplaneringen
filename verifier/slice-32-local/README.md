# Slice 32 local stand-in (Supabase look-alike, local testing only)

Postgres 17 + PostgREST + GoTrue + an SMTP sink + a small gateway that behaves like the Supabase API gateway: the publishable key maps to `anon`, a user token to `authenticated`, and the bot key to `service_role`. It runs the real `schema-31.sql` → `bank-seed.sql` → `schema-32.sql`. Nothing here is used for the real project. Keys and secrets are generated into the stand-in dir and never go into git.

```bash
bash verifier/slice-32-local/setup.sh   # wipe + create THIS dir's DB (stops only this dir's processes first)
bash verifier/slice-32-local/start.sh   # PostgREST, GoTrue, SMTP sink, gateway
bash verifier/slice-32-local/users.sh   # admin@test.local (on public.admins) + nonadmin@test.local
bun  verifier/slice-32-local/check-advisor.ts   # lints 0028/0029 fix (16 checks)
bun  verifier/slice-32-local/check-grants.ts    # C2: bot key rights, bot insert/--replace, 05-rls-smoke
bash verifier/slice-32-local/stop.sh    # stop THIS dir's processes + its Postgres
```

## Dir and ports come from the environment (`env.sh`)

| Variable | Default | What |
|---|---|---|
| `S32_DIR` | `/tmp/s32` | Everything: Postgres cluster, logs, `env.json`, `bot-keys.txt`, `pids`, `mail/` |
| `S32_GATEWAY_PORT` | `54340` | Gateway (what the app, the bot and the tests talk to) |
| `S32_PG_PORT` | `54341` | Postgres |
| `S32_POSTGREST_PORT` | `54342` | PostgREST |
| `S32_GOTRUE_PORT` | `54343` | GoTrue (auth) |
| `S32_SMTP_PORT` | `54345` | SMTP sink (mails → `$S32_DIR/mail`) |
| `S32_PREVIEW_PORT` | `4174` | Bank-build preview the login links return to (GoTrue site URL / allow list) |
| `S32_SCHEMA32` | `slice-31/content/schema-32.sql` | setup.sh only: the schema-32 file to apply (e.g. an older 01 to test a patch) |
| `S32_OTP_LENGTH` / `S32_OTP_EXP` | `6` / `3600` | Slice 33: GoTrue e-mail code length and expiry (s) |
| `S32_MAGIC_LINK_TEMPLATE` | unset | Slice 33: login-mail body file (e.g. `../slice-33-local/magic-link.html` = setup 12c with `{{ .Token }}`). Copied to `<dir>/templates/` and served by the gateway at `/__templates/magic_link.html`; also sets the 12c subject (`S32_MAGIC_LINK_SUBJECT` overrides). Unset = GoTrue's default link mail |
| `PGBIN`, `GOTRUE`, `POSTGREST` | `/usr/lib/postgresql/17/bin`, `/tmp/gotrue/auth`, `/tmp/postgrest/postgrest` | Binaries |

A second stand-in next to the default one, e.g. for the Verifier:

```bash
export S32_DIR=/tmp/s32vv S32_GATEWAY_PORT=54440 S32_PG_PORT=54441 S32_POSTGREST_PORT=54442 S32_GOTRUE_PORT=54443 S32_SMTP_PORT=54445 S32_PREVIEW_PORT=4177
bash verifier/slice-32-local/setup.sh && bash verifier/slice-32-local/start.sh && bash verifier/slice-32-local/users.sh
```

Use the **same variables for every script** of one stand-in. `setup.sh` writes them into `$S32_DIR/env.json`. `start.sh` and `users.sh` refuse to run if the environment doesn't match that file. `check-*.ts`, `slice-32-builder-smoke.mjs` and the bot live tests read the dir from `S32_DIR` and the ports from `env.json`. The live tests use `S32_GATEWAY=http://127.0.0.1:<gateway port> bun test tools/bank`. In the browser smoke, `S32_OFF_URL` / `S32_ON_URL` override the preview URLs when another agent's preview holds 4173/4174.

## Safety: by dir, never by port alone

- Every process `start.sh` launches (and the Postgres server from `setup.sh` / `start.sh`) carries `S32_OWNER=<dir>` in its environment. Pids go to `<dir>/pids`.
- `stop.sh` kills a pid only if it is still alive **and** its `/proc/<pid>/environ` has `S32_OWNER=<this dir>`. Anything else is skipped with `skip pid … (gone or not from <dir>)`, so a stale pid file can't hit a reused pid or another stand-in. Postgres is stopped with `pg_ctl -D <dir>/pg`. Never `pkill -f`, never "whatever listens on the port".
- `setup.sh` first stops only its own dir's processes and then **refuses** (exit 1, nothing deleted) if any of its ports is still taken by another process: another stand-in, or anything else. `start.sh` does the same for the service ports. Pick other `S32_*_PORT` values instead.
- `setup.sh` deletes only `$S32_DIR`.
