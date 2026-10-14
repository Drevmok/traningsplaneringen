# Slice 40 — Sprid ut Teknik-markörer i öppna hallar (SHIPPED, local only)

Worktree `/workspace/gp-s40`, branch `slice-40-code` off `origin/slice-40-docs` (0bb1dd4, main 45cce9b). Not pushed, no upstream, not merged. No SQL.

## Change
- `lib/hall.ts`: fixed open grid for halls with only Öppen yta (Blå, Vit): `openGridCells(bbox)`, `markerOverlap`, `pickOpenCell`, constants below. `pointInZone`, `offsetFromSlot`, `snapPlacement`, `applyPreset` unchanged.
- `lib/hallSuggest.ts:autoPlaceItems`: after the existing per-zone loop, in a hall with no snap zone each new marker (pass order) takes `pickOpenCell(cells, taken)`; `taken` = placed Teknik markers (dragged ones included) plus the ones placed earlier in the same call; `zoneId 'open'`. Placed markers never move. Halls with snap zones skip the branch (byte-identical to main).
- `data/blockMeta.ts`: `SLICE_NUMBER = '40'`; asserts bumped in `feedback.test.ts` 25/45/46, `clubTemplates.test.ts:316`.
- Tests: `lib/hallGrid.test.ts` (18 tests) + test-only fixture `lib/hallGoldenFixture.ts`.

Surfaces that get the grid (all via `autoPlaceItems`): wizard, HallBoard empty-hall auto-place, add station from the bank, built-in mall / Mina mallar / föreningsmall apply. Golvklart, Förrådslista, Kör passet, print read placements only.

## Algorithm (Planner ruling on Verifier F1, 2026-10-14; supersedes HANDOFF §2/§3 count-based values)
- **Cell size, stable per hall, from the marker:** marker 52 px on a ~358 × 239 px phone canvas = **0.145 × 0.218** of the hall (HANDOFF's figure; the real Blå/Vit canvases are taller, 264/374 px, so on screen there is extra air). Cell step **0.16 × 0.22** (marker + small gap). Margins **0.08 / 0.11** (> half a marker, as HANDOFF).
- **Cells:** inner box = bbox minus margins; `cols = floor(iw / 0.16) + 1`, `rows = floor(ih / 0.22) + 1`; block centered; row-major; 4-decimal rounding + clamp01.
- **Pick:** first cell (row order) whose marker box overlaps no taken marker (overlap = both |dx| < 0.145 and |dy| < 0.218). If every cell overlaps something: the cell with the least total overlap area, ties → row order.
- **Capacity (free cells): Blå 12** (4 × 3: x 0.21/0.37/0.53/0.69, y 0.28/0.50/0.72), **Vit 9** (3 × 3: x 0.135/0.295/0.455, y 0.19/0.41/0.63). Beyond capacity (no drags) the fallback wraps: marker 13 in Blå / 10 in Vit lands on cell 1, etc. (full overlap with that marker).
- New worked values: n = 1 → first cell (Blå 0.21/0.28, Vit 0.135/0.19), no longer the centre. Blå n = 5 → 4 + 1 on row 1–2 (y 0.28, 0.50). Vit n = 4 → 3 + 1 (y 0.19, 0.41). AC11 case (3 placed, one dragged) → new one on the first free cell, not «slot 3 of 4». Batch place of N = the 1-by-1 result.

## Golden test (B1)
Snapshot taken on unchanged main code before any change: `verifier/slice-40-golden-main-45cce9b.json` (11-station fixture). The test also reads that file and asserts the three standard halls equal it.
- `standard-trupp`, `tavling-linjer`, `liten-hall`: **identical** to main.
- `forening-bla`: **changed** → cells 1–11 (4/4/3), no overlap. `forening-vit`: **changed** → cells 1–9, then markers 10–11 fall back to cells 1–2 (fixture exceeds Vit's capacity of 9).

## Decisions
- Grid applies when `!preset.zones.some((z) => z.snaps)` (Blå, Vit only).
- Cell size uses HANDOFF's conservative 239 px canvas height for both halls (no per-hall canvas size exists in the presets); this keeps «no overlap» true on any phone canvas that is at least that tall.
- Only placements of current Teknik items count as taken.
- Open items: desktop airier (fine); markers may sit on drawn mats in Blå (accepted); standard halls' Öppen yta near-stack unchanged (B1).

## Bundle (gzip -9, dist/assets JS+CSS; main 45cce9b → branch)
Total 217 831 → 218 201 (**+370 B**) · coach-facing eager 153 946 → 154 314 (+368 B). Within +512 B (first version +244 B; the fixed-cell picker adds ~126 B).

## Verification
bun test src 207/0 (25 files) · bun test tools/bank 21 pass/5 skip/0 fail · tsc OK · lint 0 errors · npm run build OK.
Smoke `verifier/slice-40-builder-smoke.mjs` (main :4210 «before», branch :4211 «after», 390×844): **20/20 PASS**, incl. F1 one-by-one: 12 stations added from the bank in Blå and 9 in Vit → 0 overlapping markers (stored and on screen). Screenshots /workspace/screenshots/slice40_01…14 (Blå/Vit before/after, Vit 12, add station, saved stack, Liten hall, one-by-one after 5 and at capacity).

## Deviations
- Tests live in a new `lib/hallGrid.test.ts` (+ fixture file) instead of `lib/hallSuggest.test.ts`; existing hallSuggest tests unchanged and green.
- AC1/AC2: the wizard (7–9, Trampett) yields 3 Teknik stations, not ≥ 4; the ≥ 4 case is covered by seeded drafts (AC3/AC4/AC6/AC8, Hallöversikt empty-hall path).
- AC12: Mina mallar driven; built-in mall applies with the default hall (Standard trupp, Slice 37 E1) so it never hits Blå; föreningsmall not driven (needs the bank stand-in) but goes through the same `autoPlaceUnplaced` call.
- AC7 «overlap only vertical» no longer holds beyond capacity: the ruling's least-overlap fallback lands extra markers on a cell (Vit > 9, Blå > 12). Smoke AC7 checks inside / no hang / no overlap up to capacity instead.
- HANDOFF §2 worked values and AC3/AC4/AC11 numbers are superseded by the ruling (values above).
- AC14: Hallöversikt buttons compared with main (same 15); drag / Placera här not re-driven (code unchanged).
