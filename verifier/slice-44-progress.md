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
  - slice-41-reverify-b: running at checkpoint 5. The fails so far are AC22-footer and C, both in the baseline.
  - Queued in the same chain: 41-builder, 40-builder, 40-reverify, 39-builder, 38-builder, 38-verify, 37-builder, 37-verify, 36-builder, 36-verify, 35-builder, 35-verify, 34-builder, 34-verify, 33-builder, 32-builder. At about 5 min each, that is roughly 80 min. in the same background loop. Output goes to `/workspace/s44v/smk/out/`.
- Classified so far from the earlier partial runs. These are preliminary and get re-confirmed on the clean run:
  - Footer «Slice 43/42…» asserts: expected (the footer is bumped to Slice 44).
  - 43-verify AC8 and AC11: expected. Golvklart lost «Helskärm…» and «Skriv ut kort» (StationDeck removed per AC9), so the hall sits 52 px higher than on main.
  - 43-verify AC6-320: pre-existing. It already failed in the Slice 43 verify itself.

## Remaining
- Clean smoke chunk 1 (running), then chunk 2: 42-builder, 41, 40, 39-builder, 38, 37.
- Chunk 3: 36, 35, 34, 33, 32.
- Compare against the baseline in `slice-43-checks/smokes/` and classify the results.
- Add the smokes section to the report and finalise it (verdict PASS + F1 for Planner).
- Copy the 2 best screenshots to `/workspace/screenshots/`.
- Final commit «Verifier: Slice 44 verify report (800651e)», then push fast-forward.
- Tear down: previews 57740–57742, Xvfb :44, stand-in, worktrees.
