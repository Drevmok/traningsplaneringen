# Seed batch 2DJ_oMM81mI — Formal verification report (PR #32)

**Date:** 2026-10-02 ~16:15 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** Planner's 7-item brief (2026-10-02) · `import-trials/2DJ_oMM81mI/drafts.sv.md` / `drafts.json` · `slice-30/content/seed-promotion.md`  
**Code under test:** PR #32, branch `seed-2DJ_oMM81mI`, SHA `48cfb9d` (not merged, nothing pushed to main)  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence)  
**Build/tests:** `npm run build` exit 0 · `bun test src` **57 pass / 0 fail** (11 files)  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview, HTTP 200) · footer "Träningsplaneraren · Slice 30"  
**Viewport:** DevTools Responsive 390×844 (fit-to-window on a short host screen)  
**Evidence:** `seed-2DJ_oMM81mI-evidence-code.md` (file:line per item) · screenshots `/workspace/screenshots/seed2DJ_*.png` · Builder `seed-2DJ_oMM81mI-smoke.md`

---

## Overall verdict: **PASS with notes** (no blockers)

| # | Item | Verdict |
| --- | --- | --- |
| 1 | Exactly 11 ids, no Spindelmannen | **PASS** |
| 2 | Biblioteket › Teknik, Swedish copy, ≤4 steps | **PASS** |
| 3 | Källa line m:ss, no embed, none in Golvklart/print | **PASS** |
| 4 | Redskap + sketches match drafts | **PASS** |
| 5 | Bygger på / Lättare variant links resolve | **PASS-with-note** |
| 6 | Existing flows + ownImport test change | **PASS-with-note** |
| 7 | bun test + build green | **PASS** |

## Per item

**1 — PASS.** The diff adds one appended block in `seedActivities.ts:521-856` with exactly the 11 requested ids. The header count goes from 40 to 51 (Teknik 24). No existing seed was edited or removed. Spindelmannen appears only as a negative assertion in `seedActivities.test.ts:53-56`; it is not in `app/src`, the shipped docs, or the bundle. UI: all 11 titles are listed under Biblioteket › Teknik, and searching "Spindel" returns "Inga övningar matchar." (`seed2DJ_bibliotek_list0–2.png`).

**2 — PASS.** All 11 are `techniques`, 6 min. A script diff of title, summary, howTo, watchFor and safety against `drafts.json` found 0 differences, so the copy is the approved Swedish text word for word. Step counts from the UI: Grenhopp 4 · Formhopp 4 · Äggrullning 4 · L-häng 4 · Stöd/pendel 3 · Åsnesparkar 3 · Minihjul 4 · Soldatsparkar 4 · Krabbgång 3 · Rockringar 4 · Plint 3.

**3 — PASS.** Every detail shows `Källa: Prime Coaching Sport · m:ss ↗`: 0:16, 0:30, 0:50, 1:39, 1:55, 2:26, 2:45, 3:04, 3:25, 3:47 and 4:05, all matching the drafts. Links are `https://youtu.be/2DJ_oMM81mI?t=<sec>`. Drafts marked "ca …" show plain m:ss because the app has no "approximate" field (accepted). There is no embedded player and no iframe was added. Seeds show no "Behöver granskas" badge, since the badge requires `own`. The Golvklart Formhopp detail has no Källa and no badge (`seed2DJ_golvklart_detail.png`), and the print preview has no Källa (`seed2DJ_print.png`). In code, `detailCoachMeta` with `floor` is `source.ts:64-73` and `HallBoard.tsx:788`, and print, stationskort, Kör passet and export have 0 source references.

**4 — PASS.** Redskap per draft:

| Draft | Redskap |
| --- | --- |
| #1 | Trampett, Landningsmatta |
| #2 | Trampett, Skumblock, Landningsmatta |
| #3 | Kilmatta, Madrass |
| #5 | Räcke, Landningsmatta |
| #6 | Räcke, Landningsmatta |
| #7 | Tumblingmatta |
| #8 | Tumblingmatta |
| #9 | Bom, Landningsmatta |
| #10 | Bom |
| #11 | 4× Rockring |
| #12 | Plint |

