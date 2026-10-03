# Slice 31: formal verification report (shared exercise bank, read-only)

- **Date:** 2026-10-02, about 22:25 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Authority:** `slice-31/verification-checklist.md` AC 1–22, plus the locks A1 B2 C1 D1 E1 F1 in `slice-31/decisions.md`
- **Code under test:** PR #33, branch `slice-31-shared-bank`, SHA `c5e048d`. Not merged; nothing pushed to main.
- **Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence)
- **Build and tests:** `npm run build` exits 0 with the vars unset. `bun test src` gives **80 pass / 0 fail** across 13 files.
- **Real Supabase project:** not set up yet. `VITE_SUPABASE_*` are absent from the env, and there is no `.env` on disk or in git.
- **Drive targets** (all served with `vite preview`):

| Port | Build | Bank |
| --- | --- | --- |
| 4173 | vars unset | off |
| 4174 | vars set | unreachable host `verifier-test.supabase.co`, with a valid-format publishable key |
| 4175 | vars set | **local stand-in**: Postgres 17 + PostgREST 12 over the real `schema-31.sql`, RLS and seed, behind a self-signed HTTPS proxy |

- **Viewport:** 390×844 DevTools Responsive was requested. The saved screenshots show the drives mostly at desktop width, because the emulation didn't stick. The checked behaviour (requests, data on every surface, stale-line placement, cache, print) doesn't depend on width, and phone layout isn't changed by this slice.
- **Evidence:** `slice-31-evidence-code.md` (file:line per AC), screenshots `/workspace/screenshots/s31v_{A,B,C,D}_*.png`, and Builder's `slice-31-builder-smoke.md`.

---

## Live re-check 2026-10-03, about 06:55 CEST: **PASS, AC 1–6** (Slice 31 now PASS on AC 1–22)

**Project:** `https://fhzqwbdlejzohetdoluw.supabase.co` with publishable key `sb_publishable_In0_…` (public by design). Branch `slice-31-shared-bank` at `d75c160`, which has the same app code as `c5e048d`. Not merged. Verifier has no SQL Editor or dashboard access, so the checks below go over HTTP with the publishable key.

