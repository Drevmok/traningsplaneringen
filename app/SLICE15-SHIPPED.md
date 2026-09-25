# Slice 15 — SHIPPED

**Date:** 2026-09-25 (Europe/Stockholm, CEST)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-15/` (read-only Förrådslista)  
**Copy authority:** `docs/forradslista.sv.md` (Docs lock)

## Goal delivered

Read-only **Förrådslista** — pass-wide packing list that aggregates non-empty `SessionItem.stationEquipment` by `pieceId` (sum counts), shown in a bottom sheet from Hallöversikt **edit** and **Golvklart**, plus a compact print block when non-empty. Footer → Slice 15. No Netlify. No Verifier / Docs / Planner / agent pings from Builder.

## Features shipped

1. **Aggregate helper** — `aggregateStationEquipment(items)` in `equipmentPieces.ts`. Walks items; omits `undefined` / `[]`; ignores unknown ids; never includes förslag / `defaultStationEquipment`; does **not** clamp sums to `STATION_EQUIPMENT_MAX_COUNT`; emits rows in **library order** (`EQUIPMENT_PIECES`).

2. **UI keys** — Docs strings wired into `blockMeta` UI: title/open/close/aria/sub/empty/emptyHint/emptyHintShort/printHeading/printIntro. Line format reuses `stationEquipmentLabelText` (Slice 13). `footerSliceLabel` → `Träningsplaneraren · Slice 15`. Optional tip `tipForradslista` **skipped** (non-required).

3. **`ForradslistaSheet`** — Phone bottom sheet (compose-sheet shell pattern): title + optional sub + list **or** empty nudge mentioning **Redigera redskap** + Stäng. Read-only — no +/− / remove / Lägg till / custom add. Backdrop click closes. `no-print` chrome.

4. **HallBoard CTAs** — `btn-secondary` **Förrådslista** in edit header (near Visa flöde / Golvklart) and Golvklart header (near Avsluta / Skriv ut). Same sheet state. Closing returns to prior surface (edit or floor). CTA always visible; empty sheet reachable; does not block Golvklart; does not auto-open compose.

5. **Print** — When aggregate non-empty: compact `.forradslista-print` block **after** schematic+caption (`hall-layout`), with heading + intro («Ta med från förrådet:») + lines. Quiet when empty (no empty heading on paper). Slice 14 under-markör lines preserved. Sheet chrome hidden via `no-print` / print hide rules.

6. **Preserved** — Teknik-only + prune; Slice 12 markers / tap≠drag / Erfaren / print short titles; Slice 13 compose + detail **Redigera redskap**; Slice 14 floor/print under-markör; caption **Schematisk hall — inte exakt mått**.

## Files touched

| File | Change |
|---|---|
| `src/data/equipmentPieces.ts` | `AggregatedEquipmentRow` + `aggregateStationEquipment` |
| `src/data/blockMeta.ts` | Förrådslista UI keys; `footerSliceLabel` → Slice 15 |
| `src/components/ForradslistaSheet.tsx` | **New** — read-only bottom sheet |
| `src/components/HallBoard.tsx` | Edit + Golvklart CTAs; sheet mount; print block |
| `src/App.css` | Sheet styles; print block; hide sheet chrome in print |
| `SLICE15-SHIPPED.md` | This file |

## Locks A–F confirmed

| # | Lock | Status |
|---|---|---|
| **A** | Entry from **both** Hallöversikt edit and Golvklart (same sheet) | ✓ |
| **B** | Read-only phone **bottom sheet** | ✓ |
| **C** | Sort = **library order** (`EQUIPMENT_PIECES`) | ✓ |
| **D** | Print compact aggregate when non-empty; quiet if empty | ✓ |
| **E** | Omit unset / `[]`; **no** förslag / `defaultStationEquipment` in totals | ✓ |
| **F** | Footer `Träningsplaneraren · Slice 15` | ✓ |

## Additional confirmations

- Aggregate may exceed per-station max count 9 — not clamped ✓  
- Empty sheet reachable; Golvklart not blocked when empty ✓  
- No CAD / badge / Passbyggaren compose / Kom igång gate / inventory stock ✓  
- Caption unchanged ✓  
- No Netlify / no deploy / no Verifier ping ✓  

## Deviations

None vs APPROVED pack. Optional row icons and `tipForradslista` skipped (explicitly non-blocking / non-required).

## Smoke notes (Builder)

- Aggregate unit smoke (inline): unset/`[]` omitted; unknown ids ignored; Landningsmatta 1+1 → 2; Kon multi-slot sum > 9 OK; library order OK.  
- `npm run build` green (`tsc -b && vite build`, 2026-09-25).  
- Manual UI path (recommended for Verifier): compose ≥2 Teknik stations → edit Förrådslista → Golvklart Förrådslista → print preview → empty path still enters Golvklart.

## Build

```
cd /workspace/gymnastics-planner/app && npm run build
→ green (tsc -b && vite build)
```

## Out of scope (honored)

- Netlify / deploy  
- Messaging Verifier, Docs, Planner, or other agents  
- Custom equipment CRUD / club inventory  
- Kom igång compose checklist (idea 2)  
- Edit-from-list / tap-row-to-station  
