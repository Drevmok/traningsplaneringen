# Slice 45 «Hallar och städning»: formal verify report

**PR #49**, branch `slice-45-code` @ **dea69d2** vs main @ **4fe44c0**.

Verifier: Grok Bot (verifier role), 2026-10-17, 16:53–18:20 (UTC+2).

Setup:
- Isolated local stand-in: PG17, PostgREST 12.2.3, GoTrue 2.177.0 and SMTP on 5783x.
- The bank build points at `https://bank-mock.supabase.co`, which Playwright routes to the stand-in.
- The live project was **never touched**: 0 live requests in every run.
- Browser: headless Chrome 390×844, DPR 2, touch (plus 320, landscape 844×390 and desktop 1280×800). WebKit is used where the old smokes ask for it.

## Verdict: **PASS**. Ready to merge from the verifier side, with 1 Low finding and the Info notes below. Nothing is SERIOUS.

- All 21 ACs pass. AC5 passes per **Planner's ruling** (17:10): the hall bottom is ≤ 739 at 390×844 in every case.
- There is no data loss:
  - Old passes, Mina mallar and `#dela=` links on removed halls open on «Gymmix – Stora hallen».
  - Their content is byte-identical. Only the hall fields are migrated, as AC8/AC9 specify.
- The Ångra/race behaviour is intact (re-proven by hand, see Smokes).
- The Dela → toast close path loses nothing.

## Per-AC

