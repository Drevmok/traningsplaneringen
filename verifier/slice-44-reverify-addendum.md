# Slice 44 re-verify addendum: F1 + F2 fixes @ 9fc5fd9

**PR #48** · `slice-44-code` @ **9fc5fd9** (Builder: «pass print numbers = hall ranks (F1); clean up print state on next interaction (F2)») · base main **0d88da5** · 2026-10-17 (Europe/Stockholm, UTC+2).

The fix diff from 800651e touches only `PassPrint.tsx`, `bodyPrint.ts` and their tests: 72 lines added, 9 removed.

**Verdict: PASS.** F1 and F2 are fixed. No regressions in any re-run check. Nothing SERIOUS.

**Setup.**
- Fresh worktrees `/workspace/s44r/wt` @ 9fc5fd9 and `/workspace/s44r/main` @ 0d88da5.
- `npm ci`, plain `vite build`, `vite preview` on :57751 (branch) and :57752 (main).
- No backend needed: every check here runs on plain builds, so no stand-in and no live project.
- Headless Chrome at 390×844, DPR 2, touch, with the same print stubs as the main verify. Real headed Chrome print preview on a private Xvfb :44.

## F1: printed station numbers vs hall markers. FIXED

Script: `slice-44-reverify/f1-numbers.mjs`, output in `f1-numbers.txt`. Path: Nybörjare + «Salto från höjd» gives 4 Teknik stations. Then Hallöversikt → «Ta bort från hall» on the **middle** station 2 (Handstående) → Dela → Skriv ut passet. Then tray chip → Placera här → tap the hall to place it back → print again.

| State | Hall markers | Print rows | Match |
|---|---|---|---|
| All 4 placed | 1 Ljushopp · 2 Handstående · 3 Falla · 4 Salto | 1. Ljushopp · 2. Handstående · 3. Falla · 4. Salto · Erfaren ledare | ✓ |
| Station 2 removed | 1 Ljushopp · 2 Falla · 3 Salto | 1. Ljushopp · **Handstående** (no number) · 2. Falla · 3. Salto | ✓ (the unplaced station takes no number) |
| Placed back | 1 Ljushopp · 2 Handstående · 3 Falla · 4 Salto | 1.–4. as at the start | ✓ |

- In every state the print copy of the hall map shows the same markers as the screen.
- The verify script's link case (`MARKERS-partial`, station 1 unplaced) now **PASSES**: print «1. Handstående», «2. Falla bakåt» = markers 1, 2. At 800651e it was «2./3.».
- AC15-base and AC15-exp (the 4th experienced station is «4. Rondat–flickis · Erfaren ledare») still pass.
- Evidence: `s44r_f1_middle_removed_hall_vs_print.png`, `s44r_f1_{a,b,c}_*`.

## F2: browser print after «Skriv ut passet» in Golvklart. FIXED

Script: `slice-44-reverify/f2-print-state.mjs`, output in `f2-print-state.json`. Branch and main, `webkit` and `chromium` stubs. Each step dispatches `beforeprint`, switches to print media, saves a PDF and reads it with pdftotext.

| Step (Golvklart) | Branch prints | Main prints |
|---|---|---|
| Before any print | the hall (1 p) | the hall (1 p) |
| «Skriv ut passet» | **the pass** (3 p, all blocks + stations) | the hall. Main tears down on afterprint; this is the WebKit bug Slice 44 fixes |
| … then a tap in the page, then a browser print | **the hall** (1 p) | the hall |
| «Skriv ut passet» again | the pass (3 p) | n/a |
| … then the **Ctrl+P** key, then print | **the hall** (1 p) | the hall |
| «Skriv ut passet» a third time | the pass (3 p) | n/a |
| … then «Avsluta golvklart» → Hallöversikt → print | **the hall** (1 p) | the hall |