| AC | Verdict | Evidence (live project) |
| --- | --- | --- |
| 1 | **PASS (inferred)** | Both tables exist with the expected columns, anon has SELECT only, and the anon GETs return 200. Verifier didn't see the schema run twice; that part was proven on the stand-in (2026-10-02). |
| 2 | **PASS** | `exercises`: 51 rows, all `published` (Content-Range `0-50/51`). `redskap`: 15 rows. 11 rows have `source`. 0 non-Samling rows lack `safety_line` (blocks: gathering 5, warmup 7, techniques 24, strength 5, fun_and_games 10). Comparing all live rows with `tools/bank/out/bank-seed.json` field by field, in `sort_order`: **0 differences**, same order. Re-seed idempotence and keeping `hidden` were proven on the stand-in only. |
| 3 | **PASS (HTTP equivalent)** | Anon reads both tables. `status=neq.published` returns `[]`, so anon sees no pending or hidden rows. Anon writes are refused (AC 4). `rls-smoke.sql` itself wasn't run on the live project because there's no SQL Editor access; it passed 7/7 on the stand-in. Note: no pending row exists yet, so "pending invisible" is shown by policy and grant, not by an existing pending row. |
| 4 | **PASS** | POST, PATCH (`id=not.is.null`) and DELETE (`id=not.is.null`) on **both** `exercises` and `redskap` → **401** `42501 permission denied` (anon has no INSERT/UPDATE/DELETE grant). Counts are unchanged afterwards (51 / 15). Without `apikey` → 401. The OpenAPI root is not readable by anon (401). |
| 5 | **PASS** (Christoffer's confirmation) | Christoffer checked Supabase Advisors → Security on 2026-10-03 at 06:46 (relayed by Planner): no warnings. Verifier has no dashboard access. The grant-level refusals above are consistent with this. |
| 6 | **PASS** | Local build with both `VITE_` vars set, previewed on 4176, at 390×844, fresh profile, Disable cache on. Exactly **one GET `exercises`** and **one GET `redskap`**, both 200, plus 2 CORS preflights (OPTIONS 200). Each GET has `apikey` and **no `Authorization`**. A second reload made one of each again. Biblioteket shows **51 övningar** with no stale line. "Ljushopp i rockringar" shows `Källa: Prime Coaching Sport · 3:47 ↗`. `gymnastics-planner-bank-cache-v1` is written (`{"v":1,"fetchedAt":"2026-10-03T04:49:29.279Z",…`). The built bundle contains the project URL and no `sb_secret_` / `service_role` (`s31live_network.png`, `s31live_headers.png`, `s31live_bibliotek.png`, `s31live_detail.png`). |

---

## First-pass verdict (2026-10-02): **PASS for AC 6–22 · AC 1–5 PENDING real project**

Nothing blocks the merge for the app side. AC 1–5 (database on the real project, plus Advisors) need a short re-check once Christoffer's project and the two vars exist.

| AC | Verdict | Evidence |
| --- | --- | --- |
| 1 | **PENDING** (real project) | Stand-in: `schema-31.sql` ran clean twice. |
| 2 | **PENDING** (real project) | Stand-in: published 51, redskap 15, 11 rows with `source`, 0 non-Samling rows without `safety_line`. A re-seed kept the counts and kept a manually set `hidden` (`tech-hjul`). The file-level counts agree (51 / 15 / 11 / 46 of 46). |
| 3 | **PENDING** (real project) | Stand-in: `rls-smoke.sql` Part 1, all 7 checks pass (rolled back). |
| 4 | **PENDING** (real project) | Stand-in through PostgREST as anon: GET returns 200; POST, PATCH and DELETE return 401 and the row is unchanged. Local PostgREST doesn't check `apikey`, so repeat this on Supabase. |
| 5 | **PENDING** (real project) | Advisors can't be checked locally. |
| 6 | **PASS** (stand-in) | 4175, fresh profile: exactly one GET `exercises` and one GET `redskap`, both 200, with `apikey` and no `Authorization` (`s31v_D_network.png`). Biblioteket showed 51 in the same order before the test edits (executor headless + code). Repeat once in DevTools on the real project. |
| 7 | **PASS** | Unit test, plus an independent 51/51 deep-equal check from `bank-seed.json` and from rows read back out of Postgres. |
| 8 | **PASS** (stand-in) | Renaming `fun-frysdans` to "Frysdans TEST" in the DB, then reloading, showed the new title in Biblioteket, the pass row, the info panel, Golvklart, stationskort and Skriv ut passet (`s31v_D_bibliotek/pass/golvklart/print_*.png`). |
| 9 | **PASS** | On 4175, with `127.0.0.1:55443` blocked: the cached "Frysdans TEST" was kept, and the stale line showed only in Biblioteket (not on Home, Golvklart, Kör passet or print) (`s31v_D_blocked_*.png`). On 4174, the injected cache showed the same result. |
| 10 | **PASS** | On 4174 with a fresh profile: 51 shown at once, the stale line in Biblioteket, no error dialog, Home without the stale line, and no cache key written. The 2 failed GETs carried `apikey` and no `Authorization` (`s31v_B_*.png`). The 8 s timeout is covered by code (`bank.ts:30,176`) and a unit test; the browser drive failed instantly. |
| 11 | **PASS** | Unit tests: rows with 6 steps, missing Säkerhet off Samling, or an unknown block are dropped. With 0 valid rows or HTTP 500, the current copy is kept and marked stale. |
| 12 | **PASS** | 4173: footer "Träningsplaneraren · Slice 31", 51 övningar, no stale line, 0 requests to `supabase`/`rest/v1` (`s31v_A_off_*.png`). In code, `bankConfigFrom` returns null when unset, so neither the cache nor the network is touched. |
| 13 | **PASS** | Driven in the browser on 4174: the `#dela=` pass was saved, then a cache with `tech-hjul` hidden was loaded. Biblioteket showed 50 with no Hjul; searching "hjul" found only Minihjul; Teknik showed no Hjul. The pass row, Hallöversikt chip detail, Golvklart, Golvklart print (Skriv ut kort and Skriv ut passet), Kör passet and the reopened `#dela=` link (including its print) all show "Hjul (dold i banken)". No raw `tech-hjul` appears anywhere (`s31v_C_*.png`). The import duplicate list excludes hidden rows (code). |
| 14 | **PASS** | Unit test. The order is own → bank → bundled (`seedActivities.ts:1146`). |
| 15 | **PASS** (stand-in) | A new published Teknik row with the `trampett` tag and redskap appeared after reload (52), could be added to the pass, and auto-zoned to Trampett. The Golvklart tip shows its `safety_line` ("VERIFIER-SÄKERHET: landningsmatta efter trampetten. En i taget."). Förrådslista counts Trampett 1, Landningsmatta 1, Madrass 3× (`s31v_D_hall/golvklart/forrad.png`). |
| 16 | **PASS** (code + Builder smoke) | Biblioteket updates in place through the bank subscription, keeping scroll and the open Ny egen övning form. Not re-driven by me. |
| 17 | **PASS** | On 4175, setting the cache to `"{"` and reloading caused no crash or dialog. Biblioteket recovered, and the cache was rewritten to `{"v":1,"fetchedAt":…,"exercises":[…` (`s31v_D_corrupt.png`). |
| 18 | **PASS** | Coach keys are untouched (code). Only the two bank GETs appear in Network, carrying no coach data. |
| 19 | **PASS** | `grep -rn "sb_secret_\|service_role" app/src app/dist tools .github` returns nothing. In `slice-31/` the only hits are docs and `schema-32.sql` comments and grants, with no key values. `sb_publishable` appears in `app/src` only in the validator regex and test fixtures. The Pages workflow reads `vars.`. No `.env` is tracked. |
| 20 | **PASS** | Dependencies are still only react/react-dom, the lockfile is unchanged against `origin/main`, and there is no login UI or supabase-js. |
| 21 | **PASS** | Seed detail "Ljushopp i rockringar" shows `Källa: Prime Coaching Sport · 3:47 ↗` and no badge. The Slice 30 `example-import.json` import shows "Samma namn finns redan" with Ta med / Hoppa över, and both rows import as Egen + Behöver granskas (`s31v_A_*.png`). Golvklart hides Källa and the badge (code, plus seen in the earlier verifies). The wizard, malls, hall placement, Förrådslista and Kör passet were exercised during the drive. |
| 22 | **PASS** | Footer reads "Träningsplaneraren · Slice 31". Build is green. `bun test src` gives 80/0, including the new `bankRow` / `bank` tests. |

## Planner's independent checks

- **Vars unset behaves like main:** PASS. There are no Supabase requests and no stale line, and the cache isn't read.
- **Failed fetch:** PASS. The stale line «Visar sparade övningar. Du kan planera som vanligt.» shows only in Biblioteket, and there is one render site (`LibraryPanel.tsx:108`).
- **Hidden drill:** PASS. It renders in the old pass, the hall, Golvklart, Golvklart print and the `#dela=` link.
- **`bank-seed.sql`:** PASS. It gives 51 published exercises and 15 redskap (file count and stand-in).
- **No secret or service_role key** in src, dist, tools or .github: PASS.
- **Slice 30 import and the 11 YouTube seeds:** PASS.
- **Footer reads Slice 31:** PASS.

## Notes (non-blocking)

1. When the real project exists, re-check AC 1–5, and repeat AC 6 (the two GETs and `apikey` only) in DevTools against it.
2. Builder's documented gaps still stand: Kör passet doesn't pick up bank data that arrives mid-run, bank redskap labels are fetched but not applied, and there is no retry after a failed fetch.
3. Re-running `bank-seed.sql` overwrites title edits made in the DB, which matters from Slice 32 on, when admins edit. `status` is preserved.
4. A hidden bank title is left out of the import duplicate check, so an import with the same name shows as new. That matches the AC as written.
5. The stale-line element stays in the page, hidden, when Biblioteket is closed. That's fine visually; future checks should judge what is visible.

## Screenshots

| Area | Files |
| --- | --- |
| Bank off (4173) | `s31v_A_off_bibliotek.png`, `s31v_A_off_network.png`, `s31v_A_seed_detail.png`, `s31v_A_import_result.png` |
| Unreachable (4174) | `s31v_B_home.png`, `s31v_B_stale_bibliotek.png`, `s31v_B_network_headers.png` |
| Hidden drill (4174) | `s31v_C_share_before.png`, `s31v_C_bibliotek_hidden.png`, `s31v_C_search_hjul.png`, `s31v_C_pass.png`, `s31v_C_hall.png`, `s31v_C_golvklart.png`, `s31v_C_print_kort.png`, `s31v_C_print_passet.png`, `s31v_C_korpasset.png`, `s31v_C_share_after.png` |
| Stand-in (4175) | `s31v_D_network.png`, `s31v_D_bibliotek.png`, `s31v_D_pass.png`, `s31v_D_hall.png`, `s31v_D_golvklart.png`, `s31v_D_forrad.png`, `s31v_D_print_kort.png`, `s31v_D_print_passet.png`, `s31v_D_blocked_bibliotek.png`, `s31v_D_blocked_home.png`, `s31v_D_corrupt.png` |
