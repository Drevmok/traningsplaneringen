# Slice 12 — Visual station tiles + tap-to-detail

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24  
**Status:** **APPROVED by Christoffer 2026-09-24**

## Goal

On Hallöversikt, placed **Teknik** stations read as **small visual markers of the station** (icon-forward), not text cards. **Tap** a placed tile to open that station’s details.

**Coach outcome:** “Jag ser stationerna på golvet som små symboler, och trycker för att läsa mer.”

## Direction lock (Christoffer 2026-09-24)

- Slice 12 = visual station tiles + tap-to-detail  
- **Equipment composition** (build stations from separate equipment pieces) = **later slice**, not this one

## Problem

Slice 11 made chips smaller and Teknik-only, but tiles still feel like mini text cards. The end goal is a floor map of stations you recognize at a glance, with details on demand.

## Current baseline (do not regress)

- Placeable = `blockType === 'techniques'` only (Slice 11)
- Silent prune of non-Teknik placements
- Placed chip tap already opens `ActivityDetail` (read-only) for most cases; tray/phone place-mode still uses tap-to-select for “Placera här”
- Caption: **Schematisk hall — inte exakt mått**
- gymnaster / pass / Swedish UI

## In scope

1. **Visual canvas tile** — Icon-dominant marker for placed stations: large activity `visualKey` icon, compact station rank badge, minimal or no title on the floor (title via aria-label + detail). Hide duration on canvas (already). Keep Erfaren indicator without bloating the tile.
2. **Tap-to-detail** — Lock & polish: tap/click a **placed** canvas tile opens station detail (existing `ActivityDetail` read-only, or a thin hall-specific wrapper that reuses the same content). Closing returns to the hall with placement unchanged. Do not open detail on drag-end accidentally.
3. **Tray** — Unplaced tray stays slightly more readable for pick/drag (may keep short title); not required to match the ultra-compact canvas marker.
4. **Golvklart / print** — Placed markers stay legible (rank + recognizable icon); print may show short title if icon-only is too weak on paper (Builder picks smallest change that stays readable).
5. **Swedish microcopy** — Short hint that tiles are stations; tap for details (Docs).
6. **Footer** — `Träningsplaneraren · Slice 12` when shipped.
7. Verification checklist.

## Out of scope

- Combining equipment pieces into stations (explicitly deferred)
- New equipment library / CAD / meters / real floor plans
- Changing which blocks are placeable (stays Teknik-only)
- Drag-reorder on hall; Passbyggaren library edits
- Netlify republish (only if Christoffer asks after PASS)
- Replacing ActivityDetail with a brand-new detail system (reuse first)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Overview + acceptance |
| [`decisions.md`](./decisions.md) | Locked choices |
| [`screen-spec.md`](./screen-spec.md) | Tile anatomy, tap vs drag, tray, Golvklart |
| [`content/station-tiles.sv.md`](./content/station-tiles.sv.md) | Swedish seeds for Docs |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail |

## Acceptance for Christoffer

Approve Slice 12 when you agree that:

1. Placed floor tiles are **small visual station markers** (icon-first), not wide text cards.
2. **Tap** a placed tile → station details; placements don’t move from a simple tap.
3. Tray can stay a bit more texty so coaches can still find what to place.
4. Teknik-only + Slice 11 prune rules stay.
5. **No** equipment-composition in this slice — that comes later.
6. Scope stays visual tiles + tap-to-detail polish only.

**Approve** → Docs polish strings → Builder implements → Verifier checklist → optional Netlify later.
