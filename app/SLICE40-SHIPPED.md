# Slice 40 — Sprid ut Teknik-markörer i öppna hallar (SHIPPED, local only)

Worktree `/workspace/gp-s40`, branch `slice-40-code` off `origin/slice-40-docs` (0bb1dd4, main 45cce9b). Not pushed, no upstream, not merged. No SQL.

## Change (scope as HANDOFF)
- `lib/hall.ts`: new pure `gridPointInOpen(bbox, index, total)` with `GRID_MARGIN_X 0.08`, `GRID_MARGIN_Y 0.11`, `GRID_STEP_X 0.16`, `GRID_STEP_Y 0.24` (HANDOFF §2 steps 1–6, 4-decimal rounding + clamp01). `pointInZone`, `offsetFromSlot`, `snapPlacement`, `applyPreset` unchanged.
- `lib/hallSuggest.ts:autoPlaceItems`: after the existing per-zone loop, if the hall has no snap zone (Blå, Vit) the new markers are re-laid in the grid over Öppen yta: `existing` = placed Teknik markers, `total = existing + additions`, item k → slot `existing + k`, `zoneId 'open'`. Existing placements never move. Halls with snap zones skip the branch entirely (byte-identical).
- `data/blockMeta.ts`: `SLICE_NUMBER = '40'`. Asserts bumped in `feedback.test.ts` 25/45/46 and `clubTemplates.test.ts:316`.
- Tests: `lib/hallGrid.test.ts` (new, 17 tests) + fixture `lib/hallGoldenFixture.ts` (test-only, not in the bundle).

Surfaces that now get the grid (all via `autoPlaceItems`): wizard result, HallBoard empty-hall auto-place, add station from the bank, built-in mall / Mina mallar / föreningsmall apply. Golvklart, Förrådslista, Kör passet and print only read placements and show the spread.

## Golden test (B1)
Snapshot taken on unchanged main code (45cce9b + docs only) **before** any code change: `verifier/slice-40-golden-main-45cce9b.json`. Fixture: 11 Teknik stations, one per suggested zone (vault, trampett, tumbling, mattberg, mats) + 4 open + 2 more vault, zones forced via saved redskap.
- `standard-trupp`, `tavling-linjer`, `liten-hall`: **identical** to the main snapshot (literal arrays in the test, including float noise such as 0.8400000000000001).
- `forening-bla`, `forening-vit`: **changed**, from 6 markers on one point (Blå 0.2784/0.3152, Vit 0.1872/0.2648) plus near-stacks to the grid. Blå 11 = 4/4/3 at x 0.21…0.69, y 0.26/0.50/0.74. Vit 11 = 3 per row × 4 rows, y 0.19/0.3367/0.4833/0.63 (stepY compressed to 0.1467, overlap vertical only).
- Worked values reproduced exactly: Blå n=5, Vit n=4, n=1 in both.

## Decisions
- Grid applies when `!preset.zones.some((z) => z.snaps)` (Blå, Vit only); computed after the existing loop so the standard path is literally the same code.
- «Existing» counts only placements of current Teknik items (stale placements of non-Teknik items are ignored), per HANDOFF «after the Teknik filter».
- Open items: (1) desktop looks airier, fine; (2) markers may sit on drawn mats in Blå, accepted; (3) Öppen yta near-stack in standard halls left as is (B1).

## Bundle (gzip -9, dist/assets JS+CSS; main 45cce9b → branch)
Total 217 831 → 218 075 (**+244 B**) · coach-facing eager 153 946 → 154 183 (+237 B). Within +512 B (estimate was +150–300).

## Verification
bun test src 206/0 (25 files) · bun test tools/bank 21 pass/5 skip/0 fail · tsc OK · lint 0 errors · npm run build OK.
Smoke `verifier/slice-40-builder-smoke.mjs` (main :4210 «before», branch :4211 «after», 390×844): **18/18 PASS**. Screenshots /workspace/screenshots/slice40_01…12 (Blå and Vit before/after for the wizard and for seeded 5/4-station passes, Vit 12, add station, saved stack, Liten hall).

## Deviations
- Tests live in a new `lib/hallGrid.test.ts` (+ fixture file) instead of `lib/hallSuggest.test.ts`; existing hallSuggest tests unchanged and green.
- AC1/AC2: the wizard (7–9, Trampett) yields 3 Teknik stations, not ≥ 4; the ≥ 4 case is covered by seeded drafts (AC3/AC4/AC6/AC8, Hallöversikt empty-hall path).
- AC12: Mina mallar driven; built-in mall applies with the default hall (Standard trupp, Slice 37 E1) so it never hits Blå; föreningsmall not driven (needs the bank stand-in) but goes through the same `autoPlaceUnplaced` call.
- AC14: Hallöversikt buttons compared with main (same 15); drag / Placera här not re-driven (code unchanged).
