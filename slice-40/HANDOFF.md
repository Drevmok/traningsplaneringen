# Slice 40 — Builder handoff

**Status:** LOCKED 2026-10-14. Scope: `app/src/lib/hallSuggest.ts`, optionally `app/src/lib/hall.ts` (new pure helper), `SLICE_NUMBER` in `app/src/data/blockMeta.ts`, tests. No component, CSS or copy changes.

## What exists today (main @ 45cce9b)

- `lib/hallSuggest.ts:49` `suggestZoneId(item)`: saved redskap → `zoneFromSlots` (`PIECE_ZONE` order, `:6`) → drill default redskap → `zoneFromTags` (`:25`: tag `vault`/`trampett`, `floor` + flickis/rondat → tumbling, else open).
- `lib/hallSuggest.ts:67` `autoPlaceItems(session, itemIds)`: `counts` per zone from existing placements' stored `zoneId`; for each item in `placeableItems` order (Teknik only, `hall.ts:116`) → `index = counts[suggested]++` → `pointInZone(preset, suggested, index)`.
- `lib/hallSuggest.ts:93` `autoPlaceUnplaced(session)` = `autoPlaceItems` on all unplaced.
- `lib/hall.ts:267` `pointInZone`: missing zone → falls back to `'open'`. Snap zone → `offsetFromSlot(snap, index, bbox)`. Open → origin `bbox + 28 %`, then `offsetFromSlot` (`:255`, 3 per row, `OFFSET_X 0.035`, `OFFSET_Y 0.04`, `clampToZone` margin 0.02, `:239`).
- Templates: `data/hallPresets.ts`. `forening-bla` (Blå hall, `:54`) and `forening-vit` (Vit hall, `:90`) have **only** `open` (Blå bbox `0.06,0.08,0.78,0.84`; Vit `0.05,0.08,0.49,0.66`). `standard-trupp`, `tavling-linjer`, `liten-hall` have open + 5 snap zones.
- Callers: `lib/wizard.ts:108`; `components/HallBoard.tsx:165` (useEffect, only when `hallPlacements` is empty; then `saveDraft`); `components/SessionBuilder.tsx:243` (add station → `autoPlaceItems`), `:302` (built-in mall), `:316` (Mina mallar), `:328` (föreningsmall).
- Marker: `.hall-chip--canvas` 52×52 px (`App.css:1970`), centered on (x, y) via `.hall-chip-anchor` translate(-50%, -50%).

See README «Root cause» for the stacking.

## 1. When the grid applies (A1, B1)

`const openOnly = !preset.zones.some((z) => z.snaps)`; true for Blå and Vit only.

- `openOnly === false` → **current code path, untouched.** Positions byte-identical.
- `openOnly === true` → every item placed in this call goes into the grid in `placeableItems` order, whatever `suggestZoneId` says (it has nowhere else to go). Stored `zoneId: 'open'` (as today).

Keep `pointInZone` / `offsetFromSlot` / `snapPlacement` / `applyPreset` unchanged (drag, Placera här and hall switching are not part of this slice).

## 2. Grid algorithm (deterministic)

New pure helper, e.g. `gridPointInOpen(bbox, index, total)` in `lib/hall.ts` (exported for tests). All values are normalized hall units (0–1).

Constants:

| Name | Value | Why |
|---|---|---|
| `GRID_MARGIN_X` | 0.08 | > half a 52 px marker on a ~358 px wide phone canvas (0.073) |
| `GRID_MARGIN_Y` | 0.11 | > half a 52 px marker on a ~239 px tall 3:2 canvas (0.109) |
| `GRID_STEP_X` | 0.16 | marker 0.145 + small gap |
| `GRID_STEP_Y` | 0.24 | marker 0.218 + small gap |

Steps for a zone bbox `b`, `total` = n markers in the grid, `index` = 0…n−1:

1. Inner box: `ix = b.x + 0.08`, `iy = b.y + 0.11`, `iw = max(0, b.w − 0.16)`, `ih = max(0, b.h − 0.22)`.
2. `maxCols = floor(iw / 0.16 + 1e-9) + 1`; `cols = min(total, maxCols)`; `rows = ceil(total / cols)`.
3. `stepX = cols > 1 ? min(0.16, iw / (cols − 1)) : 0`; `stepY = rows > 1 ? min(0.24, ih / (rows − 1)) : 0`.
4. Center the block: `x0 = ix + (iw − stepX·(cols − 1)) / 2`, `y0 = iy + (ih − stepY·(rows − 1)) / 2`.
5. Row-major: `r = floor(index / cols)`, `c = index % cols`; `x = x0 + c·stepX`, `y = y0 + r·stepY`.
6. Round to 4 decimals (`Math.round(v * 1e4) / 1e4`), then `clamp01`.

