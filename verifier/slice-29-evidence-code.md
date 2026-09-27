# Slice 29 Home wizard — code evidence

**Scope:** code evidence only; no product code changed by this verification. Source tree: `/workspace/gymnastics-planner`, app source under `/workspace/gymnastics-planner/app/src`.

## Result

| Lock | Result |
|---|---|
| A1 | **PASS** |
| B1 | **PASS** |
| C1 | **PASS** |
| D1 | **PASS** |
| E1 | **PASS** |
| F1 | **PASS** |

`cd app && npm run build` completed successfully (TypeScript + Vite).

## A1 — Home CTA and invite: PASS

- `app/src/components/Home.tsx:112-124` — the first action is `className="home-card primary"`, opens the wizard with `onClick={() => setWizardOpen(true)}`, and renders `UI.homeWizardPrimary`.
- `app/src/components/Home.tsx:126-140` — the two escape cards are non-primary `home-card` buttons wired to `onNew` and `onTemplate`, rendering `UI.newSession` and `UI.startFromTemplate`.
- `app/src/data/blockMeta.ts:105-119` — exact strings: `newSession: 'Nytt pass'`, `startFromTemplate: 'Starta från mall'`, `homeInvite: 'Tre frågor ger dig ett färdigt pass. Du kan fortfarande börja tomt eller från mall.'`, and `homeWizardPrimary: 'Planera pass'`.
- `app/src/components/Home.tsx:94-100` — the invite is rendered as `{UI.homeInvite}`.

## B1 — Three question option sets and honesty copy: PASS

- `app/src/components/HomeWizard.tsx:19-31` — Q1 array contains `age46`, `age79`, `beginner`, `training`; Q2 contains `vault`, `trampett`, `tumbling`, `mixed`.
- `app/src/data/blockMeta.ts:373-382` — exact labels are `4–6 år`, `7–9 år`, `Nybörjare`, `Träning`; and `Satsbräda`, `Trampett`, `Tumbling`, `Blandat`.
- `app/src/components/HomeWizard.tsx:33-37` — Q3 maps the three existing preset IDs to the locked UI labels; `app/src/data/hallPresets.ts:32-36` fixes the order to `standard-trupp`, `tavling-linjer`, `liten-hall`.
- `app/src/data/blockMeta.ts:383-385` — Q3 label/hint and honesty copy: `Välj den layout som liknar er hall. Teknik fäster i zon efter fokus.` and `Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok.`
- `app/src/components/HomeWizard.tsx:105-110` — Q3 hint and focus honesty are actually rendered; honesty is shown on steps 2 and 3.

## C1 — Composition, budgets, durations, and curated paths: PASS

- `app/src/data/blockMeta.ts:3-24` — the five block order is `gathering`, `warmup`, `techniques`, `strength`, `fun_and_games`; labels are Samling, Uppvärmning, Teknik, Styrka, Lek och spel. Budgets are 6, 10, 20, 15, 10.
- `app/src/data/wizardPaths.ts:15-32` — shared skeleton is Samling `3 + 3`, warmup `warm-hall-varv` `10`, strength `5 + 8`, and fun `6`.
- `app/src/lib/wizard.ts:67-106` — `composeWizardSession` creates empty blocks, fills each of the five blocks, and applies the shared skeleton plus the focus-specific Teknik items.
- `app/src/data/wizardPaths.ts:42-63` — exactly four curated focus path arrays (`vault`, `trampett`, `tumbling`, `mixed`), not a full 4×4 age×focus matrix. `app/src/data/wizardPaths.ts:65-87` adds only a small age46 override.
- `app/src/data/wizardPaths.ts:90` and `app/src/lib/wizard.ts:86-91` — every wizard Teknik item is assigned `WIZARD_TEKNIK_DURATION = 6`; three items therefore total 18, under the Teknik budget of 20. This is a deliberate budget-safe override: for example, the seed defaults for `tech-satsbrada-volt-rygg` and `tech-trampett-volt-mattberg` are 9 minutes (`app/src/data/seedActivities.ts:217-245`).
- `app/src/data/wizardPaths.ts:26` — wizard warmup is explicitly 10, not the short-mall 11. The existing short mall remains separate at `app/src/data/seedTemplates.ts:51-67` (`6 + 5`).

## D1 — Q3 preset and Teknik-only pre-placement: PASS

- `app/src/lib/wizard.ts:67-70,108-116` — Q3 is normalized into `hallTemplateId` and stored on the composed session, initially with empty placements.
- `app/src/lib/wizard.ts:33-50` — `mapActivityToZone` implements the tag map: vault → vault, trampett → trampett, floor plus flickis/rondat → tumbling, other floor/fallback → open.
- `app/src/lib/wizard.ts:118-131` — the finish loop iterates only `techniques?.items`, calls `mapActivityToZone`, selects the chosen preset zone, and writes via `upsertPlacement`.
- `app/src/lib/hall.ts:106-118` — `isPlaceableItem` returns true only when the activity block type is `techniques`; `placeableItems` uses that single source of truth. This prevents Samling from being placeable.
- `app/src/lib/hall.ts:306-335` — `upsertPlacement` rejects non-placeable items and preserves the normalized `hallTemplateId` while writing the placement.

## E1 — Soft blank, mall clone, and cancel/save boundary: PASS

- `app/src/lib/session.ts:38-57` — `createBlankSession` injects only the Soft Samling pair `gather-narvaro` 3 and `gather-dagens-teknik` 3, with empty `hallPlacements`.
- `app/src/lib/session.ts:72-97` — `cloneTemplate` copies the authored template items, resets generated IDs/order and block budgets, and returns through `clearHallPlacements`; it does not use wizard answers.
- `app/src/App.tsx:85-99` — `goNew` and `goTemplate` retain the existing escape paths through `createBlankSession`; template mode only opens the picker.
- `app/src/components/SessionBuilder.tsx:179-188` — mall application happens only after `pendingTemplate` is confirmed and calls `cloneTemplate(pendingTemplate)`.
- `app/src/components/HomeWizard.tsx:48-64,76-78` — Back/close/backdrop cancel calls `onCancel`; only `handleFinish` calls `onFinish` with all three answers.
- `app/src/App.tsx:101-109` — only the finish handler composes, replaces the live session, calls `saveDraft(next)`, and navigates to Passbyggaren. `Home.tsx:248-252` wires cancel to only `setWizardOpen(false)`.
- Slice-28 blast-radius check: `app/src/data/seedTemplates.ts:32-49` keeps the beginner mall’s Soft pair at 3+3; `app/src/data/seedTemplates.ts:51-67` keeps the separate short mall (including its 11-minute warmup). The wizard has no template import or clone call.

## F1 — Footer and exclusions: PASS

- `app/src/data/blockMeta.ts:386-387` — `footerSliceLabel: 'Träningsplaneraren · Slice 29'`.
- `app/src/App.tsx:260-263` — the application footer renders `UI.footerSliceLabel`.
- `app/src/App.tsx:101-109` — wizard finish contains only compose/save/navigation; there is no Pages operation and no `Använd alla förslag`/apply-all call on finish.
- `app/src/components/HallBoard.tsx:296-301` — `Använd alla förslag` remains an existing explicit Hall action, separate from wizard finish; `app/src/components/Home.tsx:227-246` retains the existing Slice 23 phone/Pages URL aside, also separate from the wizard path. Thus no new Pages or Använd-alla-on-finish behavior was introduced.
- Full-matrix exclusion is also evidenced by the four-key curated table at `app/src/data/wizardPaths.ts:42-63`; no 16-path table exists in the wizard composer.
