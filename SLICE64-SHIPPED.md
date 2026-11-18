# Slice 64 — Skiss i Kör passet + redskapsikoner (SHIPPED, PR)

Locks A1 B1 C1 D1 E1 F1 (Christoffer 17 Nov 10:43). Spec: slice-64-docs @ c82a0d7. Base main 937829c.

## Changes
- `lib/runPass.ts`: `runStationSketch(session, itemId)` → `{ slots, layout? }` for placeable Teknik items with equipment slots (own list or defaultStationEquipment); layout via `layoutForStation` (saved layout only when list is unset/equal to förslag) — A1, C1.
- `RunPass.tsx`: `<StationSketch>` first child of `.run-script` (only the script scrolls, Slice 38 rule kept). `stationCards()` is not used.
- `export.css`: run-overlay sketch max-height 24svh, white tile, light caption.
- `HallChip.tsx` + `icons/types.ts` (`gear` 14/12 px) + `App.css`: compact `VisualIcon` (EQUIPMENT_ICON via `equipmentIconId`) before each redskap line, Golvklart + print only (B1).
- SLICE_NUMBER '64'; footer test literals; docs/golvklart-redskap.sv.md + feature map notes.
- No SQL, no new UI strings.

## Evidence
- Unit: 341 pass / 0 fail (main 338) — 3 new `runStationSketch` tests.
- Build exit 0; lint exit 0 (8 warnings, same as main).
- Bundle (js+css): gzip -9 220908 → 221150 (+242 B, budget +512); raw 795350 → 796332 (+982 B).
- pick-smokes 937829c..HEAD: HELA LOOPEN (App.css, blockMeta.ts). 22/22 SAMMA vs baseline. netlog 3967 requests, 0 to live host.
- Playwright (local preview, 390×844 + 844×390): sketch first child on 3 Teknik steps, none on the 6 others; nav bottom + only .run-script scrolls (390×844 all; 844×390 all except Styrka step 7, nav −35 px — identical on main 937829c, pre-existing); edit mode/tray without icons; Golvklart 7/7 lines icon+text at 14 px; print media icons visible; footer «Slice 64»; no page errors.
