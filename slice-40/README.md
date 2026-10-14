# Slice 40 — Sprid ut Teknik-markörer i öppna hallar

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-14.** A1–F1 locked per Planner (2026-10-14). Docs pack only, no app code. Branch `slice-40-docs` from `main` @ `45cce9b` (verified as `origin/main` tip with `git ls-remote` on 2026-10-14; main had not moved).  
**Effort:** S.  
**Source:** Planner (Polish #2).

## Why

In the club halls **Blå hall** and **Vit hall** there is only one zone, Öppen yta. When the app places Teknik stations by itself (wizard, mall, add station, empty Hallöversikt), most markers land on the same point. The coach sees one marker and has to drag the others out one by one.

**Coach outcome:** "Jag öppnar Hallöversikt i Blå hall och ser alla stationer, i ordning, redo att flyttas."

## Locks

| Lock | Decision |
|---|---|
| **A1** | When autoPlace has no free redskap spot (the hall has no snap zone, i.e. Blå and Vit), new markers are laid out in a tidy grid/row across Öppen yta instead of one point. Pass order is kept (row-major). All markers stay inside the hall. |
| **B1** | The shared placement helper (`lib/hallSuggest.ts` / `lib/hall.ts`) may change. Halls that already place correctly (Standard trupp, Tävling / linjer, Liten hall) must give **identical** positions. Required: a golden / regression test over **all** hall templates. |
| **C1** | No new controls, no new copy. Microcopy: none. |
| **D1** | Saved passes keep their stored positions. Nothing is migrated or re-laid out on load; only new placements change. |
| **E1** | Teknik lock (only Teknik stations are placeable) and hall locks unchanged. |
| **F1** | +512 B gz total, soft. Estimate +150–300 B. |

## Root cause (reproduced by reading main @ 45cce9b)

`autoPlaceItems` (`lib/hallSuggest.ts:67`) counts slots per **suggested** zone (`suggestZoneId`: vault, trampett, tumbling, mattberg, mats, open; tag fallback `zoneFromTags` gives vault / trampett / tumbling / open). It then calls `pointInZone(preset, zoneId, index)` (`lib/hall.ts:267`). Blå and Vit have no such zone, so `pointInZone` falls back to Öppen yta (`zoneById(...) ?? zoneById(preset, 'open')`) and returns its origin at 28 % / 28 % of the bbox.

1. **Exact stack:** each suggested zone has its own counter, so the first station of every zone gets `index 0` → the same point. Blå (0.2784, 0.3152), Vit (0.1872, 0.2648). A pass with one satsbräda, one trampett, one tumbling and one open drill = 4 markers on one spot.
2. **Near stack:** stations with the same suggested zone step by `OFFSET_X 0.035` / `OFFSET_Y 0.04` (`offsetFromSlot`, `hall.ts:255`). On a 390 px phone that is ~12 px against a 52 px marker (`.hall-chip--canvas`, `App.css:1970`), so they overlap ~75 %.
3. The stored `zoneId` is `'open'` (from the fallback zone) but the counter key is the suggested zone, so counts from existing placements never line up either.

Standard trupp, Tävling / linjer and Liten hall have every apparatus zone and are not affected (except the same ~12 px near-stack inside Öppen yta, which B1 keeps as is).

Callers that hit it: wizard (`lib/wizard.ts:108`), HallBoard empty-hall auto-place (`HallBoard.tsx:165`), add station (`SessionBuilder.tsx:243`), mall / Mina mallar / föreningsmall apply (`SessionBuilder.tsx:302, 316, 328`).

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes, algorithm
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC16

No `content/microcopy.sv.md` (C1: no copy).

## Out of scope

Re-laying out saved passes, changing drag / Placera här snapping (`snapPlacement`), new hall zones for Blå / Vit, the near-stack in Öppen yta of the standard halls, any new button such as «Ordna».
