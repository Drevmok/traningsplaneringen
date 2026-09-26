# Slice 24 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Förråd empty soft path — when empty + Slice 19–eligible, soft CTA closes sheet and points at Hall edit **Använd alla förslag** (no auto-apply)  
**Deploy:** No (no Pages/Netlify republish)  
**Agents messaged:** None (report to parent only)

## What shipped

- **A1** Soft empty path only when `rows.length === 0` **and** `eligibleSuggestedCount ≥ 1`; else today’s `forradslistaEmpty` + `forradslistaEmptyHint` (no soft CTA). Non-empty list unchanged.
- **B1** Soft CTA → close Förråd → exit Golvklart/floor if needed → scroll/focus/brief highlight existing **Använd alla förslag** + brief `role="status"` toast; does **not** call `handleApplyAllSuggested`.
- **C1** Soft secondary copy + ≥44px `hall-tap-target` secondary button; Docs Swedish; no tip strip; no saknar banner.
- **D1** Strings from `docs/forrad-empty-soft-path.sv.md` wired into `blockMeta.ts`.
- **E1** Footer → `Träningsplaneraren · Slice 24`.
- **F1** No compose from Förråd; no auto-persist; no saknar / place-heuristic / station-breakdown; no library/CAD/cloud; no Home/phone; caption unchanged; no republish; preserve Slice 19/22/23; no `window.confirm`.

## Files touched

| File | Change |
|---|---|
| `src/data/blockMeta.ts` | `forradslistaEmptySoftHint`, `forradslistaPointApplyAll` (+ Aria/Toast); footer Slice 24; `hallApplyAllSuggested*` unchanged; `forradslistaEmpty` reused |
| `src/components/ForradslistaSheet.tsx` | Props `eligibleSuggestedCount` + `onPointAtApplyAll`; soft empty branch replaces EmptyHint |
| `src/components/HallBoard.tsx` | Pass count; `applyAllBtnRef`; `pointAtApplyAllFromForrad` (close → exitFloor → scroll/focus/highlight + toast); wire sheet |
| `src/App.css` | `.forradslista-soft-cta`; `.hall-apply-all--point` + brief pulse |
| `SLICE24-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Soft path only empty + eligibleSuggestedCount ≥ 1 | Done |
| **B** | Close → edit → point; no auto-apply | Done |
| **C** | Soft text + ≥44px button; quiet chrome | Done |
| **D** | Thin Docs strings wired | Done (wire-only) |
| **E** | Footer exactly `Träningsplaneraren · Slice 24` | Done |
| **F** | Hard non-goals | Done |

## Self-smoke

- `npm run build` — **green**
- Preview `http://127.0.0.1:4173/traningsplaneringen/` — doctor HTTP 200
- Drive: puppeteer-core + system Chrome, viewport 390×844
- Evidence: `verifier/slice-24-builder-smoke.md`, `/workspace/screenshots/slice24_*.png`
- Result: **18 PASS / 0 FAIL**
  - Eligible empty → soft CTA → close → edit → focus+highlight+toast → equipment still unset → Använd alla förslag persists → Förråd fills
  - Not-eligible empty → EmptyHint only, no soft CTA
  - Golvklart-opened Förråd → soft CTA exits floor → edit → points
  - Footer Slice 24; caption `Schematisk hall — inte exakt mått` unchanged
- Preview torn down after smoke

### Smoke gaps

- Desktop viewport not separately driven
- Disabled apply-all title when count=0 not re-asserted beyond not-eligible empty
- Slice 22 tip-strip / Slice 23 Home polish assumed intact (not re-walked)

## Deviations

- **None vs locked A–F.** Builder pick (Docs Q2 / task): light combo of scrollIntoView + focus + ~1.8s highlight class **and** brief point toast (`forradslistaPointApplyAllToast`) — quiet, one chrome layer.
