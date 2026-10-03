# Slice 32 — Admin login + editing (+ bot writes) — SHIPPED (local branch, not pushed)

**Date:** 2026-10-03 (Europe/Stockholm)
**Locks:** B2 / C1 / E1 / F1
**Branch:** `slice-32-admin`, created from `origin/slice-32-docs` @ `3e83fb6` (cut from main `80b22aa`). Local only, upstream removed: no push, no PR.
**Builder self-smoke:** `verifier/slice-32-builder-smoke.md`: **PASS 86 / FAIL 0** at 390×844, against local stand-ins (real GoTrue + PostgREST + PG17, schema-31 + seed + schema-32). The real Supabase project was not touched.
**Screenshots:** `/workspace/screenshots/slice32_*.png` (26)
**Copy authority:** `slice-31/content/microcopy.sv.md`. Every Slice 32 string is used verbatim.

## What shipped

1. **Login (B2 + C1).** The footer link «Logga in som admin» shows only when the bank is configured. It opens a sheet with an e-mail field and «Skicka länk», which calls `signInWithOtp` with `shouldCreateUser: false` and a redirect to the app address (origin + Pages base). The same `adminLinkSent` text shows for every address. A rate limit (429 / `over_email_send_rate_limit`) shows `adminWait`. A network error or 5xx shows `adminSendFailed`.
2. **Return from the link.** PKCE flow. `detectSessionInUrl` is off, and `session.ts` handles the return itself. It first strips `code`, `error`, `error_code` and `error_description` from the address, plus an auth-error hash. It keeps any other hash, including `#dela=…`. Then it exchanges the code. Both a `?error_code=` return and a failed `?code=` exchange open the login sheet with `adminLinkFailed`.
3. **States.** After login the app asks «am I in `admins`?» with one SELECT. Admin → footer «Admin · Logga ut» and admin mode. Not admin → «Du är inloggad men inte admin. · Logga ut». Logga ut signs out locally and removes `gymnastics-planner-admin-auth-v1` plus its code verifier.
4. **Lazy loading.** supabase-js (`dist-*.js`, 55 kB gz) and all admin logic and UI chunks load only for a login return, a saved admin session in this browser, the login sheet, or Logga ut. A coach visit downloads none of it and sends no Authorization header.
5. **Admin mode in Biblioteket.** `Admin` chip. Filter chips `Väntar på godkännande (n)` / `Behöver granskas (n)` / `Dolda (n)` show only when n > 0, are aria-pressed, and reset the block filter to «Alla typer» when switched on. Pending and hidden rows appear only under their chip, with `Väntar` / `Dold` badges, and can never be added to a pass. The review badge shows only in admin mode.
6. **Detail actions (F1).**
   - pending: Godkänn · Ändra i banken
   - published: Ändra i banken · Dölj för alla
   - hidden: Visa igen · Ändra i banken
   - Plus the review hint with «Markera som granskad», `adminOffline` with all buttons disabled when offline, inline `adminSaveConflict` / `adminSaveFailed`, and «Senast ändrad {datum} av {vem}» (`bot:planner` → Planner; `seed-script` → «Oförändrad sedan …»).
   - The Dölj confirm adds `adminHideUsedIn` for ids used in malls, Planera pass paths or the blank pass.
