# Slice 07 — Code evidence pack (Verifier)

**Date:** 2026-09-24 09:58 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-07/verification-checklist.md` + `app/SLICE07-SHIPPED.md` + `slice-07/content/golvklart-copy.sv.md`  
**Scope:** `npm run build`, types/libs/UI wiring inspection, Swedish string spot-check, regression spot-check — **not** full browser interaction / print preview glance  
**Product rewrite:** none (evidence only)

**Builder choices locked:** zoom = **+/−** (not pinch); `hallShowFlow` **persisted** (default true); `hallMode` **UI-only** (not on Session).

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build` → vite v8.3.0; 39 modules; `dist/index.html` 0.46 kB; `index-6mqqQoK4.css` 22.30 kB; `index-DkOm1oiK.js` 289.38 kB; built in ~193 ms |
| Errors | none | clean stdout; `EXIT_CODE=0` |
| Footer | Slice 07 | `App.tsx:61` → `{UI.appName} · Slice 07` |
| `index.html` lang | `sv` | `index.html:2`; no PDF CDN scripts |

---

## Legend

- **PASS** — satisfied from code with concrete evidence  
- **PARTIAL** — present in code; needs UI/browser confirmation  
- **FAIL** — clear violation (none found on code side)  
- **N/A** — explicit non-fail / out of scope / deferred

---

## Locked rules (summary)

| Locked rule | Verdict | Evidence |
| --- | --- | --- |
| Order source: BLOCK_ORDER then `item.order`; ranks among placed only | **PASS (code)** | `passOrder` walks `BLOCK_ORDER` then sorts by `item.order` (`hall.ts:66-75`); `stationRanks` increments only when `placedIds.has(item.id)` (`:82-96`) |
| Tray no numbers; canvas badges 1…N contiguous among placed | **PASS (code)** | Canvas passes `stationRank={ranks.get(item.id)}` (`HallCanvas.tsx:183`); tray `HallChip` omits `stationRank` (`HallBoard.tsx:363-370`); badge only when `typeof stationRank === 'number'` (`HallChip.tsx:85-88`) |
| Spatial OK (badges need not be canvas-contiguous) | **N/A (OK)** | ranking ignores x,y drop order — by design |
| Flow toggle Visa/Dölj; default ON; connectors pass order | **PASS (code) / PARTIAL (UI feel)** | Toggle `aria-pressed={showFlow}` labels Hide/Show (`HallBoard.tsx:232-239`); `isHallShowFlow` = `!== false` (`hall.ts:98-101`); `flowSegments` consecutive placed in `passOrder` (`:112-138`); SVG dashed lines (`HallCanvas.tsx:140-158`; `App.css:1659-1666`) |
| Flow layer does not block taps | **PASS** | `.hall-flow-layer { pointer-events: none }` (`App.css:1649-1656`); `aria-hidden` on SVG (`HallCanvas.tsx:145`); chip anchors `z-index: 5` vs flow `z-index: 3` |
| No hall reorder of Passbyggaren `order` | **PASS (code)** | Hall placement path is `upsertPlacement` → only mutates `hallPlacements` (`hall.ts:264-288`); no writes to `SessionItem.order` in `hall.ts` / `HallBoard` / `HallCanvas` / `HallChip`. Reorder remains Passbyggaren `moveItemWithinBlock` (`session.ts:131-152`) |
| Phone sticky tray | **PASS (code) / PARTIAL (UI)** | `hall-tray--sticky` when `isNarrow` (`HallBoard.tsx:330`); CSS `position: sticky; bottom: 0` @ ≤768px (`App.css:1702-1711`); canvas wrap `max-height: 62vh; overflow: auto` (`:1713-1717`) |
| Pan vs chip drag; Placera här kept | **PASS (code) / PARTIAL (UI)** | canvas `touch-action: pan-x pan-y`; chips `:not(.is-readonly) { touch-action: none }` (`App.css:1719-1726`); place-mode + `placeAt` → `upsertPlacement` snap path unchanged (`HallBoard.tsx:71-82`; `HallCanvas.tsx:72-77`) |
| Zoom +/− view-only (no coord mutate) | **PASS (code)** | Local `viewZoom` state only (`HallBoard.tsx:43,118-124`); wrapper `width: ${viewZoom * 100}%` (`HallCanvas.tsx:81-86`); never written into placements / `saveDraft` |
| Remove separate from chip tap→detail | **PASS (code)** | Chip `onClick` → `openDetail` for placed (`HallBoard.tsx:309-319`); remove is separate button with `stopPropagation` (`HallChip.tsx:107-119`); floor hides remove (`HallCanvas.tsx:190-191`) |
| Golvklart UI-only mode; hides tray/drag | **PASS (code)** | `useState<HallMode>('edit')` — **not** on `Session` (`types.ts:50-63`; `HallBoard.tsx:37`); floor hides tray (`:328`), sets `draggable={!isFloor}`, blocks drop/place (`HallCanvas.tsx:60-61,184`); exit / print CTAs (`HallBoard.tsx:178-194`) |
| Unplaced soft banner; entry not blocked | **PASS (code)** | `enterFloor` has no unplaced guard (`:103-108`); banner when `unplaced.length > 0` via `hallUnplacedBannerText` (`:211-215`; `blockMeta.ts:202-205`) |
| Print = `window.print` + `@media print`; no PDF lib | **PASS** | `handlePrint` → `window.print()` (`HallBoard.tsx:114-116`); `@media print` A4 landscape hides chrome (`App.css:1744-1828`); `package.json` deps = react/react-dom only; `index.html` no PDF CDN; no jspdf/pdfkit/html2pdf in app src |
| Experienced badge + detail warning in floor | **PASS (code)** | Chip still shows `UI.hallExperiencedShort` regardless of mode (`HallChip.tsx:100-104`); floor chip tap → `openDetail` → `ActivityDetail readOnly` with warning (`HallBoard.tsx:309-312,382-387`; `ActivityDetail.tsx:58-70`) |
| Storage key unchanged; `hallShowFlow` optional persist; snap/presets untouched | **PASS** | Key `gymnastics-planner-draft-v1` (`session.ts:17`); `toggleFlow` persists `hallShowFlow` (`HallBoard.tsx:98-101`); migrate preserves boolean (`hall.ts:412-419`); `snapPlacement` / `HALL_PRESET_ORDER` / Mattberg / `generic-trupp` alias unchanged |
| Scope guard (CAD, share, hall reorder, PDF) | **N/A (OK)** | absence must not FAIL — confirmed absent |
| Regression 01–06 | **PASS (code spot-check)** | see Regression section |

