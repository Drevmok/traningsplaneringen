# Slice 46 verify: progress (PR #50 @ fe5e51e, main bc8cce0, pack slice-46-docs @ abbd242)

## Setup (chunk 1, 19:19–19:35)
- Main: Slice 45 was merged as **3708bf8** (confirmed). Current origin/main is **bc8cce0**: 3708bf8 + scout PR #40, backlog docs only, no app change. The branch contains main.
- Pack: `slice-46/` on the branch is identical to slice-46-docs @ abbd242 (`diff -rq` empty). README status is LOCKED A1–F1.
- Pack text, checked against the locks relayed by Planner:
  - «Header buttons» = the bottom footer row ✔ (README status + open item 2).
  - Planera pass replaces the draft without asking ✔ (status, AC18).
  - Note text: status says «Passen sparas bara på den här enheten.» (key `draftHonestyBodyShort`) ✔.
- Worktrees (detached): `/workspace/s46v/wt` @ fe5e51e, `/workspace/s46v/main` @ bc8cce0, `/workspace/s46v/docs` @ abbd242.
- Stand-in: `slice-36-local/up.sh` with `S32_DIR=/workspace/s46v/sb`, ports 5783x. 36-03 is 8×t.
- Previews:
  - :57841 branch plain
  - :57842 main plain
  - :57840 branch bank (`https://bank-mock.supabase.co`, routed to the stand-in)
  - :57843 main bank
- Smoke loop: one loop, flock `/workspace/s46v/smk/loop.lock`. Root `/workspace/s46v/smk` (tar copy of wt). The Slice 45 wizard-chip patch is applied to the old smokes. The baseline is `verifier/slice-45-checks/smokes{,-patched}`. Started 19:22 with 46-builder first.

## Builder claims, checked
| Claim | Measured | Verdict |
|---|---|---|
| bun test src 245/0 | 245 pass / 0 fail | ✔ |
| tools/bank 26/0 | 21/0/5 skip without a DB. With my stand-in (`S32_GATEWAY`, `/tmp/s32` → my sb, temporary symlink, removed after): **26/0** | ✔ |
| tsc clean | rc 0 | ✔ |
| lint 0 err / 6 warn (= main) | 0 / 6; main 6 | ✔ |
| build green | ✔ | ✔ |
| bundle +540 B (JS +406, CSS +134) | main 212,145 → 212,685 = **+540**; JS 198,164 → 198,570 = **+406**; CSS 13,981 → 14,115 = **+134**; eager +551 | ✔ exact |
| self-smoke 33/33 | `verifier/slice-46-builder-smoke.mjs` is **not in the PR** (it is only in Builder's uncommitted working copy `/workspace/gp-s46`, together with its screenshots and the fixture `/tmp/s46fix.json`). I copied it read-only into my smoke root to re-run it | see loop |

Bundle vs guidelines: AC24 says «≤ +1 kB gz JS soft», and +406 B JS is within it. Against the ~512 B guideline: JS is within, JS+CSS is 28 B over. Christoffer's acceptance is unconfirmed (nothing about it in the pack or PR).

## Chunk 1 end — 19:42 CEST
Script `slice-46-verify.mjs` written (p1 / p2 / p3). Runs: `slice-46-checks/verify-p1-run.txt`, `verify-p2-run.txt` (+ `-rerun*.txt` after script fixes).

**p1 10/10 PASS**: AC1, AC2, AC3 (docH 844, main 898), AC4, AC5-local (admin + non-admin on my stand-in: rows, focus on Logga ut, Logga ut works), AC6, AC21-home-land, AC21-home-desk, W-320-home, LIVE 0.
- Desktop 1280×800: branch hero 0–800 (h 800), pane 589–1280, footer rows inside the pane (758–1110, y 459–569), docH 800 (no scroll). Main: hero 785, full-width footer 785–849 under both columns, docH 849. Hero width/left identical (589 / 0). +15 px = hero now fills the viewport because the footer left the bottom strip.

**p2 (after script fixes) all PASS except AC21-sheet**: AC7, AC8 (selected at 28 ms, advance at 280 ms; double tap / dblclick → one step), AC9, AC10, AC11, AC12, AC13 (24 cases, draft byte-identical, focus on Planera pass), AC13-forget, AC14, TOMT-reload, AC15 (bank build), AC19.
- **MAJOR — AC21-sheet FAIL, landscape 844×390**: sheet 460 px high (top 16, bottom 476) in a `position: fixed` backdrop with `overflow: visible`, body `overflow: hidden` → the sheet cannot scroll; only the chip list scrolls inside (`.home-wizard-options` 260/203). Step 1: **Avbryt at y 416–460, fully off screen**; «Tomt pass»/«Starta från mall» 356–400 (cut 10 px). Nivå step: Tillbaka + Avbryt at 384–428 (6 px visible). Mall list: 357–401. Escape does not close the sheet. Way out: tap outside (top strip / sides) closes it. Main's wizard at 844×390: 403 px sheet, Avbryt/Nästa bottom 387 → reachable. 320×640, 390×844, 1280×800: all fine.
- Script fixes (not app): marker helper (Gymmix halls have no `.hall-plan--floor` → canvas rect, as s45), length text («53 /» + segmented 90), AC15 needs the bank build for «Föreningens mallar».
- Blank Tomt pass: not written until a station is added (`shouldAutosave`: stored id or more items). A typed title / note alone is not written and is gone after reload — **identical on main** (pre-existing, not a regression; MINOR note).

Smoke loop (19:41, at slice-40): runner rc=0 everywhere, but pass counts: **slice-46-builder-smoke 33/33** (Builder's claim confirmed), 45-builder 3/20, 44-builder 1/10, 44-verify 1/12, 43-builder 1/9, 43-verify 1/6+, 42-verify 2/6, 42-builder 1/11, 41-reverify-b 61/89, 41-builder 32/34 — mass failures expected (start page Tomt pass/Från mall and wizard «Nästa» removed); classification in chunk 2.

Next (chunk 2): p3 (AC16 mina/club, AC17, AC18 + main ref, AC20, AC22), AC23/AC24 greps, smoke classification.

## Chunk 2 end / final — 20:08 CEST
p3 all PASS after script fixes (AC16-mina, AC16-club, AC17, AC18 + fresh + main ref, AC20, AC22). AC23/AC24 static PASS. Smokes classified (no real regression). Adapted slice-39-verify section A 11/12 (1 adaptation artefact).
Final: 30/31 scripted checks; 1 MAJOR (AC21 landscape sheet, Avbryt unreachable). Report `slice-46-verify-report.md`.
