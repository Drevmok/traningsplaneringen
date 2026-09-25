# Slice 21 — Hallöversikt phone usability (pinch + canvas + pan)

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — recommended A–F locked  
**Date drafted:** 2026-09-26  
**Status:** **APPROVED** — Christoffer approved via Planner lock widget; Docs may start.

**Backlog:** Scout Proposed #3 (pinch-zoom) absorbed into this Hallöversikt phone usability pack; also covers sticky-tray chrome cost and pan-while-zoomed reliability. Phone live baseline: https://drevmok.github.io/traningsplaneringen/ (Slice 20).

## Goal

Make Hallöversikt usable on a phone (~390px) when aiming placements and reading Golvklart:

1. **Pinch-zoom** beside existing **+/−** (same min/max clamp; view-only scale — stored x,y unchanged).
2. **More canvas / less chrome** — sticky tray today reserves ~14rem on ≤768px; collapse by default when canvas needs space.
3. **Reliable pan while zoomed** — one-finger pan on empty canvas/background; marker drag still moves markers; pinch reserved for zoom.

**Coach outcome:** “Jag kan nypa zooma hallen, se mer duk och mindre bricka, och panorera när jag är inzoomad — utan att tappa Placera här eller råka öppna detalj.”

## Locked A–F (Christoffer 2026-09-26)

| # | Rec | Meaning |
|---|---|---|
| **A** | **A1** | Pinch-to-zoom on hall canvas (edit + Golvklart), same min/max clamp as +/−; keep +/− buttons; view-only scale (stored x,y unchanged); desktop optional but phone required |
| **B** | **B1** | Phone ≤768px: collapsible sticky tray — collapsed by default when canvas needs space (show compact bar with unplaced count + expand control ≥44px); expanded = today’s tray for Placera här / chips; Golvklart still hides edit tray |
| **C** | **C1** | When zoomed: one-finger pan on empty canvas / background; marker drag still moves markers (not pan); pinch reserved for zoom; no conflict that opens detail on pan; +/− still work |
| **D** | **D1** | Thin Docs: Swedish strings for tray collapse/expand + any new aria; no new required Kom igång tip |
| **E** | **E1** | Footer `Träningsplaneraren · Slice 21` |
| **F** | **F1** | No CAD/pins/badge; no Passbyggaren compose; no library growth; no saknar-redskap banner; no Kom igång heuristic change; caption unchanged; preserve slices 11–20; no Pages republish unless asked |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose
- Placeable = **Teknik** only
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** (or existing locked wording) unchanged
- **NO** canvas equipment-count badge / CAD pins
- Swedish UI; gymnaster / pass; device-local drafts; no accounts / cloud
- Golvklart / Förrådslista / print still **saved** composition only
- Footer `Träningsplaneraren · Slice 21` when shipped (recommended E)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks

## Problem baseline

| Pain | Baseline today |
|---|---|
| Pinch | Slice 07 chose **+/− only** and deferred pinch (`SLICE07-SHIPPED.md` Gaps). Zoom is view-only via `HallBoard` `zoomIn`/`zoomOut` + `hall-zoom-bar`; `HallCanvas` `hall-canvas-zoom`; strings `hallZoom` / `hallZoomIn` / `hallZoomOut` in `blockMeta.ts`. Clamp `ZOOM_MIN=1` … `ZOOM_MAX=2`, step `0.25`. |
| Canvas chrome | Sticky tray `.hall-tray--sticky` on ≤768px; `--hall-tray-reserved` defaults to **14rem** (or measured tray height) — eats vertical space for placement / Golvklart reading. |
| Pan while zoomed | Empty canvas `touch-action: pan-x pan-y`; chips `touch-action: none`. At zoom >1, one-finger pan vs marker drag / detail-open is unreliable for coaches aiming placements. |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `ZOOM_MIN` / `ZOOM_MAX` / `ZOOM_STEP` | `HallBoard.tsx` | View-only clamp 1…2 |
| `zoomIn` / `zoomOut` / `viewZoom` | `HallBoard.tsx` | +/− buttons |
| `.hall-zoom-bar` / `.hall-zoom-btn` | `HallBoard.tsx` + `App.css` | Zoom chrome (≥44px) |
| `hall-canvas-zoom` | `HallCanvas.tsx` / `App.css` | Scale wrapper |
| `UI.hallZoom` / `hallZoomIn` / `hallZoomOut` | `blockMeta.ts` | Aria / labels |
| `.hall-tray--sticky` | `App.css` @≤768px | Sticky bottom tray |
| `--hall-tray-reserved` | `HallBoard.tsx` style + CSS | Default `14rem` padding under canvas |
| Canvas `touch-action: pan-x pan-y` | `App.css` | Empty-canvas pan |
| Chip `touch-action: none` | `App.css` | Marker drag |
| Caption | Hall chrome | Schematisk hall — inte exakt mått |

## In scope

1. Pinch-to-zoom on Hallöversikt canvas (edit + Golvklart), same clamp as +/−; keep +/−; stored coords unchanged.
2. Phone ≤768px collapsible sticky tray (collapsed default when canvas needs space; compact bar + expand ≥44px; expanded = today’s Placera här / chips tray); Golvklart still hides edit tray.
3. Reliable one-finger pan on empty background when zoomed; marker drag ≠ pan; pinch = zoom; pan ≠ open detail; +/− still work.
4. Docs: thin Swedish for tray collapse/expand + aria; no new required Kom igång tip.
5. Footer → Slice 21 when shipped.
6. Verification checklist covering A1/B1/C1/E1/F1 + phone viewport + build green.

## Out of scope

- CAD / equipment pins / canvas badge
- Passbyggaren compose entry
- Library growth; saknar-redskap banner (Scout Proposed #1 stays Proposed)
- Kom igång place-heuristic change (Scout Proposed #2 stays Proposed)
- Caption change; seed-table edits; auto-apply förslag
- Changing unset vs `[]` / Använd förslag / Använd alla semantics beyond “no regression”
- Netlify / Pages republish unless Christoffer asks
- Removing +/− in favor of pinch-only

## Pipeline note

After Christoffer marks this pack **APPROVED** (A–F lock):

1. **Docs** → Swedish strings (tray collapse/expand + aria) → living `docs/`  
2. **Builder** → implement locked A–F; self-smoke via `verify-traningsplaneraren/` Drive for hall features; footer Slice 21  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` as authority + project skill `verify-traningsplaneraren/`  

pstack rigor (Slice 21+): see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md) — deep before fast; Builder self-smoke; Verifier doctor + drive + evidence; Planner-only Verifier ping.

## Effort

**M** — one phone-usability pack (pinch + tray chrome + pan), one Docs → Builder → Verifier loop after APPROVED.
