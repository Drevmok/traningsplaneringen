# Slice 30 — code evidence

**Branch/HEAD:** `slice-30-ovningsimport` / `a252e9a`  
**Base used for scope:** `8be982d` (parent of `68b9645`).  
**Method:** read-only source/diff inspection. The requested build and test results are cited as supplied: `npm run build` exit 0; `cd app && bun test src` 46 pass / 0 fail (logs `/tmp/s30-build.log`, `/tmp/s30-test.log`).

## Acceptance criteria

| AC | code verdict | file:line citations + one-line explanation |
|---:|---|---|
| 1 | PASS | `app/src/types.ts:25-34,36-67`; `app/src/lib/source.ts:25-44` — `ActivitySource` is optional on `Activity`, with `url`, `creator`, optional `title`/`startSeconds`; sanitizer is used for own data. |
| 2 | PASS | `app/src/components/ActivityDetail.tsx:193-207`; `app/src/components/ActivityTip.tsx:77-114` — detail and pass-row info body render one `SourceLine`; `SourceLine:7-10` returns null without a valid source/time. |
| 3 | PASS | `app/src/components/SourceLine.tsx:7-21`; `app/src/lib/source.ts:12-22` — only sanitized `https://` reaches the `<a>`, which has `target="_blank"` and `rel="noopener noreferrer"`. |
| 4 | PASS (code) | `SourceLine.tsx:5-6,11-23` has only text/link DOM; required grep counts are below: no iframe, `<video`, youtube, remote `<img>` source, `XMLHttpRequest`, or API-key match. (No separate browser DOM run was needed for this code check.) |
| 5 | FAIL | `app/src/components/HallBoard.tsx:646-665,784-795` opens `ActivityDetail` from the `Golvklart` floor canvas; `ActivityDetail.tsx:207` unconditionally renders `SourceLine`. `StationDeck.tsx:41-56`, `RunPass.tsx:144-200`, and `PassPrint.tsx:18-53,62-121` do not import/render `SourceLine`; thus only the Golvklart detail path violates the exclusion. |
| 6 | PASS | `app/src/lib/ownActivities.ts:44-62,353-373`; `app/src/lib/sharePass.ts:51-82,85-87`; `app/src/lib/sharePass.test.ts:138-200` — own share/pass data carries source and new optional fields, and the receiver round-trip is tested. |
| 7 | PASS | `app/src/lib/ownActivities.ts:152-207`; `app/src/lib/ownImport.test.ts:108-136` — sanitizer retains tags, difficulty, links, review, experienced flag, source and Teknik redskap through storage/reload. |
| 8 | PASS | `app/src/lib/ownActivities.ts:255-289` spreads the existing activity before form fields; `:268-270` forces `needsCoachReview: false`; hidden fields are re-sanitized in `:201-206`. |
| 9 | PASS | `app/src/components/OwnActivityForm.tsx:142-166,195-205`; `app/src/lib/ownActivities.ts:127-135,267` — picker is conditional on `techniques`, and sanitizer drops equipment for other blocks on save. |
| 10 | PASS | `app/src/components/ActivityDetail.tsx:68-93,209-237`; `app/src/components/HallBoard.tsx:798-807`; `app/src/lib/hallSuggest.ts:48-60` — detail shows suggested redskap/sketch and Hallöversikt can apply it; `hallSuggest.test.ts:103-117` covers the new zone cases. |
| 11 | PASS | `app/src/lib/ownActivities.ts:15,17-26,89-105,144-149`; `app/src/data/activityTips.ts:87,115-118`; `blockMeta.ts:515` — cap is 100, form validation and floor-tip validation remain four steps, and import normalizes/clips to four. |
| 12 | PASS | `app/src/components/ActivityDetail.tsx:88-89,193-205`; `app/src/data/seedActivities.ts:801-803` — resolved seed/own ids render `Bygger på` / `Lättare variant av`; unresolved ids render no line. |
| 13 | PASS | `app/src/components/LibraryPanel.tsx:131-145`; `app/src/components/OwnImportSheet.tsx:120-180` — Bibliotek has **Ny egen övning** and **Importera övningar**, with **Välj fil**, paste box, and **Läs in**. |
| 14 | PASS | `app/src/lib/ownImport.test.ts:96-106` — fixture preview is two `new` rows, default `include` (UI **Ta med**), batch note present, and no storage write. |
| 15 | PASS | `app/src/components/OwnImportSheet.tsx:96-116,126-138,242-254`; `app/src/lib/ownImport.ts:208-220,322-340` — parse/preview only reads; only **Importera** calls `applyImport`; **Avbryt**/× calls `onClose` only. |
| 16 | PASS | `app/src/components/SessionBuilder.tsx:104-106,247-250,514-541,603-613`; `LibraryPanel.tsx:165-178` — imported own list is reloaded, cards have **Egen**/review state, block filtering and normal add/detail flow. |
| 17 | PASS | `app/src/lib/ownImport.ts:208-220`; `app/src/components/OwnImportSheet.tsx:29-34`; `app/src/lib/ownImport.test.ts:59-85` — bad/newer/empty/pass reasons map to `ownImportBad`, `ownImportNewer`, `ownImportEmpty`, `ownImportIsPass`. |
| 18 | PASS | `app/src/components/Home.tsx:41-55`; `app/src/components/ExportSheet.tsx:80-93` — both exercise-file paths set `UI.importIsExercises` and return before `sessionFromTransfer`/draft replacement. |
| 19 | PASS | `app/src/lib/ownImport.test.ts:159-169` — edge row 01 is importable, records unknown `eq-ringar`, and retains only `eq-trampett`. |
| 20 | PASS | `app/src/lib/ownImport.test.ts:170-173`; `ownImport.ts:139-146,180-205` — edge row 02 is importable, emits `steps`, and stores exactly four normalized steps. |
| 21 | PASS | `app/src/lib/ownImport.test.ts:174-191` — rows 03/04/07 are invalid for missing safety, duplicate id, and bad id respectively; row 03 has `säkerhet` missing. |
| 22 | PASS | `app/src/lib/ownImport.test.ts:179-183`; `ownImport.ts:163-177` — row 05 is same-name and drops unresolved progression/source (`http`) with notes. |
| 23 | PASS | `app/src/lib/ownImport.test.ts:185-188`; `ownImport.ts:148-160,191-200` — warmup+kon row is importable, redskap is dropped, and explicit `needsCoachReview: false` remains absent. |
| 24 | PASS | `app/src/lib/ownImport.test.ts:138-156`; `ownImport.ts:263-274,298-315`; `ownActivities.ts:315-328` — re-import defaults to **Hoppa över**; **Ersätt** replaces the same id in place. |
| 25 | PASS | `app/src/lib/ownImport.ts:277-283,298-315`; `app/src/lib/ownImport.test.ts:222-250` — room is `100 − own.length`, consumed in file order, and 99-own yields first `new`, second `noRoom` / **Ingen plats**. |
| 26 | PASS | `app/src/lib/ownImport.ts:128-146,180-205`; `app/src/lib/ownImport.test.ts:201-219` — title/text/step clips and `clipped` maps to **Förkortad**; step count remains four. |
| 27 | PASS | `app/src/components/ActivityCard.tsx:24-31`; `app/src/components/ActivityDetail.tsx:87,120-145`; `SessionBuilder.tsx:554-558` — card/detail require own+review, and Passbyggaren supplies hint/button. |
| 28 | PASS | `app/src/lib/ownActivities.ts:268-270,292-303`; `app/src/lib/ownActivities.test.ts:181-214` — edit clears the flag and `markOwnReviewed` deletes it then writes storage; test checks persistence/no flag. |
| 29 | FAIL | `app/src/components/ActivityCard.tsx:27-30` and `ActivityDetail.tsx:87,126` enforce own-only, while `StationDeck.tsx:41-56`, `RunPass.tsx:144-200`, `PassPrint.tsx:18-53,62-121` omit the badge; however the `Golvklart` chip opens `HallBoard`’s `ActivityDetail` (`HallBoard.tsx:646-665,784-795`), so the badge is visible there. |
| 30 | PASS | `app/src/data/equipmentPieces.ts:12-42,44-56` — catalog has 15 entries; after `eq-kon` the exact ids/labels are Kilmatta, Skumblock, Bom, Räcke, Rockring; test: `ownedEquipment.test.ts:24-37`. |
| 31 | FAIL | `app/src/components/equipmentMark.tsx:91-107,265-293` covers all new kinds/icons; compose/detail use `EquipmentIcon` (`StationComposeSheet.tsx:8-15,245-265`; `ActivityDetail.tsx:218-225`), but `ForradslistaSheet.tsx:77-83,89-105` is text-only and `StationDeck.tsx:52-54`/`PassPrint.tsx:32-34` use `StationSketch`, not icon lists. This is also the pre-slice state: `git show 68b9645^:.../ForradslistaSheet.tsx` has text-only rows and `StationDeck.tsx` has `StationSketch` only. |
| 32 | PASS | `app/src/components/StationSketch.tsx:13-48`; `equipmentMark.tsx:74-106,213-263` — all five new kinds are mapped/drawn; expand order is airtrack, tumblingmatta, madrass, Kilmatta, satsbräda, trampett, Skumblock, flickiskudde, plint, mattberg, Räcke, Bom, landningsmatta, kon, Rockring, matching `redskap-library.md:23-33`. |
| 33 | PASS | `app/src/lib/hallSuggest.ts:6-23,39-60`; `app/src/lib/hallSuggest.test.ts:103-117` — `PIECE_ZONE` order and tests prove kilmatta+madrass→`mats`, räcke+matta/bom→`open`, trampett+skumblock→`trampett`. |
| 34 | PASS | `app/src/data/equipmentPieces.ts:159-199`; `app/src/components/ForradslistaSheet.tsx:86-105`; `ownedEquipment.test.ts:24-37` — aggregation follows catalog order after Kon and owned toggles iterate all 15 (labels only, no icon requirement here). |
| 35 | PASS | `app/src/lib/ownedEquipment.ts:4-6,13-24,34-57,79-88`; `LibraryPanel.tsx:60-65`; `ownedEquipment.test.ts:41-68` — old ten migrate to 15 and write seen ids; later unticks stick; `loadTonightFilter()` returns the saved/null value and caller defaults on only when `!ownsEveryPiece`, so migrated 15 cannot auto-enable it. |
| 36 | UI-only | `app/src/components/StationComposeSheet.tsx:243-263`; `app/src/App.css:2801-2808,2903-2915` — 15 tiles are a responsive grid and the sheet scrolls vertically; a 390 px no-horizontal-scroll result needs a browser measurement, not source-only proof. |
| 37 | PASS | `slice-30/content/seed-promotion.md:1-23` exists and is linked in `slice-30/HANDOFF.md:20-24`; no `seedActivities.ts` diff in the slice scope. |
| 38 | PASS | `app/src/types.ts:25-34,65-66`; `ActivityDetail.tsx:207`; `SourceLine.tsx:7-21` — seed-capable `Activity.source` is typed and conditionally rendered when present; no seed source was added in this slice. |
| 39 | PASS | `app/src/lib/sharePass.test.ts:202-233`; `app/src/lib/ownActivities.ts:345-350` — old pass JSON without Slice 30 fields parses and old own drills still sanitize/save. |
| 40 | PASS | `app/src/lib/hall.ts:106-112` is unchanged from the base; `app/src/components/HallBoard.tsx:671`; `app/src/data/blockMeta.ts:254` retains `Schematisk hall — inte exakt mått`. |
| 41 | PARTIAL | Legacy files are untouched in the slice diff (`wizardPaths.ts`, `wizard.ts`, `HomeWizard.tsx`, `session.ts`, `savedTemplates.ts`, `coachTips.ts`), but the shipped notes say **Kör passet**, print, QR fallback and some receive paths were not smoke-driven (`app/SLICE30-SHIPPED.md:80-85`); code evidence alone cannot establish every regression behavior. |
| 42 | PASS | `app/src/data/blockMeta.ts:475`; `app/src/App.tsx:312-316`; built `app/dist/assets/index-BWoepAo-.js` contains the exact string `Träningsplaneraren · Slice 30`. |
| 43 | PASS (supplied run) | Supplied evidence: `npm run build` exit 0 and `cd app && bun test src` 46 pass / 0 fail across 9 files (`/tmp/s30-build.log`, `/tmp/s30-test.log`). |
| 44 | PASS | Forbidden-content grep results below: no in-app AI/API keys/YouTube/social/video embed; the sole `fetch(` is `app/src/lib/appUpdate.ts:26`, a generic app-update request, not a YouTube/social/video fetch. |

