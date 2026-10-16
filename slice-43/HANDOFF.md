# Slice 43 — Builder handoff

**Status:** PROPOSED 2026-10-16 (not locked). Written against ★ answers A1 B1 C1 D1 E1 F1. Scope: `app/src/components/HallBoard.tsx` (edit-branch JSX order), `app/src/App.css` (phone rules), `app/src/data/blockMeta.ts` (`SLICE_NUMBER` only), tests. No new component, no new strings, no state.

## What exists today (main @ db11398)

- **Edit header:** `components/HallBoard.tsx:465–600` (`HallBoard` return, non-floor branch): `header.hall-header` → back button `:466`, `.hall-header-main` `:469`, `.hall-header-actions` `:478–519` (Visa flöde, Förrådslista, Använd alla förslag, Golvklart), `.hall-preset-row` `:521–540` (label, `#hall-layout-select`, `hallPresetMigrateNote` `:538`, `hallPresetCoachTip` `:539`), saknar banner `.hall-saknar-banner` `:541–558` (`missingSavedCompositionCount >= 1`, CTA if `eligibleSuggestedCount >= 1`), multi-line hints `:559–564` (`showMultiLineHints`), `.hall-hints-info` `:565–590`, `CoachTipStrip.hall-flow-coach-tip` `:591–598` (`headerTipVisible`).
- **Zoom bar:** `HallBoard.tsx:610–630` `.hall-zoom-bar` (phone only, sits between header and `.hall-layout`).
- **Hall:** `components/HallCanvas.tsx:155` `.hall-canvas-wrap > .hall-canvas-zoom > .hall-canvas`; caption `HallBoard.tsx:668` `hallSchematicNote`; sticky tray `:673ff` (`hall-tray--sticky`, `App.css:2552`).
- **Heights:** `App.css:1843` `.hall-canvas` 16/10 + `min-height: 280px`; `App.css:2290–2298` ≤768: `min-height: 50vh; aspect-ratio: 3/2`; `export.css:1113/1118` Blå 2132/1572, Vit 2108/2200 with `min-height: 0`; `export.css:1190` ≤768 keeps Blå/Vit `min-height: 0`.
- **Header CSS:** `App.css:1741` `.hall-header` column gap 8; `:2372` `.hall-header-actions` wrap; `:2613` 44 px targets.
- **Golvklart branch** `HallBoard.tsx:398–463` already fits (hall 293–715) — do not change.

## 1. B1 — hall height (`App.css:2295`)

In the `@media (max-width: 768px)` block replace `min-height: 50vh` with `min-height: 0` for `.hall-canvas` (3:2 → 239 px at 358 wide). Keep the print rule at `App.css:2720` and all `export.css` print/pass-sheet rules untouched. Check `HallCanvas` zoom: `.hall-canvas-zoom` width × aspect still scales.

## 2. C1 — move secondary chrome below the hall (`HallBoard.tsx`)

Move out of `header.hall-header`: `hallPresetMigrateNote` + `hallPresetCoachTip` paragraphs, the `showMultiLineHints` block, `.hall-hints-info`, and the `headerTipVisible` `CoachTipStrip`. Render them, same conditions, in a new wrapper `<div className="hall-below no-print">` directly after `hall-schematic-note` (`:668`) and before the tray. The select and its label stay in the header. Keep `no-print-hide`/`no-print` classes as today. Tip dismiss behavior unchanged.

## 3. D1 — compact header (`HallBoard.tsx` + `App.css`, ≤768 only)

- (a) Wrap back button + `h1.hall-screen-title` in one flex row (`.hall-title-row`, `align-items: center; gap: 8px`). Meta line stays under it.
- (b) Move the `.hall-zoom-bar` JSX into the `.hall-preset-row` (phone only; it is already phone-only) so select and − / + share one row: `display: flex; gap: 8px`; select `flex: 1`. Label: keep the element; on phone visually hide it (`.sr-only` style) only if Planner OKs — otherwise inline label left of the select.
- (c) Saknar banner one line: `.hall-saknar-banner { display: flex; align-items: center; gap: 8px }`, text `flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`, CTA keeps ≥ 44 px. Add `title` = the same text if ellipsed (no new string).
- Actions row unchanged.

## 4. E1 — landscape / wide

All new layout CSS goes inside `@media (max-width: 768px) and (orientation: portrait)` except the DOM moves (C1, D1b) which apply everywhere. Check 844×390: hall must not start lower than today (507).

## 5. Slice bump

`data/blockMeta.ts:111` `SLICE_NUMBER = '43'`. Update asserts: `lib/feedback.test.ts:25` (`'Version: Slice 43'`), `:45` (`'43'`), `:46` (`'Träningsplaneraren · Slice 43'`), `lib/clubTemplates.test.ts:316` (`'Träningsplaneraren · Slice 43'`). Confirmed present at those lines on db11398.

## 6. Bundle

Estimate +150–300 B gz (CSS ~10 rules; JSX moves net ≈ 0). Soft cap +512 B gz. Baseline main: `index-*.js` 142.95 kB gz. Report CSS + JS gz deltas in the PR.

## 7. Self-smoke

Re-run the measurement script approach in `slice-43/evidence/` (Playwright, 390×844, DPR 2, Från mall → Nybörjare → Hallöversikt, loop `#hall-layout-select`) and paste `.hall-canvas` bottom per template.
