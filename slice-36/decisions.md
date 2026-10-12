# Slice 36 — Föreningens mallar — decisions (DRAFT · awaiting Christoffer lock)

**Status:** **DRAFT 2026-10-12** — Planner draft for A–F lock. Do not start Docs/Builder until locked.  
**Direction:** Club-tested passes from the shared bank show up in the existing **Starta från mall** list. Admins publish; coaches just pick.  
**Source:** Scout outside sweep 2026-10, idea #2 (`backlog/IMPROVEMENTS.md`). **Effort:** L.  
**Standing locks:** Swedish UI · coaches never log in · own exercises/passes/mallar stay on the device · Teknik-only hall · quiet chrome · fixed redskap library · no in-app AI.  
**Scope note:** This stretches the 2026-10-02 narrow lift of “Accounts / cloud” (Slices 31–32: read-only *exercise* bank + admin-only login) from exercises to whole passes. Still no coach accounts or sync. Needs Christoffer’s explicit OK on that stretch (locked by picking any A that uses Supabase).

## Recommended lock (one line each)

| # | Rec | In one line |
|---|---|---|
| A | **A1** | New `club_templates` table in the existing Supabase project (same as the exercise bank) |
| B | **B1** | Same admin list as today (`christoffer@guilotte.com`, `drevmok@gmail.com`) — no new roles |
| C | **C1** | Admin on a pass: **Publicera som föreningsmall** → writes the same SharePass v1 payload Egna mallar already store |
| D | **D1** | Coaches see cached club mallar at once; refresh in the background (same pattern as the exercise bank) |
| E | **E1** | Drop hall placements on publish and on apply (`clearHallPlacements`) — hall/Teknik locks untouched |
| F | **F1** | Edits overwrite; **Dölj** hides (no real delete); coaches cannot edit club mallar (they can still **Spara som mall** locally) |

Reply with e.g. `A1 B1 C1 D1 E1 F1` (or change any letter), plus a quick Usage-page check before we start.

---

## A. Where should club mallar live?

| Option | What it means for you |
|---|---|
| **A1 Rekommenderat** | **New `club_templates` table in your existing Supabase project** (anon read published rows; admin write). Same project as the exercise bank, same publishable key, same EU free plan. | Coaches get club mallar without a code PR per mall. Catch: needs a small SQL migration you approve before merge (same gate as Slices 31–32). |
| A2 | **Keep mallar as files in the GitHub repo** (Builder PR + Pages publish each time). | No new SQL. Slow, and two truths (code vs what you want live). |
| A3 | **Reuse the exercise bank table** (store a pass JSON as a weird “exercise”). | Avoids a new table, but pollutes Biblioteket rules and breaks the exercise model. |

**Why A1:** Same infra you already own; coaches stay login-free; publishing is an admin tap, not a deploy.

---

## B. Who can publish / hide club mallar?

| Option | What it means for you |
|---|---|
| **B1 Rekommenderat** | **Same admin list as the exercise bank** (today: christoffer@guilotte.com + drevmok@gmail.com). | Zero new accounts or roles. |
| B2 | **Only one publisher e-mail** hard-coded. | Slightly tighter, but adding a second person later needs another code/SQL change. |
| B3 | **Any coach after a login.** | Reopens coach accounts — fights the product lock. |

**Why B1:** You already have two admins; no new login surface.

---

## C. How does an admin publish a mall?

| Option | What it means for you |
|---|---|
| **C1 Rekommenderat** | **From the open pass, while logged in as admin:** one action **Publicera som föreningsmall**. Payload = today’s `SharePass` v1 (same shape as **Spara som mall** / `savedTemplates.ts`). Title + minutes from the pass; admin can rename on publish. | Fewest new screens; reuses proven share format. |
| C2 | **Separate admin “Mallbank” screen** to upload / paste JSON. | More UI; coaches gain nothing. |
| C3 | **Planner/bot writes mallar as “Väntar”** (like YouTube stations), you tap Godkänn. | Useful later; overkill for club-owned passes you already built in the app. |

**Why C1:** You already build the pass in the app; publishing should be one tap from there.

---

## D. What do coaches see when offline / on slow wifi?

| Option | What it means for you |
|---|---|
| **D1 Rekommenderat** | **Start from the device cache of club mallar; refresh in the background** (same D1 idea as Slice 31). Bundled starter mallar (today’s built-in templates) always remain. If the DB naps or wifi is gone, coaches still see the last club list. | Planning never waits on the network. |
| D2 | **Always fetch live first.** | Freshest list, but a hall with no signal loses club mallar. |
| D3 | **Bundled only + a “Hämta föreningsmallar” button.** | Predictable, but most coaches never tap it. |

**Why D1:** Matches the bank promise coaches already live with.

---

## E. Hall placements inside a club mall?

| Option | What it means for you |
|---|---|
| **E1 Rekommenderat** | **Drop hall placements** when publishing and when a coach applies the mall (`clearHallPlacements` — already used when applying templates today). Club mall = drills + timings + redskap on stations; each coach places Teknik on *their* hall. | Keeps Teknik-only / hall locks clean; no wrong hall geometry shipped to another coach. |
| E2 | **Keep placements as published.** | Nice if every coach shares one hall layout; wrong if halls differ. |
| E3 | **Optional checkbox on publish:** “Ta med hallplaceringar”. | One more control; easy to add later on top of E1. |

**Why E1:** Safest default; matches how template apply already clears placements.

---

## F. Edits, hide, and what coaches may change?

| Option | What it means for you |
|---|---|
| **F1 Rekommenderat** | **Edits overwrite; nothing is really deleted.** **Dölj** hides the mall from Starta från mall for everyone but keeps the row (same F1 pattern as the bank). Coaches **cannot** edit a club mall in place — they apply it, then **Spara som mall** locally if they want their own variant. Stamp who/when on admin changes. | Simple, reversible, no coach-write path into the cloud. |
| F2 | **F1 + full version history + Återställ.** | Safer against a bad edit; more to build. Easy later. |
| F3 | **Allow real delete.** | Gone forever; not recommended. |

**Why F1:** Same mental model as the exercise bank; coaches keep local ownership of their drafts.

---

## Planner notes (fixed by this pack if A1–F1)

1. Coaches: zero new screens/settings/logins — only extra cards tagged **Föreningens** in the Mallar list they already use.
2. SQL + RLS for `club_templates` needs Christoffer’s OK before merge (same gate as every Supabase change).
3. Bundle budget: prefer no new heavy library; reuse SharePass + bank cache patterns.
4. Out of scope this slice: coach editing of club mallar, sync of Egna mallar to the cloud, attendance, video, per-gymnast data.
5. Footer becomes `Träningsplaneraren · Slice 36` when it ships.
