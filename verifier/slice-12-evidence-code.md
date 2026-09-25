# Slice 12 — Code evidence pack (Verifier)

**Date:** 2026-09-24 14:58 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-12/verification-checklist.md` + `app/SLICE12-SHIPPED.md` + `docs/station-tiles.sv.md`  
**Scope:** CODE / build only — inspect, build, evidence. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 42 modules; `dist/index.html` 0.97 kB; `index-CuZ5PEXL.css` 29.40 kB; `index-DldKIxW3.js` 305.87 kB; built in ~226 ms; `BUILD_EXIT=0` |
| Dist strings present | **PASS** | Bundle contains `Träningsplaneraren · Slice 12`, `Stationerna visas som små markörer`, `Tryck på en markör`, `Stäng stationsdetaljer` |
| Errors | none | clean build stdout |

---

## Legend

- **PASS** — satisfied from code with concrete file:line / grep quotes  
- **PARTIAL** — present in code; visual/size/UX needs UI smoke  
- **FAIL** — clear code violation  
- **N/A / DEFERRED** — UI smoke / live URL; not a code FAIL here

---

## Locked rules (CODE)

### 1. Visual markers (icon-first canvas tiles) — **PASS** (code) / footprint look **PARTIAL→UI**

| Claim | Evidence |
| --- | --- |
| Canvas ~52px square | `App.css:1717-1732` `.hall-chip--canvas` `width/height/min: 52px`, `max-width: 56px`, centered flex, `gap: 0` |
| Phone keeps 52px | `App.css:2019-2025` + `:2230-2236` — “do not inflate to text-chip phone sizes” |
| `VisualIcon` size `marker` | `HallChip.tsx:118-122` `size={isCanvas ? 'marker' : 'block'}`; `icons/types.ts:34-44` `marker: { tile: 48, draw: 28 }` |
| Title hidden on screen | `HallChip.tsx:124-129` canvas uses `hall-chip-title--print` only; `App.css:1745-1747` `display: none` on screen |
| Duration hidden on canvas | Canvas branch has **no** duration; tray only shows `{item.durationMinutes} min` `HallChip.tsx:143-144` |
| Rank badge | `HallChip.tsx:113-116` `.hall-chip-rank`; canvas absolute corner `App.css:1762-1771` |
| Erfaren corner | `HallChip.tsx:130-138` `.hall-chip-exp--mark`; CSS `App.css:1773-1791` bottom-right |
| Canvas wiring | `HallCanvas.tsx:179-183` `variant="canvas"` + `stationRank={ranks.get(item.id)}` |
| Anchor not wide card | `App.css:1694-1699` `.hall-chip-anchor` `max-width: none` (no 28% text-card width) |

**PARTIAL:** “reads as icon-first markers not text cards” is visually confirmed in CSS structure; live pixel judgment → UI smoke.

### 2. Tap placed → ActivityDetail readOnly (correct activity) — **PASS**

| Claim | Evidence |
| --- | --- |
| Placed canvas click → detail | `HallBoard.tsx:417-428` `onChipClick`: floor always `openDetail(id)`; edit mode placed (not unplaced) → `openDetail(id)` |
| Resolves correct activity | `openDetail` `:198-206` finds session item by id → `getActivityById(item.activityId)` → `setDetailActivity(activity)` |
| Renders read-only detail | `:492-499` `<ActivityDetail activity={detailActivity} readOnly …>` |
| HallChip activates click | `HallChip.tsx:65-70`, `:101` `onClick={handleActivate}` → `onClick?.(item.id)` when not suppressed |
| Keyboard always opens | `HallChip.tsx:105-110` Enter/Space clears suppress and calls `onClick` |

### 3. Drag-reposition does NOT open detail — **PASS**

| Claim | Evidence |
| --- | --- |
| Mechanism = dragstart suppress flag (not movement threshold) | `HallChip.tsx:24-27` comment; `:55` `suppressClickRef`; `:82-88` on `dragstart` sets `suppressClickRef.current = true` |
| Synthetic click after drag ignored | `handleActivate` `:65-68` if suppress → clear flag and `return` (no `onClick`) |
| Cancelled drag cleanup | `onDragEnd` `:94-99` `setTimeout(…, 120)` clears leftover suppress |
| Ship note matches code | `SLICE12-SHIPPED.md:26-28` documents dragstart flag (not pixel threshold) |

**Note:** Live DnD click-after-drop behavior still worth UI smoke; code path is present and wired.

### 4. Erfaren on tile + in detail — **PASS**

| Claim | Evidence |
| --- | --- |
| Flag from activity | `HallChip.tsx:52` `experienced = Boolean(activity?.experiencedCoachOnly)` |
| Canvas corner mark | `:130-138` `UI.hallExperiencedShort` (`blockMeta.ts:183` `'Erfaren'`) |
| A11y includes Erfaren | `:57-58` `hallTileA11yText(…, { rank, experienced })`; helper `blockMeta.ts:302-318` uses `hallTileA11yExperienced` |
| Detail badge + warning | `ActivityDetail.tsx:69-71` `.experienced-badge`; `:78-82` `.experienced-warning` (always when flag set, independent of `readOnly`) |
| Hall opens same ActivityDetail | `HallBoard.tsx:492-499` with that activity |

### 5. Slice 11 Teknik-only (hall.ts placeable/prune/ranks/flow) — **PASS**

| Claim | Evidence |
| --- | --- |
| Ship: untouched | `SLICE12-SHIPPED.md:51-54` lists `src/lib/hall.ts` under **Untouched**; not in “Files changed” |
| Filter still Teknik | `hall.ts:83-86` `isPlaceableItem` → `blockType === 'techniques'` |
| placeable / count | `:93-98` |
| ranks among placed Teknik | `:101-114` iterates `placeableItems` ∩ placements |
| flow Teknik-only | `:131-156` |
| upsert reject non-placeable | `:283-290` `if (!item \|\| !isPlaceableItem(item)) return session` |
| silent prune | `:379-387` keeps only ids in `placeableItems` set |
| HallBoard still prunes on open | `HallBoard.tsx:84-93` `pruneHallPlacements` |
| File mtime | `hall.ts` mtime 2026-09-24 14:30 CEST (pre Slice-12 ship note 14:xx; consistent with “untouched by Slice 12”) |

### 6. Tray still usable (tray variant unchanged) — **PASS** (code) / ~390px smoke **PARTIAL→UI**

| Claim | Evidence |
| --- | --- |
| Tray variant distinct | `HallChip.tsx:140-151` shows title + duration + Erfaren inline (not marker layout) |
| Default / wiring | `variant = 'tray'` default `:31`; tray list `HallBoard.tsx:473-475` `variant="tray"` |
| Touch min-height | `App.css:1818-1820` `.hall-chip--tray { min-height: 44px }`; phone `:2035-2036`, `:2220-2227` tray remove ≥44px |
| Sticky phone tray | `HallBoard.tsx:437-440` `hall-tray--sticky` when narrow; height reserved `:400-408` |
| Phone place-mode intact | `handleChipClick` `:188-193` unplaced + narrow → place mode; UI `hallPlaceHere` `:461-464`, `:481-483` |

**PARTIAL:** “usable on phone ~390px” needs UI smoke; code keeps tray readable + 44px targets.

### 7. Golvklart markers + ranks; print title CSS — **PASS** (code)

| Claim | Evidence |
| --- | --- |
| Floor uses same canvas chips | `HallCanvas` placed map always `variant="canvas"` + `stationRank`; floor only disables drag/remove (`HallCanvas.tsx:184-191`) |
| Floor tap → detail | `HallBoard.tsx:418-421` `if (isFloor) openDetail(id)` |
| Ranks from Teknik placeable | `HallCanvas.tsx:55` `stationRanks(session)`; ranks API Teknik-only (rule 5) |
| Flow tip markörer wording | `blockMeta.ts:244-245` `tipHallFlowGolvklart`; wired `HallBoard.tsx:359-365` |
| Print short title under icon | `App.css:2349-2354` `@media print` `.hall-chip-title--print { display: block !important }` |
| Screen hides print title | `App.css:1745-1747` `display: none` |
| Caption lock still present | `blockMeta.ts:168` `hallSchematicNote: 'Schematisk hall — inte exakt mått'` |

**PARTIAL:** Golvklart visual “readable markers + ranks” on device/print → UI smoke.

### 8. No add-to-pass from hall detail — **PASS**

| Claim | Evidence |
| --- | --- |
| Hall mounts readOnly, no onAdd | `HallBoard.tsx:492-499` `readOnly` only (no `onAdd` prop) |
| Add UI gated | `ActivityDetail.tsx:111` `{!readOnly && onAdd && (… add buttons …)}` |
| Docs/ship lock | No “Lägg till i passet” from hall; `addToBlock` exists for library path only (`blockMeta.ts:132`) |

### 9. Footer Träningsplaneraren · Slice 12 — **PASS**

| Claim | Evidence |
| --- | --- |
| Exact string | `blockMeta.ts:263` `footerSliceLabel: 'Träningsplaneraren · Slice 12'` |
| Render | `App.tsx:213-216` `<footer className="app-footer no-print">` → `{UI.footerSliceLabel}` |
| Dist | JS bundle contains exact string |

### 10. Scope — no equipment composition / CAD / new placeable blocks — **PASS**

| Claim | Evidence |
| --- | --- |
| Ship out-of-scope | `SLICE12-SHIPPED.md:67-70` equipment composition / CAD / new placeable blocks / Netlify not done |
| Placeable still Teknik-only | rule 5 — no new block types in `isPlaceableItem` |
| No CAD / composition modules under `src/` | directory grep: no cad/composition UI modules |
| Files changed this slice | Ship list: `blockMeta.ts`, `icons/types.ts`, `HallChip.tsx`, `HallBoard.tsx`, `ActivityDetail.tsx`, `App.css` + `SLICE12-SHIPPED.md` only |
| `equipment` mentions | seed tags / optional `types.ts` field only — not hall composition UI |
| Same three presets | `hallPresets.ts:32` `HALL_PRESET_ORDER` unchanged pattern (no new presets this slice) |

---

## Checklist crosswalk (code lean)

| Checklist # | Rule | CODE lean |
| --- | --- | --- |
| 1 | Visual markers | **PASS** (visual footprint → UI PARTIAL) |
| 2 | Tap → detail | **PASS** |
| 3 | Drag ≠ detail | **PASS** (live DnD → UI confirm) |
| 4 | Erfaren | **PASS** |
| 5 | Teknik-only | **PASS** |
| 6 | Tray usable | **PASS** (phone ~390 → UI PARTIAL) |
| 7 | Golvklart | **PASS** (device/print look → UI PARTIAL) |
| 8 | Detail read-only | **PASS** |
| 9 | Footer Slice 12 | **PASS** |
| 10 | Scope | **PASS** |

**Overall CODE:** **PASS** (no code FAILs). UI smoke still required for checklist overall PASS per authority.

---

## Deviations / gaps

1. **UI smoke not run here** — tap/drag distinction, marker readability, Golvklart, tray @~390px deferred to UI verifier.  
2. **Ship deviation acknowledged (non-blocking):** canvas remove control is compact corner × (~22–24px), not 44px — `App.css:1793-1806`, `:2027-2031`; ship `SLICE12-SHIPPED.md:65-66` documents this so marker stays icon-led. Tray remove remains ≥44px.  
3. **Docs note vs ship:** docs `station-tiles.sv.md:123` mentions “movement threshold”; **ship + code** correctly use **dragstart suppress flag** (`SLICE12-SHIPPED.md:26-28`, `HallChip.tsx:55-99`). Code matches ship authority.  
4. **No Netlify republish** — per checklist non-blocking / ship.

---

## Key file index

| File | Role in Slice 12 |
| --- | --- |
| `src/components/HallChip.tsx` | Canvas marker layout; dragstart click-suppress; Erfaren/rank/a11y |
| `src/components/HallBoard.tsx` | Tap→`openDetail`; `ActivityDetail readOnly`; tray; `hallTileHint` |
| `src/components/HallCanvas.tsx` | Places `variant="canvas"` + ranks |
| `src/components/ActivityDetail.tsx` | readOnly close aria; hide add; Erfaren in detail |
| `src/icons/types.ts` | `marker` size 48/28 |
| `src/data/blockMeta.ts` | Slice 12 UI strings + `hallTileA11yText`; footer |
| `src/App.css` | 52px marker anatomy; print title; tray 44px |
| `src/lib/hall.ts` | **Untouched** — Teknik placeable/prune/ranks/flow |
| `src/App.tsx` | Footer label render |

---

## Smoke path mapping (code only)

| Smoke step | Code evidence |
| --- | --- |
| Pass ≥2 Teknik + others → tray Teknik only | `getUnplacedItems` ← `placeableItems` Teknik filter |
| Place → compact icon-led markers + ranks | canvas CSS 52px + `stationRank` |
| Tap → detail; close → still placed | `openDetail` / `readOnly`; close only clears `detailActivity` (no `removePlacement`) |
| Drag → move; no detail from that drag | `suppressClickRef` on dragstart |
| Golvklart + phone tray | floor header + sticky tray CSS |
| `npm run build` green | exit **0** (this run) |
