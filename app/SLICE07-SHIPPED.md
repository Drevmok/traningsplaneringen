# Slice 07 — SHIPPED

**Date:** 2026-09-24  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-07/` (+ locked copy `slice-07/content/golvklart-copy.sv.md`, mirror `docs/golvklart-copy.sv.md`)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run dev   # http://localhost:5173
npm run build # production check — green
```

## Features shipped

1. **Stationsordning:** `passOrder` walks `BLOCK_ORDER` explicitly, then `item.order` asc. `stationRanks(session)` → Map 1…N among *placed* only. Badge on canvas chips; tray chips have no number. a11y name `"N. {title}"`. Hint: **Stationsordning följer passet.** No hall drag-reorder of Passbyggaren order.
2. **Visa flöde / Dölj flöde:** Soft muted dashed SVG connectors chip-center→center between consecutive placed in pass order. Default ON (`hallShowFlow !== false`). Persist `Session.hallShowFlow` via `saveDraft`. Hide when <2 placed. Flow layer `pointer-events: none` + `aria-hidden`. Preference carries into Golvklart; toggle hidden in floor mode.
3. **Phone polish (≤768px):** Sticky bottom tray; pan empty canvas (`touch-action: pan-x pan-y`) vs chip drag (`touch-action: none` on chips); **Placera här** + Slice 06 snap kept; primary taps ≥44px; **+ / −** zoom (aria Zooma in/ut) — view-only, does not change stored x,y; clear **Ta bort från hall** button (≥44px) — no remove on short chip tap (opens detail); Hallayout select ≥44px.
4. **Golvklart:** UI-only `hallMode: 'edit' | 'floor'` (never persisted). Header CTA **Golvklart** → floor: hide tray/drag/Placera här/remove/Hallayout select/flow toggle; show schematic + numbered chips + flow if on + zones + caption + title + duration; soft banner `{n} övningar ej placerade` / singular; **Avsluta golvklart** → edit; **Skriv ut** → `window.print()` + `@media print` landscape A4 (no PDF lib/CDN). Erfaren badge stays; tap chip → ActivityDetail read-only with warning. Always open hall in edit on entry/reload.
5. **Types / migrate:** `hallShowFlow?: boolean` on Session; missing → true at runtime; storage key unchanged `gymnastics-planner-draft-v1`.

## Builder choices (locked for Verifier)

| Choice | Decision |
| --- | --- |
| **Zoom** | **+ / −** buttons (not pinch) — reliable Verifier check; view-only scale via canvas wrapper width; stored coords unchanged |
| **hallShowFlow persist** | **Yes** — `Session.hallShowFlow` + `saveDraft` on toggle; undefined → true |

## Locked Docs strings used

| Key | Swedish |
| --- | --- |
| `hallFloorReady` | Golvklart |
| `hallExitFloor` | Avsluta golvklart |
| `hallPrint` | Skriv ut |
| `hallUnplacedBanner` / One | `{n} övningar ej placerade` / `1 övning ej placerad` |
| `hallShowFlow` / `hallHideFlow` | Visa flöde / Dölj flöde |
| `hallStationOrderHint` | Stationsordning följer passet |
| `hallZoomIn` / `hallZoomOut` | Zooma in / Zooma ut |
| Caption | Schematisk hall — inte exakt mått |

## Files changed / added

**Added**

- `SLICE07-SHIPPED.md`

**Updated**

- `src/types.ts` — `hallShowFlow?: boolean`
- `src/lib/hall.ts` — `passOrder`, `stationRanks`, `flowSegments`, `isHallShowFlow`, migrate preserve
- `src/data/blockMeta.ts` — Slice 07 UI keys + `hallUnplacedBannerText`
- `src/components/HallChip.tsx` — station rank badge + a11y; readonly
- `src/components/HallCanvas.tsx` — flow layer, ranks, zoom wrapper, floor mode
- `src/components/HallBoard.tsx` — Golvklart mode, flow toggle, zoom +/−, sticky tray, print
- `src/App.css` — badges, flow, sticky tray, zoom, floor, `@media print`
- `src/App.tsx` — footer Slice 07

## Confirmations

- Ranks among *placed* only; tray has no numbers
- No hall reorder mutating Passbyggaren `order`
- Print = `window.print()` + print CSS only (no PDF lib/CDN)
- Erfaren badge visible in Golvklart; detail warning preserved
- Sticky tray + Placera här kept
- `npm run build` green

## Gaps / deferred (not FAIL)

- Pinch-zoom not implemented (buttons chosen)
- Soft zone highlight / snap ease still nice-to-have
- Keyboard full-drag still not required
- Optional toast `Placering sparad` unused

## Regression preserved

Slice 01–06: Passbyggaren, totals, soft mismatch, VisualIcon, 28 drills, experienced warning, Hallöversikt foundation, snap/presets, draft key.
