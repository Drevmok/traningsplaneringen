# Slice 05 — Hall board foundation

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24  
**Status:** APPROVED by Christoffer 2026-09-24

## Goal

After a coach builds a pass in Passbyggaren, open an **interactive hall overview**. Selected drills appear as placeable chips. The coach drags them onto a **generic truppgymnastik schematic hall** (open floor + a few labeled zones). Positions save with the draft.

**Coach outcome:** “I can see where things run in the hall.”

## In scope

- Entry from Passbyggaren when the pass has ≥1 activity (Swedish CTA: **Hallöversikt**)
- Hall board screen: schematic generic hall background with **simple labeled zones**
- Placeable chips for each session item (title + block tint + VisualIcon; duration optional; experienced-only badge when relevant)
- Drag to place / reposition on the canvas; unplaced items live in a tray; remove from hall back to tray
- Persist `hallPlacements` on the draft (`SessionItem.id` → normalized x,y + optional `zoneId`)
- Empty states: no activities yet; all unplaced; missing activity title fallback
- Desktop-first OK; phone must be usable (pan/scroll canvas, chips tappable) — advanced touch polish deferred to Slice 07
- Verification checklist for Verifier

## Out of scope

- Snap-to-zone physics / rich hall presets (→ Slice 06)
- Flow arrows / station order / print-ready / floor-ready view (→ Slice 07)
- Real club floor plans, scale meters, AR
- Multi-user live editing
- Changing the drill library or Passbyggaren block editing beyond the CTA + navigation
- Export / share
- Specific club layouts (always generic truppgymnastik in this slice)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | This overview + acceptance |
| [`decisions.md`](./decisions.md) | Locked choices + rejected alternatives |
| [`data-model.md`](./data-model.md) | `hallPlacements` shape, zone ids, draft migration |
| [`screen-spec-hall-board.md`](./screen-spec-hall-board.md) | Entry, layout, tray, canvas, interactions, empty states, phone |
| [`hall-template-generic.md`](./hall-template-generic.md) | Generic truppgymnastik schematic for Builder (SVG/CSS) |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail criteria |

## Acceptance for Christoffer (product owner)

Approve Slice 05 when you agree that:

1. **Hallöversikt** is the right Swedish CTA from Passbyggaren (enabled when ≥1 övning is on the pass).
2. The hall is a **generic schematic** (not a club blueprint) with these five zones: **Öppen yta**, **Trampett**, **Tumbling**, **Satsbräda**, **Mattor**.
3. New/unplaced items start in an **unplaced tray**; drag onto the canvas places them; drag back (or “Ta bort från hall”) returns them to the tray. Positions save on the draft.
4. Coordinates are **normalized 0–1** on the canvas; optional soft `zoneId` is OK for Slice 05 but **no snap physics**.
5. Experienced-only drills (`tech-rondat-flickis`, `tech-salto-fran-hojd`) keep badge/warning if the chip opens detail — the hall never hides safety.
6. Scope stays foundation-only — no snap presets, no flow arrows, no print view in this slice.

**Approve** → Docs can add any Swedish microcopy for empty states/tooltips if needed; Builder implements against this pack; Verifier uses the checklist.

## Prior slices (siblings)

- [Slice 01](../slice-01/) — data model + Passbyggaren foundation  
- [Slice 02](../slice-02/) — phone sheet polish  
- [Slice 03](../slice-03/) — 28 real drills + experienced-only  
- [Slice 04](../slice-04/) — SVG VisualIcon tiles + block colors  

## Planned follow-ons (not this pack)

Christoffer approved a **3-slice hall overview** plan. **Slice 05** (this pack) ships the foundation: entry, tray, placeable chips, generic schematic, and persisted placements. **Slice 06** will add richer zones (trampett / tumbling / satsbräda-vault / mattberg / open space detail), snap-to-zone, and hall presets. **Slice 07** will add station order/flow, phone touch polish, and a floor-ready/print view. Do not implement 06/07 behavior in this slice.

## Current state (audit, 2026-09-24)

| Area | Today |
|---|---|
| Draft | `Session` in `app/src/types.ts`; persist via `localStorage` key `gymnastics-planner-draft-v1` (`saveDraft` / `loadDraft` in `lib/session.ts`) |
| Items | `SessionItem.id` + `activityId` + duration/note/order inside fixed five `SessionBlock`s |
| Nav | `App` views: `home` \| `builder` only — no hall screen yet |
| Visuals | `BLOCK_COLORS` + `VisualIcon` (sizes: block/item/card/detail) ready to reuse on chips |
| Safety | `experiencedCoachOnly` badge + `role="alert"` warning in ActivityDetail — must survive hall chip → detail |
| Totals / mismatch | Unchanged by this slice (item-sum totals; soft mismatch banners stay in Passbyggaren) |
