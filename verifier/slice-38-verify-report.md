# Slice 38: Kör passet «Kvar: X min» — Verifier report

**PR #42** · branch `slice-38-code` @ **e747df9** · main / merge-base **1769eca** · checklist `slice-38/verification-checklist.md` (AC1–18, docs 2bb6123, present on the code branch) · 2026-10-13.
**Method:** `npm run build` (plain) → `vite preview` :4381 (branch), :4382 (main 1769eca, temp worktree `/tmp/s38v-main`), :4383 (branch bank build, `VITE_SUPABASE_URL=https://bank-mock.supabase.co`, only for the Slice 35 smokes, Playwright-routed). Headless Chromium 390×844 (+320, 360), `page.clock` fake clock. `verifier/slice-38-verify.mjs` → **71 / 0** (`slice-38-verify-results.json`). Test passes come from real `#dela=` links built by `verifier/slice-38-v-mktoken.ts` (checklist pass 2+1+1 min over 2 blocks; edge pass 3+0+1+1; long pass 90+30+1 with a 95-character title as a real item, not injected). No SQL, no requests to the live Supabase project.

**Short:** the line is the whole-pass remainder `ceil((left + later planned seconds)/60)`, it matches the formula on all 125 one-second samples of step 1, rounds up at every edge, freezes on pause, sits on its own line under «Nästa» at 320/360/390 with no overlap, and appears only inside Kör passet. Tone, «Sista aktiviteten» and wake lock behave the same as on main. Bundle +74 B.

