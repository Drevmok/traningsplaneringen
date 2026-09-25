# Slice 14 — Code evidence pack (Verifier)

**Date:** 2026-09-25 09:44 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-14/verification-checklist.md` (APPROVED 2026-09-25) + `app/SLICE14-SHIPPED.md` + `docs/golvklart-redskap.sv.md`  
**Scope:** CODE / build only — inspect, build, evidence. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 44 modules; `dist/index.html` 0.97 kB; `index-DMyHFego.css` 33.11 kB; `index-DUYOpl4a.js` 317.02 kB; built in ~312 ms |
| Errors | none | clean build stdout |

### Files touched (Slice 14 ship — mtimes 2026-09-25 ~09:43 CEST)

| File | Role |
| --- | --- |
| `src/components/HallChip.tsx` | Resolve + render `.hall-chip-equipment` when non-empty |
| `src/App.css` | Hide in edit; show under `.hall-canvas.is-floor`; show in `@media print` below title |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 14; floor aliases |

### Untouched (regression spots)

| File | mtime (CEST) | Note |
| --- | --- | --- |
| `src/lib/hall.ts` | 2026-09-24 14:30 | Teknik filter / prune intact |
| `src/components/ActivityDetail.tsx` | 2026-09-24 15:33 | Detail Redskap / förslag only |
| `src/components/StationComposeSheet.tsx` | 2026-09-24 15:32 | Compose sheet unchanged |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX needs UI smoke  
- **FAIL** — clear code violation

---

## Locked rules (CODE) 1–17

### 1. Golvklart shows redskap under markör (non-empty) — **PASS**

| Claim | Evidence |
| --- | --- |
| Source = `item.stationEquipment` only when non-empty | `HallChip.tsx:63-65` `hasEquipment = Array.isArray(…) && length > 0` |
| Resolve lines on canvas | `HallChip.tsx:67-81` `isCanvas && hasEquipment` → `getEquipmentPiece` + `stationEquipmentLabelText` |
| DOM under markör | `HallChip.tsx:171-183` `<div className="hall-chip-equipment">` with `.hall-chip-equipment-line` children |
| Golvklart visibility | `App.css:1790-1793` `.hall-canvas.is-floor .hall-chip--canvas .hall-chip-equipment { display: flex }` |
| Floor class wired | `HallCanvas.tsx:89` `isFloor ? ' is-floor' : ''` |

### 2. Print shows same lines after short titles — **PASS**

| Claim | Evidence |
| --- | --- |
| Print reveals equipment | `App.css:2390-2399` `@media print` `.hall-chip--canvas .hall-chip-equipment { display: flex !important; top: calc(100% + 0.85rem + 4px); … }` |
| Short title also print-shown | `App.css:2383-2388` `.hall-chip-title--print { display: block !important }` at `top: calc(100% + 2px)` (base `:1746-1760`) |
| Stacking order | Equipment `top` offset places lines **below** print title (title ~2px under tile; equipment ~0.85rem+4px under tile) |
| Same line source | Same HallChip `equipmentLines` block used for floor + print (CSS-only visibility) |

### 3. undefined → quiet (no lines, no «inga redskap») — **PASS**

| Claim | Evidence |
| --- | --- |
| Undefined fails `hasEquipment` | `HallChip.tsx:63-65` requires `Array.isArray` + `length > 0` |
| No equipment DOM when quiet | `HallChip.tsx:172` gated `{equipmentLines.length > 0 && (…)}` |
| No floor empty chrome | Grep: no `hallFloorEquipmentEmpty` / no floor use of `stationEquipmentEmpty`; empty strings only in detail/compose (`blockMeta.ts:270`, `:293`) |

### 4. [] → quiet — **PASS**

| Claim | Evidence |
| --- | --- |
| Empty array → `hasEquipment` false | `HallChip.tsx:63-65` `length > 0` fails for `[]` |
| `equipmentLines` → `[]` | ternary else branch `:81` |
| No forced “inga redskap” on floor/print | same as rule 3 |

### 5. defaultStationEquipment / förslag NOT on floor/print — **PASS**

| Claim | Evidence |
| --- | --- |
| HallChip never reads defaults | Grep `defaultStationEquipment` in `HallChip.tsx` → **no hits** |
| Floor path = saved slots only | `HallChip.tsx:69` `item.stationEquipment!` only |
| Förslag stays detail-only | `ActivityDetail.tsx:66-67,158-187` uses `activity.defaultStationEquipment` when unset; compose seed in `HallBoard.tsx:540-541` for sheet initial only — not canvas render |

### 6. Edit canvas: CSS hides equipment; no badge — **PASS**

| Claim | Evidence |
| --- | --- |
| Default hide (edit) | `App.css:1762-1764` `.hall-chip--canvas .hall-chip-equipment { display: none }` |
| Floor override only with `.is-floor` | `App.css:1791-1793` |
| No equipment-count badge element | Grep: no `equipment-badge` / `eq-count` / `has-equipment` class on canvas; `hasEquipment` feeds a11y string only (`HallChip.tsx:85-90` → `hallTileA11yText`) |
| Ship note | DOM may exist in edit; CSS hides — visual edit canvas stays clean |

### 7. Format: count===1 label only; count>1 n× label — **PASS**

| Claim | Evidence |
| --- | --- |
| Helper | `blockMeta.ts:367-375` `stationEquipmentLabelText` — count===1 → `UI.stationEquipmentOne` (`'{label}'`); else `UI.stationEquipmentCount` (`'{n}× {label}'`) |
| Floor uses helper | `HallChip.tsx:77` `stationEquipmentLabelText(piece.labelSv, slot.count)` |
| Templates | `blockMeta.ts:275-279` including Slice 14 aliases `hallFloorEquipmentOne` / `hallFloorEquipmentCount` (same strings; render path reuses helper) |

### 8. Up to 8 lines; no «+N till» — **PASS**

| Claim | Evidence |
| --- | --- |
| Soft cap constant | `equipmentPieces.ts:5` `STATION_EQUIPMENT_MAX_SLOTS = 8` |
| Slice applied | `HallChip.tsx:70` `.slice(0, STATION_EQUIPMENT_MAX_SLOTS)` then one line per resolved piece |
| No truncation chrome | Grep: no `hallFloorEquipmentMore`, no `+N till` / `+{n} till` UI key or render |

### 9. Under markör, not side list — **PASS**

| Claim | Evidence |
| --- | --- |
| Absolute under tile | `App.css:1765-1768` `position: absolute; left: 50%; top: calc(100% + 2px); transform: translateX(-50%)` |
| Inside chip tree | `HallChip.tsx:156-183` equipment sibling of icon/title inside canvas chip |
| No side-list component | Grep: no `redskapslista` / `hall-equipment-list` / `equipment-sidebar` |
| Not a tap target | `App.css:1773` `pointer-events: none`; `aria-hidden` on block (`HallChip.tsx:173`) |

### 10. Short title print-only on Golvklart screen — **PASS**

| Claim | Evidence |
| --- | --- |
| Screen hide | `App.css:1745-1747` `.hall-chip-title--print { display: none }` |
| Floor does **not** unhide title | Only equipment shown under `.is-floor` (`:1790-1793`); no `.is-floor … title--print` rule |
| Print shows title | `App.css:2383-2388` |
| Markup | `HallChip.tsx:158-161` print-only span comment + class |

### 11. Teknik-only hall.ts intact — **PASS**

| Claim | Evidence |
| --- | --- |
| Filter unchanged | `hall.ts:85-87` `blockType === 'techniques'`; `placeableItems` `:93-95` |
| Prune intact | `hall.ts:383+` `pruneHallPlacements` |
| File not in Slice 14 touch set | mtime **2026-09-24 14:30 CEST**; ship table lists only HallChip / App.css / blockMeta |

### 12. Slice 12–13 intact (markers, tap≠drag, Redigera redskap detail-only) — **PASS**

| Claim | Evidence |
| --- | --- |
| One marker per placement | `HallCanvas.tsx:169-179` `placed.map` → one `HallChip` per item |
| Drag ≠ detail | `HallChip.tsx:83,97-102,114-131` `suppressClickRef` set on dragstart; click ignored; 120ms clear |
| Compose from detail only | `HallBoard.tsx:529-537` `showStationEquipment` + `onEditEquipment` + `StationComposeSheet`; ActivityDetail CTA `:215-223` |
| No Passbyggaren compose | Grep: `StationComposeSheet` / `onEditEquipment` only under HallBoard + ActivityDetail |
| ActivityDetail / StationComposeSheet untouched | mtimes 2026-09-24 (pre–Slice 14) |

### 13. No CAD / pins — **PASS**

| Claim | Evidence |
| --- | --- |
| Text lines only | `HallChip.tsx:174-180` span text; no per-piece icon/pin on canvas |
| No placeable equipment entities | Recipe remains `SessionItem.stationEquipment` slots; hall placements unchanged |
| Docs/ship out of scope | Ship “No CAD pins”; no new pin/CAD UI in touched files |

### 14. Caption Schematisk hall — inte exakt mått — **PASS**

| Claim | Evidence |
| --- | --- |
| Locked string | `blockMeta.ts:168` `hallSchematicNote: 'Schematisk hall — inte exakt mått'` |
| Rendered on canvas | `HallCanvas.tsx:160` `<p className="hall-schematic-note">{UI.hallSchematicNote}</p>` |
| Untouched by Slice 14 logic | Caption path not modified in ship file list |

### 15. Phone CSS soft (~390px) — **PARTIAL**

| Claim | Evidence |
| --- | --- |
| Marker size preserved on phone | `App.css:2053-2058` `@media (max-width: 768px)` canvas chip stays **52×52** |
| Soft equipment typography | `App.css:1772-1779` `font-size: 0.58rem`, `max-width: 7.5rem`, muted color, `pointer-events: none` |
| Ellipsis lines | `App.css:1782-1787` |
| Gap for UI | No dedicated ~390px Golvklart visual smoke here — readability / non-blocking of marker tap needs UI checklist steps 8 |

### 16. Scope (no Netlify requirement etc.) — **PASS**

| Claim | Evidence |
| --- | --- |
| Ship explicitly out | `SLICE14-SHIPPED.md` “No Netlify”; Out of ship: Netlify, tip, side list, Förrådslista, CAD |
| No new Netlify/accounts/Förrådslista/compose-gate code in Slice 14 touch set | Grep app src: no Förrådslista / Netlify product path added; only ship doc mentions Netlify as out |
| Compose gate not forced | Optional tip skipped; quiet unset preserved |

### 17. Footer Träningsplaneraren · Slice 14 — **PASS**

| Claim | Evidence |
| --- | --- |
| Exact string | `blockMeta.ts:298` `footerSliceLabel: 'Träningsplaneraren · Slice 14'` |
| Rendered | `App.tsx:213-215` `<footer className="app-footer no-print">` → `{UI.footerSliceLabel}` |
| Print-hidden | `App.css:2291-2295` `.app-footer` / `.no-print` hidden in `@media print` |

---

## Fail-if cross-check (checklist “Fail if”)

| Fail-if | CODE status |
| --- | --- |
| Equipment-count badge on canvas | **clear** — no badge element |
| Redskap lines visible in **edit** | **clear in CSS** — `display: none` unless `.is-floor` / print (UI smoke confirms) |
| Unset/`[]` forced “inga redskap” on floor/print | **clear** |
| Förslag on floor/print without saved composition | **clear** |
| Count===1 always `1×` | **clear** — omit × |
| “+N till” or side list | **clear** |
| Short title on Golvklart **screen** | **clear** — print-only |
| CAD pins / Passbyggaren-only compose | **clear** |
| Caption / Teknik-only regress | **clear** |
| Footer not Slice 14 | **clear** |

---

## CODE lean summary

| # | Rule | CODE |
| --- | --- | --- |
| 1 | Golvklart shows redskap under markör | **PASS** |
| 2 | Print shows lines after short titles | **PASS** |
| 3 | undefined → quiet | **PASS** |
| 4 | [] → quiet | **PASS** |
| 5 | defaultStationEquipment not on floor/print | **PASS** |
| 6 | Edit: CSS hide; no badge | **PASS** |
| 7 | Format count===1 / count>1 | **PASS** |
| 8 | ≤8 lines; no +N till | **PASS** |
| 9 | Under markör not side list | **PASS** |
| 10 | Short title print-only on Golvklart screen | **PASS** |
| 11 | Teknik-only hall.ts intact | **PASS** |
| 12 | Slice 12–13 intact | **PASS** |
| 13 | No CAD/pins | **PASS** |
| 14 | Caption Schematisk hall… | **PASS** |
| 15 | Phone CSS soft | **PARTIAL** |
| 16 | Scope | **PASS** |
| 17 | Footer Slice 14 | **PASS** |

**Build:** exit **0**  
**CODE overall (lean):** **PASS** with rule **15 PARTIAL** (phone readability / tap reserved for UI smoke). No CODE FAILs.

---

## Gaps for UI verifier

Smoke path from APPROVED checklist (not run in this code pass):

1. Pass with ≥2 Teknik; compose one (trampett + landningsmatta); leave one unset; clear one to `[]`.
2. Hallöversikt **edit**: no equipment under markers, no badge (confirm CSS hide live).
3. **Golvklart**: composed shows lines; quiet stations silent; short titles **not** on screen.
4. count===1 → label only; count>1 → `n× …`.
5. Many slots (≤8): all lines, no “+N till”.
6. Tap composed markör → detail Redskap + **Redigera redskap**.
7. **Skriv ut** / print preview: short title + equipment after; quiet quiet; caption; edit chrome hidden.
8. Phone ~390px Golvklart: lines readable, tap still opens detail (**closes rule 15 PARTIAL**).
9. Build green — **already PASS exit 0**.
10. Reload draft → compositions persist; Golvklart mirrors.

---

## Evidence path

`/workspace/gymnastics-planner/verifier/slice-14-evidence-code.md`
