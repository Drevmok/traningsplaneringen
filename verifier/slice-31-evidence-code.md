# Slice 31: shared bank (read-only), Verifier code and stand-in evidence

**PR:** #33 · **Branch:** `slice-31-shared-bank` @ `c5e048d` · **Date:** 2026-10-02 (Europe/Stockholm)
**Scope:** AC 1–22 (`slice-31/verification-checklist.md`). Slice 32 (AC 23–50) is out of scope.
**Locks:** A1 / B2 / C1 / D1 / E1 / F1 (`slice-31/decisions.md`)
**No app code was changed, committed or pushed.** No secret key, DB password or token appears in this file. Only fake publishable-format keys built for these tests appear here: `sb_publishable_verifierFAKE0000000000` and `sb_publishable_verifierLOCAL0000000000`.

> **Base ref:** the local `main` is 3 commits behind `origin/main` (the seed promotion, PR #32). `git diff main...HEAD` therefore also shows the seed-promotion files (`seedActivities.ts` +351, `activityTips.ts`, `icons/map.ts`, `seedActivities.test.ts`). The true PR diff is `git diff origin/main...HEAD`: 16 files under app/src, .github and .gitignore. `origin/main` is an ancestor of HEAD.

## Environment checks

| Check | Result |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in the process env | **not set** |
| `app/.env.local` or any `.env*` in the repo root or app/ | **none on disk**. `git ls-files` lists no `.env` file. `.gitignore` has `.env` and `.env.*` (lines 5–6) |
| Real Supabase project | **does not exist yet**, so AC 1–5 are **PENDING (real project)** |
| Postgres 17 | `/usr/lib/postgresql/17/bin` (17.11). `psql` is on PATH |
| PostgREST | `/tmp/postgrest/postgrest` (v12.2.3, Builder's download) |
| Builder artefacts | `/tmp/pg31` (Builder's cluster, stopped), `/tmp/postgrest/local.conf`, `/tmp/supabase-stub.sql` (roles + `auth` stub), `/tmp/rls-part1.sql`, `/tmp/dist-bank` (bank-mock build), `/tmp/dbg31*.mjs`, `verifier/slice-31-builder-smoke.mjs` + `slice-31-smoke-results.json`, `/tmp/pw` (playwright-core) |
| `bun test src` (re-run by me) | **80 pass / 0 fail**, 13 files. `bank.test.ts` + `bankRow.test.ts` = 23 pass |
| `npm run build` (re-run by me, vars unset) | exit 0 → `app/dist` (`index-BfU-jj_e.js`) |

---

## A. Code evidence (file:line)

### Gate: bank off = exactly like main
- `app/src/lib/bankConfig.ts:32-39`, `bankConfigFrom()`: trims and strips a trailing `/`. It returns `null` if either value is empty (`:35`), if the URL is not `^https://[a-z0-9.-]+(:\d+)?$` (`:36`), or if the key is not public (`:37`).
- `bankConfig.ts:45-55`, `isPublicKey()`: accepts `^sb_publishable_[A-Za-z0-9_-]+$`, or a 3-part `eyJ…` JWT whose payload has `role === 'anon'`. Anything else is rejected and the bank turns off. So `sb_publishable_verifierFAKE0000000000` is accepted, and `sb_secret_…` / service-role JWTs are refused.
- `bankConfig.ts:61-63`: `bankEnabled()` = `bankConfig() !== null`.
- `app/src/lib/bank.ts:121-126`, `initBank()`: `if (!bankEnabled())` → `setSnapshot(bundled(), seedActivities)` and return. **`readCache()` (`:127`) is never reached**, so the cache is not read.
- `bank.ts:166-169`, `refreshBank()`: `if (!config) return getBankSnapshot().status`. This happens before any `fetch`, so **no request is possible**. The status stays `'bundled'`, and `markStale()` (`:140`) is never called, so there is **no stale line**.
- `bundled()` (`bank.ts:47-55`) uses the same `seedActivities` array reference. `getActivityById` → `findBankActivity` → `byId` built from `seedActivities` gives the same objects as before. `activitiesForBlock` → `listBankActivities()` is the same array as on main.
- `bank.ts:147` is the only `fetch(` added under app/src. The other one, `appUpdate.ts:26`, is pre-existing and same-origin.
- Unit test: `bank.test.ts:119-148`. A planted cache is ignored, `calls.length === 0`, and the status stays `bundled` for env unset / URL only / http / unknown key / `authenticated` JWT.
- Plain `app/dist`: `grep "supabase\.co\|verifierFAKE"` finds nothing. The only `sb_publishable_` hit is the allow-list regex.
- Headless sanity run (4173, vars unset): Biblioteket shows 51, no visible stale line, **0 requests to any non-local host**, no page errors.

### Startup request shape (AC 6)
- `bank.ts:176`: `setTimeout(() => controller.abort(), options.timeoutMs ?? BANK_TIMEOUT_MS)`, with `BANK_TIMEOUT_MS = 8000` (`:30`). So the timeout is **8 s**.
- `bank.ts:179-186`: `Promise.all` of exactly two `getJson` calls:
  - `${url}/rest/v1/exercises?select=<22 cols>&status=in.(published,hidden)&order=sort_order.asc` (`:181`)
  - `${url}/rest/v1/redskap?select=id,label_sv,visual_key,sort_order&order=sort_order.asc` (`:185`)
- `bank.ts:146-155`, `getJson`: `method: 'GET'`, `headers: { apikey: key, Accept: 'application/json' }`, **no `Authorization` header** (comment `:149`), `cache: 'no-store'`, `if (!res.ok) throw` (`:154`).
- `bank.ts:169-170`: `refreshed` flag, so there is one refresh per load. `main.tsx:8` calls `initBank()` before render, and `main.tsx:17-19` calls `setTimeout(() => void refreshBank(), 0)` after render.
- Unit test: `bank.test.ts:167-184` (2 calls, apikey = key, no Authorization in either case) and `:276-283` (one fetch per load).
- Headless (4174 + 4175): exactly 2 GETs (exercises, redskap) with `apikey` present and **Authorization absent**.

### Validation and failure handling (AC 11)
- `bankRow.ts:121-183`, `rowToEntry`:
  - an id that fails `ID_RE` is dropped (`:124`)
  - a status other than `published|hidden` is dropped (`:126`), so `pending` never reaches the device
  - an unknown block (`BLOCK_ORDER`) is dropped (`:128`)
  - text that is missing or too long is dropped (`:134`)
  - **steps outside 1–4 are dropped** (`:135-136`, via `parseHowLines`)
  - minutes outside 1–180 are dropped (`:137-140`)
  - **missing Säkerhet off Samling is dropped** (`:147`)
  - unknown redskap and redskap off Teknik are removed, but the row is kept (`:166-169`)
  - a non-https Källa is removed (`:174-175`)
- `bank.ts:188`: `rows.map(rowToEntry).filter(…)` drops bad rows and keeps the rest.
- `bank.ts:190`: `if (published.length === 0) throw`, so **0 valid rows counts as a failure**. The `catch` (`:199-201`) calls `markStale()` and keeps the current copy. HTTP 500 is a non-ok status, so it throws (`:154`) and takes the same path. A failed redskap GET also fails the whole refresh (Promise.all).
- `bank.ts:196-197`: the cache is written and the store replaced **only after** a fully valid answer.
- Unit tests:
  - `bankRow.test.ts:45-56`: 6 steps / `safety_line: null` on Teknik / `block_type: 'cardio'` / `pending` / bad id / title of 81 chars / null are all dropped. `:57-62`: Samling may have no Säkerhet.
  - `bank.test.ts:215-222`: 0 valid rows → stale, no cache, 51 kept.
  - `:224-239`: a 6-step row and a missing-safety row are dropped, 49 shown.
  - `:186-201`: HTTP 500 → stale, the cached copy is kept.
  - `:241-250`: timeout → stale. `:252-259`: offline → stale, no request.

### bankStale render sites (AC 9 / 10 / 12)
- The string appears once: `app/src/data/blockMeta.ts:477`, `bankStale: 'Visar sparade övningar. Du kan planera som vanligt.'`
- **The only render site** is `app/src/components/LibraryPanel.tsx:108`, `{bank.status === 'stale' && <p className="bank-stale">{UI.bankStale}</p>}`, inside `tab === 'library'` (`:106-107`). It has no role and no aria-live. The style is `App.css:889-895` (12 px, `--md-on-surface-variant`).
- `LibraryPanel` is rendered only at `SessionBuilder.tsx:514` (in `.side-panel-slot`). Searches over app/src for `bankStale`, `bank-stale` and `Visar sparade` find no other site: not Home, HallBoard/Golvklart, RunPass/Kör passet, PassPrint, SharePass or StationDeck.
- Nuance: when the Biblioteket sheet is closed on a phone, the panel stays mounted but hidden (`App.css:1426`). A DOM text search can find the node, but `checkVisibility()` is false. UI checks must look at what is *visible*.
- Headless (4174): the stale line is visible in Biblioteket (1). Visible count is 0 on Home, on the builder with the panel closed, on the `#dela=` share page, in Golvklart and in the print host.

### Hidden drills (AC 13) and lookup order (AC 14)
- `seedActivities.ts:1145-1147`: `getActivityById(id) = findOwnActivity(id) ?? findBankActivity(id) ?? seedActivities.find(…)`, so the order is **own → bank → bundled**.
- `bank.ts:71-79`, `split()`: sorted by `sortOrder`. `all` = published + hidden, `published` = status published only.
- `bank.ts:197` / `:132-135`: `setSnapshot({activities: published, …}, all)`. `byId` (`:65-69`) is built from **all**, which includes hidden.
- `bank.ts:223-225`: `listBankActivities()` = published only. It feeds Biblioteket (`LibraryPanel.tsx:70`), search and block filter (`:68-81`), `activitiesForBlock` (`seedActivities.ts:1150-1154`), and the import duplicate-title list (`ownImport.ts:224-226`).
- `bank.ts:228-231`: `findBankActivity` = `byId.get`, which includes hidden.
- `bank.ts:234-236`: `bankActivityIds()` includes hidden. It is used only for import *link* resolution (`ownImport.ts:233`, `:331`), not for the duplicate-title list.
- Cache: `CacheV1.hiddenIds` (`bank.ts:32-39`, written at `:196`). On read, `readCache` re-validates each cached Activity through `activityToBankRow` → `rowToEntry`, with status `hidden` if the id is in `hiddenIds` (`bank.ts:91-97`). So hidden drills stay hidden after an offline reload.
- Surfaces that resolve via `getActivityById`:
  - pass rows: `BlockCard.tsx:82`, `SessionBuilder.tsx:526`
  - hall chips: `HallChip.tsx:50`, `HallBoard.tsx:142,282`
  - stationskort / Golvklart cards: `stationCards.ts:33`
  - Golvklart print and pass print: `PassPrint.tsx:82` (portal from `HallBoard.tsx:838-842`)
  - share page: `SharePass.tsx:113`
  - Kör passet: `runPass.ts:43`
  - hall zoning: `hall.ts:108`
  - redskap suggestions: `session.ts:244,277`
- Share decode: `sharePass.ts:85-127` keeps `activityId` verbatim (no filter by known ids), so a hidden id survives in a `#dela=` link.
- Unit tests:
  - `bank.test.ts:296-319`: hidden is not in the list, not in `activitiesForBlock`, and not in the import duplicate check (state `new`).
  - `:321-333`: hidden still renders (title, `runSteps`, `stationCards`).
  - `:335-343`: hidden survives a cache reload.
  - `:345-…`: bank wins over bundled, a bundled-only id resolves, own wins over both.

### Other app ACs
- **AC 7 parity**
  - `bankRow.test.ts:24-42`: 51 seeds → row → Activity, deep-equal + `safetyLine`.
  - **My independent check** (`/tmp/s31v/parity.ts`): (a) committed `tools/bank/out/bank-seed.json` → `rowToActivity`: 51/51 deep-equal to bundled + `floorTip().safety`, same order. (b) **DB round trip**: rows read through PostgREST as anon from a local PG17 loaded with `bank-seed.sql` → `rowToActivity`: 51/51 deep-equal, same order.
- **AC 16 in place**
  - `useBank.ts:5-6` (`useSyncExternalStore`), `App.tsx:43`, `HallBoard.tsx:113-120,149-153` (derived values no longer memoized on `session`), `LibraryPanel.tsx:81` (memo depends on `bank.activities`).
  - No `key` change or remount, and `setSnapshot` only notifies listeners (`bank.ts:65-69`).
  - Builder smoke C6b–C6d: scroll 600 → 600, the Ny egen övning form keeps its input.
  - Known gap: `RunPass.tsx:21` memoizes its steps on `session`.
- **AC 17 corrupt cache**
  - `bank.ts:81-107` wraps the read in `try/catch`, requires `v === 1` and an array, and needs at least one published entry. Otherwise it returns `null` and falls back to bundled.
  - The next good fetch rewrites the cache (`:196`). Other keys are never touched.
  - Unit test `bank.test.ts:261-274` (`"{"`, v 2, a non-array; the draft key is kept). Builder smoke D1.
- **AC 18 coach keys**
  - `bank.ts` reads and writes **only** `BANK_CACHE_KEY` (`:85`, `:114`). `bankConfig.ts` and `bankRow.ts` have no storage access.
  - Requests are GET with no body, and the URL has only fixed `select` / `status` / `order` params (`:181`, `:185`). Nothing from own exercises, draft, mallar, tips, owned redskap or the tonight filter is read by bank code.
  - Builder smoke N1/N2 (24 GETs, no body). Headless runs: only the 2 bank GETs left the box.
- **AC 20**
  - `app/package.json` dependencies are `react` and `react-dom` only. `git diff origin/main...HEAD -- app/package.json app/package-lock.json` is empty.
  - Searching app/src for `logga in|signIn|magic|@supabase|supabase-js|password` finds no matches. There is **no login UI**.
- **AC 22**
  - `blockMeta.ts:475`: `footerSliceLabel: 'Träningsplaneraren · Slice 31'`, rendered at `App.tsx:318` (non-home views).
  - Headless 4173 footer: `Träningsplaneraren · Slice 31 · Visa tips igen · Uppdatera appen`.
  - Build exit 0. Tests 80/0.
- **AC 8 (code)**: every surface reads titles through `getActivityById` (list above). The bank store replaces in place, and `useBank` in `App.tsx` / `HallBoard` / `LibraryPanel` makes the edit visible after reload.
- **AC 10 (code)**: `initBank` is sync before the first render, so the bundled 51 show at once. The fetch is asynchronous, so the UI is never blocked. There is no error dialog anywhere in `bank.ts`, and failures only set `stale`.
- **AC 15 (code)**:
  - auto-zone via `hallSuggest.ts:30` (`tags.includes('trampett')`)
  - Golvklart tip Säkerhet via `activityTips.ts:185` (`activity.safetyLine?.trim() || ACTIVITY_SAFETY[id]`)
  - Teknik redskap kept by `bankRow.ts:166-169`
  - Förrådslista counts the *saved* composition (`equipmentPieces.ts:172-190`). Defaults are applied through Använd förslag (`session.ts:244-247`, `:277`).
- **AC 21 (code)**: the PR diff (vs `origin/main`) doesn't touch SourceLine/Källa, the review badge, the Golvklart Källa/badge hiding, wizard, malls, hall placement logic, Förrådslista, RunPass or the share format. The only HallBoard change is the memo removal. The unit suite (incl. `sharePass`, `ownImport`, `source`, `runPass`, `hallSuggest`) is green.

---

## B. Secrets grep (AC 19)

```
grep -rn "sb_secret_\|service_role" app/src app/dist tools .github   → no output (exit 1)
```
- `slice-31/` hits are **docs and SQL comments/grants only**: `verification-checklist.md:40,90,101`, `content/schema-32.sql:8,45-48` (Slice 32 `service_role` grants, by design), `content/migration-plan.md:3`, `content/bot-writes.md:9,20` (placeholder `sb_secret_…`), `:22`, `content/setup-christoffer.md:5,83`, `content/config-pages.md:9`, `decisions.md:92`, `builder-notes.md:70`. **No key values.**
- `sb_publishable` in app/src: the regex at `bankConfig.ts:46`, plus the test fixtures `sb_publishable_test` / `sb_publishable_x` (`bank.test.ts:42,136,177`). **No real publishable key is committed.**
- JWT-like strings (`eyJ….…`) in app/src, app/dist and tools: none.
- `git ls-files | grep .env`: none. `.github/workflows/pages.yml:41-42` uses `${{ vars.VITE_SUPABASE_URL }}` / `${{ vars.VITE_SUPABASE_PUBLISHABLE_KEY }}`: repository *variables*, not secrets.

**AC 19: PASS.**

---

## C. bank-seed.sql: file counts + local stand-in (**local stand-in, not the real project**)

**File** `tools/bank/out/bank-seed.sql` (committed; identical to `/workspace/bank-seed.sql`):
- 51 `insert into public.exercises … on conflict (id) do update set …` statements. The column list has **no `status`**, and `status = excluded` appears 0 times, so the status is never touched on re-run.
- 15 `insert into public.redskap … on conflict (id) do update`.
- `bank-seed.json` (same rows): 51 exercises (Samling 5 · Uppvärmning 7 · Teknik 24 · Styrka 5 · Lek 10), 15 redskap, **11 with `source`**, **46 non-Samling, all with `safety_line`** (0 missing).

**Local stand-in.** A throwaway Postgres 17.11 cluster (`/tmp/s31v-pg`, port 55432, trust auth) with roles `anon`, `authenticated`, `service_role` (bypassrls) and `authenticator`:

| Step | Result |
|---|---|
| `schema-31.sql` run 1 | exit 0 (only "does not exist, skipping" NOTICEs) |
| `schema-31.sql` run 2 | exit 0 (only "already exists, skipping" NOTICEs), **idempotent** |
| `bank-seed.sql` run 1 | exit 0 → published **51** · hidden 0 · redskap **15** · with source **11** · non-Samling without safety **0** |
| `update … set status='hidden' where id='tech-hjul'` | published 50 · hidden 1 |
| `bank-seed.sql` run 2 | exit 0 → published 50 · hidden **1** · total 51 · redskap 15 · source 11 · missing safety 0. **`tech-hjul` still `hidden`** |
| `rls-smoke.sql` Part 1 (lines 1–51 + `rollback`) | `PASS anon reads 51 exercises` (50 published + 1 hidden) · `PASS anon sees no pending rows` · `PASS anon reads 15 redskap` · `PASS anon UPDATE refused` · `PASS anon INSERT refused` · `PASS anon DELETE refused` · `PASS anon redskap UPDATE refused`. Rolled back; `tech-rls-smoke` count 0 afterwards |
| PostgREST 12.2.3 as anon (AC 4 analogue) | GET `exercises?status=eq.published` → **200, 50 rows** (one hidden); `in.(published,hidden)` → 51 · POST / PATCH / DELETE → **401** `42501 permission denied` · the row was unchanged in SQL · CORS preflight allows `apikey` |
| Teardown | PostgREST stopped, `pg_ctl stop`, `/tmp/s31v-pg` removed |

Local PostgREST does not check the `apikey` header (Supabase's gateway does), so AC 4 must be repeated on the real project.

---

## D. Browser-drive targets (running, nohup)

| Port | URL | Build | Purpose |
|---|---|---|---|
| 4173 | http://127.0.0.1:4173/traningsplaneringen/ | `app/dist`, vars **unset** | AC 12, 21, 22, baseline |
| 4174 | http://127.0.0.1:4174/traningsplaneringen/ | `/tmp/s31-dist-stale`, `VITE_SUPABASE_URL=https://verifier-test.supabase.co`, key `sb_publishable_verifierFAKE0000000000` (NXDOMAIN, so the fetch fails at once) | AC 9/10 stale line, AC 13 via a seeded cache |
| 4175 | http://127.0.0.1:4175/traningsplaneringen/ | `/tmp/s31-dist-local`, `VITE_SUPABASE_URL=https://127.0.0.1:55443`, key `sb_publishable_verifierLOCAL0000000000` | AC 6, 8, 9, 10 (timeout), 11 (500), 13, 15, 16, 17 against the **local stand-in** |

Stand-in for 4175 (**local stand-in, not the real project**):
- PG17 `/tmp/s31v-ui-pg` :55442 (schema-31 + bank-seed, 51 published)
- PostgREST :55449
- Node HTTPS proxy `/tmp/s31v/https-proxy.mjs` :55443 with a self-signed cert for 127.0.0.1 (`/rest/v1/*` → PostgREST). The proxy logs every request with apikey/authorization yes/no to `/tmp/s31v/https-proxy.log`.
- Mode switch: `echo ok|hang|500 > /tmp/s31v/mode`. `hang` = no answer for 15 s, so the app aborts at 8 s.
- SQL as owner: `psql -h /tmp -p 55442 -U postgres -d bank -c "…"`
- Reset: `/tmp/s31v/reset.sh`. Stop everything: `/tmp/s31v/teardown.sh`.

Helper files:
- `/tmp/s31v/s31-cache.json`, a valid `CacheV1`: 51 exercises, `tech-hjul` hidden and retitled `Hjul (dold i banken)`, `fun-frysdans` retitled `Frysdans TEST`, 15 redskap labels. Copied to `/tmp/s31-dist-stale/s31-cache.json`, so it is served at `http://127.0.0.1:4174/traningsplaneringen/s31-cache.json`.
- `/tmp/s31v/share-token.txt`, `/tmp/s31v/ac15-insert.sql`, `/tmp/s31v/check.ts`, `parity.ts`, `validate.mjs`, `oldpass.mjs`.

**Share link** for the pass "S31 dold-test": Närvaro · Teknik: **Hjul** + Kullerbytta framåt (both placed in the hall, standard-trupp) · Lek: Frysdans. It was generated with the app's own `encodeShare` and round-tripped through `decodeShare`:
```
#dela=z.lZFRS8MwFIX_itznVNrVKeQHCHsQhPkmY9w1d21cmtTkZrOM_XfpOueUDPQpEM797jnn7mELshDAmg2BhHlZ3ChnVMYUGARYxxRAAgho0JgXajuDTDMFEgKjVehVxj523Ukxb9zu0bgdSPaRxr9ngxW1ZDmAfN1DoBC0szOmduSURaYnIOADZH5bCuiHd3oQV6Tll_ThLF0IWBlXbcYF3HdDlhq5Ia9tDQJU9Mja2Sdt4zHRVIBmascBfWYXIAAr1lvN_XHjCMks-i16lyKVY0tjSc4r8iDzw2KwfzKyQ9_GLjVb5N82LieYqsbq90ghuTFPm5_8Nj9gsuYtmhTlPulbXALLJHATjSG_6pnxr9ziRx-BPdmam_80so52iVYta2zTpVw56N3vCOtos7Xvg0J7jZM85-LwCQ
```
Append it to the 4174 or 4175 base URL.

**Cache-seed snippet** (4174 console). Why this path works: bank.ts reads the cache at startup when the bank is configured (`:127`), and a failed fetch keeps that copy (`:140-144`, `:199-201`).
```js
fetch('/traningsplaneringen/s31-cache.json',{cache:'no-store'}).then(r=>r.text()).then(t=>{localStorage.setItem('gymnastics-planner-bank-cache-v1',t);location.reload()})
```
Sanity runs (headless Chrome, 390×844; these are *not* the formal UI drive):

| Run | Result |
|---|---|
| 4173 | 51 · stale 0 · 0 external requests · footer Slice 31 |
| 4174 fresh | 2 GETs (apikey yes / Authorization no) · Home stale 0 · Biblioteket 51 + stale visible · no cache written |
| 4174 + snippet | Biblioteket **50**, no Hjul, `Frysdans TEST`, stale visible · search "hjul" → only `Minihjul (krabbhjul)` · Teknik filter 23, no Hjul |
| 4174 old pass | opened `#dela=` *before* hiding (shows Hjul) → Spara på den här enheten → snippet → reload → pass row `Hjul (dold i banken)` · hall chip aria `Station 1: Hjul (dold i banken). Tryck för detaljer.` · Golvklart shows it · Skriv ut kort and Skriv ut passet print hosts show it · stale 0 on Home, builder, Golvklart and print |
| 4174 `#dela=` after hiding | share page shows `Hjul (dold i banken)`, Skriv ut passet print host shows it, stale 0 |
| 4175 (ignoreHTTPSErrors) | 2 GETs (apikey yes / Authorization no), cache `v:1`, 51 exercises · Biblioteket 51 · stale 0 · after SQL `title='Frysdans TEST'` + `tech-hjul hidden` → reload → 50, `Frysdans TEST`, no Hjul. The DB was reverted afterwards |
| Page errors | none |

---

## E. Per-AC status (from code, tests and the local stand-in)

| AC | Status | Basis |
|---|---|---|
| 1 | **PENDING (real project)** | Local stand-in: schema-31 ×2 clean |
| 2 | **PENDING (real project)** | File: 51 / 15 / 11 source / 0 missing safety. Local: same counts after seed ×2; manual `hidden` survives a re-seed |
| 3 | **PENDING (real project)** | Local: rls-smoke Part 1 all 7 PASS, rolled back |
| 4 | **PENDING (real project)** | Local PostgREST: GET 200; POST / PATCH / DELETE 401; row unchanged. apikey enforcement only testable on Supabase |
| 5 | **PENDING (real project)** | Not checkable locally. RLS is enabled at `schema-31.sql:134-135` |
| 6 | **PASS (code + stand-in)** | `bank.ts:146-155,176-186`; unit `bank.test.ts:167-184`; headless 4175: 2 GETs, apikey only, 51 same order; parity script. Repeat in DevTools on the real project |
| 7 | **PASS** | Unit `bankRow.test.ts:24-42` + my JSON and DB round-trip parity, 51/51 |
| 8 | **PASS (code) · UI pending** | All surfaces use `getActivityById`. Builder smoke C2b/C2d/C2g/C3c/C4a–c (print not driven). Headless 4175: Biblioteket title change. **Hand to UI tester on 4175** (steps below) |
| 9 | **PASS (code + headless) · UI pending** | The stale line renders only at `LibraryPanel.tsx:108`; the cache is kept on failure. Headless 4174: cached `Frysdans TEST` + stale line in Biblioteket only. UI tester: real request blocking on 4175 |
| 10 | **PASS (code + headless) · UI pending** | Sync `initBank`, async fetch, no dialog. Headless 4174 fresh: 51 + stale. 8 s timeout covered by unit test; UI tester can use `hang` mode on 4175 |
| 11 | **PASS** | `bankRow.ts:121-183`, `bank.ts:188-201`; unit tests listed above. Optional browser check with `500` mode on 4175 |
| 12 | **PASS** | Gate `bankConfig.ts:32-39`, `bank.ts:121-126,166-169`; unit `bank.test.ts:119-148`; plain dist has no host or key; headless 4173: 0 requests, no stale line, 51 |
| 13 | **PASS (code + unit + headless) · UI pending** | `bank.ts` published/hidden split, `byId` includes hidden, `seedActivities.ts:1145-1147`; unit `bank.test.ts:286-343`; headless 4174 covered list / search / filter / old pass row / hall chip / Golvklart / print kort / print pass / `#dela=`. Import duplicate list: unit only |
| 14 | **PASS** | `seedActivities.ts:1146`; unit `bank.test.ts:345-…` |
| 15 | **PASS (code) · UI pending** | `hallSuggest.ts:30`, `activityTips.ts:185`, `bankRow.ts:166-169`. Builder smoke C3a–C3d (the Golvklart tip was not opened). UI tester on 4175 with `/tmp/s31v/ac15-insert.sql` |
| 16 | **PASS (code + Builder smoke)** | `useBank` / `useSyncExternalStore`, no remount. C6b–C6d. Not re-driven by me (optional on 4175 with `hang` → `ok`) |
| 17 | **PASS** | `bank.ts:81-107`; unit `bank.test.ts:261-274`; Builder D1 |
| 18 | **PASS** | bank code touches only `gymnastics-planner-bank-cache-v1`; GET-only fixed params; Builder N1/N2; headless request logs |
| 19 | **PASS** | Grep empty in app/src, app/dist, tools and .github; slice-31 hits are docs/SQL only; no committed key; no `.env` tracked; workflow uses `vars.` |
| 20 | **PASS** | deps `react` / `react-dom` only, lockfile unchanged vs `origin/main`; no login UI or supabase-js |
| 21 | **PASS (code / tests) · UI regression sweep pending** | PR diff doesn't touch the preserved features; unit suite green; Builder sample (wizard, mall, hall, Förrådslista, Kör passet). The full Slice 30 smoke was not re-run |
| 22 | **PASS** | `blockMeta.ts:475` / `App.tsx:318`; headless footer; build exit 0; `bun test src` 80/0 |

---

## UI tester steps (hand-off)

Use a **fresh browser profile** (or clear site data per origin). Phone width is about 390 px. Read Swedish labels as-is. The stale line is «Visar sparade övningar. Du kan planera som vanligt.»

**T1. AC 12 baseline (4173).** Open http://127.0.0.1:4173/traningsplaneringen/ with the DevTools Network tab open. Tap **Tomt pass**, then **Lägg till övning** in Teknik to open Biblioteket. Set the filter to **Alla**: 51 exercises, no stale line, and no request to `supabase.co` or `/rest/v1/`. The footer reads `Träningsplaneraren · Slice 31`.

**T2. AC 10 + stale line only in Biblioteket (4174, fresh profile).** Open http://127.0.0.1:4174/traningsplaneringen/.
1. Home: no stale line.
2. Tomt pass → Biblioteket: 51 show at once, the grey stale line is at the top, and there is no error dialog.
3. Network tab: one GET `exercises` + one GET `redskap` to `verifier-test.supabase.co` (fail). Request headers show `apikey` and **no `Authorization`**.
4. Application → Local Storage: `gymnastics-planner-bank-cache-v1` is absent.

**T3. AC 13 hidden drill in an old pass (4174).**
1. Same profile as T2. Open `http://127.0.0.1:4174/traningsplaneringen/#dela=<token above>`. The share page lists **Hjul** (bundled text).
2. Tap **Spara på den här enheten**.
3. Paste the cache-seed snippet in the console. The page reloads.
4. Check:
   - **Biblioteket** (Tomt pass is NOT needed; use **Fortsätt passet** → Lägg till övning): 50 exercises, stale line visible, **no Hjul**, **Frysdans TEST** present. Search `hjul` → only `Minihjul (krabbhjul)`. Filter Teknik → no Hjul.
   - **Pass row** (Passbyggaren): Teknik shows **Hjul (dold i banken)**.
   - **Hallöversikt** (builder action or Fler saker med passet → Hallöversikt): the station 1 chip is Hjul; tap it → detail title **Hjul (dold i banken)**.
   - **Golvklart** (Golvklart / Visa för golvet): station list shows **Hjul (dold i banken)**. No stale line.
   - **Golvklart print**: in the Golvklart action row, **Skriv ut kort** → the print preview shows card 1 **Hjul (dold i banken)**. Close it, then **Skriv ut passet** → the preview lists **Hjul (dold i banken)**. No stale line in either.
   - **Kör passet**: the step shows Hjul (dold i banken), no stale line.
   - **`#dela=` after hiding**: open the same `#dela=` URL again. The share page lists **Hjul (dold i banken)**, and **Skriv ut passet** shows it. No stale line.
   - No raw `tech-hjul` id anywhere.

**T4. AC 9 on 4174.** After T3, Home, Golvklart, Kör passet and the print previews have no stale line, and Biblioteket shows it. `Frysdans TEST` (the cached "new" title) is shown instead of the bundled `Frysdans`.

**T5. 4175 against the local stand-in (AC 6, 8, 9, 13, 15, 17).** Use a fresh profile.
1. **First** open https://127.0.0.1:55443/rest/v1/redskap?select=id and accept the self-signed cert (Advanced → Proceed). You should see JSON.
2. Open http://127.0.0.1:4175/traningsplaneringen/.

- **AC 6:** Network shows 2 GETs to `127.0.0.1:55443` with `apikey` and no Authorization. Biblioteket shows 51 in the same order as 4173, and no stale line. If the stale line appears here, the cert was not accepted. `/tmp/s31v/https-proxy.log` also records `apikey=yes authorization=no`.
- **AC 8 (parent runs the SQL):** `psql -h /tmp -p 55442 -U postgres -d bank -c "update public.exercises set title='Frysdans TEST' where id='fun-frysdans'"`. Reload, add Frysdans to Lek, and check the new title in Biblioteket, the pass row, the info panel, Golvklart and print. For stationskort, use a Teknik drill such as `tech-kullerbytta` → `Kullerbytta TEST`.
- **AC 9:** DevTools → Network request blocking → add `127.0.0.1:55443`. Reload: the new title is kept and the stale line shows in Biblioteket only. Remove the block afterwards.
- **AC 13:** open `http://127.0.0.1:4175/traningsplaneringen/#dela=<token>` → Spara på den här enheten. Then run `psql … -c "update public.exercises set status='hidden' where id='tech-hjul'"` and reload. Repeat the T3 checks. Here the title stays `Hjul`, because the DB text equals the bundled text. To prove the text comes from the bank, also set `title='Hjul (dold)'` in the same update.
- **AC 15:** `psql -h /tmp -p 55442 -U postgres -d bank -f /tmp/s31v/ac15-insert.sql` → reload. **Verifier testhopp trampett** is in Biblioteket (Teknik) and addable. Its detail and the Golvklart tip show `VERIFIER-SÄKERHET: …`. In the hall it auto-zones to Trampett. After **Använd förslag**, Förrådslista counts Trampett / Landningsmatta / Madrass ×2.
- **AC 10 timeout / AC 11 500 (optional):**
  - `echo hang > /tmp/s31v/mode` → new profile → the UI is usable at once, and the stale line appears after about 8 s.
  - `echo 500 > /tmp/s31v/mode` → reload → the current copy is kept, plus the stale line.
  - `echo ok > /tmp/s31v/mode` afterwards.
- **AC 17:** console `localStorage.setItem('gymnastics-planner-bank-cache-v1','{');location.reload()` → bundled is shown, then the cache is rewritten (`JSON.parse(localStorage.getItem('gymnastics-planner-bank-cache-v1')).v === 1`).
- Reset after use: `/tmp/s31v/reset.sh`.

## Concerns / notes
1. Local `main` is stale (3 commits behind `origin/main`). Diff PR #33 against `origin/main`.
2. AC 1–5 and AC 6 on real Supabase are blocked on Christoffer's project setup. Local PostgREST doesn't enforce `apikey`.
3. The stale-line node stays in the DOM, hidden, when the Biblioteket sheet is closed. DOM-text checks must test visibility.
4. 4174's host is NXDOMAIN, so it fails instantly. The 8 s timeout is exercised only by the unit test, or by the 4175 `hang` mode.
5. The 4175 HTTPS stand-in needs a manual cert acceptance in the tester's browser. I could not prove that click-through in headless mode (Playwright gets `ERR_CERT_AUTHORITY_INVALID`). The build itself was verified with `ignoreHTTPSErrors`.
6. Known Builder gaps (documented): Kör passet memoizes steps (`RunPass.tsx:21`), so bank data arriving mid-run shows on the next open. Bank redskap labels are fetched but not applied. There is no 2 s retry.
7. By design, re-running `bank-seed.sql` overwrites DB title edits (text from code wins). It is safe as an AC 8 revert in Slice 31, but in Slice 32 the DB becomes the source of truth (`--new-only`).
8. Hidden titles are excluded from the import duplicate-*title* list, so an import with the same name as a hidden drill shows `new`, not `sameName`. This matches the AC as written.
