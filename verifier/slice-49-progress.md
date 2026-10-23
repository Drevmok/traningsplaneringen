# Slice 49 verify — progress (Verifier)

PR #54, slice-49-code. Code under test 43cfae4; branch tip 42f0f8d = 43cfae4 + Planner docs only (README/HANDOFF/checklist/SHIPPED/backlog, no app/src). Base main c86175a.

## Chunk 1 (19:50) — summary
**What changes:** Planera pass (Frågor-vägen) fills the chosen length (A1 table 60/90/120, largest-remainder split), saves the suggested redskap right away (C1), Hallöversikt gets a single «Använd alla förslag» (hidden when nothing to save; the saknar row is text only, D1), «Föreningens mallar» shows only with ≥1 template (E1), footer Slice 49. No SQL, no new texts.
**ACs:** 18 (AC1–18). AC13–15 need the club backend → local stand-in.
**Main risks:**
1. A1 sum ≠ length for some age/focus/level/hall (Teknik set size, block with 0 items), or a minute < 1.
2. C1 side effects: redskap saved on non-Teknik/unplaced stations, saknar row still showing, Golvklart/Förrådslista/Kör passet blast radius; mall/Tomt pass must NOT auto-fill.
3. D1: Förrådslista pointer (AC11) with the button now conditionally rendered (null ref), focus loss after the button disappears.
4. E1: club section hidden while loading / admin empty text (AC15) must stay; s36/s37 club smokes.

Env: box had lost Postgres 17 and Playwright browsers; Postgres 17 reinstalled (stand-in only).

## Chunk 2 (20:20)
- 42f0f8d vs 43cfae4: `git diff --stat` = app/SLICE49-SHIPPED.md, backlog/IMPROVEMENTS.md, slice-49/HANDOFF.md, slice-49/verification-checklist.md — docs only, no app/src. Report goes against 42f0f8d.
- bun test src: 263/0 (main 256/0). tsc -b 0, oxlint 0 errors (warnings same as main).
- Own exhaustive A1 check (4 ages × 4 focus × 6 levels × 3 lengths × 2 halls = 576 compose calls): total = length, all minutes whole ≥1, 0 bad. C1: 3 Teknik placed with saved redskap, no other block gets redskap (temp test, deleted).
- Bundle gzip -9 total vs main: plain +21 B, bank +14 B (≤512 ✓).
- Stand-in up (/workspace/s49v/sb, 36-03 8×t). Builder smoke 34/34 on wt-plain.

## Chunk 3 (20:10–20:35 CEST)
- Own verify `verifier/slice-49-verify.mjs`: **26/26** (plain + bank stand-in, AC1–AC16, C1 negative, Tomt pass, 320/390/844×390/1280, AC12b/13/14/15 on stand-in). Script selector bugs fixed (mall-sheet is `.mall-sheet`, wizard Tomt pass asks hall + length, footer only in builder).
- Info: after «Använd alla förslag» the focus lands on BODY (button unmounts) — minor a11y.
- Bank tests: offline 21 pass (+5 stand-in tests need /tmp/s32/bot-keys.txt); with stand-in 25/1 = same as Slice 48 baseline (`inserts pending rows… second run` = re-run state).
- Feature maps: Builder's 6 edits match HANDOFF §9 one-to-one.
- Smoke loop running (sequential).