| AC | Grade | Evidence (measured) |
|---|---|---|
| AC1 | PASS | Q3 «Hall», «Fråga 3 av 3», exactly «Gymmix – Stora hallen» and «Gymmix – Grophallen» (en dash) |
| AC2 | PASS | No «Stationerna är förslag…» or «Välj den layout…» in Q2/Q3. Tillbaka, Nästa and Skapa pass work |
| AC3 | PASS | Grophallen drawing (canvas ratio 0.957). The meta line and Golvklart meta both read «Gymmix – Grophallen» |
| AC4 | PASS | Tomt pass (+1 Teknik) and Nybörjare: forening-bla, «Gymmix – Stora hallen», markers on the grid in pass order (row-major), inside the floor, not on walls |
| AC5 | **PASS per Planner's ruling** | No label or select. Zoom −/+ are 48×44 at 390 and 320. Hall canvas top–bottom (br / main): Nybörjare+banner 340–604 / 340–579; no banner 288–552 / 288–527; 2-line title 310–574 / 310–549; wizard Stora+banner 339–603 / 310–574; no banner 287–551 / 258–522; Grop+banner 339–713 / 310–684; no banner 287–661 / 258–632. As written («≤ 310, not lower than main») the wizard cases are +29 px, so it failed as written. Planner accepted it because every bottom is ≤ 739 (max 713). **Low finding L1**. 320 px: top 369–391, bottom 581–670, the whole hall is visible without scrolling, no horizontal scroll |
| AC6 | PASS | Under the hall: only «Schematisk hall — inte exakt mått» plus the flow tip; after «Dölj tips», only the caption. None of the 12 removed strings appear (DOM and built bundle) |
| AC7 | PASS | Tray has no hint lines or zone tip. Collapse/expand, remove (3→2), Placera här (2→3) and desktop drag all work |
| AC8 | PASS | Legacy `standard-trupp` with trampett/vault/mats zones: opens on forening-bla in the Stora drawing. The grid is identical to a fresh pass and nothing is on walls. Content is byte-identical and the id is the same. After the first save the store holds `forening-bla` (the legacy id stays in storage until the first write: migrate-on-load, by design) |
| AC9 | PASS | Same for `tavling-linjer`, `liten-hall`, `generic-trupp` and a draft with no id |
| AC10 | PASS | A `#dela=` link made in main's UI on Standard trupp opens Delat pass with the Stora drawing and 3 markers. «Spara på den här enheten» stores forening-bla with content as on main |
| AC11 | PASS (local) | **Mina mall** on `liten-hall` (made in main's UI): Använd mall gives a Stora pass with grid markers; the saved mall is not rewritten. **Föreningens mall**: a row with `hallTemplateId: 'standard-trupp'` inserted into the stand-in (the DB forbids hallPlacements in club payloads, `club_templates_payload_check3`) gives forening-bla, «Gymmix – Stora hallen», 3 markers in pass order; DB row untouched; 0 live requests. Unit tests: hallLegacy.test.ts 10/10, but no test calls `clubTemplateToSession` with a legacy id directly (Info I2). Live bank: PENDING-real |
| AC12 | PASS | Blå and Vit placements byte-identical after reload, ids unchanged |
| AC13 | PASS | Rensa passet: sheet 653–844 (h 191 ≤ 260; main 776). Avbryt 69×44 and Rensa 68×44 side by side. Text = main. Rensa clears; Avbryt and the backdrop keep the pass |
| AC14 | PASS | Ersätta utkastet h 191, Ny vecka h 214, mall confirm h 214: all bottom 844, compact, text = main. Tall sheets unchanged: Förrådslista 101–844 = main, wizard 369–844 = main. Övningsdetalj has no compact class (source). Admin Dölj: compact classes in source; the real flow is PENDING-real |
| AC15 | PASS | Landscape: hall top 257 (main 313), no select, no horizontal scroll. The Rensa dialog box and buttons (89×40, 88×40) are identical to main: compact is phone-only, and the 40 px is inherited from main (Info I4). Desktop dialog 480×194 = main |
| AC16 | PASS | Print map Stora 1280×944 (1.3562) and Grop 0.9582, both = main. Golvklart print 1.3563. Pass PDF A4, 3 pages |
| AC17 | PASS | `rg` (non-test) finds legacy ids only in `types.ts:138 LegacyHallTemplateId` and `lib/hall.ts:24 LEGACY_TEMPLATES`, plus the test `hallLegacy.test.ts`. The only new UI string is `wizardQ3Label: 'Hall'` (in microcopy.sv.md); everything else added is code, test names or ids. Locked terms unchanged |
| AC18 | PASS | Bundle gz TOTAL 213,631 → 212,145 (**−1,486 B**, exactly as claimed); EAGER −1,510. tsc -b rc 0; bun test src **234/0**; tools/bank 21/0 (5 skip); lint 0 errors (6 warnings, = main; Builder said 4, Info I1); build ok. Footer «Träningsplaneraren · Slice 45»; `SLICE_NUMBER='45'`. Asserts `feedback.test.ts:25/45/46` and `clubTemplates.test.ts:316` read Slice 45 |
| AC19 | PASS | Dela at 390: sheet 381–844 (h 463 ≤ 480; main 0–760), padding-bottom 20px, pass visible above. Contents and order = Slice 44 |
| AC20 | PASS | × 44×44; × and backdrop close; «Länken är kopierad.» flips back after 3.1 s; prints 1. Clipboard blocked + stalled line: h 641 ≤ 776 (92 %), overflow auto, × reachable, closes cleanly |
| AC21 | PASS | Landscape sheet 20–371 scrolls inside; × reachable at the start (scrolls away at the bottom, same as main, Info I5). Desktop centred 480×424 at 400,188 = main. Golvklart and Delat pass print buttons unchanged |
| Ruling: Dela closes the Ångra toast | PASS | Använd mall shows the toast; Mer → Dela at once removes it. «Skriv ut passet» is not covered and prints. After ×, no Ångra and Ctrl+Z does nothing. Storage is identical to the 5 s timeout path (draft content, Mina mallar incl. the auto-kept previous pass, keys). Undo state is cleared and nothing is lost |
| Ruling: old-hall Mina mall duplicate detection as is | Recorded | Builder-reported. The checklist has no AC on it; the AC11 Mina mall path works |

## Findings

**SERIOUS / High / Medium:** none.

**Low**
- **L1:** On wizard-made passes the hall sits +29 px lower than on main at 390×844, and at 320 for all cases. Cause: the read-only «Gymmix – Stora hallen» meta line wraps under the title, and the canvas is also 25 px taller. Planner accepted it (bottom ≤ 739, max 713). Slice 48 reworks the Hallöversikt placement. 320 px is usable: the whole hall is on screen (bottom ≤ 670) with no horizontal scroll. The hall starts at about 44 % of the screen height when the banner shows.

**Info**
- **I1:** Lint shows 6 warnings, not the 4 Builder claimed. Main also has 6, so nothing is new.
- **I2:** No unit test drives `clubTemplateToSession` with a legacy id. It is covered only indirectly (via the shared migrate path) and by my stand-in e2e.
- **I3:** A legacy hall id stays in localStorage until the first write (migrate on load). It is never written anew.
- **I4:** The landscape and desktop Rensa buttons are 40 px high, the same as main (compact applies only on phones).
- **I5:** In landscape, Dela's × scrolls out of view at the bottom of the sheet. Main does the same.
- **I6:** Leftover after cleanup: `coachTips.ts` still reads, writes and clears `hallHintsCompact`, but nothing sets it any more. It is harmless and keeps old tips storage readable.
- **I7:** The old smokes (Slice 3x–41) write their screenshots to `/workspace/screenshots/s3xv_*` / `s41vr_*`, as in earlier slices. The loop overwrote those same-named files there.

## Cleanup: what was removed vs what is still used
Removed:
- 156 lines from hallPresets.ts (the generic presets)
- About 100 lines from HallBoard.tsx (layout select, hint lines, «Tips om placering», migrate note, coach tip)
- 25 UI keys in blockMeta.ts
- `TIP_HALL_PLACE` / `markHallHintsCompact` in coachTips.ts and `handleTipsUpdate` in App.tsx
- The generic ids from `HallTemplateId` (now `LegacyHallTemplateId`)
- About 120 lines of CSS

Checks:
- tsc is clean, so nothing references removed code.
- Every CSS class touched by the diff that TSX still references still has rules.
- Old data paths still work: draft load, Mina mall, club mall and share decode all go through `isLegacyHall` → `migrateLegacyHall` (+ `autoPlaceUnplaced` for shares and malls). AC8–AC11 and the smokes prove it.

Nothing still in use lost code.

## Tests and bundle
- `bun test src` 234 pass / 0 fail
- tools/bank 21/0 (5 skip)
- tsc rc 0
- lint 0 errors / 6 warnings (= main)
- build ok
- Bundle −1,486 B gz (claim confirmed exactly)
- Builder smoke: the loop run was 40/41, but its AC17 errored only because my smoke copy had no `app/dist`. Re-run alone with the dist linked: **41/41**
- My script `slice-45-verify.mjs`: p1 (AC1–AC12) 20/22, where the 2 false checks are AC5 as written (PASS per ruling); p2 (AC13–AC21, toast, club) 32/32

## Smokes (one background loop, flock; classified vs `verifier/slice-44-checks/smokes/`)
Files: `slice-45-checks/smokes/` (loop) and `classify-loop.txt`; `smokes-patched/` and `classify-patched.txt`; `repro/`.
- **Unchanged vs baseline:** 37-builder, 39-builder, 41-builder, 42-builder, 42-verify.
- **Expected removal/rename. With the wizard chip patched (`/Stora hallen|Standard trupp/`) they equal the baseline:**
  - 32-builder 27/17 = baseline
  - 34-builder 30/2 =
  - 35-builder 34/8 =
  - 35-verify 37/11 =
  - 36-builder 32/2 =
  - 36-verify 13/2 =
  - 37-verify 4/7 =
  - 38-builder 26/1 =
  - 34-verify 30/2: baseline 28/4; the new «Same-controls-hall» fail is the removed select/tips
  - 38-verify 66/5: the new AC14-hall fail (15 vs 16 buttons) is «Tips om placering» removed. The Golvklart text diff is only main's Standard-trupp zone labels → «Gymmix – Stora hallen» (probe in repro)
  - The D-admin/D-notadmin failures in 35 were a follow-on: the wizard sheet was left open over the footer.
- **41-reverify-b (28 new failures):** expected migration, not a regression.
  - The seed uses `standard-trupp`, so the first write after × / Ångra migrates the draft to forening-bla and drops its placements (AC8). The deep-equal on the whole draft then fails.
  - Hand repro, Blå seed: A+B **32/32** (all race-x-0…1500 and race-mall builtin/saved 0…900) and X **29/29** (AC2-twice, all rex). C passes up to AC11 on both the branch and main.
  - Hand repro, legacy seed with hall fields excluded from the compare: all races and AC3/AC5 pass. Only AC4 and AC2 fail, because they count placements (AC8 by design). **Content is never lost.**
  - The C section error is the removed `.hall-preset-select`. The later click timeout (AC16 blank pass) is in the baseline too, and main fails the same way.
- **39-verify A–H:** wizard «Standard trupp» chip removed. Patched: 66 pass, and B equals the baseline (AC1, AC3/AC17, AC22a fail on main too; F3 now passes). I fails in the baseline too.
- **40-builder / 40-reverify:**
  - W and A: the «Blå hall»/«Vit hall» names were renamed.
  - AC9: legacy halls migrated.
  - AC14 / AC14-controls (21/22 buttons, shorter text): «Tips om placering», select and hints removed (AC6).
  - M: also in the baseline.
- **43-builder / 43-verify:** every failure is `selectOption` on the removed hall select (setup step). My AC5/AC15 measurements cover layout.
- **44-builder:**
  - AC6: main has said «Dela» since Slice 44, so the stale «Exportera / dela» selector times out. With «Dela» patched: **AC6 + all 44 checks pass** (incl. F1 partial numbering and F2 Ctrl+P).
  - Footer: expected (Slice 45).
- **44-verify:**
  - AC8: the tap point (195,835) now lands on the compact sheet, which is brittleness (AC20 proves the backdrop closes it). The Dela section error follows from it.
  - OldLinks: main no longer has «Ladda ner fil».
  - Ratios: the removed select (AC16 covered by me).
  - MARKERS-partial: its token is a legacy `standard-trupp` link, so all 3 stations are auto-placed by design (AC10) and numbers = markers. With non-legacy halls the partial numbering passes (44-builder F1).
  - BLAST-hall-ctrlp: identical to main (both show `is-print-pass` right after the WebKit print and clear it on the next action).
- **33-builder AC11c/AC12d:** a GoTrue mail-frequency (60 s) flake, because it runs straight after 32-builder. A clean re-run on the branch gives 141/5 = main's bank build 141/5.

Classification totals: **0 real regressions**. The rest are expected removals/renames, or brittleness / stale-main / environment problems.

## PENDING-real
- AC11 föreningens mall against the live bank. Locally: unit test `hallLegacy.test.ts` 10/10 + stand-in e2e PASS.
- Admin Dölj confirm on a real admin session (compact classes verified in source).
- iOS safe-area padding (`env(safe-area-inset-bottom)` on the compact sheets; headless shows padding-bottom 20px).
- Real Safari print (headless Chrome/WebKit PDFs only).

## Secrets
Grep for JWTs, `sb_secret_`, service_role, private keys, GitHub tokens and the live project ref over the PR diff and all my files: clean. Only the local `sb_publishable_local_s32` is used, and it is not written to reports.

## Artifacts
- Script `verifier/slice-45-verify.mjs`; results `verifier/slice-45-verify-results.json`; progress `verifier/slice-45-progress.md`
- Checks `verifier/slice-45-checks/` (tests, tsc, lint, bundle, PDFs, smokes, repro)
- Screenshots `verifier/slice-45-screenshots-v/s45v_*.png` (33 files)
- Best two copied to `/workspace/screenshots/s45v_12_legacy_standard_on_stora.png` and `/workspace/screenshots/s45v_26_dela_compact_390.png`
