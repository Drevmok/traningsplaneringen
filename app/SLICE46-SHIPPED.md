# Slice 46 — Startsidan + Planera pass

Locked **A1 B1 C1 D1 E1 F1** (Christoffer 2026-10-17). Branch `slice-46-code` from `slice-46-docs` @ abbd242 (includes main @ bc8cce0). Open items answered: «header buttons» = the footer row; Planera pass replaces the draft without asking (as today); `draftHonestyBodyShort` = «Passen sparas bara på den här enheten.»

## What changed
- **A1 start page:** no draft → one primary «Planera pass»; draft → «Fortsätt passet» (title · min), «Planera pass» (secondary), «Rensa passet». «Tomt pass» / «Från mall» buttons, the invite line and the old local-save note are gone. «Hämta ett pass» unchanged. The page fits 390×844 with the footer inside `.home-entry-foot` (`min-height: 100svh`).
- **B1/C1 Planera pass sheet:** «Fråga n av total» (aria-live), heading focused on each step. Chips auto-advance after 250 ms (double tap guarded); no Nästa / Skapa pass, no ×. Tillbaka hidden on step 1 (shown inside the Nivå list); Avbryt on the right on every step; tap outside closes; focus returns to «Planera pass». Step 1 has the links «Starta från mall» and «Tomt pass» under a thin line. Paths: questions (Ålder/Nivå → Fokus → Hall → Passlängd 60/90/120), Tomt pass (Hall → Passlängd), mall (Hall → Mall). Step logic is pure in `lib/wizard.ts` (`WIZARD_STEPS`, `wizardAdvance`, `wizardBack`).
- **D1 mall step:** `components/MallList.tsx` (extracted from LibraryPanel, which now uses it) lists Föreningens mallar, Mina mallar, Nybörjare, Kort pass — without admin tools, Kopiera delningskod or Ta bort. `lib/mallApply.ts` `applyMall(pick, hall)`: a different hall replaces the mall's hall and places Teknik again in pass order; the same hall keeps a Mina mall's placements. The Mallar tab uses the same function. The start-page mall shows «Mallen är i Passbyggaren. · Ångra» (`lib/undoCarry.ts`, Ångra → a blank pass on the answered hall).
- **Passlängd:** questions/Tomt pass set the target minutes (`WizardAnswers.targetMinutes`, `setSessionLength`).
- **E1 footer rows:** row 1 «Tyck till · [Visa tips igen ·] Uppdatera appen», then the Tyck till address line, the admin row, then the note (start page, 12 px grey) or «Träningsplaneraren · Slice 46» (Passbyggaren / Hallöversikt). Separators only between items; items share one centre line (anchors are inline-flex); links ≥ 44 px. The shared view keeps rows 1–2. Print hides all of it.
- **F1 strings:** new `wizardStepProgress`, `wizardMallLabel`; `draftHonestyBodyShort` changed. Removed (checked with rg): wizardNext, wizardFinish, wizardClose, fromTemplate, homeWizardPrimaryDesc, homeWizardPrimaryAria, homeInvite, planFirst, newSession, browseTemplates, continueDraft, startFromTemplateDesc, draftHonestyTitle, draftHonestyBody, draftHonestyOtherDevice, draftHonestyDismiss, omUtkast.
- Removed from App/SessionBuilder: goNew, goTemplate, goWizardFinish, openTemplates, initialTemplatePicker/onInitialTemplateConsumed. Dead CSS pruned (.home-start-links, .home-alt*).
- `SLICE_NUMBER = '46'`; asserts bumped in feedback.test.ts and clubTemplates.test.ts.

## Checks
- `bun test src`: **245 pass / 0 fail** (30 files; new `lib/wizardSteps.test.ts`, 5 new applyMall hall tests). `bun test tools/bank`: 26 pass / 0 fail. `npx tsc -b` clean. `npm run lint` 0 errors, 6 warnings (same 6 as main). `npm run build` green.
- **Bundle (gzip -9, main bc8cce0 → branch):** JS 198 164 → 198 570 B (**+406 B**), CSS 13 981 → 14 115 B (+134 B), total 212 145 → 212 685 B (**+540 B**). Within the pack's +1 kB; JS within +512 B, JS+CSS 28 B over +512 B.

## Self-smoke (390×844, DPR 2, touch): **33/33 PASS**
`verifier/slice-46-builder-smoke.mjs` against a branch build with the bank env set (admin row + club list; Supabase mocked/aborted in the browser, no real backend) and main bc8cce0 built the same way for comparison. Screenshots in `verifier/slice-46-screenshots/`.