## Required grep evidence (run at HEAD)

Commands and hit counts:

```sh
rg -ni 'iframe' app/src                                      # 0
rg -ni '<video' app/src                                     # 0
rg -ni 'youtube' app/src                                    # 0
rg -n  'fetch\(' app/src                                    # 1
rg -n  '<img[^>]+src=["\x27]https?://' app/src             # 0
rg -ni 'XMLHttpRequest' app/src                             # 0
rg -ni 'api[_ -]?key|apikey|apiKey|OPENAI|YOUTUBE.*KEY|GOOGLE.*KEY' app/src # 0
```

The one `fetch(` match is `app/src/lib/appUpdate.ts:26`; `App.tsx:83-98` calls it for the existing remote-build update check. There are no source-line matches for the other patterns.

## Review-badge exact condition and seed inventory

- `ActivityCard.tsx:28-30`: `activity.own && activity.needsCoachReview`.
- `ActivityDetail.tsx:87`: `const needsReview = activity.own === true && activity.needsCoachReview === true`; render at `:126`, hint/button at `:134-145`.
- Seed entries with `needsCoachReview: true`: `gather-narvaro` (`seedActivities.ts:32-48`), `gather-dagens-teknik` (`:51-68`), `warm-hall-varv` (`:108-125`), `warm-123-voltpositioner` (`:147-164`), and `fun-maffia` (`:689-706`). They have no `own: true`, so the own-only conditions prevent a badge.

