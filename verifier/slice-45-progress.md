# Slice 45 verify: progress (PR #49 @ dea69d2, main 4fe44c0)

Checkpoint file, updated after each ~15-min chunk. Times are Europe/Stockholm (UTC+2).

## Setup (chunk 1, 16:53–17:10)
- Worktrees `/workspace/s45v/wt` @ dea69d2 and `/workspace/s45v/main` @ 4fe44c0. playwright-core 1.56.1 reinstalled in `/workspace/s45v/pw`. `npm ci`.
- Stand-in (`verifier/slice-36-local/up.sh`):
  - `S32_DIR=/workspace/s45v/sb`, gateway :57830, PG17 :57831, PostgREST 12.2.3 :57832, GoTrue (supabase/auth 2.177.0) :57833, SMTP :57835.
  - 36-03 smoke = 8 × t.
  - Never the live project.
- Previews (Doctor: all return 200):

  | Port | Build |
  |---|---|
  | :57841 | branch plain |
  | :57842 | main plain |
  | :57840 | branch bank build, `VITE_SUPABASE_URL=https://bank-mock.supabase.co`, routed by the smokes to the stand-in |

- Old-smoke loop started 16:55 in the background (`setsid nohup`, flock guard so only one loop can run). Run order: 45-builder, 44-builder, 44-verify, 43 … 32. Outputs in `/workspace/s45v/smk/out/`. Baseline: `verifier/slice-44-checks/smokes/`.

## Done
- Builder's claims, checked so far:

  | Claim | Measured | Matches? |
  |---|---|---|
  | `bun test src` 234/0 | 234 pass / 0 fail (29 files) | ✓ |
  | `bun test tools/bank` 21/0 | 21 pass / 0 fail / 5 skip (stand-in tests need env) | ✓ |
  | tsc clean | `npx tsc -b` rc 0 | ✓ |
  | lint clean, 4 warnings | 0 errors, **6** warnings | Same 6 as main, so not a regression. Builder's count is off by 2 (cosmetic) |
  | build clean | all three builds OK | ✓ |
  | bundle −1,486 B | total 213,631 → 212,145 = −1,486 B; eager 149,754 → 148,244 = −1,510 B | ✓ |

- Rulings recorded as **Builder-reported** (from SLICE45-SHIPPED.md):
  - AC5: «no lower than main», 340 with the banner. The checklist text says «≤ 310 (not lower than main)». It will be graded against both.
  - Old-hall Mina mall duplicate detection: accepted as is.
  - Dela dismisses the Ångra toast: to verify.

## Chunk 2 (17:00–17:40): AC1–AC12. Script `slice-45-verify.mjs` PART p1 → **20 / 22**
- Main data was made in **main's own UI** (4fe44c0) and is saved in `slice-45-checks/main-data.json`:
  - Nybörjare «S45V gammalt pass» with «Använd alla förslag», on Standard trupp; zones vault/mats/open.
  - The same pass switched to Tävling / Liten / Blå / Vit.
  - A Mina mall saved on Liten hall.
  - A `#dela=` link copied on Standard trupp.

