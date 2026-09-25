# Slice 08 — Code evidence pack (Verifier)

**Date:** 2026-09-24 10:32 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-08/verification-checklist.md` + `app/SLICE08-SHIPPED.md` + `slice-08/content/polish-copy.sv.md`  
**Scope:** `npm run build`, source/CSS/string inspection, scope guard, regression 01–07 spot-check — **not** full browser viewport / print-preview glance  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build` → vite v8.3.0; 39 modules; `dist/index.html` 0.46 kB; `index-D5Krmhhv.css` 22.50 kB; `index-7xWo26IJ.js` 289.77 kB; built in 194 ms; `EXIT_CODE=0` |
| Errors | none | clean stdout |
| Footer (source) | **PASS** | `App.tsx:61` → `{UI.appName} · Slice 08` with `UI.appName = 'Träningsplaneraren'` (`blockMeta.ts:105`) → rendered **Träningsplaneraren · Slice 08** |
| Bundle footer | **PASS** | dist JS children `[_.appName,\` · Slice 08\`]`; no `Slice 01`–`07` in `src/` |
| Historical docs | **PASS** | `SLICE01`–`SLICE07-SHIPPED.md` retained; not mass-renamed |

---

## Legend

- **PASS** — satisfied from code with concrete evidence  
- **PARTIAL** — present in code; needs UI/browser confirmation  
- **FAIL** — clear violation (none found on code side)  
- **N/A** — explicit non-fail / out of scope

---

## 1. Slice 08 acceptance (locked)

| Locked rule | Verdict | Evidence |
| --- | --- | --- |
| Footer exactly **Träningsplaneraren · Slice 08**; no historical mass-rename | **PASS (code) / PARTIAL (live)** | `App.tsx:61`; `UI.appName` (`blockMeta.ts:105`); historical `SLICE01`–`07` files untouched |
| `Placering sparad` / `hallPlacementSaved` absent from active UI path; placement/preset silent | **PASS** | `rg` over `src/` + production bundle: **absent**. `HallBoard.persist` = `onChange` + `saveDraft` only — **no** `showToast` (`HallBoard.tsx:87-89`, callers `:100,:109,:114,:121`) |
| Explicit builder save still **Utkast sparat**; no new placement toast | **PASS** | `savedToast: 'Utkast sparat'` (`blockMeta.ts:140`); `SessionBuilder.tsx:159` `showToast(UI.savedToast)`; no replacement placement-status copy in `UI` |
| ≤768px **Ej placerade** bottom-reachable while canvas pans | **PASS (code) / PARTIAL (UI @390/768)** | Sticky tray `.hall-tray--sticky` (`HallBoard.tsx:363`); CSS `position: sticky; bottom: 0` + canvas `padding-bottom` / `scroll-padding-bottom: var(--hall-tray-reserved)` (`App.css:1702-1719`); measured `--hall-tray-reserved` via ResizeObserver (`HallBoard.tsx:68-85,327-330`) |
| Phone tray safe-area + canvas bottom reservation ≥ full tray height | **PASS (code) / PARTIAL (device safe-area)** | Tray `padding-bottom: max(12px, env(safe-area-inset-bottom, 0px))` (`App.css:1710`); JS sets `--hall-tray-reserved` to measured `trayHeight` px when narrow+edit (`HallBoard.tsx:327-330`); fallback `14rem` |
| Tray horizontal scroll, Placera här, snap, move, remove still wired | **PASS (code)** | Tray list row + overflow retained (`App.css:1528+`); `hallPlaceHere` still in UI; place/remove/preset persist paths unchanged; tray `no-print` only |
| Zoom a11y Swedish: **Zooma** / **Zooma in** / **Zooma ut**; no English Zoom chrome | **PASS** | `UI.hallZoom/In/Out` (`blockMeta.ts:195-197`); group `aria-label={UI.hallZoom}`; buttons `hallZoomOut` / `hallZoomIn` (`HallBoard.tsx:301-318`); bundle has Zooma strings; no `Zoom in`/`Zoom out`/`"Zoom"` English chrome (only identifier `hallZoom` / `viewZoom` / vendor `msZoom`) |
| Print exactly one title/meta (`.print-only` preferred) | **PASS (code) / PARTIAL (print preview)** | Single `.hall-print-title.print-only` with title · minutes · date (`HallBoard.tsx:293-298`); screen `display:none`, print `display:block` (`App.css:1698-1700,1773-1777`); floor `.hall-header-main` hidden in print (`:1788-1791`); edit `.hall-header:not(.hall-header--floor)` hidden (`:1784-1786`) |
| Print hides edit/tray/actions; keeps schematic/zones/caption/numbers/flow/banner | **PASS (code) / PARTIAL (preview)** | Hide: `.app-footer`, `.no-print`, floor/header actions, preset row, zoom, `.hall-tray`, chip-remove (`App.css:1758-1770`); keep: canvas/zones/chips/rank/schematic note print-color-adjust (`:1825-1833`); flow stroke (`:1835-1838`); unplaced banner forced visible (`:1793-1795`); print via `window.print()` only (`HallBoard.tsx:136`) |
| Caption exactly **Schematisk hall — inte exakt mått** (edit/Golvklart/print) | **PASS** | `hallSchematicNote` exact string (`blockMeta.ts:165`); rendered once in shared `HallCanvas.tsx:160` (edit + floor); print keeps `.hall-schematic-note` |