All pieces are in `EQUIPMENT_PIECES` and drawable by `StationSketch`, and the 11 new `visualKey`s map to existing icons (`icons/map.ts:46-57`). The REDSKAP list shows in the station and Golvklart detail, not the plain Biblioteket detail (existing behaviour); it was verified there (`seed2DJ_golvklart_detail_2.png`).

**5 — PASS-with-note.** The fields are `progressionOf` (shown as "Bygger på") and `regressionOf` (shown as "Lättare variant av"). Every link resolves to an existing id and shows the right title in the UI:
- Two-way: #1 and #12 (Grenhopp builds on Plint landningar; Plint is the easier variant of Grenhopp).
- Two-way: #1 and #2 (Formhopp builds on Grenhopp; Grenhopp is the easier variant of Formhopp).
- One-way, as drafted: #8 → `tech-hjul` and #9 → `tech-balansgang`. The detail view shows only an activity's own links, with no reverse lookup, so existing seeds don't display a back-link.

Note: link texts are static, not tappable. That is existing behaviour and out of scope here.

**6 — PASS-with-note.**
- Adding seeds to a pass works (`seed2DJ_pass.png`), and Hallöversikt auto-places them with "Ej placerade (0)".
- The Planera pass wizard completes on defaults (4–6 år → Satsbräda → Blå hall gives "Pass — satsbräda"; `seed2DJ_wizard.png`).
- Importing the Slice 30 example: both rows show "Samma namn finns redan" with "Ta med" (default) or "Hoppa över". Importing creates two own copies marked Egen and Behöver granskas (`seed2DJ_import*.png`). Name matching against seeds shipped in Slice 30 (`ownImport.ts:223-225, 264`), and this PR doesn't touch it. Nothing is blocked, and seeds are never offered "Ersätt". The two changed tests reflect real behaviour, and the UX is reasonable: a coach sees a clear duplicate notice and still chooses.
- **Kom igång:** not visible on Home (`seed2DJ_komigang.png`). This is not a regression from this PR. `KomIgangCard` hasn't been mounted anywhere since #17 "En enklare startsida" (`3c5bf2e`), and PR #32 touches no UI or component files. Noted for Planner.

**7 — PASS.** `npm run build` exits 0, and `bun test src` gives 57 pass / 0 fail.

## Notes for Planner (non-blocking)

1. **needsCoachReview:** all 11 seeds keep `needsCoachReview: true` (asserted at `seedActivities.test.ts:83`). `seed-promotion.md:11` says `false` for word-for-word-approved text. It has no visible effect today because the badge requires `own`. Decide whether to flip it.
2. **promote.json:** there is no `promote.json` or `check_import.py` run in `import-trials/2DJ_oMM81mI/`. Process step 3 was skipped, and Builder worked from `drafts.json`. The content matches the drafts exactly.
3. **Stale Slice 30 checklist:** `slice-30/verification-checklist.md:38` (AC 14) and `:87` expect "2 × Ny" for `example-import.json`. Those titles are now seeds, so a future Slice 30 re-verify would fail AC 14 as written. Swap the example titles or annotate AC 14.
4. **Draft #12 redskap:** `redskap-library.md:11` suggests Skumblock for the orange box. The seed uses Plint, which matches the draft and the brief.
5. **Kom igång:** not mounted since PR #17 (see item 6). Intentional or not, it's outside this PR.

## Screenshots

| Area | Files |
| --- | --- |
| Biblioteket list / search | `seed2DJ_bibliotek_list0.png`, `seed2DJ_bibliotek_list1.png`, `seed2DJ_bibliotek_list2.png` |
| Details | `seed2DJ_detail_formhopp.png`, `seed2DJ_detail_formhopp_2.png`, `seed2DJ_detail_lhang.png`, `seed2DJ_detail_rockringar.png` |
| Pass, Golvklart, print | `seed2DJ_pass.png`, `seed2DJ_golvklart_detail.png`, `seed2DJ_golvklart_detail_2.png`, `seed2DJ_print.png` |
| Regression | `seed2DJ_komigang.png`, `seed2DJ_wizard.png`, `seed2DJ_import.png`, `seed2DJ_import_result.png` |
