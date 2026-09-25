# Slice 14 — SHIPPED

**Date:** 2026-09-25 (Europe/Stockholm)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-14/` (Golvklart + print redskap under markör)  
**Copy authority:** `docs/golvklart-redskap.sv.md` (Docs lock; pack mirror `slice-14/content/golvklart-redskap.sv.md`)

## Goal delivered

Golvklart (floor mode) and `@media print` show composed redskap lines **under** each numbered Teknik station markör, sourced only from saved non-empty `SessionItem.stationEquipment`. Edit Hallöversikt canvas stays clean (no under-marker list, no equipment badge). Footer → Slice 14. No Netlify. No Verifier ping from Builder.

## Features shipped

1. **Under-markör redskap (HallChip canvas)** — When `stationEquipment` is a non-empty array, resolve up to soft cap **8** slots via `getEquipmentPiece` + `stationEquipmentLabelText`. Unknown ids ignored. Render `<div className="hall-chip-equipment" aria-hidden>` with one line per resolved slot. DOM may exist in edit; **CSS hides** it outside floor + print.

2. **Format** — Reuse Slice 13 helper: count===1 → `{label}` only; count>1 → `{n}× {label}` (Unicode ×). No “+N till” truncation. Text only — no per-piece icons.

3. **Visibility matrix**
   - **Edit canvas:** marker icon + rank (+ Erfaren); short title print-only; equipment lines **HIDDEN** (`display: none`). No equipment-count badge.
   - **Golvklart screen** (`.hall-canvas.is-floor`): equipment lines **SHOWN** when non-empty; short title stays **print-only** (not forced on screen).
   - **Print:** short title shown + equipment lines stacked **after** short title when non-empty.

4. **Quiet states** — `undefined` and `[]` → no equipment block. Seed `defaultStationEquipment` / förslag **not** promoted onto floor/print.

5. **Layout / interaction** — Compact muted text (~0.55–0.65rem), centered under 52px tile, `pointer-events: none`, max-width to limit neighbor overlap. Hit target unchanged. Lines are **not** a tap/compose target; tap markör → detail; compose stays **Redigera redskap** from detail only.

6. **UI keys** — Footer exact `Träningsplaneraren · Slice 14`. Optional aliases `hallFloorEquipmentOne` / `hallFloorEquipmentCount` wired in `blockMeta` (same strings as stationEquipment*); render path reuses `stationEquipmentLabelText`. Optional tip `tipGolvklartEquipment` and `hallFloorEquipmentA11y` **skipped** (non-required).

7. **Preserved** — Teknik-only + prune; Slice 12 markers / tap≠drag / Erfaren / print short titles; Slice 13 compose + detail Redskap; caption **Schematisk hall — inte exakt mått**.

## Files touched

| File | Change |
|---|---|
| `src/components/HallChip.tsx` | Resolve + render `.hall-chip-equipment` lines when non-empty |
| `src/App.css` | Hide in edit; show under `.hall-canvas.is-floor`; show in `@media print` below title |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 14; optional `hallFloorEquipmentOne` / `Count` aliases |

## Locks confirmed

| # | Lock | Status |
|---|---|---|
| 1 | Source only `item.stationEquipment` when non-empty array | ✓ |
| 2 | Quiet `undefined` / `[]`; no förslag on floor/print | ✓ |
| 3 | Format count===1 omit ×; count>1 `n× label` | ✓ |
| 4 | All lines ≤8; no “+N till” | ✓ |
| 5 | Under markör, not side list; text only; pointer-events none | ✓ |
| 6 | Edit: no lines, no badge | ✓ |
| 7 | Golvklart: lines yes; short title print-only | ✓ |
| 8 | Print: title + lines after | ✓ |
| 9 | Caption unchanged | ✓ (untouched) |
| 10 | Footer Slice 14 | ✓ |
| 11 | Teknik-only / Slice 12–13 / Erfaren / drag≠detail | ✓ preserved |
| 12 | No Netlify / no Passbyggaren compose / no CAD pins | ✓ |

## Deviations

None vs APPROVED pack. Optional tip + expanded floor a11y list string skipped (explicitly non-blocking).

## Smoke notes (Builder)

- Code path: non-empty → lines; unset/`[]` → no DOM block; edit CSS `display:none`; floor `.is-floor` shows; print stacks below `.hall-chip-title--print`.
- Interactive browser Golvklart / print preview not run in this Builder turn — Verifier owns checklist after Planner ping.
- `hasEquipment` still feeds existing Slice 13 a11y (“Redskap angivna”) only; **no** visible badge.

## Build

```
cd /workspace/gymnastics-planner/app && npm run build
→ tsc -b && vite build — GREEN (2026-09-25)
```

## Out of this ship

- Netlify deploy  
- Messaging Verifier / Planner  
- tipGolvklartEquipment modal/strip  
- hallFloorEquipmentA11y expanded name  
- Side list / “+N till” / marker badge / CAD pins / Passbyggaren compose  
