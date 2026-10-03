# Slice 31 + 32 — Delad övningsbank i en databas (läsa) · Admin-inloggning och redigering

**App:** Träningsplaneraren  
**Approval:** **LOCKED 2026-10-02 20:25** — **A1 / B2 / C1 / D1 / E1 / F1**  
**Date locked:** 2026-10-02  
**Status:** LOCKED — one pack, **two slices that ship separately**. Slice 31 (A1 + D1): next — Christoffer setup → Docs → Builder → Verifier. Slice 32 (B2 + C1 + E1 + F1): Approved/Locked, starts after Slice 31 is live.

**Why slice 31:** highest pack folder is `slice-30/`, highest ship note `app/SLICE30-SHIPPED.md`, PR #32 (11 Prime Coaching Sport seeds) was a seed batch, not a slice. → **slice-31** (read-only bank) and **slice-32** (admin) share this folder; Slice 32 gets its own ship note `app/SLICE32-SHIPPED.md`.

**Product direction:** The exercise bank should live in one shared place that Christoffer (and later trusted admins) can update **without a code PR + deploy per exercise**, while every coach still opens the app with no login and it still works in a hall with bad wifi.

**Standing locks touched (deliberately, now locked):** "no accounts / cloud" is lifted **narrowly**: Slice 31 = the app *reads* a public bank from a hosted database; Slice 32 = **admins only** can log in. Coaches still have **no accounts**; own exercises, passes, mallar, tips and hall stay **device-local**. All other locks stand: Swedish UI, Teknik-only hall placements, quiet chrome, no in-app AI, no video fetching, fixed redskap library.

## Goal

### Slice 31 — Delad bank, bara läsa
1. Move the **51 seed exercises** + **15 redskap** into two Supabase (hosted Postgres) tables: `exercises`, `redskap`.
2. App **starts instantly** from its last saved copy (or the built-in list), fetches the bank in the background, swaps in news, caches it.
3. **Offline / error / database napping → built-in exercises**, silently (one muted line in Biblioteket).
4. **No login.** Row-level security: the public key may only **read**; `pending` rows are never readable.
5. Config: Supabase URL + **publishable key** (the new name for the public "anon" key — public by design) come from **GitHub repository variables** in the Pages build.

### Slice 32 — Admin-inloggning och redigering
1. **Magic-link login** (e-post → länk) for people in an `admins` list. Sign-ups off.
2. Admin mode in Biblioteket: **Godkänn** (pending → published), **Ändra i banken**, **Dölj för alla / Visa igen** (soft hide, never hard delete), **Markera som granskad** (clears `needsCoachReview` on bank exercises).
3. RLS: insert/update only for admins; no delete for anyone through the API.
4. Replace the PR-based seed promotion: **Planner writes approved YouTube stations straight into the bank as "Väntar på godkännande"** with a dedicated secret key that lives only on the box; Christoffer taps Godkänn in the app.
5. **The secret key never ships in the client**, never in the repo, never in GitHub settings.

**Coach outcome (31):** "Appen startar som vanligt, men övningarna kommer från den gemensamma banken — och den funkar ändå när hallens wifi strular."  
**Coach outcome (32):** "Jag loggar in med en länk i mejlen, godkänner Planners nya stationer och rättar en text direkt i appen — alla tränare ser det nästa gång de öppnar."

## Locked A–F

| # | Locked | Meaning | Slice |
|---|---|---|---|
| A | **A1** | Bank in **Supabase** (hosted Postgres + login), free plan, EU region | 31 |
| B | **B2** | **Admins list**, starting with only Christoffer | 32 |
| C | **C1** | **Magic link** by e-mail | 32 |
| D | **D1** | **Saved copy + built-in fallback**, refresh in background | 31 |
| E | **E1** | Bots write with a **dedicated secret key on the box**, rows land as **Väntar på godkännande** | 32 |
| F | **F1** | **Soft hide + "senast ändrad"** (`updated_at` / `updated_by`), no delete button | 32 |

Full options in plain English: [`decisions.md`](./decisions.md).

## Current baseline (code discovery, `main` @ 003a4a0)

| Symbol | Location | Today | Pack answer |
|---|---|---|---|
| `seedActivities` (51) | `data/seedActivities.ts` | Static array; Samling 5 · Uppvärmning 7 · Teknik 24 · Styrka 5 · Lek 10; 11 with `source`; 16 with `needsCoachReview` | Becomes the **bundled fallback** + seed source for the DB |
| `getActivityById` | `data/seedActivities.ts` | own → seed; used by 14 modules (session, hall, wizard, runPass, print, share…) | own → **bank** → bundled (sync, unchanged signature) |
| `LibraryPanel` | imports `seedActivities` directly | Lists own + seeds | Reads the bank store (`useBank()`) |
| `ACTIVITY_SAFETY` | `data/activityTips.ts` | Seed Säkerhet lines live **outside** the Activity, keyed by id | DB column `safety_line` (filled by the export script via `floorTip`) — `floorTip` already prefers `safetyLine` |
| `EQUIPMENT_PIECES` (15) | `data/equipmentPieces.ts` | Fixed list; icons/sketch/zones are code | `redskap` table = reference list + labels; **new piece still = code slice** |
| `seedTemplates.ts` · `wizardPaths.ts` | data | 39 hard-coded seed ids | Ids never change; hidden drills still resolve; admin UI warns |
| Missing activity | `BlockCard` etc. | Shows raw id as title | Why "Dölj" keeps rows readable by id |
| Share link `#dela=` | `lib/sharePass.ts` | Carries own drills' text; seeds by id | Unchanged; magic link must use **PKCE `?code=`**, not hash tokens |
| `fetch(` | `lib/appUpdate.ts` only (`version.json`) | No other network | +1 bank fetch (31); + auth calls for admins (32) |
| Service worker | none | App needs network to load the page at all | "Offline" = page loaded, then hall wifi dies — or the database is unreachable/napping |
| Pages build | `.github/workflows/pages.yml` | `VITE_BASE`, `VITE_APP_BUILD` | + `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` from repo **variables** |
| `.gitignore` | root | ignores `.env`, `.env.*` | Local dev uses `app/.env.local` (ignored) |

