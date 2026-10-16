# Slice 43 — Verifier report («Hallöversikt above the fold», PR #47)

**Commit verified:** `e7de022` (slice-43-code). Checklist: `slice-43/` @ `d6548c1`. Main: `db11398`.

**Setup**
- Own worktrees `/tmp/s43v/{wt,main}`.
- Own local stand-in. The box had been reset, so I reinstalled postgresql-17, PostgREST v12.2.3, GoTrue v2.177.0 and playwright-core.
- Headless Chrome 390×844, DPR 2, touch; also 320×844, 844×390 and 1280×800.
- 0 requests to the live project.

**Files:** script `verifier/slice-43-verify.mjs`, results `slice-43-verify-results.json`, raw output `slice-43-checks/` (hall-bottoms.json, viewports.json, print.json + PDFs, smokes/), screenshots `slice-43-screenshots/s43v_*`.

**Result: 25 PASS / 3 FAIL**, 0 page errors.
- The 3 FAILs are my extra stress checks: Vit with a 3-line title and with a very long title, and the banner at 320 px.
- Every AC, graded against its exact text, passes.

## Per-AC table
| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS | Blå 340–604 with banner, **135 px to spare** |
| AC2 | PASS | Vit 340–714 with banner, **25 px to spare**. This is the checklist pass (Nybörjare, its title) |
| AC3 | PASS | Standard / Tävling / Liten 340–579, height 239 (= 358×2/3) |
| AC4 | PASS | Vit at scrollY 0: none of 81 sample points on the canvas is covered by the tray, toast or banner |
| AC5 | PASS | Everything required sits above the hall: back, «Hallöversikt», meta, 4 actions, layout select and zoom −/+. All are ≥ 44×44 (zoom 48×44) |
| AC6 | PASS at 390 | «3 stationer saknar redskap» is one line, not ellipsized, and `title` holds the same text. The CTA points at «Använd alla förslag» (focus + highlight). **At 320 the text is ellipsized** (Finding 2) |
| AC7 | PASS | Migrate note, Blå/Vit tip, Visa tips and the flow tip are in `.hall-below` under the hall, with text identical to main. Dismissing the flow tip works and survives reload |
| AC8 | PASS | All 5 halls, hints panel open, and Golvklart: the set of visible controls and the set of text nodes are identical to main. Locked terms are intact |
| AC9 | PASS | Banner removed via «Använd alla förslag»: the hall moves up 52 px (340→288) with no gap. Vit 662 (77 spare), others ≤ 552 |
| AC10 | PASS | Tray height 58 → 215 → 58 when expanded and collapsed; canvas unchanged |
| AC11 | PASS | Golvklart, every hall ≤ 739 (Vit 293–667). Floor header and controls identical to main. **Note:** with B1 the generic halls in Golvklart are now 239 tall (main 422, ending at 715) |
| AC12 | PASS (pinch feel PENDING-real) | See the AC12 section below |
| AC13 | PASS | Landscape: hall top 313 (main 507), same hall size, page scrolls, no horizontal scroll or clipping |
| AC14 | PASS | Desktop: same hall size and the same set of controls as main; hall starts at 313 (main 507); no horizontal scroll or clipping |
| AC15 | PASS | See the AC15 section below |
| AC16 | PASS | +189 B gz. build, test, lint and tsc green. Footer «Träningsplaneraren · Slice 43» |

## Hall bottoms at 390×844 (fold 739, scrollY 0, tray collapsed)
- **kort** = Nybörjare default title.
- **2rad** = a 57-character title that wraps to 2 lines.
- **3rad** = 82 characters, 3 lines.
- **lång** = 125 characters.
- **visas** = saknar banner shown; **dold** = banner hidden after «Använd alla förslag».

