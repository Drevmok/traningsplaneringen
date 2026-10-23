# Slice 48 verify report: «Hallöversikt» (PR #53)

- Branch `slice-48-code` @ **f523774**, compared with main @ e605b3f. Criteria: `slice-48-docs` @ 29ef308 (`slice-48/verification-checklist.md`, AC1–36).
- Verifier, 2026-10-23, 07:33–08:40 CEST. Run on an isolated local stand-in (gateway/PostgREST/GoTrue/PG on ports 57870–57875) against the bank build on https previews.
- **0 requests to the live project fhzqwbdlejzohetdoluw.**

## SERIOUS
**None.** No lost placements or pass data and no stalls. Old Blå/Vit passes and a pass with an unknown hall load and edit correctly.

## Verdict
**PASS with findings. Not ready to merge** until:
1. W320 is fixed.
2. AC26–27 are run on a real iPhone. The AC27 simulation fails.
3. Christoffer confirms the bundle size himself.

Everything else passes, including all of the Builder's claims, which I checked one by one.

## Per-AC
| AC | Result | Note |
|---|---|---|
| AC1–3 | PASS | The row is 390 px, all three buttons are ≥44 px, and «Mer» no longer contains Hallöversikt |
| AC4 | PASS | Disabled; `#hall-cta-hint` is read out |
| AC5 | PASS | 844×390 |
| AC6–10 | PASS | Edit list, ≥44×44 targets, ↑ off on the first row and ↓ off on the last, Klar/Esc return focus, Golvklart has no edit mode, survives reload |
| AC11–14 | PASS | Simulated touch with Pointer Events (handle, drop line, marker, drop on the tray) |
| AC15 | PASS | Desktop mouse |
| AC16 | PASS | package.json and the lockfile are unchanged |
| AC17–18 | PASS | Markers and Teknik follow the new order |
| AC19 | PASS | Golvklart numbers match the list. Förrådslista is a flat aggregate with no station numbers, so there is nothing that can disagree |
| AC20–21 | PASS | «Lägg till övning» opens with Teknik selected and the filter select disabled (Q2) |
| AC22–24 | PASS | The toast lasts **5.0 s** (measured in-page). Ångra restores the station, its position and the order, then shows «Ångrat.». Another edit hides the toast |
| AC25 | PASS | Outside edit mode, «Ta bort från hall» takes the station out of the hall only (3→2, the same as main) |
| AC26 | **PENDING-real** | Simulation PASS: zoom 1.25→2.00 (capped)→1.50, page scale stays 1 |
| AC27 | **PENDING-real, likely FAIL** | Simulation FAIL; see M2 |
| AC28 | PASS | Zoom −/+ works; the viewport meta is unchanged |
| AC29–31 | PASS | 844×390: the detail view scrolls and its CTA is reachable, the Library scrolls to the last drill, Klar is reachable |
| AC32 | PASS | Detail view and Dela are identical to main at 390. I did not compare the compact sheets pixel by pixel; they open and I saw no difference |
| AC33 | PASS | The footer reads «Slice 48» |
| AC34 | PASS | `bun test src` 256/0, build clean, lint 0 errors / 6 warnings (= main), tsc clean, tools/bank 21 pass / 5 skip |
| AC35 | Reported, **UNCONFIRMED** | See Bundle |
| AC36 | PASS | The locked terms are unchanged (source counts wt/main: Hallöversikt 18/16, Passbyggaren 15/15, Golvklart 58/57, Förrådslista 9/9, Redigera redskap 10/10) |

Additional checks:
- **W320: FAIL** (M1).
- 844×390: every hall button and sheet is reachable (PASS).
- Old passes: PASS.
- Unknown hall: PASS. The pass opens as forening-bla.

Results: `slice-48-verify-results.json`, 61 checks, 59 PASS. The 2 FAILs are W320 and AC27-sim.

## Findings
**M1 (Major): 320 px edit list**
- In «Stationer i ordning» the station names wrap one letter per line.
- «Ta bort» runs off the screen: the button spans x 237–331 against a 320 px viewport, so it is clipped.
- The document width stays 320 and ↓ still works.
- This is a usability problem, not data loss. Screenshot: `s48v_16_edit_320.png`.

