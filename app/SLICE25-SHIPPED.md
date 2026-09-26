# Slice 25 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Hallöversikt **edit** soft “saknar redskap” banner when placed Teknik lack saved redskap (unset OR `[]`); optional ≥44px CTA points at existing **Använd alla förslag** when eligible ≥1 — no auto-apply. Hide on Golvklart.  
**Deploy:** No (no Pages/Netlify republish)  
**Agents messaged:** None (report to parent only)

## What shipped

- **A1** Soft `role="status"` on Hall **edit only** when `missingSavedCompositionCount ≥ 1` among placed Teknik; missing = `stationEquipment === undefined` OR empty `[]`. Hidden when `isFloor`.
- **B1** Docs copy via `hallSaknarRedskapBanner` / `BannerOne` + `hallSaknarRedskapBannerText(n)`. Optional ≥44px CTA `hallSaknarPointApplyAll` only when `eligibleSuggestedCount ≥ 1` — points at existing apply-all (shared `pointAtApplyAll`); no auto-apply. Text-only when eligible=0.
- **C1** Soft chrome family of `.hall-unplaced-banner` (wrap `.hall-saknar-banner`); no tip strip; never blocks place/Golvklart/Stäng. Floor unplaced banner left in place (saknar is edit-only).
- **D1** Strings from `docs/saknar-redskap-banner.sv.md` wired into `blockMeta.ts`.
- **E1** Footer → `Träningsplaneraren · Slice 25`.
- **F1** No auto-apply; no compose from banner; no Slice 26 place-heuristic; no library/CAD/cloud; caption unchanged; no republish; preserve Slice 19/22/23/24; no `window.confirm`.

## Files touched

| File | Change |
|---|---|
| `src/lib/session.ts` | Pure helper `placedTeknikMissingSavedEquipment` (unset OR `[]`); Slice 19 eligibility unchanged |
| `src/data/blockMeta.ts` | `hallSaknarRedskapBanner*` + point CTA/aria/toast; `hallSaknarRedskapBannerText`; footer Slice 25 |
| `src/components/HallBoard.tsx` | `missingSavedCompositionCount`; edit saknar banner + optional CTA; shared `pointAtApplyAll(toast)` used by Förråd (24) and saknar (25) |
| `src/App.css` | `.hall-saknar-banner` / `.hall-saknar-point-cta` soft status spacing |
| `SLICE25-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Edit-only soft banner; unset **and** `[]`; hide on Golvklart | Done |
| **B** | Unplaced-like copy; optional point CTA when eligible; no auto-apply | Done |
| **C** | Soft status family; no tip strip; never blocks Golvklart | Done |
| **D** | Thin Docs strings wired | Done (wire-only) |
| **E** | Footer exactly `Träningsplaneraren · Slice 25` | Done |
| **F** | Hard non-goals (no Slice 26, preserve 19+22+23+24) | Done |

## Self-smoke

- `npm run build` — **green**
- Preview `http://127.0.0.1:4173/traningsplaneringen/` — doctor HTTP 200
- Drive: puppeteer-core + system Chrome, viewport 390×844
- Evidence: `verifier/slice-25-builder-smoke.md`, `/workspace/screenshots/slice25_*.png`
- Result: **22 PASS / 0 FAIL**
  - Unset placed Teknik → banner + CTA → point (no persist) → Använd alla förslag saves → banner clears
  - Cleared `[]` → banner text only, no CTA; apply-all disabled + title
  - Golvklart with missing ≥1 → no saknar banner; floor chrome works
  - Footer Slice 25; caption `Schematisk hall — inte exakt mått` unchanged
  - Slice 24 Förråd soft path still present; saved equipment → no banner
- Preview torn down after smoke

### Smoke gaps

- Desktop viewport not separately driven
- Slice 22 tip-strip / Slice 23 Home polish assumed intact (not re-walked)
- Compose / Redigera redskap from banner not attempted (F1 out of scope)

## Deviations

- **None vs locked A–F.** Builder pick (Docs Q2 / task): light combo of scrollIntoView + focus + ~1.8s `hall-apply-all--point` highlight **and** brief toast (`hallSaknarPointApplyAllToast`) — shared with Slice 24 Förråd path via `pointAtApplyAll(toast)`.
