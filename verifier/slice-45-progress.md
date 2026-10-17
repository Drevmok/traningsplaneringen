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
| AC5 | **PASS per Planner's ruling (17:10)**: the hall bottom is ≤ 739 at 390×844 in every case (lowest 713). +29 px vs main = **Low finding** (Slice 48 reworks the Hallöversikt placement). It was «FAIL as written» before the ruling | Controls PASS: no label or select; zoom 48×44 at 390 and 320; no horizontal scroll at 320. Canvas top: see the table below |
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

- **Planner's ruling (17:10, relayed by the user):** +29 px accepted. AC5 = PASS if the hall bottom is ≤ 739 at 390×844 in every case. Measured bottoms at 390: 527–713. **PASS.** Logged as a Low finding.
  - The raw results JSON keeps `AC5-top310` and `AC5-notlower` = false, because they are the checks as written. The report grades them by the ruling.
- 320 px usability:
  - Hall top 369–391 and bottom 581–670, so the whole hall fits within 844 with no scroll needed to see it.
  - No horizontal scroll. Zoom buttons are 48×44.
  - Awkward: the meta line wraps (hall name on its own line), which pushes the hall down by +29 px. With the banner, the top of the hall sits at about 44 % of the screen. Usable.

## Chunk 3 (17:10–17:28): PART p2 → 32 / 32 checks (after script fixes)
| AC | Grade | Evidence |
|---|---|---|
| AC13 | PASS | Rensa passet: compact sheet 653–844 (h 191 vs main 776). Avbryt 69×44 and Rensa 68×44 side by side. Text identical to main. Avbryt, backdrop and Rensa all work |
| AC14 | PASS | «Ersätta utkastet här?» h 191; Ny vecka h 214; TemplateConfirm h 214. All bottom 844, compact, text = main. Tall sheets are unchanged: Förrådslista 101–844 = main; wizard 369–844 = main. Övningsdetalj is not compact in source (only Admin, Export, Home, NewWeek, Replace and Template carry `modal--compact`); the script did not open it (it is a Golvklart tap). AdminHideConfirm has the compact classes in source; the real admin Dölj flow is PENDING-real |
| AC15 | PASS | Landscape 844×390: hall top 257 vs main 313; no select; no horizontal scroll. Rensa dialog box and buttons (89×40, 88×40) are **identical to main**: compact is phone-only and the 40 px is inherited, not a regression. Desktop 1280×800: dialog 480×194 at 400,303, identical to main |
| AC16 | PASS | Print map Stora 1280×944 (ratio 1.3562) and Grop 0.9582, both = main. Golvklart print 1.3563. Pass PDF 3 pages (pdf-br/*) |
| AC19 | PASS | Dela at 390: sheet 381–844 (h 463), padding-bottom 20px; contents identical to main (main is full-height 0–760) |
| AC20 | PASS | × 44×44; × and backdrop close; flip 3101 ms; prints 1. Grown sheet h 641 ≤ 776, overflow auto, × reachable, closes cleanly |
| AC21 | PASS | Landscape sheet 20–371 scrolls inside. × is reachable at the start; after scrolling to the bottom it scrolls out of view, **same as main** (main-land xAfterScroll false too; h 351 on both), so this is not a regression (cosmetic note). Desktop box 400,188 480×424 = main. Golvklart and Delat buttons unchanged except the removed Helskär/kort |
| FU-toast (Builder-reported ruling) | PASS | Använd mall shows the Ångra toast (2 nodes). Opening Mer → Dela at once removes the toast (0 with the sheet open). «Skriv ut passet» is not covered and prints (1). After ×, no Ångra; Ctrl+Z does nothing. Storage afterwards is identical to the 5 s timeout path (same draft content with ids normalised, same Mina mallar incl. the auto-kept «S45V eget pass A», same keys). Nothing is lost |
| AC11-club (stand-in) | PASS | A föreningens mall row with `hallTemplateId: 'standard-trupp'` was published to the local stand-in. Note: the DB forbids hallPlacements in the payload (`club_templates_payload_check3`). Använd mall → forening-bla, «Gymmix – Stora hallen», 3 markers on the grid in pass order. DB row untouched. 0 live requests (only GET exercises/redskap/club_templates to the routed mock) |

Script fixes this chunk:
- NewWeekConfirm cancel (.btn-secondary).
- Förrådslista aria name, and its close button.
- Templates storage is a raw array.
- Club payload without hallPlacements.
- AC15 graded against main rather than a fixed 44 px.
- `ONLY=` env to re-run single checks.

## Smoke loop (one loop, flock): status 17:25
- Done rc=0 through 39-verify. 38-builder was running.
- `slice-45-checks/classify.sh` gives a first diff vs the Slice 44 baseline (classification is not done yet):
  - Unchanged: 39-builder, 41-builder, 42-builder, 42-verify.
  - New FAILs to classify: 40-builder, 40-reverify (legacy halls/select removed, so expected?); 41-reverify-b (28: race-* and AC2–AC5, needs a look); 43-builder and 43-verify (halls/select); 44-builder and 44-verify (footer = Slice 45 expected, AC6/Dela/markers to check); 39-verify (A–H).
  - 45-builder: 40/41. AC17 errored only because the smoke copy had no `app/dist` (environment). It is now symlinked to wt/app/dist and will be re-run alone after the loop (`LIST=slice-45-builder-smoke run.sh`, same flock).

## Remaining
- Classify every new smoke FAIL (cause: removed hall/select/legacy UI = expected, or regression).
- Re-run builder-45.
- AC17 sweep (rg ids/strings vs microcopy).
- AC18 footer.
- Cleanup analysis (removed code vs code still in use).
- Secret grep.
- Report, 2 screenshots, final commit, teardown.
