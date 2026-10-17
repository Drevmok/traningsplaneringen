# Slice 45 — Builder handoff

**Status:** PROPOSED 2026-10-17 (head start, not locked). Written against ★ answers A1 B1 C1 D1 E1 F1 + F3. Base: branch merged with `origin/main` @ `4fe44c0` (Slice 44 live). F3 (compact Dela) added. Line refs below are from `0d88da5` unless marked; Slice 44 moved `HallBoard.tsx` up by 20–25 lines (on 4fe44c0: `trayTipVisible` :124, auto-place effect :160, `handlePresetChange` :220, Golvklart meta :454, preset row :522–539, `.hall-below` :612, `hallPresetMigrateNote` :613, `.hall-hints-info` :623, flow tip :652, tray hints :705–708, `tipHallPlace` strip :711–715). Go by the symbol names. Scope: `app/src/data/hallPresets.ts`, `types.ts`, `lib/hall.ts`, `lib/session.ts`, `lib/sharePass.ts`, `components/HallBoard.tsx`, `components/HomeWizard.tsx`, `components/Home.tsx` + 4 confirm components, `components/ExportSheet.tsx` (F3), `App.css`, `export.css` (F3), `data/blockMeta.ts`, tests. No data format change, ids stable, no SQL.

## What exists today (main @ 0d88da5)

- **Presets:** `data/hallPresets.ts:44–50` `HALL_PRESET_ORDER` (5 ids), `:53–268` `HALL_PRESETS` — `forening-bla` `:54–89` (label «Blå hall», plan + one zone `open`), `forening-vit` `:90–121` («Vit hall», `open` only), `standard-trupp` `:122–170`, `tavling-linjer` `:171–219`, `liten-hall` `:220–268` (zones with snaps).
- **Type:** `types.ts:135–143` `HallTemplateId` (5 ids) + `LegacyHallTemplateId = 'generic-trupp'`.
- **Defaults/aliases:** `lib/hall.ts:21` `DEFAULT_HALL_TEMPLATE = 'standard-trupp'`; `:34` `KNOWN_TEMPLATES`; `:69–76` `getPreset` (unknown → default); `:78–84` `normalizeTemplateId` (`generic-trupp` → `standard-trupp`); `:405–457` `applyPreset` (only caller: `HallBoard.tsx:225–230` `handlePresetChange`); `:516–540` `migrateHallFields` (called from `lib/session.ts:133` `adoptAsDraft` and `:151` `loadDraft`).
- **Labels, two sources:** `HALL_PRESETS[id].label` (select `HallBoard.tsx:556–560`, Golvklart meta `:124,479`); `UI.hallPresetStandard/Tavling/Liten/Bla/Vit` (`blockMeta.ts:280–284`) via `HomeWizard.tsx:36–42` `PRESET_LABEL`.
- **Hallöversikt chrome:** preset row `HallBoard.tsx:545–562` (label `hallLayout`, `#hall-layout-select`, `zoomBar`); `.hall-below` `:635–679`: `hallPresetMigrateNote` `:636`, `hallPresetCoachTip` `:637`, multi-line hints `:638–644`, «Tips om placering» `:645–669`, flow `CoachTipStrip` `:671–678`. Tray hints `:727–732` (`hallDragHint`, `hallSnapHint`), tray tip `tipHallPlace` `:733–740` (visibility `:129–132`).
- **Auto-place on open:** `HallBoard.tsx:156–171` (effect with `autoPlaceUnplaced` at `:165`) — if a pass has Teknik items and **no** placements, `autoPlaceUnplaced` (Slice 40 fixed grid on Blå/Vit) runs once, silently.
- **Wizard:** `HomeWizard.tsx` Q3 label `wizardQ3Label` `:106`, `wizardQ3Hint` `:124–126`, `wizardFocusHonesty` on steps 2 **and** 3 `:128–130`, chips `:203–218`.
- **Rensa passet:** `Home.tsx:155–188` (`.modal-backdrop.replace-draft-backdrop > .modal`). Phone rule `App.css:1619–1623` inside `@media (max-width: 768px)` (`:1394`): `align-items: flex-end; place-items: stretch;` → `.modal` stretches to `max-height: min(92svh, 100%)` (`:1625–1633`) = 776 px.

## 1. F1 + rename (`data/hallPresets.ts`, `blockMeta.ts`, `HomeWizard.tsx`)