## What Christoffer does himself (setup)

Full click-by-click: [`content/setup-christoffer.md`](./content/setup-christoffer.md). Short version:

**Before Slice 31 ships (~15 min)**
1. Create a free **Supabase** account (supabase.com — "Continue with GitHub" is easiest).
2. **New project** `traningsplaneraren`, region **EU (Stockholm or Frankfurt)**, choose a database password → save it in your password manager (nobody else needs it).
3. **SQL Editor** → paste `slice-31/content/schema-31.sql` → Run. Then paste the seed file Builder hands you (`tools/bank/out/bank-seed.sql`) → Run.
4. Copy the **Project URL** (**Connect** button) and the **Publishable key** (`sb_publishable_…`, **Project Settings → API Keys**). These two are public — paste them to Planner in chat, or put them yourself in GitHub → repo → Settings → Secrets and variables → Actions → **Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Say "merge" when Verifier passes (merging to `main` publishes the app).

**Before Slice 32 ships (~15 min)**
6. **Authentication → Sign In / Providers**: **Allow new users to sign up: off**; **Email** provider enabled.
7. **Authentication → URL Configuration**: Site URL `https://drevmok.github.io/traningsplaneringen/`; add the same under Redirect URLs (plus the localhost URL for testing).
8. **SQL Editor** → paste all of `slice-31/content/schema-32.sql` (4.4 KB, one paste) → Run.
9. **Authentication → Users → Add user → Create new user** with your e-mail (Auto Confirm User); then SQL Editor → run the "make me admin" snippet at the bottom of `schema-32.sql` (with your e-mail).
10. **Project Settings → API Keys → Secret keys → New secret key**, name it `planner-bot` → paste it **only into the secure input box on the box**, never in chat, mail or GitHub. Switching it off later = delete that key in the same screen.
11. Say "merge" when Verifier passes Slice 32.

*(Optional, only for a 2nd admin or Swedish login e-mails)* set up an own e-mail sender (custom SMTP) — see setup file.

**Good to know:** the free plan **pauses a project after 7 days with no use** (e.g. summer break). You get a warning e-mail; one click on **Restore** fixes it. Meanwhile the app keeps working on its saved/built-in exercises (D1).

## In scope

**Slice 31:** `schema-31.sql` (types, 2 tables, checks, triggers, RLS) · seed export script → idempotent SQL · bank store with cache + bundled fallback + background refresh · row → Activity sanitizer · hidden-but-resolvable · Pages env wiring · muted stale line · tests · footer 31.  
**Slice 32:** `schema-32.sql` (admins, `private.is_admin()`, admin policies, `updated_by` stamp) · magic-link login (lazy-loaded `@supabase/supabase-js`, PKCE) · admin mode in Biblioteket + detail actions + bank edit form · optimistic-concurrency saves · bot push script + key handling on the box · DB → bundled snapshot export · `bot-writes.md` replaces `seed-promotion.md` · footer 32.

## Out of scope (both slices)

- Accounts, login or cloud sync for **coaches**; uploading own exercises / passes / mallar.
- Realtime push (other devices update on next start).
- New redskap from the database (icons/sketch/zones stay code); editing the redskap table in the app.
- Editing mallar / Planera pass paths from the DB.
- Hard delete in the app; full version history (unless F2 locked).
- Admin "Ny övning i banken" from scratch and "Lägg egen övning i banken" (nice-later; bots + Godkänn cover the flow).
- Service worker / full offline app shell.
- Paid Supabase plan, custom domain, custom SMTP (optional, Christoffer's call).
- In-app AI, video fetching/embedding (Slice 30 locks stand).

## Pack files

| File | Role |
|---|---|
| [`decisions.md`](./decisions.md) | A–F options in plain English + recommendations + Planner notes |
| [`screen-spec.md`](./screen-spec.md) | Wireframes: stale line (31); login sheet, admin Biblioteket, detail actions, bank form (32) |
| [`verification-checklist.md`](./verification-checklist.md) | AC 1–22 (Slice 31) · AC 23–50 (Slice 32) + smoke paths |
| [`builder-notes.md`](./builder-notes.md) | Exact files per slice + implementation notes |
| [`HANDOFF.md`](./HANDOFF.md) | Pipeline per slice + paths |
| [`content/`](./content/README.md) | SQL (tested), RLS smoke, seed exporter, config, local-vs-bank, bot writes, setup, microcopy |

## Effort

**Slice 31: M** — one new store + sanitizer, one fetch, a script, CI env; most work is making the 14 `getActivityById` callers safe with a live-updating source.  
**Slice 32: L** — auth round trip, admin UI, policies, bot script, key handling. Keep one Docs → Builder → Verifier loop per slice.