| Check | Result | What |
|---|---|---|
| AC1 | PASS | no draft: one «Planera pass», no Tomt pass/Från mall, «Hämta ett pass» present |
| AC1-hamta | PASS | «Hämta ett pass» still expands its import panel inline (as main) |
| AC3-nodraft | PASS | no draft: doc height ≤ 844; Uppdatera appen + Logga in som admin on screen |
| AC4 | PASS | footer rows: Tyck till · Uppdatera appen / Logga in som admin / note ≤ 12 px; no edge «·»; one centre line; links ≥ 44 px |
| AC6 | PASS | Tyck till shows the address line as its own row; page still ≤ 844, admin row on screen |
| AC3-main-ref | PASS | reference: main bc8cce0 doc height (no draft) |
| AC2 | PASS | with draft: Fortsätt passet (title · min) → Planera pass → Rensa passet, each ≥ 44 px |
| AC3-draft | PASS | with draft: doc height ≤ 844; Uppdatera appen + Logga in som admin on screen |
| AC3-main-ref | PASS | reference: main bc8cce0 doc height (draft) |
| AC7 | PASS | Fråga 1 av 4 «Ålder», five chips, links Starta från mall + Tomt pass, no ×, only Avbryt |
| AC8 | PASS | chip marked chosen, Fråga 2 av 4 «Fokus» in ~0.3 s, no Nästa, double tap = one step |
| AC19-focus | PASS | focus moved to the new heading after advance |
| AC19-live | PASS | progress line aria-live, chips are role=option buttons with aria-selected |
| AC9 | PASS | Fokus: Satsbräda · Trampett · Tumbling · Blandat, no station/zone line; Hall: exactly the two Gymmix chips |
| AC10 | PASS | Passlängd 60/90/120 none preselected → «Pass — trampett», «53 / 90 min», Grophallen |
| AC10-placed | PASS | Teknik items placed on the Grophallen grid |
| AC11 | PASS | Nivå list 9…1 + hint; Tillbaka → age chips; Nivå 3 → Fokus; title «Nivå 3 — …» |
| AC12 | PASS | Tillbaka shows earlier answer marked, progress updates, re-tap moves on, new answer replaces |
| AC13 | PASS | Avbryt on q1–q4, Nivå, Tomt pass ×2, mall ×2 and outside tap (no draft + draft): closes, draft identical, focus Planera pass |
| AC14 | PASS | Tomt pass: Fråga 1 av 2 Hall → Fråga 2 av 2 Passlängd → 120 → empty pass «… / 120 min» on Grophallen; Tillbaka → Ålder |
| AC17-sheet | PASS | Mall step has no admin tools, no Kopiera delningskod, no Ta bort |
| AC15 | PASS | Starta från mall: Fråga 1 av 2 Hall → Fråga 2 av 2 Mall listing Föreningens/Mina/Nybörjare/Kort pass → Nybörjare on Grophallen with toast «Mallen är i Passbyggaren. · Ångra» |
| AC15-undo | PASS | Ångra returns to a blank pass on the answered hall |
| AC16 | PASS | Mina mall: same hall keeps placements, Grophallen re-places; Föreningens mall: hall as answered, markers placed |
| AC17-tab | PASS | Mallar tab still lists all three groups and keeps Kopiera delningskod / Ta bort on Mina mallar |
| AC18 | PASS | with draft: four answers replace the draft without asking |
| AC20 | PASS | builder footer: Tyck till · Visa tips igen · Uppdatera appen / Logga in som admin / «Träningsplaneraren · Slice 46»; no edge «·» |
| AC20-tips | PASS | Visa tips igen shows its status line |
| AC20-hall | PASS | Hallöversikt footer ends with «Träningsplaneraren · Slice 46» |
| AC21-landscape | PASS | landscape: sheet Avbryt reachable, footer usable, hero layout as main |
| AC21-desktop | PASS | desktop: sheet Avbryt reachable, footer usable, hero layout as main |
| AC22 | PASS | print media: no footer rows, no note |
| errors | PASS | no page errors |

Not verified: **AC5** (Admin · Logga ut / not-admin line / focus after code login) needs a real admin login — the admin row code is unchanged apart from its row wrapper. AC23: no new strings outside microcopy, no «!», deleted keys absent (rg).
Notes: start page doc height 844 (main 898). A blank Tomt pass is not written to localStorage until edited — same as main's goNew.

## Follow-up (Verifier M1, m2, m4)
- **M1:** `.home-wizard-sheet { max-height: calc(100dvh - 32px); overflow-y: auto }` (with a `100vh` fallback first). The sheet never outgrows the screen, and Tillbaka / Avbryt can be reached by scrolling inside it on every step.
- **m2:** the start-page footer rows are a `<footer>` again (one contentinfo on the start page).
- **m4:** `verifier/slice-46-builder-smoke.mjs` added (script only). New steps M1 (all 9 sheet steps — Ålder, Nivå, Fokus, Hall, Passlängd, Tomt pass ×2, mall ×2 — at 844×390, 390×844 and 320×568: sheet inside viewport, Avbryt/Tillbaka scrolled into view and hit-testable, Avbryt closes) and m2.
- Checks: `bun test src` 245/0, `bun test tools/bank` 26/0, `tsc -b` clean, lint 0 errors (6 warnings, same as main), build green. Smoke **37/37 PASS**.
- Bundle gzip -9: vs main bc8cce0 JS **+423 B** (198 587), CSS +150 B (14 131), total +573 B (212 718). vs fe5e51e: JS +17 B, CSS +16 B, total +33 B.
