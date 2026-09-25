# Slice 21 — static/code verification evidence

**Verifier role:** Code/static only (no product edits)  
**Date:** 2026-09-26 ~01:14 CEST  
**App root:** `/workspace/gymnastics-planner/app`  
**Authority:** `slice-21/verification-checklist.md` (APPROVED locks A1/B1/C1/D1/E1/F1)  
**Ship notes:** `app/SLICE21-SHIPPED.md`  
**Skill:** `verify-traningsplaneraren/SKILL.md`  
**Overall (code):** **PASS** (locked groups A/B/C/E/F + build; D1 wire-only not scored in this pass)

---

## Build

```
cd /workspace/gymnastics-planner/app && npm run build
```

| Field | Value |
|---|---|
| Exit code | **0** |
| Script | `tsc -b && vite build` |
| Output (brief) | vite v8.3.0; 46 modules; `dist/index.html` 0.98 kB; CSS 35.78 kB; JS 325.43 kB; ✓ built in 196ms |

---

## A1 — Pinch-zoom — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Touch listeners on `.hall-canvas-wrap` | **PASS** | `HallCanvas.tsx:157` wrap `ref={wrapRef}` / `className="hall-canvas-wrap"`. Effect `:76-135` attaches `touchstart` / `touchmove` / `touchend` / `touchcancel` on `wrap` (`:123-126`). Two-finger begin `:95-98`; move scales zoom `:101-114`. |
| Same clamp as +/− — `HALL_ZOOM_MIN=1` / `MAX=2` | **PASS** | `hall.ts:47-48` `HALL_ZOOM_MIN = 1`, `HALL_ZOOM_MAX = 2`; `clampHallZoom` `:51-53`; `roundHallZoom` clamps then rounds `:57-58`. Pinch path: `HallCanvas.tsx:111` `roundHallZoom(...)` → parent `HallBoard.tsx:225-226` `handlePinchZoom` → `clampHallZoom(roundHallZoom(next))`. Buttons: `zoomIn`/`zoomOut` `:217-222` use `roundHallZoom(z ± HALL_ZOOM_STEP)`; disabled at min/max `:478`, `:487`. |
| +/− still present (≥44px via tap target) | **PASS** | Narrow zoom bar `HallBoard.tsx:472-492` (− / +). Classes `hall-zoom-btn hall-tap-target`. CSS: `.hall-tap-target` `App.css:2113-2116` min 44×44; `.hall-zoom-btn` `:2207-2212` `width: 44px`; phone reaffirm `:2293-2297`. |
| View-only — zoom does not mutate placement x,y | **PASS** | `viewZoom` is local React state only (`HallBoard.tsx:84`); applied as CSS width on `.hall-canvas-zoom` (`HallCanvas.tsx:158-163`). Pinch/buttons only call `setViewZoom` / `onViewZoomChange` — never `persist` / `upsertPlacement`. Placement writes only via `placeAt` (`HallBoard.tsx:169-176`) and remove/preset/flow paths. Comment: `hall.ts:46` “Stored placements unchanged.” |
| Edit + Golvklart share pinch | **PASS** | Pinch effect depends on `onViewZoomChange` only (`HallCanvas.tsx:135`); parent always passes `onViewZoomChange={handlePinchZoom}` (`HallBoard.tsx:512`). Floor still mounts `HallCanvas` inside layout (`:506-531`); tray hidden separately. |

---

## B1 — Collapsible tray — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Collapsed default phone ≤768 | **PASS** | `trayCollapsed` default `true` (`HallBoard.tsx:85-86`). Narrow via `matchMedia('(max-width: 768px)')` (`:131-137`). Compact UI when `isNarrow && trayCollapsed` (`:536`, `:543-557`). |
| Compact bar: `hallUnplacedWithCount` + **Visa stationsbricka** | **PASS** | Count: `hallUnplacedWithCountText(unplaced.length)` (`:546`); helper `blockMeta.ts:361-362` + string `:162` `Ej placerade ({n})`. Expand label `UI.hallTrayExpand` → `blockMeta.ts:213` `'Visa stationsbricka'` (`HallBoard.tsx:555`). |
| Expand / **Dölj bricka** | **PASS** | Expand sets `setTrayCollapsed(false)` (`:553`). Collapse toolbar when expanded narrow (`:560-573`): `UI.hallTrayCollapse` → `blockMeta.ts:214` `'Dölj bricka'`. Expanded body keeps chips / Placera här / hints (`:576-616`). |
| Toggles ≥44px | **PASS** | Buttons use `hall-tap-target hall-tray-toggle` (`:550`, `:564`). CSS `.hall-tray-toggle` `App.css:2265-2268` min 44×44; shared phone list `:2293-2297`. |
| Golvklart hides tray | **PASS** | Tray gated `{!isFloor && (` (`HallBoard.tsx:533`). Floor layout class `hall-layout--floor` (`:496`). Enter floor clears place/selection (`:200-205`); exit resets `trayCollapsed` true (`:208-210`). |
| `--hall-tray-reserved` | **PASS** | Inline style on layout (`:497-503`): measured `trayHeight` px when narrow edit, else `'14rem'`. Measure via `ResizeObserver` on tray (`:144-161`). CSS consumes var `App.css:2276-2277` `padding-bottom` / `scroll-padding-bottom: var(--hall-tray-reserved, 14rem)`. Compact styles `:2238-2250`. |