---

## 2. Scope guard

| Guard | Verdict | Evidence |
| --- | --- | --- |
| No keyboard drag/move (P08-04) | **PASS** | `HallChip` `onKeyDown` only Enter/Space → `onClick` (`HallChip.tsx:78-82`); no arrow/WASD placement move |
| No removal of valid Utkast / historical docs (P08-06) | **PASS** | Storage key + migrate path intact; `SLICE01`–`07` docs present |
| No caption rewrite; no soft snap/zone animation (P08-07/09) | **PASS** | Caption string unchanged; no new snap animation CSS/JS found in Slice 08 path |
| No new drills / coach filter / onboarding / CAD / exact measures / hall reorder / share / PDF / new route (P08-10) | **PASS** | Still 28 seed activities / 2 `experiencedCoachOnly: true`; `View = 'home' \| 'builder' \| 'hall'` only (`App.tsx:14`); `package.json` deps = react/react-dom only; no jspdf/html2canvas; `window.print` CSS path |
| No snap/preset/station-order/flow/storage-key redesign; no persist `hallMode` | **PASS** | Key `gymnastics-planner-draft-v1` (`session.ts:17`); `hallMode` = `useState` only (`HallBoard.tsx:37`) — absent from `types.ts` / `session.ts` / `hall.ts` persist shape; presets `standard-trupp` / `tavling-linjer` / `liten-hall` + `generic-trupp` alias (`hall.ts:44-57`) |

---

## 3. Accessibility / interaction (code)

| Check | Verdict | Evidence |
| --- | --- | --- |
| Swedish hall labels agree | **PASS** | Golvklart / Ej placerade / Placera här / Visa flöde / Dölj flöde / Avsluta golvklart in `UI` (`blockMeta.ts:161-193`) and wired in `HallBoard` |
| ≥44px primary targets @≤768 | **PASS (code)** | `min-height/width: 44px` on header/floor/zoom/remove (`App.css:1731-1744`) |
| Empty canvas pan vs chip drag; Placera här | **PASS (code) / PARTIAL (feel)** | `touch-action: pan-x pan-y` on canvas; chips `touch-action: none` (`App.css:1722-1728`) |
| Experienced chips + warning path | **PASS** | `Erfaren` short (`HallChip.tsx:100-104`); detail warning strings retained |
| Print = DOM/CSS not canvas bitmap | **PASS** | `window.print` + `@media print`; no canvas export APIs |

