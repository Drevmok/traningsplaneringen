# Slice 45 — Hallar och städning

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-17 by Christoffer: A1 B1 C1 D1 E1 F1 F3 (the ★ recommendations). Spelling «Gymmix» confirmed.** Docs pack only, no app code. Branch `slice-45-docs` from `origin/main` @ `0d88da5`, merged with `origin/main` @ `4fe44c0` (Slice 44 live). Builder starts from this tip.  
**Effort:** **M** (see below).  
**Source:** `feedback/2026-10-17-christoffer.md` row B: «Blå->"Gymmix – Stora hallen", Vit->"Gymmix – Grophallen", remove other halls, remove layout picker, placement texts, Tips om placering, focus-explainer text; compact Rensa passet dialog.» F3 (compact Dela sheet) added on Planner's request 2026-10-17.

## Why

The club trains in two real halls. The app still offers three generic schemes, a layout picker, and six lines of placement help that explain zone snapping. That snapping only exists in the generic schemes: Blå and Vit have one free zone (Öppen yta) and a fixed grid (Slice 40). Once the generic halls go, most of that text is no longer true. And since Slice 44 the Dela sheet holds two buttons but still covers 90 % of a phone screen.

**Coach outcome:** «Jag väljer Stora hallen eller Grophallen, och hallen visar bara hallen.»

## Measured today (main @ 0d88da5, 390×844, `evidence/`)

- Hall names come from **two sources**: `HALL_PRESETS[id].label` (`data/hallPresets.ts`; layout select, Golvklart meta) and `UI.hallPresetBla/Vit/Standard/Tavling/Liten` (`data/blockMeta.ts:280–284`; wizard Q3 via `HomeWizard.tsx:36–42`).
- `DEFAULT_HALL_TEMPLATE = 'standard-trupp'` (`lib/hall.ts:21`). Every Tomt pass, Från mall pass and old draft without a hall is on «Standard trupp» today, so many saved passes reference a generic id.
- Hallöversikt: «Hallayout» + select + zoom − / + on one row (y 202–246). Under the hall: migrate note, Blå/Vit coach tip, «Tips om placering» (panel with 5 lines), flow coach tip. Tray: drag and snap hints (when hints are not compact).
- Wizard Q3 «Hallayout»: 5 chips + «Välj den layout som liknar er hall. Teknik fäster i zon efter fokus.» + «Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok.» Both sentences describe zone snapping by focus.
- Rensa passet dialog: **776 px tall** at 390×844 for ~210 px of content. Cause: `App.css:1619–1623` (≤768) `.modal-backdrop { align-items: flex-end; place-items: stretch }`; the later `place-items` shorthand resets `align-items` to `stretch`, so `.modal` fills to its `max-height` (92svh). The same rule hits all 16 dialogs that use `.modal-backdrop`.

- Dela sheet (Slice 44, main @ 4fe44c0, `evidence/main-390x844-dela.png`): Mer → Dela opens a sheet from **y 0 to 760**, 90 % of the screen, top-aligned. Its content (Dela, ×, Kopiera länk with its hint, Skriv ut passet with its hint) ends at **y 443**, so about 300 px of the sheet is empty white. Cause: the same `place-items: stretch` rule as Rensa passet, plus `export.css:3–6` `.export-sheet { max-height: min(90vh, 760px) }`, which wins over the phone `max-height` because `export.css` loads after `App.css`.

## Ids and saved passes

`forening-bla` and `forening-vit` **stay** (saved passes, Mina mallar, föreningens mallar and `#dela=` links reference them). Only their display names change. The three generic ids (`standard-trupp`, `tavling-linjer`, `liten-hall`, plus legacy `generic-trupp`) can no longer be chosen, but old data with them must still open (option A).

## Options (★ = Docs recommendation)