---

## C1 — Pan when zoomed — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Pan via overflow when zoomed | **PASS** | Zoom grows content: `.hall-canvas-zoom` width `viewZoom * 100%` (`HallCanvas.tsx:158-163`). Wrap `overflow: auto` (`App.css:1563-1566`, phone `:2271-2273`). Comment: pinch owns two-finger; “one-finger empty uses wrap overflow pan” (`HallCanvas.tsx:76`, `:108`). Canvas `touch-action: pan-x pan-y` (`App.css:1578`, `:2281-2282`, floor `:2197-2198`). |
| Marker drag `touch-action` | **PASS** | Phone: `.hall-chip:not(.is-readonly) { touch-action: none; }` (`App.css:2285-2286`) so chip drag does not pan wrap. Canvas chips `draggable={!isFloor}` (`HallCanvas.tsx:261`). |
| Pan ≠ detail | **PASS** | Empty-canvas click only places when `placeModeItemId` set; ignores chip targets (`HallCanvas.tsx:149-153`). Overflow pan does not invoke `onChipClick` / `openDetail`. Chip drag suppresses post-drag click (`HallChip.tsx:33-36`, `:119-120`, `:97-102`). |
| Tap → detail | **PASS** | Canvas chip `onClick={onChipClick}` (`HallCanvas.tsx:266`). Placed path → `openDetail` (`HallBoard.tsx:514-524`); floor always `openDetail(id)` (`:515-517`). |
| Pinch ≠ pan-only | **PASS** | Two-finger `touchmove` `preventDefault` + updates zoom (`HallCanvas.tsx:108-113`); does not only scroll. |
| +/− after pan | **PASS** | Zoom bar independent of scroll position (`HallBoard.tsx:472-492`); same clamp helpers. |

---

## E1 — Footer — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Exactly `Träningsplaneraren · Slice 21` | **PASS** | `blockMeta.ts:338` `footerSliceLabel: 'Träningsplaneraren · Slice 21'`. Rendered `App.tsx:231-234` `{UI.footerSliceLabel}`. |

---

## F1 — Scope / chrome — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Caption Schematisk hall unchanged | **PASS** | `blockMeta.ts:169` `hallSchematicNote: 'Schematisk hall — inte exakt mått'`; rendered `HallCanvas.tsx:237`. |
| No CAD / hall badge feature | **PASS** | Slice 21 touch list = hall zoom helpers, HallCanvas pinch, HallBoard tray, App.css tray/pan, blockMeta tray+footer. No new CAD/pin/badge modules under `app/src`. (Prior stub/experienced/total badges unchanged prior slices.) |
| No Passbyggaren compose | **PASS** | `StationComposeSheet` imported/mounted only from `HallBoard.tsx:51`, `:655` (hall path). |
| No library growth | **PASS** | `equipmentPieces.ts:12-35` still exactly 10 `eq-*` pieces (`eq-trampett` … `eq-kon`); comment “all 10 pieces” (`:9-11`). |
| No saknar-redskap banner change | **PASS** | No new saknar banner in Slice 21 files. Existing `MismatchBanner` (Passbyggaren) / `hall-unplaced-banner` unchanged by this slice’s ship set. |
| No Kom igång heuristic change | **PASS** | `coachTips.ts` auto-progress comment still data-model §4 (`:189`); Slice 21 files do not edit `coachTips.ts` / Kom igång strings beyond tray+footer in `blockMeta.ts`. |
| Slice 20 remove ≥44 still; none on Golvklart | **PASS** | `.hall-chip--canvas .hall-chip-remove` 44×44 (`App.css:1833-1847`, phone `:2068-2072`). Floor: `onRemove={isFloor ? undefined : ...}`, `showRemove={!isFloor}` (`HallCanvas.tsx:267-268`). |
| No `window.confirm` | **PASS** | `rg window.confirm` under `app/src` → **zero** hits. Dirty Stäng remains in-sheet (`StationComposeSheet.tsx:101+`, `composeDirty*` `blockMeta.ts:300-304`). Mentions only in historical `SLICE*-SHIPPED.md`. |

---

## Summary

| Lock | Result |
|---|---|
| **A1** Pinch + clamp 1…2 + +/− + view-only | **PASS** |
| **B1** Collapsible tray default / strings / ≥44 / Golvklart hide / `--hall-tray-reserved` | **PASS** |
| **C1** Overflow pan / chip `touch-action` / pan≠detail / tap→detail | **PASS** |
| **E1** Footer Slice 21 | **PASS** |
| **F1** Scope + caption + remove≥44 + no `window.confirm` | **PASS** |
| **Build** | **PASS** (exit 0) |

**Evidence path:** `/workspace/gymnastics-planner/verifier/slice-21-evidence-code.md`

**Note (static only):** Multi-touch pinch not exercised in browser here; handlers + clamp path verified in source. Live phone pinch remains a drive-smoke item per ship smoke gap.