**Code-side lean:** **PASS** — no FAIL candidates from static inspection. Sticky-tray reachability, pan-vs-drag feel, print preview chrome hide, and out-of-sequence badge spatial look remain for UI verifier.

---

## Stationsordning / flow (`hall.ts`)

| Behavior | Verdict | Citation |
| --- | --- | --- |
| `passOrder` = BLOCK_ORDER then `item.order` asc | **PASS** | `hall.ts:66-75`; `BLOCK_ORDER` = Samling→…→Lek (`blockMeta.ts:3-9`) |
| `stationRanks` 1…N among placed only | **PASS** | `hall.ts:82-96`; skips unplaced; contiguous renumber when placements shrink (recomputed each render) |
| `flowSegments` consecutive placed in pass order | **PASS** | `hall.ts:112-138`; empty if flow off or `<2` placed |
| `isHallShowFlow` default true when absent | **PASS** | `hall.ts:98-101` (`!== false`) |
| `listSessionItems` = `passOrder` | **PASS** | `hall.ts:77-80` |

### Chip badge / tray

| Item | Verdict | Citation |
| --- | --- | --- |
| Badge only when ranked | **PASS** | `HallChip.tsx:85-88` |
| a11y `"N. {title}"` | **PASS** | `HallChip.tsx:48-52,77` |
| Tray no `stationRank` prop | **PASS** | `HallBoard.tsx:363-370` |
| Hint Stationsordning följer passet | **PASS** | header + tray (`HallBoard.tsx:268,342-344`; `UI.hallStationOrderHint`) |

---

## Golvklart / print / phone

| Item | Verdict | Citation |
| --- | --- | --- |
| `hallMode` UI-only (`edit` \| `floor`) | **PASS** | `HallCanvas.tsx:12`; `useState` (`HallBoard.tsx:37`); **absent** from `Session` (`types.ts:50-63`) |
| Always open in edit | **PASS** | initial `'edit'`; never restored from draft |
| CTA Golvklart → floor | **PASS** | `enterFloor` (`HallBoard.tsx:103-108,240-246`) |
| Hides tray / Hallayout / flow toggle / Placera här / remove | **PASS** | tray gated `!isFloor` (`:328`); edit header vs floor header (`:178-270`); canvas `showRemove={!isFloor}` |
| Banner `{n} övningar ej placerade` / singular | **PASS** | `hallUnplacedBannerText` (`blockMeta.ts:202-205`) |
| Avsluta golvklart → edit | **PASS** | `exitFloor` (`HallBoard.tsx:110-112,181-187`) |
| Skriv ut | **PASS** | `window.print()` (`:114-116,188-194`) |
| Print CSS keeps schematic + chips + ranks + title | **PASS (code) / PARTIAL (preview)** | hides `.no-print`, tray, zoom, floor actions; shows `.print-only` title + canvas/chips/ranks/caption/flow (`App.css:1744-1828`) |
| Zoom +/− aria Zooma in/ut; view-only | **PASS** | narrow-only bar (`HallBoard.tsx:278-299`); `viewZoom` CSS width only |
| Sticky tray @ ≤768 | **PASS (code) / PARTIAL (UI)** | `App.css:1702-1711` |
| Primary taps ≥44px | **PASS (code)** | `.hall-tap-target` + phone overrides for zoom/remove/actions (`App.css:1588-1591,1728-1741`); preset select min-height 44 (`:1554-1556`) |
| Remove ≠ detail tap | **PASS** | separate × button + `stopPropagation` (`HallChip.tsx:107-119`) |

---

## Data / persistence

