# Slice 46 — Builder handoff

**Status:** PROPOSED 2026-10-17 (not locked). Written against ★ answers A1 B1 C1 D1 E1 F1. Base: `origin/main` @ `4fe44c0` for the line refs below; **build on top of Slice 45** (same files). Scope: `components/HomeWizard.tsx`, `components/Home.tsx`, `App.tsx`, `components/LibraryPanel.tsx` (extract the mall list), new `components/MallList.tsx`, new `components/AppFooterLinks.tsx`, `lib/wizard.ts`, `data/blockMeta.ts`, `App.css`, `export.css`, tests. No data format change, no new storage key, no SQL.

## What exists today (main @ 4fe44c0)

- **Start page:** `Home.tsx:68–86` primary button (Fortsätt passet with a draft, otherwise Planera pass → `setWizardOpen(true)`); `:89–96` `.home-start-links` with «Tomt pass» (`onNew`) and «Från mall» (`onTemplate`); `:97–105` «Rensa passet»; `:110` note `UI.draftHonestyBodyShort`; `:111–118` «Hämta ett pass».
- **App wiring:** `App.tsx` `goNew` (blank pass → Passbyggaren), `goTemplate` (blank pass + `openTemplates = true` → Passbyggaren opens the Mallar tab via `initialTemplatePicker`), `goWizardFinish` (`composeWizardSession` → `saveDraft` → `markFresh` → Passbyggaren), `handleInitialTemplateConsumed`, `key={session.id + (openTemplates ? '-tmpl' : '')}`.
- **Footer:** `App.tsx` `<footer className="app-footer">`: slice label (not on home) · admin span (`adminAvailable()`: Logga in som admin / Admin / Du är inloggad men inte admin. + Logga ut) · `<FooterFeedback />` (Tyck till + its fallback line) · Visa tips igen (not on home) · Uppdatera appen. CSS `App.css:437–447` (flex-wrap, centred), `export.css:1437–1457`, `:367–374`. Start pane height `export.css:1586–1602` `.home.home-entry { min-height: calc(100svh - 56px) }`.
- **Wizard:** `HomeWizard.tsx` (`step: 1 | 2 | 3`, `handleBack`, `handleNext`, `handleFinish`, `canNext`, `canFinish`, × `:109–117`, hint `:120–122` / `:124–126`, honesty `:128–130`, options `:132–219`, actions `:221–245`). Progress `wizardStepProgressText(n)` (`blockMeta.ts:761`, template `'Fråga {n} av 3'` `:449`).
- **Compose:** `lib/wizard.ts:composeWizardSession` (no `targetMinutes`, so 60). Paths `data/wizardPaths.ts`.
- **Mall list:** `LibraryPanel.tsx:292–347` (`ClubTemplatesSection` or the admin slot, Mina mallar with Kopiera delningskod / Ta bort, `savedTemplatesHint`, built-in `seedTemplates`). Apply: `SessionBuilder.tsx:362–410` `pick`, `handleConfirmTemplate`, `handleConfirmSaved`, `handleConfirmClub`.
- **Pass length:** `PASS_LENGTHS`, `DEFAULT_TARGET_MINUTES`, `PassLength` (`blockMeta.ts:101–108`); `setSessionLength`, `passLengthOf` (`lib/session.ts:74–83`).

## 1. A1 — one button on the start page (`Home.tsx`)

- No draft: «Planera pass» (primary) → opens the sheet. Delete `.home-start-links` (`:89–96`) and the `onNew` / `onTemplate` props.
- With a draft: «Fortsätt passet» (primary, unchanged), then «Planera pass» as `btn-secondary home-start-secondary` (min-height 48), then «Rensa passet».
- Keep «Hämta ett pass» and its panel unchanged.

## 2. The sheet: steps and paths (`HomeWizard.tsx`, pure helper in `lib/wizard.ts`)

Replace `step: 1 | 2 | 3` with a path and a step list, as a pure, tested helper:

