# Slice 15 — Code evidence pack (Verifier)

**Date:** 2026-09-25 11:37 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-15/verification-checklist.md` (APPROVED 2026-09-25) + `app/SLICE15-SHIPPED.md` + `docs/forradslista.sv.md`  
**Scope:** CODE / build only — inspect, build, optional aggregate unit smoke. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 45 modules; `dist/index.html` 0.97 kB; `index-Db9oX7lS.css` 34.76 kB; `index-LVuC7gVl.js` 320.09 kB; built in ~190 ms |
| Aggregate unit smoke | **PASS** | `npx tsx` inline: omit unset/`[]`; unknown ignored; 1+1 Landningsmatta → 2; format `n×`; sum 9+9=18 unclamped; library order; footer/caption/empty-hint strings |
| Errors | none | clean build + unit stdout |

### Files touched (Slice 15 ship — mtimes 2026-09-25 ~11:35 CEST)

| File | Role |
| --- | --- |
| `src/data/equipmentPieces.ts` | `AggregatedEquipmentRow` + `aggregateStationEquipment` |
| `src/data/blockMeta.ts` | Förrådslista UI keys; `footerSliceLabel` → Slice 15 |
| `src/components/ForradslistaSheet.tsx` | **New** — read-only bottom sheet |
| `src/components/HallBoard.tsx` | Edit + Golvklart CTAs; sheet mount; print block |
| `src/App.css` | Sheet + print styles; phone soft; print hide chrome |
| `SLICE15-SHIPPED.md` | Ship notes |

### Untouched (regression spots)

| File | mtime (CEST) | Note |
| --- | --- | --- |
| `src/lib/hall.ts` | 2026-09-24 14:30 | Teknik filter / prune intact |
| `src/components/HallChip.tsx` | 2026-09-25 09:43 | Slice 12–14 markers / under-markör (Slice 14 ship) |
| `src/components/ActivityDetail.tsx` | 2026-09-24 15:33 | Detail **Redigera redskap** only |
| `src/components/StationComposeSheet.tsx` | 2026-09-24 15:32 | Compose sheet unchanged |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX needs UI smoke  
- **FAIL** — clear code violation

---

## Locked rules (CODE) 1–19

### 1. Aggregate merge — **PASS**

| Claim | Evidence |
| --- | --- |
| Helper sums by `pieceId` | `equipmentPieces.ts:147-175` `aggregateStationEquipment` — Map accumulate `(map.get ?? 0) + n` |
| Walks session items | `HallBoard.tsx:103-106` `aggregateStationEquipment(listSessionItems(session))` |
| Non-empty only | `:154` `if (!Array.isArray(eq) \|\| eq.length === 0) continue` |
| Unit | 1+1 Landningsmatta → `{ count: 2 }` |

### 2. Labels from EQUIPMENT_PIECES; unknown ignored — **PASS**

| Claim | Evidence |
| --- | --- |
| Known only | `:156-157` `getEquipmentPiece(slot.pieceId)`; `if (!piece) continue` |
| Label from library | `:171` `labelSv: piece.labelSv` |
| Library = 10 Swedish pieces | `EQUIPMENT_PIECES` `:12-36` Trampett…Kon |
| Unit | unknown `eq-nope` dropped; trampett kept |

### 3. Format count===1 / count>1 n× — **PASS**

| Claim | Evidence |
| --- | --- |
| Helper | `blockMeta.ts:380-388` `stationEquipmentLabelText` — count===1 → `stationEquipmentOne` `{label}`; else `stationEquipmentCount` `{n}× {label}` |
| Sheet uses it | `ForradslistaSheet.tsx:59` |
| Print uses it | `HallBoard.tsx:557` |
| Templates | `blockMeta.ts:275-276` |
| Unit | `"Trampett"` / `"2× Landningsmatta"` |

### 4. Quiet omit undefined/[]; no defaultStationEquipment/förslag in sum — **PASS**

| Claim | Evidence |
| --- | --- |
| Omit unset/`[]` | `equipmentPieces.ts:153-154` |
| Aggregate signature | Only reads `item.stationEquipment` — never `defaultStationEquipment` |
| Förslag still detail-only | `ActivityDetail.tsx:66` `suggested = activity.defaultStationEquipment`; compose seed `HallBoard.tsx:582-584` — **not** fed to aggregate |
| Comment lock | `equipmentPieces.ts:142-144` |
| Unit | `[{}, undefined, []]` → `[]` |

### 5. Empty state nudge mentions Redigera redskap — **PASS**

| Claim | Evidence |
| --- | --- |
| Empty copy | `blockMeta.ts:304-306` `forradslistaEmpty` + `forradslistaEmptyHint` includes **Redigera redskap** |
| Sheet renders | `ForradslistaSheet.tsx:50-54` empty branch |
| No inventory language | Grep: no “vi har N”; intro is “Ta med från förrådet:” (print lead-in only) |

### 6. Edit Hallöversikt CTA Förrådslista → sheet — **PASS** (UI open/close soft)

| Claim | Evidence |
| --- | --- |
| Edit header CTA | `HallBoard.tsx:376-383` `btn-secondary` + `UI.forradslistaOpen` when `!isFloor` |
| Opens sheet | `onClick={() => setForradOpen(true)}`; state `:76` |
| Sheet mount | `:591-596` `{forradOpen && <ForradslistaSheet … onClose={() => setForradOpen(false)} />}` |

### 7. Golvklart CTA same sheet — **PASS** (UI soft)

| Claim | Evidence |
| --- | --- |
| Floor header CTA | `HallBoard.tsx:316-323` same `setForradOpen(true)` + same label/aria |
| Same sheet instance | single `forradOpen` + one `<ForradslistaSheet rows={forradRows} />` |

### 8. Read-only sheet (no +/−/remove/add) — **PASS**

| Claim | Evidence |
| --- | --- |
| Sheet API | `ForradslistaSheet.tsx` props: `rows` + `onClose` only |
| No compose controls | Grep sheet: no `composeIncrease`/`Decrease`/`Remove`/`Lägg till`/`+`/`−` |
| Close paths | Stäng button `:40-47`; backdrop click `:28-29`; `no-print` chrome `:24` |
| Returns to prior surface | `setForradOpen(false)` only — does not change `hallMode` |

### 9. Library order sort — **PASS**

| Claim | Evidence |
| --- | --- |
| Emit loop | `equipmentPieces.ts:168-173` `for (const piece of EQUIPMENT_PIECES)` |
| Unit | trampett → madrass → kon (not input order) |

### 10. Print block when non-empty; quiet empty — **PASS** (print preview UI soft)

| Claim | Evidence |
| --- | --- |
| Gated render | `HallBoard.tsx:548-562` `{forradRows.length > 0 && ( <section className="forradslista-print print-only">…)}` |
| After schematic+caption | Print section follows `hall-layout` block; caption lives in `HallCanvas.tsx:160` |
| Screen hidden / print shown | `App.css:2712-2714` `display: none`; `:2761-2765` `@media print` `.forradslista-print.print-only { display: block !important }` |
| Sheet chrome hidden in print | `:2756-2758` backdrop/`station-compose-backdrop` `display: none !important` |

### 11. Empty does not block Golvklart — **PASS**

| Claim | Evidence |
| --- | --- |
| `enterFloor` ungated | `HallBoard.tsx:188-194` — no `forradRows` / equipment check |
| CTA always enabled | Edit Golvklart button `:384-390` always rendered (no disabled on empty aggregate) |
| Empty sheet reachable | CTA always visible both modes; sheet shows empty nudge when `rows.length === 0` |

### 12. Teknik-only hall.ts intact — **PASS**

| Claim | Evidence |
| --- | --- |
| Filter | `hall.ts:83-86` `isPlaceableItem` → `blockType === 'techniques'` |
| Placeable set / prune | `:93-95`, `:383+` `pruneHallPlacements` |
| mtime | 2026-09-24 14:30 — untouched by Slice 15 |

### 13. Slice 12–14 intact — **PASS** (interaction soft for UI)

| Claim | Evidence |
| --- | --- |
| One marker / Erfaren | `HallChip.tsx` canvas chip; `has-erfaren` class `:107` |
| Tap ≠ drag | `HallChip.tsx:35-36,115-128` suppress-click after drag |
| Redigera redskap detail-only | `ActivityDetail.tsx:220-223` `UI.stationEquipmentEdit`; no Passbyggaren compose entry (SessionBuilder/KomIgangCard grepped clean of forradslista/Redigera) |
| Under-markör floor | `HallChip.tsx:171-183` + `App.css:1791` `.hall-canvas.is-floor … display: flex` |
| Edit clean (no badge / lines hidden) | `App.css:1763-1764` canvas equipment `display: none` in edit; no equipment-count badge classes |
| Compose unchanged | `StationComposeSheet.tsx` mtime 2026-09-24 15:32 |

### 14. No CAD / pins / inventory / custom — **PASS**

| Claim | Evidence |
| --- | --- |
| No inventory copy | Grep src: no “vi har N”; no custom “eget redskap” field |
| Fixed library only | Sheet lists aggregated known pieces; compose still `EQUIPMENT_PIECES` |
| No pins / CAD UI | No new pin/CAD components; caption unchanged (rule 15) |
| Print intro OK | “Ta med från förrådet:” is packing lead-in, not stock count |

### 15. Caption Schematisk hall — inte exakt mått — **PASS**

| Claim | Evidence |
| --- | --- |
| Copy | `blockMeta.ts:168` exact string |
| Render | `HallCanvas.tsx:160` `{UI.hallSchematicNote}` |
| Unit | string assert OK |

### 16. Phone CSS soft — **PASS** (layout at ~390px = UI gap)

| Claim | Evidence |
| --- | --- |
| Bottom sheet phone | `App.css:2737-2752` `@media (max-width: 768px)` sheet `max-width:100%`, `border-radius` top, backdrop `align-items: flex-end`, Stäng `min-height/width: 44px` |
| Sheet shell | `:2642-2650` max-height `min(85svh, 720px)`; list readable `1rem` rows |
| Hall CTA tap targets | existing `hall-tap-target` on both Förrådslista buttons |

### 17. Scope — **PASS**

| Claim | Evidence |
| --- | --- |
| No Netlify in ship | `SLICE15-SHIPPED.md` “No Netlify”; no deploy scripts added this slice |
| No Kom igång compose gate | `KomIgangCard.tsx` unchanged checklist (no compose/forrad step) |
| No accounts | no auth UI added |
| Optional tip skipped | no `tipForradslista` wiring (non-blocking) |

### 18. Footer Träningsplaneraren · Slice 15 — **PASS**

| Claim | Evidence |
| --- | --- |
| UI key | `blockMeta.ts:311` `footerSliceLabel: 'Träningsplaneraren · Slice 15'` |
| Render | `App.tsx:213-216` footer `no-print` + `{UI.footerSliceLabel}` |
| Unit | string assert OK |

### 19. Multi-station sum can exceed per-station max 9 — **PASS**

| Claim | Evidence |
| --- | --- |
| No clamp in aggregate | `equipmentPieces.ts:163` raw sum; comment `:144` “does NOT clamp” |
| Per-station max still compose-only | `STATION_EQUIPMENT_MAX_COUNT = 9` used in `sanitizeStationEquipment` / compose — not in aggregate |
| Unit | 9+9 Kon → count **18** |

---

## Summary table (CODE)

| # | Rule | CODE |
| --- | --- | --- |
| 1 | Aggregate merge | **PASS** |
| 2 | Labels / unknown ignore | **PASS** |
| 3 | Format 1 / n× | **PASS** |
| 4 | Quiet omit; no förslag in sum | **PASS** |
| 5 | Empty nudge Redigera redskap | **PASS** |
| 6 | Edit CTA → sheet | **PASS** |
| 7 | Golvklart CTA → same sheet | **PASS** |
| 8 | Read-only sheet | **PASS** |
| 9 | Library order | **PASS** |
| 10 | Print non-empty / quiet empty | **PASS** |
| 11 | Empty ≠ block Golvklart | **PASS** |
| 12 | Teknik-only intact | **PASS** |
| 13 | Slice 12–14 intact | **PASS** |
| 14 | No CAD/pins/inventory/custom | **PASS** |
| 15 | Caption unchanged | **PASS** |
| 16 | Phone CSS soft | **PASS** |
| 17 | Scope | **PASS** |
| 18 | Footer Slice 15 | **PASS** |
| 19 | Sum may exceed max 9 | **PASS** |

**CODE overall:** **PASS** (19/19 locked rules evidenced in code; build exit 0; unit smoke green).  
**Overall product PASS** still requires separate **UI smoke** (checklist smoke path 1–8, 10) — not run in this pack.

---

## UI gaps (for human / UI verifier)

Not exercised here; recommend:

1. Compose ≥2 Teknik stations with mixed equipment → edit **Förrådslista** shows merged sums; unset station omitted.  
2. count===1 label-only vs multi `n×` on real sheet.  
3. Stäng → back on edit; markers still Slice 12 (no badge); Slice 14 lines hidden in edit.  
4. Golvklart: under-markör intact; same aggregate via CTA.  
5. Empty path: empty nudge; Golvklart still enterable.  
6. Print preview: block present iff non-empty; caption present; chrome hidden.  
7. Phone ~390px: CTA + bottom sheet usable.  
8. Reload draft → compositions persist; Förrådslista still matches.

---

## Non-blocking (honored)

- Kom igång compose checklist (idea 2)  
- Optional row icons / `tipForradslista`  
- Partial “N stationer saknar redskap” banner  
- Tap row → jump to station  
- Netlify republish  
- Editing counts from packing list