| Item | Verdict | Citation |
| --- | --- | --- |
| Storage key `gymnastics-planner-draft-v1` | **PASS** | `session.ts:17` |
| Placements keyed by `sessionItemId`, x,y ∈ [0,1] | **PASS** | `types.ts:98-107`; `clamp01` in snap/sanitize |
| Optional `hallShowFlow`; default true | **PASS** | `types.ts:61-62`; `isHallShowFlow`; toggle `persist({...session, hallShowFlow})` |
| `hallMode` not required on Session | **PASS** | not in type; React state only |
| Reload: placements + presets; hall opens edit | **PASS (code)** | `loadDraft` → `migrateHallFields` (`session.ts:95-101`); `hallMode` always starts `'edit'` |
| Snap / three presets / Mattberg / `generic-trupp` | **PASS** | `snapPlacement` (`hall.ts:229-262`); `HALL_PRESET_ORDER` three ids; Mattberg zones; alias (`hall.ts:44-59`) |
| Reorder in Passbyggaren updates ranks/flow | **PASS (code)** | ranks/flow derived from live `passOrder` each render |

---

## Swedish strings vs Docs pack

| Key | Docs | Code `UI` | Verdict |
| --- | --- | --- | --- |
| `hallFloorReady` | Golvklart | `blockMeta.ts:186` | **PASS** |
| `hallExitFloor` | Avsluta golvklart | `:188` | **PASS** |
| `hallPrint` | Skriv ut | `:189` | **PASS** |
| `hallUnplacedBanner` / One | `{n} övningar…` / `1 övning…` | `:190-191` + helper | **PASS** |
| `hallShowFlow` / `hallHideFlow` | Visa flöde / Dölj flöde | `:193-194` | **PASS** |
| `hallStationOrderHint` | Stationsordning följer passet | `:195` | **PASS** |
| `hallZoomIn` / `hallZoomOut` | Zooma in / Zooma ut | `:196-197` | **PASS** |
| Caption | Schematisk hall — inte exakt mått | `:165` + `HallCanvas.tsx:160` | **PASS** |
| `hallExperiencedShort` | Erfaren | `:172` | **PASS** |
| `hallRemove` / `hallPlaceHere` | Ta bort från hall / Placera här | `:166,168` | **PASS** |

No English primary chrome for Floor ready / Show flow / Print view found in UI keys.

---

## Technical / scope

| Item | Verdict | Citation |
| --- | --- | --- |
| No PDF library / CDN | **PASS** | `package.json` deps react only; `index.html` local module only; no app-src matches for jspdf/pdfkit/html2pdf |
| `npm run build` | **PASS** | exit 0 |
| Flow `pointer-events` | **PASS** | `App.css:1655` |
| No new App route | **PASS** | same `HallBoard` screen; mode flag |
| Pinch zoom absent | **N/A (OK)** | builder chose +/− — checklist allows either |

---

## Regression (01–06 spot-check)

| Prior behavior | Verdict | Citation |
| --- | --- | --- |
| Home → Nytt pass / mall / Fortsätt | **PASS** | `Home.tsx` uses `UI.newSession` / `startFromTemplate` / `continueDraft` |
| Five blocks + soft mismatch | **PASS** | `BLOCK_ORDER` five; `MismatchBanner` / `mismatchMessage` still in builder stack |
| 28 drills + VisualIcon + experienced warning | **PASS** | `seedActivities.ts` header count 28; 28 `id:` matches; `VisualIcon` in `HallChip`; detail warning intact |
| Hallöversikt CTA; empty disabled; back | **PASS** | `SessionBuilder.tsx:208-221`; empty pass UI (`HallBoard.tsx:157-173`); back `onBack` |
| Tray default; orphan prune; template clears placements | **PASS** | `pruneHallPlacements` / `clearHallPlacements` still in `hall.ts` + session paths |
| Six zones; snap; three presets; `generic-trupp` | **PASS** | unchanged Slice 06 paths |
| Export stub “Kommer snart” | **PASS** | `SessionBuilder.tsx` export tooltip `UI.comingSoon` |

---

## UI risks for human / browser verifier (not code FAILs)

1. **Badge when placing out of sequence** — place #3 then #1 spatially; confirm badges still follow pass order among placed (code guarantees; glance needed).  
2. **Flow connectors** — dashed muted lines chip-center→center in pass order; toggle off clears; preference survives reload via `hallShowFlow`.  
3. **No hall reorder** — drag chip → return to Passbyggaren → Flytta upp/ner order unchanged.  
4. **Sticky tray @ ~390px** — tray reachable while canvas pans; sticky CSS present but layout feel is UI.  
5. **Zoom coords** — +/− enlarge; reload draft → same x,y (zoom is view state only).  
6. **Golvklart** — tray/drag gone; banner if unplaced; Avsluta returns edit; Erfaren visible.  
7. **Print preview** — schematic + chips + numbers + title; app chrome hidden (manual browser glance).  
8. **Experienced** — floor chip → detail → warning still shows.

---

## Verdict

**Code verification: PASS**

No locked-rule FAIL from static inspection. Build exit 0. Deferred/UI-only checks listed above must not be treated as code FAILs per checklist “Do not fail” / PARTIAL guidance.