### A — Passes saved on a removed hall
- **A1 ★** On load (`lib/hall.ts:migrateHallFields`, the path drafts, Mina mallar, föreningens mallar and share links all use), map any legacy id to `forening-bla` and drop that pass's hall placements, so the existing silent auto-place (Slice 40 fixed grid) puts the Teknik markers in pass order on Stora hallen. A marker position from a generic drawing means nothing on the club drawing. Never write a legacy id again. Coach sees: old pass opens on «Gymmix – Stora hallen» with tidy markers.
- **A2** Map to `forening-bla` but keep x/y (clamped). Markers land in arbitrary spots on the club drawing, some on walls.
- **A3** Keep the three generic presets in data, hidden, so old passes look as before; only new passes use Gymmix. Two hall worlds stay; zone code and text stay alive. Against «remove other halls».

### B — Choosing the hall without a layout picker
- **B1 ★** Remove the «Hallayout» label and select from Hallöversikt. The hall is chosen in Planera pass (wizard Q3, two chips). Tomt pass and Från mall start on Stora hallen. Hallöversikt shows the hall name read-only in the meta line (like Golvklart). The zoom − / + stays where it is. Slice 46 (row C) puts mall and tomt inside Planera pass, so every pass gets the Hall question then.
- **B2** Replace the select with a two-part toggle «Stora hallen | Grophallen» in Hallöversikt. Smaller, but still a picker.
- **B3** Keep the select with two options. Against the feedback.

### C — Placement texts in Hallöversikt
- **C1 ★** Remove: migrate note, Blå/Vit coach tip, the multi-line hints (Stationsordning följer passet · Endast Teknik-stationer… · Stationerna visas som markörer…), «Tips om placering» button and panel, tray drag and snap hints, and the coach tip strip `tipHallPlace` (it says stations are suggested «i zonen för redskapet», which is no longer true). Keep: «Schematisk hall — inte exakt mått», the flow tip strip about the numbers (`tipHallFlowGolvklart`, dismissable), the no-stations empty state, the saknar-redskap banner.
- **C2** As C1 but keep `tipHallPlace` with new wording («Stationerna läggs ut i passets ordning. Dra en markör om den ska stå någon annanstans.»). One rewritten string.
- **C3** Remove all text under the hall, including the flow tip strip.

### D — Wizard hall step and the focus explainer
- **D1 ★** Q3 label «Hallayout» → «Hall»; two chips «Gymmix – Stora hallen», «Gymmix – Grophallen»; remove `wizardQ3Hint` and `wizardFocusHonesty` (both explain zone snapping by focus). Step count stays «Fråga 3 av 3» (Slice 46 reworks the wizard).
- **D2** As D1 but keep one short line: «Välj hallen ni tränar i.»
- **D3** Names only; leave texts until Slice 46.

### E — Compact «Rensa passet?»
- **E1 ★** Add a `modal--compact` variant: on phone the sheet is as tall as its content and sits at the bottom, buttons side by side (≥ 44 px), same text. Use it for Rensa passet and the other short confirms with the same problem (`ReplaceDraftConfirm`, `NewWeekConfirm`, `TemplateConfirm`, `AdminHideConfirm`). Tall sheets unchanged (Dela: see F3).
- **E2** Fix the shared rule for all 16 dialogs (`place-items: end stretch`). One line, but every dialog moves; larger verify surface.
- **E3** Only Rensa passet.

### F — Copy, ids, budget and the Dela sheet

F1 and F2 are either/or. F3 is an add-on: it can be picked with F1 or F2.

