# Slice 26 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Kom igång checklist step `openHallAndPlace` auto-progresses **only** when `placementCount >= 1`. Opening Hall alone must not check the step for new advances. Legacy already-true left as-is. Soft — never block Hall/Golvklart.  
**Deploy:** No (no Pages/Netlify republish)  
**Agents messaged:** None (report to parent only)

## What shipped

- **A1** `syncChecklistHeuristics`: advance `openHallAndPlace` only when `!checklist.openHallAndPlace && opts.placementCount >= 1` (dropped `|| state.openedHall`). Soft — no nav block.
- **B1** `markOpenedHall`: sets `openedHall: true` only; does **not** force `checklist.openHallAndPlace: true`. Never clears already-true place step.
- **C1/D1** `komIgangStep3` / `komIgangStep3Hint` **unchanged** (Docs left them). No tip strip. No saknar banner work.
- **E1** Footer → `Träningsplaneraren · Slice 26`.
- **F1** No placeable/compose/drafts/saknar/library/CAD/cloud change; preserve 19–25 (Slice 25 saknar banner spot-checked intact).

## Files touched

| File | Change |
|---|---|
| `src/lib/coachTips.ts` | A1 sync placement-only; B1 `markOpenedHall` open-only (no place-step force) |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 26; step 3 strings untouched |
| `SLICE26-SHIPPED.md` | This file |

**Call sites:** `App.tsx` still calls `markOpenedHall` on Hall / Golvklart open paths — now records open only; place step advances via sync when `placementCount >= 1`. No App.tsx edits required.

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Placement-only auto-progress; soft nav | Done |
| **B** | Legacy leave-as-is; open alone insufficient for new advances | Done |
| **C** | Step wording unchanged; no tip strip | Done |
| **D** | Thin Docs already shipped; no saknar | Done (no Docs invent) |
| **E** | Footer exactly `Träningsplaneraren · Slice 26` | Done |
| **F** | Hard non-goals; preserve 19–25 | Done |

## Build

- `cd app && npm run build` — **green** (`tsc -b && vite build`)

## Self-smoke

- Preview `http://127.0.0.1:4173/traningsplaneringen/` — doctor HTTP 200
- Drive: puppeteer-core + system Chrome, viewport 390×844
- Evidence: `verifier/slice-26-builder-smoke.md`, `/workspace/screenshots/slice26_*.png`
- Result: **18 PASS / 0 FAIL**
  - Fresh tips: open Hall with 0 placements → place step **unchecked**; `openedHall` still set
  - Seeded ≥1 placement → place step **checked**; compose step still unchecked
  - Legacy `openHallAndPlace: true` + 0 placements → stays **checked** after sync
  - `openedHall: true` alone does not newly advance a false place step
  - Soft: Hallöversikt + Golvklart enabled / Golvklart open works with unchecked place
  - Footer Slice 26; caption `Schematisk hall — inte exakt mått` unchanged
  - Slice 25 saknar banner still present on Hall edit (`1 station saknar redskap`)
  - No tip strip; no `window.confirm`
- Preview torn down after smoke

### Smoke gaps

- Desktop viewport not separately driven
- Place via UI DnD / Placera här not driven (Case2 used seeded `hallPlacements` — same `placementCount >= 1` sync path)
- Slice 22 quiet / Slice 23 Home polish / Slice 24 Förråd path assumed intact (not fully re-walked; saknar spot-check only)

## Deviations

- **None vs locked A–F.**