**M2 (Major-likely, PENDING-real): AC27, a pinch over the tray zooms the page**
- A CDP pinch that starts on the tray (`.hall-tray-compact-bar`, touch-action:auto) or below it zooms the page to 1.6×. Main behaves the same way.
- On the canvas the page scale stays 1.
- The pinch listener and `touch-action` are only on `.hall-canvas-wrap` (HANDOFF §6). Decision F1, however, says "touch-action på hela hallytan".
- Confirm on a real iPhone. A likely fix is to also cover the tray area.

**Bundle (AC35)**
- Measured gz-9: JS 130 422 → 132 417 B (+1 995) and CSS 13 881 → 14 207 B (+326). **Total +2.32 kB.** Vite reports 132.35 → 134.39 kB.
- That is about 4.5× the ~512 B guideline and above the ~+1.3 kB in the locked decisions.
- **Bundle: +2.32 kB vs the locked ~+1.3 kB is UNCONFIRMED; Christoffer has to confirm it.** SHIPPED says "Approved by Christoffer (≈+2.36 kB)", but PROJECT.md says an agent saying "Christoffer godkände" is never an approval.

**Q2/Q3: the PO rulings came via Builder, are not in the pack, and need the PO's confirmation.**
- Q2: the filter is locked to Teknik (behaviour verified).
- Q3: own drills appear without Ändra/Ta bort in the hall library. **Not verified** in this run.

**Stale doc statuses (Minor; not mine to edit)**
- The pack's checklist, HANDOFF and microcopy still say "Status: PROPOSED", although decisions.md is locked.
- The 4 living-docs lines the PR adds (docs/README, hall-oversikt-copy, hall-phone-chrome, ui-chrome) say «FÖRESLAGEN 2026-10-17, inte låst» / PROPOSED.
- `app/SLICE48-SHIPPED.md`:
  - It mislabels the A–F letters.
  - It contradicts itself: "I did not update the living docs" (also listed under deviations), yet the diff touches 4 docs.
  - It claims Christoffer approved the bundle; see Bundle.

**Accepted deviations as listed by Builder:** a local hall undo toast instead of the shared UndoToast, and the handle hint in `title`. I observed both, and neither causes any problem.

## Smokes
I ran the smoke loop sequentially against the Slice 47 baseline (`slice-48-checks/loop-classify.txt`).
- s48 builder smoke: **52/0**.
- s33–s45: unchanged.
- New FAIL ids, all caused by intended Slice 48 changes:
  - s40 AC14: the new «Ändra stationer» button.
  - s40-reverify AC11/AC14-controls/AC14-drag: HTML5 dragstart was replaced by Pointer Events (C1).
  - s46 AC7-10 and s47 AC3/AC7: Hallöversikt is no longer in «Mer» (A1).
  - s47 AC26-footer: the footer now reads Slice 48.
- s32: **partial** (10/6 when interrupted), with no new FAIL ids.

## Network
32 netlogs with 6324 requests. **0 to fhzqwbdlejzohetdoluw**, 0 BLOCKED. Hosts: local previews, plus bank-mock.supabase.co, which the bank build routes to the local stand-in (`slice-48-checks/netlog-count.txt`).

## Feature maps (HANDOFF §12; approved)
- `passbyggaren.md`, `hall-redigera-redskap.md`, `golvklart-forrad.md` and `README.md` updated.
- New `liggande-844x390.md`.

## Artifacts
- `verifier/slice-48-verify.mjs` and `slice-48-verify-results.json`.
- `slice-48-checks/` (test, tsc, lint, build, bank, bundle, runs, loop-classify, netlog-count).
- Screenshots `slice-48-screenshots/s48v_*.png`. Key ones: 14_edit_844 and 16_edit_320 (also copied to /workspace/screenshots/).
- Checkpoints 7437d13, 9a202d1 and 11c9449. Final commit: "Verifier: Slice 48 verify report (f523774)".
