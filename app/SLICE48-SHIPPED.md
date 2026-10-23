# Slice 48 — Hallöversikt (shipped locally)

Branch `slice-48-code` (from `slice-48-docs` @ 29ef308). Locked: A1 B1 C1 D1 E1 F1.

## What changed (letters as in `slice-48/decisions.md`)
- **A1** «Hallöversikt» sits in the Passbyggare row on phones too (no longer hidden ≤768 px) and is gone from «Mer».
- **B1** «Ändra stationer» opens «Stationer i ordning»: drag handle, rank, ↑/↓ (disabled at the ends), Ta bort, «Lägg till station»; «Klar» or Esc closes. aria-live: «{title} är nu nummer {n}.» Rows wrap at narrow widths, so at 320 px the names keep their width and the buttons drop to a second line.
- **C1** Pointer Events drag (`lib/pointerDrag.ts`) for the list and the markers: pointer capture, 6 px threshold, Esc cancels; tray → canvas places, canvas → tray unplaces; a click within 400 ms of a drop is ignored.
- **D1** The hall order is the Teknik block's order everywhere (`moveTechniqueTo`).
- **E1** «Lägg till station» opens «Lägg till övning» locked to Teknik (side drawer >768 px); the new station goes last and is auto-placed on a free cell. «Ta bort» removes it from the pass with «Borttagen · Ångra» (5 s), which restores the station and its placement.
- **F1** Stable pinch listener (callback in a ref, effect deps `[]`), `gesturestart/gesturechange` blocked, `touch-action: pan-x pan-y` on the whole hall area (`.hall-board`, covering the canvas, tray and list); `.modal` scrolls at ≤500 px height.
- `SLICE_NUMBER = '48'`; asserts updated.

## Checks
- `bun test src`: 256 pass / 0 fail (9 new in `lib/hallStations.test.ts`, 2 in `components/LibraryPanel.test.ts`)
- `bun test tools/bank`: 21 pass, 5 skip, 0 fail
- `npx tsc -b` clean · `npm run lint` 0 errors, 6 warnings (baseline) · `npm run build` ok
- Smoke `verifier/slice-48-builder-smoke.mjs` at 320×568, 390×844, 844×390 (touch via CDP) and 1280×800 (mouse): **80/80 PASS** (320×568 added: no overflow, names ≥ 100 px wide; whole-area touch-action; simulated pinch over the tray keeps the page scale at 1). Supabase is blocked in the browser.

## Bundle (gzip -9 vs main e605b3f)
- index JS 130 422 → 132 416 B (**+1 994 B**)
- CSS 13 881 → 14 223 B (**+342 B**)
- Total **≈ +2.34 kB**. Approved by Christoffer (was asked at ≈ +2.36 kB).

## Pending / deviations
- **AC26–27 are pending a real iPhone** (pinch and long-press in Safari). Headless cannot prove them.
- Hall undo is a local toast in HallBoard, not the shared UndoToast (★ preference in the handoff).
- The drag handle carries its hint in `title`, not `aria-description`.
- I did not update the living docs or Verifier feature maps (HANDOFF §12).

## PO rulings
- **Q1 (bundle):** +2.36 kB accepted as built.
- **Q2 (filter):** done. «Lägg till station» locks the library filter to Teknik (select disabled; `onFilterChange` omitted). Covered by `LibraryPanel.test.ts` and the smoke `*-Q2` steps.
- **Q3 (own drills):** shipped as built, without Ändra/Ta bort in the hall library.

## Accepted deviations
Local hall undo toast (not the shared UndoToast), handle hint in `title`, Verifier feature maps not updated, AC26–27 pending a real iPhone.
