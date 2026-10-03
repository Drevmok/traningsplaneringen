# Slice 31 — shared bank (read-only) — Builder self-smoke

**Date:** 2026-10-02 (Europe/Stockholm) · **Branch:** `slice-31-shared-bank` (local, not pushed)
**Locks:** A1 / B2 / C1 / D1 / E1 / F1 · **Viewport:** 390×844, Chrome headless (playwright-core)
**Harness:** `verifier/slice-31-builder-smoke.mjs` → `verifier/slice-31-smoke-results.json`
**Screenshots:** `/workspace/screenshots/slice31_*.png` (17)
**Result:** **PASS 48 / FAIL 0** · 24 bank requests, all GET

## Setup used (all local, all stopped afterwards)

| Piece | What |
|---|---|
| Plain build | `npm run build` with **no** `VITE_SUPABASE_*` → `app/dist`, `vite preview` :4173 |
| Bank build | `VITE_SUPABASE_URL=https://bank-mock.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_smoke_local_only` → `/tmp/dist-bank` (outside the repo), `vite preview` :4174 |
| Database | Throwaway Postgres 17 cluster (`/tmp/pg31`) with Supabase-style roles `anon` / `authenticated` / `service_role` / `authenticator`; `slice-31/content/schema-31.sql` + `tools/bank/out/bank-seed.sql` |
| API | PostgREST v12.2.3 on :54332 as role `anon` (stands in for Supabase's Data API) |
| Routing | `context.route('https://bank-mock.supabase.co/rest/v1/**')` proxies GETs to PostgREST (CORS preflight answered), or aborts / answers 500 / delays per scenario |

Scenarios: **A** vars unset (with a planted fake cache) · **R** wizard + mall regression on the plain build · **B** vars set, fetch aborted / HTTP 500, fresh profile · **C** happy path through PostgREST, then edit / hide / insert in the DB, then bank blocked, then slow answer · **D** corrupt cache · **N** network hygiene over every bank request.

## Results

| ID | Check | Result | Detail |
|---|---|---|---|
| A2 | Home: no stale line | PASS |  |
| A1 | Footer reads Träningsplaneraren · Slice 31 (AC 22) | PASS | Träningsplaneraren · Slice 31 · Visa tips igen · Uppdatera appen |
| A3 | Biblioteket: bundled 51 in bundled order (AC 12) | PASS | 51 titles |
| A4 | Old cache ignored when bank is off | PASS |  |
| A5 | No stale line in Biblioteket (AC 12) | PASS |  |
| A6 | No request to Supabase / rest/v1 (AC 12) | PASS | 0 requests |
| R1 | Planera pass wizard → five blocks, Teknik pre-placed (AC 21) | PASS | filled=5 zones=trampett,trampett,open |
| R2 | Från mall → Nybörjare fills the pass (AC 21) | PASS | items=9 |
| B1 | Home: no stale line (AC 9/10) | PASS |  |
| B2 | Bundled 51 shown at once, same order (AC 10) | PASS |  |
| B3 | Stale line in Biblioteket with the exact text, plain text (no role/aria-live) | PASS |  |
| B4 | No error dialog | PASS |  |
| B5 | Nothing cached after a failed fetch | PASS |  |
| B6 | HTTP 500 → bundled 51 + stale line (AC 11) | PASS |  |
| C1a | Startup: exactly one GET exercises + one GET redskap (AC 6) | PASS | /rest/v1/exercises,/rest/v1/redskap |
| C1b | Header apikey = publishable key, no Authorization (AC 6) | PASS |  |
| C1c | Query asks for published+hidden in sort order | PASS |  |
| C1d | Cache written (v 1, 51 exercises, 15 redskap labels) | PASS |  |
| C1e | Biblioteket: 51 from the bank, same order and wording as before (AC 6/7) | PASS | 51 |
| C1f | No stale line after a fresh fetch | PASS |  |
| C1g | Two Teknik drills in the pass | PASS | Närvaro × / Dagens pass — snabb genomgång × / Kullerbytta framåt × / Hjul × |
| C2a | Reload makes one new pair of GETs | PASS |  |
| C2b | Pass row shows the edited title Kullerbytta TEST (AC 8) | PASS | Närvaro × / Dagens pass — snabb genomgång × / Kullerbytta TEST × / Hjul (dold) × |
| C2c | Hidden drill still renders in the old pass, with bank text (AC 13) | PASS |  |
| C2d | Biblioteket: edited title, new row, hidden gone (51 = 50 + 1 new) (AC 8/13/15) | PASS | 51 |
| C2e | Search "hjul" → only Minihjul (hidden not searchable) (AC 13) | PASS | Minihjul (krabbhjul) |
| C2f | Teknik filter: no hidden drill (AC 13) | PASS |  |
| C2g | Info panel of the edited drill opens (title row) | PASS |  |
| C3a | New bank row is addable; detail shows its Säkerhet line (AC 15) | PASS |  |
| C3b | New row auto-zones to Trampett (AC 15) | PASS | zone=trampett |
| C3c | Hall chips show bank titles incl. the hidden drill (AC 8/13) | PASS | Station 1: Kullerbytta TEST. Tryck för detaljer. / Ta bort från hall / Station 2: Hjul (dold). Tryck för detal |
| C3d | Förrådslista counts the new row's redskap (AC 15) | PASS | Trampett · Landningsmatta · Madrass |
| C4a | Golvklart shows Kullerbytta TEST + Hjul (dold) (AC 8/13) | PASS |  |
| C4b | Stationskort show the bank titles (AC 8/13) | PASS |  |
| C4c | Kör passet steps use the bank titles, incl. the hidden drill (AC 8/13) | PASS |  |
| C5a | Home: no stale line (AC 9) | PASS |  |
| C5b | Cached bank shown (edited title, new row, hidden still hidden) (AC 9) | PASS |  |
| C5c | Stale line in Biblioteket (AC 9) | PASS |  |
| C5d | Golvklart: no stale line (AC 9) | PASS |  |
| C5e | Kör passet: no stale line, cached title (AC 9) | PASS | stale=0 run=true |
| C6a | Before the answer: cached title | PASS |  |
| C6c | List updated in place to Kullerbytta LIVE (AC 16) | PASS |  |
| C6d | Library scroll position kept across the update (AC 16) | PASS | 600 → 600 |
| C6b | Open Ny egen övning form keeps its input across the update (AC 16) | PASS |  |
| D1 | Corrupt cache ignored, then refreshed and rewritten (AC 17) | PASS | 52 exercises (51 published + 1 hidden) |
| N1 | Every bank request was a GET without a body (AC 18) | PASS | 24 requests |
| N2 | Bank requests carry only select/status/order params (nothing from coach storage) | PASS |  |
| E | No page errors | PASS |  |

Notes from the run: DB: published=51 hidden=1 · Kör passet: stale line nodes in DOM (inside Biblioteket side-body?) = [true]. The one stale-line node seen while Kör passet was open belongs to the **closed** Biblioteket panel (`.side-body`), which stays mounted. It is not displayed (`checkVisibility()` false), so the coach does not see it.

## Database checks (local stand-in for AC 1–5)

| Check | Result |
|---|---|
| `schema-31.sql` run twice | clean both times |
| `bank-seed.sql` run twice | clean; published 51 · redskap 15 · 11 rows with source · 0 non-Samling rows without `safety_line`; a manually set `hidden` survived a re-seed |
| `rls-smoke.sql` Part 1 | all PASS (anon reads exercises + redskap, sees no `pending`, cannot insert / update / delete) |
| HTTP as anon via PostgREST | GET `exercises?status=eq.published` → 200, 51 rows · POST / PATCH / DELETE → 401; the row was unchanged in SQL |

The local PostgREST does not check the `apikey` header (Supabase's gateway does), so AC 4 has to be repeated on the real project.

## AC walk (verification-checklist.md, AC 1–22)

| AC | Status | Evidence |
|---|---|---|
| 1 | Local PASS · real project pending | schema-31 ran twice clean on Postgres 17 with Supabase roles. Repeat it in the Supabase SQL Editor |
| 2 | Local PASS · real project pending | 51 / 15 / 11 source / 0 missing safety; re-seed keeps counts and a manual `hidden` |
| 3 | Local PASS · real project pending | rls-smoke Part 1 all PASS (Part 2 is Slice 32) |
| 4 | Local PASS · real project pending | GET 200 / 51 rows; POST / PATCH / DELETE 401, nothing changed. Repeat with curl and the real publishable key |
| 5 | **Not checkable locally** | Supabase Advisors → Security. Verifier checks it on the real project. RLS is enabled in schema-31 for both tables |
| 6 | PASS | C1a–C1e: one GET exercises + one GET redskap, `apikey` only, no `Authorization`, 51 in bundled order and wording |
| 7 | PASS | `bankRow.test.ts`: all 51 seeds → row → `Activity` deep-equal (plus `safetyLine`), with redskap, tags, links and Källa; C1e in the browser |
| 8 | PASS (print not driven) | C2b pass row, C2d Biblioteket, C2g info panel, C3c hall chips, C4a Golvklart, C4b stationskort, C4c Kör passet. Print goes through the same `getActivityById`, but the print surface was not opened |
| 9 | PASS | C5a–C5e: bank blocked → cached edited title and new row; stale line in Biblioteket only (none on Home, Golvklart or Kör passet). Print not driven |
| 10 | PASS | B1–B5: fresh profile, fetch aborted → bundled 51 at once, stale line, no dialog, nothing cached. Timeout covered in unit tests (8 s abort) |
| 11 | PASS | B6 (HTTP 500 → bundled + stale); unit tests: rows with 6 steps, missing safety, unknown block or pending are dropped; 0 valid rows / 500 / error / timeout keep the current copy |
| 12 | PASS | A1–A6: plain build, no request, no stale line, bundled 51, a planted cache ignored; unit test for the env-unset path |
| 13 | PASS (`#dela=` not driven) | C2c / C3c / C4a–C4c: hidden drill renders in the old pass (rows, hall, Golvklart, stationskort, Kör passet); C2d–C2f: gone from Biblioteket, search and Teknik filter; unit test: not in the import duplicate check, survives a reload from cache. `#dela=` resolves via `getActivityById` (unit-tested), but the link was not opened in the browser |
| 14 | PASS | unit test: bank wins over bundled; bundled-only id resolves; own wins over both |
| 15 | PASS | C3a–C3d: inserted Teknik row (tag trampett + redskap) appears, is addable, Säkerhet shown in detail, auto-zones to Trampett, counted in Förrådslista. The Golvklart tip of that row was not opened separately |
| 16 | PASS | C6c / C6d: list updates in place, scroll 600 → 600; C6b: open Ny egen övning form keeps its input |
| 17 | PASS | D1 + unit test: `"{"` ignored, bundled shown, refreshed and rewritten (52 = 51 published + 1 hidden at that point in the run) |
| 18 | PASS | N1 / N2: 24 bank requests, all GET, no body, only `select` / `status` / `order` params. No coach keys are read by the bank code. Own exercises / import / mall / wizard flows exercised in R and C |
| 19 | PASS | `grep -rn "sb_secret\|service_role" app/src app/dist tools .github` → nothing. Plain `dist`: no Supabase URL or key (only the `sb_publishable_` prefix in the allow-list regex). Bank build kept in `/tmp`, not the repo. Diff grep in `app/SLICE31-SHIPPED.md` |
| 20 | PASS | `app/package.json` deps still `react`, `react-dom`; lockfile unchanged; no login UI; no supabase-js (plain `fetch`) |
| 21 | PASS (partly by smoke) | R1 wizard, R2 mall, C3b hall placement, C3d Förrådslista, C4c Kör passet; unit suite (Källa, review badge own-only, Golvklart hides Källa / badge, share / import) green. The full Slice 30 smoke was not re-run |
| 22 | PASS | A1 footer `Träningsplaneraren · Slice 31` (in the builder); `npm run build` green; `bun test src` 80 pass / 0 fail, including 17 `bank` + 6 `bankRow` tests |

## Not covered here
- AC 1–5 on the real Supabase project (needs Christoffer's setup), including Advisors (AC 5).
- Print surface and a `#dela=` link containing a hidden drill were not opened in the browser. Lookup is unit-tested.
- A real `*.supabase.co` block in DevTools. The smoke uses a route abort, which gives the browser the same failure.