- `forening-bla` label → `Gymmix – Stora hallen`; `forening-vit` label → `Gymmix – Grophallen` (en dash U+2013 with spaces, exactly as `content/microcopy.sv.md`).
- `HALL_PRESET_ORDER = ['forening-bla', 'forening-vit']`. Delete the three generic preset objects.
- Delete `UI.hallPresetStandard/Tavling/Liten/Bla/Vit`; wizard reads `HALL_PRESETS[id].label` (drop `PRESET_LABEL`).

## 2. A1 — legacy ids (`types.ts`, `lib/hall.ts`, load paths)

- `HallTemplateId = 'forening-bla' | 'forening-vit'`; `LegacyHallTemplateId = 'generic-trupp' | 'standard-trupp' | 'tavling-linjer' | 'liten-hall'`.
- `DEFAULT_HALL_TEMPLATE = 'forening-bla'`. `normalizeTemplateId` / `getPreset`: any legacy or unknown id → `forening-bla`.
- New pure helper `migrateLegacyHall(session)`: if the raw `hallTemplateId` is a legacy id (or missing/unknown **and** there are placements with a snap zone id other than `open`), set `forening-bla` and `hallPlacements: []`. Call it first in `migrateHallFields`, and in `shareToSession` (`lib/sharePass.ts:90`, the Delat pass view renders without adopting), `savedTemplateToSession`, `clubTemplateToSession`. For the read-only Delat pass view also run `autoPlaceUnplaced` after it so markers show (the builder paths already auto-place on open, `HallBoard.tsx:156–171` (effect with `autoPlaceUnplaced` at `:165`)).
- This is a deliberate exception to the Slice 05/06 «do not auto-snap on load» rule, only for legacy halls. Passes already on Blå/Vit are untouched.
- Never write a legacy id (search for string literals after the change).
- `savedTemplates.ts:114` `passSignature` uses the hall id; a legacy Mina mall and its migrated copy may no longer match as duplicates. Acceptable; mention in ship notes.

## 3. B1 — remove the layout picker (`HallBoard.tsx`)

- Delete the `<label>` and `<select id="hall-layout-select">` (`:546–560`), `handlePresetChange` `:225–230`, `applyPreset` import; delete `applyPreset` in `lib/hall.ts` (no other caller) and its tests.
- Keep `zoomBar` where Slice 43 put it (the `.hall-preset-row` wrapper can stay as the zoom row, or rename to `.hall-zoom-row`; the hall must not move down vs main at 390×844: canvas top ≤ 310).
- Edit meta line `:494–499`: add the read-only hall name after the station count, same element as Golvklart (`<span className="hall-preset-readonly">{presetLabel}</span>`).

## 4. C1 — placement texts

Delete from `HallBoard.tsx`: `hallPresetMigrateNote` + `hallPresetCoachTip` paragraphs `:636–637`; the `showMultiLineHints` block `:638–644`; the whole `.hall-hints-info` block `:645–669` (button + panel); tray hints `:727–732`; the `tipHallPlace` strip `:733–740` and `trayTipVisible` logic `:129–135` (simplify `anyEditTipVisible`, `showMultiLineHints`, `showHintsInfo`; `markHallHintsCompact` / `hallHintsCompact` in tips state become unused — delete if no other reader). Keep `hallSchematicNote`, the flow tip strip, the no-stations state `:384`, the saknar banner. Delete dead CSS (`.hall-hints-info*`, `.hall-preset-note`, `.hall-preset-coach-tip`, `.hall-preset-select`, `.hall-preset-label`, `.hall-tray-hint`, `.hall-snap-hint`) after `rg` confirms no other use.

## 5. D1 — wizard

`wizardQ3Label` → «Hall». Delete the `wizardQ3Hint` and `wizardFocusHonesty` paragraphs (`HomeWizard.tsx:124–130`) and strings. Two chips. Nothing else in the wizard changes (Slice 46).

## 6. E1 — compact confirms

- CSS (inside the ≤768 block, after `:1633`): `.modal-backdrop.modal-backdrop--compact { place-items: end stretch; }` and `.modal--compact { max-height: none; }`; `.modal--compact .modal-actions { flex-direction: row; justify-content: flex-end; }` with buttons `flex: 0 1 auto; min-height: 44px`.
- Add `modal-backdrop--compact` / `modal--compact` to: `Home.tsx` Rensa passet, `ReplaceDraftConfirm.tsx`, `NewWeekConfirm.tsx`, `TemplateConfirm.tsx`, `AdminHideConfirm.tsx`. Text unchanged.
- Target at 390×844: Rensa passet sheet height ≤ 260 px, bottom edge at the viewport bottom (safe-area padding kept).

