# Slice 27 — Soft Samling (default upprop + kort genomgång)

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — A2/B1/C1/D2/E1/F1 locked  
**Date drafted:** 2026-09-26  
**Status:** **APPROVED 2026-09-26** — Docs starting → Builder after Docs → Verifier after Planner ping.

**Product lock (Christoffer 2026-09-26):** Soft Samling — every **new** blank pass starts with fixed activities: **upprop** (Närvaro) + **kort genomgång** of what the pass will do. Samling stays **fully editable** (add/remove/reorder/change duration). Not the hard path (no remove of planning UI).

Christoffer’s words: skip planning Samling in practice — it’s static across clubs: upprop + short rundown of the session.

**Leaves out of this pack:** Hard-lock Samling UI; hall placeable changes; removing other Samling seeds from the library; Pages republish unless asked.

## Goal

1. **Soft default on blank “Nytt pass”** — Samling prefilled with Närvaro (`gather-narvaro`) + a pass-rundown genomgång activity (see A).
2. **Still fully editable** — coach can add/remove/reorder/change duration; clearing Samling returns to today’s empty tip (no re-inject mid-edit).
3. **Templates keep authored Samling** — soft inject does not rewrite mall gathering (see B / code discovery).
4. **No hard lock** — planning UI for Samling stays; no hall change; preserve Slices 22–26.

**Coach outcome:** “När jag öppnar Nytt pass finns redan upprop och en kort genomgång av passet i Samling — jag kan ändra dem, men jag behöver inte planera samma start varje gång.”

## Locked A–F — approved 2026-09-26

| # | Rec | Meaning |
|---|---|---|
| **A** | **A2** | Närvaro + thin Docs retitle/summary of `gather-dagens-teknik` → pass-rundown (same ID; no parallel seed) |
| **B** | **B1** | Inject on blank **Nytt pass** only; templates keep their authored gathering |
| **C** | **C1** | Existing drafts / already-empty Samling on open — **leave alone** (soft = new only) |
| **D** | **D2** | Raise `BLOCK_BUDGETS.gathering` **5 → 6** so soft 3+3 fits without “Över budget” on every blank |
| **E** | **E1** | Living `docs/soft-samling.sv.md` + empty tip tweak + seed title/summary if A2 |
| **F** | **F1** | No hard-lock UI; no hall change; keep other seeds in library; no Pages unless asked; preserve 22–26; footer Slice 27 |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only — **Samling never on hall**
- Soft chrome / Slice 22 quiet patterns where relevant
- Device-local drafts; **no** accounts / cloud / sync
- **NO** CAD / equipment pins
- Footer `Träningsplaneraren · Slice 27` when Builder ships (locked F / E companion)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **22–26** behavior except Soft Samling inject + optional budget/copy

## Problem baseline

| Pain | Baseline today |
|---|---|
| Blank Samling empty | `createBlankSession` → `createEmptyBlocks()` → `items: []` for every block including gathering |
| Coach re-plans static start | Upprop + short pass rundown is the same across clubs (Christoffer 2026-09-26) |
| Technique-framed genomgång | Seed `gather-dagens-teknik` title/summary say **dagens teknik**, not whole-pass rundown |
| Budget 5 vs soft 3+3 | `BLOCK_BUDGETS.gathering = 5`; soft pair = 6 → over budget unless D changes |
| Over-budget already soft-allowed | `BlockCard` shows `Över budget` when filled > budget; **no hard block**. Templates already ship over (beginner Samling 5+3=8) |
| Templates already fill Samling | `tmpl-beginner-60`: Välkomstcheck-in + Dagens teknik; `tmpl-short-45`: Välkomstcheck-in only — **neither uses Närvaro** |

## Current baseline (do not invent parallel without reason)

| Symbol | Location | Role |
|---|---|---|
| `gather-narvaro` | `seedActivities.ts` | **Närvaro** 3 min — matches upprop |
| `gather-dagens-teknik` | `seedActivities.ts` | **Dagens teknik — snabb genomgång** 3 min — close but technique-framed |
| `gather-valkomstcheck-in` | `seedActivities.ts` | **Välkomstcheck-in** 5 min — **not** in soft default pair |
| `createBlankSession` / `createEmptyBlocks` | `app/src/lib/session.ts` | Blank “Nytt pass” — empty items |
| `cloneTemplate` | `session.ts` + `seedTemplates.ts` | Template-started pass — authored gathering |
| `Home` `onNew` | `Home.tsx` / `App.tsx` | “Nytt pass” → blank session |
| `EMPTY_TIPS.gathering` | `blockMeta.ts` | Empty tip when Samling cleared |
| `addActivities` heuristic | `coachTips.ts` | `itemCount >= 1` → soft prefill **will** auto-check this step |
| `BLOCK_BUDGETS.gathering` | `blockMeta.ts` | 5 today |
| Footer | `UI.footerSliceLabel` | Currently Slice 26 → Slice 27 when shipped |

## In scope

1. Soft-prefill Samling on blank new pass with locked soft pair (A/B).
2. Keep Samling fully editable; empty tip when cleared (no mid-edit re-inject).
3. Budget decision D (locked at 6).
4. Thin Docs: living soft-samling + optional seed retitle/summary + empty tip (E).
5. Footer → Slice 27 when shipped.
6. Verification checklist covering locked A–F + build green.

## Out of scope

- Hard-lock Samling (cannot remove / no planning UI)
- Changing hall placeable set (Samling stays off hall)
- Removing Välkomstcheck-in or other seeds from the library
- Rewriting template Samling contents (unless Christoffer later asks a separate pack)
- Migrating existing empty drafts (unless C locked otherwise)
- CAD / cloud / accounts / Pages republish unless asked
- Absorbing unrelated Hall/Kom igång work from 22–26

## Code discovery (changes recommendations)

1. **Templates already include gathering items** — soft inject on template apply is usually a no-op if gated on empty; beginner/short malls do **not** match the soft pair (they use Välkomstcheck-in ± teknik). Locked **B1 = blank only** so Soft Samling does not fight mall authorship.
2. **Over-budget is already allowed** — UI tag only. Soft 3+3=6 would work under D3, but every blank would show “Över budget”; **D2 raise to 6** avoids that chrome on the intended default.
3. **Kom igång `addActivities`** — soft-prefill items count toward `itemCount >= 1`, so step 2 auto-completes on blank Nytt pass. Document as intentional soft behavior (do not special-case exclude Samling defaults).

## Pipeline note

Now that Christoffer has **APPROVED** A–F:

1. **Docs** → living soft-samling + seed/empty-tip copy per locked A/E  
2. **Builder** → only after Docs; implement soft inject + budget; footer Slice 27; self-smoke via `verify-traningsplaneraren/`  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` + project skill `verify-traningsplaneraren/`

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** — soft prefill helper + optional budget bump + thin Docs; one Docs → Builder → Verifier loop from approval.