```ts
type WizardPath = 'questions' | 'empty' | 'mall'
type WizardStep = 'age' | 'focus' | 'hall' | 'length' | 'mall'
const STEPS: Record<WizardPath, WizardStep[]> = {
  questions: ['age', 'focus', 'hall', 'length'],
  empty: ['hall', 'length'],
  mall: ['hall', 'mall'],
}
```

- The sheet opens on `questions` / `age`. Under the age chips (only when the Nivå list is closed): a 1 px divider, then two `btn-text` links «Starta från mall» (→ path `mall`, step `hall`) and «Tomt pass» (→ path `empty`, step `hall`).
- Progress line: `wizardStepProgressText(index + 1, steps.length)` → «Fråga 2 av 4», «Fråga 1 av 2».
- Headings: age `wizardQ1Label` «Ålder» (Nivå list: `wizardQ1Level` «Nivå»), focus `wizardQ2Label` «Fokus», hall `wizardQ3Label` «Hall» (Slice 45), length `UI.passLength` «Passlängd», mall `wizardMallLabel` «Mall».
- Hall chips: `HALL_PRESET_ORDER.map(id => HALL_PRESETS[id].label)` (Slice 45, two chips).
- Length chips: `PASS_LENGTHS.map(n => \`${n} ${UI.passLengthMinutes}\`)` → «60 min», «90 min», «120 min». No chip is preselected.

## 3. C1 — auto-advance, Tillbaka, Avbryt

- Tap on a chip: set the answer, mark it (`aria-selected`, `.selected`), then after **250 ms** go to the next step. Ignore further taps on the sheet during those 250 ms (no double advance). With `prefers-reduced-motion`, no transition, same delay.
- «Nivå» chip opens the Nivå list (not an answer). A tap on «Nivå N» is the answer and advances.
- Last step of a path: the tap finishes (see §5). Delete `handleNext`, `handleFinish`, `canNext`, `canFinish` and the «Nästa» / «Skapa pass» buttons.
- Bottom row (`.home-wizard-actions`): «Tillbaka» (`btn-secondary`, left) and «Avbryt» (`btn-text`, right), both ≥ 44 px tall.
  - Step `age` with the Nivå list closed: Tillbaka is **not rendered**; only Avbryt.
  - Nivå list open: Tillbaka closes the list, clears the level, keeps the sheet on `age`.
  - First step of `empty` / `mall` (`hall`): Tillbaka goes back to `questions` / `age`.
  - Any other step: one step back in the same path, earlier answers kept and marked.
- Avbryt and a tap on the backdrop: `onCancel()`: close the sheet, nothing composed or saved, `loadDraft()` unchanged, answers dropped (state lives in the sheet), focus back on the «Planera pass» button (`ref` in `Home.tsx`).
- Delete the header × (`:109–117`) and `UI.wizardClose`.
- After each advance move focus to the step heading (`h2` with `tabIndex={-1}`); the progress line is `aria-live="polite"`.

## 4. D1 — Passlängd (`lib/wizard.ts`)

- `WizardAnswers` / `WizardFinishAnswers` gain `targetMinutes: PassLength`. `composeWizardSession` sets `targetMinutes: answers.targetMinutes` on the session. Content unchanged (53 min).
- Tomt pass: `setSessionLength(createBlankSession(), length)`.

## 5. Where each path lands (`App.tsx`)

Replace `goNew`, `goTemplate`, `goWizardFinish` with one `finishPlan(result)`:

| Path | Result | Lands |
|---|---|---|
| `questions` | `composeWizardSession({ age, level, focus, hallTemplateId, targetMinutes })`, then `saveDraft`, `markFresh` (as `goWizardFinish` today) | **Passbyggaren** (`view = 'builder'`) |
| `empty` | `createBlankSession()` with `hallTemplateId` and `targetMinutes` set, `markFresh` (as `goNew` today: not written until the first change) | **Passbyggaren** |
| `mall` | the chosen mall through the same code as `handleConfirmTemplate` / `handleConfirmSaved` / `handleConfirmClub` (save on apply, `markFresh`, undo toast «Mallen är i Passbyggaren. · Ångra»), then `hallTemplateId` = the Hall answer; if that differs from the mall's own hall, `hallPlacements: []` and `autoPlaceUnplaced` | **Passbyggaren** |

