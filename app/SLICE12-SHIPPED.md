# Slice 12 — SHIPPED

**Date:** 2026-09-24 (Europe/Stockholm)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-12/` (visual station tiles + tap-to-detail)  
**Copy authority:** `docs/station-tiles.sv.md` (+ tip overrides in `docs/coach-tips.sv.md`; pack mirror under `slice-12/content/`)

## Goal delivered

Placed Teknik stations on Hallöversikt read as **small icon-first markers**. **Tap** opens read-only station detail; **drag-reposition does not** open detail.

## Features shipped

1. **Canvas marker (icon-dominant)** — `HallChip` `variant="canvas"` is a compact ~52px square marker: `VisualIcon` size **`marker`** (48×48 tile / 28 draw), station rank badge (corner), Erfaren corner mark when needed. **Title hidden on screen** (always in `aria-label` + detail); **duration stays hidden**. Tray variant unchanged (short title + duration, touch-friendly).

2. **Tap → detail / drag ≠ detail** — Placed canvas tap/click still opens existing `ActivityDetail` `readOnly`. `HallChip` sets a suppress flag on HTML5 **`dragstart`** so the browser’s synthetic click after `dragend` does not open detail. Flag clears on the suppressed click, or via a short timeout if no click follows (cancelled drag). Keyboard Enter/Space always opens detail. Phone tray unplaced still uses Slice 11 place-mode (`Placera här`).

3. **Aria / Swedish copy (Docs)** — Wired: `hallTileHint`, `hallTileHintShort`, `hallTileA11y` / `NoRank` / `Experienced` (+ helper `hallTileA11yText`), `hallDetailClose` / `hallDetailCloseAria`. Quiet `hallTileHint` under stations-only hint on Hallöversikt edit chrome. Tips updated: `tipHallPlace`, `tipHallFlowGolvklart` (markörer wording); `hallFloorCoachTip` aligned. Hall detail close uses `hallDetailCloseAria` when `readOnly`.

4. **Golvklart / print** — Markers + ranks stay; print CSS shows short title (`.hall-chip-title--print`) under the icon for paper legibility. Caption unchanged: **Schematisk hall — inte exakt mått**.

5. **Teknik-only intact** — No changes to `lib/hall.ts` placeable filter / prune / ranks / flow (Slice 11).

6. **Footer** — Exact: **Träningsplaneraren · Slice 12** via `UI.footerSliceLabel`.

## Drag vs tap (ship note)

**Solution:** suppress click-after-drag via `dragstart` flag inside `HallChip` (not a pixel movement threshold). Rationale: HTML5 DnD already implies intent to move; a movement threshold alone can false-suppress jittery taps. Documented here per screen-spec.

## Verification (Builder)

- `npm run build` — exit 0 (tsc + vite).
- Did **not** redeploy Netlify / touch hosting.
- Did **not** message Verifier.

## Files changed / added

**Updated**

- `src/data/blockMeta.ts` — Slice 12 UI + tips; footer Slice 12; `hallTileA11yText`
- `src/icons/types.ts` — `marker` VisualIcon size
- `src/components/HallChip.tsx` — canvas marker layout; dragstart click-suppress; Docs aria
- `src/components/HallBoard.tsx` — `hallTileHint` near stations-only hint
- `src/components/ActivityDetail.tsx` — read-only close aria (`hallDetailCloseAria`)
- `src/App.css` — marker anatomy, focus ring, phone compact remove, print title

**Added**

- `SLICE12-SHIPPED.md` (this file)

**Untouched (by design)**

- `src/lib/hall.ts` — Teknik-only / prune / ranks / flow
- Netlify / Verifier

## Decisions followed

- Icon-first markers, not text cards; no pin-only / no equipment composition.
- Reuse ActivityDetail read-only (no parallel detail UI; no add-to-pass from hall).
- Tray stays more readable for pick/drag.
- Teknik-only + Slice 11 prune carry forward.

## Deviations

- None material. Docs `**Golvklart**` markdown in tip strings ships as plain text (CoachTipStrip already emphasizes Golvklart visually where applicable).
- Canvas remove control is a small corner × (not 44px) so the marker footprint stays icon-led; tray remove stays ≥44px on phone. Drag-back-to-tray still removes.

## Out of scope (not done)

- Equipment composition / CAD / new placeable blocks / library edits / drag-reorder on hall / Netlify republish / Verifier ping.