7. **Writes.** Every write is one UPDATE guarded by `id` plus the loaded `updated_at`. Zero rows back means a conflict: nothing is overwritten or merged. After a write the admin bank reloads, and this device's coach store and cache update at once with published and hidden rows only (`applyBankEntries`). Pending rows never reach the cache key. The app does no INSERT or DELETE at all, and Dölj means status `hidden`. `updated_by` is stamped by the database trigger, and a client value is overwritten.
8. **«Ändra i banken» form** (lazy): Namn, Block, Minuter, Varför, Så gör du (1–4), Se upp för, Säkerhet, Redskap (Teknik), Källa link / kanal / starttid, «Bara för erfarna ledare». Validation is the same as the own form. Saving clears `needs_coach_review`. Tags, difficulty, links, visual and sort order are never sent.
9. **Bot writes (E1).** `tools/bank/push-promote.ts`, see below.
10. **Seed in ≤16 KB parts.** `export-seed.ts --chunked` writes `tools/bank/out/parts/`, 8 parts byte-identical to Planner's verified split. `--new-only` is the path from now on.
11. **Setup pastes for Christoffer** in `tools/bank/out/setup-32/`, see below.
12. **Footer** «Träningsplaneraren · Slice 32» (+ « · Logga in som admin» when the bank is configured).
13. **Slice 31 preserved:** offline-first, the stale line only in Biblioteket, vars unset = today's app, hidden drills still render in old passes.

## Changed files

| File | Change |
|---|---|
| `app/package.json`, `app/package-lock.json` | `@supabase/supabase-js@^2.117.2` (imported dynamically only) |
| `app/src/main.tsx` | starts admin only `if (shouldStartAdmin())`, via dynamic import |
| `app/src/App.tsx` | footer admin segment (order: label · admin · Visa tips igen · Uppdatera), lazy login sheet, lazy sign-out |
| `app/src/data/blockMeta.ts` | footer → Slice 32; all Slice 32 `admin*` strings |
| `app/src/lib/bankRow.ts` | `BankRowStatus` (+pending), `rowToEntry(raw, {allowPending})` (options object), `BANK_ID_RE` export |
| `app/src/lib/bank.ts` | `applyBankEntries()` (published + hidden only); listeners as a plain array (no `.delete(` in src) |
| `app/src/lib/bank.test.ts` | +3 tests: pending never in store/cache, coach path refuses pending, apply guards |
| `app/src/lib/admin/state.ts` | **new**: eager, tiny: login state store, admin bank store, `shouldStartAdmin`, `adminAvailable`, `ADMIN_AUTH_KEY` |
| `app/src/lib/admin/client.ts` | **new**: lazy `createClient` (PKCE, own storage key, `detectSessionInUrl: false`) |
| `app/src/lib/admin/authReturn.ts` (+test) | **new**: parse/clean `?code=` / error returns, keep `#dela=` |
| `app/src/lib/admin/session.ts` (+test) | **new** (lazy): `startAdmin`, `sendLoginLink`, `classifySendError`, `signOutAdmin` |
| `app/src/lib/admin/adminBank.ts` | **new** (lazy): load all rows incl. pending, counts, apply to coach store |
| `app/src/lib/admin/bankWrite.ts` (+test) | **new** (lazy): guarded UPDATEs, conflict/offline/failed |
| `app/src/lib/admin/adminFormat.ts` (+test) | **new**: date, last-changed line, ids used by malls/wizard, start time |
| `app/src/lib/admin/useAdmin.ts` | **new**: hooks (admin, admin bank, online) |
| `app/src/components/AdminLoginSheet.tsx` | **new** (lazy) |
| `app/src/components/AdminDetailPanel.tsx` | **new** (lazy) |
| `app/src/components/AdminHideConfirm.tsx` | **new** |
| `app/src/components/AdminBankForm.tsx` | **new** (lazy) |
| `app/src/components/AdminStatusBadge.tsx` | **new**: Väntar / Dold badges |
| `app/src/components/LibraryPanel.tsx` | admin bar, chips, admin lists, badges |
| `app/src/components/SessionBuilder.tsx` | admin detail slot, not-addable guard, bank form, toasts |
| `app/src/components/ActivityCard.tsx`, `ActivityDetail.tsx` | `adminBadges` / `adminSlot` props |
| `app/src/export.css` | quiet admin styles |
| `tools/bank/push-promote.ts`, `promote-lib.ts`, `push-promote.test.ts`, `fixtures/promote-2.json` | **new**: bot script + tests + fixture |
| `tools/bank/export-db.ts` | **new**: read-only backup snapshot |
| `tools/bank/export-seed.ts`, `export-seed.test.ts` | `--chunked`, `--out-dir`, `--existing`; new-only link fill guarded with `is null`; tests |
| `tools/bank/out/parts/*.sql` | **new**: 8 committed seed parts |
| `tools/bank/out/setup-32/*` | **new**: paste-ready setup |
| `tools/bank/README.md` | chunked, new-only policy, bot usage |
| `slice-30/content/seed-promotion.md` | superseded banner (AC45) |
| `verifier/slice-32-local/*` | **new**: local stand-in (roles, setup/start/stop/users, gateway, SMTP sink, share-token helper) |
| `verifier/slice-32-builder-smoke.mjs`, `.md`, `slice-32-smoke-results.json` | **new**: smoke + report |

