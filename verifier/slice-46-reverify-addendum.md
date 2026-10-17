# Slice 46 — re-verify addendum (eecf677)

PR #50 · `slice-46-code` @ **eecf677**, compared with main **bc8cce0** and with fe5e51e (the first verify, report d9b2eda).
History: `fe5e51e → deabaa7 → d9b2eda → eecf677`. d9b2eda is an ancestor and eecf677 is the single commit on top of it (`git merge-base --is-ancestor` ✔).
The follow-up changes four files: `export.css` (+7: `.home-wizard-sheet { max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px); overflow-y: auto }`), `Home.tsx` (start-page rows `div` → `footer`), `verifier/slice-46-builder-smoke.mjs` (new) and `app/SLICE46-SHIPPED.md`.
Setup: fresh worktrees, my own stand-in (`/workspace/s46r/sb`, ports 5783x) and five previews: branch plain/bank, main plain/bank, and fe5e51e plain. **0 live requests.** The live project was never touched.

## Verdict
**PASS: M1, m2 and m4 are fixed and nothing regressed.** The full verify script is **31/31**, Avbryt storage byte-identity holds (24/24), and Builder's smoke is **37/37**. AC21 now passes.
Two new MINOR usability points remain in the 844×390 sheet (n1, n2 below). Neither blocks an AC.

## M1: sheet at 844×390 (`slice-46-reverify-m1.mjs`, `slice-46-reverify-checks/m1-results.json`)
- **45/45 cases PASS.** I covered 9 steps (Ålder, Nivå, Fokus, Hall, Passlängd, Tomt pass Hall/Passlängd, Mall Hall/list) × 5 viewports (844×390, 390×844, 320×568, 320×844, 1280×800). In every case:
  - the sheet is inside the viewport;
  - Tillbaka (steps 2+) and Avbryt can be scrolled into view and hit-test to themselves (`elementFromPoint`);
  - Avbryt closes the sheet, and localStorage stays byte-identical.
- At 844×390 the sheet is capped at 358 px (top 16, bottom 374) and scrolls inside. Before the fix it was 460 px with no scroll.

  | Step | Scroll (content / visible px) | Avbryt after scroll |
  |---|---|---|
  | Ålder | 460/358 | 330–374 |
  | Nivå | 428/358 | 330–374 |
  | Fokus | 391/358 | 330–374 |
  | Mall list | 401/358 | 330–374 |
  | Hall, Passlängd | fit (no scroll) | — |

  Screenshots `s46r_m1_land_*_top/_scrolled`.
- AC21-sheet in the verify script: PASS. Landscape Nivå: Avbryt is at 314–358 after scrolling.
- **Unchanged vs fe5e51e:**

  | Viewport | Result |
  |---|---|
  | 390×844, 320×844, 1280×800 | Sheet, chips, links and Tillbaka/Avbryt geometry identical on 6 steps |
  | 320×568, Ålder only | The cap applies (sheet 536 px, top 32, vs 523 px at top 45 on fe5e51e). That's an improvement: on fe5e51e Avbryt ended at 573 > 568, cut off; now it's at 515–559 |
  | 320×568, other steps | Identical |

- **No jumpy chip list.** I watched every animation frame while tapping a chip at 844×390, 390 and 320×568:
  - chips and the sheet don't move before the step changes;
  - the next step appears in one layout with no bounce (one distinct state).
- **n1 MINOR: double scroll in landscape.** On Ålder, Nivå, Fokus and the mall list, the sheet now scrolls *and* the inner list still has its own scroller (`.home-wizard-options` 260/203 on Ålder and 476/203 on Nivå; `.home-wizard-malls` 258/215). Even with the sheet scrolled to the bottom, «13–18 år» is clipped and «Nivå» needs a second, inner scroll (`s46r_m1_land_Ålder_scrolled`). On Fokus the inner scroll is only 3 px (206/203). Everything is reachable, but nested scrolling on touch is fiddly. A possible fix: `@media (max-height: 500px) { .home-wizard-options, .home-wizard-malls { max-height: none; overflow: visible } }`, so only the sheet scrolls.
- **n2 MINOR: scroll position carries over to the next step.** In landscape, if the coach has scrolled the sheet down (e.g. to reach Tomt pass or Avbryt) and then taps a chip, the next step opens at scrollTop 33, the maximum it can scroll. The progress line «Fråga 2 av 4» sits at y 3 above the sheet's top edge (16) and is clipped. Focus and the heading «Fokus» are visible. Resetting `scrollTop = 0` on step change would fix it. Screenshot `s46r_21_land_fokus_after_scrolled_advance`.