- The results are identical for both stubs, `print()` is called 3/3 times, and there are no page errors.
- **Real Chrome** (`preview.mjs` runs `br-golvctrlp` / `main-golvctrlp`): Golvklart → Skriv ut passet → the real preview shows the pass → Cancel → real **Ctrl+P** (xdotool) → the preview shows **1 landscape page with the hall** («Nybörjare — ca 55 min · 53 min», hall map, no pass rows, no app UI). This is **identical to main**. Evidence: `s44r_preview_br-golvctrlp_bg.png` and `s44r_preview_main-golvctrlp_bg.png`.
- The verify script's old `BLAST-hall-ctrlp` check still reports FAIL, because its criterion also demanded the hall *right after* the pass print, with no interaction in between. That moment is armed **by design** (WebKit fires afterprint before it renders the print copy). Its «after a tap» half (`brEdit`) now shows the hall (cls "", root visible, PDF = hall). I count it as **resolved**.
- **Residual (Low, PENDING-real):** clean-up needs a touch or key **inside the page**.
  - If a coach prints the pass and then, without touching the page, uses Safari's share sheet → Skriv ut, or Chrome's ⋮ → Skriv ut, the pass prints again instead of the hall.
  - If print never fires at all (the `dead` stub, iOS PWA stall), the class stays even after a tap. Main behaves the same in that case (it prints the pass, 2 p).
  - These are edge cases, not regressions.

## Main print checks (re-run at 9fc5fd9)

- **AC14, real Chrome print preview:**

  | | Pages | App UI | Stations | Notes |
  |---|---|---|---|---|
  | Dela (branch) | 3 A4 portrait | none | yes | |
  | Golvklart (branch) | 3 A4 portrait | none | yes | |
  | Delat pass (branch) | 3 A4 portrait | none | yes | |
  | Blå / Vit (branch) | 4 | none | yes | |
  | Blå / Vit (main) | 3 | none | no | main never printed stations |

  - Cancel, then print again: the sheet still works, and afterwards the title can be edited and the page scrolls.
  - Headless AC14-content: 3 pages, 594.96×841.92 pt.
- **AC16:**
  - Print map ratio and size are identical to main: Blå 1.3562 (1280×944), Vit 0.9582 (1280×1336), Standard 1.6 (1280×800).
  - No station is split across pages (title and Redskap line on the same page) and no page ends on a heading, for all five halls.
- **AC17:** Dela, Golvklart and Delat pass print the same 3 pages and the same text (1308 chars).
- **AC18 / AC20 (simulated):** pass. The stall line appears after 1.56 s and is gone on close.

## Scripts
- **My `slice-44-verify.mjs` at 9fc5fd9: 38 / 39.** The only FAIL is `BLAST-hall-ctrlp`, explained above (resolved). Results in `slice-44-reverify/verify-results.json`, raw output in `verify-run.txt`.
  - I fixed two hard-coded preview ports in the script: the AC4/AC7 link regex, and the main→branch link rewrite for AC6/AC12. They now follow `BR`/`MAIN`.
  - Before that fix, AC4 and AC7 failed falsely on the new ports. The code was not at fault.
- **Builder smoke 44: 32 / 32.** Builder added F1/F2 checks, up from 26. It writes `slice44_*` into `/workspace/screenshots/` itself.

## Bundle (gzip -9)

| | main 0d88da5 | 800651e | **9fc5fd9** | Δ vs main |
|---|---:|---:|---:|---:|
| Total JS + CSS | 219,230 | 213,546 | **213,631** | −5,599 |
| Eager (index js + css) | 155,346 | 149,656 | **149,754** | −5,592 |

The fix costs +85 B total and +98 B eager over 800651e, all in the eager index chunk. CSS is unchanged.

## Tests, lint, tsc, build, secrets
- `bun test src`: **228 pass / 0 fail** (+2 new tests).
- `tsc -b`: rc 0.
- Lint: 0 errors, 6 warnings (unchanged).
- `npm run build`: OK.
- Secret grep: the 800651e→9fc5fd9 diff and both dists are clean. The only hit is the supabase-js library's own `sb_secret_` prefix check. Nothing references the live project.

## PENDING-real (unchanged, plus the F2 residual)
- AC19: the iPhone Safari print sheet.
- AC20: the installed iOS PWA; note the iOS version.
- iOS clipboard.
- Android Chrome.
- On iPhone: Golvklart → Skriv ut passet → back to the app → Safari share → Skriv ut. Does it print the pass or the hall?

## Files
`verifier/slice-44-reverify-addendum.md`, `verifier/slice-44-reverify/` (scripts, outputs, `pdf/`, `preview/`, `screens/s44r_*`), the updated `verifier/slice-44-verify.mjs` (ports only) and `verifier/slice-44-progress.md`.
