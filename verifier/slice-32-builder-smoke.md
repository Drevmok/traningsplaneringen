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
