# Slice 16 — SHIPPED

**Date:** 2026-09-25  
**Scope:** Soft Home **Kom igång** discoverability for **Redigera redskap**  
**Deploy:** No (Netlify out of pack)  
**Agents messaged:** None (no Verifier / Docs / Planner ping)

## What shipped

- New soft Kom igång checklist step **Ange redskap på Teknik-stationerna** between place and Golvklart (5 steps total).
- Intro copy → **Fem korta steg …**; progress total → 5.
- Auto-progress when any session item has non-empty **saved** `stationEquipment` (Klar / Använd förslag persist). Does not count unset, `[]`, or förslag / `defaultStationEquipment` alone.
- Compose step CTA opens **Hallöversikt** (same soft path as place). Coach completes compose via markör → **Redigera redskap**.
- Golvklart checklist CTA and hall Golvklart remain usable with compose unchecked (soft only).
- `tipStationCompose` string and show rules left as-is (Slice 13).
- Footer → `Träningsplaneraren · Slice 16`.
- No Home visual redesign beyond copy/checklist/progress.

## Files touched

| File | Change |
|---|---|
| `src/lib/coachTips.ts` | `composeStationEquipment` key; `CHECKLIST_TOTAL = 5`; normalize missing → false; `syncChecklistHeuristics` + `hasComposedEquipment`; done-count includes new key |
| `src/App.tsx` | Derive `hasComposedEquipment` from draft/session items; pass into sync |
| `src/data/blockMeta.ts` | Fem intro; `komIgangStepCompose` / Hint / HintShort; `komIgangNeedComposeHall`; footer Slice 16 |
| `src/components/KomIgangCard.tsx` | Insert step 4 (compose); Golvklart stays soft (no compose gate) |
| `SLICE16-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | New soft step (5 total) between place and Golvklart | Done |
| **B** | Auto-progress on any non-empty saved `stationEquipment` | Done |
| **C** | Keep `tipStationCompose` as-is | Done (untouched) |
| **D** | Soft only — never block Golvklart | Done (no compose `disabledReason` on Golvklart step) |
| **E** | Footer `Träningsplaneraren · Slice 16` | Done |
| **F** | No Home visual redesign beyond copy/checklist/progress | Done |

## Migration notes

- `normalize()`: missing `composeStationEquipment` → `false`.
- Dismissed checklists stay dismissed (do not force Kom igång back).
- Non-dismissed coaches who were 4/4 without compositions see the fifth step unchecked (gentle catch-up).
- Non-dismissed with existing non-empty `stationEquipment`: heuristic marks compose done on next sync.
- Flag never clears once true (same pattern as other heuristics).

## Hard locks preserved

- No Passbyggaren compose entry; no canvas badge/CAD.
- Teknik-only; Slice 11–15 (compose, under-markör, Förrådslista) untouched.
- Caption **Schematisk hall — inte exakt mått** unchanged.
- Netlify out; ideas 1 & 3 out.

## Deviations

None.

## Build

`cd /workspace/gymnastics-planner/app && npm run build` — **green** (tsc -b && vite build).

## Out of ship

- No Netlify deploy.
- No message to Verifier, Docs, Planner, or other agents.
