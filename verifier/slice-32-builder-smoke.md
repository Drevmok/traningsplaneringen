# Slice 32 — Builder self-smoke (admin login + editing + bot writes)

**Date:** 2026-10-03 (Europe/Stockholm) · **Viewport:** 390×844 (DPR 2, touch) · **Result: PASS 86 / FAIL 0**
**Script:** `verifier/slice-32-builder-smoke.mjs` · raw results `verifier/slice-32-smoke-results.json` · screenshots `/workspace/screenshots/slice32_*.png` (26)

## Stand-ins (the real project was not touched)

| Piece | What ran | Folder |
|---|---|---|
| Postgres 17 | `127.0.0.1:54341`, Supabase-style roles (`anon`, `authenticated`, `service_role` bypassrls, `authenticator`, `supabase_auth_admin`), then `schema-31.sql` → `tools/bank/out/bank-seed.sql` → `schema-32.sql` | `verifier/slice-32-local/roles.sql`, `setup.sh` |
| PostgREST | `:54342`, real RLS / grants | `setup.sh` writes the config into `/tmp/s32` |
| **GoTrue (real auth server)** v2.197.0 | `:54343`; sign-ups off, magic link, PKCE, site URL + allow list `http://127.0.0.1:4174/traningsplaneringen/`, 60 s per-address mail limit, link expiry 1 h | `setup.sh` |
| SMTP sink | `:54345` → `/tmp/s32/mail/*.json` (to, subject, links) | `smtp-catcher.py` |
| Gateway | `:54340`, emulates the Supabase API gateway: publishable key → anon (or the user's token), bot key → service_role, bot key from a browser Origin → 401, unknown/revoked key → 401 | `gateway.mjs` |
| App | plain build (no vars) on `:4173`; bank build (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`, `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32`) on `:4174` | — |

The browser routes `https://bank-mock.supabase.co/**` to the gateway, forwarding method, headers and body unchanged and without following redirects. The login mail's verify link (303 → `?code=`) therefore runs exactly like on Supabase. Auth is **not mocked**: real GoTrue with real PKCE. The local bot key is a random `localbot_<hex>` held in `/tmp/s32` (never in the repo). All servers were stopped afterwards (ports 4173/4174/54340–54345 free).

Run it again: `bash verifier/slice-32-local/setup.sh && bash verifier/slice-32-local/start.sh && bash verifier/slice-32-local/users.sh`, start both previews, then `node verifier/slice-32-builder-smoke.mjs`, then `bash verifier/slice-32-local/stop.sh`.

## AC 23–50

Status values: **pass** (holds for the shipped code regardless of project) · **local stand-in** (passed against the stand-ins; needs a re-check on the real project after setup) · **real project only** (cannot be tested locally).

| AC | Status | Evidence |
|---|---|---|
| 23 | local stand-in | `schema-32.sql` ran clean 3× (setup + 2 re-runs). `rls-smoke.sql` **full**: 13 × PASS (anon read-only / no pending / no writes; non-admin update changes nothing, sees no pending; admin sees pending, update allowed with `updated_by = admin@test.local`, DELETE refused, `admins` not writable), exit 0. Smoke AC23a: admin token DELETE → 403 |
| 24 | local stand-in | AC24a–d: unknown address → same `adminLinkSent`; no user, no mail; OTP body `create_user:false`, `redirect_to` = app URL |
| 25 | local stand-in | AC25a–h: mail → verify link (PKCE) → back logged in; `?code=` removed; `#dela=` hash kept and the shared pass opens; reload keeps session; Logga ut removes `gymnastics-planner-admin-auth-v1` (+ code verifier) |
| 26 | pass | AC26a–d: coach visit downloads only `index-*.js` + `jsx-runtime-*.js` (no supabase-js / admin chunks); only the 2 Slice 31 GETs with the publishable key, no Authorization; no admin UI; footer link only |
| 27 | local stand-in | AC27a–f: `Du är inloggad men inte admin. · Logga ut`; no admin UI; direct PATCH with the user's token → `[]`, DB unchanged; INSERT 403; self-insert into `admins` 403 |
| 28 | local stand-in | AC28a–e: used link (`?error_code=otp_expired`) → login sheet with `adminLinkFailed`, params stripped; 2nd request within 60 s → `adminWait`; link opened in another browser (failed `?code=` exchange) → `adminLinkFailed`, no session |
| 29 | local stand-in | AC29a–f: `Admin` chip, `Väntar på godkännande (2)`, `Behöver granskas (16)`, no Dolda chip at 0; pending only under its chip with the `Väntar` badge; not addable |
| 30 | local stand-in | AC30a–b: Godkänn → published + toast; another (anon) profile sees it after reload |
| 31 | local stand-in | AC31a–c: validation as own form (empty Namn blocked by `required`, empty Varför → issue list, nothing sent); all form fields saved; tags/difficulty/links/visual/sort/status preserved (row compared in SQL) |
| 32 | local stand-in | AC32a–c: `updated_by = admin@test.local`, `updated_at` fresh; detail `Senast ändrad 3 okt av admin@test.local`; a client-sent `updated_by` is overwritten by the trigger |
| 33 | local stand-in | AC33a–c: save clears `needs_coach_review`; Markera som granskad clears it without editing (count 17→16); coach profile has no review badges |
| 34 | local stand-in | AC34a–g: mall drill `tech-ljushopp-satsbrada`: confirm shows title + `adminHideUsedIn`; hidden in DB; coach: gone from Biblioteket, saved mall pass still shows it; Visa igen restores |
| 35 | pass | AC35a: no delete control in the admin detail; `grep -rn "\.delete(" app/src` (non-test) → nothing. No DELETE request was ever sent (AC39c) |
| 36 | local stand-in | AC36a–b: two tabs, second save → `adminSaveConflict`; first edit intact |
| 37 | local stand-in | AC37a–d: offline → `adminOffline`, all actions disabled, nothing queued after reconnect |
| 38 | local stand-in | AC38a–c: admin device's coach cache updates at once with the approved row; pending rows never in `gymnastics-planner-bank-cache-v1` (admin, coach, after logout) |
| 39 | local stand-in | AC39a–c: admin writes = `POST /auth/v1/otp`, `POST /auth/v1/token`, `PATCH /rest/v1/exercises` with bank columns only; no pass/own/draft data in any request |
| 40 | pass with deviation | Key read only from env var `SUPABASE_PLANNER_BOT_KEY` (per task), not the `bank-bot.env` file → no file-mode check. No key value in repo / dist / reports (grep for the local key value → 0 files). `git grep sb_secret_` is **not empty**: pre-existing pack docs in `slice-31/` + the verbatim copy `tools/bank/out/setup-32/01-schema-32.sql` (comment line), no key values. AC40b: the gateway refuses a secret-style key from a browser Origin (emulates Supabase). GitHub variables/secrets: **real project only** (nothing added by this slice) |
| 41 | local stand-in | AC41a–d (+ `bun test tools/bank` live): dry-run writes nothing; push → 2 rows `pending`, `needs_coach_review = true`, `updated_by = bot:planner`; invisible to anon; listed under Väntar (AC29) |
| 42 | pass (file-mode part N/A) | AC42a–c: existing ids skipped + reported; publishable key → refuses; key never printed. `--replace` tested in `bun test tools/bank` (text changes, status stays pending) |
| 43 | local stand-in | Bot key DELETE → 403 `permission denied`, row still there (grants from schema-32) |
| 44 | local stand-in | Key removed from the gateway's key list → script: «Nyckeln fungerar inte längre …» (exit 1, key not printed); coach app unaffected |
| 45 | partial | Banner added to `slice-30/content/seed-promotion.md`. `tools/bank/export-db.ts` writes a read-only backup (`out/bank-snapshot.json`, tested locally: 51 published, 15 redskap) but is **not wired into the bundle** (bundle budget, AC49); the offline fallback stays the bundled 51 seeds |
| 46 | pass with note | `grep -rn "sb_secret_\|service_role" app/src` → nothing; eager `index-*.js` → nothing. The lazy supabase-js chunk `dist-*.js` contains the **prefix literal** `sb_secret_` in supabase-js's own key-format check (`e.startsWith("sb_secret_")`), not a key; `grep -E "sb_secret_[A-Za-z0-9]"` over app/dist, src, tools, .github → 0. The only key in the bank bundle is `sb_publishable_local_s32` (local build) |
| 47 | real project only | Security Advisor. Locally: no public table without RLS (`06-check-bank-after-setup.sql` → none) |
| 48 | pass | AC48a–e: vars unset = bundled 51, no request, no stale line; cached bank + stale line only in Biblioteket when the bank is down, none on Home/builder; hidden drill still renders in an old pass (AC34d); Planera pass wizard fills 5 blocks. Unit tests for Slice 31 green. (The Slice 31 smoke script itself needs its own stand-in on 54331/54332 and was not re-run.) |
| 49 | pass | `npm run build` green; `bun test src` 114/114. Eager JS gz: `index` 135.35 + shared `jsx-runtime` 3.12 = **138.47 kB vs 134.59 kB (Slice 31) → +3.88 kB** (< 5). supabase-js is its own lazy chunk (`dist-*.js` 55.01 kB gz) |
| 50 | pass | Footer `Träningsplaneraren · Slice 32 · Logga in som admin` (bank build, builder view); plain build: `Träningsplaneraren · Slice 32` without the link |

## Notes

- Seed reality: 16 seed rows carry `needs_coach_review = true`, so Christoffer will see `Behöver granskas (16)` on first login. That is expected.
- An admin filter chip now resets the block filter to «Alla typer» when it is switched on, so the list matches the chip's count. Found in the smoke: opening Biblioteket from Teknik showed 12 of 17.
- Supabase's built-in mailer sends ~2 login mails/hour and only to team members (the local stand-in uses 60 s/address). A non-admin test user on the real project needs a team-member address or custom SMTP.

## Follow-up 2026-10-03: Security Advisor lints 0028/0029 (`stamp_updated_by`)

On the real project, Security Advisor flagged the SECURITY DEFINER trigger function `public.stamp_updated_by()` as executable by `anon`/`authenticated` (PUBLIC execute by default). Fix: the function now lives in `private` (not exposed by the API), `revoke all … from public, anon, authenticated, service_role` (triggers need no EXECUTE), trigger `exercises_stamp` → `private.stamp_updated_by()`, and any leftover `public.stamp_updated_by()` is dropped. It is folded into `schema-32.sql` = `setup-32/01-schema-32.sql` (cmp identical, 4 889 B). `setup-32/07-fix-advisor.sql` (1 702 B) is the patch for projects that already ran the old 01. It is Planner's file, reviewed: the original `alter … set schema` failed with `function stamp_updated_by() already exists in schema "private"` when both copies existed (old 01 re-run after the fix). It now drops the exposed copy in that case, always re-binds the trigger, and creates `private` if missing. No app code, bot script or test calls it via rpc (`grep -rn "stamp_updated_by\|\.rpc(\|/rpc/"` → only the two schema copies).

Checks: `bun verifier/slice-32-local/check-advisor.ts` (16 checks): function only in `private`, trigger bound to it, still SECURITY DEFINER, `has_function_privilege(anon|authenticated|service_role, execute)` = f (proacl `{postgres=X/postgres}`), `POST /rest/v1/rpc/stamp_updated_by` as anon, as nonadmin and as admin (signed user JWT, the sanity GET with it → 200) → 404 PGRST202 each. Admin `PATCH` via REST with `updated_by: 'spoof'` → stored `admin@test.local`. Bot `push-promote.ts fixtures/promote-2.json` (secret key → service_role) → both rows `bot:planner` · pending. `05-rls-smoke-valfri.sql` → 13 PASS, 0 FAIL.

| Case | Result |
|---|---|
| Baseline: old 01 only | check FAILs as expected: function in `public`, `has_function_privilege(anon/authenticated)` = t (what the lint flags). Note: rpc already returned 404 before the fix, because PostgREST does not expose trigger-returning functions. The lint is about the grant |
| (a) fresh: schema-31 + seed + new 01 | all 16 OK |
| (b) old 01, then 07 | 07 check row `private · stamp_updated_by · exercises_stamp`; all 16 OK |
| (c) re-runs | fresh DB: new 01 ×2, 07 ×2 → no errors, all OK. (b) DB: 07 again, new 01 ×2, 07 again → all OK. Extra: old 01 re-run on a fixed DB (both copies) → new 07 cleans it (all OK). Old 01 then new 01 → all OK |
| Tests/build | `bun test src` 114/114 · `bun test tools/bank` 19 pass + 5 skip; with `S32_GATEWAY` on a fresh DB 24/24 · `npm run build` green (eager JS unchanged: index 135.35 kB gz) |

Servers stopped (54340–54345 free). Only SQL and docs changed, so the browser smoke was not re-run. Note: `schema-31`'s `check_exercise_redskap()` / `touch_row()` are SECURITY INVOKER trigger functions and are not flagged. Leaked-password protection warning: ignore (Pro-only, we use magic links).

## Follow-up 2026-10-03 (2): Verifier FAIL fixes at 30674d0 (C1, C2, C5, C6) + Christoffer's AC40/42/45 calls

**C2: bot key (service_role) rights.** `schema-32.sql` = `01-schema-32.sql` (cmp identical, 5 299 B) now does `revoke all on public.admins, public.redskap, public.exercises from service_role`, then grants exercises SELECT/INSERT/UPDATE and redskap SELECT. Supabase's default privileges gave service_role ALL on every public table, and schema-31 never revoked it. `revoke all` also clears TRUNCATE/REFERENCES/TRIGGER/MAINTAIN. `08-lock-bot-grants.sql` (958 B) is Planner's file copied unchanged (cmp). `rls-smoke.sql` = `05-rls-smoke-valfri.sql` (8 118 B) has a new **Part 3, bot key**: it reads exercises + redskap, INSERT + UPDATE keep `bot:planner`, and these are refused: DELETE exercises; SELECT/INSERT/UPDATE/DELETE admins; INSERT/UPDATE/DELETE redskap. That is 10 `PASS bot` lines.

New check `bun verifier/slice-32-local/check-grants.ts` (18 checks):
- the service_role ACL on public tables via `aclexplode` (which shows MAINTAIN) and via `information_schema`;
- the admins list intact;
- with the bot key over HTTP: GET/POST/PATCH/DELETE admins, POST/PATCH/DELETE redskap and DELETE exercises → 403 `42501`, while GET redskap/exercises → 200;
- `push-promote.ts` insert → 2 rows `bot:planner` · pending; `--replace` (PATCH) → text restored, still `bot:planner` · pending; re-push with every row skipped → C5 line;
- `05-rls-smoke`: 23 PASS (10 bot), 0 FAIL.

| Scenario | Result |
|---|---|
| (a) fresh: schema-31 + seed + new 01 | check-grants **18/18 OK**; check-advisor 16/16 OK |
| (b) old 01 (7db7cd2), then 07, then 08 | Before the patches: service_role had ALL on admins, exercises and redskap (incl. DELETE on admins/redskap). After 07 + 08: **17/18 OK, 1 FAIL.** service_role keeps **`MAINTAIN`** on exercises and redskap (PG 17). 08 doesn't revoke it, and `information_schema.role_table_grants` (08's own check query) doesn't show it, so 08's check looks clean. Everything else passes, including all HTTP denials, bot insert/--replace and 05 (23 PASS/0 FAIL). check-advisor 16/16 |
| (c) re-runs | fresh DB: new 01 ×2, 08 ×2, 07 ×2 → no errors, 18/18 + 16/16. (b) DB: 07, 08, 07, 08 again → no errors, same single MAINTAIN FAIL. Then new 01 ×2, then 08 + 07 → **18/18** + 16/16. The current 01 clears MAINTAIN |

**Finding in 08 (not edited, reported):** on Postgres 17 (stand-in 17.11; new Supabase projects are on 17), `MAINTAIN` survives on exercises and redskap. It allows VACUUM/ANALYZE/REINDEX/CLUSTER/LOCK TABLE, not data changes, and it can't be reached through the REST API, so the risk is low. But it doesn't meet "exactly", and 08's check can't show it. Possible fixes: run the current `01-schema-32.sql` again (idempotent, uses `revoke all`), or add `revoke all on public.exercises, public.redskap from service_role;` before 08's grants. Live check: `select has_table_privilege('service_role','public.exercises','MAINTAIN'), has_table_privilege('service_role','public.redskap','MAINTAIN');`.

**C1: conflict recovery.** `writeRow` re-reads the row and its `updated_at` as soon as a save conflicts (`refreshAdminRow`), and `AdminDetailPanel` re-reads its row when it opens. «Stäng och öppna den igen» now saves without a page reload. Unit test in `bankWrite.test.ts`: conflict → `select-row`, the reopened entry has the new version/title/author, the next save goes through. Browser smoke on the stand-in: **AC36c** the reopened form shows the other tab's title «Kullerbytta (flik 1)»; **AC36d** close + reopen + Spara → DB «Kullerbytta (flik 2)», no 2nd conflict, no reload (`window` marker kept).

**C5: all rows skipped.** push-promote prints `Inget nytt: alla övningar i filen fanns redan i banken. Inget skrevs.` instead of «Väntar på godkännande». This is plain Swedish; there was no Docs microcopy for it (checked `microcopy.sv.md`, `docs/delad-bank.sv.md`, `bot-writes.md`). Two unit tests: all existing, and all 409. Smoke step **C5** + check-grants.

**C6: stand-in isolation.** Dir and ports come from `S32_DIR` / `S32_*_PORT` (`env.sh`, same defaults). Processes carry `S32_OWNER=<dir>`; `stop.sh` kills only pids whose environ matches. `setup.sh` / `start.sh` refuse if a port is taken by anything else. `start.sh` / `users.sh` refuse if the env doesn't match `<dir>/env.json`. Tested with a second stand-in `/tmp/s32c6` on 54440–54445:
- its own setup/start/users ran, check-advisor 16/16;
- its gateway pid planted in `/tmp/s32/pids` → default `stop.sh` printed `skip pid … (not from /tmp/s32)`, and the c6 gateway stayed up;
- `setup.sh` on a port held by c6's Postgres → exit 1, dir not created;
- `start.sh` while running → exit 1; `start.sh` with mismatched env → exit 1;
- c6 `stop.sh` → its ports free. Documented in `verifier/slice-32-local/README.md`.

**Christoffer's calls:** AC40/42 accepted as deviations (env var via secure input, no env file); noted in `slice-31/verification-checklist.md`. AC45 accepted as partial; backlog «Bundle latest DB snapshot into app offline fallback» (Parked / Later). `features/README.md` now lists `delad-bank.md`.

**Tests/build:** `bun test src` **115/115** (+1, C1). `bun test tools/bank` **21 pass + 5 skip** (+2, C5); with `S32_GATEWAY` on a fresh DB **26/26**. `npm run build` green (eager `index` 135.36 kB gz, +0.01; the C1 code is in the lazy admin chunks). Browser smoke `node verifier/slice-32-builder-smoke.mjs` (OFF preview on 4175 via `S32_OFF_URL`, because 4173 belonged to another agent) → **89/89 PASS** (+3: AC36c, AC36d, C5). My previews (4174, 4175) and the stand-in were stopped; ports 54340–54345 are free. I did not touch the other agent's 4173 preview; it had already stopped by the end.
