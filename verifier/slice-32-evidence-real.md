# Slice 32 (PR #34, `slice-32-admin`) — evidence against the REAL Supabase project

- Project: `fhzqwbdlejzohetdoluw` (https://fhzqwbdlejzohetdoluw.supabase.co)
- Run: 2026-10-03, about 09:00 CEST, by the verifier. Production was only read. The only write attempts used the anon/publishable key, and every one was refused.
- Publishable key (public): `sb_publishable_In0_6U_HIO8NgrHyL3yoow_HF1eWWDS` (repo variable `VITE_SUPABASE_PUBLISHABLE_KEY`)
- Bot secret key: read only from the `SUPABASE_PLANNER_BOT_KEY` environment variable and used only in GET request headers. It is not in this file or in any artifact (`grep sb_secret` over /tmp/s32real gives 0 hits).
- Raw artifacts are in `/tmp/s32real/` (response bodies, `openapi.json`, dry-run outputs, the sample promote file).

| # | Check | Result |
|---|-------|--------|
| 1 | Anon reads only published exercises | PASS |
| 2 | Anon can read redskap; admins hidden from anon | PASS |
| 3 | Anon writes refused | PASS |
| 4 | `stamp_updated_by` not reachable via RPC | PASS |
| 5 | Bot key GET + OpenAPI (C2) | PASS for the reads. **C2 still open** (see below) |
| 6 | `push-promote.ts --dry-run` | PASS (one caveat) |
| 7 | Live data = `bank-seed.json` | PASS (ids and content) |
| 8 | New commit on `origin/slice-32-admin` | Yes, `45ec68f`: (a) PASS, (b) **NOT addressed** |

## 1. Anon exercises
- `GET /rest/v1/exercises?select=id,status` → **200**, **51 rows**, statuses = {`published`} only.
- `...&status=eq.pending` → **200 `[]`**; `...&status=eq.hidden` → **200 `[]`**.

## 2. Anon redskap / admins
- `GET /rest/v1/redskap` → **200**, **15 rows** (for example `eq-trampett`, `eq-satsbrada`).
- `GET /rest/v1/admins` → **401** `42501 permission denied for table admins`. No e-mails exposed.

## 3. Anon writes (all refused at the grant level, before RLS)
| Request | Status | Body |
|---|---|---|
| `POST /rest/v1/exercises` `{"id":"verifier-should-be-refused","title":"x"}` | **401** | `42501 permission denied for table exercises` |
| `PATCH /rest/v1/exercises?id=eq.verifier-does-not-exist` `{"title":"x"}` | **401** | `42501 permission denied for table exercises` |
| `DELETE /rest/v1/exercises?id=eq.verifier-does-not-exist` | **401** | `42501 permission denied for table exercises` |
| `POST /rest/v1/admins` `{"email":"verifier-should-be-refused@example.invalid"}` | **401** | `42501 permission denied for table admins` |
| `POST /rest/v1/redskap` `{"id":"verifier-should-be-refused"}` (extra) | **401** | `42501 permission denied for table redskap` |

## 4. `stamp_updated_by` RPC
- Anon `POST /rest/v1/rpc/stamp_updated_by` `{}` → **404** `PGRST202 Could not find the function public.stamp_updated_by`.
- Anon `GET /rest/v1/rpc/stamp_updated_by` → **404** `PGRST202`.
- The service-role OpenAPI lists no `/rpc/*` paths at all. Its only paths are `/`, `/admins`, `/exercises` and `/redskap`.

## 5. Bot key (GET only)
- `GET /rest/v1/exercises?select=id,status` → **200**, **51 rows**, all `published`. There are **no pending or hidden rows in the database right now**, so this check cannot show whether the bot sees pending rows. (The bot key maps to service_role, which bypasses RLS, so it would see them.)
- `GET /rest/v1/` (OpenAPI) → **200**, saved to `/tmp/s32real/openapi.json` (PostgREST title "standard public schema"). Methods listed:
  - `/admins`: delete, get, patch, post (columns: added_at, email, note, user_id)
  - `/redskap`: delete, get, patch, post
  - `/exercises`: delete, get, patch, post
- **The OpenAPI does not reflect grants.** It lists `delete` on `/exercises`, but schema-32 explicitly runs `revoke delete on public.exercises from service_role`. PostgREST marks plain tables as insertable, updatable and deletable no matter what the privileges are. So the spec can neither prove nor disprove C2.
- Grants cannot be read through the API: `Accept-Profile: information_schema` → **406** `PGRST106 Only the following schemas are exposed: public, graphql_public`.
- Count-only GET with the bot key (no rows, no e-mails): `admins?limit=0` with `Prefer: count=exact` → **206**, `content-range */1`. So service_role has **SELECT on public.admins**, but schema-32 never grants it. That means Supabase's default privileges for service_role (normally ALL) are still in effect on `admins`. Probably the same is true for `redskap`, where schema-32 only adds `grant select` and never revokes. **C2 is very likely real**: the bot key can probably INSERT, UPDATE and DELETE on `admins` and `redskap`. A write test was not done because the rules forbid it. To confirm, run `select grantee, table_name, privilege_type from information_schema.role_table_grants where table_schema='public' and grantee='service_role';` in the SQL Editor.
- Anon `GET /rest/v1/` → **401** `"Secret API key required"`. The OpenAPI root is not exposed to anon.

## 6. `tools/bank/push-promote.ts`
- `env -u SUPABASE_PLANNER_BOT_KEY bun tools/bank/push-promote.ts --help` → exit 0, prints the Swedish usage (`--dry-run` "fungerar utan nyckel", `--replace <id>`, URL from `--url` or `SUPABASE_URL`).
- Sample input: `/tmp/s32real/promote-verifier.json`, built from `tools/bank/fixtures/promote-2.json`. It has one fresh exercise (`seedId tech-test-formhopp-over-lagt-block`) and one existing one (`seedId strength-cirkeltraning`, which is live).
- Published count before = **51**.
- **Dry-run without a key** (`env -u SUPABASE_PLANNER_BOT_KEY ... --dry-run --url https://fhzqwbdlejzohetdoluw.supabase.co`) → exit 0:
  ```
  (torrkörning utan SUPABASE_PLANNER_BOT_KEY: jämför mot appens inbyggda bank, inte databasen)
  tech-test-formhopp-over-lagt-block  NY (pending)  «Test: formhopp över lågt block»  techniques · 6 min · sort 370
  strength-cirkeltraning  FINNS REDAN — hoppas över  «Test: cirkelträning (finns redan)»  strength · 6 min · sort 420
      · redskap bara på Teknik — borttagna
  Torrkörning: 1 nya, 0 ersätts, 1 hoppas över. Inget skrevs.
  ```
  Caveat: without a key, the script ignores `--url` and compares against the app's built-in `seedActivities`, not the live database. It says so in its output. Today that gives the same answer, because live = seed (check 7).
- **Dry-run against the real database**: this needs the key. I called `run()` from `/tmp/s32real/guarded-dryrun.ts`, passing a `fetch` wrapper that throws on any method other than GET. Output was identical, with no "utan nyckel" line. The guard logged exactly one request: `GET /rest/v1/exercises?select=id,block_type,sort_order,title,status`. Code review agrees: with `--dry-run`, `run()` returns before the write loop.
- Published count after = **51**, unchanged. The script was never run without `--dry-run`.

## 7. Live vs `tools/bank/out/bank-seed.json` (tracked file, not modified in the working tree)
- Exercise ids: seed 51, live 51. `diff` is empty, **exact match**.
- Full content: every seed column (block_type, title, summary, how_to, watch_for, tags, default_station_equipment, sort_order, …) matches the live rows exactly (normalized `jq -S`, then `cmp`). All live `updated_by` = `seed-script`.
- Redskap: 15 rows, ids and `label_sv/sort_order/visual_key` match the seed exactly.

## 8. `origin/slice-32-admin`
```
45ec68f Slice 32: fix Security Advisor 0028/0029 — stamp_updated_by in private, no EXECUTE; add 07-fix-advisor.sql
7db7cd2 Slice 32: admin login (magic link, PKCE) + bank editing, bot writes (E1), chunked seed, setup pastes
3e83fb6 Slice 32 Docs: final admin microcopy, coach + admin note in delad-bank, setup steps 6–11
```
There is a newer commit, `45ec68f` (committed 2026-10-03 09:00 CEST). `git diff --stat 7db7cd2 origin/slice-32-admin`:
```
 app/SLICE32-SHIPPED.md                     |  8 +++-
 slice-31/content/schema-32.sql             | 10 +++-
 slice-31/content/setup-christoffer.md      |  2 +-
 tools/bank/out/setup-32/01-schema-32.sql   | 10 +++-
 tools/bank/out/setup-32/07-fix-advisor.sql | 33 +++++++++++++
 tools/bank/out/setup-32/README.md          |  7 ++-
 verifier/slice-32-builder-smoke.md         | 16 +++++++
 verifier/slice-32-local/check-advisor.ts   | 75 ++++++++++++++++++++++++++++++
 8 files changed, 152 insertions(+), 9 deletions(-)
```
`schema-32.sql` at `origin/slice-32-admin` (read with `git show`):
- (a) **Yes.** It has `create or replace function private.stamp_updated_by() ... security definer set search_path = ''`, `revoke all on function private.stamp_updated_by() from public, anon, authenticated, service_role;`, the trigger now runs `private.stamp_updated_by()`, and `drop function if exists public.stamp_updated_by();`. Live behavior matches: the RPC returns 404 (check 4). `07-fix-advisor.sql` does the same move for projects that already ran the old file.
- (b) **No.** The only service_role grants are `revoke delete on public.exercises from service_role; grant select, insert, update on public.exercises to service_role; grant select on public.redskap to service_role;`. There is **no** `revoke ... on public.admins from service_role` and no `revoke insert, update, delete on public.redskap from service_role`. (`revoke all on public.admins from anon, authenticated` covers only those two roles.) schema-31 also only revokes from anon and authenticated. **Concern C2 is not addressed.** Suggested fix: `revoke all on public.admins from service_role; revoke insert, update, delete, truncate on public.redskap from service_role;`. Note that the owner/postgres role in the SQL Editor is not affected by this.
