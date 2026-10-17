# Slice 46 «Startsidan + Planera pass» — Verifier report

PR #50 · branch `slice-46-code` @ **fe5e51e** · main **bc8cce0** (= Slice 45 merge **3708bf8** + scout PR #40, backlog docs only; confirmed) · pack `slice-46-docs` @ **abbd242** (A1–F1, AC1–24; identical to `slice-46/` on the branch).
Process: verify-traningsplaneraren skill, features/*, PSTACK-OPS. Launch → Doctor → Drive → Evidence. Headless Chrome, 390×844 DPR 2 touch, plus 320×640, 844×390 and 1280×800. I used my own isolated stand-in (PostgREST/GoTrue/PG/SMTP catcher on 5783x). The bank build is on https (`https://bank-mock.supabase.co`, routed to the stand-in). **0 live requests**, and the live project was never touched.

## Verdict
**CHANGES NEEDED: 1 MAJOR, 0 SERIOUS.** 30 of 31 scripted checks pass. The one failure is **AC21 in landscape**: in the Planera pass sheet at 844×390, «Avbryt» is off screen and the sheet cannot scroll (M1). Everything else holds:
- The wizard: auto-advance, Tillbaka, and Avbryt with no draft change.
- The footer rows and placement.
- Draft replacement.
- Malls on both halls.
- Admin row (local).
- Print.
- Bundle, tests, tsc, lint.

M1 needs a small CSS fix (let the sheet or backdrop scroll at low heights, e.g. `max-height: calc(100dvh - 32px); overflow-y: auto` on `.home-wizard-sheet`), then a re-check of AC21-sheet only.

## Answers to the specific questions
- **Planera pass replacing the draft (lock: replaces without asking).** I tested every path with an *edited* old draft and with a *fresh* one (untouched generated pass). Data: `notes.AC18` and `AC18-fresh`.

  | Path | Asks first? | Edited old draft (title typed) | Fresh old draft (untouched) |
  |---|---|---|---|
  | 4 questions | No | **Kept** in Mina mallar as an auto copy under its title. Same drills, same hall (Stora), same placements. Survives reload | Not kept; replaced and gone |
  | Starta från mall (Nybörjare) | No | **Kept**, as above | Not kept |
  | Mall → «Ångra» | No | **Kept**. Ångra gives a **blank pass on the answered hall**, not the old draft. The old draft is in Mina mallar | Not kept. After Ångra the draft is «Nytt pass» |
  | Tomt pass, then the first station | No | **Kept** | **Kept** too, because the fresh marker moved to the new blank pass. One extra copy, harmless |
  | Tomt pass with no station, then Till startsidan or reload | — | The old draft is **still the stored draft** («Fortsätt passet S46V gammal»). Nothing is lost | Same |

  So the archiving is exactly the Använd mall autosave rule (Slice 39 replace guard + Slice 42 D1 fresh rule). Main does the same: Från mall → Ångra gives «Nytt pass», and the edited old draft is an auto copy in Mina mallar (`AC18-main-ref`). The only thing that vanishes is an untouched generated pass, which is by design.
- **Desktop 1280×800, hero 800 vs 785.** Hero left/width are identical to main (0/589). The pane is 589–1280 in both. On main, a full-width footer strip sits under both columns (785–849), so the page scrolls (docH 849). On the branch the footer rows sit inside the right column (x 758–1110, y 459–569) and the page doesn't scroll (docH 800). The hero is +15 px only because it now fills the viewport. Judged **acceptable**: «desktop hero layout as main» holds (same split, art and centring), and it's better (no scroll). Screenshots `s46v_05_home_desk` and `s46v_05m_home_desk_main`.
- **A blank Tomt pass isn't saved until edited.** Same as main, and covered by AC14's own wording («as goNew today: not written until the first change»).
  - Reload or Till startsidan before any station: back to the start page with no new draft. With an old draft, the old one stays and nothing is lost.
  - What counts as the "first change" is an **added station** (`shouldAutosave`: stored id or more items). A title or pass note typed into a blank pass **is not written** and is gone after a reload. That is **identical on main** (`TOMT-reload`: br and main both have stored null), so it's pre-existing, not a regression. Listed as m1 for the backlog.
- **AC5 (admin, Logga ut).** PASS locally on my stand-in:
  - admin@test.local gets row 2 «Admin · Logga ut»; nonadmin@test.local gets «Du är inloggad men inte admin. · Logga ut».
  - After the code login, focus is on «Logga ut».
  - Logga ut brings back «Logga in som admin».
  - Rows are tidy and the page is ≤ 844 px tall.

  Against the live project it is **PENDING-real**.

## Per-AC table
| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS | No draft: only «Planera pass» (+ Hämta ett pass + footer). No Tomt pass/Från mall. The Hämta panel text is identical to main |
| AC2 | PASS | «Fortsätt passet / S46V utkast · 53 min» (65 px), «Planera pass» (48), «Rensa passet» (44), in order |
| AC3 | PASS | docH **844** with and without a draft (main 898). Uppdatera appen bottom 770, Logga in som admin bottom 814 |
| AC4 | PASS | Rows: «Tyck till · Uppdatera appen» / «Logga in som admin» / «Passen sparas bara på den här enheten.» The note is 12 px. Each row is on one centre line, there's no «·» at an edge, and links are 44 px |
| AC5 | PASS-local / **PENDING-real** | See above. `s46v_06_*` |
| AC6 | PASS | mailto fired. The address row is separate. Nothing off screen; the note ends at 832, docH 844 |
| AC7 | PASS | «Fråga 1 av 4» «Ålder», 5 chips, a 1 px line, «Starta från mall» / «Tomt pass». No ×. Only «Avbryt» |
| AC8 | PASS | Chip selected at 28 ms, advance at 280 ms. No Nästa/Skapa pass. A touch double tap (60 ms) or dblclick moves one step |
| AC9 | PASS | Fokus has 4 chips and no station/zone text. Hall step: exactly Stora hallen and Grophallen |
| AC10 | PASS | Passlängd 60/90/120, none preselected. 90 gives «Pass — trampett», «53 /» [90], forening-vit, 3 markers on the grid |
| AC11 | PASS | Nivå 9…1 + the hint. Tillbaka returns the age chips. Nivå 3 → Fokus; title «Nivå 3 — tumbling» |
| AC12 | PASS | Tillbaka on steps 2–4 marks the earlier answer. A re-tap moves on; another answer replaces it. No Tillbaka on step 1 |
| AC13 | PASS | 24 cases (9 steps × Avbryt + 3 outside taps, with and without a draft): sheet closed, localStorage byte-identical, focus on «Planera pass». The next open starts on step 1 with nothing marked |
| AC14 | PASS | «Fråga 1 av 2» Hall → «Fråga 2 av 2» Passlängd → 120 gives Närvaro + Dagens pass on Grophallen, target 120. Not stored until the first station (stored with 3 items after that) |
| AC15 | PASS | Bank build: Hall → Mall step (Föreningens mallar with its empty text, Nybörjare, Kort pass) → Nybörjare. Toast «Mallen är i Passbyggaren. · Ångra», forening-vit, markers on the grid |
| AC16 | PASS | Mina mall on Stora with a nudged placement (0.2137/0.4242): with Stora the placements are kept exactly; with Grophallen they're re-placed (open zone, ranks 1..n). Föreningens mall (stand-in row): Grop → vit, Stora → blå, markers placed, DB payload md5 unchanged, 0 live |
| AC17 | PASS | admin2 logged in. The mall step shows the club row and Mina mall, but no Kopiera delningskod / Ta bort / Dölj / last-changed. The Mallar tab still has all of them |
| AC18 | PASS | No confirm on any path. Replacement semantics are in the table above |
| AC19 | PASS | Focus goes to h2 after each advance. Progress has `aria-live=polite`. Chips are `BUTTON` with `aria-selected` |
| AC20 | PASS | Builder and Hallöversikt: «Tyck till · Visa tips igen · Uppdatera appen» / «Logga in som admin» / «Träningsplaneraren · Slice 46» (12 px, smallest). The Visa tips igen status line shows |
| AC21 | **FAIL (landscape sheet)**; home PASS | Start page at 320, landscape (docH 587, main 651) and desktop: OK. The sheet at 320/390/desktop is OK. **The landscape sheet fails (M1)** |
| AC22 | PASS | Print media plus PDF text for the pass and Golvklart views: no footer rows, note or version line. On the start page the footer is hidden too |
| AC23 | PASS | 0 hits for all 17 deleted keys in `src`. New strings match `content/microcopy.sv.md` (`wizardStepProgress` «Fråga {n} av {total}», `wizardMallLabel` «Mall», `draftHonestyBodyShort`). No «!». Locked terms unchanged. «Trygg för nya tränare» in MallList was moved verbatim from main's LibraryPanel |
| AC24 | PASS | See Bundle and Tests. Footer «Slice 46»; `SLICE_NUMBER '46'`; feedback.test.ts:25/45/46 and clubTemplates.test.ts:316 assert '46' |

## Findings by severity
**SERIOUS:** none. No data-loss regression was found: Avbryt never changes storage (24 cases), and every edited replaced draft is archived.

**MAJOR**
- **M1, AC21: the Planera pass sheet in landscape 844×390 can't be dismissed with Avbryt.**
  - `.home-wizard-sheet` is 460 px tall (top 16, bottom 476). It sits in a `position: fixed` backdrop with `overflow: visible`, and body has `overflow: hidden`, so nothing scrolls except the chip list (`.home-wizard-options` 260/203).
  - Step 1: **Avbryt is at y 416–460, fully below the 390 px viewport.** «Starta från mall» / «Tomt pass» are clipped at 356–400.
  - Nivå step: Tillbaka and Avbryt at 384–428 (6 px visible). Mall list: 357–401.
  - Wheel and touch scrolling don't move it.
  - The only way out is tapping outside (top strip or sides). Escape doesn't close it, same as main.
  - Main's wizard at 844×390 is 403 px with Avbryt/Nästa ending at 387, so this is a regression from the taller sheet (alt links, separator, progress line).
  - Screenshots `s46v_30_land_sheet_step1_br` (`s46v_30_land_sheet_step1_main` for comparison), `s46v_31_land_niva_br`.

**MINOR**
- **m1, pre-existing (same on main):** on a blank Tomt pass, a typed title or pass note isn't written until a station is added. Reload loses the typed text. Not a Slice 46 regression; backlog candidate.
- **m2, start-page footer landmark:** on the start page the footer rows are now a `<div class="home-foot-rows app-footer">` inside the pane, not `<footer>`. The home view loses its contentinfo landmark (main had `<footer>`). Builder and hall still use `<footer>`. It also breaks old smokes that use `footer .footer-admin-login`.
- **m3, bundle over the guideline:** JS+CSS is +540 B, 28 B over the ~512 B guideline. JS alone (+406) is within it, and AC24's «≤ +1 kB gz JS soft» passes. Christoffer's acceptance is **not recorded** in the pack or PR.
- **m4, process:** Builder's self-smoke `verifier/slice-46-builder-smoke.mjs` (and its fixture `/tmp/s46fix.json`) isn't in the PR; it exists only in Builder's uncommitted working copy. I re-ran a read-only copy (33/33) but didn't commit it.

**INFO**
- Escape doesn't close the sheet; main's wizard behaves the same.
- Mall → Ångra gives a blank pass on the answered hall, as main's Från mall → Ångra does. The old edited draft is in Mina mallar.
- On the Tomt pass path even a fresh old draft gets archived once the first station is added; the questions and mall paths don't archive it. The inconsistency only adds a copy.
- `slice-46/content/microcopy.sv.md` still says «Status: PROPOSED» while README says LOCKED.
- The start page in print shows «Planera pass» / «Hämta ett pass» but no footer. Printing the start page isn't in AC22.

## PENDING-real
- AC5 against the live Supabase project: real admin and non-admin code login, focus, Logga ut. Verified only on my local stand-in.
- AC15/AC16-club with real Föreningens mallar rows: verified with a stand-in row only.

## Bundle (gzip, `slice-46-checks/bundle.txt`)
| | main bc8cce0 | branch fe5e51e | Δ |
|---|---|---|---|
| JS | 198,164 | 198,570 | **+406** |
| CSS | 13,981 | 14,115 | **+134** |
| Total | 212,145 | 212,685 | **+540** |
| Eager | 148,244 | 148,795 | +551 |

Builder's +540 B is **exact**. Against AC24 (≤ +1 kB JS soft): PASS. Against the ~512 B guideline: JS within, total 28 B over (m3). The claimed acceptance by Christoffer is unconfirmed.

## Tests (Builder's claims)
| Claim | Measured |
|---|---|
| bun test src 245/0 | **245/0** ✔ |
| tools/bank 26/0 | 21/0/5 skip without a DB. **26/0** with my stand-in (temporary `/tmp/s32` symlink, removed) ✔ |
| tsc | rc 0 ✔ |
| lint 0 errors / 6 warnings | 0/6, = main ✔ |
| build | ✔ |
| self-smoke 33/33 | **33/33** in my loop ✔ (script not in the PR, m4) |

## Smokes (one background loop, `slice-46-checks/smokes/`, `smokes-classify.txt`)
- **slice-46-builder-smoke 33/33.**
- Unchanged vs the Slice 45 baseline: 41-builder 32/2, 41-reverify-b 62/28, 43-verify 2/6, 40-builder 14/4 (better than 12/6), 38-verify 60/1 (5 baseline fails gone).
- Every new failure is classified. **None is a real regression.**
  - **Expected removal**:
    - Start-page «Tomt pass» / «(Starta f|F)rån mall» (used by 32, 33, 36, 37, 39, 42, 43, 44, 45).
    - Wizard «Nästa» / «Skapa pass» and `#home-wizard-title` (34, 35, 36, 38, 39, 40, 42, 45).
    - These account for the click timeouts and the follow-on "undefined" crashes.
  - **DOM move (m2)**: `footer .footer-admin-login` on the start page (36-builder A, 36-verify V-admin-publish).
  - **Brittleness**: footer «Slice 40/41/42» asserts and «strings verbatim» checks for old slices. 43-builder `main-*`: main (Slice 45) no longer has `#hall-layout-select`.
- Hand repro of the data paths these smokes covered: my AC13/AC14/AC18/TOMT-reload checks (above).
- Extra: an **adapted** slice-39-verify (Tomt pass via Planera pass → Tomt pass; new auto-advance wizard; `slice-46-checks/smokes/slice-39-verify-a46.txt`). Section A (autosave timing, reload, visibility, nav, tab close, Till startsidan, Kör passet) passes 11/12. The one fail, A-passlength, is my adaptation's fault: it already picks 90. Sections B and later fail as in the Slice 45 baseline (main-only «Spara utkast» assertions), then the browser hit the 900 s timeout.

## Artefacts
- Script `verifier/slice-46-verify.mjs` (PART=p1|p2|p3, ONLY=…). Results `verifier/slice-46-verify-results.json` (31 checks, 30 pass). Runs in `verifier/slice-46-checks/verify-p*-run*.txt`.
- Screenshots: `verifier/slice-46-screenshots-v/s46v_*.png` (46). Best two copied to `/workspace/screenshots/`: `s46v_30_land_sheet_step1_br.png` (M1) and `s46v_02_home_draft_390.png`.
- Checks: test, test-bank(-standin), tsc, lint, build, bundle(.sh), ac23-ac24.txt, print PDFs, smokes + classify.
- Progress log: `verifier/slice-46-progress.md`.
