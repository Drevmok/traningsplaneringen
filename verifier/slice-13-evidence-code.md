# Slice 13 — Code evidence pack (Verifier)

**Date:** 2026-09-24 15:35 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-13/verification-checklist.md` (APPROVED) + `app/SLICE13-SHIPPED.md` + `docs/station-compose.sv.md`  
**Scope:** CODE / build only — inspect, build, evidence. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 44 modules; `dist/index.html` 0.97 kB; `index-DBfiSaZ_.css` 32.40 kB; `index-9ohW6tAb.js` 316.63 kB; built in ~232 ms |
| Errors | none | clean build stdout |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX needs UI smoke  
- **FAIL** — clear code violation

---

## Locked rules (CODE) 1–15

### 1. Equipment library (all 10; Mattberg one piece) — **PASS**

| Claim | Evidence |
| --- | --- |
| Catalog length 10 | `equipmentPieces.ts:12-36` `EQUIPMENT_PIECES` — exactly: Trampett, Satsbräda, Plint, Landningsmatta, Tumblingmatta, Madrass, Mattberg, Flickiskudde, Airtrack, Kon |
| Stable ids | `eq-trampett` … `eq-kon` match Docs lock |
| Mattberg = one piece | `:27-28` comment + single `{ id: 'eq-mattberg', labelSv: 'Mattberg', … }` |
| Compose picks from catalog | `StationComposeSheet.tsx:222-246` maps `EQUIPMENT_PIECES` into library grid |

### 2. Compose → one marker (no per-piece pins) — **PASS**

| Claim | Evidence |
| --- | --- |
| Recipe lives on SessionItem | `types.ts:52-64` `SessionItem.stationEquipment?: StationEquipmentSlot[]` — not separate hall entities |
| Canvas = one HallChip per placement | `HallCanvas.tsx:169-179` `placed.map(({ item, placement }) => … <HallChip …>)` keyed by `item.id` |
| Placements still sessionItemId only | `types.ts:124-133` `HallPlacement` has no pieceId; `hall.ts` upsert/prune unchanged |
| No per-piece pins in UI | No component places equipment pieces on canvas; compose is sheet-only |

### 3. Detail Redskap lists pieces with counts — **PASS**

| Claim | Evidence |
| --- | --- |
| Section gated for hall | `ActivityDetail.tsx:154-238` `showStationEquipment` → heading `UI.stationEquipmentHeading` (`'Redskap'`) |
| Saved list with counts | `:190-205` maps slots → `stationEquipmentLabelText(label, s.count)` |
| Label helpers | `blockMeta.ts:364-369` count===1 → `stationEquipmentOne`; else `{n}× {label}` |
| Empty / förslag paths | `:158-187` suggested; `:208-212` empty microcopy |
| Wired from HallBoard | `HallBoard.tsx:522-533` `showStationEquipment` + `stationEquipment={detailItem.stationEquipment}` |

### 4. Drag ≠ detail (HallChip suppress) — **PASS**

| Claim | Evidence |
| --- | --- |
| Suppress flag still present | `HallChip.tsx:24-27` comment; `:57` `suppressClickRef` |
| Set on dragstart | `:88-94` `suppressClickRef.current = true` |
| Click ignored after drag | `:71-76` `handleActivate` returns early when suppress |
| Cleanup on dragend | `:100-105` 120ms timeout clears leftover |

### 5. Compose entry (hall detail only; Klar persists; no Passbyggaren) — **PASS**

| Claim | Evidence |
| --- | --- |
| Entry CTA | `ActivityDetail.tsx:215-224` **Redigera redskap** when `onEditEquipment` |
| Hall-only wiring | `HallBoard.tsx:522-546` readOnly detail + `setComposeOpen(true)` + `StationComposeSheet` |
| Klar persists | `StationComposeSheet.tsx:114-116` `onSave(sanitize…)`; `HallBoard.tsx:226-230` `updateItemStationEquipment` + `persist` |
| Stäng discards (confirm if dirty) | `StationComposeSheet.tsx:104-111` |
| No Passbyggaren compose | Grep: `StationComposeSheet` / `onEditEquipment` / `showStationEquipment` only under HallBoard + ActivityDetail — **not** SessionBuilder / Passbyggaren |

### 6. Teknik-only (hall.ts filter unchanged) — **PASS**

| Claim | Evidence |
| --- | --- |
| Placeable = techniques | `hall.ts:83-87` `isPlaceableItem` → `blockType === 'techniques'` |
| Tray / ranks / flow / prune | `:93-95` `placeableItems`; `:101-114` `stationRanks`; `:132-156` `flowSegments`; `:383-391` `pruneHallPlacements` |
| Ship: hall.ts untouched by design | `SLICE13-SHIPPED.md:67-69` — techniques filter still present; no compose logic added to hall.ts |

### 7. Erfaren on tile + detail — **PASS**

| Claim | Evidence |
| --- | --- |
| Canvas corner | `HallChip.tsx:136-144` `.hall-chip-exp--mark` when `experienced && isCanvas` |
| Tray meta | `:151-154` |
| Detail badge + warning | `ActivityDetail.tsx:112-125` `.experienced-badge` + `.experienced-warning` |
| Seed flags still set | e.g. `seedActivities.ts:280` `tech-rondat-flickis` `experiencedCoachOnly: true` |

### 8. Marker: no equipment-count badge; icon-first compact — **PASS** (visual footprint **PARTIAL→UI**)

| Claim | Evidence |
| --- | --- |
| Size ~52px / max 56 | `App.css:1718-1732` `.hall-chip--canvas` width/height/min 52px, max-width 56px |
| Phone keeps compact | `App.css:2019-2025` “do not inflate to text-chip phone sizes” |
| No eq-count badge in DOM | `HallChip.tsx` canvas branch: rank + icon + print title + Erfaren only — **no** equipment count element |
| `hasEquipment` = a11y only | `HallChip.tsx:54-64` → `hallTileA11yText(…, { hasEquipment })`; `blockMeta.ts:262-264`, `:334-347` `…WithEquipment` strings — not a canvas pill |
| Grep clean | no `equipment-badge` / `eq-count` / `har redskap` in HallChip or App.css |

### 9. Tray / phone CSS soft — **PASS** (live ~390px **PARTIAL→UI**)

| Claim | Evidence |
| --- | --- |
| Sticky tray phone | `App.css:2186-2204` `.hall-tray--sticky` + canvas scroll padding |
| Horizontal tray list ≤768 | `App.css:1993-2008` |
| Compose sheet phone | `App.css:2571-2588` full-width sheet; Klar/Stäng min-height 44px; library 2-col (<480) / 3-col |
| Stepper tap targets | `App.css:2490-2511` min 40px |

### 10. Golvklart / Teknik flow intact — **PASS**

| Claim | Evidence |
| --- | --- |
| Flow segments Teknik-only | `hall.ts:132-156` walks `placeableItems` |
| Ranks among placed Teknik | `hall.ts:101-114` |
| HallBoard still has floor mode / tips | `HallBoard.tsx:63-65`, `TIP_HALL_FLOW_GOLVKLART` import `:10` |
| No Slice-13 change to placement math | compose persists on SessionItem only |

### 11. No add-to-pass from hall detail — **PASS**

| Claim | Evidence |
| --- | --- |
| Add actions gated | `ActivityDetail.tsx:241-280` `{!readOnly && onAdd && (…)}` |
| Hall opens readOnly without onAdd | `HallBoard.tsx:522-526` `<ActivityDetail … readOnly …>` — no `onAdd` prop |

### 12. Selective defaults ONLY on four drills — **PASS**

| Activity id | Defaults | Evidence |
| --- | --- | --- |
| `tech-ljushopp-satsbrada` | satsbräda + landningsmatta | `seedActivities.ts:185-188` |
| `tech-ljushopp-trampett` | trampett + landningsmatta | `:208-211` |
| `tech-satsbrada-volt-rygg` | satsbräda + landningsmatta | `:231-234` |
| `tech-trampett-volt-mattberg` | trampett + mattberg + landningsmatta | `:254-258` |
| **Not** on rondat-flickis / flickis-kudde / fall bakåt / salto / handstående | no `defaultStationEquipment` key | `:263-356` (and rest of Teknik) |
| Count of seed keys | **exactly 4** | repo-wide grep of `defaultStationEquipment:` in `seedActivities.ts` = 4 |

### 13. Scope (no CAD / accounts / cloud / Passbyggaren compose / badge) — **PASS**

| Out of scope | Code check |
| --- | --- |
| No CAD / exact meters | no measure/CAD UI; caption still schematic |
| No accounts / cloud / Netlify in app code | compose = local draft via `saveDraft` / `localStorage` (`session.ts:19`, `:92-94`) |
| No Passbyggaren compose entry | see rule 5 |
| No marker equipment badge | see rule 8 |
| No full drill-library expansion | only selective defaults on 4 existing Teknik |

### 14. Footer Träningsplaneraren · Slice 13 — **PASS**

| Claim | Evidence |
| --- | --- |
| Locked string | `blockMeta.ts:295` `footerSliceLabel: 'Träningsplaneraren · Slice 13'` |
| Rendered | `App.tsx:213-216` `<footer className="app-footer no-print">` → `{UI.footerSliceLabel}` |

### 15. Caption Schematisk hall — inte exakt mått unchanged — **PASS**

| Claim | Evidence |
| --- | --- |
| Exact string | `blockMeta.ts:168` `hallSchematicNote: 'Schematisk hall — inte exakt mått'` |
| Canvas render | `HallCanvas.tsx:160` `{UI.hallSchematicNote}` |

---

## Cross-checks (also requested)

### undefined vs `[]` semantics — **PASS**

| Semantics | Evidence |
| --- | --- |
| Documented on type | `types.ts:58-63` undefined = unset (förslag OK); `[]` = cleared; non-empty = saved |
| createSessionItem leaves unset | `session.ts:128-131` only sets when arg !== undefined |
| Detail UI | `ActivityDetail.tsx:66-82` `equipmentUnset = stationEquipment === undefined`; suggested only when unset + seed; empty when `[]` or unset-without-seed |
| Sanitize preserves `[]` | `equipmentPieces.ts:123-124` “Explicit empty array is valid” |
| migrate preserves undefined | `session.ts:143-144` skip when undefined / key absent; array path sanitizes (invalid non-array → `[]`) |

### Soft caps 8 slots / count ≤9 — **PASS**

| Cap | Evidence |
| --- | --- |
| Constants | `equipmentPieces.ts:5-6` `STATION_EQUIPMENT_MAX_SLOTS = 8`, `MAX_COUNT = 9` |
| Sanitize clamps | `:104`, `:111-114`, `:118` |
| Compose UI | `StationComposeSheet.tsx:63`, `:72`, `:76`, `:93`, `:190`, `:212-215` `composeMaxReached` |

### migrate / sanitize — **PASS**

| Path | Evidence |
| --- | --- |
| `sanitizeStationEquipment` | `equipmentPieces.ts:86-125` — drop unknown ids, clamp, merge dupes, cap slots |
| `migrateSessionEquipment` | `session.ts:139-169` |
| loadDraft applies migrate | `session.ts:97-105` `migrateHallFields(migrateSessionEquipment(parsed))` |
| Klar / Använd förslag | `session.ts:172-187` `updateItemStationEquipment` |

---

## CODE lean scorecard

| # | Rule | CODE |
| --- | --- | --- |
| 1 | Equipment library (10; Mattberg one) | **PASS** |
| 2 | Compose → one marker | **PASS** |
| 3 | Detail Redskap + counts | **PASS** |
| 4 | Drag ≠ detail suppress | **PASS** |
| 5 | Compose entry hall-only / Klar / no Passbyggaren | **PASS** |
| 6 | Teknik-only hall.ts | **PASS** |
| 7 | Erfaren tile + detail | **PASS** |
| 8 | Marker compact; no eq badge | **PASS** (pixel look → UI) |
| 9 | Tray / phone CSS soft | **PASS** (live 390px → UI) |
| 10 | Golvklart Teknik flow | **PASS** |
| 11 | No add-to-pass hall detail | **PASS** |
| 12 | Selective defaults (4 only) | **PASS** |
| 13 | Scope | **PASS** |
| 14 | Footer Slice 13 | **PASS** |
| 15 | Caption unchanged | **PASS** |

**Overall CODE:** **PASS** (all 15 locked rules satisfied in code; build exit 0).  
**Gaps for UI smoke (non-blocking for CODE):** live drag-after-drop; compose at ~390px; marker looks icon-first; reload draft keeps composition; Golvklart visual ranks.

---

## Gaps / notes

1. UI smoke not run in this pass (CODE-only charter).  
2. `HallChip` optional a11y `…WithEquipment` is intentional Docs lock — **not** a canvas badge.  
3. Compose sheet dirty Stäng uses `window.confirm` (documented deviation in SHIPPED).  
4. No Netlify / hosting check (out of scope).
