# Slice 11 — Hallöversikt declutter (stations only + compact chips)

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24  
**Status:** **APPROVED by Christoffer 2026-09-24**

## Goal

Make Hallöversikt usable when a full pass is on the board: **only Teknik stations** are placeable on the floor, and **placed chips are compact** so the schematic does not clutter quickly.

**Coach outcome:** “Jag placerar bara stationerna (Teknik) på hallen, och brickorna tar inte över hela ytan.”

## Problem (from Christoffer)

1. Each dragged item is large → the hall gets cluttered fast.
2. Warmup, strength, gathering, games do **not** belong on a specific floor spot — only the **stations** part of the pass does.

## Locked product read

- **Stations** = Passbyggaren items whose activity `blockType` is **`techniques` (Teknik)**.
- **Not placeable:** Samling (`gathering`), Uppvärmning (`warmup`), Styrka (`strength`), Lek och spel (`fun_and_games`).
- Styrka drills that mention “stationer” in copy (e.g. cirkelträning) stay **out of scope for floor placement** in this slice — floor map is for Teknik apparatus stations only.

## In scope

1. **Placeable filter** — Hall tray + canvas only include Teknik session items. Non-Teknik items never appear in Ej placerade / never drag onto the hall.
2. **Migration** — On load / open Hallöversikt / prune: drop `hallPlacements` whose session item is missing **or** is not Teknik. Silent; no toast.
3. **Compact canvas chips** — Smaller footprint on the schematic (see `decisions.md`): shorter title, smaller icon, hide duration on canvas; keep station number + Erfaren badge when relevant. Tray chips may stay slightly larger for touch.
4. **Empty / copy** — Swedish empty states when the pass has no Teknik items; soft note that only stations (Teknik) are placed here. Golvklart / flow / numbers follow the filtered set only.
5. **Footer** — `Träningsplaneraren · Slice 11` when shipped.
6. Verification checklist for Verifier (incl. live Netlify smoke optional if redeployed).

## Out of scope

- Resizing zones / new hall presets / CAD / meters
- Drag-reorder stations on the hall (still Passbyggaren order)
- Making Styrka/cirkel placeable as a second station type
- Changing Passbyggaren block editing or drill library
- Accounts / sync / new hosting work (Slice 10 live URL unchanged unless Christoffer asks to republish)
- Pin-only markers without titles (rejected for coach readability — see decisions)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | This overview + acceptance |
| [`decisions.md`](./decisions.md) | Locked choices + rejected alternatives |
| [`screen-spec.md`](./screen-spec.md) | Filter, compact chips, empty states, Golvklart impact |
| [`content/hall-declutter.sv.md`](./content/hall-declutter.sv.md) | Swedish microcopy seeds for Docs |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail |

## Acceptance for Christoffer

Approve Slice 11 when you agree that:

1. Only **Teknik** övningar appear in the hall tray and on the floor (Samling / Uppvärmning / Styrka / Lek och spel stay in Passbyggaren only).
2. Existing placements for non-Teknik items are **removed quietly** when the draft loads or Hallöversikt opens.
3. Canvas chips are **noticeably smaller** (compact title + icon + station number; no duration on the floor).
4. If the pass has no Teknik items, Hallöversikt shows a clear Swedish empty state instead of a full tray of warmups/etc.
5. Stationsordning / Visa flöde / Golvklart only count **placed Teknik** stations.
6. Scope stays declutter + filter — no new presets, no cirkel-as-stations, no library changes.

**Approve** → Docs polish Swedish strings → Builder implements → Verifier uses the checklist → optional Netlify republish of `dist`.

## Prior context

Slices 05–08 built Hallöversikt (place all pass items). Slice 09 tips; Slice 10 Netlify live. Slice 11 narrows placement to Teknik and shrinks chips.
