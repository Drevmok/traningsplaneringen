# Slice 20 — SHIPPED

**Date:** 2026-09-26  
**Scope:** Phone polish — in-sheet dirty Stäng + canvas remove ≥44×44 + Starta från mall scroll freeze  
**Deploy:** No (Netlify out of pack)  
**Agents messaged:** None (no Verifier / Docs / Planner / user ping)

## What shipped

- **A1** Redigera redskap: dirty Stäng / backdrop shows in-sheet confirm (`composeDirty*`); clean closes immediately; Klar unchanged; no `window.confirm`.
- **B1** Edit canvas `.hall-chip--canvas .hall-chip-remove` hit target ≥44×44px (all breakpoints); Golvklart still no remove; no B2 detail text button; `hallRemove` aria/title unchanged.
- **C1** One-shot `openTemplates` cleared via `onInitialTemplateConsumed` (apply or sheet close); confirm uses `closePanel()` not `openPanel('library')`; shared `useBodyScrollLock` refcount restores `document.body.style.overflow` when nested locks unwind.
- **E1** Footer → `Träningsplaneraren · Slice 20`.
- **F1** No Passbyggaren compose; no badge/CAD; no library growth; no auto-apply; no Netlify; caption unchanged; preserve 11–19.

## Files touched

| File | Change |
|---|---|
| `src/components/StationComposeSheet.tsx` | In-sheet dirty confirm; body-lock helper |
| `src/components/SessionBuilder.tsx` | Clear flag + closePanel on apply; body-lock helper |
| `src/App.tsx` | `onInitialTemplateConsumed` clears `openTemplates` |
| `src/lib/bodyScrollLock.ts` | New refcount lock + `useBodyScrollLock` |
| `src/components/TemplateConfirm.tsx` | Use body-lock helper |
| `src/components/ActivityDetail.tsx` | Use body-lock helper |
| `src/components/ForradslistaSheet.tsx` | Use body-lock helper |
| `src/App.css` | Canvas remove ≥44px; dirty confirm styles |
| `src/data/blockMeta.ts` | `composeDirty*` keys + footer Slice 20 |
| `SLICE20-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | In-sheet dirty Stäng (discard / keep editing); Klar unchanged; no `window.confirm` | Done |
| **B** | Canvas remove hit ≥44×44px edit only; no B2 | Done |
| **C** | Clear one-shot template flag; close sheet on apply; restore body overflow | Done |
| **D** | Thin Docs (already locked); Builder wires strings | Done (wire-only) |
| **E** | Footer exactly `Träningsplaneraren · Slice 20` | Done |
| **F** | No Passbyggaren compose; no badge/CAD; no library growth; no auto-apply; no Netlify; caption unchanged; preserve 11–19 | Done |

## Deviations

None.

## Build

`cd /workspace/gymnastics-planner/app && npm run build` — **green** (tsc -b && vite build).
