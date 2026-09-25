# Slice 21 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Hallöversikt phone usability — pinch-zoom + collapsible sticky tray + pan while zoomed  
**Deploy:** No (no Pages/Netlify republish)  
**Agents messaged:** None (report to Planner/parent only)

## What shipped

- **A1** Pinch-to-zoom on hall canvas (edit + Golvklart): two-finger listeners on `.hall-canvas-wrap`; continuous scale clamped with same `HALL_ZOOM_MIN(1)` / `HALL_ZOOM_MAX(2)` as +/−; +/− kept (0.25 step); view-only (placements unchanged after zoom + reload).
- **B1** Phone ≤768px edit: sticky tray collapsed by default; compact bar with `hallUnplacedWithCount` + **Visa stationsbricka** (≥44px); expanded = today’s tray + **Dölj bricka**; `--hall-tray-reserved` follows measured compact/full height; Golvklart still hides edit tray.
- **C1** When zoomed: one-finger pan via existing `.hall-canvas-wrap` overflow scroll; marker drag unchanged (`touch-action: none` on chips); pinch reserved for zoom; pan does not open detail; short tap still opens detail; +/− still work.
- **D1** Wired Docs strings (`hallTrayExpand` / `Collapse` + aria); reuse zoom strings; no new tip.
- **E1** Footer → `Träningsplaneraren · Slice 21`.
- **F1** No CAD/pins/badge; no Passbyggaren compose; no library growth; no saknar-redskap banner; no Kom igång heuristic change; caption unchanged; preserve 11–20; no republish.

## Files touched

| File | Change |
|---|---|
| `src/lib/hall.ts` | `HALL_ZOOM_*`, `clampHallZoom`, `roundHallZoom`, `touchDistance` |
| `src/components/HallCanvas.tsx` | Pinch touch listeners; `onViewZoomChange` |
| `src/components/HallBoard.tsx` | Collapsible tray; pinch wiring; shared zoom helpers; footer via UI |
| `src/App.css` | Compact tray / toolbar / toggle ≥44px |
| `src/data/blockMeta.ts` | Tray strings, `hallUnplacedWithCount` + helper, footer Slice 21 |
| `SLICE21-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Pinch + keep +/−; same clamp; view-only; phone required | Done |
| **B** | Collapsible sticky tray; collapsed default; compact + expand ≥44px; Golvklart hides tray | Done |
| **C** | One-finger empty pan when zoomed; marker drag; pinch=zoom; pan≠detail | Done |
| **D** | Thin Docs strings wired; no new tip | Done (wire-only) |
| **E** | Footer exactly `Träningsplaneraren · Slice 21` | Done |
| **F** | No CAD/badge/Passbyggaren compose/library/saknar/Kom igång/caption change; preserve 11–20; no republish | Done |

## Self-smoke

- `npm run build` — **green**
- Preview `http://127.0.0.1:4173/traningsplaneringen/` — doctor HTTP 200
- Drive: puppeteer-core + system Chrome, viewport 390×844
- Evidence: `verifier/slice-21-builder-smoke.md`, `/workspace/screenshots/slice21_*.png`

Results: footer Slice 21; tray collapsed→expand→collapse (62px→300px→62px); +/− zoom + clamp MAX=2; overflow pan when zoomed; placements persist after reload; short tap detail; Golvklart no edit tray + zoom works; caption unchanged.

### Smoke gap

Pinch multi-touch not exercised in headless Chrome automation. Pinch handlers are implemented on `.hall-canvas-wrap` (`touchstart`/`touchmove`/`touchend`); Verifier should phone-check A1 pinch.

## Deviations

None (product). Smoke gap for multi-touch pinch only — documented above.