## Tests / build / smoke

- `bun test src`: **114 pass / 0 fail** (17 files). Slice 31 had 80, so +34.
- `bun test tools/bank`: **19 pass, 5 live skipped**. With `S32_GATEWAY=http://127.0.0.1:54340` against the stand-in: **24 / 24**.
- `npm run build`: green. `npx tsc -b` clean. oxlint shows no new warnings.
- **Bundle** (plain build, gz):

  | Chunk | Slice 32 | Slice 31 |
  |---|---|---|
  | `index` | 135.35 kB | 134.59 kB |
  | shared `jsx-runtime` (eager; Rollup split it out because the lazy chunks use it) | 3.12 kB | — |
  | **Eager total** | **138.47 kB** | **134.59 kB** |

  Growth is **+3.88 kB gz** (< 5). Lazy chunks: supabase-js `dist` 55.01, `AdminBankForm` 1.98, `bankWrite` 1.14, `AdminDetailPanel` 1.00, `session` 0.92, `adminBank` 0.75, `AdminLoginSheet` 0.73.
- **Smoke:** 86 / 86 PASS (see `verifier/slice-32-builder-smoke.md` for AC23–50).
- **RLS:**
  - `rls-smoke.sql` full: 13 × PASS on the stand-in.
  - Smoke tests per role:
    - anon: no pending, no writes.
    - non-admin user token: update → `[]`, insert / self-admin → 403.
    - admin token: update allowed, `updated_by` stamped, spoof overwritten, DELETE 403.
    - bot key: insert/update allowed, DELETE 403 `permission denied`, refused from a browser Origin, revoked → 401.
- **Secret grep:**
  - `grep -rn "sb_secret_\|service_role" app/src` → nothing.
  - The eager bundle → nothing.
  - The lazy supabase-js chunk contains only the library's prefix check `startsWith("sb_secret_")`, which is not a key. `grep -E "sb_secret_[A-Za-z0-9]"` over `app/src app/dist tools .github` → nothing.
  - `.github` uses only `vars.VITE_SUPABASE_*`.
  - `service_role` appears only as a role name: the schema copy, the bot's JWT-role check and its test.
  - The local bot key value appears in no repo file.

## Bot script usage (E1)

```bash
# key: only from the box env var SUPABASE_PLANNER_BOT_KEY (secure input, step 10) — never a file, chat or GitHub
python3 slice-30/content/check_import.py import-trials/<videoId>/promote.json
bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json --dry-run          # no key needed; no writes
SUPABASE_URL=https://fhzqwbdlejzohetdoluw.supabase.co \
  bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json                 # rows → pending
bun tools/bank/push-promote.ts <file> --replace <id>    # only with Christoffer's OK: text overwrite, status unchanged
SUPABASE_URL=… bun tools/bank/export-db.ts               # read-only backup → tools/bank/out/bank-snapshot.json
```

