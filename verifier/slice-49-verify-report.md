# Slice 49: Verify report (HEAD 42f0f8d)

**Verdict: PASS.** No blockers or majors. 2 minors and 3 info items.
Verified on 2026-10-23, 19:44–21:05 CEST. PR #54, branch `slice-49-code`, base main `c86175a`.

## What the slice changes
- **A1:** Planera pass splits the chosen length over the blocks using `WIZARD_BLOCK_MINUTES` (60/90/120) and a largest-remainder `splitMinutes`. The builder now shows «X / X min» instead of «53 / X».
- **C1:** Planera pass saves the suggested station equipment right away, so Förrådslista is filled and there is no saknar row.
- **D1:** One «Använd alla förslag» button, in the toolbar, shown only when at least 1 station has an unsaved suggestion. The saknar row is text only, and «Inga förslag att spara» is gone.
- **E1:** «Föreningens mallar» is shown only when the club has at least 1 template. The admin page keeps its empty text.
- **Footer:** Slice 49.

## Main risks (as assessed in chunk 1) and outcome
1. Rounding: the minutes might not add up to the length, or some might not be whole. Checked exhaustively: 576 wizard combos. Every total equals the chosen length and every time is a whole minute ≥1.
2. C1 might leak to mall starts. It does not: a built-in mall start saves no equipment.
3. Focus loss when the button unmounts. Confirmed, see m1.
4. E1 might hide the admin empty state. It does not: AC15 passes on the stand-in.

## HEAD 42f0f8d and process
- `git diff --stat 43cfae4 42f0f8d` touches docs only: SLICE49-SHIPPED, IMPROVEMENTS, HANDOFF and the checklist. No code changed.
- The PO lock (A1–F1, under a standing permission from Christoffer, Effort S) is **PO-reported and unconfirmed**.

## Per-AC results
| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS | «60 / 60 min». Block sums are 6/10/21/15/8. |
| AC2 | PASS | «90 / 90 min». Teknik is 12/12/12. |
| AC3 | PASS | «120 / 120 min». Block sums are 8/20/45/27/20, all whole minutes. |
| AC4 | PASS | 4–6 år, Satsbräda: «90 / 90 min». |
| AC5 | PASS | Kör passet starts at «Kvar: 90 min». |
| AC6 | PASS | «90 / 60 min». Times unchanged; target saved as 60. |
| AC7 | PASS | No saknar row and no buttons. All 3 Teknik stations have saved equipment. |
| AC8 | PASS | Förrådslista has 4 rows and no empty text. |
| AC9 | PASS | Text-only saknar row and exactly one toolbar button. |
| AC10 | PASS | Toast «Sparade redskap på 3 stationer», then the button disappears. |
| AC11 | PASS | The Förrådslista pointer closes the list and highlights the button. |
| AC12 | PASS | Plain build plus bank stand-in with 0 club templates: no section and no empty text. |
| AC13 | PASS (stand-in) | Wizard mall step with 0 club templates. |
| AC14 | PASS (stand-in) | 1 club template: the section and card show in both Använd mall and the wizard. |
| AC15 | PASS (stand-in) | Admin login on the stand-in with 0 templates: «Föreningen har inga mallar än.» is still shown. |
| AC16 | PASS | «Träningsplaneraren · Slice 49». |
| AC17 | PASS | `bun test src`: 263/0 (main 256/0). tsc 0. oxlint 0 errors. |
| AC18 | PASS | Bundle gzip -9 vs main: plain **+21 B**, bank **+14 B**, against the ≤512 guideline. Builder claimed +30 B. |

Extra checks:
- Tomt pass has no apply button and no «Inga förslag».
- Viewports 320, 390, 844×390 and 1280: no horizontal scroll, and the button is reachable.
- 0 page errors.
- Script `verifier/slice-49-verify.mjs`: 26/26.
- Builder smoke: 34/34.

## Findings
- **m1 (minor, a11y):** After «Använd alla förslag», the button unmounts and focus falls to `BODY`. Keyboard and screen-reader users lose their place. Suggestion: move focus to the toast or the toolbar.
- **m2 (minor, docs/test):** Builder's smoke runs AC2 on Trampett/Grophallen, not the checklist's Blandat/Stora hallen. I covered the checklist path myself.
- **i1 (info):** While the admin chunk loads, the fallback `ClubTemplatesSection` shows a title and hint with no empty text. This is brief and harmless.
- **i2 (info):** The stand-in bank tests read the hard-coded path `/tmp/s32/bot-keys.txt`. Offline result: 21 pass, which matches Builder's 21/0. Stand-in result: 25/1, the same as the Slice 48 baseline (the failing test re-runs on state from a previous run).
- **i3 (info):** The smoke loop result fixtures for s46 (`/tmp/s46fix.json`) and s30/31/seed (`gymnastics-planner/tools/bank/out`) are not in the repo, so I could not run those smokes. This is known from earlier slices.

## Smoke loop (wt vs main, same stand-in; Slice 48 baseline)
- s34, s35, s36, s38, s39, s41–45, s47 and s48 give the same results on wt and main. s48 is 80/80.
- s40 is 12/5 on wt and 13/4 on main. The only difference is AC14 «no new Hallöversikt buttons»: the toolbar «Använd alla förslag» after a mall start. That is the **intended D1 change**, not a regression.
- s32 (14/18) and s33 (93/14) fail on stale pre-Slice-49 selectors (home «Tomt pass», «Skicka länk», «Från mall»). The Slice 49 diff does not touch those areas.
- s37 crashes in openFromHome, as it did in the s48 baseline (0/0).
- The s33 otp_expired flake did not show up.

## Feature maps and docs
- HANDOFF §9 asks for 6 feature-map edits. Builder made exactly those 6, and the text is correct.
- Docs (7 `docs/*.sv.md`) and the backlog were updated.

## PENDING-real
- AC13–15 against the real club backend: only the stand-in was used.
- Real iPhone Safari layout: only headless Chrome emulation was used.

## Network and secrets
- No live requests: **0** requests to `fhzqwbdlejzohetdoluw` and 0 BLOCKED, out of about 3,670 logged requests.
- Secret grep before every push: 0 hits.

Screenshots: `/workspace/screenshots/s49v_01…04*.png`. Check files: `verifier/slice-49-checks/`.