- Move the three confirm bodies from `SessionBuilder.tsx` into a pure `lib/mallApply.ts` (`applyMall(kind, item, hallTemplateId)`) so the start page and the Mallar tab (until Slice 47) share them. `lib/mallApply.test.ts` already exists; extend it.
- Delete `openTemplates`, `handleInitialTemplateConsumed`, the `-tmpl` key suffix and the `initialTemplatePicker` / `onInitialTemplateConsumed` props (no other caller).

## 6. B1 — the Mall step (`MallList.tsx`)

- Extract `LibraryPanel.tsx:292–347` into `components/MallList.tsx` with props `{ onPickBuiltIn, onPickSaved, onPickClub, showAdmin?: boolean }`. LibraryPanel renders it unchanged (admin slot, Kopiera delningskod, Ta bort stay there). The sheet renders it **without** admin tools and **without** Kopiera delningskod / Ta bort: a tap on a card is the choice.
- Order in the sheet: Föreningens mallar (with its own loading and empty states from `ClubTemplatesSection`), Mina mallar (hidden when empty), the built-in mallar. Same card text as today.
- The step scrolls inside the sheet (`max-height` as the wizard today).

## 7. E1 — start page and footer (`Home.tsx`, `App.tsx`, new `AppFooterLinks.tsx`, CSS)

- New `AppFooterLinks` renders the rows; `App.tsx` uses it in `.app-footer` for builder / hall, and `Home.tsx` renders it inside `.home-entry-foot` (after «Hämta ett pass»). `App.tsx` renders no `.app-footer` on `view === 'home'`, so the start pane controls its own height and the hero (`min-height: 120px`) gives way.
- Rows (each `display: flex; justify-content: center; flex-wrap: nowrap; gap: 4px`, separators inside a row only, never at a row end):
  - Start page: row 1 «Tyck till · Uppdatera appen»; row 2 the admin state (only if `adminAvailable()` and not `checking`): «Logga in som admin» / «Admin · Logga ut» / «Du är inloggad men inte admin. · Logga ut» (the last may wrap as text, its button stays whole); row 3 the note `UI.draftHonestyBodyShort`, 12 px, line-height 16 px, `var(--md-on-surface-variant)`.
  - Passbyggaren / Hallöversikt: row 1 «Tyck till · Visa tips igen · Uppdatera appen»; row 2 admin as above; row 3 `footerSliceLabel` 12 px muted. The Visa tips igen status line stays where it is.
  - The Tyck till fallback line (`FooterFeedback` `<p>`) stays its own row under row 1.
- Links: `btn-text`, `min-height: 44px`, `padding: 0 8px`, 14 px. Align all row items on one baseline (`align-items: center`); today «Tyck till» renders higher than «Logga in som admin».
- Delete `.home.home-entry { min-height: calc(100svh - 56px) }` reliance on a fixed footer height: `min-height: 100svh` for the start page now that the footer is inside it.
- Keep `.no-print` on the footer and the foot rows.
- Target at 390×844, no draft, admin available: document height ≤ 844 (no scroll); «Uppdatera appen» and «Logga in som admin» bottom ≤ 844 − safe area; Planera pass top ≥ 400.

## 8. Strings (`data/blockMeta.ts`)

As `content/microcopy.sv.md`: change `wizardStepProgress` to `'Fråga {n} av {total}'` and `wizardStepProgressText(n, total)`; add `wizardMallLabel: 'Mall'`. Everything else reuses existing keys.

## 9. Dead code (F1)

