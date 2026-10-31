# Slice 55 — Passlängd även på Starta från mall

Base: main 5e57fd0 · branch: slice-55-passlangd-mall. SLICE_NUMBER '55'. Christoffer locked A1 B1 C1 D1 E1 F1. No new strings (UI.passLength / passLengthMinutes reused).

## What shipped
- **A1/B1:** the guide's mall path is Hall → Mall → Passlängd (`WIZARD_STEPS.mall = ['hall','mall','length']`). No length button is preselected. Tillbaka from Passlängd goes back to Mall.
- **C1:** `scaleToLength(session, length)` in `lib/mallApply.ts` scales the mall's minutes to 60/90/120 with largest-remainder `splitMinutes`. Each exercise keeps ≥1 min, and the input is not mutated. Works for built-in, Mina and Föreningens mallar.
- **D1:** «Använd mall» in the Mallar tab is unchanged and keeps the mall's own times (`applyMall` without length).
- **E1/F1:** App passes `plan.targetMinutes`. Docs, feature notes and the slice pack are updated.

## Verification
- `bun test src` 274 pass / 0 fail. Build green; lint exit 0 (warnings only, same as main).
- Bundle: total gzip 215560 B vs main 215395 B = **+165 B** (index +149 B); budget +512 B.
- Doctor PASS. `verifier/slice-55-builder-smoke.mjs` 25/25 PASS at 390×844 and 844×390.
- AC1–AC6 and AC8–AC15 PASS. AC7 (Föreningens mall) is covered by unit tests; not driven in a browser. AC10: Mallar tab keeps 53 min. AC4 example: 3,3,10,6,6,6,5,8,6 → 3,3,11,7,7,7,6,9,7 at 60.

## Smoke adaptations (intentional app change, Slice 54 style)
- `tools/smoke-start.mjs`: new `pickLength(p, minutes=60)` taps «60 min» after a guide mall card. It is a no-op when there is no length step. `startMall` uses it.
- s36, s37, s39, s40, s42, s45, s46, s47, s49: these call `pickLength` after guide mall-card taps. Mallar-sheet «Använd mall» clicks are untouched (D1). s46 AC15 / s47 AC6 now read «Fråga n av 3». The s49 footer label is now Slice 55.
- After the fixes, all nine are SAMMA vs the main baseline (s36 46, s37 24, s39 38, s40 20, s42 24, s45 41, s46 37, s47 32, s49 34 PASS). Netlog: 0 requests to the live host.
- Note: s45 «Dela-toast» timed out once under machine load (a 319 s run); the rerun was 41/41.

## Open
None known.
