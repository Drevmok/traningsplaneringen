# Slice 28 — Mall Samling within budget

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-27** — A1/B1/C1/D1/E1/F1 locked  
**Date approved:** 2026-09-27  
**Status:** **APPROVED 2026-09-27** — Docs may start; Builder → Verifier follow the Docs handoff.

**Product lock (Christoffer 2026-09-27 via Planner / external review):** Templates that claim a **trygg start** / short pass must **not** open Passbyggaren with Samling already showing red **Över budget**. After Slice 27, `BLOCK_BUDGETS.gathering = 6`. Soft blank pass fits (Närvaro 3 + Dagens pass 3 = 6). Beginner mall still ships **8** (Välkomstcheck-in 5 + Dagens teknik/pass 3).

**Leaves out of this pack:** Home 3-question wizard (Approved separately, queued after Slice 28); hall pre-place; Pages republish unless asked.

## Goal

1. **Beginner mall Samling within budget** — item sum ≤ 6 so first open of **Nybörjare — ca 55 min** does not show Över budget on Samling.
2. **Prefer Soft Samling consistency** — locked A1 aligns beginner gathering with blank Soft pair (Närvaro + Dagens pass), not a parallel “mall-only” story.
3. **Short mall decision** — B1 leaves the current Välkomstcheck-in 5 only (under budget) unchanged.
4. **No Home wizard / hall pre-place** — larger Approved item stays backlog-only until Planner says.

**Coach outcome:** “När jag startar från Nybörjare-mallen ser Samling ut som en trygg start — inte redan röd Över budget.”

## Locked A–F (APPROVED 2026-09-27)

| # | Lock | Meaning |
|---|---|---|
| **A** | **A1** | Beginner mall Samling → Soft pair: Närvaro (3) + Dagens pass (3) = **6**; drop Välkomstcheck-in from mall default (seed stays in library) |
| **B** | **B1** | Short mall: **leave alone** (5 ≤ 6; no red) |
| **C** | **C1** | Keep `block.durationMinutes = BLOCK_BUDGETS[type]` (already via `cloneTemplate`); only **item sums** drive Över budget |
| **D** | **D1** | No extra title work — `gather-dagens-teknik` already retitled Slice 27; mall uses activityId → seed title flows |
| **E** | **E1** | Thin living note `docs/mall-samling-budget.sv.md` (+ optional one-line Soft Samling cross-link); no broad template rewrite |
| **F** | **F1** | No Home wizard; no hall pre-place; no Pages unless asked; preserve 22–27; footer Slice 28 |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only — **Samling never on hall**
- Soft chrome / Slice 22 quiet patterns
- Device-local drafts; **no** accounts / cloud / sync
- **NO** CAD / equipment pins
- Footer `Träningsplaneraren · Slice 28` when Builder ships
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **22–27** (incl. Soft Samling blank inject + gathering budget 6) except mall gathering composition (+ thin Docs)

## Problem baseline

| Pain | Baseline today (post Slice 27) |
|---|---|
| Beginner mall over budget | `tmpl-beginner-60` gathering: `gather-valkomstcheck-in` **5** + `gather-dagens-teknik` **3** = **8** > `BLOCK_BUDGETS.gathering` **6** → red **Över budget** on first open |
| Soft blank is clean | `createBlankSession`: Närvaro **3** + Dagens pass **3** = **6** / 6 — no overflow |
| Short mall under budget | `tmpl-short-45`: Välkomstcheck-in **5** only → 5 / 6 — **no** red (math OK) |
| “Trygg start” copy | Beginner description: *Trygg start för nya tränare…* — first impression fights red chrome |
| Slice 27 left malls alone | Soft inject **B1 = blank only**; F3 explicitly deferred template rewrite to a later pack — **this is that pack** |
| Block duration vs items | `seedTemplates.block()` and `cloneTemplate` set `durationMinutes: BLOCK_BUDGETS[type]`; `BlockCard` compares **filled item sum** vs that budget |

## Current baseline (do not invent parallel without reason)

| Symbol | Location | Role |
|---|---|---|
| `tmpl-beginner-60` | `seedTemplates.ts` | Nybörjare mall — gathering 5+3=8 today |
| `tmpl-short-45` | `seedTemplates.ts` | Kort pass — gathering 5 today |
| `cloneTemplate` | `session.ts` | Applies mall; rebinds block duration to `BLOCK_BUDGETS`; copies authored items |
| `createBlankSession` | `session.ts` | Soft Samling 3+3 (Slice 27) — **unchanged** this pack |
| `BLOCK_BUDGETS.gathering` | `blockMeta.ts` | **6** (Slice 27 D2) — **do not lower** without new lock |
| `gather-narvaro` / `gather-dagens-teknik` / `gather-valkomstcheck-in` | `seedActivities.ts` | Soft pair + välkomst seed (library) |
| `BlockCard` overflow | `BlockCard.tsx` | Soft tag `Över budget` when filled > budget; no hard block |
| Footer | `UI.footerSliceLabel` | Slice 27 → Slice 28 when shipped |

## In scope

1. Change beginner (and optionally short) mall **gathering item composition / durations** so item sum ≤ 6.
2. Prefer alignment with Soft Samling pair when locking A1.
3. Thin Docs per E (living note + Soft cross-link).
4. Footer → Slice 28 when shipped.
5. Verification checklist covering locked A–F + build green.

## Out of scope

- Home 3-question wizard / CoachVault flow (Approved backlog item — **after** Slice 28)
- Hall pre-placement of Teknik stations
- Changing `BLOCK_BUDGETS.gathering` again (unless Christoffer locks otherwise — not recommended)
- Hard-lock Samling; removing Välkomstcheck-in from the **library**
- Rewriting Soft blank inject (Slice 27 stays)
- Migrating existing drafts that already cloned old malls
- CAD / cloud / accounts / Pages republish unless asked
- Absorbing unrelated Hall/Kom igång work from 22–26

## Code discovery (changes recommendations)

1. **Only `seedTemplates.ts` gathering arrays need composition edits** for A1/B — `cloneTemplate` already copies items and sets budget from `BLOCK_BUDGETS`.
2. **Titles already flow from seeds** — beginner already references `gather-dagens-teknik`; Slice 27 retitle (“Dagens pass — snabb genomgång”) shows in Passbyggaren without template string edits (**supports D1**).
3. **Short mall is already ≤ budget** — 5 < 6; changing it is product consistency, not a red-chrome fix (**supports B1 leave alone** unless Christoffer wants Soft alignment everywhere).
4. **Välkomstcheck-in stays in library** — malls dropping it from defaults must not delete the seed (F / Soft Samling F1 continuity).
5. **Over-budget remains soft-allowed** — fixing malls removes the *default* red first impression; coaches can still overflow by editing.

## Pipeline note

Now that Christoffer **APPROVED** A–F:

1. **Docs may start** → living mall-samling-budget note (+ Soft cross-link) per E  
2. **Builder** → only after Docs; edit `seedTemplates.ts` gathering; footer Slice 28; self-smoke via `verify-traningsplaneraren/`  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` + project skill `verify-traningsplaneraren/`

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** — template gathering composition + thin Docs; one Docs → Builder → Verifier loop from approval.
