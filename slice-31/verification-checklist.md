# Slice 31 + 32 — acceptance criteria + verification checklist (DRAFT · recommended A1/B2/C1/D1/E1/F1)

**Authority:** each slice is verified and shipped **separately**. Slice 31 PASS = every AC 1–22. Slice 32 PASS = every AC 23–50 (and AC 1–22 still true). Adjust to the locked A–F.  
**Status:** DRAFT — Verifier runs only after lock + Christoffer setup + Docs + Builder + Planner ping.  
**Skill:** `verify-traningsplaneraren/` (Verifier adds feature map `features/delad-bank.md`); rigor per `backlog/PSTACK-OPS.md`.  
**Fixtures:** `content/rls-smoke.sql` (SQL Editor; rolls back) · `content/export_bank_seed.ts --json` (parity) · Supabase project from setup steps.  
**Never in a report:** the secret key, the DB password, session tokens. The publishable key may appear (public).

---

## Slice 31 — shared bank, read-only

### Database

| AC | Pass if |
|---|---|
| 1 | `schema-31.sql` runs clean on the project and again on re-run (no errors) |
| 2 | After seed SQL: `published = 51`, `redskap = 15`; 11 rows have `source`; every non-Samling row has `safety_line`; re-running the seed changes no counts and keeps a manually set `hidden` status |
| 3 | `rls-smoke.sql` Part 1 ends without error (anon reads exercises + redskap, sees no `pending`, cannot INSERT/UPDATE/DELETE) |
| 4 | With the publishable key over HTTP (`curl -H "apikey: …"`): GET `exercises` → 200, 51 rows; POST / PATCH / DELETE → refused (401/403, or 0 rows changed — verify in SQL Editor nothing changed) |
| 5 | Supabase **Advisors → Security** shows no "RLS disabled" for `public.exercises` / `public.redskap` |

### App

| AC | Pass if |
|---|---|
| 6 | Bank configured, fresh profile, online: startup makes **one** GET `exercises` + **one** GET `redskap` with header `apikey` and **no** `Authorization` header; Biblioteket lists 51 in the same order and wording as before the slice |
| 7 | Parity: every bank exercise maps to an `Activity` deep-equal to the bundled seed (plus `safetyLine`), incl. redskap, tags, links, Källa (script or test) |
| 8 | Change a title in the SQL Editor → reload → new title in Biblioteket, pass row, info panel, Golvklart, stationskort, print |
| 9 | After AC 8, block `*.supabase.co` (DevTools → Network request blocking; the page itself still loads — there is no service worker) and reload → app still shows the **new** title from the cache; `bankStale` line in Biblioteket only (not Home, Golvklart, Kör passet, print) |
| 10 | Brand-new profile with `*.supabase.co` blocked → bundled 51 shown immediately, `bankStale` line, no error dialog, UI usable during the ≤8 s timeout |
| 11 | Mocked responses: rows with 6 steps / missing safety (non-Samling) / unknown block → dropped, rest shown; **0 valid rows** or HTTP 500 → current copy kept (unit tests) |
| 12 | Build **without** the two variables → no request to Supabase, no `bankStale` line, bundled 51 |
| 13 | Set a row `hidden` → gone from Biblioteket, search, block filter and import duplicate list; a saved pass and a `#dela=` link containing it still show its title and text |
| 14 | `getActivityById` order own → bank → bundled (unit test with same id in bank and bundled → bank wins; id only in bundled → still resolves) |
| 15 | Insert a new `published` Teknik row (owner, SQL Editor) with tag `trampett` + redskap → appears after reload, addable to a pass, auto-zones to Trampett, Golvklart tip shows its `safety_line`, Förrådslista counts its redskap |
| 16 | Fresh data arriving after first render updates Biblioteket in place: scroll kept, an open **Ny egen övning** form keeps its input |
| 17 | Corrupt `gymnastics-planner-bank-cache-v1` (`"{"`) → ignored, bundled shown, then refreshed and rewritten |
| 18 | Coach keys untouched: own exercises, draft, egna mallar, tips, owned redskap, tonight filter behave as before; nothing from them is sent anywhere (Network tab) |
| 19 | Security: `grep -r "sb_secret_\|service_role" app/src app/dist tools .github` → nothing (comments in docs only); the publishable key appears only via build env, not committed in `app/src` |
| 20 | No new dependencies (`package.json` deps still react/react-dom); no login UI |
| 21 | Preserve: Källa line, Behöver granskas own-only, Golvklart hides Källa/badge, wizard, malls, hall placements, Förrådslista, Kör passet, share/import (Slice 30 smoke) |
| 22 | Footer `Träningsplaneraren · Slice 31`; `npm run build` green; `bun test src` green incl. new `bankRow` / `bank` tests |