## 6b. F3 — compact Dela sheet (`ExportSheet.tsx`, `export.css`)

Measured on main @ 4fe44c0 at 390×844 (`evidence/measurements-390x844.txt`): `.export-sheet` top 0, bottom 760, height 760 (90 %), `max-height` 759.6 px; last child ends at y 443; × 44×44 at y 8; «Kopiera länk» 127×44 at y 200; «Skriv ut passet» 143×44 at y 399.

- `ExportSheet.tsx`: add `modal-backdrop--compact` to the `.modal-backdrop.export-sheet-backdrop` div and `modal--compact` to `.modal.export-sheet`. Markup, order and strings stay as Slice 44 (heading «Dela», ×, two `.export-block` sections).
- CSS: E1's `.modal-backdrop--compact { place-items: end stretch }` puts the sheet at the bottom. Then, inside the ≤768 block of `export.css` (it loads after `App.css`), `.export-sheet.modal--compact { max-height: min(92svh, 100%); overflow: auto; }`. Dela keeps a cap and inner scroll (unlike the short confirms, where E1 sets `max-height: none`), because the copy-failed line + link field and the print-stalled line can make it taller. Keep `padding-bottom: max(20px, env(safe-area-inset-bottom))`.
- Do **not** apply E1's row layout for `.modal-actions` here; Dela has none. Buttons keep min-height 44 px.
- Close paths unchanged: × and backdrop tap. Desktop (≥769) unchanged.
- If Christoffer picks E2 instead of E1: only the `export.css` cap override is needed. If E3: add the two compact classes and their phone CSS for Dela alone.
- Target at 390×844: sheet bottom = 844, height ≤ 480 px, top ≥ 364.

## 7. Dead code and strings

| What | Where |
|---|---|
| 3 generic preset objects | `data/hallPresets.ts:122–268` |
| `applyPreset`, `handlePresetChange`, `HALL_PRESETS` import in HallBoard if unused | `lib/hall.ts:405–457`, `HallBoard.tsx:21,25,225–230` |
| Strings `hallLayout`, `hallPresetStandard/Tavling/Liten/Bla/Vit`, `hallPresetMigrateNote`, `hallPresetCoachTip`, `hallSnapHint`, `hallDragHint`, `hallHintsInfo`, `hallHintsInfoAria`, `hallHintsHide`, `hallHintsHideAria`, `tipHallPlace`, `wizardQ3Hint`, `wizardFocusHonesty` | `data/blockMeta.ts` (check each with `rg`; `hallStationOrderHint`, `hallStationsOnlyHint`, `hallTileHint` may still be used by the no-stations state or a11y — keep any that are) |
| `TIP_HALL_PLACE` constant, `hallHintsCompact` | `lib/coachTips.ts:6,36,80,144`, if unused |
| Zone-snap code only the generic halls used | leave in place this slice (`pointInZone`, snaps) unless unused after `tsc`; no refactor |

## 8. Tests

- `lib/hallGrid.test.ts`: drop the Standard/Tävling/Liten golden rows and the `verifier/slice-40-golden-main-45cce9b.json` comparison (`:120–123`); keep Blå/Vit cells (12 / 9).
- Update `hallSuggest`, `sharePass`, `clubTemplates`, `runPass`, `weekCopy` tests that build sessions with generic ids (use `forening-bla`), and add: a legacy `standard-trupp` pass with placements → after `migrateHallFields` it is `forening-bla` with markers on the open grid in pass order; a `forening-vit` pass is unchanged.
- Slice bump `data/blockMeta.ts:111` → `'45'`; asserts `lib/feedback.test.ts:25/45/46`, `lib/clubTemplates.test.ts:316` (they read `'44'` after Slice 44).
- `bun test src`, `npx tsc -b`, `npm run lint`, `npm run build` green.

## 9. Bundle

Estimate **−1.2 to −1.8 kB gz** (not measured). Report JS + CSS gz deltas vs the Slice 44 baseline in the PR.

## 10. Self-smoke

`evidence/capture-390x844.mjs` adapted: wizard Q3 shows 2 chips; Mer → Dela sheet bottom-anchored and ≤ 480 px tall; Hallöversikt has no select and no text under the hall except caption + flow tip; Rensa passet sheet height; a draft injected with `hallTemplateId: 'standard-trupp'` and old placements opens on Stora hallen with grid markers.
