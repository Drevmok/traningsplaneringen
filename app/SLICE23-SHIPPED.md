# Slice 23 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Home polish — Hallöversikt / Golvklart secondary CTAs when draft + Öppna på telefon with live Pages URL  
**Deploy:** No (no Pages/Netlify republish)  
**Agents messaged:** None (report to parent only)

## What shipped

- **A1** When `draftExists`: secondary **Hallöversikt** + **Golvklart** (≥44px, `btn-secondary` + `hall-tap-target`) under primary Nytt/Mall/Fortsätt; reuse `onOpenHall` / `onOpenGolvklart` + same flash hints; hide both when `!draftExists`.
- **B1** Always-on **Öppna på telefon** aside below honesty (`no-print`); existing `oppnaPaTelefon*` + dedicated `oppnaPaTelefonUrl` link line; honesty unchanged; no dismiss; no sync/cloud invent.
- **C1** Secondary row in `home-actions` (quieter than primary); phone with honesty cluster; Kom igång not force-expanded; no tip strips; ≥44px; Swedish only.
- **D1** Docs strings wired from `docs/copy-home-polish.sv.md` (Home CTA labels + aria + URL + footer).
- **E1** Footer → `Träningsplaneraren · Slice 23`.
- **F1** No Förråd empty CTA; no saknar / place-heuristic; no compose/library/CAD/caption/cloud/sync; no republish; preserve Slice 22 quiet chrome; no `window.confirm`.

## Soft-fail flash (Home-level)

`stepHint` flash renders as a Home-level `role="status"` (`.home-step-hint`) under `home-actions`, so secondary soft-fails work even when Kom igång is dismissed/collapsed. No longer passed into `KomIgangCard` (Home-level only).

## Files touched

| File | Change |
|---|---|
| `src/data/blockMeta.ts` | `homeOpenHall*` / `homeOpenGolvklart*` / `oppnaPaTelefonUrl`; footer Slice 23; confirmed timeless `oppnaPaTelefon*` (host-free body) |
| `src/components/Home.tsx` | A1 secondary CTAs; B1 phone aside; Home-level stepHint flash |
| `src/App.css` | `.home-actions-secondary`, `.home-secondary-cta`, `.home-step-hint`, `.home-phone` (+ ~390 column) |
| `SLICE23-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Secondary Hall/Golvklart when draft; hide otherwise; soft flash | Done |
| **B** | Always Öppna på telefon near honesty; live URL; keep honesty | Done |
| **C** | Secondary in home-actions; phone with honesty; quiet Kom igång | Done |
| **D** | Thin Docs strings wired | Done (wire-only) |
| **E** | Footer exactly `Träningsplaneraren · Slice 23` | Done |
| **F** | Hard non-goals | Done |

## Self-smoke

- `npm run build` — **green**
- Preview `http://127.0.0.1:4173/traningsplaneringen/` — doctor HTTP 200
- Drive: puppeteer-core + system Chrome, viewport 390×844
- Evidence: `verifier/slice-23-builder-smoke.md`, `/workspace/screenshots/slice23_*.png`
- Result: **20 PASS / 0 FAIL** (no-draft hide + phone/URL; empty-draft secondary + soft-fail flashes; draft+activities opens Hall edit + Golvklart floor; primary intact; footer Slice 23; caption; F1 scope)
- Preview torn down after smoke

### Smoke gaps

- Desktop viewport not separately driven
- Soft-fail `komIgangNeedHall` path not exercised (`openGolvklartFromHome` currently fails only on 0 activities)
- Primary Nytt full create path not walked (cards present asserted)
- Empty-draft path did not locate Kom igång dismiss control (Home-level flash still verified while Kom visible)

## Deviations

- **None vs locked A–F.** Intentional Builder pick: Home-level-only `stepHint` status (not duplicated inside `KomIgangCard`) so flashes always work — matches task preference.
