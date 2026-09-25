# Slice 11 — SHIPPED

**Date:** 2026-09-24 (Europe/Stockholm)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-11/` (Hallöversikt declutter)  
**Copy authority:** `docs/hall-declutter.sv.md` (+ tip overrides in `docs/coach-tips.sv.md`; mirror under `slice-11/content/`)

## Goal delivered

Hallöversikt places **only Teknik** (`blockType === 'techniques'`) stations; canvas chips are compact so the floor does not clutter.

## Features shipped

1. **Placeable filter (single source of truth)** — `placeableItems` / `isPlaceableItem` / `countPlaceableItems` in `src/lib/hall.ts`. Wired into `getUnplacedItems`, `getPlacedItems`, `stationRanks`, `flowSegments`, and `upsertPlacement` (rejects non-placeable ids). Tray + canvas never show Samling / Uppvärmning / Styrka / Lek.

2. **Silent prune** — `pruneHallPlacements` drops placements whose session item is missing **or** resolves to `blockType !== 'techniques'`. Still called from `migrateHallFields` / load; Hallöversikt also prunes on open. No toast.

3. **Compact canvas chips** — Anchor max-width **28%** (was ~42%). `HallChip` canvas variant: VisualIcon size **`item`**, truncated title, station rank, Erfaren short badge; **duration hidden** on canvas. Tray keeps larger/`block` icon + duration, ≥44px touch. CSS: `.hall-chip--canvas` / `.hall-chip--tray`. Remove control ≥44px on phone.

4. **Empty states & Swedish copy (Docs)** — Wired keys: `hallStationsOnlyHint`, `hallNoStationsTitle` / `Body` / `Cta`, `hallTrayEmptyStations` / `hallAllPlaced`, `hallUnplacedStations`, `hallDropHintStations`, `hallDragHint`, `hallSnapHint` (station wording), `hallUnplacedBanner(One)`, `hallStationCount(One)`. Pass with items but zero Teknik → empty canvas + Swedish explanation (Hallöversikt CTA from Passbyggaren still enabled when ≥1 övning any block).

5. **stationRanks / flow / Golvklart** — Ranks 1…N and flow only among **placed Teknik** (Passbyggaren order). Soft unplaced banner counts **unplaced Teknik only**. Print: compact chips remain legible (rank + title). Caption unchanged: **Schematisk hall — inte exakt mått**.

6. **Slice 09 tip / Kom igång copy** — Updated to Teknik-stationer wording: `komIgangStep3`, `komIgangStep3Hint`, `tipHallPlace`, `tipHallFlowGolvklart` (+ `hallFloorCoachTip` / `hallCoachTip` aligned). Dismiss ids/behavior unchanged.

7. **Footer** — Exact: **Träningsplaneraren · Slice 11** via `UI.footerSliceLabel`.

## Verification (Builder)

- `npm run build` — exit 0 (tsc + vite).
- Did **not** redeploy Netlify / touch hosting.
- Did **not** message Verifier.

## Files changed / added

**Updated**

- `src/lib/hall.ts` — placeable filter, prune non-Teknik, ranks/flow/unplaced/placed/upsert wired
- `src/data/blockMeta.ts` — Docs-locked Slice 11 UI + tip/Kom igång strings; footer Slice 11; `hallStationCountText`
- `src/components/HallChip.tsx` — canvas compact (item icon, hide duration)
- `src/components/HallBoard.tsx` — no-Teknik empty state, stations-only hint, tray/copy, prune-on-open, station count header
- `src/components/HallCanvas.tsx` — `hallDropHintStations`
- `src/App.css` — `.hall-chip--canvas` / `--tray`, 28% anchor, print + phone polish

**Added**

- `SLICE11-SHIPPED.md` (this file)

## Decisions followed

- Stations = `activity.blockType === 'techniques'` only (not fuzzy “station” in title; no Styrka/cirkel on floor).
- Storage key / placement shape unchanged.
- Snap / presets / zoom / Golvklart chrome unchanged except filter + chip size.
- Passbyggaren still lists all five blocks.
- Erfaren on Teknik unchanged.
- No pin-only markers; no disable-Hallöversikt-until-Teknik.

## Deviations

- None material. Tip strings ship as plain text (CoachTipStrip already bolds “Golvklart” in the strip); Docs `**Golvklart**` markdown not stored in `UI`.
- Header count on Hallöversikt edit chrome uses station count (`hallStationCount*`) for the placeable set, per Docs.

## Out of scope (not done)

- New presets / CAD / Styrka-as-stations / library edits / accounts/sync / Netlify republish / Verifier ping.
