# Slice 30 — Övningsimport: fill the bank from videos (via Planner)

**App:** Träningsplaneraren  
**Approval:** **LOCKED 2026-10-02** — **A1 / B3 / C1 / D1 / E1 / F1**  
**Date locked:** 2026-10-02  
**Status:** LOCKED — in progress: Docs → Builder → Verifier.

**Product direction (Christoffer 2026-10-02):** Coach sends a YouTube/social link to **Planner in chat** (outside the app). Planner writes drafts in the app's Activity format (own words, credited). Coach approves. Exercises enter the app. The app never fetches video, never runs AI, never needs a key.

**Why slice 30:** highest pack folder is `slice-29/`, highest ship note `app/SLICE29-SHIPPED.md`, backlog's last shipped slice is 29, and PRs #2–#30 after it were un-numbered polish (footer still `Slice 29`). → **slice-30**.

**Standing locks:** Swedish UI; Teknik-only hall placements; soft/quiet chrome; device-local drafts; no CAD / accounts / cloud.

## Goal

1. **Källa** — drills can carry a credited video link (creator · time), shown quietly, carried in share links.
2. **Own exercises keep everything** Planner produces (redskap, tags, difficulty, progression links, review flag, source); form gains a Redskap picker.
3. **Importera övningar** — file or pasted code → validated preview → include/skip/replace → one write.
4. **Behöver granskas** — imported drills are marked until the coach reviews or edits.
5. **Redskap +5** — Kilmatta · Skumblock · Bom · Räcke · Rockring, drawn in the #12 style, wired to sketch, zones and Förrådslista.
6. **Seed path** — curated imports reach the shipped bank through a Planner → Builder PR (process doc, no UI).

**Coach outcome:** "Jag skickar en länk till Planner, får tillbaka en fil, importerar den i Biblioteket och har övningarna — med redskap, skiss och källa — i nästa pass."

## Trial findings (input: `import-trials/2DJ_oMM81mI/`)

| Finding | Pack answer |
|---|---|
| Text quality good; all 12 drafts fit 3–4 steps | Keep 4-step floor rule (E1); schema = Activity subset |
| YouTube blocks download (bot check) — only page text, chapters, thumbnails | Stays in Planner's chat workflow; app never fetches (out of scope) |
| 10 of 12 stations needed missing redskap (kilmatta, räcke, bom, rockringar, skumblock) | C1 adds 5 fixed pieces |
| Own drills drop redskap, difficulty, tags, links; cap 40 | Keep all fields; cap 100 |
| No source field | `Activity.source` + Källa line (F1) |
| StationSketch draws only redskap slots | New sketch kinds for the 5 pieces |

## Locked A–F

| # | Rec. | Meaning |
|---|---|---|
| A | **A1** | File + pasted code in Bibliotek; Home recognises exercise files |
| B | **B3** | Own (instant, device-local) **and** seed bank via Builder PR (curated) |
| C | **C1** | 5 new fixed redskap; no free-text "Övrigt" |
| D | **D1** | Own-only "Behöver granskas"; cleared by button or edit-save; never blocks |
| E | **E1** | Cap 100; Så gör du stays max 4 steps |
| F | **F1** | Quiet Källa link; never embed; own words only |

Full options: [`decisions.md`](./decisions.md).

## Current baseline (code discovery)

| Symbol | Location | Today |
|---|---|---|
| `Activity` | `types.ts` | Has `difficulty`, `tags`, `defaultStationEquipment`, `progressionOf`, `regressionOf`, `needsCoachReview`; **no** `source` |
| `asActivity` / `build` | `lib/ownActivities.ts` | Own drills forced to `difficulty:'easy'`, `tags:['egen']`; drop redskap/links/review; `MAX_OWN = 40`; 4 steps |
| `ShareOwn` | `lib/ownActivities.ts` | Carries text fields only |
| `MAX_FLOOR_STEPS = 4` | `data/activityTips.ts` | Floor-tip validation for all drills (golvkort, d371cc3) — reason E1 keeps 4 |
| `EQUIPMENT_PIECES` | `data/equipmentPieces.ts` | 10 pieces |
| `EquipmentKind` / `EquipmentIcon` | `components/equipmentMark.tsx` | 10 kinds; unknown piece → no icon |
| `expand()` | `components/StationSketch.tsx` | Fixed order list of 10 |
| `PIECE_ZONE` | `lib/hallSuggest.ts` | Redskap → zone (#4); already reads own drills via `getActivityById` |
| `loadOwnedEquipment` | `lib/ownedEquipment.ts` | Missing key = owns all; explicit list filters unknown ids → **new pieces would be un-owned** |
| `UI.needsCoachReview` | `data/blockMeta.ts` | String exists, unused; 5 seeds carry the flag |
| Receive | `components/Home.tsx` `takeTransfer` | File + paste for passes only |

## In scope

Source field + Källa line · own-exercise field preservation + Redskap picker · import sheet with validation/preview/dup/clip/notes · review badge · 5 redskap (icons, sketch, zones, Förrådslista, owned migration) · cap 100 · seed-promotion process doc · schema v1 + fixtures + Planner checker · footer 30.

## Out of scope

- In-app AI, LLM calls, API keys.
- Fetching YouTube/social in the browser (oEmbed, transcripts, thumbnails) — Planner does this in chat.
- Video embed / iframe / stored images or frames.
- Cloud sync, accounts, backend.
- `#importera=` link, compressed import token (nice-later).
- New hall zones (räcke/bom areas); making non-Teknik placeable.
- Free-text / coach-authored redskap ("Övrigt") — Parked.
- Editing tags / difficulty / links / source in the form; tap-through on progression links.
- Dedup between own copies and later seeds.
- Raising the 4-step floor rule (unless E2 locked).
- Adding the trial drills as seeds in this slice (they go via the B3 process after coach review).
- Pages republish unless Christoffer asks.

## Pack files

| File | Role |
|---|---|
| [`decisions.md`](./decisions.md) | A–F options + recommendations |
| [`screen-spec.md`](./screen-spec.md) | Wireframes per surface |
| [`verification-checklist.md`](./verification-checklist.md) | 44 acceptance criteria + Verifier smoke path |
| [`builder-notes.md`](./builder-notes.md) | Exact files + implementation notes |
| [`DOCS-START.md`](./DOCS-START.md) | Docs brief |
| [`HANDOFF.md`](./HANDOFF.md) | Pipeline + paths |
| [`content/`](./content/README.md) | Schema, example + edge JSON, checker, redskap spec, seed process, microcopy |

## Effort

**L** — touches storage, share format, a new import sheet, 5 SVG marks and a migration. Keep one Docs → Builder → Verifier loop.
