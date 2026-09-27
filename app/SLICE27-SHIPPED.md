# Slice 27 — Soft Samling — SHIPPED

**Date:** 2026-09-26 (Europe/Stockholm)  
**Locks:** A2 / B1 / C1 / D2 / E1 / F1  
**Builder self-smoke:** `verifier/slice-27-builder-smoke.md` — **PASS** (17/0)  
**Screenshots:** `/workspace/screenshots/slice27_*.png`

## What shipped

Soft Samling on blank **Nytt pass** only:

1. **A2** — Retitled seed `gather-dagens-teknik` → **Dagens pass — snabb genomgång** (same id; pass-rundown summary/howTo/watchFor). `gather-narvaro` unchanged.
2. **B1** — Soft-prefill in `createBlankSession` only: Närvaro (3) + Dagens pass (3). `createEmptyBlocks()` stays empty; `cloneTemplate` / `loadDraft` untouched.
3. **C1** — No migrate on open; cleared Samling stays empty (no mid-edit re-inject).
4. **D2** — `BLOCK_BUDGETS.gathering` **5 → 6** (soft default 6/6, no Över budget).
5. **E1** — `EMPTY_TIPS.gathering.tip` Docs string; `addLabel` unchanged; `TIPS_TAB.gathering` unchanged.
6. **F1** — Footer `Träningsplaneraren · Slice 27`; no hard-lock; no hall change; Välkomstcheck-in stays in library; preserve 22–26.

## Changed files

| File | Change |
| --- | --- |
| `app/src/data/seedActivities.ts` | A2 retitle/summary/howTo/watchFor for `gather-dagens-teknik` |
| `app/src/lib/session.ts` | B1 soft inject in `createBlankSession` + `withComputedTotal` |
| `app/src/data/blockMeta.ts` | D2 budget 6; E1 empty tip; F1 footer Slice 27 |

## Build

`cd app && npm run build` — **green** (tsc -b && vite build).

## Self-smoke (required cases)

| # | Case | Result |
| --- | --- | --- |
| 1 | Nytt pass → Närvaro then Dagens pass; 3+3; budget 6/6 no Över budget | PASS |
| 2 | Remove both → Docs empty tip; no auto-refill | PASS |
| 3 | Add Välkomstcheck-in from library | PASS |
| 4 | Starta från mall beginner/short → mall Samling (not soft overwrite) | PASS |
| 5 | Soft items not placeable (no-stations empty when Teknik-less) | PASS |
| 6 | Footer Slice 27; caption locked (with Teknik); build green | PASS |
| 7 | Spot: Slice 25 saknar + Slice 26 place-step still present | PASS |
| — | C1 empty draft Fortsätt → stays empty | PASS |

## Deviations

**None** vs locked A2/B1/C1/D2/E1/F1.

Notes (expected, not deviations):

- Template beginner Samling still **8 / 6 · Över budget** (Välkomst 5 + Dagens pass 3) — mall authorship under B1; over-budget remains soft-allowed.
- Soft blank with only Samling opens Hall **Inga Teknik-stationer ännu** (Teknik-only placeable); caption lives on HallCanvas and was verified on the saknar spot with Teknik present.
- Kom igång `addActivities` auto-checks from soft items — intentional per pack.
- Templates that reference `gather-dagens-teknik` by id show the new pass-rundown title — expected under A2 same-id retitle; template item lists not rewritten.

## Gaps (honest)

- Desktop viewport not separately driven (phone 390×844 only).
- Slice 22 quiet / 23 Home polish / 24 Förråd path not fully re-walked (saknar + place-step spot only).
- Rapid multi-remove in one tick can leave one item (React stale session closure) — pre-existing; sequential remove works; Soft does not re-inject.

## Out of scope (honored)

Hard-lock UI · hall placeable change · removing library seeds · template Samling rewrite · draft migrate · Pages/Netlify republish · messaging Verifier/user.

## Handoff

Planner may ping Verifier. Formal verify authority: `slice-27/verification-checklist.md` + `verify-traningsplaneraren/`.
