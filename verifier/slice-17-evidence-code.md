# Slice 17 — Code evidence pack (Verifier)

**Date:** 2026-09-25 13:31 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-17/verification-checklist.md` (APPROVED 2026-09-25) + `app/SLICE17-SHIPPED.md` + `docs/golvklart-short-titles.sv.md` + `docs/golvklart-redskap.sv.md` + `slice-17/decisions.md` + `slice-17/screen-spec.md`  
**Scope:** CODE / static / build only — inspect + `npm run build`. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only under `verifier/`)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 45 modules; `dist/index.html` 0.97 kB; `index-Dvg9yjiG.css` 34.88 kB; `index-CVs3OS4v.js` 320.88 kB; built in ~182 ms |
| Errors | none | clean build stdout |
| Unit tests for floor title CSS | **none found** | No `*.test.*` / `*.spec.*` under `app/src` covering Slice 17 |

### Files touched (Slice 17 ship — mtimes 2026-09-25 ~13:30 CEST)

| File | Role |
| --- | --- |
| `src/App.css` | Show `.hall-chip-title--print` on `.is-floor`; offset `.hall-chip-equipment` (mirror print `top`) |
| `src/components/HallChip.tsx` | Comment update only (title already in DOM) |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 17 |
| `SLICE17-SHIPPED.md` | Ship notes |

### Untouched (regression spots — mtimes CEST)

| File | mtime | Note |
| --- | --- | --- |
| `src/lib/coachTips.ts` | 2026-09-25 12:08 | Slice 16 `CHECKLIST_TOTAL = 5` |
| `src/components/ForradslistaSheet.tsx` | 2026-09-25 11:35 | Slice 15 Förrådslista |
| `src/components/HallCanvas.tsx` | (pre–Slice 17) | `.is-floor` class wiring; caption render |
| `src/App.tsx` | (pre–Slice 17 footer consumer) | Renders `UI.footerSliceLabel` in `app-footer no-print` |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX or runtime needs UI smoke  
- **FAIL** — clear code violation  
- **N/A (code)** — checklist item not decidable from static code alone  
- **Uncertainty** — called out explicitly

---

## Locks A–F (CODE)

### A — Golvklart `.is-floor` shows title; edit Hallöversikt stays hidden — **PASS**

| Claim | Evidence |
| --- | --- |
| Default (edit) hide | `App.css:1745-1747` — `.hall-chip--canvas .hall-chip-title--print { display: none; … }` |
| Golvklart show | `App.css:1791-1794` — `.hall-canvas.is-floor .hall-chip--canvas .hall-chip-title--print { display: block; }` |
| `.is-floor` only on floor mode | `HallCanvas.tsx:57` `isFloor = hallMode === 'floor'`; `:89` className appends ` is-floor` only when `isFloor` |
| Title already in DOM | `HallChip.tsx:158-161` always renders `<span className="hall-chip-title hall-chip-title--print">` on canvas (comment cites Slice 17) |
| No edit-only show selector | `rg` on `App.css`: only three show paths for title — base `display:none` (1746), `.is-floor` block (1792), `@media print` `display: block !important` (2389). **No** edit-canvas show rule. |

Matches docs matrix (`golvklart-short-titles.sv.md` Visibility) and screen-spec hooks.

### B — Stack: title then redskap; floor equipment `top` mirrors print — **PASS**

| Claim | Evidence |
| --- | --- |
| Title `top` (under markör) | `App.css:1750` `top: calc(100% + 2px)` on `.hall-chip-title--print` |
| Edit/base equipment same top (hidden) | `App.css:1768` equipment also `top: calc(100% + 2px)` when hidden |
| Floor equipment offset | `App.css:1796-1799` `.hall-canvas.is-floor … .hall-chip-equipment { display: flex; top: calc(100% + 0.85rem + 4px); }` |
| Print equipment offset (mirror) | `App.css:2397-2399` inside `@media print` (opens `2286`): same `top: calc(100% + 0.85rem + 4px)` |
| Title remains at `100% + 2px` on floor | Floor rule only sets `display: block` for title (1792-1794); does **not** change title `top` → title and equipment no longer share the same visible `top` on floor |

**PARTIAL (UI smoke):** pixel overlap at ~390px / wrapping cannot be proven from CSS alone; stack offsets match print by construction.

### C — Existing ellipsis chrome (~9–10ch) — **PASS**

| Claim | Evidence |
| --- | --- |
| Screen ellipsis + 9ch | `App.css:1755-1758` `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 9ch` |
| Print 10ch | `App.css:2389-2392` print `max-width: 10ch` |
| No second title string / floor max-width nudge | Floor rule (1792-1794) does not redefine `max-width`; title text still `{title}` from `activity?.title` (`HallChip.tsx:52`, `:160`) |

### D — Title shows even when redskap quiet/empty — **PASS**

| Claim | Evidence |
| --- | --- |
| Title not gated on equipment | `HallChip.tsx:158-161` title span always rendered for canvas; equipment block only if `equipmentLines.length > 0` (`:172-183`) |
| Quiet → empty lines | `HallChip.tsx:63-81` — `hasEquipment` requires non-empty array; else `equipmentLines = []` → no `.hall-chip-equipment` node |
| CSS show independent of equipment | `.is-floor` title `display: block` (`App.css:1792-1794`) has no `:has(.hall-chip-equipment)` or similar gate |

### E — Footer `Träningsplaneraren · Slice 17` — **PASS**

| Claim | Evidence |
| --- | --- |
| Exact string | `blockMeta.ts:318` `footerSliceLabel: 'Träningsplaneraren · Slice 17'` |
| Rendered | `App.tsx:225-227` `<footer className="app-footer no-print">` → `{UI.footerSliceLabel}` |
| Footer stays `no-print` | `App.tsx:225` + print hide list includes `.app-footer` / `.no-print` (`App.css:2297-2301`) |

### F — Caption unchanged; no badge/CAD; print OK; Slice 11–16 intact — **PASS** (phone readability **PARTIAL** / **N/A**)

| Claim | Evidence |
| --- | --- |
| Caption string | `blockMeta.ts:168` `hallSchematicNote: 'Schematisk hall — inte exakt mått'` |
| Caption rendered | `HallCanvas.tsx:160` `{UI.hallSchematicNote}` |
| No hall canvas badge | `rg badge` on `HallChip.tsx` / `HallCanvas.tsx` / `HallBoard.tsx`: **no hits** |
| No CAD language in app/src | `rg -ni '\bCAD\b|blueprint'` under `app/src`: **no hits** |
| Optional tip not required / not wired | `rg tipGolvklart` under `app/src`: **no hits** (no `tipGolvklartShortTitles`) |
| Print title+equipment still present | `@media print` `App.css:2389-2405` — title `display: block !important`, equipment `display: flex !important` + mirrored `top` |
| Slice 15 Förrådslista present | `ForradslistaSheet.tsx:10-11`; `blockMeta.ts:304-315` Förrådslista copy; CSS block `App.css:2643+`; HallBoard open/print paths intact |
| Slice 16 `CHECKLIST_TOTAL=5` | `coachTips.ts:12-17` five keys incl. `composeStationEquipment`; `:245` `CHECKLIST_TOTAL = 5`; `KomIgangCard.tsx` imports/uses it |
| Quiet redskap omit “Inga redskap” under markör | Under-markör path never uses `stationEquipmentEmpty` (`HallChip.tsx:172` gate); `stationEquipmentEmpty` remains detail/compose copy only (`blockMeta.ts:277`) |
| count===1 omit × | `blockMeta.ts:283` `stationEquipmentOne: '{label}'`; `stationEquipmentLabelText` `:391` returns one-form when `count === 1` |

**Phone ~390px (checklist #10):** **N/A (code) / PARTIAL** — 52px marker + 9ch ellipsis remain (`App.css:2271-2275`, `:1758`); readability needs UI smoke.

---

## Locked checklist rules (CODE) 1–12

| # | Rule | CODE verdict | Notes |
| --- | --- | --- | --- |
| 1 | Golvklart titles | **PASS** | Lock A |
| 2 | Edit canvas hides titles | **PASS** | Lock A |
| 3 | Print title + redskap | **PASS** | Print rules unchanged |
| 4 | Stack (B) | **PASS** (+ PARTIAL visual) | Floor `top` mirrors print |
| 5 | Empty redskap (D) | **PASS** | Title ungated |
| 6 | Slice 14 quiet | **PASS** | No under-markör “Inga redskap” |
| 7 | Slice 14–16 intact | **PASS** | Förrådslista + CHECKLIST_TOTAL=5 + compose path present |
| 8 | Caption | **PASS** | Exact string |
| 9 | Scope | **PASS** | No edit titles / badge / CAD / idea-1 ship |
| 10 | Phone ~390px | **N/A (code)** | Needs UI smoke |
| 11 | Footer (E) | **PASS** | Exact Slice 17 string |
| 12 | Build | **PASS** | exit 0 |

---

## Exact App.css selectors (task 1 citation)

**Show on Golvklart / hide on edit:**

```css
/* App.css:1745-1747 — edit (default) */
.hall-chip--canvas .hall-chip-title--print {
  display: none;
  …

/* App.css:1791-1794 — Golvklart */
.hall-canvas.is-floor .hall-chip--canvas .hall-chip-title--print {
  display: block;
}
```

**Equipment top offset on floor mirroring print:**

```css
/* App.css:1796-1799 — floor */
.hall-canvas.is-floor .hall-chip--canvas .hall-chip-equipment {
  display: flex;
  top: calc(100% + 0.85rem + 4px);
}

/* App.css:2397-2399 — @media print */
.hall-chip--canvas .hall-chip-equipment {
  display: flex !important;
  top: calc(100% + 0.85rem + 4px);
  …
}
```

---

## FAIL / uncertainty list

| Item | Status |
| --- | --- |
| Code FAILs | **None** |
| Build FAIL | **None** (exit 0) |
| Uncertainty | Pixel-perfect non-overlap + ~390px readability = **UI smoke only** (PARTIAL / N/A) |
| Verifier before ship? | Ship file present (`app/SLICE17-SHIPPED.md`); Builder claimed green — this run reconfirmed build exit 0 |

---

## Overall CODE verdict

| Lock | Verdict |
| --- | --- |
| **A** | **PASS** |
| **B** | **PASS** (visual stack PARTIAL pending UI smoke) |
| **C** | **PASS** |
| **D** | **PASS** |
| **E** | **PASS** |
| **F** | **PASS** (phone readability N/A/PARTIAL) |
| **Build** | **PASS** exit **0** |

**Evidence path:** `/workspace/gymnastics-planner/verifier/slice-17-evidence-code.md`

Overall code gate for A–F + build: **PASS**. Formal Overall PASS still requires UI smoke per checklist smoke path (edit hide, Golvklart titles + stack, quiet title-only, print, phone).