### Slice 31 smoke path

1. Setup done (51/15 in DB). `app/.env.local` with URL + key → `npm run dev`.  
2. Fresh profile → Passbyggaren → Biblioteket: 51, same order. Network: 2 GETs, `apikey` only (AC 6).  
3. SQL Editor: `update public.exercises set title = 'Frysdans TEST' where id = 'fun-frysdans';` → reload → check surfaces (AC 8) → revert.  
4. Block `*.supabase.co` → reload → cached text + stale line (AC 9); new profile → bundled (AC 10).  
5. `status = 'hidden'` on a drill in a saved pass → AC 13 → revert.  
6. Insert test row → AC 15 → delete it as owner.  
7. Build without vars → AC 12. Run `rls-smoke.sql` Part 1, curl writes (AC 3–4). Grep (AC 19). Regression sweep (AC 21). Build + tests.

---

## Slice 32 — admin login + editing

### Database + auth

| AC | Pass if |
|---|---|
| 23 | `schema-32.sql` runs clean twice; `rls-smoke.sql` **full** ends without error (non-admin can't write or see pending; admin can update + see pending; nobody can DELETE; `admins` not writable from the app) |
| 24 | Sign-ups off: login with an e-mail not in Authentication → Users creates **no** user; app shows the same `adminLinkSent` text (no account guessing) |
| 25 | Magic link round trip (Christoffer's mailbox or test admin): request → mail → open in same browser → back in app logged in; `?code=` removed; an existing `#dela=…` hash survives; reload keeps session; **Logga ut** removes `gymnastics-planner-admin-auth-v1` |
| 26 | Normal coach visit loads **no** supabase-js chunk and shows only the footer link (Network + DOM) |
| 27 | Logged-in user not in `admins` → `adminNotAdmin`, no admin UI; direct API update attempts change nothing |
| 28 | Expired/used link → `adminLinkFailed`; 2nd request within 60 s → `adminWait` |

### Admin UI

| AC | Pass if |
|---|---|
| 29 | Admin mode: `Admin` chip; filter chips with correct counts for pending / needs review / hidden; pending + hidden only under their chips; not addable to a pass |
| 30 | **Godkänn** → `published`; another (anon) profile sees it after reload |
| 31 | **Ändra i banken** saves Namn, Block, Minuter, Varför, Så gör du (1–4), Se upp för, Säkerhet, Redskap (Teknik), Källa, Bara för erfarna; validation = own form; tags/difficulty/links/visual/sort preserved (check row in SQL Editor) |
| 32 | Save sets `updated_at` and `updated_by` = admin e-mail (not spoofable: sending `updated_by` from client is overwritten); detail shows `Senast ändrad … av …` |
| 33 | Saving clears `needs_coach_review`; **Markera som granskad** clears it without edit; review badge on bank rows only in admin mode (coach profile: none) |
| 34 | **Dölj för alla** → confirm → `hidden`: gone for everyone after reload; saved pass still resolves it; **Visa igen** restores; confirm shows `adminHideUsedIn` for an id used in a mall/wizard path (e.g. one from `seedTemplates.ts`) |
| 35 | No delete control anywhere; no delete call in code (grep `.delete(`) |
| 36 | Two tabs edit the same exercise → second save → `adminSaveConflict`, first edit intact |
| 37 | Offline admin → actions disabled with `adminOffline`; nothing queued or half-saved |
| 38 | After an admin write, this device's bank updates at once; a coach device sees it on next start; **pending rows never appear** in `gymnastics-planner-bank-cache-v1` (inspect) |
| 39 | Coach data still local: no own exercise/pass/mall leaves the device when logged in as admin |

### Bot writes (E1)

| AC | Pass if |
|---|---|
| 40 | Secret key exists only at `~/.config/traningsplaneraren/bank-bot.env`, mode `600`; `git grep sb_secret_` empty; not in GitHub variables/secrets, dist, pack, reports · **Accepted deviation (Christoffer 2026-10-03):** there is no env file; the key comes only from the box environment variable `SUPABASE_PLANNER_BOT_KEY`, set through the box's secure input. The file/mode-600 part is not checked; the rest still applies |
| 41 | `push-promote.ts` with a checker-clean `promote.json` → rows `pending`, `needs_coach_review = true`, `updated_by = 'bot:planner'`; invisible to anon; listed under **Väntar på godkännande** for the admin |
| 42 | Existing id → skipped + reported (no overwrite) unless `--replace`; publishable key in the env file → script refuses; file mode 644 → script refuses; key never printed · **Accepted deviation (Christoffer 2026-10-03):** no env file, so the env-file checks (publishable key in the file, mode 644) don't apply. A publishable key in `SUPABASE_PLANNER_BOT_KEY` is refused; the rest still applies |
| 43 | Bot cannot delete (DELETE with the secret key → permission denied) |
| 44 | Deleting the `planner-bot` key in the dashboard → script fails clearly; app unaffected |
| 45 | `export-db.ts` regenerates the bundled snapshot; app offline-first still shows all published rows from it; `seed-promotion.md` carries the superseded banner · **Accepted as partial (Christoffer 2026-10-03):** export + banner stay as they are; the snapshot is not bundled, so the offline fallback stays the bundled seeds. Backlog: «Bundle latest DB snapshot into app offline fallback» (Parked / Later) |

### Security + preserve

| AC | Pass if |
|---|---|
| 46 | `grep -r "sb_secret_\|service_role" app/dist app/src` → nothing; only the publishable key in the bundle |
| 47 | Supabase Security Advisor: no RLS-disabled tables; `private` schema not exposed in the Data API |
| 48 | Slice 31 ACs 6–18 still pass (rerun smoke 2–5) |
| 49 | Main chunk grows < 5 kB gz vs Slice 31 (supabase-js lazy); `npm run build` green; `bun test src` green |
| 50 | Footer `Träningsplaneraren · Slice 32 · Logga in som admin` |

### Slice 32 smoke path

1. Setup 6–9 (+10). Dev server with `.env.local`.  
2. Coach profile: footer link only; no supabase chunk (AC 26).  
3. Logga in som admin → mail → link → admin (AC 25). Non-admin test user → AC 27. Unknown e-mail → AC 24.  
4. Planner: `push-promote.ts` on a 2-exercise fixture → Väntar (2) (AC 41) → Godkänn one (AC 30) → Ändra the other, save (AC 31–33) → Dölj + Visa igen on a mall drill (AC 34).  
5. Two tabs conflict (AC 36). Offline (AC 37). Inspect cache (AC 38).  
6. `rls-smoke.sql` full (AC 23). Bot DELETE attempt (AC 43). Grep (AC 40, 46). Advisor (AC 47). Regression (AC 48). Build + tests + chunk size (AC 49).

## Fail if

- Any secret key, DB password or session token in the repo, bundle, GitHub settings, chat or a report.
- Anonymous key can write, or anyone can hard-delete through the API.
- `pending` rows reach a coach device, pass, share link or print.
- App blocks or errors when Supabase is unreachable (D1), or loses own exercises/passes.
- Old passes / share links show raw ids after a drill is hidden.
- Login link breaks `#dela=` links, or uses implicit (hash) tokens.
- Verifier run before lock + setup + Docs + Builder + Planner ping; anything merged to `main` without Christoffer.
