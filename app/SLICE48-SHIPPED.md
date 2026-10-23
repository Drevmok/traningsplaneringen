# Slice 48 — Hallöversikt (shipped locally)

Branch `slice-48-code` (from `slice-48-docs` @ 29ef308). Locked: A1 B1 C1 D1 E1 F1.

## What changed
- **A1** Hallöversikt is reachable on phones: the builder button is no longer hidden ≤768 px; the duplicate entry in «Mer» is gone.
- **B1** Pinch zoom fixed: the zoom callback lives in a ref, the touch effect runs once (deps `[]`), `gesturestart/gesturechange` are prevented, `.hall-canvas-wrap` has `touch-action: pan-x pan-y`.
- **C1** HTML5 drag-and-drop replaced by Pointer Events (`lib/pointerDrag.ts`): pointer capture, 6 px threshold, Esc cancels. Markers move with live preview; tray → canvas places, canvas → tray unplaces. A click right after a drop (400 ms) is ignored.
- **D1** «Ändra stationer» / «Klar» opens «Stationer i ordning»: drag handle, rank, ↑/↓ (disabled at ends), Ta bort, «Lägg till station». The hall order is the Teknik block's order (`moveTechniqueTo`). aria-live line: «{title} är nu nummer {n}.»
- **E1** Ta bort shows «Borttagen · Ångra» (5 s); Ångra restores station and placement. «Lägg till station» opens the Lägg till övning sheet on Teknik (side drawer >768 px); the new station lands last and is auto-placed on a free cell.
- **F1** Landscape: `@media (max-height: 500px)` for modals; all list targets ≥ 44 px.
- `SLICE_NUMBER = '48'`; asserts updated.

## Checks
- `bun test src`: 256 pass / 0 fail (9 new in `lib/hallStations.test.ts`, 2 in `components/LibraryPanel.test.ts`)
- `bun test tools/bank`: 21 pass, 5 skip, 0 fail
- `npx tsc -b` clean · `npm run lint` 0 errors, 6 warnings (baseline) · `npm run build` ok
- Smoke `verifier/slice-48-builder-smoke.mjs` at 390×844, 844×390 (touch via CDP) and 1280×800 (mouse): **52/52 PASS**. Supabase is blocked in the browser.

## Bundle (gzip -9 vs main e605b3f)
- index JS 130 422 → 132 417 B (**+1 995 B**)
- CSS 13 881 → 14 207 B (**+326 B**)
- Total **≈ +2.32 kB**. Approved by Christoffer (was asked at ≈ +2.36 kB).

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
Local hall undo toast (not the shared UndoToast), handle hint in `title`, living docs and feature maps not updated, AC26–27 pending a real iPhone.
