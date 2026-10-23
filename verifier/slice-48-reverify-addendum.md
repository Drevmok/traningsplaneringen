# Slice 48 re-verify addendum: PR #53 @ 29df282

- Target: `slice-48-code` @ **29df282**, which is fix **7dc8e8f** plus a merge of the Verifier commits up to 2a294f4.
- Compared with main e605b3f. Criteria: `slice-48-docs` @ 29ef308. This adds to `slice-48-verify-report.md` (f523774).
- Verifier, 2026-10-23, 08:33–09:35 CEST. Run on a fresh isolated stand-in (ports 57870–57875) with four previews: branch/main, each in a plain build and a bank build. The bank builds use https://bank-mock.supabase.co, which is routed to the stand-in.
- **0 requests to the live project fhzqwbdlejzohetdoluw.**

## Verdict
**PASS. Ready to merge from the Verifier's side.**
- Both Major findings from the first run are fixed.
- The docs say LÅST. The A–F labels are correct.
- Q3 behaves as the PO decided.
- No regressions. No SERIOUS issue.

Still open, and not blocking from my side:
- **AC26–27 PENDING-real.** They need a real iPhone.
- **Bundle confirmation.** It comes from the PO and is not confirmed by Christoffer himself (see Bundle).

## Fix checks (script `slice-48-reverify.mjs`, part p5)
| Check | Result | Evidence |
|---|---|---|
| 320×568 «Stationer i ordning» | **PASS** | Names wrap by word (1–2 lines, 182 px wide, e.g. «Trampett volt upp på / mattberg»). ↑ ↓ «Ta bort» sit on their own second line. Row 29–291 px with doc width 320, so nothing overflows. Every button is ≥44×44. «Ta bort» (198–291 px) hit-tests and works (3→2 rows, then «Borttagen · Ångra»). Screenshot: `s48r_16_edit_320x568.png` |
| 320×640 (same list) | **PASS** | Same geometry. The old W320 check also passes now (it failed before with «Ta bort» at 237–331) |
| touch-action on `.hall-board` | **PASS** | Computed `pan-x pan-y`. The tray bar's `auto` is now limited by the board |
| Pinch on the tray, SIMULATED | **PASS** | visualViewport.scale stays 1 (y 687, target `.hall-tray-compact-bar`). Screenshot: `s48r_22_tray_pinch_390.png` |
| Pinch below the tray (inside `.hall-board`), SIMULATED | **PASS** | Scale stays 1 (y 734) |
| Control: the same pinch on **main** | zooms to 3.07× | Shows the simulation can tell fixed from unfixed |
| AC26 hall pinch, SIMULATED | **PASS** | Zoom 1.25→2.00 (capped)→1.50→2.00. Page scale stays 1 |
| AC26 / AC27 on a real device | **PENDING-real** | Headless cannot prove iOS Safari behaviour |
| Q3: own drill in the hall library | **PASS** | A seeded own Teknik drill appears in «Lägg till station» → «Lägg till övning» without Ändra/Ta bort (0 `.own-card-actions`). The Passbyggaren library still shows «Ändra», «Ta bort» (control) |

## Docs
- **LÅST: PASS.** The Slice 48 pack (README, HANDOFF, checklist, microcopy) says **LÅST 2026-10-22**. The four docs lines this slice adds say «LÅST 2026-10-22» (docs/README row, hall-oversikt-copy, hall-phone-chrome, ui-chrome:409). No PROPOSED or FÖRESLAGEN remains for Slice 48.
- **A–F in SLICE48-SHIPPED.md: PASS.** A1–F1 now match the `decisions.md` table: A row, B list, C Pointer Events, D Teknik order, E add/remove, F pinch/touch-action.
- Minor, not blocking:
  - SHIPPED still says "I did not update the living docs …", but the PR edits 4 docs. The Verifier feature maps were updated by the Verifier (HANDOFF §12), so "Verifier feature maps not updated" is now outdated too.
  - Older slices (44–47) still have FÖRESLAGEN/PROPOSED lines in `docs/` (e.g. admin.sv.md, planera-pass.sv.md, README rows 19–20). They are outside Slice 48, so I'm only noting them.