Results: Blå `maxCols = 4`, Vit `maxCols = 3`. n = 1 → one marker in the middle of Öppen yta.

**Large n:** columns never exceed `maxCols`; rows grow and `stepY` shrinks so the last row still sits at `iy + ih` at most. Markers may then overlap vertically, but order is kept and every center stays inside the inner box (so the whole marker stays inside the hall). Blå with 8 markers = 4×2 without overlap; Vit with 6 = 3×2 without overlap; In Vit a 3rd row compresses `stepY` to 0.22 (0.44 / 2), just above the marker height; from 4 rows on markers overlap vertically. Never NaN, never outside 0–1.

**Worked values (Verifier):**

- Blå, n = 5: cols 4, rows 2. x = 0.21, 0.37, 0.53, 0.69; y = 0.38 (row 1), 0.62 (row 2). Index 4 → (0.21, 0.62).
- Vit, n = 4: cols 3, rows 2. x = 0.135, 0.295, 0.455; y = 0.29, 0.53. Index 3 → (0.135, 0.53).
- Blå, n = 1: (0.45, 0.50). Vit, n = 1: (0.295, 0.41).

## 3. Already placed markers (D1)

In `autoPlaceItems` for an open-only hall: `existing = (session.hallPlacements ?? []).length` (after the Teknik filter used today), `total = existing + additions`. New item k takes grid `index = existing + k` of `total`. Existing placements are **never** moved. Example: add one station to a Blå pass with 3 placed → it lands on grid slot 3 of 4 (row of 4: x 0.69, y 0.50). It can sit near a marker the coach dragged; accepted.

Saved passes are read as stored (`loadDraft` does not re-place). HallBoard only auto-places when the hall is empty (`HallBoard.tsx:163–164`), so an opened saved pass with placements is untouched.

## 4. Surfaces affected (say so in ship notes)

Wizard result, HallBoard empty-hall auto-place, add station from the bank, built-in mall / Mina mallar / föreningsmall apply. All go through `autoPlaceItems`. Golvklart, Förrådslista, Kör passet, print read placements only; they show the new spread.

## 5. Tests (B1 golden required)

`lib/hallSuggest.test.ts`:

- **Golden over all templates:** for each id in `HALL_PRESET_ORDER`, a fixed fixture pass (≥ 1 station per suggested zone + 3 open drills + 2 vault drills) → `autoPlaceUnplaced`. For `standard-trupp`, `tavling-linjer`, `liten-hall` the positions must equal a snapshot captured on **main @ 45cce9b before the change** (commit the snapshot as literal arrays). For `forening-bla` / `forening-vit` the snapshot is the new grid values.
- `gridPointInOpen`: worked values above; n = 1; n = 20 in Vit → all centers within inner box, `y` non-decreasing by index, no NaN.
- Order: index i placed before i+1 in row-major order (pass order kept).
- D1: Blå pass with 3 placed + 1 new → old 3 unchanged, new one at slot 3 of 4.
- Existing tests at `:63–86` still pass unchanged.

## 6. Footer

- `SLICE_NUMBER = '40'` (`data/blockMeta.ts:111`).
- **Test asserts to update** (confirmed on 45cce9b, they hard-code 39):
  - `app/src/lib/feedback.test.ts:25` `'Version: Slice 39'` → `'Version: Slice 40'`
  - `app/src/lib/feedback.test.ts:45` `SLICE_NUMBER, '39'` → `'40'`
  - `app/src/lib/feedback.test.ts:46` `'Träningsplaneraren · Slice 39'` → `Slice 40`
  - `app/src/lib/clubTemplates.test.ts:316` `'Träningsplaneraren · Slice 39'` → `Slice 40`
  - Run `rg -n "Slice 39'" app/src` for others (none found besides these).

## 7. Budget (F1)

`cd app && npm run build` on main and branch; sum `gzip -9c` of `dist/assets/*.js` + `*.css`. Soft +512 B; estimate +150–300 B (one helper, four constants, one branch). Numbers in the PR.

## Open for Builder

1. Margins assume the phone canvas (~358×239 px). On desktop the marker is relatively smaller, so the grid just looks airier; fine.
2. Blå plan draws mats/blocks inside Öppen yta; markers may sit on a drawn mat. Accepted (zones, not plan shapes, define placement).
3. The standard halls' Öppen yta near-stack stays (B1). Candidate for a later slice if Christoffer wants it.
