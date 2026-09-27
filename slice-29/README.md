# Slice 29 — Home 3-question wizard → complete pass + Teknik pre-placed

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-27** — A1–F1 locked  
**Date drafted:** 2026-09-27  
**Status:** **APPROVED 2026-09-27** — Docs starting; Builder follows Docs → Verifier.

**Product lock (Christoffer 2026-09-27 via Planner / external review):** Make the **template path the standard path** via three Home questions (CoachVault-style, adapted to our hall model). Today blank **Nytt pass** (Soft Samling) is primary and two malls are a side path. Instead: answer **ålder/nivå → fokus → hallayout** and land a **complete pass** (all five blocks seeded) with **Teknik stations already suggested/placed in the right zones** on the chosen hall.

**Standing locks (do not break):** Swedish UI; Teknik-only hall placements; Soft Samling still applies where blank path remains; device-local drafts; no CAD/cloud; quiet chrome Slice 22; preserve **22–28**.

**Leaves out of this pack (F1 locked):** Full CoachVault combinatorial matrix; CAD; cloud; Pages republish unless asked; making non-Teknik placeable.

## Goal

1. **Home wizard as the standard start** — three questions → one complete session draft.
2. **Complete pass** — all five blocks filled with seed activities (Samling Soft-consistent; other blocks within budget where practical).
3. **Teknik pre-placed** — on finish, Teknik items sit in matching hall zones for the chosen preset (tag → zone; open/mats for floor drills).
4. **Escape hatches** — Soft blank **Nytt pass** and old **Starta från mall** remain reachable (E1 locked), not deleted.
5. **MVP not ocean** — curated paths, not age × focus full matrix (C1/F1 locked).

**Coach outcome:** “Från Hem svarar jag på tre korta frågor och får ett färdigt pass där Teknik redan sitter i rätt zon på den hallayout jag valde — jag finjusterar, inte börjar från tomt golv.”

## Locked A–F (A1–F1)

| # | Choice | Meaning |
|---|---|---|
| **A** | **A1** | Wizard = **primary** Home CTA; keep **Nytt pass** + **Starta från mall** as quieter secondary escapes |
| **B** | **B1** | Q1: **4–6 år · 7–9 år · Nybörjare · Träning**; Q2: **Satsbräda · Trampett · Tumbling · Blandat** |
| **C** | **C1** | **~4 curated focus paths** (+ light age filter on coach-safe seeds); **not** full 4×4 matrix |
| **D** | **D1** | Q3 = choose hall preset **and** auto-place Teknik into zones matching activity tags / focus |
| **E** | **E1** | Soft blank + two old malls stay as **advanced/escape**; Soft Samling inject unchanged on blank |
| **F** | **F1** | MVP only: 3Q → complete pass + placements; defer full matrix / redskap auto-Använd alla / Pages; preserve 22–28; footer Slice 29 |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only — Samling / warmup / styrka / lek **never** on hall
- Soft chrome / Slice 22 quiet patterns
- Device-local drafts; **no** accounts / cloud / sync
- **NO** CAD / equipment pins
- Footer `Träningsplaneraren · Slice 29` when Builder ships
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **22–28** (Soft Samling blank, mall Samling budget, quiet chrome, Home polish, Förråd, saknar, place-step) except Home entry + wizard compose + pre-place

## Problem baseline

| Pain | Baseline today (post Slice 28 PASS) |
|---|---|
| Blank-first Home | Primary card **Nytt pass** → Soft Samling only; other four blocks empty — new coach still builds the whole pass |
| Malls are side path | **Starta från mall** → two templates; `cloneTemplate` sets `hallTemplateId: standard-trupp` and **`hallPlacements: []`** (cleared) |
| Hall still empty after mall | Coach must open Hallöversikt and place Teknik by hand — blank-floor friction |
| No age/focus questions | No CoachVault-style entry; focus redskap not asked |
| Presets exist unused at start | `hallPresets.ts`: Standard trupp · Tävling / linjer · Liten hall — only chosen later in Hallöversikt |
| Tag → zone unused | Seeds already tag `vault` / `trampett` / `floor`; hall has matching zones — no auto map today |
| Budget landmines | Short mall Uppvärmning **11/10** (pre-existing; Slice 28 note). Wizard compositions must target **≤ budget per block** |

