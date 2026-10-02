# Seed promotion 2DJ_oMM81mI (PR #32): code evidence

**Branch:** `seed-2DJ_oMM81mI` @ `48cfb9d` ("Nya övningar från Prime Coaching Sport (seed promotion 2DJ_oMM81mI)")
**Base compared:** `e4f06ff` (parent) and `1febe46` (PR #31 merge)
**Sources of truth:** `import-trials/2DJ_oMM81mI/drafts.sv.md`, `drafts.json`; process `slice-30/content/seed-promotion.md`
**Scope:** code and files only (the UI is checked separately). No app code was changed, nothing was committed. The only file written is this one.
**Date:** 2026-10-02 (Europe/Stockholm)

## Summary

| # | Check | Result |
|---|---|---|
| 1 | Exactly 11 new ids, nothing else added or removed, no Spindelmannen | **PASS** |
| 2 | Teknik, Swedish copy, ≤4 steps | **PASS** |
| 3 | Källa (Prime Coaching Sport, m:ss, `youtu.be/2DJ_oMM81mI?t=`), no embed, B1 floor rule, no badge | **PASS** (2 notes) |
| 4 | Redskap + sketches match the drafts and the Slice 30 redskap | **PASS** (1 note) |
| 5 | progressionOf / regressionOf resolve; reciprocity | **PASS** (2 one-way links to existing seeds; by design) |
| 6 | ownImport test change to `sameName` (Samma namn finns redan) | **PASS**: the change is justified and the UX is acceptable (stale Slice 30 checklist text noted) |
| 7 | `npm run build` + `bun test src` | **PASS**: build exit 0; 57 pass / 0 fail |

**Process concerns (not blocking the code):**
- **C1, needsCoachReview stays `true` on all 11** (`seedActivities.ts:554,586,616,646,676,705,735,766,795,824,854`; the test asserts it at `seedActivities.test.ts:83`). seed-promotion.md:11 says to set `needsCoachReview: false` **only** for text Christoffer approved word-for-word. The seed text is word-for-word identical to the drafts (script diff below), and Christoffer approved every draft except #4, so by the rule these could be `false`. The Builder comment at `seedActivities.ts:522-523` assumes approval has not happened yet. **The coach sees no effect**: the badge and the "Markera som granskad" button need `own === true` (see item 3). Planner/Christoffer should decide. This matches 5 older seeds that also carry `needsCoachReview: true` (lines 50, 70, 127, 166, 1044).
- **C2, no `promote.json`** in `import-trials/2DJ_oMM81mI/`. seed-promotion.md:9-13 (step 3) asks for one, with `seedId` per drill, run through `check_import.py`. The Builder worked directly from `drafts.json`. The ids and flags that came out are still consistent.
- **C3, stale Slice 30 checklist text:** `slice-30/verification-checklist.md:38` (AC 14) and `:87` still say the example file gives "2 × **Ny**". After this PR it shows **Samma namn finns redan** for both rows. See item 6.

## Draft → id → title map

| Draft | Seed id | Title | Line (id) |
|---|---|---|---|
| #1 | `tech-grenhopp-trampett` | Grenhopp från trampett | seedActivities.ts:525 |
| #2 | `tech-formhopp-over-block` | Formhopp över block från trampett | :557 |
| #3 | `tech-aggrullning-kil` | Äggrullning nerför kil | :589 |
| #4 | *(not promoted)* | Spindelmannen uppför kil | n/a |
| #5 | `tech-l-hang-racke` | L-häng i räcke | :619 |
| #6 | `tech-stod-racke-pendel` | Stöd på räcke med pendel | :649 |
| #7 | `tech-asnesparkar` | Åsnesparkar | :679 |
| #8 | `tech-minihjul` | Minihjul (krabbhjul) | :708 |
| #9 | `tech-soldatsparkar-bom` | Soldatsparkar på bom | :738 |
| #10 | `tech-krabbgang-bom` | Krabbgång längs bom | :769 |
| #11 | `tech-ljushopp-rockringar` | Ljushopp i rockringar | :798 |
| #12 | `tech-landning-plint` | Landningar upp på och ner från plint | :827 |

(Draft headings: drafts.sv.md:13, 45, 78, 109, 137, 165, 194, 221, 253, 283, 312, 340.)

---

## 1. Exactly 11 new ids, no Spindelmannen: PASS

- `git diff --stat 1febe46..48cfb9d` / `e4f06ff..48cfb9d` touches these app files: `app/src/data/seedActivities.ts` (+340/−1 header line), `activityTips.ts` (+23), `icons/map.ts` (+12), `seedActivities.test.ts` (new, +103), `lib/ownImport.test.ts` (9 lines changed). The rest are `verifier/seed-2DJ_oMM81mI-{smoke.md,smoke.mjs,results.json}`. The extra `backlog/IMPROVEMENTS.md` in the `1febe46..` diff comes from `e4f06ff` (the commit before the PR), not from the PR.
- The seedActivities.ts diff is one added block, `seedActivities.ts:521-856` ("Teknik · Prime Coaching Sport, Fun gymnastics stations (11)"), plus the header count. No existing seed was edited or removed.
- Seed count: 40 before (`git show e4f06ff:…` → 40 `id:` lines), 51 after. Prefixes: tech 24, warm 7, gather 5, strength 5, fun 10. The header at `seedActivities.ts:7` says `Teknik 24 … = 51` ✓ (seed-promotion.md:20).
- New ids (lines 525, 557, 589, 619, 649, 679, 708, 738, 769, 798, 827) equal the requested list exactly. Uniqueness is tested at `seedActivities.test.ts:25-28`.
- Spindelmannen: `rg -i spindel app docs README.md backlog` finds only `app/src/data/seedActivities.test.ts:53-56`. That is a **negative assertion** (`!seedActivities.some(… /spindel/i …)`), so it is fine. Built bundle `dist/assets/*.js`: 0 hits. Spindelmannen does still appear in `slice-30/content/redskap-library.md:10` and in `import-trials/`, but neither is shipped.

## 2. Teknik, Swedish, ≤4 steps: PASS

- `blockType: 'techniques'` at lines 527, 559, 591, 621, 651, 681, 710, 740, 771, 800, 829. `durationMinutesDefault: 6`, difficulty intro/easy, `newCoachOk: true`, `experiencedCoachOnly: false`, `new-coach-ok` tag (seed-promotion.md:18).
- Steps (`howTo` lines 533/565/597/627/657/687/716/746/777/806/835): #1 4 · #2 4 · #3 4 · #5 4 · #6 3 · #7 3 · #8 4 · #9 4 · #10 3 · #11 4 · #12 3. All ≤4. Tested at `seedActivities.test.ts:63-64`.
- Copy: a script compared title / summary / howTo / watchFor / difficulty / duration / flags, plus safety (via `floorTip`), against `drafts.json`. Result: **0 differences** for all 11, so the text is the approved Swedish drafts word-for-word. Coach-facing copy has no English.
  - English strings that remain are internal or proper nouns: zone and filter tags `new-coach-ok`, `floor` (lines 684, 713, 803; used by `hallSuggest.ts:28-31` / `wizard.ts:39-45` and library search, never rendered as labels); `visualKey`s (e.g. `tech-straddle-trampett`); `source.title: 'Fun gymnastics stations'`, which is the video's real title and is used only inside the Swedish aria-label "Öppna ”{title}” hos {creator} i en ny flik" (`blockMeta.ts:585`, `SourceLine.tsx:17`). No flag needed.
- Safety lines go to `ACTIVITY_SAFETY` (`activityTips.ts:78-100`), not `safetyLine` (seed-promotion.md:17). `validateTipCatalog` is clean (`seedActivities.test.ts:100-102`).

## 3. Källa / no embed / B1 / badge: PASS

**Source per seed** (url line; creator is the next line; startSeconds is url+3):

| Draft | url (line) | startSeconds | Rendered m:ss | Draft Källa (drafts.sv.md) | Match |
|---|---|---|---|---|---|
| #1 | `?t=16` (546) | 16 | 0:16 | 0:16 (:39) | ✓ |
| #2 | `?t=30` (578) | 30 | 0:30 | ca 0:30 (:72) | ✓ |
| #3 | `?t=50` (608) | 50 | 0:50 | 0:50 (:103) | ✓ |
| #5 | `?t=99` (638) | 99 | 1:39 | 1:39 (:159) | ✓ |
| #6 | `?t=115` (668) | 115 | 1:55 | ca 1:55 (:188) | ✓ |
| #7 | `?t=146` (697) | 146 | 2:26 | 2:26 (:215) | ✓ |
| #8 | `?t=165` (727) | 165 | 2:45 | ca 2:45 (:247) | ✓ |
| #9 | `?t=184` (758) | 184 | 3:04 | 3:04 (:277) | ✓ |
| #10 | `?t=205` (787) | 205 | 3:25 | ca 3:25 (:306) | ✓ |
| #11 | `?t=227` (816) | 227 | 3:47 | 3:47 (:334) | ✓ |
| #12 | `?t=245` (846) | 245 | 4:05 | ca 4:05 (:365) | ✓ |

- All urls are `https://youtu.be/2DJ_oMM81mI?t=<sec>`, which is exactly the draft format (`drafts.json` `source.url`). `creator: 'Prime Coaching Sport'`. Every seed passes `sanitizeSource` (`source.ts:27-47`; test at `seedActivities.test.ts:75-84`). The render path is `SourceLine.tsx:9-19` → `blockMeta.ts:583` "Källa: {creator} · {time}" with `formatSourceTime` (`source.ts:50-58`), giving e.g. "Källa: Prime Coaching Sport · 1:39".
- *Note 3a:* the draft marks #2, #6, #8, #10, #12 as approximate ("ca …"). The app has no field for that, so it shows the plain m:ss. That is acceptable.
- **No embed:** the PR diff for `app/` has 0 hits for `iframe|embed|youtube.com|nocookie|<video|.jpg|.png|thumbnail`. `app/src`, `index.html` and `public` have no iframe/embed. The 2 `iframe` strings in `dist` are React-DOM internals (event-switch cases). `SourceLine.tsx:5,13-16` is a plain `<a target="_blank" rel="noopener noreferrer">` link. `types.ts:26` reads "Link only; never embedded". No `app/public` changes (seed-promotion.md:24, 28).
- **B1 rule still holds:** `detailCoachMeta(activity, floor)` returns `{showSource:false, showReview:false}` when `floor` (`source.ts:64-73`). `ActivityDetail.tsx:91` uses it, and `:212` renders `SourceLine` only when `coachMeta.showSource`. Golvklart passes `floor={isFloor}` (`HallBoard.tsx:788`, `isFloor` at `:122`). Tested at `source.test.ts:10-12`. Not changed in this PR.
- **Print / stationskort / Kör passet:** `rg "source|SourceLine|Källa|needsCoachReview"` over `PassPrint.tsx`, `StationDeck.tsx`, `lib/stationCards.ts`, `RunPass.tsx`, `lib/runPass.ts`, `ExportSheet.tsx`, `lib/bodyPrint.ts`, `HallChip.tsx` gives **0 matches**. `SourceLine` is used only in `ActivityDetail.tsx:212` and `ActivityTip.tsx:113`. ActivityTip is used only by `LibraryPanel.tsx:205` (Biblioteket) and `BlockCard.tsx:108` (Passbyggaren), both allowed per `source.ts:59-63`.
- **Behöver granskas badge:** `ActivityCard.tsx:28` (`activity.own && activity.needsCoachReview`), `source.ts:71` (`own === true && needsCoachReview === true`), and "Markera som granskad" at `SessionBuilder.tsx:555`. The seeds have no `own` (asserted `seedActivities.test.ts:70`), so **no badge and no review button** for these seeds. *Note 3b:* see concern C1 about `needsCoachReview: true`.

## 4. Redskap + sketches: PASS

| Draft | Draft redskap (drafts.sv.md) | Expected | Seed `defaultStationEquipment` (lines) | |
|---|---|---|---|---|
| #1 | Trampett ×1, Landningsmatta ×1 (:30) | as draft | eq-trampett×1, eq-landningsmatta×1 (540-541) | ✓ |
| #2 | Trampett, Landningsmatta + unmapped block (:64-65) | +Skumblock | eq-trampett×1, eq-skumblock×1, eq-landningsmatta×1 (572-574) | ✓ |
| #3 | Madrass + unmapped Kilmatta (:97-98) | Kilmatta+Madrass | eq-kilmatta×1, eq-madrass×1 (604-605) | ✓ |
| #5 | Landningsmatta + unmapped Räcke (:154-155) | Räcke+Landningsmatta | eq-racke×1, eq-landningsmatta×1 (634-635) | ✓ |
| #6 | Landningsmatta + unmapped Räcke (:183-184) | Räcke+Landningsmatta | eq-racke×1, eq-landningsmatta×1 (664-665) | ✓ |
| #7 | Tumblingmatta ×1 (:210) | as draft | eq-tumblingmatta×1 (694) | ✓ |
| #8 | Tumblingmatta ×1 (:240) | as draft | eq-tumblingmatta×1 (723) | ✓ |
| #9 | Landningsmatta + unmapped Bom (:270-271) | Bom+Landningsmatta | eq-bom×1, eq-landningsmatta×1 (753-754) | ✓ |
| #10 | – + unmapped Bom (:301-302) | Bom | eq-bom×1 (784) | ✓ |
| #11 | – + unmapped Rockringar (:329-330) | Rockring | eq-rockring×4 (813) | ✓ (count 4 matches the `4× Rockring` example in redskap-library.md:4) |
| #12 | Plint ×1 (:358) | Plint | eq-plint×1 (842) | ✓ |

- All piece ids are in the fixed library `EQUIPMENT_PIECES` (`equipmentPieces.ts:13,15,17,22,26,36,37,39,40,41`; Slice 30 additions at 36-41). Tested at `seedActivities.test.ts:30-38`, and the batch mapping at `:87-98`.
- *Note 4a:* `slice-30/content/redskap-library.md:11` lists "Landningar (orange låda)" as a Skumblock use. The draft (`drafts.sv.md:358-359`) and the brief both say Plint, so Plint is correct here. It's an open question for Christoffer only if he wants the soft-block look.
- **Sketches:** `StationSketch.tsx:27-43` has a sketch kind for every piece used (trampett, block, wedge, cushion, bar, beam, landing, track, hoop, plint), so every recipe draws. Station 2's order trampett → block → landningsmatta matches redskap-library.md:30.
- **Visual icons:** 11 new `visualKey`s are mapped at `icons/map.ts:46-57` to existing `IconId`s (bounce, rotate, hands-up, dumbbell, handstand, shuffle, flag, burst, arrow-up, target). The type is `Record<string, IconId>`, so ids are type-checked and present in `icons/types.ts:4-30`. Tested at `seedActivities.test.ts:69`. No image files were added.

## 5. Links: PASS

The model fields are `progressionOf` (UI "Bygger på", `blockMeta.ts:586`) and `regressionOf` (UI "Lättare variant av", `:587`). Both are single-valued (`types.ts:55-56`). `ActivityDetail.tsx:93-94,198-210` shows only the activity's own forward links and has **no reverse lookup**. No seed used links before this PR (0 occurrences at `e4f06ff`). seed-promotion.md:19 only asks that links be "rewritten to seed ids". It says nothing about reciprocity.

| From | Field (line) | To | Draft says | Resolves | Reverse side |
|---|---|---|---|---|---|
| #1 grenhopp | progressionOf (543) | tech-landning-plint | "Bygger vidare på: Landningar…" (:35) | ✓ | #12 regressionOf #1 (844) ✓ pair |
| #1 grenhopp | regressionOf (544) | tech-formhopp-over-block | "Lättare variant av: Formhopp…" (:37) | ✓ | #2 progressionOf #1 (576) ✓ pair |
| #2 formhopp | progressionOf (576) | tech-grenhopp-trampett | "Bygger vidare på: Grenhopp" (:70) | ✓ | #1 regressionOf #2 ✓ |
| #12 landning | regressionOf (844) | tech-grenhopp-trampett | "Lättare variant av: Grenhopp" (:363) | ✓ | #1 progressionOf #12 ✓ |
| #8 minihjul | regressionOf (725) | tech-hjul (468) | "Lättare variant av: Hjul" (:245) | ✓ | **one-way**: tech-hjul has no progressionOf |
| #9 soldatsparkar | progressionOf (756) | tech-balansgang (503) | "Bygger vidare på: Balansgång" (:275) | ✓ | **one-way**: tech-balansgang has no regressionOf |

- No dangling links. Tested at `seedActivities.test.ts:40-46`. The links match `drafts.json` exactly after mapping `own-trial-2dj-NN-*` to seed ids (script).
- The two one-way links point at existing seeds the PR did not touch. That's fine here: the model has no reverse display, the fields are single-valued, no seed convention needs back-links, and the process doesn't ask for them.

## 6. ownImport tests → `sameName`: PASS (justified; UX acceptable)

**Diff** (`app/src/lib/ownImport.test.ts`):
```diff
-  it('previews two new rows, default Ta med, with the batch note — and writes nothing', () => {
+  it('previews two rows, default Ta med, with the batch note — and writes nothing', () => {
-    assert.deepEqual(rows.map((r) => r.state), ['new', 'new'])
+    // Both example drills are seeds since promotion 2DJ_oMM81mI → Samma namn finns redan.
+    assert.deepEqual(rows.map((r) => r.state), ['sameName', 'sameName'])
…
-    assert.deepEqual(resolved.map((r) => r.state), ['new', 'noRoom'])
+    assert.deepEqual(resolved.map((r) => r.state), ['sameName', 'noRoom'])
-    assert.deepEqual(swapped.map((r) => r.state), ['new', 'new'])
+    assert.deepEqual(swapped.map((r) => r.state), ['sameName', 'sameName'])
```
(branch lines 97-102 and 246-251)

- **Why:** `slice-30/content/example-import.json` holds `own-imp-2dj-02-formhopp-over-block` "Formhopp över block från trampett" and `own-imp-2dj-03-aggrullning-kil` "Äggrullning nerför kil". Those titles now equal the seed titles at `seedActivities.ts:558` and `:590`.
- **Duplicate-name detection against seeds is not new.** It shipped in Slice 30 (`a252e9a`) and this PR leaves `ownImport.ts` unchanged: `ownImport.ts:223-225` builds `titles` from `[...own, ...seeds]` (trim + lowercase), and `:264,271` set `sameName` when the id is not an own id but the title matches. Default choice is still `include` (`:272`).
- **What the coach sees when importing the example now:** both rows show **Samma namn finns redan** (`blockMeta.ts:554`) with the note "Tar du med den får du två övningar med samma namn." (`blockMeta.ts:566`, `OwnImportSheet.tsx:69`). Default is **Ta med**. Choices are only **Ta med / Hoppa över** (`OwnImportSheet.tsx:218-227`); **Ersätt** appears only for `exists`, so a seed can never be replaced. The import is **not blocked**: choosing Ta med creates own copies (`own-imp-…`, "Egen" + "Behöver granskas") next to the seeds, which gives two same-named drills in Biblioteket. Re-importing after a first import still gives **Finns redan**, because `exists` takes precedence (`ownImport.ts:263-264`), so AC 24 still holds. The `'new'` state is still covered by the edge-fixture tests (`ownImport.test.ts:167,171,186`).
- **Is that reasonable UX?** Yes. It is the documented behaviour: `docs/ovningsimport.sv.md:52` ("Samma namn finns redan … Tar du med den får du två med samma namn | Ta med") and `:100` ("båda finns kvar … Byt namn med **Ändra**"), and seed-promotion.md:22 ("Own copies stay… Dedup is out of scope"). The warning is honest and the coach can skip with one tap. A small risk: a new coach might keep both. Optional follow-up for Planner: default `sameName` rows that match a *seed* to Hoppa över.
- **Docs and examples:** `docs/ovningsimport.sv.md` never promises that the example file shows **Ny** (its only "exempel" is the Källa format at `:86`), so no change is needed there. The example file is **not in the app**: there are no references in `app/src` outside tests, and nothing in `app/public`. **Stale:** `slice-30/verification-checklist.md:38` (AC 14 "both state **Ny**") and `:87` ("2 × Ny"). These are historical pack text, but a future Slice 30 re-verify would fail AC 14 as written. Suggestion: replace `example-import.json` with two titles that do not collide, or annotate AC 14. `slice-30/content/README.md:8` and `import-schema.md:4` only describe the file. `verifier/seed-2DJ_oMM81mI-smoke.md:96` (Builder) already notes the change as I1.

## 7. Build + tests: PASS

- `cd app && npm run build` (`tsc -b && vite build`) → exit 0, 79 modules, `dist/assets/index-U5iqTlxx.js` 446.24 kB (gzip 132.09 kB).
- `bun test src` → **57 pass / 0 fail**, 11 files (including the 6 new `seedActivities.test.ts` cases).
- `git status` is clean afterwards.

## Seed-promotion rule checklist

| Rule (seed-promotion.md) | Status |
|---|---|
| :10 block-prefixed unique `tech-…` ids | ✓ |
| :11 `needsCoachReview:false` only for text approved word-for-word | ⚠ all `true`; text is word-for-word approved (C1) |
| :12 newCoachOk / experiencedCoachOnly explicit | ✓ (true/false on all 11) |
| :9-13 `promote.json` + `check_import.py` | ⚠ no promote.json (C2) |
| :16 `source` {url, creator, title, startSeconds} | ✓ |
| :17 safety in `ACTIVITY_SAFETY`, `validateTipCatalog` clean | ✓ `activityTips.ts:78-100` |
| :18 `new-coach-ok` + zone tags | ✓ trampett (#1, #2), floor (#7, #8, #11) |
| :19 fixed-library redskap; links → seed ids | ✓ |
| :20 header count | ✓ `seedActivities.ts:7` |
| :21 build + tests green | ✓ |
| :23 Källa shown; tips valid; no copied captions; no images in app/public | ✓ (text equals own-words drafts; no public changes) |
| :27-29 own words; no frames in app/; one video, one PR | ✓ |
