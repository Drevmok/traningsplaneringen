# Slice 40 — Verifier report (PR #44, slice-40-code @ a0ca4fe)

Verifier, 2026-10-13. Own worktree (`/tmp/s40v/wt`, main at `/tmp/s40v/main` @ 45cce9b) and own local Supabase stand-in (`/tmp/s40v/sb`). No requests against the live project (bank traffic routed to the local gateway, 0 live hosts). Headless Chrome 390×844, DPR 2, touch. Script: `verifier/slice-40-verify.mjs` → `slice-40-verify-results.json` (32 PASS, 2 informational FAILs = finding F1). Raw output: `verifier/slice-40-checks/`. Screenshots: `verifier/slice-40-screenshots/` (also `/workspace/screenshots/s40v_*`).

**Measured canvas at 390×844:** Blå 358×264 px, Vit 358×374 px; marker `.hall-chip--canvas` 52×52 px. (HANDOFF assumed ~358×239; real canvases are taller, so overlap is smaller than desk estimates.)

## Per-AC table

| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS (note) | Planera pass → Blå hall: 3 markers at (0.29,0.5)(0.45,0.5)(0.61,0.5), 0 overlapping boxes, inside, row-major (`s40v_01_wizard_bla_branch`). Main: 3 overlapping pairs, all stacked (`s40v_02_wizard_bla_main`). The wizard only gives 3 Teknik, so "≥ 4" was covered via seeded empty-hall passes (n = 4/5/8, AC6) and apply paths (AC12). |
| AC2 | PASS (note) | Same in Vit: (0.135,0.41)(0.295,0.41)(0.455,0.41), 0 overlap; main stacked. ≥ 4 via AC4/AC6. |
| AC3 | PASS | Blå n=5 stored = (0.21,0.38)(0.37,0.38)(0.53,0.38)(0.69,0.38)(0.21,0.62), ±0.001 (`s40v_03_bla5_hall`). |
| AC4 | PASS | Vit n=4 stored = (0.135,0.29)(0.295,0.29)(0.455,0.29)(0.135,0.53) (`s40v_04_vit4_hall`). |
| AC5 | PASS | Rank DOM order and stored coords row-major for every n tested (1–16, both halls), rank 1… left→right, top→bottom. |
| AC6 | PASS | Blå & Vit n = 1, 4, 8 (and Vit 6): all boxes inside `.hall-canvas`, 0 overlap, 100 % of each marker hit-testable, no horizontal scroll (scrollWidth 390). |
| AC7 | PASS | Vit n=12: inside, order kept, **0 overlapping boxes** (min centre distance 54.8 px), app responsive (`s40v_05_vit12_overlap`). Vit n=16: 13 overlapping pairs, all same-column (overlap X = 52 = full width), **max vertical overlap 19.5 px** (`s40v_06_vit16_overlap`). See F2. |
| AC8 | PASS | Blå, satsbräda/trampett/tumbling/kon → 4 distinct spots, 0 overlap (`s40v_07_bla_mixed`); main: 1 spot for all 4 (`s40v_08_bla_mixed_main`). |
| AC9 | PASS | Builder golden test green; my helper parity: standard-trupp, tavling-linjer, liten-hall byte-identical to main on 400/400 random passes (1–16 Teknik) + 400/400 two-step adds. Browser spot check per hall (5 mixed, empty-hall open): placements identical to main. |
| AC10 | PASS | Seeded Blå pass with no placements → open Hallöversikt → grid as AC3. |
| AC11 | PASS | 3 placed, marker 1 dragged (DnD events) to (0.30,0.75); add from bank → the 3 unchanged, new one at (0.69,0.50) = slot 3 of 4. But it overlaps marker 3 by 23.7×52 px (F1, `s40v_11_bla_add_station`). |
| AC12 | PASS (built-in: N/A by design) | Mina mallar (Blå, no placements) → AC3 grid (`s40v_09_egen_bla`). Föreningsmall via stand-in (Vit, 4 Teknik) → AC4 grid (`s40v_10_club_vit`). Built-in Nybörjare over a Blå pass → lands in its own hall standard-trupp (Slice 37 E1), so it never reaches Blå/Vit; its path is byte-identical to main (AC9). |
| AC13 | PASS | Draft created on main (Blå, stacked) opened on branch: localStorage byte-identical after open + Hallöversikt (`s40v_13_main_stacked_on_branch`). Egen mall saved on main with stacked spots, applied on branch → same spots, no re-layout. |
| AC14 | PASS | Hallöversikt (Vit, 5 mixed): visible buttons (22/22), hall options and body text identical to main (slice no. normalised). Only Teknik get markers. Drag, «Placera här» (tap at 0.85,0.30 → stored 0.849,0.300) and «Ta bort från hall» (→ tray) work. |
| AC15 | PASS | gzip -9 sum: total 217 831 → 218 075 (**+244 B**), eager 153 946 → 154 183 (+237 B). Matches Builder; ≤ +512 B. |
| AC16 | PASS | Build 0; `bun test src` 206 pass / 0 fail (25 files) incl. hallGrid golden over all 5 templates; lint 0 errors (15 warnings, pre-existing); tsc 0; footer «Träningsplaneraren · Slice 40»; Slice 40 asserts in feedback.test.ts and clubTemplates.test.ts. |