## Current baseline (do not invent parallel without reason)

| Symbol | Location | Role |
|---|---|---|
| `Home.tsx` | `app/src/components/Home.tsx` | Cards: Nytt pass (primary), Starta från mall, Fortsätt; secondary Hall/Golvklart |
| `goNew` / `goTemplate` | `App.tsx` | Blank Soft session vs builder with template picker |
| `createBlankSession` | `session.ts` | Soft Samling 3+3; empty hall placements; default preset |
| `cloneTemplate` | `session.ts` | Copies mall blocks; **clears** hall placements; default preset |
| `seedTemplates.ts` | two malls | `tmpl-beginner-60`, `tmpl-short-45` (Slice 28 Soft pair on beginner) |
| `hallPresets.ts` | three presets | Zones: open, trampett, tumbling, vault, mattberg, mats |
| `upsertPlacement` / `snapPlacement` | `hall.ts` | Place Teknik; snap to zone slots |
| `isPlaceableItem` | `hall.ts` | Teknik-only (standing lock) |
| Seed tags | `seedActivities.ts` | `vault`, `trampett`, `floor` on Teknik |
| Footer | `UI.footerSliceLabel` | Slice 28 → Slice 29 when shipped |

## In scope

1. Home 3-question wizard UX (Swedish) + primary CTA treatment per A.
2. Curated compose: answers → complete five-block session (seed activityIds only).
3. On finish: set `hallTemplateId` from Q3; pre-place each Teknik item into a zone via tag map + `snapPlacement`/`upsertPlacement` (or equivalent pure helper).
4. Escape paths per E (Soft blank + old malls).
5. Thin Docs / content for wizard copy + zone map + path table.
6. Footer → Slice 29 when shipped.
7. Verification covering locked A–F + budgets + Teknik-only + preserve 22–28.

## Out of scope

- Full age × focus combinatorial CoachVault matrix (defer — F)
- Auto **Använd alla förslag** redskap fill on wizard finish (nice-later; saknar banner still soft-helps)
- Changing Soft blank inject semantics (Slice 27 stays on blank path)
- Making Samling/warmup/styrka/lek placeable
- CAD / cloud / accounts / sync / Pages unless asked
- Migrating existing drafts
- Rewriting Slice 28 mall gathering again
- Fixing short-mall warmup 11/10 **unless** a curated path reuses that composition (prefer not to)

## Code discovery (changes recommendations)

1. **New compose entry** — do **not** overload `createBlankSession`. Prefer `composeWizardSession(answers)` (or clone-from-curated-path + `applyWizardPlacements`) so Soft blank stays pristine.
2. **`cloneTemplate` clears placements** — wizard finish must **set** placements after compose; either skip `clearHallPlacements` on wizard path or place after clone.
3. **Tag → zone map** (D1 locked) — reuse seed tags:
   - `vault` → `vault` (Satsbräda)
   - `trampett` → `trampett` (mattberg-volt still primary trampett; second chip offsets)
   - `floor` → `tumbling` if flickis/rondat-ish else `open` (or `mats` for landings) — document in decisions/content
4. **Budgets** — gathering Soft 6; warmup ≤10; techniques ≤20; strength ≤15; fun ≤10. Avoid short-mall warmup 6+5=11 pattern.
5. **Age filter** — MVP: all paths use `new-coach-ok` only; Q1 “Träning” may pick slightly fuller Teknik sets still from new-coach pool (defer experienced-only).
6. **Home chrome** — quiet Slice 22: wizard steps should feel light (progress 1/3–3/3), not a heavy modal stack.

## Pipeline note

With **APPROVED 2026-09-27** lock:

1. Christoffer locks A–F (Approve pack).  
2. **Docs** → Swedish wizard copy + living note.  
3. **Builder** → after Docs; Home + compose + placements; footer 29; self-smoke.  
4. **Planner** pings **Verifier**.  
5. **Verifier** → this checklist + `verify-traningsplaneraren/`.

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**L** — Home wizard UX + curated pass generation + hall pre-placement; one Docs → Builder → Verifier loop from approval. MVP curated paths keep build cost below full matrix.