| Hall | Title | Banner | Branch top–bottom (h) | Margin to 739 | Main bottom |
|---|---|---|---|---|---|
| Blå hall | kort (2 meta lines) | visas | 340–604 (264) | **135** | 1029 |
| Blå hall | kort (2 meta lines) | dold | 288–552 (264) | **187** | 924 |
| Blå hall | 2rad (3 meta lines) | visas | 362–626 (264) | **113** | 1081 |
| Blå hall | 2rad (3 meta lines) | dold | 310–574 (264) | **165** | 976 |
| Blå hall | 3rad (4 meta lines) | visas | 384–648 (264) | **91** | 1081 |
| Blå hall | 3rad (4 meta lines) | dold | 332–596 (264) | **143** | 976 |
| Blå hall | lång (6 meta lines) | visas | 428–692 (264) | **47** | 1103 |
| Blå hall | lång (6 meta lines) | dold | 376–640 (264) | **99** | 998 |
| Vit hall | kort (2 meta lines) | visas | 340–714 (374) | **25** | 1139 |
| Vit hall | kort (2 meta lines) | dold | 288–662 (374) | **77** | 1033 |
| Vit hall | 2rad (3 meta lines) | visas | 362–736 (374) | **3** | 1191 |
| Vit hall | 2rad (3 meta lines) | dold | 310–684 (374) | **55** | 1085 |
| Vit hall | 3rad (4 meta lines) | visas | 384–758 (374) | **-19** ❌ | 1191 |
| Vit hall | 3rad (4 meta lines) | dold | 332–706 (374) | **33** | 1085 |
| Vit hall | lång (6 meta lines) | visas | 428–802 (374) | **-63** ❌ | 1213 |
| Vit hall | lång (6 meta lines) | dold | 376–750 (374) | **-11** ❌ | 1107 |
| Standard trupp | kort (2 meta lines) | visas | 340–579 (239) | **160** | 1187 |
| Standard trupp | kort (2 meta lines) | dold | 288–527 (239) | **212** | 1082 |
| Standard trupp | 2rad (3 meta lines) | visas | 362–601 (239) | **138** | 1239 |
| Standard trupp | 2rad (3 meta lines) | dold | 310–549 (239) | **190** | 1134 |
| Standard trupp | 3rad (4 meta lines) | visas | 384–623 (239) | **116** | 1239 |
| Standard trupp | 3rad (4 meta lines) | dold | 332–571 (239) | **168** | 1134 |
| Standard trupp | lång (6 meta lines) | visas | 428–667 (239) | **72** | 1261 |
| Standard trupp | lång (6 meta lines) | dold | 376–615 (239) | **124** | 1156 |
| Tävling / linjer | kort (2 meta lines) | visas | 340–579 (239) | **160** | 1187 |
| Tävling / linjer | kort (2 meta lines) | dold | 288–527 (239) | **212** | 1082 |
| Tävling / linjer | 2rad (3 meta lines) | visas | 362–601 (239) | **138** | 1239 |
| Tävling / linjer | 2rad (3 meta lines) | dold | 310–549 (239) | **190** | 1134 |
| Tävling / linjer | 3rad (4 meta lines) | visas | 384–623 (239) | **116** | 1239 |
| Tävling / linjer | 3rad (4 meta lines) | dold | 332–571 (239) | **168** | 1134 |
| Tävling / linjer | lång (6 meta lines) | visas | 428–667 (239) | **72** | 1261 |
| Tävling / linjer | lång (6 meta lines) | dold | 376–615 (239) | **124** | 1156 |
| Liten hall | kort (2 meta lines) | visas | 340–579 (239) | **160** | 1187 |
| Liten hall | kort (2 meta lines) | dold | 288–527 (239) | **212** | 1082 |
| Liten hall | 2rad (3 meta lines) | visas | 362–601 (239) | **138** | 1239 |
| Liten hall | 2rad (3 meta lines) | dold | 310–549 (239) | **190** | 1134 |
| Liten hall | 3rad (4 meta lines) | visas | 384–623 (239) | **116** | 1239 |
| Liten hall | 3rad (4 meta lines) | dold | 332–571 (239) | **168** | 1134 |
| Liten hall | lång (6 meta lines) | visas | 428–667 (239) | **72** | 1261 |
| Liten hall | lång (6 meta lines) | dold | 376–615 (239) | **124** | 1156 |
**Summary**
- Every hall fits for titles of up to 2 lines.
- **Vit fails at a 3-line title:** 758 with the banner, 19 px over (fits without the banner, 33 spare).
- **Vit also fails at a very long title:** 802 with the banner and 750 without (63 and 11 px over).
- All other halls fit in every case, including the very long title (Blå: 47 px to spare).
- Each extra title line costs about 22 px. Vit's 25 px margin therefore covers exactly one extra line.
- The title field has no maxlength.

## AC12 detail (every template; zoom carried over between templates)
| Hall | zoom − / + (canvas width) | pan when zoomed | pinch in → out (CDP 2-finger) | tap | drag (app DnD events) | remove |
|---|---|---|---|---|---|---|
| Blå | 358→448→358 | ✓ scrollLeft 80 | 358→537→430 | opens station detail | stored placement moved | 3→2 |
| Vit | 430→519→430 | ✓ | 430→644→516 | detail | moved | 2→1 |
| Standard | 516→605→516 | ✓ | 516→716→573 | detail | moved | 1→0 |
| Tävling | 573→662→573 | ✓ | 573→716→573 | detail | moved | 3→2 |
| Liten | 573→662→573 | ✓ | 573→716→573 | detail | moved | 2→1 |

