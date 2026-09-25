# Slice 18 — SHIPPED

**Date:** 2026-09-25  
**Scope:** Broader selective `defaultStationEquipment` suggestions for all nine Teknik drills  
**Deploy:** No (Netlify out of pack)  
**Agents messaged:** None (no Verifier / Docs / Planner ping)

## What shipped

- Added the five locked Slice 18 `defaultStationEquipment` seeds below.
- Kept the four existing Teknik seed arrays unchanged.
- Footer → `Träningsplaneraren · Slice 18`.
- No UX chrome change; existing unset / `[]` / Använd förslag / Klar behavior is preserved.
- Golvklart / Förrådslista / print continue to use saved composition only.

## Files touched

| File | Change |
|---|---|
| `src/data/seedActivities.ts` | Added the five locked Teknik suggestion arrays; existing four unchanged |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 18 |
| `SLICE18-SHIPPED.md` | This file |

## New locked seeds

- `tech-flickis-kudde`: `eq-flickiskudde` ×1, `eq-madrass` ×1
- `tech-rondat-flickis`: `eq-tumblingmatta` ×1, `eq-landningsmatta` ×1
- `tech-falla-bakat-hojd`: `eq-plint` ×1, `eq-madrass` ×1
- `tech-salto-fran-hojd`: `eq-plint` ×1, `eq-landningsmatta` ×1
- `tech-handstaende-falla-rygg`: `eq-madrass` ×1

Existing four kept unchanged: `tech-ljushopp-satsbrada`, `tech-ljushopp-trampett`, `tech-satsbrada-volt-rygg`, `tech-trampett-volt-mattberg`.

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Seed all five remaining Teknik drills; keep existing four unchanged | Done |
| **B** | No UX change to Använd förslag / unset vs `[]` / Klar | Done |
| **C** | Golvklart / Förrådslista / print omit unset förslag | Done |
| **D** | Thin Docs update remains separate; no new required tip | Confirmed |
| **E** | Footer exactly `Träningsplaneraren · Slice 18` | Done |
| **F** | No library growth, Passbyggaren compose, badge/CAD, auto-apply, Netlify; caption unchanged | Done |

## Deviations

None.

## Build

`cd /workspace/gymnastics-planner/app && npm run build` — **green** (tsc -b && vite build).
