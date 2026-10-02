# Slice 31 — Shared exercise bank (read-only) — SHIPPED (local branch, not pushed)

**Date:** 2026-10-02 (Europe/Stockholm)
**Locks:** A1 / B2 / C1 / D1 / E1 / F1
**Branch:** `slice-31-shared-bank`. Local only, no upstream: no push, no PR.
**Base:** origin/main `003a4a0` (Slice 30 + seed PR #32). The pack `slice-31-pack` @ `8300aae` was brought in by **fast-forward** (`git merge --ff-only origin/slice-31-pack`; it sits directly on 003a4a0, so there is no merge commit).
**Builder self-smoke:** `verifier/slice-31-builder-smoke.md` — **PASS 48 / FAIL 0** at 390×844
**Screenshots:** `/workspace/screenshots/slice31_*.png`
**Copy authority:** `slice-31/content/microcopy.sv.md`. `bankStale` and the footer are shipped verbatim.

## What shipped

1. **Offline-first bank.** On startup `initBank()` runs synchronously before the first render:
   - bank configured + valid cache → the cached bank;
   - otherwise → the bundled 51 seeds.
   
   One background refresh per load (`refreshBank`) then makes two GETs (`exercises` published+hidden in `sort_order`, and `redskap`). They send the header `apikey` only (no `Authorization`), use `cache: 'no-store'` and abort after 8 s. A good answer replaces the store in place and writes the cache `gymnastics-planner-bank-cache-v1`. A failure keeps the current copy and sets status `stale`. Failures are: a network error, a timeout, a non-200, zero valid published rows, a failed redskap GET, or `navigator.onLine === false` (no request is made then).
2. **Row validation** (`bankRow.ts`): text is taken verbatim. Rows are dropped for a bad id, a status other than published/hidden, an unknown block, text over the limits, steps outside 1–4, minutes outside 1–180, or a missing Säkerhet on a non-Samling row. Within a kept row, unknown redskap ids, redskap off Teknik, a non-https Källa and bad links are removed. The cache is re-validated through the same path on read.
3. **`bankStale`** «Visar sparade övningar. Du kan planera som vanligt.» is grey plain text (12 px, `--md-on-surface-variant`, no role, no aria-live). It shows at the top of **Biblioteket only**, and only when the bank is configured and the fetch failed. It never appears on Home, Golvklart, Kör passet or print.
4. **Soft-hidden.** `hidden` rows are fetched and cached but not listed: not in Biblioteket, search, block filters or the import duplicate check. They still resolve through `getActivityById`, so old passes, drafts, hall, Golvklart, stationskort, Kör passet and shared links render them.
5. **Lookup order** is own → bank → bundled. `activitiesForBlock` and the import's default seed list use the bank list.
6. **Bank off = today.** With `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` unset, half-set, non-https, or set to a non-public key, the bank is off. Nothing is fetched, the cache is not even read, there is no stale line, and the bundled seeds are used. Only `sb_publishable_…` keys (or a legacy JWT whose role is `anon`) are accepted.
7. **Config.** `.github/workflows/pages.yml` passes the two values from **repository variables** (`vars.`), never from secrets.
8. **Seed export.** `tools/bank/export-seed.ts` (`bun tools/bank/export-seed.ts`) writes `tools/bank/out/bank-seed.sql` and `bank-seed.json`: 51 exercise upserts + 15 redskap, 11 with source, every non-Samling row has a Säkerhet line. Re-running keeps a manually set `hidden`. Both files are committed. The SQL body is identical to the pack prototype's output. The mapping is shared with the app (`activityToBankRow`) and is parity-tested.
9. **Footer** `Träningsplaneraren · Slice 31`.
10. **Not in this slice (Slice 32):** no auth, no magic link, no admin UI, no bot write key, no supabase-js. The client uses plain `fetch` and no new dependencies.

## Changed files

| File | Change |
| --- | --- |
| `app/src/lib/bankConfig.ts` | **new** — env → config (https origin, public-key allow-list), test override |
| `app/src/lib/bankRow.ts` | **new** — `BankRow`, columns, limits, `rowToEntry` / `rowToActivity`, `activityToBankRow` |
| `app/src/lib/bank.ts` | **new** — store, cache, `initBank`, `refreshBank`, list / find / ids / status / subscribe |
| `app/src/lib/useBank.ts` | **new** — `useSyncExternalStore` hook |
| `app/src/lib/bank.test.ts` | **new** — 17 tests: env unset / half-set / non-public key, anon JWT, seeds → cache fallback, fresh, stale on 500 / 0 rows / error / timeout / offline, corrupt cache, one fetch per load, hidden (not listed, renders in old pass, survives reload), lookup order |
| `app/src/lib/bankRow.test.ts` | **new** — 6 tests: parity for all 51 seeds, guards |
| `app/src/main.tsx` | `initBank()` before render, `refreshBank()` after |
| `app/src/App.tsx` | subscribes to the bank so the tree updates in place |
| `app/src/components/LibraryPanel.tsx` | lists bank activities; `bankStale` line |
| `app/src/components/HallBoard.tsx` | subscribes to the bank; five derived values computed directly instead of memoized (so bank updates show, lint clean) |
| `app/src/data/seedActivities.ts` | `getActivityById` own → bank → bundled; `activitiesForBlock` from the bank |
| `app/src/lib/ownImport.ts` | default seeds = bank list; known / resolvable ids include hidden bank ids |
| `app/src/data/blockMeta.ts` | footer Slice 31; `bankStale` |
| `app/src/App.css` | `.bank-stale` |
| `.github/workflows/pages.yml` | two `vars.` env lines |
| `.gitignore` | `tools/bank/out/*` except the two seed files |
| `tools/bank/export-seed.ts`, `tools/bank/README.md` | **new** — exporter + how to run it |
| `tools/bank/out/bank-seed.sql`, `bank-seed.json` | **new** — generated seed (51 / 15) |
| `verifier/slice-31-builder-smoke.{mjs,md}`, `slice-31-smoke-results.json` | **new** — self-smoke |
| `app/SLICE31-SHIPPED.md` | this file |

## Checks

- `bun test src`: **80 pass / 0 fail** (13 files; 23 new bank tests).
- `npm run build`: green. `tsc -b` clean. oxlint: no new warnings (the two remaining `react(refs)` warnings in RunPass / HallCanvas were already there).
- Smoke: **48 / 48 PASS**. It covers vars unset, vars set + failed fetch, a happy path through a local PostgREST over the real schema / RLS / seed, edit / hide / insert, the cache when blocked, updates in place, and a corrupt cache. AC walk: `verifier/slice-31-builder-smoke.md`.
- Local DB: schema-31 ×2 and seed ×2 ran clean; 51 / 15 / 11 source; `rls-smoke.sql` Part 1 PASS; anon GET 200, POST / PATCH / DELETE 401.
- **Secrets:** `grep -rn "sb_secret\|service_role" app/src app/dist tools .github` → nothing. The plain `dist` holds no Supabase URL or key. Added lines in the diff (outside the pack docs) carry only the test fixtures `sb_publishable_test` / `sb_publishable_x` / `sb_publishable_smoke_local_only` and `example-ref` / `bank-mock` hosts. There are no `sb_secret` values and no JWTs. The mock-bank build lives in `/tmp`, outside the repo.

## Deviations from the pack

- `tools/bank/out/bank-seed.sql` + `.json` are **committed**. builder-notes says `out/` is git-ignored, but the task asked for the SQL to be committed. The rest of `out/` is still ignored.
- Bank redskap labels are fetched and cached (`bankRedskapLabel`) but **not yet applied** to UI labels; builder-notes says "may". Labels match the bundled ones today.
- No 2 s retry (optional in the notes). Instead there is one fetch per load, and the next load retries.
- The cache also stores `hiddenIds`, so soft-hidden survives an offline reload.
- A failed redskap GET makes the whole refresh count as failed (keeps one consistent copy).
- The key allow-list (publishable or anon JWT only) is a stricter guard than the pack requires.
- The exporter imports the app's mapping (`activityToBankRow`) instead of duplicating it. Its output is byte-identical to the prototype's.

## Known gaps

- AC 1–5 on the **real** Supabase project, including Advisors (AC 5), need Christoffer's setup; they were verified only on a local stand-in.
- Kör passet memoizes its steps when it opens. Bank data arriving mid-run shows the next time Kör passet is opened.
- The print surface and a `#dela=` link containing a hidden drill were not driven in the browser (the lookup is unit-tested).
- The full Slice 30 smoke was not re-run; the regression sample is the wizard, malls, hall, Förrådslista, Kör passet and the unit suite.
