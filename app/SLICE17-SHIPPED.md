# Slice 17 — SHIPPED

**Date:** 2026-09-25  
**Scope:** Golvklart screen — short station titles under placed Teknik markörer  
**Deploy:** No (Netlify out of pack)  
**Agents messaged:** None (no Verifier / Docs / Planner ping)

## What shipped

- Show existing `.hall-chip-title--print` (`activity.title`) under each placed Teknik markör on **Golvklart** (`.hall-canvas.is-floor`).
- Edit Hallöversikt canvas stays title-hidden; print unchanged.
- Stack title above Slice 14 redskap lines on floor — reuse print `top` offset (`calc(100% + 0.85rem + 4px)`) so title and equipment do not share the same `top`.
- Keep existing ellipsis / ~9ch chrome (no second title string; no floor max-width nudge).
- Title always shows on Golvklart even when redskap is quiet/empty.
- Footer → `Träningsplaneraren · Slice 17`.
- No new tip; caption unchanged; no TSX structural change (comment only).

## Files touched

| File | Change |
|---|---|
| `src/App.css` | Show `.hall-chip-title--print` on `.is-floor`; offset `.hall-chip-equipment` below title (mirror print) |
| `src/components/HallChip.tsx` | Comment update only (title already in DOM) |
| `src/data/blockMeta.ts` | `footerSliceLabel` → Slice 17 |
| `SLICE17-SHIPPED.md` | This file |

## Locks A–F

| # | Lock | Status |
|---|---|---|
| **A** | Golvklart `.is-floor` only; edit canvas titles stay hidden | Done |
| **B** | Stack like print: title under markör, then redskap below | Done |
| **C** | Keep existing `.hall-chip-title--print` ellipsis/~9–10ch (no second title string) | Done |
| **D** | Always show title for every placed Teknik markör on Golvklart | Done |
| **E** | Footer exactly `Träningsplaneraren · Slice 17` | Done |
| **F** | Caption unchanged; no required tip; no badge/CAD; print unchanged | Done |

## Hard locks preserved

- Slice 11–16: Teknik-only placeable, compose, under-markör redskap, Förrådslista, Kom igång 5 steps.
- Quiet redskap rules (unset/`[]` omit; count===1 omit ×; no "Inga redskap").
- No idea 1 (broader förslag), no Netlify, no accounts, no edit-canvas titles.
- Caption **Schematisk hall — inte exakt mått** unchanged.

## Deviations

None.

## Build

`cd /workspace/gymnastics-planner/app && npm run build` — **green** (tsc -b && vite build).

## Out of ship

- No Netlify deploy.
- No message to Verifier, Docs, Planner, or other agents.
- Optional `tipGolvklartShortTitles` not wired (not required for PASS).