## m2: footer landmark and desktop layout
- Exactly **one `<footer>`** (one contentinfo) on the start page at 390, 320×568, 844×390 and 1280×800, and the start-page rows are that `<footer>`. fe5e51e had 0; main has 1. Passbyggaren and Hallöversikt also have 1 each.
- Start-page geometry is **identical to fe5e51e** at all four viewports (hero, pane, footer, Planera pass, doc height). Desktop: hero 0/0/589×**800**, footer in the right column (x 758–1110), docH 800. Main is 785 / 849. Phone docH 844 (main 852 for this check, 898 with the admin row in AC3).

## m4: Builder's smoke
- `verifier/slice-46-builder-smoke.mjs` is now in the PR. I ran it against my bank build (`S46_BR` :57840, `S46_MAIN` :57843, `S46_ROOT` a scratch dir): **37/37 PASS** ✔ (`slice-46-reverify-checks/builder-smoke.txt`).
- Left open (MINOR): its fixture `/tmp/s46fix.json` (`S46_FIX`, the club/saved/placement data) is **still not in the repo**, so the script can't be run from the PR alone. I used my earlier copy, byte-identical to Builder's `/tmp/s46fix.json`.

## Full verify script (`slice-46-reverify.mjs` = `slice-46-verify.mjs` with s46r_ outputs)
**31/31 PASS**, 0 page errors, 0 live requests (`slice-46-reverify-results.json`, `slice-46-reverify-checks/reverify-run.txt`).
- AC13: 24 cases (every step × Avbryt + outside taps, with and without a draft) leave localStorage **byte-identical**, with focus on Planera pass.
- AC21-sheet now passes.
- AC18 replacement semantics are unchanged from the first report.
- AC5-local still passes on my stand-in; AC5 against the live project is still **PENDING-real**.

## Bundle (gzip -9, `slice-46-reverify-checks/bundle.txt`)
| | main bc8cce0 | fe5e51e | eecf677 | Δ vs main | Δ vs fe5e51e |
|---|---|---|---|---|---|
| JS | 198,164 | 198,570 | 198,587 | **+423** | +17 |
| CSS | 13,981 | 14,115 | 14,131 | **+150** | +16 |
| Total | 212,145 | 212,685 | 212,718 | **+573** | +33 |
| Eager | 148,244 | 148,795 | 148,817 | +573 | +22 |

Builder's +573 B is **exact**. AC24 («≤ +1 kB gz JS soft»): PASS. Against the ~512 B guideline the total is **61 B over** (JS alone, +423, is within). Christoffer's acceptance is **still unconfirmed**; nothing records it in the pack or PR.

## Tests, tsc, lint, build, secrets
| | Result |
|---|---|
| `bun test src` | **245/0** |
| `bun test tools/bank` | **26/0** (my stand-in; temporary `/tmp/s32` symlink, removed) |
| `tsc -b` | rc 0 |
| lint | 0 errors / 6 warnings (= main) |
| `npm run build` | green |
| Secret grep | no keys or tokens in the branch diff vs main or in my files |

## Remaining findings
- n1 MINOR: double scroll in the landscape sheet (inner chip/mall list inside the scrolling sheet).
- n2 MINOR: the landscape sheet keeps its scroll position on step change, so the progress line is clipped.
- m3 MINOR: bundle +573 B, 61 B over the guideline; acceptance unconfirmed.
- m4-rest MINOR: the smoke fixture `/tmp/s46fix.json` is not committed.
- m1 (pre-existing, same as main): on a blank Tomt pass, a title or note typed before the first station isn't saved.
- PENDING-real: AC5 live admin, and real Föreningens mallar rows.

## Artefacts
Scripts `verifier/slice-46-reverify.mjs` and `verifier/slice-46-reverify-m1.mjs`. Results `verifier/slice-46-reverify-results.json` and `verifier/slice-46-reverify-checks/` (run logs, m1-results.json, builder-smoke.txt, bundle, tests, tsc, lint, build). Screenshots `verifier/slice-46-screenshots-r/s46r_*.png`.
Best two, in `/workspace/screenshots/`:
- `s46r_m1_land_Alder_scrolled.png`: the fix, with Avbryt reachable in landscape; it also shows the inner list (n1).
- `s46r_21_land_fokus_after_scrolled_advance.png`: n2.