## Numbered findings

1. **F1 (important, Planner decision): adding stations one at a time to a Blå/Vit pass produces overlapping markers.** The existing markers keep the grid centred for the old total, and the new one is placed on its slot for the new total (HANDOFF §3, AC11 "slot 3 of 4"). Measured in the app at 390×844:
   - AC11 case: new marker 4 at (0.69,0.50) overlaps marker 3 at (0.61,0.50) by **23.7 × 52 px**; marker 3 only 55 % visible.
   - Blå pass built from 0 by adding 5 stations via the bank: coords (0.45,0.5)(0.53,0.5)(0.61,0.5)(0.69,0.5)(0.21,0.62); markers 1–4 overlap pairwise by 23.7 × 52 px (`s40v_12_bla_one_by_one`). Rank numbers stay readable, icons partly hidden.
   - Helper sim (8 single adds): from n2 min distance 28.6 px; from n5 full 52 × 52 overlaps. Same in Vit.
   - Matches the AC text, but contradicts the coach outcome (A1: "every marker separately") for the common "build the pass station by station" flow. Possible fix for Planner: pick the first free slot of the new total that is not near an existing marker, or treat the AC11 slot rule differently.
2. **F2 (info): overlap is only reached at large passes.** Vit: 0 overlap up to n=12 (min 54.8 px); n=16 max vertical overlap **19.5 px** (13 pairs), n=20 24.6 px (helper). Blå: 0 overlap up to n=16 (n=16 min visible 94 %, only the × buttons touch). At Vit 16 every rank badge is visible and the centre tap on 2 of 16 markers hits the neighbour below; the lower 19.5 px of a marker is covered. Readable; tapping works on the visible top part. Earlier desk numbers (17/31 px at n=12/16) assumed a 239 px canvas and are superseded.
3. **F3 (info): wizard yields 3 Teknik**, so AC1/AC2's "≥ 4" can't come from Planera pass alone. Covered by seed + apply paths.
4. **F4 (info): built-in mall never lands in Blå/Vit** (switches to Standard trupp per Slice 37), so AC12's built-in leg is not reachable. Not a defect.
5. **F5 (info): Golvklart / Förrådslista** sane: Golvklart in Vit (5 mixed) shows 5 separate markers inside the hall; Förrådslista text identical to main (`s40v_14_golvklart_vit_branch`, `s40v_15_forradslista_branch`).
6. **F6 (info): hall switching** (applyPreset) keeps stored x,y for Blå/Vit — unchanged, out of scope.
7. **F7 (smokes):** no Slice 40 regression. Slice 40 Builder 18/18. Old smokes on the branch vs last runs:
   - 39 Builder 37/1 (footer number), 39 Verifier 69/3 (footer; AC1 and §I drive «Spara utkast» on main, gone since 45cce9b — baseline moved).
   - 38 Builder 25/1 (footer), 38 Verifier 67/4 (footer, 2× "main has no Kvar" — main now has Slice 38, and AC14-hall 16 vs 14 buttons once — flake, identical on re-run alone).
   - 37 Builder 23/1, 37 Verifier 2 fails (was 4), 36 Builder 40/6, 36 Verifier 15/2, 35 Builder 33/8, 35 Verifier 37/10, 34 Builder 29/2, 34 Verifier 31/1 (was 3), 33 Builder 141/5, 32 Builder 26/17 (FAIL list identical to last run).
   - All remaining FAILs are footer/version number, later-slice behaviour (built-in/club placements since 37, Spara utkast since 39) or the known harness ones. Same as or fewer than last run.
8. **F8: secrets:** `git grep` on a0ca4fe for key patterns: no key values (only docs mentioning `sb_secret_`/`service_role` names). dists: only supabase-js' `"sb_secret_"` prefix check. Committed outputs: no JWT/secret patterns.
9. **PENDING-real:** touch drag on a real phone and the real Supabase föreningsmall need a device / live project. Not run here.

## Verdict

**PASS against AC1–AC16** (AC12 built-in leg N/A by design). Spread works in Blå and Vit for every apply path, other halls are byte-identical to main, nothing already placed moves, bundle +244 B.

**Ready to merge: yes on the ACs, but Planner should rule on F1 first.** Building a pass station by station still stacks markers (23.7 × 52 px overlap), and that is the coach's main path. If F1 is accepted as a follow-up, merge. Not merged by Verifier.