- **Rows:** `id = seedId` (block prefix checked). Same sanitizing as the in-app import. Every row gets `status: pending`, `needs_coach_review: true`, `updated_by: bot:planner` and `sort_order` after the block's last row. `newCoachOk` adds the `new-coach-ok` tag and sets `new_coach_ok`.
- **Redskap and links:** redskap come only from the fixed library (Teknik only). Links point only to bank ids or rows in the same file; own ids are rewritten to their seedId.
- **All-or-nothing:** an existing id is skipped and reported, and a 409 is also skipped.
- **Refusals:** a missing key, a publishable key, an anon/authenticated JWT, more than 100 exercises.
- **Safety:** the script never deletes and never prints the key. 401/403 gives «Nyckeln fungerar inte längre …».

## Chunked seed parts (`tools/bank/out/parts/`, ≤ 16 000 bytes each)

| Part | Bytes |
|---|---|
| bank-seed-del-1-av-8.sql | 14 798 |
| bank-seed-del-2-av-8.sql | 14 897 |
| bank-seed-del-3-av-8.sql | 15 581 |
| bank-seed-del-4-av-8.sql | 14 339 |
| bank-seed-del-5-av-8.sql | 14 925 |
| bank-seed-del-6-av-8.sql | 14 719 |
| bank-seed-del-7-av-8.sql | 12 834 |
| bank-seed-del-8-av-8.sql | 773 (5 link UPDATEs + count select) |

- **Byte-identical** to `/workspace/seed-split/out/` (cmp).
- **Same rows on PG17:** applying the 8 parts gives the same rows as the single `bank-seed.sql`. md5 of the ordered exercise rows (all columns except timestamps) = `dd5905d1…`, and redskap `1a5399b6…`, for both. Re-running either is idempotent.
- **`--new-only --chunked`** gives 5 parts (no `do update`; it fills only empty links).
  - On an empty DB it yields identical rows.
  - On a seeded DB it changes nothing, and an admin-edited title survives.
- **From now on: never re-run the full seed** (it would overwrite admin edits). Use `bun tools/bank/export-seed.ts --new-only --chunked` (optionally `--existing ids.txt`).

## Setup on the real project (Christoffer, after merge). Folder `tools/bank/out/setup-32/`

Every paste is under 16 KB. Details: `tools/bank/out/setup-32/README.md` (3 477 B) and `slice-31/content/setup-christoffer.md` steps 6–11.

1. **Authentication → Sign In / Providers:** Allow new users to sign up **OFF**, and Email provider enabled.
2. **Authentication → URL Configuration:**
   - Site URL `https://drevmok.github.io/traningsplaneringen/`.
   - Redirect URLs: the same address, plus `http://localhost:5173/traningsplaneringen/`.
3. **Email template:** no change (the default Magic Link works with PKCE).
4. **SQL Editor:** `01-schema-32.sql` (5 299 B, identical to `slice-31/content/schema-32.sql`). Safe to run twice. *(Already ran an older 01? Run the patches `07-fix-advisor.sql` (1 702 B) and `08-lock-bot-grants.sql` (958 B) instead.)*
5. **SQL Editor:** `02-check-policies.sql` (321 B) → five policy names.
6. **Authentication → Users → Create new user:** your e-mail, Auto Confirm.
7. **SQL Editor:** `03-admin-insert.sql` (392 B). Replace `DIN-EPOST@exempel.se` with your e-mail first.
8. **SQL Editor:** `04-check-admin.sql` (215 B) → one row, `owner`.
9. *(Recommended)* A second user without step 7, as the non-admin test user for the Verifier.
10. **Project Settings → API Keys → New secret key `planner-bot`:** paste it only into the box's secure input, so it becomes `SUPABASE_PLANNER_BOT_KEY`. No GitHub variable or secret.
11. *(Optional)* `05-rls-smoke-valfri.sql` (4 838 B). It rolls back, and every line should say PASS.
12. *(Optional)* `06-check-bank-after-setup.sql` (526 B), read-only.
13. **Security Advisor:** no RLS-disabled table; `private` is not exposed; lints 0028/0029 fixed (see follow-up below). Leaked-password protection: ignore (Pro-only, magic links).

## Deviations

