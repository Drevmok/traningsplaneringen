# Slice 36 — Föreningens mallar

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-12.** A1–F1 locked on the recommended answers (per Planner, 2026-10-12). Docs pack only, no app code. Branch `slice-36-docs` from `main` @ `6daaa59` (Slice 35 code merge, PR #38; verified as `origin/main` tip on 2026-10-12).  
**Effort:** L.  
**Gate:** the SQL in [`sql/`](./sql/) needs Christoffer's OK and is pasted by him (see [`content/setup-christoffer.md`](./content/setup-christoffer.md)) before the Builder PR merges.

[`decisions.md`](./decisions.md) is Planner's A–F draft, copied as written. Where it differs from the locks below, this README wins.

## Why

Club-tested passes should reach every coach without a code PR. Admins publish a pass they built in the app; coaches find it under **Starta från mall**, also in a hall without wifi.

**Coach outcome:** "Jag öppnar Starta från mall, väljer en av föreningens mallar och placerar stationerna i min hall."  
**Admin outcome:** "Jag bygger passet, trycker Publicera som föreningsmall, och alla tränare har det nästa gång de öppnar appen."

## Locks

| Lock | Decision |
|---|---|
| **A1** | New table `public.club_templates` in the existing Supabase project `fhzqwbdlejzohetdoluw` (same as the exercise bank). Public read of visible rows with the publishable key (`sb_publishable_…`); writes for admins only. Coaches still have no accounts. |
| **B1** | Same admins as today (`public.admins`: christoffer@guilotte.com, drevmok@gmail.com) and the same check, `private.is_admin()` from `schema-32.sql`. No new roles. |
| **C1** | Admin action on the open pass: **Publicera som föreningsmall**. Payload = SharePass v1 (`sessionToShare` in `app/src/lib/sharePass.ts`, the same JSON `savedTemplates.ts` stores), minus `hallPlacements`. Title prefilled from the pass, editable in the dialog. |
| **D1** | Coaches see the device cache of club mallar at once; one background refresh per load, like the bank (`bank.ts`). Offline or failed → keep the cached list and show one stale line (`clubTemplatesStale`, sibling of `bankStale`). Built-in mallar and Mina mallar always stay. |
| **E1** | Hall placements are dropped on publish (not in the payload; the DB refuses them) and again on apply (`clearHallPlacements`). Hall template, Teknik-only hall and other hall locks untouched. |
| **F1** | Publishing with a name that already exists overwrites that mall (an admin edit = overwrite, after a confirm). **Dölj för alla** hides a mall for everyone (row kept, `hidden = true`); **Visa igen** brings it back. No real delete. Coaches can't edit club mallar; they apply one and can still use the local Spara som egen mall. |

## Scope

- `club_templates` table, RLS, grants, triggers (SQL in `sql/`, pasted by Christoffer).
- Coach: a **Föreningens mallar** group in the Mallar list, cache + background refresh, stale line, apply through the existing Ersätta-confirm.
- Admin: publish, overwrite confirm, Dölj för alla, Visa igen, a collapsed hidden group, "Senast ändrad" line.
- Footer `Träningsplaneraren · Slice 36`.
- Living coach doc [`docs/foreningens-mallar.sv.md`](../docs/foreningens-mallar.sv.md).

## Non-goals

Coach accounts or logins · coach writes of any kind · sync of Mina mallar to the cloud · version history / Återställ (F2) · real delete (F3) · hall placements in club mallar (E2/E3) · bot-written mallar or a Väntar/Godkänn queue (C3) · a separate Mallbank screen (C2) · reordering UI (sort_order stays 0; list is by name) · attendance, video, per-gymnast data · new redskap · new dependencies.

## Bundle budget (Effort L)

Measured on `main` @ `6daaa59` (`npm ci && npm run build` in a separate worktree, sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, the Slice 34/35 measure):

| | gzip -9 bytes |
|---|---|
| All JS + CSS | **213 915** (same as Verifier's Slice 35 branch number) |
| Eager (index js + index css + jsx-runtime) | 151 696 |
| Lazy admin + supabase-js chunks | 62 219 |

The old per-slice limit of < 512 B leaves **5 B** (Slice 35 grew +507 B). That limit was set for Effort S footer work and cannot hold a new list, cache module, fetch and admin dialogs.

**Budget for Slice 36: all JS + CSS grows by at most +3 072 B gz (3 kB), and the eager part by at most +2 048 B.**

Reasoning:
- Coach side (eager): a cache/refresh module that copies the `bank.ts` pattern (one GET, 8 s timeout, validate, write cache), a card group in `LibraryPanel`, ~10 strings and a little CSS. Estimate 1.2–1.8 kB gz.
- Admin side (lazy, loads only in admin mode like Slice 32's chunks): publish dialog, overwrite and hide confirms, write calls through the existing supabase client. Estimate 0.8–1.2 kB gz.
- No new dependencies: supabase-js is already a lazy chunk; SharePass, `clearHallPlacements` and the confirm components are reused.
- For scale: Slice 32 (a whole admin surface) grew +3.88 kB gz, mostly lazy.
- The budget is per slice. Slice 37+ go back to the < 512 B rule unless their pack says otherwise.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC28
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — final Swedish + keys
- [`content/setup-christoffer.md`](./content/setup-christoffer.md) — paste guide (Swedish)
- [`sql/36-01-table.sql`](./sql/36-01-table.sql), [`sql/36-02-rls-grants.sql`](./sql/36-02-rls-grants.sql), [`sql/36-03-smoke.sql`](./sql/36-03-smoke.sql)
- [`decisions.md`](./decisions.md) — Planner's A–F draft
