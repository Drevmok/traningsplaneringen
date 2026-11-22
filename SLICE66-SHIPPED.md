# Slice 66 — Putsa Bygg hallen (SHIPPED, PR)

Locks A1 B1 C1 D1 E1 F1. Christoffer, 2026-11-22 11:53 (Europe/Stockholm), verbatim: «Ja, lås A1 B1 C1 D1 E1 F1 och kör Bob nu» (written to `slice-66/decisions.md`). Pack: slice-66-docs @ 4350cfe. Base main d347892. No SQL run, no SQL file. Only the two QM findings (D1); `hallSetupSteps`, the PassPrint timeline, Kör passet and S4–S9 are untouched.

## Changes
- **A1/B1 (`App.css`, CSS only):** inside `@media (orientation: landscape) and (max-height: 500px)`, with the guide open (`.hall-layout--floor:has(.hall-station-list)`):
  - the board is one viewport high (flex column)
  - the layout is two columns: the map (column width `(100svh − 130px) × 1.35`, so the whole hall fits the height) and the panel
  - the panel is a flex column with tight gaps; the sketch figure shrinks and scrolls inside the panel
  - the schematic note is hidden while the guide is open

  Ordinary Golvklart and portrait are unchanged.
- **C1 (`PassPrint.tsx`):** the Bygg hallen print section writes unplaced stations as `☐ {titel} — Saknar plats` (`UI.buildHallUnplaced`). Placed rows are unchanged (`☐ n. {titel}`).
- **E1:** `SLICE_NUMBER = '66'`.
- **Trims (E1):**
  - Dead CSS removed from `App.css`: `.hall-drop-hint`, `.hall-drop-hint p`, `.hall-coach-tip` and `.hall-coach-tip--tray` (no markup).
  - Unused keys removed from `blockMeta.ts`: `hallDropHint`, `hallDropHintStations`, `hallAllPlaced`, `hallFloorReadyShort` and `hallFloorEquipmentCount` (no references in `app/src` or the tests).
  - The optional keys `hallCoachTip`, `hallFloorCoachTip` and `hallTileHintShort` were not touched.
- **Tests and docs:** new PassPrint test (F1); footer test literals 65→66; one sentence each in `features/golvklart-forrad.md` and `features/liggande-844x390.md`.

## Evidence
- `bun test src`: **346 pass / 0 fail** (main 345).
- `npm run build` exit 0; `npm run lint` exit 0, 8 warnings (same as main).
- Bundle (`build-dists.sh`, gzip -9, js+css TOTAL): **221661 → 221639 (−22 B gzip; budget +512)**; raw 798642 → 798754 (+112 B).
- `pick-smokes d347892 HEAD`: HELA LOOPEN (App.css, blockMeta.ts). **22/22 SAMMA**, no NY FAIL. netlog 3968 requests, **0 to the live host**.
- Playwright (local preview; same script run against the main d347892 dist for comparison; 0 live-host requests): see the table below.

| # | Result |
|---|---|
| 1 | PASS 844×390, scrollY 0: marker (155–207), «Station 2 av 3», title, Byggd, Föregående / Nästa / Avsluta Bygg hallen all inside the 390 px viewport; map 351 px \| panel 453 px. Main: panel below the fold (FAIL there, as reported by QM) |
| 2 | PASS: Avsluta Bygg hallen not covered (elementFromPoint), exactly one `.is-selected`, no extra marker |
| 3 | PASS 390×844: map, panel and button positions identical to main (same numbers) |
| 4 | PASS both sizes: after Avsluta, one column, full-width map, note back, Avsluta golvklart / Förrådslista / Skriv ut passet present |
| 5 | PASS (from Golvklart and from Dela, one station removed): `☐ 1. …`, `☐ 2. …`, `☐ Trampett volt upp på mattberg — Saknar plats`; 3 sketches, one `.pass-sheet`, timeline, map and Förrådslista present, no Se upp för / Säkerhet |
| 6 | Covered by the full smoke loop (22/22 SAMMA); the edit-mode marker count was unchanged in the UI run. Kör passet not driven by hand |
| 7 | PASS: footer «Slice 66», no page errors |
| 8 | build / lint / unit green; full loop 22/22 SAMMA |
| 9 | −22 B gzip vs d347892; trims as listed; no SQL |
