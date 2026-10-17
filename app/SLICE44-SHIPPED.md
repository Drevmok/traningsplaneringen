# Slice 44 — Dela och utskrift (shipped notes)

Branch `slice-44-code` off `main` @ `0d88da5` + docs pack `50226d7`. Locked A1 B1 C1 D1 E1 F1.

## What changed
- **A1 print fix (`lib/bodyPrint.ts`):** `useBodyPrint`/`BodyPrintMode` are replaced by `usePassPrint()` → `{ armed, stalled, print }`. Its logic lives in the plain function `startPassPrint(win, onStalled)`:
  - it adds `body.is-print-pass` and calls `print()` in a rAF;
  - there is **no afterprint teardown**; the class is removed when the owner unmounts;
  - a request counter re-prints on every tap.
  The callers (Dela sheet, Golvklart, Delat pass) render `{armed && createPortal(<PassPrint/>)}`.
- **B1:** if `beforeprint` hasn't fired 1.5 s after a tap, `printStalled` shows under «Skriv ut passet» (`<p class="muted" role="status">`) on all three surfaces. No UA or display-mode sniffing.
- **C1 (`PassPrint.tsx`):** the `mode` prop and the stations branch are gone. Each Teknik station row shows:
  - `rank. title` (+ « · Erfaren ledare» when set) and its minutes;
  - a body with the `StationSketch` (when there are slots), «Se upp för.», «Säkerhet.» (top rule) and «Redskap.».
  Print CSS: rows don't break inside, block headings `break-after: avoid`, `.pass-sheet-map` `break-inside: avoid`, body text 11 pt, sketch max 120 mm. Nybörjare = 3 A4 pages.
- **D1:** Helskär and «Skriv ut kort» are removed from the Dela sheet, Golvklart and Delat pass. `StationDeck.tsx` is deleted, and `enterPresentation()` moves to `lib/presentation.ts` (Kör passet keeps it).
- **E1 (`ExportSheet.tsx`):** «Dela» has exactly «Kopiera länk» + «Skriv ut passet»; props are now `{ session, onClose }`.
  - `copyText` now returns `Promise<boolean>`.
  - On success the label shows «Länken är kopierad.» for 3 s.
  - On failure, `exportCopyManual` plus a read-only `<input>` with the link.
- **Strings:** per `content/microcopy.sv.md` (`export` = «Dela», new `exportShareLink`, `exportShareHint`, `exportPrintPassHint`, plus the new `printStalled` and `exportCopyManual`). `SLICE_NUMBER = '44'`, asserts bumped, `sharePass.test.ts:128` download assert dropped. SharePass v1 is unchanged.

## Removed
- Files: `components/StationDeck.tsx`, `lib/qrSvg.ts`, `lib/uqr.mjs` (+ its `uqr.d.mts` / `uqr.mjs.d.ts` type shims).
- Code: `downloadPassFile`, `passFileName`, `useBodyPrint`, `BodyPrintMode`, `SessionBuilder.handleImported`, and in ExportSheet the QR / file import / Spara som egen mall / ReplaceDraftConfirm paths.
- Strings: `exportStations`, `exportStationsHint`, `exportFullscreen`, `printStations`, `exportQr`, `exportQrLong`, `downloadFile`, `saveAsTemplate`, `savedAsTemplate`, `importDone`, `stationCardsEmpty`, `deckNext`, `deckPrev`, `hallPrint`. `rg` finds none of them in `app/src`.
- CSS: `.station-deck*`, `@page station-card`, `body.is-print-stations`, `.station-sheet*`, `.share-qr*`.
- Kept: `.receive-file` (Home / OwnImport) and the `.station-sketch` print rule.

## Decisions
1. **Card ↔ row matching is by item id, not by index in the Teknik block.** `stationCards` uses `placeableItems` (Teknik by activity type across all blocks), so a row's number always equals its hall marker number, even if a Teknik activity sits in another block.
2. **`.export-url` is kept (trimmed)** to style the read-only fallback field from E1. HANDOFF lists it for deletion, but E1 needs a field.
3. **Golvklart `printStalled` line** sits directly under the action row (the buttons are a flex row).
4. **Tests:** `lib/bodyPrint.test.ts` covers the class staying after afterprint, the stall after 1.5 s and no stall when beforeprint fires. `components/PassPrint.test.ts` checks station rows = `stationCards` count, numbers 1…n, the labels, and Erfaren ledare.

## Verification
- `bun test src` 226/0 (+6), `bun test tools/bank` 26/26, `npx tsc -b` clean, `npm run lint` 0 errors, `npm run build` ok.
- Smoke `verifier/slice-44-builder-smoke.mjs` (390×844, branch :4444, main :4410 for the old-link check): **26/26**. It stubs `window.print` with three timings:
  - *webkit*: afterprint right after `print()`;
  - *chromium*: synchronous;
  - *dead*: nothing fires.
  Each print is checked with `emulateMedia('print')` + `page.pdf` (A4) + `pdftotext`. PDFs are in `verifier/slice-44-print/`, page PNGs in `/workspace/screenshots/slice44_*`.
- ACs covered: AC1–10, AC12 (pasted link), AC13, AC14–18 (Dela, Golvklart and Delat pass all give the same 3 pages; no page ends on a block heading; map with its heading), AC20 (simulated), AC22.
- Not verified:
  - AC11 (fullscreen in headless);
  - AC12 file import (only the pasted link was tested);
  - AC16 Blå/Vit map ratios in print (rules untouched);
  - AC19 and AC20 on a real iPhone, Safari tab and installed app (needs a device);
  - AC14 in a real desktop Chrome print preview (`page.pdf` stands in);
  - AC21 «no new strings» by inspection.

## Bundle (gzip -9, sum of dist/assets/*.js + *.css)
| | main 0d88da5 | branch | Δ |
|---|---|---|---|
| JS | 204 839 | 199 414 | −5 425 |
| CSS | 14 391 | 14 132 | −259 |
| **Total** | 219 230 | 213 546 | **−5 684** |

## Follow-up (PR #48, Verifier F1/F2; F3 deferred to Slice 45)
- **F1 — numbering = hall:** `PassPrint` takes the number from `stationRanks(session)` (`lib/hall.ts`, the source the hall markers use). Only placed Teknik stations get a number; unplaced ones keep their card fields but have no number. Unit test in `components/PassPrint.test.ts` (place 1st and 3rd → «1.», none, «2.»).
- **F2 — cleanup for a later browser print:** `startPassPrint` now waits for our print's `afterprint`, and the coach's next `pointerdown`/`keydown` in the page (Ctrl/Cmd+P included) removes `is-print-pass` and disarms the portal. iOS is unaffected (the page can't be touched while the print sheet is open, so the late WebKit render still sees the pass), and a second `beforeprint` (e.g. a preview refresh) doesn't tear down. A first try (tear down on any later `beforeprint`) broke `page.pdf`, which fires `beforeprint` again, so it was dropped. Unit test in `lib/bodyPrint.test.ts`.
- Smoke: 32/32 (+F1-dom, F1-hall, F1-pdf, F2-golvklart, F2-again, F2-hall). F2 emulates Ctrl/Cmd+P as the key press + print media/PDF, because headless opens no dialog.
- Bundle: total vs main **−5 599** (JS −5 340, CSS −259); vs 800651e **+85** (JS).