- **F1 ★** Ids unchanged; one label source (`HALL_PRESETS[id].label`, wizard reads it; delete `UI.hallPreset*`); strings as `content/microcopy.sv.md`; no locked term changes; `SLICE_NUMBER = '45'`. Budget +512 B gz soft; expected **−1.2 to −1.8 kB gz** (3 preset definitions, ~14 strings, `applyPreset`, select and hint JSX removed; estimate, not measured).
- **F2** Keep `UI.hallPreset*` and sync both sources. Duplicate labels drift.
- **F3 ★** Compact Dela sheet on phones. Mer → Dela becomes a bottom sheet as tall as its content: Dela heading with ×, «Kopiera länk», «Skriv ut passet», texts exactly as Slice 44. At 390×844 that is about 460 px instead of 760 px, and the pass stays visible above it. If the copy fails or printing stalls, the extra line (and link field) makes the sheet grow, up to the usual 92 % cap, and it scrolls inside. Desktop is unchanged (already content height). No new strings. About +60 B gz CSS (estimate).
  - **F3 and E1:** F3 uses the E1 `modal--compact` variant (one sheet style, no second CSS path), but stays its own choice because Dela is a menu, not a confirm, and E1 keeps menus tall. With E2 the shared fix already moves Dela to the bottom and F3 only removes the `export.css` height cap; with E3 F3 brings `modal--compact` in for Dela alone.

## Effort: M

F3 adds about 10 lines (two class names, one CSS override) and three ACs; it does not change the size. Not S: data migration for legacy ids touching every load path (drafts, Mina mallar, föreningens mallar, share links), 6 test files reference generic ids (`hallGrid` golden snapshot for Standard/Tävling/Liten, `hallSuggest`, `sharePass`, `clubTemplates`, `runPass`, `weekCopy`), `HallTemplateId` type narrows, wizard and Hallöversikt chrome changes, a dialog variant across 5 confirms. Not L: no new screen, no new state, ids stable.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes, file:function refs
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC21 (against ★; AC19–AC21 are F3)
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — renamed, removed and kept strings
- [`evidence/`](./evidence/) — main @ 0d88da5 screenshots, the Dela sheet @ 4fe44c0, `measurements-390x844.txt`
- Living docs: Slice 45 notes in `docs/ui-chrome.sv.md`, `hall-presets-copy.sv.md`, `home-wizard.sv.md`, `copy-quieter-chrome.sv.md`, `hall-declutter.sv.md`, `golvklart-copy.sv.md`

## Out of scope

Dela contents and its texts (locked in Slice 44; F3 changes only the sheet size), wizard order and auto-advance (Slice 46), Planera pass merge (Slice 46), Lägg till övning / Admin (Slice 47), Hallöversikt edit mode and pinch (Slice 48), new hall drawings, renaming the hall zone «Öppen yta», print content (Slice 44).

## Open items

1. Christoffer to lock A–F. A1 moves old Standard/Tävling/Liten passes to Stora hallen and re-places their markers; B1 means a mall or tomt pass can only be on Grophallen after Slice 46 (or never, if 46 is parked).
2. Exact names: the feedback writes «Gymmix – Stora hallen» / «Gymmix – Grophallen» with an en dash; Docs kept that. Confirm the club name spelling «Gymmix».
3. «focus-explainer text» read as `wizardQ3Hint` + `wizardFocusHonesty`. If Christoffer meant something else (e.g. the flow tip about the numbers), adjust C/D.
4. Föreningens mallar already published with a generic hall: A1 handles them on load; nothing to change in Supabase (no SQL).
5. Slice 44 is live (merge `4fe44c0`). The test asserts read `'44'` and move to `'45'`.
6. F3: confirm the Dela sheet keeps both hint lines from Slice 44. They take about 200 of the 460 px. Dropping them would make the sheet about 260 px (estimate), but that reopens Slice 44 copy, so Docs did not propose it.
7. Focus explainer, checked in `app/` on main @ 4fe44c0: the only text that explains focus is `wizardFocusHonesty` («Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok.», `data/blockMeta.ts:469`, rendered in `components/HomeWizard.tsx:128–130` on wizard steps 2 **and** 3, CSS `.home-wizard-honesty` `App.css:3241–3251`). `wizardQ3Hint` (`blockMeta.ts:468`, `HomeWizard.tsx:124–126`) also mentions focus («Teknik fäster i zon efter fokus.»). D1 removes both, so Slice 45 covers it. No other coach-facing focus explainer exists (`rg -i fokus` outside seed texts finds only `wizardQ2Label` «Fokus»).