## Q2 / Q3
The PO has confirmed Q2 and Q3 as PO decisions, according to the re-verify request. Behaviour verified:
- Q2: the hall library filter is locked to Teknik with the select disabled.
- Q3: as above.

## Bundle (AC35)
- Plain builds, gzip -9, against main: index JS 130 422 → **132 416 B (+1 994)**, CSS 13 881 → **14 223 B (+342)**. **Total ≈ +2.34 kB.** That is +16 B compared with f523774, from the fix's CSS.
- Vite reports 132.35 → 134.39 kB.
- That is about 4.6× the ~512 B guideline and above the ~+1.3 kB in decisions.md (C1).
- **PO-relayed and unconfirmed:** the PO says Christoffer chose «Lägg upp PR:en som den är» at ~+2.3–2.4 kB in the PO chat. Christoffer has not confirmed this himself here, and by PROJECT.md's rule an agent saying so is not an approval. The measured +2.34 kB sits inside the range the PO relays. Recorded, not blocking.

## Regression
- **Formal script p1–p5 (390×844, 320×640/568, 844×390, 1280×800): 61/61 PASS** (`slice-48-reverify-results.json`, `slice-48-reverify-checks/run-all.txt`). It covers:
  - AC1–25 and AC28–36.
  - Old Blå/Vit passes made on main: load, edit, reload, Golvklart and print, with all placements kept.
  - A pass with an unknown hall.
  - 844×390 reach and sheets.
  - The desktop mouse drag.
  - No page errors.
- `bun test src` **256/0** · tsc clean · lint **0 errors / 6 warnings** (= main) · build ok.
- Builder's claimed smoke 80/80 is **confirmed** (`slice-48-builder-smoke` 80/0).
- **Smoke loop, compared with the Slice 47 baseline** (`slice-48-reverify-checks/loop-classify.txt`):
  - New FAIL ids are **identical to the first verify run** and all come from intended Slice 48 changes:
    - s40 AC14 / s40-reverify AC11, AC14-controls, AC14-drag: «Ändra stationer» and the Pointer Events drag.
    - s46 AC7-10 and s47 AC3/AC7: Hallöversikt is out of «Mer».
    - s47 AC26-footer: the footer now reads Slice 48.
  - s34–s45 otherwise unchanged.
  - The first s45 run errored on AC17 because my fresh smoke tree had no `app/dist` (a harness gap). The rerun is in the loop-classify file.
  - The first verify run's report has the details.

## Network
Smoke-loop netlogs (`slice-48-reverify-checks/netlog-count.txt`): 6,192 requests in total, **0 to fhzqwbdlejzohetdoluw**, 0 BLOCKED. By host: 127.0.0.1:57880 3,422; :57881 1,520; bank-mock.supabase.co (the local stand-in) 823; :57882 367; :57883 54; 6 non-http. The in-script live check in slice-48-reverify.mjs also returned 0.

## Artifacts
- Commits fad4a65 and f19fbfe (checkpoints) plus the final addendum commit, all on `slice-48-code`. Nothing merged.
- Screenshots `slice-48-screenshots/s48r_*.png`. The key ones are copied to /workspace/screenshots/:
  - `s48r_16_edit_320x568.png` (the 320 list)
  - `s48r_22_tray_pinch_390.png` (after the tray pinch, scale 1)


## Smoke-loop addendum (finished 09:29–09:42 CEST)
- The full loop ran (s32–s48); output is in `slice-48-reverify-checks/loop-classify.txt`.
- s45 was rerun with `app/dist` present: 3/17, the same as the s47 baseline, with no new FAIL. The AC17 harness gap is closed.
- s32: same as the baseline.
- **s33: new FAIL AC16d and AC11d.** Both runs failed the same way. GoTrue returned `otp_expired` on /verify for the resent code. AC11d follows from AC16d.
  - In the first verify run (earlier HEAD, same auth code) these checks passed 94/14.
  - The PR diff vs main does not touch auth, admin or login code. The changed files are App.css, Hall*, LibraryPanel, PassPrint, SessionBuilder, SharePass, blockMeta, export.css, hall/session/pointerDrag.
  - Assessment: a stand-in OTP/mail timing artefact on the fresh stand-in, **not attributed to PR #53**. Not proven, so it is flagged for awareness.
