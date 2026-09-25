# Slice 18 — Code evidence pack (Verifier)

**Date:** 2026-09-25 19:50 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-18/verification-checklist.md` (APPROVED A–F) + `app/SLICE18-SHIPPED.md` + `docs/station-compose.sv.md` + `docs/redskap-forslag-seeds.sv.md` + `slice-18/decisions.md`  
**Scope:** CODE / static / build only — inspect + `npm run build`. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only under `verifier/`)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 45 modules; `dist/index.html` 0.97 kB; `index-Dvg9yjiG.css` 34.88 kB; `index-eJS4dxXh.js` 321.31 kB; built in ~248 ms |
| Errors | none | clean build stdout |
| Git history for Slice 13 byte-compare | **unavailable** (`NO_GIT`) | Compared four KEEP arrays to locked table in `slice-18/decisions.md` + Slice 13 verifier label table; mark as **intentional identical** |

### Files touched (Slice 18 ship — per `SLICE18-SHIPPED.md`)

| File | Role |
| --- | --- |
| `src/data/seedActivities.ts` | Five new Teknik `defaultStationEquipment` arrays; existing four unchanged |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 18 |
| `SLICE18-SHIPPED.md` | Ship notes |

### Untouched (regression spots — still present)

| Surface | Evidence |
| --- | --- |
| Quiet Golvklart redskap (Slice 14) | `HallChip.tsx` saved-only lines; `App.css` hide in edit / show `.is-floor` + print |
| Förrådslista (Slice 15) | `aggregateStationEquipment` omits unset/`[]`/förslag; `ForradslistaSheet.tsx` |
| Kom igång (Slice 16) | `CHECKLIST_TOTAL = 5`; `hasComposedEquipment` from saved non-empty only |
| Golvklart short titles (Slice 17) | `.hall-canvas.is-floor .hall-chip-title--print { display: block }` |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX or runtime needs UI smoke  
- **FAIL** — clear code violation  
- **N/A (code)** — checklist item not decidable from static code alone  
- **Uncertainty** — called out explicitly

---

## Task 1 — Exact `defaultStationEquipment` dump (all nine Teknik)

Source: `app/src/data/seedActivities.ts`. Count of `defaultStationEquipment:` keys in file = **9** (all Teknik). No non-Teknik seeds.

### KEEP — existing four (must be unchanged)

| activityId | Exact array (pieceId × count) | Lines |
| --- | --- | --- |
| `tech-ljushopp-satsbrada` | `eq-satsbrada`×1, `eq-landningsmatta`×1 | `185-188` |
| `tech-ljushopp-trampett` | `eq-trampett`×1, `eq-landningsmatta`×1 | `208-211` |
| `tech-satsbrada-volt-rygg` | `eq-satsbrada`×1, `eq-landningsmatta`×1 | `231-234` |
| `tech-trampett-volt-mattberg` | `eq-trampett`×1, `eq-mattberg`×1, `eq-landningsmatta`×1 | `254-258` |

**Baseline compare (no git):** Matches locked KEEP table in `slice-18/decisions.md:49-54` and Slice 13 evidence labels (`verifier/slice-13-evidence-code.md:134-137`: satsbräda+landningsmatta / trampett+landningsmatta / satsbräda+landningsmatta / trampett+mattberg+landningsmatta). **Verdict: intentional identical — PASS.**

### NEW — Slice 18 five (must match locked table)

| activityId | Exact array | Locked expected | Match | Lines |
| --- | --- | --- | --- | --- |
| `tech-flickis-kudde` | `eq-flickiskudde`×1, `eq-madrass`×1 | same | **YES** | `301-304` |
| `tech-rondat-flickis` | `eq-tumblingmatta`×1, `eq-landningsmatta`×1 | same | **YES** | `278-281` |
| `tech-falla-bakat-hojd` | `eq-plint`×1, `eq-madrass`×1 | same | **YES** | `324-327` |
| `tech-salto-fran-hojd` | `eq-plint`×1, `eq-landningsmatta`×1 | same | **YES** | `347-350` |
| `tech-handstaende-falla-rygg` | `eq-madrass`×1 | same | **YES** | `370-372` |

**Rule 1 (new seeds present) — PASS.**  
**Rule 2 (existing four untouched) — PASS** (content-identical to locked KEEP; git byte-diff N/A).

---

## Task 2 — Library still exactly 10 `eq-*`

| Claim | Evidence |
| --- | --- |
| `EQUIPMENT_PIECES` length 10 | `equipmentPieces.ts:12-36` — ids: trampett, satsbrada, plint, landningsmatta, tumblingmatta, madrass, mattberg, flickiskudde, airtrack, kon |
| `rg "id: 'eq-"` count | **10** |
| No custom library / new ids | No additional `eq-*` in seed arrays beyond the 10 |

**Rule 7 / Lock F library — PASS.**

---

## Task 3 — Golvklart / Förrådslista / print use saved only; Använd förslag / `[]` / Klar intact

### Saved-only consumers

| Surface | Mechanism | Evidence |
| --- | --- | --- |
| Golvklart under-markör | `hasEquipment` = `Array.isArray(item.stationEquipment) && length > 0`; lines from `item.stationEquipment` only — **never** `defaultStationEquipment` | `HallChip.tsx:63-81` |
| Edit canvas quiet | `.hall-chip--canvas .hall-chip-equipment { display: none }` | `App.css:1763-1765` |
| Floor show (saved lines only) | `.hall-canvas.is-floor … .hall-chip-equipment { display: flex }` | `App.css:1796-1799` |
| Print / Förrådslista aggregate | `aggregateStationEquipment` skips unset / empty; comment: does **NOT** include förslag / `defaultStationEquipment` | `equipmentPieces.ts:141-154` |
| HallBoard wires aggregate | `aggregateStationEquipment(listSessionItems(session))` → sheet + print section | `HallBoard.tsx:104`, `:549-557`, `:591-595` |

### Unset / förslag / Använd förslag / `[]` / Klar

| Path | Code behavior | Evidence |
| --- | --- | --- |
| Unset → show förslag + Använd förslag | `equipmentUnset = stationEquipment === undefined`; `showSuggested` when unset + non-empty `defaultStationEquipment` | `ActivityDetail.tsx:66-74`, `:158-186` |
| Använd förslag persists | `onUseSuggestedEquipment(suggested)` → `handleUseSuggested` → `updateItemStationEquipment` | `ActivityDetail.tsx:178-185`; `HallBoard.tsx:243-246`, `:574` |
| `[]` = cleared, no förslag | `showSuggested` false when not unset; empty UI via `showEmpty` | `ActivityDetail.tsx:70-78`, `:208-212` |
| Klar persists | `StationComposeSheet` `onSave={handleSaveEquipment}` → `updateItemStationEquipment` | `HallBoard.tsx:236-240`, `:579-588` |
| Place does **not** auto-apply | `createSessionItem` omits `stationEquipment` unless passed; `addItemToBlock` calls without it; `placeAt` only `upsertPlacement` (coords) | `session.ts:115-132`, `:306-310`; `HallBoard.tsx:157-167` |
| Compose sheet prefill ≠ persist | Opening sheet uses `detailItem.stationEquipment ?? defaultStationEquipment ?? []` as **initialSlots** only; persist only on Klar / Använd förslag | `HallBoard.tsx:581-586` |

**Rules 3–6 / Locks B–C (code) — PASS.**  
**PARTIAL (UI smoke):** Runtime tap path “unset → Golvklart omits → Använd förslag → includes” not exercised in browser here.

---

## Task 4 — Scope guards (no Passbyggaren compose; no badge/CAD; no auto-apply; caption; footer)

| Guard | Result | Evidence |
| --- | --- | --- |
| Compose entry = hall detail only | `StationComposeSheet` imported/used only in `HallBoard.tsx`; opened via `onEditEquipment={() => setComposeOpen(true)}` on hall `ActivityDetail` | `HallBoard.tsx:42`, `:573`, `:578-588` |
| No Passbyggaren compose | `rg StationComposeSheet\|onEditEquipment\|composeOpen` in `SessionBuilder.tsx` / `BlockCard.tsx` / `ActivityCard.tsx` → **no hits** | — |
| No equipment canvas badge | No `equipment-badge` / `har redskap` chrome; Erfaren/stub badges only | `HallChip.tsx` equipment is under-markör list, CSS-gated |
| No CAD | No CAD/measure UI; caption schematic | `blockMeta.ts:168` |
| No auto-apply on place | See Task 3 `placeAt` / `createSessionItem` | — |
| Caption unchanged | `hallSchematicNote: 'Schematisk hall — inte exakt mått'` rendered in `HallCanvas` | `blockMeta.ts:168`; `HallCanvas.tsx:160` |
| Footer Slice 18 | `footerSliceLabel: 'Träningsplaneraren · Slice 18'` → `App.tsx` footer | `blockMeta.ts:318`; `App.tsx:227` |

**Rules 8–9, 11 / Locks E–F — PASS.**

---

## Task 5 — Slice 14–17 intact (spot)

| Slice | Spot | Evidence | Verdict |
| --- | --- | --- | --- |
| 14 quiet redskap | Saved-only lines; hide edit; show floor/print | `HallChip.tsx:63-81`; `App.css:1763-1765`, `:1796-1799` | **PASS** |
| 15 Förrådslista | Sheet + aggregate omit förslag | `ForradslistaSheet.tsx`; `equipmentPieces.ts:141-154` | **PASS** |
| 16 Kom igång | `CHECKLIST_TOTAL = 5`; progress on saved non-empty only | `coachTips.ts:220-245`; `App.tsx:50-67` | **PASS** |
| 17 short titles | `.is-floor` shows `.hall-chip-title--print` | `App.css:1791-1794`; `HallCanvas.tsx:89`; `HallChip.tsx:158-161` | **PASS** |

**Rule 10 — PASS.**

---

## Task 6 — Build

`cd /workspace/gymnastics-planner/app && npm run build` → **exit 0** (see Environment).

**Rule 12 — PASS.**

---

## Locks A–F (CODE verdict)

| Lock | Topic | CODE verdict |
| --- | --- | --- |
| **A** | Seed all five remaining Teknik; keep existing four unchanged | **PASS** |
| **B** | No UX change to Använd förslag / unset vs `[]` / Klar | **PASS** (paths intact; no new chrome) |
| **C** | Golvklart / Förrådslista / print omit unset förslag | **PASS** (data paths); UI smoke **PARTIAL** |
| **D** | Thin Docs update (docs authority; not Builder code) | **PASS (docs present)** — `docs/station-compose.sv.md` + `docs/redskap-forslag-seeds.sv.md` carry nine-drill tables; code verifier notes docs on disk |
| **E** | Footer `Träningsplaneraren · Slice 18` | **PASS** |
| **F** | No library growth; no Passbyggaren compose; no badge/CAD; no auto-apply; caption unchanged | **PASS** |

---

## Checklist rules 1–12 (summary)

| # | Rule | Verdict |
| --- | --- | --- |
| 1 | New seeds present | **PASS** |
| 2 | Existing four untouched | **PASS** (intentional identical; no git) |
| 3 | Förslag when unset | **PASS** (code); UI smoke N/A here |
| 4 | Använd förslag persists | **PASS** (code); UI smoke N/A here |
| 5 | Unset quiet on floor | **PASS** (code); UI smoke N/A here |
| 6 | Cleared `[]` | **PASS** (code) |
| 7 | Library size 10 | **PASS** |
| 8 | Compose entry hall detail only | **PASS** |
| 9 | Scope (no badge/CAD/auto-apply/caption change) | **PASS** |
| 10 | Slice 14–17 intact | **PASS** |
| 11 | Footer Slice 18 | **PASS** |
| 12 | Build green | **PASS** |

---

## FAIL / uncertainty

### FAIL

**None** from static code / build.

### Uncertainty / PARTIAL

1. **No git history** — cannot byte-diff the four KEEP arrays against a Slice 13 commit; content matches locked decisions + Slice 13 evidence labels (cited as intentional identical).  
2. **UI smoke not run** — checklist smoke path (place unset new drills → confirm Golvklart/Förrådslista omit → Använd förslag → include; clear to `[]`) is **code-proven** but not browser-exercised in this pack.  
3. **Compose sheet prefill** — opening Redigera redskap with unset seeds pre-fills `initialSlots` from `defaultStationEquipment` (`HallBoard.tsx:581-584`). This is **not** auto-apply on place (Klar still required to persist). Confirm with UI smoke that coaches understand Klar vs cancel if relevant.

---

## Overall CODE verdict

**PASS (A–F code + build)** — evidence at `/workspace/gymnastics-planner/verifier/slice-18-evidence-code.md`.  
UI smoke remains a separate gate per checklist smoke path.