| AC | Verdict at e747df9 | Short |
| --- | --- | --- |
| 1 | **PASS** | Kör passet opens with «Kvar: 4 min». DOM order is run-top > h1 > run-clock > run-next > **run-left** > run-script > run-nav. Muted `rgb(168,162,158)` (`.run-next` is 214,211,209), 14.4 px (`s38v_01`) |
| 2 | **PASS** | Step 1 at 01:30 → «Kvar: 4 min», at 00:59 → «Kvar: 3 min». Value = rest of current step + all later steps (whole pass, not station) |
| 3 | **PASS** | Total 4:01 → 5, 4:00 → 4, 3:59 → 4 (edge pass). Last step 00:01 → «Kvar: 1 min», 00:00 → «Kvar: 0 min» (both passes) |
| 4 | **PASS** | 125 one-second samples through step 1 with no tap. 0 mismatches against `ceil((left+120)/60)` |
| 5 | **PASS** | Nästa övning → recalculates at once. ArrowRight mid-step 2 (00:30 left) → «Kvar: 1 min», so skipped time is dropped. ArrowLeft → 2, Föregående → 4 (clock restarts 02:00). A 0-min step adds nothing |
| 6 | **PASS** | Paused at 01:05 «Kvar: 4 min», 5 min of fake time → clock and line unchanged, «Pausad» shown. Resume → 01:05/4, +5 s → 01:00/3, +1 s → 00:59/3 (`s38v_03`) |
| 7 | **PASS** | Step 1 at 00:00 → «Kvar: 2 min» (later steps only), unchanged after 2 more min (`s38v_02`) |
| 8 | **PASS** | Last step 00:00 → exact text «Kvar: 0 min» for 10 sampled minutes. Visible, same colour, no `role=alert`, exactly one oscillator tone (Slice 34's), never negative (`s38v_04`) |
| 9 | **PASS** | 320/360/390: «Nästa: Mycket lång …» is 1 line with ellipsis. «Kvar: 121 min» is 1 line, top ≥ «Nästa» bottom (e.g. 390: next 208.5–231.7, kvar 239.7–260.6, script from 272.6). `scrollWidth ≤ innerWidth`. Also holds while paused («Pausad») and at time-up («Tiden är ute») (`s38v_05_*`) |
| 10 | **PASS** | Last step: «Sista aktiviteten» + «Kvar: 1 min», separate lines at all 3 widths |
| 11 | **PASS** | Long title as h1 + long safety text (injected into `.run-script`, F3): nav 776–828 ≤ 844 at all widths, overlay scroll 0, only `.run-script` scrolls (`s38v_06_*`) |
| 12 | **PASS** (structural) / VoiceOver **PENDING-real** | Plain `<p>`, no role/aria-live/aria-label/aria-hidden, no live ancestor. Reading order clock → Nästa → Kvar. Clock label unchanged «02:00. Pausa timern» / «01:05. Fortsätt timern» |
| 13 | **PASS** | Run overlay buttons and `[role]` set identical to main (Avsluta, clock, Föregående, Nästa övning). Home/Passbyggaren/Bibliotek/Hall/Golvklart button lists identical to main |
| 14 | **PASS** | No «Kvar:» and no `.run-left` on Home, Passbyggaren, Biblioteket, Hallöversikt, Golvklart or the share page. Visible-button lists and text length (slice number normalised) are equal to main. «Kvar» appears in Kör passet from every entry: Passbyggaren («Kvar: 53 min» on a Planera pass), shared link («Kvar: 4 min»), saved pass (Spara på den här enheten → reload → Kör passet: 4), Hämta ett pass → pasted link → Öppna (4). Main shows none on any of them (`s38v_07…12`) |
| 15 | **PASS** | +74 B total, +85 B eager (cap +512 soft). Reproduces Builder exactly (table below) |
| 16 | **PASS** | build exit 0, `tsc -b` 0. `bun test src` **170 pass / 0 fail** (23 files). lint exit 0, **0 errors / 15 warnings** (same as Slice 37). Slice 38 asserts in feedback.test.ts (3) and clubTemplates.test.ts (1) |
| 17 | **PASS** (headless) / audible tone, vibration, real screen lock **PENDING-real** | Tone: oscillator `start()` counts before/at-0/+3 min/after step 3 = 0/1/1/2, vibrate 2. Identical to main. Exactly one tone per step at 00:00, none from the line. «Nästa»/«Sista aktiviteten» same as main. Pause as AC6. Wake lock (stub): `request('screen')` once on open (same as main), re-requested on `visibilitychange`→visible, released on Avsluta |
| 18 | **PASS** | `runLeftLabel: 'Kvar: {n} min'` verbatim from microcopy. Rendered texts «Kvar: 0/1/2/3/4/5/121 min». Passbyggaren footer «Träningsplaneraren · Slice 38». Tyck till mail ends «Version: Slice 38». No «!» |

## Findings

1. **Definition confirmed: whole pass, skips dropped.** `runRemainingSeconds` = `max(0,left)` + `seconds` of every step after `index`. Nästa övning mid-step discards that step's leftover time. Going back restarts the step and raises X. 0-min steps count 0. This matches A1 and HANDOFF §1. Over time it reads «Kvar: 0 min» (C1), with no negative values and no over-time branch.
2. **Rounding edges all correct** (4:01→5, 4:00→4, 3:59→4, 0:01→1, 0:00→0). `Math.ceil` on whole seconds. `left` is already an integer from `clockRemaining`.
3. **AC11 data limit:** no seed övning has enough text to overflow `.run-script` at 844 px. The long *title* goes through the real data path (unknown activity id = shown title). Only the long safety *text* was injected into `.run-script` to force scrolling, as Builder did.
4. **Old smokes 32, 33, 36 and 37 not run (rule conflict).** All six of those scripts (32/33/36/37 Builder, 36/37 Verifier) run `psql` against the local bank DB (`/tmp/s36/env.json`). The brief's hard rule is "No SQL", so I did not run them. The Slice 38 diff touches only RunPass.tsx, runPass.ts, one UI key + SLICE_NUMBER, `.run-left` CSS and tests. It touches no bank, admin, club or hall code. Their only expected change would be the footer «Slice N» strings. If Planner wants them run, it needs an explicit OK for local-only SQL.
5. **Smokes 34/35/38 match the Slice 37 baseline** (table below). Every failure is the slice-number text («Slice 34/35» footer, version line, SLICE_NUMBER asserts). The 35-verify `E` is the script's own ERR_FAILED route aborts, the same as in the 35/36/37 reports. **No regression.**
6. **Pre-existing, not Slice 38:** on step 1 «Föregående» is hidden and on the last step «Nästa övning» is hidden (Slice 34 nav). This is visible in `s38v_04`/`05`.
7. **Secrets:** `git grep` of e747df9 for `sb_secret_…` values, JWTs, private keys, ghp_/github_pat_, AKIA and sk- keys: **0**. Branch, main and bank `dist`: 0 values (only supabase-js's `sb_secret_`/`sb_publishable_` prefix literals and the local stand-in `sb_publishable_local_s32`). `.github/`: only `vars.VITE_SUPABASE_*`. The project ref string appears in 13 doc lines; it is an identifier, not a credential. New verifier files: 0 hits.
8. **Builder smoke re-run** against my build: `slice-38-builder-smoke.mjs` **26 / 0**.
9. **Worktree:** `slice-38-code` is checked out by Builder in `/workspace/gp-s38`, so I verified in a detached worktree `/workspace/gp-s38v` @ e747df9 and pushed `HEAD:slice-38-code`. The shared tree `/workspace/gymnastics-planner` was not modified.

## Bundle (gzip -9, `dist/assets/*.js` + `*.css`, plain `npm run build`; main built in worktree `/tmp/s38v-main`)

| | main 1769eca | branch e747df9 | Δ |
| --- | --- | --- | --- |
| Total JS+CSS | 216 895 | 216 969 | **+74** (cap +512 soft) |
| Eager coach-facing (index js + index css) | 138 874 + 14 120 = 152 994 | 138 943 + 14 136 = 153 079 | **+85** |
| Lazy (admin chunks, bankWrite, session, supabase dist) | 63 901 | 63 890 | −11 |

Builder's numbers (+74 total, +85 eager, −11 lazy) reproduced byte-for-byte. This is under the HANDOFF estimate of +100–200 B.

## Earlier smokes against the e747df9 build

| Script | Result | Failures explained |
| --- | --- | --- |
| slice-38-builder-smoke.mjs | 26 / 0 | — |
| slice-37-builder-smoke.mjs, slice-37-verify.mjs | NOT RUN | psql (F4) |
| slice-36-builder-smoke.mjs, slice-36-verify.mjs | NOT RUN | psql (F4) |
| slice-35-verify.mjs | 37 / 10 | 9 × «Slice 35» footer/version/SLICE_NUMBER (expected); `E` = own ERR_FAILED aborts (as before). Same as Slice 37 report |
| slice-35-builder-smoke.mjs | 33 / 8 | 8 × «Slice 35» strings (expected). Same as Slice 37 |
| slice-34-verify.mjs | 31 / 1 | Footer «Slice 34» (expected). Same-controls main vs branch all equal. Same as Slice 37 |
| slice-34-builder-smoke.mjs | 29 / 2 | Footer «Slice 34» + string verbatim (expected). Same as Slice 37 |
| slice-33-builder-smoke.mjs | NOT RUN | psql (F4) |
| slice-32-builder-smoke.mjs | NOT RUN | psql (F4) |

Raw output is in `verifier/slice-38-checks/` (smoke-*.txt, lint.txt). The scripts ran from copies with ROOT → the verify worktree and screenshots → /tmp, so no earlier evidence was overwritten.

## Screenshots (`verifier/slice-38-screenshots/`)

s38v_01_start_kvar4, 02_step1_timeup_kvar2, 03_paused_frozen, 04_last_over_kvar0, 05_long_next_{320,360,390}, 06_long_h1_{320,360,390}, 07_home, 08_passbyggaren, 09_bibliotek, 10_hall, 11_golvklart, 12_share_page.

## Verdict

**PASS:** AC1–18 PASS. AC12 (VoiceOver) and the audible/physical part of AC17 are PENDING-real.

## Ready to merge?

**Yes.** The change is tiny and isolated to Kör passet, matches the locks exactly, is +74 B, and tests, lint and build are green. Re-run smokes found no regressions. Not blocking: F4 (the SQL-using 32/33/36/37 smokes were not re-run under the No-SQL rule) and the PENDING-real device checks. Not merged by Verifier.
