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
- Clean re-run, chunk 1: 44-builder, 43-builder, 43-verify, 42-verify, 39-verify. Results are below once they are in.
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