- **Bot key location (AC40/42): accepted deviation** (Christoffer 2026-10-03). The key comes only from the env var `SUPABASE_PLANNER_BOT_KEY`, set through the box's secure input. There is no `bank-bot.env` file, so there is no file-mode check. Noted in `slice-31/verification-checklist.md`.
- **`detectSessionInUrl: false`** (builder-notes said true). The app does the cleanup and exchange itself, so it can keep `#dela=` and show `adminLinkFailed` for both return types.
- **`bankSnapshot.json` is not bundled (AC45): accepted as partial** (Christoffer 2026-10-03). `export-db.ts` is a backup only and the banner stays; the offline fallback stays the bundled seeds. Backlog: «Bundle latest DB snapshot into app offline fallback» (Parked / Later, `backlog/IMPROVEMENTS.md`).
- **`git grep sb_secret_` is not empty:** pre-existing `slice-31/` docs plus the verbatim schema copy (comment). No key values anywhere.
- **Admin chip resets the block filter** to «Alla typer» when switched on, so the count matches the list (not in the spec).
- **Footer order:** label · admin segment · Visa tips igen · Uppdatera appen (AC50 string first). On Home there is no slice label (as in Slice 31), so the admin segment comes first.

## Gaps / for the Verifier

- **Real project only:** AC47 (Advisor) and the real mailbox round trip. Also checking that Supabase's built-in mailer delivers only to team members (~2 mails/h). A non-admin test user needs a team-member address.
- **Bot rights (C2, fixed 2026-10-03):** `service_role` now has only exercises SELECT/INSERT/UPDATE and redskap SELECT, and nothing on `public.admins`. A secret key can still use the Auth admin API; that is the accepted E1 trade-off, so keep `planner-bot` on the box only.
- **Slice 31 smoke:** the script was not re-run (it needs its own stand-in). Its ACs were re-covered by the Slice 32 smoke (AC48a–e) and unit tests.
- **No Swedish login mail:** that needs custom SMTP (optional, later).

## Follow-up 2026-10-03

- **Security Advisor lints 0028/0029 fixed:** `stamp_updated_by()` moved to the `private` schema, EXECUTE revoked from public/anon/authenticated/service_role, trigger re-bound, and the old public copy is dropped. This is in `schema-32.sql` = `setup-32/01-schema-32.sql` (4 889 B). Already ran the old 01? Run `setup-32/07-fix-advisor.sql` (1 702 B). Verified on the stand-in: fresh, old→07, and re-runs. See `verifier/slice-32-builder-smoke.md` and `verifier/slice-32-local/check-advisor.ts`. Leaked-password protection: ignore (Pro-only, magic links).
- **Verifier FAIL fixes (after 30674d0):** **C2** `schema-32.sql` = 01 now resets `service_role` to exactly exercises SELECT/INSERT/UPDATE + redskap SELECT, nothing on admins (5 299 B). `08-lock-bot-grants.sql` (958 B, Planner's, unchanged) patches DBs that ran an older 01. On Postgres 17 it leaves `MAINTAIN` (see smoke report); re-running the current 01 clears that. `rls-smoke.sql` = 05 has a new Part 3 for the bot (10 PASS). **C1** a conflict re-reads the row and its version, and opening the admin detail re-reads it too, so «Stäng och öppna den igen» saves without a reload (unit test + smoke AC36c/d). **C5** when every row is skipped, push-promote prints «Inget nytt: alla övningar i filen fanns redan i banken. Inget skrevs.» instead of «Väntar på godkännande». This is plain Swedish; Docs has no microcopy for it. **C6** the stand-in takes its dir and ports from `S32_*` and stops only its own pids (`verifier/slice-32-local/README.md`). **AC40/42** are accepted deviations (env var via secure input, no env file). **AC45** is accepted as partial (backlog Parked / Later). `features/README.md` lists `delad-bank.md`. Tests: `bun test src` 115/115, `bun test tools/bank` 21 + 5 skip (26/26 with the gateway), build green, browser smoke 89/89.
