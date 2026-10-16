# Slice 43 — Re-verify addendum (627154d)

**Commit verified:** `627154d`, compared with `e7de022`; bundle compared with main `db11398`.

**The fix:** CSS only. On portrait phones, `.hall-header:not(.hall-header--floor) .hall-session-title` is clamped to 2 lines with `-webkit-line-clamp: 2` and `overflow-wrap: anywhere`.

**Setup:** own worktrees `/tmp/s43r/{wt,old,main}`, plain builds, headless Chrome 390×844 DPR 2 touch (plus 320, 844×390, 1280×800, print). No backend was needed, so no stand-in was started. 0 requests to the live project.

**Files:** script `verifier/slice-43-reverify.mjs`, results `slice-43-reverify-results.json`, raw output `slice-43-reverify/`, screenshots `slice-43-screenshots/s43r_*`.

**Result:**
- Re-verify script: 15 PASS / 1 FAIL. The FAIL (V-320-2rad) is an expected improvement, explained below.
- The full slice-43 verify script against e7de022: 27 / 1. The 1 is the known AC6 at 320 (Finding 2).
- Builder smoke: 22/22.

## Vit at 390×844 (fold 739)
| Title | Length | Banner | Hall top–bottom | Margin | Visible title lines | Clamped | e7de022 bottom |
|---|---|---|---|---|---|---|---|
| short (Nybörjare) | — | shown | 340–714 | **25** | 1 | no | 714 |
| short | — | hidden | 288–662 | 77 | 1 | no | 662 |
| 2 lines | 55 | shown | 362–736 | **3** | 2 | no | 736 |
| 2 lines | 55 | hidden | 310–684 | 55 | 2 | no | 684 |
| 3 lines | 80 | shown | 362–736 | **3** | 2 | yes | 758 |
| 3 lines | 80 | hidden | 310–684 | 55 | 2 | yes | 706 |
| very long | 176 | shown | 362–736 | **3** | 2 | yes | ~824 |
| very long | 176 | hidden | 310–684 | 55 | 2 | yes | ~772 |
| one unbroken word | 177 | shown | 362–736 | **3** | 2 | yes | — |
| one unbroken word | 177 | hidden | 310–684 | 55 | 2 | yes | — |

- Builder's 736 is confirmed.
- Every hall and every title stays ≤ 739, with or without the banner. The worst case is Vit at 3 px margin.
- No horizontal scroll anywhere.
- Short and 2-line titles are pixel-identical to e7de022 (all 5 halls, banner shown and hidden).
- Other halls with a clamped title and the banner: Blå 626 (113 spare); Standard trupp / Tävling / Liten 601 (138 spare).

## Full title kept
For each long title (55, 80, 176 and 177 characters):
- The «Passets titel» field value, the stored draft, the field after reload + Fortsätt passet, and the Hallöversikt DOM text all hold the full title.
- The clamp is visual only; the full text is still in the DOM, so screen readers read it all.

## Other screens vs e7de022
| Screen | Result |
|---|---|
| 320 px, 2-line title | **Changed, as intended:** at 320 this title wraps to 3 lines and is now clamped to 2, so the hall moves up 22 px (Vit 685 → 663). No horizontal scroll or clipping. |
| 320 px, 176 characters | Clamped to 2 lines. Vit 839 → **663**; others 730 → 554. Everything ≤ 739, no horizontal scroll or clipping. |
| Landscape 844×390 | Identical for both the 2-line and the 176-character titles; the clamp is portrait-only. |
| Desktop 1280×800 | Identical for both titles. |
| Golvklart | Identical with the 176-character title; the floor header has no clamp rule. |
| Print | The header title is hidden in print. The print title strip shows the **full** 176-character title + «· 53 min», same as e7de022. Hall ratios and PDF are unchanged (re-run of the slice-43 verify script: AC15 and AC15-pdf PASS vs e7de022). |

## Bundle (gzip -9, js + css)
| | main db11398 | e7de022 | 627154d | Δ vs main |
|---|---|---|---|---|
| Total | 219 011 | 219 200 | 219 230 | **+219** |
| CSS | 14 215 | 14 362 | 14 391 | +176 |
| JS | 204 796 | 204 838 | 204 839 | +43 |

Matches Builder's figure and is under the +512 B soft cap.

## Tests
- `bun test src`: 220 pass / 0 fail.
- lint: 0 errors / 15 warnings.
- tsc: 0.
- build: OK.
- Secret grep (git tree at 627154d, dist, committed outputs): clean. The only hit is the bare `sb_secret_` prefix literal in supabase-js.

## Findings
1. **Finding 1 (Vit past the fold with long titles) is fixed.** Vit reaches at most 736 for any title, a 3 px margin.
2. **Open, not caused by the fix:** «3 stationer saknar redskap» is still ellipsized at 320 px. AC6 asks for 390, where it passes.
3. **New, pre-existing (same on e7de022):** in **Golvklart** the pass title is not clamped. Vit in Golvklart:
   - short title: 667
   - 2–3 line title (55–80 characters): 718
   - 4-line title (100 characters): **740 (1 px over)**
   - 176-character title: **762 (23 px over)**

   AC11 uses the Nybörjare title, so it is not an AC failure. The same clamp on `.hall-header--floor .hall-session-title` would fix it. Minor.
4. **Clamp tightness:** Vit with the banner now has a fixed 3 px margin. Any other change that adds height above the hall on portrait phones would push it past the fold.

## Verdict
**PASS. Ready to merge** at 627154d. Finding 1 is fixed. Findings 2 and 3 are minor; Finding 3 can be a small follow-up.
