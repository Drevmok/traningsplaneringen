# Slice 28 — Mall Samling within budget — SHIPPED

**Date:** 2026-09-27 (Europe/Stockholm)  
**Locks:** A1 / B1 / C1 / D1 / E1 / F1  
**Builder self-smoke:** `verifier/slice-28-builder-smoke.md` — **PASS** (15/0)  
**Screenshots:** `/workspace/screenshots/slice28_*.png`

## What shipped

Mall Samling within budget for beginner template — Soft pair parity with Slice 27 blank:

1. **A1** — `tmpl-beginner-60` gathering → Soft pair: `gather-narvaro` (3) + `gather-dagens-teknik` (3) = 6; drop Välkomstcheck-in from mall default. Other beginner blocks unchanged.
2. **B1** — `tmpl-short-45` gathering left alone (Välkomstcheck-in 5 ≤ 6).
3. **C1** — `BLOCK_BUDGETS.gathering` stays **6**; no `session.ts` / `cloneTemplate` change.
4. **D1** — No seed retitle; titles flow via activityId (Slice 27 already retitled Dagens pass).
5. **E1** — Living docs already present (`docs/mall-samling-budget.sv.md`) — Docs pack, not Builder invent.
6. **F1** — Footer `Träningsplaneraren · Slice 28`; no Home wizard / hall pre-place / Pages; preserve 22–27; Välkomstcheck-in stays in library.

## Changed files

| File | Change |
| --- | --- |
| `app/src/data/seedTemplates.ts` | A1 beginner gathering Soft pair |
| `app/src/data/blockMeta.ts` | F1 footer Slice 28 |

## Build

`cd app && npm run build` — **green** (tsc -b && vite build).

## Self-smoke (required cases)

| # | Case | Result |
| --- | --- | --- |
| 1 | Starta från mall → Nybörjare → Använd mall → Samling Närvaro + Dagens pass 3+3; 6/6 no Över budget | PASS |
| 2 | Dagens pass title = Slice 27 seed (D1) | PASS |
| 3 | Kort pass → Välkomstcheck-in 5 / 6 no Över budget (B1) | PASS |
| 4 | Nytt pass Soft blank still 6/6 Soft pair (Slice 27) | PASS |
| 5 | Footer Slice 28 | PASS |
| 6 | Välkomstcheck-in still in library | PASS |
| 7 | Hall caption Schematisk hall — inte exakt mått; Samling not placeable | PASS |
| 8 | No Home wizard; beginner still five blocks | PASS |

## Deviations

**None** vs locked A1/B1/C1/D1/E1/F1.

Notes (expected, not deviations):

- Short mall Samling **5 / 6** intentional under B1.
- Soft blank inject and gathering budget 6 untouched (C1 / preserve 27).
- `gather-valkomstcheck-in` remains in seed library + short mall default.

## Gaps (honest)

- Desktop viewport not separately driven (phone 390×844 only).
- Slice 22 quiet / 23 Home / 24 Förråd / 25 saknar / 26 place-step not fully re-walked (hall caption + placeable spot only).
- Library check is UI presence after Lägg till (not full re-add-to-mall flow).

## Out of scope (honored)

Home wizard · hall pre-place · Pages/Netlify · Soft blank inject · seed retitle · draft migrate · lowering `BLOCK_BUDGETS.gathering` · messaging Verifier/user.

## Handoff

Planner may ping Verifier. Formal verify authority: `slice-28/verification-checklist.md` + `verify-traningsplaneraren/`.
