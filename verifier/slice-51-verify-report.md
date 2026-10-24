# Slice 51 «Laga trasiga smokes»: verify report (c710240)

- PR #56, head **c710240** (did not move), base main 055af39. Spec: slice-51-docs 9099d83 (the checklist matches the copy on the code branch).
- Christoffer's lock in decisions.md («Lås enligt rekommendationerna», 2026-10-24) reached me only through agents, so it is **unconfirmed**.
- Ran only on the local stand-in. 0 requests went to the live project. My raw outputs are in `verifier/slice-51-verify-checks/`.

## Verdict: PASS with one PO-accepted deviation (AC4/AC7, 7 known FAILs → Slice 52)

| AC | Result | Evidence (mine unless noted) |
|---|---|---|
| AC1 old logs match the causes | PASS (Builder's evidence) | `slice-51-checks/before/` has every listed script; deviations are in SHIPPED |
| AC2 s30, s30-fix, seed, s31 | PASS | My loop: exit 0, 0 FAIL, LAGAD |
| AC3 s32 | PASS | 78/0 exit 0, LAGAD (FAIL 16→0). The removed magic-link ACs are listed (locked answer 3) |
| AC4 s37, s42–45 at 0 FAIL | **Deviation (PO)** | s37 24/24 and s42 24/24 pass. s43 1, s44 1 and s45 3 FAILs remain. Changed expectations cite decisions, see Findings |
| AC5 start through smoke-start | PASS (Builder ac5 + diff review) | |
| AC6 smoke-map | PASS (Builder ac6) | |
| AC7 three loops at 0 FAIL | **Deviation (PO)** | Builder's 3 runs plus my 1 are identical per script. 0 NY FAIL, rc=0. 7 known FAILs: s43 AC5; s44 AC6; s45 AC1, AC10, AC14-tall; s46 AC10, AC17 |
| AC8 FAIL → exit ≠ 0 | PASS | s33 exit=1 at 95/12 (fixes my Slice 50 minor) |
| AC9 --baseline | PASS | Every line is SAMMA or LAGAD, rc=0 |
| AC10 fault injection | PASS | See below: NY FAIL, runner rc=1 |
| AC11 crash message | PASS (Builder ac11 + code: `KRASCH: <Error>`) | |
| AC12 quarantine | PASS (Builder ac12; not re-run, since s33 takes about 3 min per run) | |
| AC13 Chromium check | PASS (Builder ac13). Doctor and install-once now both check `chromium_headless_shell-*` | |
| AC14 app/ and bundle | PASS | app/ diff is empty. bundle.txt is identical to main (215152). SLICE_NUMBER 49. Unit tests 263/0 |
| AC15 test.txt / test-bank.txt | PASS (Builder ac15, fresh home) | The shared main cache 055af39 has no test-bank.txt because it was built before this doctor (info) |
| AC16 two TPV_HOMEs | PASS (Builder ac16: pg 54746/54747) | |
| AC17 /tmp/s32 | PASS | `grep -rn /tmp/s32 tools/bank` gives no hits (fixes my Slice 50 info) |
| AC18 0 live requests | PASS | Loop 4094 requests, faults 108, 0 live |
| AC19 ≥2 av 20 | PASS | slice-50/decisions.md:15 |

### AC4/AC7 deviation
- decisions.md, locked answer 1: «Kända FAIL i s33–47 tas i Slice 52, inte här». The text is there (on slice-51-docs).
- All 7 FAILs are in s43–46, so the answer covers them. They are listed and explained per FAIL in SLICE51-SHIPPED.md.
- **Conflict:** the checklist AC4 («alla exit 0, 0 FAIL») and AC7 («0 FAIL alla tre gångerna») were not changed. The PO accepted the deviation; strictly by the checklist, it fails.

## Old-smoke loop (my run, compared with main 055af39 and Builder run1)
- **Fixed (LAGAD), 11 scripts:**
  - seed, s30, s30-fix, s31 and s37: crash → 0 FAIL.
  - s32: 16 → 0 FAIL; s42: 10 → 0.
  - s43: 8 → 1; s44: 9 → 1; s45: 18 → 3.
  - s46: crash → 35/37, 2 FAIL.
- **Still failing, known (SAMMA as main):** s33 12, s34 2, s35 13, s36 4, s38 1, s39 5, s40 4, s41 2, s47 3.
  - Those already-known FAILs are in s33–41 and s47; the 7 deferred above are in s43–46.
- **Passing as before:** s48 80/80, s49 34/34.
- **New failures: none.** My counts match Builder's run1, run2 and run3 exactly.

## Fault injection (scratch worktree, 2 strings in app/src/data/blockMeta.ts)
- `sourceLineAt` «Källa:» → «Kalla:» and `clubTemplateApplied` text changed. Run with `--baseline final-run.txt`:
  - s30-fix: NY FAIL 11 → 10 (E1).
  - seed: NY FAIL 64 → 52 (D1b–D12b, P2).
  - s37: NY FAIL 24 → 21 (AC9a, AC9c, AC9e).
- The runner gave rc=1. The repaired smokes still assert real behaviour.

## Findings
- **Minor M1 (PO note, verified):** install-once runs `npx -y playwright install chromium` without a pinned version. It downloaded v1248 (Builder ac13-install.txt:10–14), while the box and lockfile use 1243.
- **Minor M2 (PO note, verified):** without `--baseline`, the runner exits 0 even when a script exits 1. Seen with the injected fault on s30-fix: script exit=1, runner rc=0.
- **Minor M3:** some repaired assertions got weaker:
  - s43 AC3 has `const ratioOk = true || …` (dead assertion).
  - s43 AC7 accepts missing tips (`v !== false`).
  - s37 AC9a/AC9b/AC9e pass when there is no toast or dialog.
  - All of them cite a decision from Slices 41–46. AC9c still checks the toast text, which the fault injection confirmed.
- **Minor M4:** the s30 and seed coach-import ACs were removed (about 30 ids). Locked answer 3 only covers s32 magic-link removal. SHIPPED lists this as a «PO decision», which reached me only through agents (unconfirmed), and open question 1 still asks the same thing.
- **Info:**
  - The shared main-cache `smoke-baseline.txt` for 055af39 ends with a run-smokes.sh syntax error line written from Builder's `/workspace/gp-s51`, and has no netlog line. The comparison still worked.
  - The main cache lacks test-bank.txt (it was built before F1).
  - The slice-51 checklist still says FÖRESLAGEN even though decisions.md is locked.
- Slice 50 minors: s33 exit 0 is **fixed**, the Playwright path mismatch is **fixed**, and the /tmp/s32 hardcode is **fixed**.
- **Secrets:** no sb_secret_ values, JWTs or stand-in key values in `git diff 055af39..c710240`.

## PENDING
- The 7 known FAILs → Slice 52.
- Confirmation from Christoffer of the decisions lock.
