# Slice 27 — handoff

**Status:** **SHIPPED 2026-09-26** — Verifier **PASS** (evening); report [`verifier/slice-27-verify-report.md`](../verifier/slice-27-verify-report.md). Pack: `slice-27/`. A2/B1/C1/D2/E1/F1 locked. Preserve Slice 22–26; no republish unless Christoffer asks.

Backlog: Soft Samling → **Slice 27 Shipped** (Verifier PASS 2026-09-26 evening). Phone/Pages still Slice 26 until Christoffer asks republish; repo already carries footer Slice 27.

## Execution order

Completed execution: Docs → Builder → Verifier. The Verifier PASS is recorded in [`verifier/slice-27-verify-report.md`](../verifier/slice-27-verify-report.md), with the pack at `slice-27/`.

## Locked answers — approved 2026-09-26

| # | Lock | Meaning |
|---|---|---|
| A | **A2** | Närvaro (`gather-narvaro`) + Docs retitle/summary of `gather-dagens-teknik` → pass-rundown (same ID) |
| B | **B1** | Inject on blank **Nytt pass** only; templates keep authored gathering |
| C | **C1** | Existing drafts / empty Samling on open — leave alone (soft = new only) |
| D | **D2** | Raise gathering budget **5 → 6** so soft 3+3 fits cleanly |
| E | **E1** | Living `docs/soft-samling.sv.md` + empty tip tweak + seed copy if A2 |
| F | **F1** | No hard-lock; no hall change; keep other seeds; no Pages unless asked; preserve 22–26; footer Slice 27 |

## Paths

| Path | Role |
|---|---|
| `slice-27/` | This pack |
| `slice-27/content/` | Docs reference pack; living Swedish doc is `docs/soft-samling.sv.md` |
| `app/src/lib/session.ts` | `createBlankSession`, `createEmptyBlocks`, `createSessionItem`, `cloneTemplate` |
| `app/src/data/seedActivities.ts` | `gather-narvaro`, `gather-dagens-teknik`, `gather-valkomstcheck-in` |
| `app/src/data/seedTemplates.ts` | Template gathering already authored (discovery) |
| `app/src/data/blockMeta.ts` | `BLOCK_BUDGETS.gathering`, `EMPTY_TIPS.gathering`, footer |
| `app/src/components/Home.tsx` | “Nytt pass” flow |
| `app/src/components/LibraryPanel.tsx` / `SessionBuilder.tsx` | Template apply / confirm |
| `app/src/lib/coachTips.ts` | `addActivities` via `itemCount >= 1` (soft prefill counts) |
| `app/src/components/BlockCard.tsx` | Soft “Över budget” display (no hard block) |
| `docs/soft-samling.sv.md` | Living Swedish Docs deliverable |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | Soft Samling → Slice 27 Shipped |

## Not this pack

- Hard-lock Samling (cannot remove activities / hide planning UI).  
- Putting Samling on hall / changing Teknik-only placeable set.  
- Removing Välkomstcheck-in or other seeds from the library.  
- Rewriting template Samling to match soft pair (separate decision later if wanted).  
- Migrating existing empty drafts unless C locked otherwise.  
- Netlify / Pages republish unless Christoffer asks.  
- CAD / cloud / accounts / sync.  
- Absorbing Hall saknar / Kom igång / Förråd work from Slices 22–26.  
- Self-pinging agents — execution was coordinated by **Planner**: Docs → Builder → Verifier.