- The simulated pinch zooms in and back out. How it feels on a real device is PENDING-real.
- Escape does not close the station detail; the same is true on main.

## AC15 print
- Tested with `emulateMedia({ media: 'print' })` at 390 and 1280, on all 5 templates.
- Canvas ratios are identical to main: Blå 1.356, Vit 0.958, generic 1.6 (16:10).
- The same chrome is hidden as on main (the `.hall-below` div is `no-print`).
- A4 PDF: same page count as main (1).
- Page 1 rendered at 50 dpi: **0 differing pixels** vs main for every template.

## Other viewports (2-line title at 320)
| Viewport | Branch (Blå / Vit / generic) | Main | Horizontal scroll / clipping |
|---|---|---|---|
| 320×844 | 384–596 / 384–685 / 384–576 (Vit margin 54) | 836–1048 / 836–1137 / 836–1258 | none |
| 844×390 | top 313 (same size) | top 507 | none, page scrolls |
| 1280×800 | 313–907 / 313–1154 / 313–817 | 507–1102 / 507–1349 / 507–1011 | none, same controls |

## Bundle (gzip -9)
| | main db11398 | e7de022 | Δ |
|---|---|---|---|
| JS | 204 796 | 204 838 | +42 |
| CSS | 14 215 | 14 362 | +147 |
| **Total** | 219 011 | 219 200 | **+189** |
| Eager | 155 125 | 155 317 | +192 |

Matches Builder's figure and is under the +512 B soft cap.

## Smokes (same stand-in; compared with the Slice 42 run)
**Unchanged:** 32, 34 builder, 35, 36, 38 builder, 39 builder, 40 builder, 41 builder, 41 re-verify-b.

**Slice 43 builder smoke:** 19/19.

**slice-42-verify:** 59/2. The two failures are the known S39-unsaved observation and the footer label.

New failures, all expected or explained:

| Smoke | New failure | Explanation |
|---|---|---|
| 34 verify | Same-controls-hall | C1 changed the DOM order; it replaces 2 failures that are now gone |
| 40 re-verify | AC14-controls | 22/22 buttons and 755/755 text match; only the order differs (C1) |
| 42 builder | AC18-footer | Footer label |
| 39 verify | F3 «Placera här» | Playwright's auto-scroll artifact, not a regression (repro below) |
| 37 verify | M8-E | Main-side reload step; 2 other failures are now gone |
| 33 | AC11d / AC16d | Login-state flakes on a reused stand-in (as in Slice 42); no auth code touched |

**39 verify F3 repro** (`slice-43-checks/placera-repro.mjs`):
- When the smoke clicks a chip in the expanded tray, Playwright scrolls the page so the hall goes off-screen, and the canvas tap misses.
- At scrollY 0, with events dispatched without that scroll, «Placera här» works on the branch (2→3).
- On main it misses, because the hall there starts below the fold.

## Tests
- `bun test src`: 220 pass / 0 fail.
- `tools/bank`: 21 pass / 5 skip (stand-in path hardcoded to /tmp/s32).
- lint: 0 errors / 15 warnings.
- tsc: 0.
- build: OK.
- Secret grep (git tree at e7de022, both dists, committed outputs): clean. The only hit is the bare `sb_secret_` prefix literal in the supabase-js library.

## Findings
1. **Vit overflows the fold with titles of 3 or more lines.**
   - 3-line title + banner: 758 (19 px over).
   - Very long title: 802 with the banner, 750 without.
   - The meta block has no line clamp and the title has no maxlength, so Vit's 25 px margin covers exactly one extra line.
   - Medium. Not an AC failure (the AC pass uses the Nybörjare title), but a real coach title can reach 3 lines.
   - Possible fix: clamp the meta title to 2 lines on portrait phones. That is CSS only and needs no new string.
2. **Saknar banner at 320 px is ellipsized:** «3 stationer saknar redskap» is cut. The full text is still in `title`. AC6 asks for 390, where it passes. Minor.
3. **B1 also flattens the generic halls in Golvklart** (422 → 239). Golvklart was out of scope, but it changed; the chrome itself is identical. FYI for Planner.
4. **Old smokes:** several need updating for C1's DOM order, the footer label and the 39-F3 scroll artifact.
5. **PENDING-real:** pinch feel and the installed PWA fold (README open item 2).

## Verdict
**PASS: all 16 ACs pass, ready to merge.**
- Recommend a follow-up for Finding 1 (Vit with a 3-line title).
- Findings 2 and 3 are FYI.