## Builder deviations 1–10: factual code check

| # | code location | factual note |
|---:|---|---|
| 1 | `ownImport.ts:277-283,298-315`; `blockMeta.ts:707-709` | True: room/counter is pre-import `100 − own count`; resolution consumes it in file order. |
| 2 | `Home.ts:41-45`; `ExportSheet.ts:80-84` | True: Exportera/dela’s file receive path also reports `importIsExercises` and does not add a second copy/path. |
| 3 | `StationComposeSheet.tsx:18-26,124-138`; `OwnActivityForm.tsx:195-205` | True: form picker reuses `StationComposeSheet` with optional title/backdrop rather than a new picker component. |
| 4 | `OwnImportSheet.tsx:149-157,174-180` | True: file selection reads/parses immediately; pasted text still needs **Läs in**. |
| 5 | `App.css:2858-2864` | True: recipe labels use `min-width: 0` and `overflow-wrap: anywhere`; the CSS comment identifies the 390 px overflow fix. |
| 6 | `HallBoard.tsx:784-795`; `ActivityDetail.tsx:126,134-145` | True as stated: hall read-only detail shows the badge but does not pass `onMarkReviewed`, so hint/button are absent there; this is an AC 5/29 discrepancy because it is reachable from `Golvklart`. |
| 7 | `source.ts:29-43` | True: creator clips to 80, invalid time is omitted, and invalid URL/creator makes the source absent. |
| 8 | `ownActivities.ts:108-121` | True: up to eight non-`egen` file tags are retained, then `egen` is appended (maximum nine total). |
| 9 | `ownImport.ts:328-337`; `ActivityDetail.tsx:88-89,193-205` | True: skipped/unresolvable links are dropped at write time and unresolved render links are hidden. |
| 10 | `SessionBuilder.tsx:585-588`; `HallBoard.tsx:832-835` | True: builder and hall toasts have `role="status"`; code applies it beyond only the newly introduced toast strings. |

## Diff scope

Command: `git diff --stat 8be982d..HEAD -- app/src`  
Result: **28 files, 2,114 insertions, 58 deletions** (the Slice 30 source/test additions and touched UI listed by Git; no product files outside `app/src` considered here).

The following were checked unchanged against the base: `app/src/data/activityTips.ts` (`MAX_FLOOR_STEPS = 4`), `app/src/lib/hall.ts` placement rules, `app/src/data/seedActivities.ts` content, `app/src/components/HomeWizard.tsx`, `app/src/lib/wizard.ts`, `app/src/lib/wizardPaths.ts`, and the existing session/template/tips paths. The current branch remained `slice-30-ovningsimport` at `a252e9a`; no branch switch, commit, push, or product-file edit was performed.
