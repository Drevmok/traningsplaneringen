# Slice 51 — Laga trasiga smokes (infra)

Base: main 055af39 · docs: slice-51-docs 9099d83 · branch: slice-51-code. App bundle diff: 0 B (`git diff 055af39 -- app` is empty). SLICE_NUMBER stays 49.

## What changed
- **A1:** `verifier/tools/smoke-start.mjs` is a shared start-flow helper: openWizard, startTomt, startMall, openMallList.
- **B1:** PW_CORE, the URLs and SMOKE_ROOT come from env, set by `verifier/tools/run-smokes.sh`. There are no hard-coded /workspace/gp-sNN paths, and no keys are stored in files.
- **C1:** s32 uses code login. Footer checks follow SLICE_NUMBER (`sliceNumber()` in tools/smoke-login.mjs), in s32 and s46.
- **D1:** each smoke exits 1 on FAIL. `--baseline` prints SAMMA / NY FAIL / LAGAD, and the runner exits 1 on any NY FAIL. A missing script now counts as NY FAIL (exit 127).
- **E1:** KARANTÄN-FAIL plus quarantine.tsv. A quarantined id that fails 2 runs in a row becomes NY FAIL.
- **F1:** five small fixes: setup.sh, env.sh, install-once.sh, lib.sh and push-promote.test.ts.
- **New fixture:** `verifier/fixtures/s30own.json`, made by make-s30own.ts from the real import pipeline. It seeds the own list now that coach import is gone.

## Adapted or removed expectations (AC4)
Each one has a `// Slice 51:` code comment that cites the decision.

| Script | Change | Decision cited |
|---|---|---|
| s30 builder | 13a/13c are now absence checks. Removed 13b, 14a–c, 15a/b, 16a, 9g–i, 32b, 34b, 17a, 19a–25c, 11a/b, 34c, 35a–c (coach import, library tabs, own buttons, ikväll) | Slice 47 A1/B1/E1/F1 |
| s30 builder | 6a is now the clipboard #dela= link; 5 goes Hallöversikt → Golvklart; 31b is redskap text | Slice 44 Dela/Golvklart |
| s30 builder | 18a uses the new importIsExercises text | Slice 47 F1 |
| s30 fix-b1, seed | own list seeded; own cards picked via `.own-badge`; I1 is now «no coach import» | Slice 47 F1 (state covered by ownImport.test.ts:88) |
| s31 | Spara utkast replaced by an autosave wait | Slice 39 |
| s31 | C4b removed | Slice 44 |
| s31 | C3b accepts any zone | Slice 45 |
| s31 | C1b accepts sb_publishable_ | B1 |
| s31 | C6b uses a seeded own drill | Slice 47 E1 |
| s32 | magic-link-only ACs removed | locked answer |
| s37 | useMall without confirm when there is nothing to replace; 5 s undo toast (AC9a–e); header buttons | Slice 41/46 |
| s43 | layout picker / förenings-halls checks are no-ops (pickHall); AC3 ratio, AC5 picker and AC7 preset tips dropped | Slice 45 B1 |
| s45, s46 | menu() tries direct header buttons first | Slice 46 |
| s45 | AC17 reads the bundle from TPV_PLAIN | B1 |
| s46 | AC20 footer follows SLICE_NUMBER | C1 |

## Remaining FAIL (not NY FAIL; go to Slice 52 per the locked answer)
- s43 AC5: header buttons smaller than 44×44.
- s44 AC6: an old main 0d88da5 link doesn't open on the branch.
- s45 AC1: wizard Q3 shows Fokus chips, not Hall.
- s45 AC10: old #dela= link timeout.
- s45 AC14-tall: Förrådslista sheet h=225.
- s46 AC10: Passlängd gives 90 / 90 min, not 53.
- s46 AC17: click timeout.

These may be wizard or behaviour changes from Slices 47–49 rather than app bugs. That needs a decision.

## Open questions
1. Is it OK to remove the coach-import ACs in s30/seed (Slice 47 F1), beyond the s32 magic-link removal?
2. Should the 7 remaining FAILs be adapted (if they are intended changes) or fixed in the app (Slice 52)?

## Evidence (verifier/slice-51-checks/, local stand-in only, 0 live calls)
| AC | File | Result |
|---|---|---|
| AC2 | ac2.txt | 4 scripts, exit 0, 0 FAIL |
| AC3 | ac3.txt | s32 78/0 (code login) |
| AC5 | ac5.txt | start clicks only through smoke-start |
| AC6 | ac6.txt | PASS |
| AC7 | ac7/run1-3.txt, summary.txt | 3 identical runs, rc=0, 0 NY FAIL. Strict «0 FAIL alla tre» NOT met: the 7 known FAILs below remain |
| AC8 | ac8.txt | s33 exit=1 95/12 (FAIL makes exit 1) |
| AC10 | ac10.txt | injected break leads to NY FAIL 34→24, runner rc=1 |
| AC11 | ac11.txt | crash reported as KRASCH with exit=1 |
| AC12 | ac12.txt (+ try1-before-fix) | KARANTÄN-FAIL plus SAMMA, rc=0; NY FAIL on 2 runs in a row, rc=1 |
| AC13 | ac13-doctor.txt, ac13-install.txt | empty HOME: Doctor BLOCKED, then install-once, then PASS |
| AC15 | ac15.txt | fresh home: test 263/0, test-bank 26/0 |
| AC16 | ac16.txt | two Doctors running at once both PASS (pg 54746 and 54747) |
| AC17 | ac17-grep.txt, ac17-bank.txt | no live host or keys; bank 26/0 against the stand-in |

## Fixes added during evidence work
- run-smokes.sh compare(): a KARANTÄN-FAIL no longer counts as a lost PASS (AC12).
- slice-32-local/setup.sh tpv_pg_port(): skips busy ports and run ports (AC16).

## PO decisions
- Coach-import checks in s30 and the seed smoke are removed (Slice 47 F1 made import admin-only). Repointing them to the admin path was not cheap, so it was not done; candidate for Slice 52.

## Likely cause of each remaining FAIL (Slice 52)
| FAIL | Likely cause |
|---|---|
| s43 AC5 header buttons under 44×44 | Slice 48 |
| s44 AC6 old main 0d88da5 link | Slice 45/48 (sharePass) |
| s45 AC1 Q3 shows Fokus chips | Slice 46 |
| s45 AC10 old #dela= link | Slice 48 |
| s45 AC14-tall Förrådslista sheet h=225 | Slice 48 |
| s46 AC10 90 min instead of 53 | Slice 49 A1 |
| s46 AC17 Mallar tab gone | Slice 47 A1 |

## More open findings
- install-once runs `npx -y playwright install chromium`, which pulls the latest Playwright rather than the pinned version. It should be pinned.
- Without --baseline the runner exits 0 even when a script exits 1.
