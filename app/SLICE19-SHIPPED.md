# Slice 19 — SHIPPED

**Date:** 2026-09-25  
**Scope:** Hallöversikt edit secondary CTA **Använd alla förslag** — bulk-persist unset Teknik seeds via the same path as per-station Använd förslag  
**Deploy:** No (Netlify out of pack)  
**Agents messaged:** None (no Verifier / Docs / Planner / user ping)

## What shipped

- Edit chrome secondary CTA **Använd alla förslag** in `.hall-header-actions` (near Visa/dölj flöde + Förrådslista; primary stays Golvklart).
- Immediate apply on tap; no confirm; one-line `role="status"` toast result.
- Eligible = placed Teknik + `stationEquipment === undefined` + non-empty `defaultStationEquipment`; skip saved and `[]`.
- Pure helpers `eligibleSuggestedStationEquipmentItems` + `applyAllSuggestedStationEquipment` reuse `updateItemStationEquipment`.
- Footer → `Träningsplaneraren · Slice 19`.
- CTA absent from Golvklart / markör sheet / Passbyggaren; place-on-canvas still does not write `stationEquipment`; seed arrays untouched.

## Files touched

| File | Change |
|---|---|
| `src/lib/session.ts` | `eligibleSuggestedStationEquipmentItems`, `applyAllSuggestedStationEquipment` |
| `src/components/HallBoard.tsx` | Edit CTA + handler + soft toast |
| `src/data/blockMeta.ts` | Slice 19 UI keys + `hallApplyAllSuggestedResultText` + footer Slice 19 |
| `SLICE19-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Edit chrome secondary CTA near hall actions — not markör sheet, not Golvklart, not Passbyggaren | Done |
| **B** | Immediate apply + one-line result; soft no-op if N=0; no confirm | Done |
| **C** | Placed Teknik + unset + non-empty seed; skip saved and `[]` | Done |
| **D** | Thin Docs Swedish strings wired; tip omitted | Done |
| **E** | Footer exactly `Träningsplaneraren · Slice 19` | Done |
| **F** | No auto-apply on place; quiet Golvklart/Förråd/print until saved; caption unchanged; no Passbyggaren compose; no badge/CAD; no library growth; no Netlify; preserve 11–18 | Done |

## Deviations

None.

## Build

`cd /workspace/gymnastics-planner/app && npm run build` — **green** (tsc -b && vite build).
