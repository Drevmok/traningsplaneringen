# Slice 44 verify: progress (PR #48 @ 800651e, base main 0d88da5)

Checkpoint file. The verify was interrupted twice, so it is being finished in short chunks. All times are Europe/Stockholm (UTC+2).

## Done
- **Verify script** `slice-44-verify.mjs`: **37 / 39**, results in `slice-44-verify-results.json`. The 2 fails are findings F1 and F2.
- **AC1–AC18, AC21, AC22**: PASS on the exact AC text. Per-AC evidence is in `slice-44-verify-report.md` (partial).
- **AC20**: simulated PASS (stall line after about 1.56 s on all 3 surfaces).
- **AC19, and the real-device part of AC20**: PENDING-real (iPhone).
- **Planner's specific asks**:
  - AC11 fullscreen: done, PASS.
  - AC12 Home import: done, PASS.
  - AC16 ratios vs main: done, identical.
  - AC14 real Chrome print preview: done. Branch 3 pages; main 2 pages with an orphaned heading.
  - AC21: done, PASS.
  - Copy-link failure: done, PASS.
  - Old share links: done, PASS.
  - Station numbers vs markers: **F1 (Medium)**.
- **Bundle**: done. −5,684 B gz total, −5,690 B eager.
- **Tests**: `bun test src` 226/0. tsc rc 0. Lint 0 errors / 6 warnings. Build OK.
- **Secret grep**: clean.
- **Findings so far**:
  - F1 (Medium): print numbers ≠ hall markers when a Teknik station is unplaced.
  - F2 (Low): is-print-pass stays on in Golvklart.
  - F3 (Cosmetic): tall Dela sheet.
  - **No SERIOUS finding.**

## Old smokes (in progress)
- The first smoke run was invalid. My bank build used an `http://` stand-in URL, so `bankConfigFrom` turned the bank off, and the stand-in-dependent sections failed (42-verify C, 39-verify C2).
- Fix: rebuilt the bank build with `https://bank-mock.supabase.co` (routed to the local stand-in) and restarted :57740.
- The second run was also invalid: two loops ran concurrently and overwrote each other's outputs. Both runs were discarded.
- Clean re-run, chunk 1 (started 10:28 UTC+2, one loop only, bank build on https):
  - **slice-44-builder-smoke: 26/26 PASS.**
  - **slice-43-builder-smoke: 21/22.** The only fail is AC16-footer «Slice 43», which is expected (footer bump).
  - **slice-43-verify: 24 / 4.** All four fails are classified:
    - AC8 (Golvklart lost «Helskär» and «Skriv ut kort»): expected, per slice-44/README.md lines 53 and 60.
    - AC11 (the hall sits 52 px higher because of AC8): expected.
    - AC16-footer: expected (footer bump).
    - AC6-320 (saknar-banner ellipsized at 320 px): pre-existing. It failed the same way in the Slice 43 verify itself.
    - **0 new regressions.**
  - 42-verify, 39-verify, then the rest (42-builder … 32) run in one sequential chain (chain.sh waits for the previous loop to exit):
  - **slice-42-verify: 59 / 2.** The fails are AC18-footer (expected) and S39-unsaved (baseline). 0 new. Section C (föreningsmall via the stand-in) now passes, which confirms the earlier C fail came from the bank being off.
  - **slice-39-verify: 67 / 5** (AC1, AC22a, AC3/AC17, F3, I), the same set as the baseline. 0 new. C2 now passes. Live requests: 0.
  - **slice-42-builder-smoke: 23/24.** The fail is AC18-footer (expected, the same as the baseline).
  - **slice-41-reverify-b: 93 / 2** (AC22-footer, C), both in the baseline. 0 new.
  - **slice-41-builder-smoke: 32/34** (AC16, AC22-footer), both in the baseline. 0 new.
  - **slice-40-builder-smoke: 15 / 5** (AC1/2/8-main, AC16-footer, M), all in the baseline. 0 new.
  - **slice-40-reverify: 37 / 2** (AC16-footer, C), both in the baseline. AC14-controls now passes.
  - **slice-39-builder-smoke: 25 / 3** (C, F, G), all in the baseline. 0 new.
  - **slice-38-builder-smoke: 25 / 1** (AC18a), in the baseline.
  - **slice-38-verify: 67 / 4.** The fail set matches the baseline. 0 new.
  - **slice-37-builder-smoke: rc 1.** It crashed at line 88 waiting for «Ersätta det här passet?» → «Använd mall». This is the identical crash to the Slice 43 baseline, so it is pre-existing.
  - slice-37-verify: running at checkpoint 6. Fails so far are all in the baseline.
  - Left after it: 36-builder, 36-verify, 35-builder, 35-verify, 34-builder, 34-verify, 33-builder, 32-builder (8). in the same background loop. Output goes to `/workspace/s44v/smk/out/`.
- Classified so far from the earlier partial runs. These are preliminary and get re-confirmed on the clean run:
  - Footer «Slice 43/42…» asserts: expected (the footer is bumped to Slice 44).
  - 43-verify AC8 and AC11: expected. Golvklart lost «Helskärm…» and «Skriv ut kort» (StationDeck removed per AC9), so the hall sits 52 px higher than on main.
  - 43-verify AC6-320: pre-existing. It already failed in the Slice 43 verify itself.

## Remaining
- Nothing left for the Verifier. All smokes are classified (0 regressions; see the report). Final commit made, teardown done.
- PENDING-real: AC19, AC20 (iOS PWA), iOS clipboard, Android Chrome.

## Re-verify @ 9fc5fd9 (F1 + F2 fixes), 2026-10-17 11:2x–11:4x UTC+2
- Done:
  - F1 FIXED (remove the middle station → unnumbered in the print, the rest match the markers; placed back → 1–4 again).
  - F2 FIXED (tap, Ctrl+P or Avsluta golvklart → the browser print shows the hall; real Chrome Ctrl+P preview = the hall, same as main; «Skriv ut passet» still gives 3 pages, repeated 3×).
  - AC14/16/17 re-run PASS.
  - verify 38/39 (BLAST-hall-ctrlp resolved, see the addendum). Builder smoke 44: 32/32.
  - Bundle −5,599 vs main. Tests 228/0, tsc/lint/build OK, secrets clean.
- Remaining: none for the Verifier. PENDING-real as listed in the addendum.
