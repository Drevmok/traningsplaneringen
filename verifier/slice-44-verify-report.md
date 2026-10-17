# Slice 44 «Dela och utskrift»: Verifier report

**PR #48** · branch `slice-44-code` @ **800651e** · main / PR base **0d88da5** · checklist `slice-44/verification-checklist.md` (AC1–AC22, locked at 50226d7) · 2026-10-17.

**Verdict: PASS, with one Medium finding (F1) for Planner to decide on.** 20 of 22 ACs pass on the exact AC text. AC19 is PENDING-real. AC20 passes in simulation and its real check is PENDING-real. No data loss, no broken old links and no stall, so there is no `SERIOUS:` line. F1: when any Teknik station is not placed in the hall, the printed station numbers no longer match the hall markers.

**Method.**
- Worktrees: `/workspace/s44v/wt` @ 800651e and `/workspace/s44v/main` @ 0d88da5.
- Previews: plain `vite build` + `vite preview` on :57741 (branch) and :57742 (main). Bank build (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`, local-only placeholder key) on :57740, Playwright-routed to **my own local stand-in** (`verifier/slice-36-local`, `S32_DIR=/workspace/s44v/sb`, gateway :57730, PG :57731, PostgREST v16.4 :57732, GoTrue v2.197.0 :57733, SMTP :57735).
- Browser: headless Chrome (playwright-core 1.56.1) at 390×844, DPR 2, touch, plus 320 px and 1280×800.
- Print checks: `emulateMedia('print')` + `page.pdf` + `pdfinfo` and `pdftotext`. Three `window.print` stubs: `webkit` (afterprint fires as soon as print returns), `chromium` (synchronous) and `dead` (nothing fires).
- **Real Chrome print preview**: headed Chrome on a private Xvfb :44, driven with xdotool, screen-grabbed with ffmpeg, and each PDF saved through the real «Spara som PDF» dialog (`slice-44-checks/preview.mjs`).
- Main script `verifier/slice-44-verify.mjs` → **37 / 39** (`slice-44-verify-results.json`, raw output in `slice-44-checks/verify-run.txt`). Both fails are findings: F1 (`MARKERS-partial`) and F2 (`BLAST-hall-ctrlp`).
- **No requests to the live project.** Nothing in this run references it.
- The box reset part-way through. Everything was rebuilt under `/workspace/s44v`, and all results below come from the rebuilt setup.

## Per-AC

| AC | Verdict | Evidence (short) |
|---|---|---|
| AC1 | PASS | ⋯ menu = Hallöversikt · Spara som egen mall · Ny vecka · Använd mall · **Dela**. aria-label «Dela». |
| AC2 | PASS | Sheet holds only ×, «Kopiera länk», «Skriv ut passet» and two hints. No inputs, QR, file or template rows. |
| AC3 | PASS | 390 and 320 px: no horizontal scroll. × is 44×44, the buttons are 127×44 and 143×44. Both hint texts match the microcopy exactly. |
| AC4 | PASS | «Länken är kopierad.» appears, then the label flips back after about 3.1 s. Link is `…/traningsplaneringen/#dela=z.…` (754 chars). |
| AC5 | PASS | Opening the link and saving gives an identical pass (title, minutes, hall, 3 placements, eq true), compared against the draft that produced the link. |
| AC6 | PASS | **Old links open.** All of these open and save the right pass on the branch: a main-UI link, links built with main's code (`z.`, raw `j.`, plain JSON, empty pass), title, 90 min, Vit, placements, stationEquipment. Old link → print shows «4. Rondat–flickis · Erfaren ledare». |
| AC7 | PASS | **Copy failure:** clipboard and execCommand both fail → manual line «Det gick inte att kopiera. Håll fingret på länken nedan och välj Kopiera.» plus a read-only field with the exact link. Focusing the field selects all of it [0,754]. The label never claims kopierad. execCommand throwing and no `navigator.clipboard` at all are both handled. A real permission denial (writeText NotAllowedError) falls back to execCommand → «kopierad», which is truthful. |
| AC8 | PASS | × and a backdrop tap both close the sheet. No stray body class, and the page still scrolls. |
| AC9 | PASS | Golvklart = Avsluta golvklart · Förrådslista · Skriv ut passet. Förrådslista has 15 items, the same as main. |
| AC10 | PASS | Delat pass = Kör passet · Spara och kör · Spara på den här enheten · Skriv ut passet · Till planeringen. |
| AC11 | PASS | **Kör passet fullscreen**: `document.fullscreenElement` = HTML from Passbyggaren and from Delat pass, on both branch and main (kicker «1 / 9 · Samling»). `enterPresentation` moved to `lib/presentation.ts`. |
| AC12 | PASS | **Home file import**: a file from main's «Ladda ner fil» imports on a clean device. With a draft present it imports after «Ersätta utkastet här?». A pasted link opens. A bad file shows «Filen eller koden gick inte att läsa.» |
| AC13 | PASS | «Spara som egen mall» from ⋯ saves (S44V egen mall shows in Mina mallar). |
| AC14 | PASS | **Real Chrome print preview**: Dela, Golvklart and Delat pass each print **3 A4-portrait pages** (preview header «3 pages», Background graphics on), with no app UI and with stations. Main prints **2 pages** and leaves the Hallöversikt heading orphaned at the end of page 1. The branch fixes this. The headless PDF agrees: 3 pages, 594.96×841.92 pt. |
| AC15 | PASS (see F1) | Rows 1.–3. each have sketch, Se upp för, Säkerhet and Redskap, and match the hall markers 1–3. A 4th experienced drill prints «4. Rondat–flickis · Erfaren ledare». |
| AC16 | PASS | No station split across pages and no heading left at the bottom of a page, on all 5 halls. **Map ratios identical to main**: Blå 1.3562 (1280×944), Vit 0.9582 (1280×1336), Standard 1.6. Blå/Vit real previews are 4 pages vs 3 on main. The extra page is the station content, which main never printed. |
| AC17 | PASS | Same printed text from all three surfaces (3 pages, 1308 chars each). |
| AC18 | PASS | Real preview: cancel → print again works, and the app is usable afterwards. Stub (webkit afterprint) also passes. |
| AC19 | **PENDING-real** | Needs a real iPhone, Safari tab, print sheet. |
| AC20 | PASS (sim) / **PENDING-real** | `dead` stub: the stall line appears after about 1.56 s directly below the button, on all 3 surfaces, and closes properly. No line with the webkit or chromium stubs. The real installed PWA on iOS is still pending. |
| AC21 | PASS | `rg` finds none of the deleted identifiers or strings in `app/src`. New strings match the microcopy file exactly, and no deleted label shows in the UI. |
| AC22 | PASS | `bun test src` 226 / 0. tsc rc 0. Lint 0 errors / 6 warnings (all existing react(refs) warnings). Build OK. Footer «Träningsplaneraren · Slice 44», and the test asserts were bumped. The bundle numbers in the PR match mine. |
| Station numbers vs hall markers (Planner) | **FAIL → F1** | Correct when every Teknik station is placed. Wrong when one is not (below). |
| No page errors | PASS | 0 during the whole run. |

## Findings

**F1: Medium. Printed station numbers stop matching hall markers once a Teknik station is unplaced.**
- **Link test** (station 1 not placed): hall shows marker 1 = Handstående, 2 = Falla bakåt. Print shows «1. Ljushopp…», «2. Handstående…», «3. Falla bakåt…».
- **Real UI path** (`slice-44-checks/partial-ui.txt`): ⋯ → Hallöversikt → «Ta bort från hall» on Ljushopp → hall markers 1 = Handstående, 2 = Falla, 3 = Salto, but print still shows 1.–4.
- **Cause:** `PassPrint` numbers rows by the `stationCards` index (all placeable Teknik). HallBoard markers use `stationRanks` (placed Teknik only). Builder's Decision 1 («numbers always match») does not hold here.
- **Suggested fix:** number print rows with `stationRanks` and print no number on unplaced stations.
- **How likely:** new stations are auto-placed, so this only happens after a station is removed from the hall, or with a link or file where placements are missing.
- Evidence: `s44v_15_partial_numbers_vs_markers.png`, `s44v_16_added_station_placed.png`, `s44v_17_station_removed_from_hall.png`.

**F2: Low. `is-print-pass` stays on in Golvklart after «Skriv ut passet».**
- `body.is-print-pass` and the print portal stay mounted while you remain in Golvklart or Hallöversikt. A later browser print there (Ctrl+P, or the iOS share sheet → Skriv ut) prints the pass instead of the hall. Main prints the hall.
- It clears when you go back to Passbyggaren.
- `BLAST-hall-ctrlp` in the results.

**F3: Cosmetic. The Dela sheet is very tall on a phone.**
- It is about 90 vh (0–760 px of 844) with content ending at 443 px. That leaves a large empty white area, and only a thin strip of backdrop is left to tap.

Not SERIOUS: no data loss (AC5, AC12), old links work (AC6), and no stall (AC18, AC20 sim).

## PENDING-real
- **AC19**: iPhone Safari tab → «Skriv ut passet» → iOS print sheet. Check the page count, the stations, and that the app comes back.
- **AC20**: installed PWA (home-screen) on iOS. Check the stall line if the print sheet does not open. Note the exact iOS version.
- iOS clipboard behaviour for «Kopiera länk» (real success, and the manual-copy fallback with long-press).
- Android Chrome: print, and copy link.

## Bundle (gzip -9, plain builds)

| | main 0d88da5 | branch 800651e | Δ |
|---|---:|---:|---:|
| JS (all) | 204,839 | 199,414 | −5,425 |
| CSS | 14,391 | 14,132 | −259 |
| **Total** | 219,230 | 213,546 | **−5,684** (matches Builder) |
| Eager (index js + css) | 155,346 | 149,656 | −5,690 |

- The lazy chunks are +6 B net. Their raw sizes are identical; only the hashes changed.
- **Removed:** `uqr.mjs` (QR encoder, 742 lines) and its d.ts files, `qrSvg.ts`, `StationDeck.tsx`, the stations print branch, `downloadPassFile`/`passFileName`, the ExportSheet import/QR/template paths, `handleImported`, about 14 strings, and the station-deck/station-sheet/share-qr CSS.
- **Still-used code is intact:**
  - `enterPresentation` → `lib/presentation.ts` (AC11)
  - `StationSketch` (PassPrint, ActivityDetail)
  - `stationCards`
  - `sessionFromTransfer` and `.receive-file` (Home import, AC12)
  - SaveTemplateDialog (AC13)
  - ReplaceDraftConfirm
  - Förrådslista (AC9)
- Script and output: `slice-44-checks/bundle.sh`, `bundle.txt`.

## Tests, lint, tsc, build, secrets
- `bun test src`: **226 pass / 0 fail** (28 files).
- `tsc`: rc 0.
- Lint: 0 errors, 6 warnings (existing react(refs)).
- `vite build`: OK.
- Secret grep: clean across the git tree at 800651e, both dists and all my outputs (including PDF text). Nothing references the live project.

## Old smokes (classified against `slice-43-checks/smokes/`)
- **Setup:** one sequential loop (`slice-44-checks/smokes/run.sh`, outputs next to it).
  - Branch builds: plain :57741 and bank :57740 (`https://bank-mock.supabase.co`, routed to my local stand-in).
  - Main plain build: :57742.
  - Live requests: 0 in every smoke that reports a count.
- Two earlier runs were discarded as invalid:
  - The first used a bank build with an `http://` URL, so the app silently turned the bank off.
  - The second had two loops running at once.
- **Result: 0 regressions.** Every failure below is either expected from the Slice 44 spec or was already in the baseline.

| Smoke | Result | Fails / classification |
|---|---|---|
| slice-44-builder-smoke | 26/26 | n/a |
| slice-43-builder-smoke | 21/22 | AC16-footer «Slice 43»: expected (footer bump) |
| slice-43-verify | 24/4 | Golvklart lost «Helskär» and «Skriv ut kort», so the hall sits 52 px higher (AC8, AC11): expected (spec, README lines 53 and 60). AC16-footer: expected. AC6-320: also failed in the Slice 43 verify |
| slice-42-verify | 59/2 | AC18-footer, S39-unsaved: baseline. C (föreningsmall via the stand-in) passes |
| slice-42-builder-smoke | 23/24 | AC18-footer: baseline |
| slice-41-reverify-b | 93/2 | AC22-footer, C: baseline |
| slice-41-builder-smoke | 32/34 | AC16, AC22-footer: baseline |
| slice-40-builder-smoke | 15/5 | AC1/2/8-main, AC16-footer, M: baseline |
| slice-40-reverify | 37/2 | AC16-footer, C: baseline. AC14-controls now passes |
| slice-39-builder-smoke | 25/3 | C, F, G: baseline |
| slice-39-verify | 67/5 | AC1, AC22a, AC3/AC17, F3, I: baseline. C2 passes |
| slice-38-builder-smoke | 25/1 | AC18a: baseline |
| slice-38-verify | 67/4 | Same count as baseline. AC14-golvklart «buttons 7 vs main 9» is the two spec removals (expected). The rest are footer/baseline |
| slice-37-builder-smoke | crash | Same crash at line 88 («Ersätta det här passet?» → «Använd mall») as the baseline |
| slice-37-verify | 4/11 | A-E, C-E, E-E, F12, M-E, M8-E, P-E: baseline |
| slice-36-builder-smoke | 32/34 | AC23, B: baseline |
| slice-36-verify | 13/15 | V-coach, V-overwrite: baseline |
| slice-35-builder-smoke | 33/8 | All baseline |
| slice-35-verify | 36/11 | All baseline |
| slice-34-builder-smoke | 29/2 | AC20a/b: baseline |
| slice-34-verify | 28/4 (base 30/2) | Same-controls-menu («Exportera / dela» → «Dela», AC1), Same-controls-golvklart and Same-controls-share («Helskär» and «Skriv ut kort» removed, AC9/AC10): **expected spec changes**. Footer: expected. My own AC1/AC9/AC10 checks assert the exact new lists |
| slice-33-builder-smoke | 141/5 | All baseline. 4 baseline fails now pass |
| slice-32-builder-smoke | 26/17 | All baseline (stand-in/admin-flow items, unchanged) |

Note: `slice-44-builder-smoke` writes `slice44_*` PNGs to `/workspace/screenshots/` when it runs.

## Artifacts
- `verifier/slice-44-verify.mjs`, `slice-44-verify-results.json`
- `slice-44-checks/`: preview.mjs, bundle.sh, old-tokens, partial-token/partial-ui, test/tsc/lint, pdf/, preview/, smokes/
- `slice-44-screenshots/s44v_*`
- Best two, also copied to `/workspace/screenshots/`:
  - `s44v_preview_br-dela_bg.png` (real Chrome print preview, 3 pages)
  - `s44v_15_partial_numbers_vs_markers.png` (F1)