| AC | Verdict | Evidence |
|---|---|---|
| AC1 | PASS | Q3 «Hall», chips exactly «Gymmix – Stora hallen» · «Gymmix – Grophallen» (en dash), «Fråga 3 av 3» |
| AC2 | PASS | no «Stationerna är förslag…» / «Välj den layout…» on Q2 or Q3; Tillbaka → Fokus, Nästa → Hall, Skapa pass → forening-vit |
| AC3 | PASS | Grophallen drawing (canvas ratio 0.9572); meta and Golvklart meta «Gymmix – Grophallen» |
| AC4 | PASS | Tomt pass (+1 Teknik drill, because an empty pass shows the no-stations state) and Från mall → Nybörjare: forening-bla, «Gymmix – Stora hallen», markers 1–3 on the grid in pass order, none on walls |
| AC5 | **FAIL as written / Planner to rule** | Controls PASS: no label or select; zoom 48×44 at 390 and 320; no horizontal scroll at 320. Canvas top: see the table below |
| AC6 | PASS | under the hall only «Schematisk hall — inte exakt mått» + the flow tip; after «Dölj tips» only the caption is left; none of the 12 removed texts appear anywhere |
| AC7 | PASS | tray text only «Dölj bricka / Ej placerade stationer (1) / station»; remove → 2, Placera här → 3, collapse works; desktop drag moves a marker and saves it |
| AC8 | PASS | standard-trupp draft → opens, Stora hallen, markers on the grid in pass order (identical to a fresh pass), no walls; draft stores forening-bla; **pass content byte-identical, id unchanged**; no legacy id left anywhere in storage |
| AC9 | PASS | the same for tavling-linjer, liten-hall, generic-trupp, and no id |
| AC10 | PASS | main link on Standard trupp → Delat pass shows the Stora hallen drawing with markers 1–3, none on walls; «Spara på den här enheten» stores forening-bla; title and Teknik (activity, minutes, redskap) as on main. The Delat pass view shows the drawing but no hall *name*; main didn't show one either |
| AC11 | PASS (Mina) / **PENDING-real (förening)** | Mina mall saved in main's UI on Liten hall → Använd mall → Stora hallen, 3 markers; the saved mall itself is untouched (still `liten-hall` in storage; nothing rewritten). Föreningens mall: **no unit test drives `clubTemplateToSession` with a legacy id.** `hallLegacy.test.ts` (10/10 pass) covers `shareToSession` + `savedTemplateToSession`, which the club path calls, so the coverage is indirect. Planned for chunk 3: a stand-in run with a club_templates row on standard-trupp |
| AC12 | PASS | Blå and Vit drafts from main with one hand-moved marker: placements byte-identical after open + Hallöversikt + reload |

**AC5 measurements** (hall canvas top–bottom in px, page coordinates; branch vs main; *banner* = saknar-redskap banner shown):

| Width | Scenario | Branch | Main | Δ top |
|---|---|---|---|---|
| 390 | Från mall Nybörjare, banner | 340–604 | 340–579 | 0 |
| 390 | same, no banner | 288–552 | 288–527 | 0 |
| 390 | 2-line title, no banner | 310–574 | 310–549 | 0 |
| 390 | wizard Stora/Blå, banner | 339–603 | 310–574 | **+29** |
| 390 | wizard Stora/Blå, no banner | 287–551 | 258–522 | **+29** |
| 390 | wizard Grophallen/Vit, banner | 339–713 | 310–684 | **+29** |
| 390 | wizard Grophallen/Vit, no banner | 287–661 | 258–632 | **+29** |
| 320 | all 7 scenarios | 369–391 tops | 340–362 tops | **+29** |

- **Cause:** B1 adds the read-only hall name to the meta line (`.hall-preset-readonly`). Whenever the title + count fit on one line on main (short wizard titles at 390, every case at 320), the name wraps onto its own line, about +29 px. With Nybörjare the meta already wrapped on main, so Δ = 0. That is the only case Builder measured.
- Canvas bottoms stay ≤ 739 in every 390 case (max 713, Grophallen with banner). The canvas is also 25 px taller than on main.
- Grading:
  - Checklist «≤ 310»: fails with the banner on both halls (340 / 339).
  - Builder-reported ruling «no lower than main»: fails for wizard passes and at 320 (+29).

## Remaining
- Chunk 3:
  - AC13–AC15 and AC19–AC21: compact sheets and the Dela sheet, landscape, desktop.
  - The Ångra-toast + Dela path: undo cleared, nothing lost.
  - AC16: print ratios (headless + real Chrome).
  - AC17: string/id sweep.
  - The cleanup's removed code vs code still in use.
  - AC11 föreningens mall via the stand-in.
- Then: classify the smokes (the loop is running; at 17:04 it was on 42-verify), write the report, screenshots, final commit, teardown.