---

## 4. Regression 01–07 (code spot-check)

| Regression | Verdict | Evidence |
| --- | --- | --- |
| **01** Home / builder entry | **PASS (code)** | `Home.tsx` Nytt pass / Starta från mall / Fortsätt senaste pass; views home→builder→hall (`App.tsx`) |
| **02** Pass structure / totals | **PASS (code)** | `BLOCK_ORDER` five blocks (`blockMeta.ts:3-9`); `MismatchBanner` + item-sum soft mismatch retained |
| **03** Activity library / safety | **PASS (code)** | 28 seed activity ids; 2 experienced-only; `VisualIcon` still used in cards/chips |
| **04** Hall entry / navigation | **PASS (code)** | CTA disabled when `countSessionItems < 1` + `hallCtaDisabled` (`SessionBuilder.tsx:208-221`); back `hallBack` / `onBack` → builder |
| **05** Placements / tray lifecycle | **PASS (code)** | `getUnplacedItems`, `pruneHallPlacements`, `upsertPlacement` / remove / Placera här paths present (`hall.ts`, `HallBoard`) |
| **06** Zones / snap / presets | **PASS (code)** | Six zones per preset (open/trampett/tumbling/vault/mattberg/mats); three presets; `generic-trupp` alias |
| **07** Flow / Golvklart / phone baseline | **PASS (code)** | `stationRanks` / `isHallShowFlow` / floor mode / zoom / sticky tray / print call retained |

---

## 5. Build and print smoke (code)

| Check | Verdict | Evidence |
| --- | --- | --- |
| `npm run build` | **PASS** | exit 0 (see above) |
| ~390 / 768 tray geometry | **PARTIAL** | CSS/JS reservation present; **live viewport not exercised in this pack** |
| Print preview single title + no edit chrome | **PARTIAL** | CSS hide/show rules present; **browser print preview not opened** |
| Print retains schematic/zones/caption/numbers/flow/banner | **PASS (code) / PARTIAL (preview)** | keep rules cited above |
| Storage key + reload → placements/presets; hall opens edit | **PASS (code)** | key unchanged; `hallMode` defaults `'edit'` on mount (`HallBoard.tsx:37`); not persisted |

---

## Copy authority cross-check (`polish-copy.sv.md`)

| String | In code |
| --- | --- |
| Zooma / Zooma in / Zooma ut | `UI.hallZoom*` ✓ |
| Locked Golvklart / Ej placerade / Placera här / Visa·Dölj flöde / Avsluta golvklart / Schematisk hall — inte exakt mått | present ✓ |
| Remove Placering sparad / hallPlacementSaved; keep Utkast sparat | absent / kept ✓ |

---

## Overall (code)

**Code-side lean: PASS** — all locked Slice 08 source checks and scope guards PASS; `npm run build` exit 0; regression 01–07 markers still present. No FAIL candidates from static inspection.

**UI risks (need live confirmation):**

1. **Footer live** — confirm rendered chrome shows exactly `Träningsplaneraren · Slice 08` (source/bundle composition verified).  
2. **Silent save no toast** — place/move/remove/preset change must show no toast; only builder **Spara utkast** → **Utkast sparat**.  
3. **Tray reachability + safe-area @ ~390px and 768px** — sticky tray stays reachable; last drop area scrolls above tray; notch/home-indicator inset visible where emulated.  
4. **Zoom a11y** — accessible names Zooma / Zooma in / Zooma ut; no English Zoom chrome in AT/UI.  
5. **Print preview single title** — Golvklart print preview: one title/meta strip; edit/tray/actions hidden; schematic, zones, caption, numbers, flow, unplaced banner retained.

**Overall PASS** for code/build verification pending those UI risks (checklist overall PASS still requires UI smoke where marked PARTIAL).
