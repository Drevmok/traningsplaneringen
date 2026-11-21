# Slice 65 — Bygg hallen (SHIPPED, PR)

Locks A1 B1 C1 D1 E1 F1 (Christoffer 2026-11-21 12:08). Spec: slice-65-docs @ 2466777. Base main 6698a63. No SQL run, no SQL file. S4–S9, hall-CAD and the Förrådslista split not touched.

## Changes
- `lib/hallSetup.ts`: `hallSetupSteps(session)` → `{ itemId, rank?, slots, layout? }[]`. Source is `placeableItems`; placed Teknik in `stationRanks` order, then unplaced without a rank. Slots are `stationEquipment ?? defaultStationEquipment ?? []`; layout comes from `layoutForStation`. It uses neither `stationCards().rank` nor `aggregateStationEquipment` (B1, C1).
- `HallBoard.tsx` (A1, C1): Golvklart button «Bygg hallen» (aria «Bygg hallen, station för station»). It opens a step panel under the existing floor map with:
  - «Station n av N» (or «Saknar plats»), title, `StationSketch` when slots exist (auto row without a layout), and the redskap line with antal from the station's own slots
  - a «Byggd» checkbox kept in memory only, cleared on exit and reopen
  - Föregående / Nästa / «Avsluta Bygg hallen»

  The current existing marker gets `.is-selected` (`HallCanvas` now honours `selectedItemId` on the floor; Golvklart passes the step's item and edit mode is unchanged). No new marker, no move. «Avsluta golvklart» also closes the guide.
- `PassPrint.tsx` + `export.css` (D1): a section «Bygg hallen» after Förrådslista: ☐ + number + title per station, sketch, redskap line. No Se upp för / Säkerhet. Timeline, hall map and Förrådslista are unchanged; no second print path.
- `blockMeta.ts` (E1): `SLICE_NUMBER = '65'`, plus new keys `buildHall`, `buildHallAria`, `buildHallDone`, `buildHallUnplaced`, `buildHallExit`, `buildHallNext` and `buildHallStep`, with text verbatim from `content/microcopy.sv.md`.
- `stationCards.ts`: exports the existing `equipmentLine` (reused for the redskap line).
- Docs: `docs/dela-och-utskrift.sv.md`, `verify-traningsplaneraren/features/golvklart-forrad.md`.

## Deviations (budget)
- Föregående uses the existing `UI.runPrev` (same text «Föregående»), not a new `buildHallPrev` key, to save bytes.
- The panel reuses the `.hall-station-list` / `.hall-station-list-title` card styles, so `App.css` is unchanged.
- The redskap line is one «·»-joined line (`equipmentLine`), text only, with no icons.
- The print section does not repeat «Saknar plats»; unplaced stations simply have no number.
- «N» in «Station n av N» is the number of placed stations, matching the marker numbers.

## Evidence
- `bun test src`: **345 pass / 0 fail** (main 341). Four new `hallSetupSteps` tests: stationRanks order, unplaced last without rank, förslag vs own slots + layout rule, empty / no Teknik → [].
- `npm run build` exit 0 (incl. `tsc -b`); `npm run lint` exit 0, 8 warnings (same as main).
- Bundle js+css: gzip -9 **221150 → 221661 (+511 B, budget +512)**; raw 796332 → 798642 (+2310 B).
- `pick-smokes 6698a63 HEAD`: **HELA LOOPEN** (blockMeta.ts). 22 run: **21 SAMMA, 1 NY FAIL**: `slice-44-builder-smoke` AC9 «Golvklart actions» now reads `Avsluta golvklart|Bygg hallen|Förrådslista|Skriv ut passet`. This is the expected «Bygg hallen» difference named in check 12. The smoke itself is unchanged (no smoke edits in this pack). netlog 3967 requests, 0 to the live host.

## Checklist (own Playwright, local preview, 390×844 + 844×390, 0 live-host requests)
| # | Status |
|---|---|
| 1 | PASS both: «Station 1 av 3», title, sketch + caption «Skiss — så kan stationen stå.», redskap line, Byggd unchecked, marker 1 selected, 3 markers (no extra) |
| 2 | PASS both: steps 1→3 follow the marker numbers; the selection moves with Nästa / Föregående |
| 3 | PASS 390: marker 1 removed in edit mode → last step «Saknar plats», no marker selected, 2 markers, others «Station n av 2» |
| 4 | Partly: seed auto row shown in UI; saved layout and the no-slots case covered by unit tests only (no own exercise with a layout in the UI run) |
| 5 | PASS both: Byggd kept across Nästa/Föregående, gone after Avsluta + reopen, marker positions unchanged |
| 6 | PASS both: after exit no panel; Avsluta golvklart, Förrådslista, Skriv ut passet present |
| 7 | PASS both: edit mode has no Bygg hallen button, no selection, 3 markers. Redigera redskap not opened |
| 8 | PASS both (from Golvklart): one `.pass-sheet`, section «Bygg hallen» with 3 stations ☐ 1–3, sketch, redskap; timeline, map, Förrådslista kept; no Se upp för / Säkerhet. Print from Dela uses the same `PassPrint`; not driven separately |
| 9 | PASS both: Förrådslista 5 flat rows, no «saknas» |
| 10 | PASS 844×390: sketch 576 px wide, «Avsluta Bygg hallen» not covered (elementFromPoint). The panel sits below the map, so you scroll to it |
| 11 | PASS both: footer «Slice 65», no page errors |
| 12 | build / lint / unit green; full loop 21 SAMMA + expected slice-44 AC9 diff |
| 13 | +511 B gzip (≤ +512); no SQL run |

Head SHA: see the PR (this commit's parent is 39d1f47).
