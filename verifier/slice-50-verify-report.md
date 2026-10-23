# Slice 50 «Snabbare verifiering»: verify report (5e961cf)

- PR #55, head **5e961cf** (it started at 48fd211; `48fd211..5e961cf` is docs only: SLICE50-SHIPPED.md and the AC11 line in the checklist). Base is main 9a087c3.
- Spec: slice-50-docs @ 0a3b305, LÅST, with decisions.md. **Christoffer's go is UNCONFIRMED.** decisions.md says «Låst 2026-10-23 av Christoffer», but the PO reported that and I have not seen it confirmed.
- Ran only on the local stand-in (/home/box/tp-verify, port 54741). 0 requests went to the live project. My raw outputs are in `verifier/slice-50-verify-checks/`.

## Verdict: PASS with PO-accepted deviations (AC11, AC16); AC12/13/15/19 PENDING; old-smoke loop pending

| AC | Result | Evidence |
|---|---|---|
| AC1 install-once idempotent | PASS | Fresh TPV_HOME: run 1 installs, run 2 prints "nothing to install", exit 0 |
| AC2 doctor fast | PASS | All PASS in 614 ms and 546 ms |
| AC3 BLOCKED message | PASS | No GoTrue → "BLOCKED GoTrue … — kör bash verifier/tools/install-once.sh", exit 1, nothing installed |
| AC4 stale template rebuild | PASS | Changing the seed's sha rebuilds the template; the original was restored |
| AC5 reset with no leftover data | PASS | Two runs at once, a leak and an extra table planted in one; a new run has leak=0, table=0, 51 rows |
| AC6 0 live requests | PASS | Every netlog shows 0 requests to the live host (fault run: 54 requests, 0 live) |
| AC7 main cache by SHA | PASS | `main/9a087c3…/.complete`; a second doctor run reads it and does not rebuild (mtime unchanged) |
| AC8 targeted pick | PASS | c86175a..42f0f8d gives the full loop because App.css is core; s40, s48 and s49 included, s32/s33 out (INFO) |
| AC9 unmapped file → full loop | PASS | `PICK_FILES=app/src/nonexistent.ts` → HELA LOOPEN |
| AC10 map coverage | PASS | All 22 smoke scripts are mapped; only reverify scripts are left out |
| AC11 s33 20 runs | **PASS as PO-accepted deviation** | See below |
| AC12, AC13, AC15 | PENDING | They need the next app slice. The mechanism exists: pick-smokes, run-smokes and the main cache, all tested above |
| AC14 app/ empty, bundle unchanged | PASS | `git diff 9a087c3..5e961cf -- app/` is empty. The build of 5e961cf has the same bundle.txt as the main cache, 215152 TOTAL, every chunk the same. Unit tests: 263 tests, 0 fail |
| AC16 old skill removed | **PO-accepted deviation** | The `-2` skill still exists (it stays until after merge). The pointer SKILL.md links to the repo source |
| AC17 selectors | PASS | 65 selectors, 0 missing |
| AC18 PROJECT.md recipe | PASS | Matches HANDOFF §7 exactly |
| AC19 weekly routine | PENDING | Waits for the Sunday run. weekly.sh exists: doctor → run-smokes --all → week file → diff, exit 3 on a new FAIL |

### AC11
- **Checklist on 5e961cf:** «AC16d/AC11d: karantän vid ≥2/20 FAIL (D1; PO-svar), annars godkänt med logg (GoTrue /otp, /verify, mejltider)».
- **decisions.md D1:** «Karantän för s33 om testet faller i 2 av 20 körningar».
- **Builder's evidence:** 20 runs with 1 FAIL. Run 3 failed AC16d: the GoTrue log shows `/verify` 403 "token has expired or is invalid", then a login at 22:36 CEST. In that run AC11d did not run. The log is attached. Under the threshold, so approved.
- **Conflict:** the checklist was changed after the verify began. On 48fd211, and still on slice-50-docs (FÖRESLAGEN), it says «AC16d/AC11d FAIL högst 0 gånger; annars karantän enligt D2». Under that text, 1/20 would mean FAIL/quarantine. The PO accepted the change.

## Fault injection (quarantine can't hide a real regression)
- In a scratch worktree I changed `WIZARD_BLOCK_MINUTES[90].techniques` from 36 to 30, then built and ran run-smokes on s49.
- Result: **exit=1, 24/34**, with FAIL [AC2/AC5/AC6] at 390, 844 and 1280 px. The regression shows.
- `karantan` is only an INFO line in pick-smokes, scoped to the listed AC ids. run-smokes keeps the FAIL lines and the exit code. Any AC not in quarantine still fails visibly.
- Capture: `/workspace/screenshots/s50v_fault_injection.png`.

## Findings
- **Minor M1:** a quarantined AC id (s33 AC16d/AC11d) would hide a real regression in that same AC. The guard against this is only the manual checklist row for login slices.
- **Minor M2:** s33's exit code is 0 even with FAIL 12–13. The exit code alone doesn't signal failure, so the comparison against the baseline has to be manual. run-smokes does not diff against smoke-baseline.txt.
- **Minor M3:** the slice-50-docs checklist still says «högst 0» and FÖRESLAGEN, which doesn't match the head or D1.
- **Info:**
  - doctor checks Playwright with `chromium_headless_shell-*` + google-chrome; install-once checks `chromium*`.
  - The main-cache test step runs `bun test`, not `bun test src`.
  - s34–47 are labelled "trasig" even though they are in the loop.
  - bank_template has no club_templates table (s36 SQL is applied per run).
  - Two TPV_HOMEs can't run doctor side by side (both use port 54741).
- **Info (secrets):**
  - No sb_secret_ values or JWTs in the diff.
  - The stand-in's local `sb_publishable_` key is in slice-32 files from before this slice. It is a local, publishable key and allowed.
  - `/tmp/s32/bot-keys.txt` and `/tmp/s32/env.json` are still hard-coded in tools/bank/push-promote.test.ts:209/211. They are not changed to the S32_DIR/standin path, so those stand-in tests skip or fail without /tmp/s32.

## PENDING
- AC12, AC13 and AC15 wait for the next app slice. AC19 waits for the Sunday routine.
- Old-smoke loop: it was started in the background on 5e961cf (`/workspace/s50v/loop`). Loop pending.
