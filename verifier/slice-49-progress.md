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