| What | Where | Note |
|---|---|---|
| `UI.wizardNext`, `UI.wizardFinish`, `UI.wizardClose` | `blockMeta.ts:451, 453, 454`; `HomeWizard.tsx` | no longer read after C1 |
| `UI.fromTemplate` «Från mall» | `blockMeta.ts:136`; `Home.tsx` | start-page link gone; `UI.startFromTemplate` «Starta från mall» is now read |
| `UI.homeWizardPrimaryDesc`, `homeWizardPrimaryAria`, `homeInvite`, `planFirst`, `newSession`, `browseTemplates`, `continueDraft`, `startFromTemplateDesc` | `blockMeta.ts:116–139` | no reader on main (`rg` in `src` incl. tests); delete |
| `UI.draftHonestyTitle`, `draftHonestyBody`, `draftHonestyOtherDevice`, `draftHonestyDismiss`, `omUtkast` | `blockMeta.ts:702–709` | no reader on main; delete. Keep `draftHonestyBodyShort` |
| `UI.wizardQ3Hint`, `UI.wizardFocusHonesty`, `PRESET_LABEL` | `blockMeta.ts:468–469`; `HomeWizard.tsx` | only if Slice 45 has not already removed them |
| `handleNext`, `handleFinish`, `canNext`, `canFinish`, header × | `HomeWizard.tsx` | C1 |
| `onNew`, `onTemplate` props; `goNew`, `goTemplate`, `goWizardFinish` | `Home.tsx`, `App.tsx` | replaced by `finishPlan` |
| `openTemplates`, `handleInitialTemplateConsumed`, `-tmpl` key; `initialTemplatePicker`, `onInitialTemplateConsumed` | `App.tsx`, `SessionBuilder.tsx:85, 103, 114–116, 261–263, 372–373, 407` | no other caller |
| `.home-start-links`, `.home-alt`, `.home-alt:hover` | `export.css:1683–1700` | |
| `.home-wizard-honesty` | `App.css:3241–3251` | only if Slice 45 has not removed it; keep `.home-wizard-hint` (Nivå hint) |
| fixed footer reserve `calc(100svh - 56px)` | `export.css:1602` | §7 |

Check every row with `rg` before deleting; keep anything a test or another view still reads.

## 10. Tests

- New `lib/wizardSteps.test.ts` (or in `wizard` tests): `STEPS` per path; back from `age` is `cancel`; back from `hall` in `empty` / `mall` returns to `questions` / `age`; back keeps answers; the last step finishes.
- `composeWizardSession` with `targetMinutes: 90` → session `targetMinutes === 90`, `totalMinutes === 53`, `hallTemplateId` as answered, Teknik placed (`forening-vit` and `forening-bla`).
- `lib/mallApply.test.ts`: `applyMall` with a Hall answer that differs from the mall's hall → hall replaced, placements re-made; same hall → Mina mall placements kept.
- `wizardStepProgressText(2, 4) === 'Fråga 2 av 4'`.
- **Slice bump:** `data/blockMeta.ts:111` `SLICE_NUMBER` `'45'` → `'46'`. Asserts: `lib/feedback.test.ts:25` (`'Version: Slice 46'`), `:45` (`SLICE_NUMBER, '46'`), `:46` (`'Träningsplaneraren · Slice 46'`); `lib/clubTemplates.test.ts:316` (`'Träningsplaneraren · Slice 46'`). If Slice 45 has not shipped they read `'44'`.
- `bun test src`, `npx tsc -b`, `npm run lint`, `npm run build` green.

## 11. Bundle

Expected **+0.3 to +0.9 kB gz JS** (step helper, Mall step reusing the extracted list, footer rows) minus about 0.4 kB of removed strings, buttons and the one-shot flag; CSS about even. Soft budget **+1 kB gz**. Estimate, not measured: report JS + CSS gz vs the Slice 45 build in the PR.

## 12. Self-smoke

Adapt `evidence/capture-390x844.mjs`: start page without and with a draft (no scroll, footer rows, note); questions path with 4 taps and no Nästa; Tomt pass path (Grophallen, 90 min); mall path (Grophallen, Nybörjare); Tillbaka and Avbryt on each step; Passbyggaren footer. Verifier: `verify-traningsplaneraren/features/home-kom-igang.md` and `starta-fran-mall.md` describe the old start page and the Mallar tab path and will need a refresh (Verifier owns them).
