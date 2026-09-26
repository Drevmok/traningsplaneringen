# Slice 22 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Quieter chrome — progressive Hall hints + quieter Kom igång + one chrome layer  
**Deploy:** No (no Pages/Netlify republish)  
**Agents messaged:** None (report to parent only)

## What shipped

- **A1** Progressive Hall hints: durable `hallHintsCompact` after first successful Teknik `placeAt`; multi-line instructional paragraphs hidden when compact; info control ≥44px (`Tips om placering` / expandable region) reveals existing hint keys; zero placements keep today’s full hints (subject to C1).
- **B1** Quieter Kom igång: collapsed summary (title + progress + **Visa steg** ≥44px) when `done > 0` or `komIgangCollapsed`; brand-new 0/n stays expanded; **Dölj steg** when expanded; **Dölj Kom igång** / **Jag klarar mig** kept.
- **C1** One chrome layer: Hall edit tip strip → suppress multi-line hints (info still available); Golvklart unplaced banner → no tip strip on floor (edit tips already hidden); Home has no tip strip (C1 Home skip). CTAs / tray / zoom never hidden.
- **D1** Docs strings wired from `docs/copy-quieter-chrome.sv.md` (info + expand/collapse + aria); no saknar copy; no new tip.
- **E1** Footer → `Träningsplaneraren · Slice 22`.
- **F1** No saknar banner; no place-heuristic change; no pinch/pan/tray-collapse regressions; no Passbyggaren compose / library / CAD / caption change; no republish; no `window.confirm`.

## Files touched

| File | Change |
|---|---|
| `src/lib/coachTips.ts` | `hallHintsCompact` / `komIgangCollapsed`; `markHallHintsCompact`; `setKomIgangCollapsed`; Q4 reset clears both |
| `src/data/blockMeta.ts` | Hall info + Kom igång expand/collapse strings; footer Slice 22 |
| `src/components/HallBoard.tsx` | A1/C1 hint gating; info expandable; `onTips` → compact on `placeAt` |
| `src/components/KomIgangCard.tsx` | B1 collapsed summary + expand/collapse |
| `src/components/Home.tsx` | Wire `onCollapseChange`; remount key on Visa tips igen |
| `src/App.tsx` | Tips mutators to Home / HallBoard |
| `src/App.css` | Compact Kom igång + hall hints info (≥44px) |
| `SLICE22-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Progressive Hall hints; durable compact; info reveals | Done |
| **B** | Kom igång collapsed after progress / prior collapse; 0/n expanded | Done |
| **C** | One of tip / banner / multi-line; rules above | Done |
| **D** | Thin Docs strings wired | Done (wire-only) |
| **E** | Footer exactly `Träningsplaneraren · Slice 22` | Done |
| **F** | Hard non-goals | Done |

## Self-smoke

- `npm run build` — **green**
- Preview `http://127.0.0.1:4173/traningsplaneringen/` — doctor HTTP 200
- Drive: puppeteer-core + system Chrome, viewport 390×844
- Evidence: `verifier/slice-22-builder-smoke.md`, `/workspace/screenshots/slice22_*.png`
- Result: **17 PASS / 0 FAIL** (footer; Kom igång expand/collapse persist; full hints → place → compact + info; C1 tip suppress; Golvklart banner no tip; tray/zoom; caption; Q4 Visa tips igen; no saknar)
- Preview torn down after smoke

### Smoke gaps

- Pinch multi-touch not exercised (Slice 21 intact; Verifier phone-check if needed)
- Desktop viewport not separately driven
- Home C1 tip-vs-Kom-igång: N/A (Home has no tip strip)

## Deviations

- Info control lives in Hall **edit header** (single expandable region revealing all five hint paragraphs including tray drag/snap), not duplicated in the tray — Builder pick per Q6; non-modal; Placera här stays usable.
- `hallHintsCompact` is set only on successful `placeAt` (not auto-synced from existing `placementCount`), so **Visa tips igen** can clear it without being immediately re-set. Returning coaches with pre-Slice-22 placements see full hints until their next successful place (then durable compact).
