# Slice 30 — Builder self-smoke (Övningsimport)

Date: 2026-10-02 12:23 (Europe/Stockholm)  
Build: `npm run build` green, served with `npm run preview` → http://127.0.0.1:4173/traningsplaneringen/ (doctor HTTP 200, base path OK)  
Driver: headless Chrome 151 via playwright-core, fresh browser profiles, coach path by visible Swedish labels / roles (script: `verifier/slice-30-builder-smoke.mjs`, raw results: `verifier/slice-30-smoke-results.json`)  
Viewport: 390×844 phone (+ one 1280×900 desktop check)  
Authority: `slice-30/verification-checklist.md` (AC ids in brackets) · skill `verify-traningsplaneraren/`  
Screenshots: `/workspace/screenshots/slice30_*.png`

## Result: **PASS 82 / FAIL 0**

| AC | Check | Result | Detail |
|---|---|---|---|
| 42 | Footer reads Träningsplaneraren · Slice 30 | PASS | Träningsplaneraren · Slice 30 · Visa tips igen · Uppdatera appen |
| 13a | Bibliotek shows Ny egen övning + Importera övningar side by side | PASS |  |
| 13b | Sheet has Välj fil + Klistra in kod + Läs in | PASS |  |
| 14a | File → 2 rows, both Ny, default Ta med, batch note on top | PASS | states=Ny,Ny choices=Ta med,Ta med room="Plats för 100 till" |
| 15a | Nothing written before Importera | PASS |  |
| 15b | Avbryt leaves own list unchanged | PASS |  |
| 14b | Paste (fenced ```json) → 2 rows Ny | PASS |  |
| 14c | Primary reads Importera 2 övningar | PASS |  |
| 16a | Toast after import | PASS | 2 övningar importerade. Läs igenom dem före passet. |
| 16b | Both drills stored | PASS |  |
| 16c | Card shows Egen + Behöver granskas | PASS | Egen\|Behöver granskas |
| 16d | Filterable by block (Teknik shows imported drill) | PASS |  |
| 29a | Seed card has no review badge | PASS |  |
| 29b | Seed Närvaro (needsCoachReview seed) has no badge | PASS |  |
| 2a | Detail Källa line | PASS | Källa: Prime Coaching Sport · 0:30 ↗ |
| 3a | Link → https url, new tab, noopener noreferrer | PASS | aria="Öppna ”Fun gymnastics stations” hos Prime Coaching Sport i en ny flik" |
| 12a | Bygger på resolves to seed title | PASS | Bygger på: Ljushopp på trampett |
| 27a | Detail badge + hint + Markera som granskad | PASS |  |
| 32a | Sketch drawn for trampett → skumblock → landningsmatta | PASS |  |
| 4a | No iframe/video/img for source in DOM | PASS |  |
| 29c | Badge does not block adding to a pass | PASS |  |
| 12b | Lättare variant av: Kullerbytta framåt | PASS | Lättare variant av: Kullerbytta framåt |
| 2b | Äggrullning Källa · 0:50 | PASS | Källa: Prime Coaching Sport · 0:50 ↗ |
| 28a | Markera som granskad → badge gone + toast | PASS | Markerad som granskad. |
| 28b | After reload: Äggrullning badge gone, Formhopp still flagged | PASS |  |
| 9a | Form shows Redskap chips for a Teknik drill | PASS | Trampett\|Skumblock\|Landningsmatta |
| 9b | Redskap chips draw icons | PASS |  |
| 9c | Redskap field hidden when block ≠ Teknik | PASS |  |
| 9d | Picker titled Välj redskap | PASS |  |
| 30a | Picker grid has 15 tiles, new five after Kon | PASS | Trampett\|Satsbräda\|Plint\|Landningsmatta\|Tumblingmatta\|Madrass\|Mattberg\|Flickiskudde\|Airtrack\|Kon\|Kilmatta\|Skumblock\|Bom\|Räcke\|Rockring |
| 31a | Every tile has an icon (no blank tiles) | PASS |  |
| 36a | 15-tile grid fits 390 px without horizontal scroll | PASS | {"doc":390,"win":390,"sheet":0} |
| 9e | Picked redskap shows as chip (2× Rockring) | PASS | Trampett\|Skumblock\|Landningsmatta\|2× Rockring |
| 28c | Saving via Ändra clears Behöver granskas | PASS |  |
| 8a | Edit preserved tags/difficulty/links/source | PASS | {"tags":["teknik","trampett","hopp","former","landning","egen"],"src":{"url":"https://youtu.be/2DJ_oMM81mI?t=30","creator":"Prime Coaching Sport","title":"Fu… |
| 9f | Chosen pieces saved to defaultStationEquipment | PASS |  |
| 9g | New form defaults: Inga redskap valda. | PASS |  |
| 9h | New Teknik drill saves Bom + Räcke | PASS |  |
| 32b | Sketch draws räcke + bom | PASS |  |
| 9i | Moving the drill off Teknik and saving clears redskap | PASS |  |
| 2c | Pass-row info panel ends with the Källa line | PASS | Källa: Prime Coaching Sport · 0:30 ↗ |
| 29d | No review badge on pass rows | PASS |  |
| 40a | Caption Schematisk hall — inte exakt mått | PASS |  |
| 10a | Own drills auto-placed: Formhopp → trampett, Äggrullning → mats | PASS | formhopp=trampett agg=mats |
| 40b | Samling never placed on the hall | PASS |  |
| 10b | Använd alla förslag uses own drills' redskap (2 stationer) | PASS |  |
| 34a | Förrådslista sums new pieces in library order (after the first ten) | PASS | Trampett · Landningsmatta · Madrass · Kilmatta · Skumblock · 2× Rockring |
| 34b | Owned toggles list 15 | PASS | checkboxes=15 |
| 5a | Golvklart / stationskort show no Källa and no Behöver granskas | PASS |  |
| 31b | Stationskort sketch present for own drill with new redskap | PASS |  |
| 6a | Pass JSON carries source + redskap + tags for own drills | PASS | saved to verifier/slice-30-pass-export.json |
| 6b | Receiving device (2nd profile) shows the same Källa line | PASS | Källa: Prime Coaching Sport · 0:50 ↗ |
| 6c | Received own drills saved with source + redskap | PASS |  |
| 19a | Row 01 importable + Okänt redskap togs bort: eq-ringar | PASS |  |
| 20a | Row 02 importable + Högst fyra steg | PASS |  |
| 21a | Row 03 Kan inte importeras · Saknar säkerhet. | PASS |  |
| 21b | Row 04 dup id → Kan inte importeras | PASS |  |
| 22a | Row 05 Samma namn finns redan + link + source notes | PASS |  |
| 23a | Row 06 importable, redskap dropped (not Teknik) | PASS |  |
| 21c | Row 07 BAD-ID → Kan inte importeras · fel format | PASS |  |
| 19b | Saved row 01 redskap = trampett only | PASS |  |
| 20b | Saved row 02 howTo has exactly 4 steps | PASS |  |
| 23b | Row 06 no review badge (needsCoachReview:false honoured) | PASS |  |
| 24a | Re-import → both Finns redan, default Hoppa över | PASS |  |
| 24b | Nothing chosen → Välj minst en övning först (disabled) | PASS |  |
| 24c | Ersätt shows its note | PASS |  |
| 24d | Ersätt updates in place (same id) and the pass shows the new text | PASS | 1 övning importerad. Läs igenom den före passet. |
| 17a | bad / newer / empty / isPass messages | PASS | Filen eller koden gick inte att läsa. \| Filen kommer från en nyare version av appen. Uppdatera appen och försök igen. \| Det finns inga övningar i filen. \|… |
| 25a | With 99 own: first importable, second Ingen plats, Plats för 1 till | PASS | Ny,Ingen plats · Plats för 1 till |
| 25b | Import fills to exactly 100 | PASS |  |
| 11b | Five steps still rejected (Högst fyra) | PASS |  |
| 11a | 101st save → Du har 100 egna övningar. Ta bort en först. | PASS |  |
| 25c | At 100: room line reads ownImportRoomNone | PASS |  |
| 18a | Home shows importIsExercises; draft untouched | PASS | Det här är övningar. Importera dem under Bibliotek → Importera övningar. |
| 35a | Old explicit 10-list: tonight filter does NOT switch on | PASS |  |
| 35b | After upgrade all 15 owned + seen key written | PASS | owned=15 |
| 34c | Owned toggles include the new pieces, ticked | PASS |  |
| 35c | Unticking Bom sticks after reload | PASS | owned=14 |
| 41a | Planera pass wizard → five blocks filled, Teknik pre-placed (trampett zone) | PASS | filled=5 zones=trampett,trampett,open |
| 41b | Soft Samling on blank Tomt pass | PASS | Närvaro \| Dagens pass — snabb genomgång |
| 41c | Starta från mall → pass with items | PASS | items=9 |
| 13c | Desktop: Importera övningar in the side library, preview renders | PASS |  |

## Also verified outside the browser

- `bun test src` (runs the `node:test` suites; Node 20 on the box cannot strip TS types) — **46 pass / 0 fail** across 9 files incl. new `ownImport.test.ts`, `ownedEquipment.test.ts` and extended `ownActivities` / `sharePass` / `hallSuggest` tests (AC 43).
- `tsc` over `src` **including** test files — clean.
- `python3 slice-30/content/check_import.py example-import.json` → PASS; `… example-import-edge.json` → CHECK (expected: rows 03, 04, 07 invalid, same verdicts as the app).
- AC 44 grep (`fetch(`, `iframe`, `<video`, `youtube`, `oembed`, `apiKey`) in `app/src` (non-test): only the pre-existing `appUpdate.ts` fetch of `version.json`. No video/social calls, no embed.
- AC 30 / 33 / 35 also unit-tested (`ownedEquipment.test.ts`, `hallSuggest.test.ts`).

## Notable findings

- **Pre-existing layout bug fixed:** in Redigera redskap / Välj redskap, a recipe row with *Landningsmatta* pushed the × button 14 px past a 390 px sheet (horizontal scroll). Reproduced with old pieces only, so not caused by the new five. Fixed with `min-width: 0; overflow-wrap: anywhere` on `.station-compose-recipe-label`. After the fix, AC 36 passes with a 4-piece recipe and 15 tiles.
- The Hallöversikt / Exportera buttons sit in the **Mer** menu at 390 px (unchanged Slice 22 chrome). The smoke drives them through the menu.
- Draft persistence is unchanged: own drills/imports persist right away; the pass itself still needs **Spara utkast** (or opening the hall) before a reload, same as before.

## Smoke gaps

- Real phone / iOS Safari not driven (headless Chrome only).
- Print (PassPrint) not opened; badge/Källa are not rendered by print components (code check: `PassPrint`, `StationDeck`, `RunPass` untouched).
- Kör passet not opened in this smoke (component untouched; Golvklart deck checked for no Källa/badge).
- *Importera fil* in Exportera / dela with an exercise file (shows `importIsExercises`) is code-identical to Home but was not clicked.
- QR fallback with long own-drill links not exercised.

## Log

- doctor status 200
- shot /workspace/screenshots/slice30_home.png
- shot /workspace/screenshots/slice30_footer.png
- shot /workspace/screenshots/slice30_library_entry.png
- shot /workspace/screenshots/slice30_import_preview_file.png
- shot /workspace/screenshots/slice30_import_preview_paste.png
- shot /workspace/screenshots/slice30_library_badges.png
- shot /workspace/screenshots/slice30_detail_formhopp.png
- shot /workspace/screenshots/slice30_detail_aggrullning_kil_sketch.png
- shot /workspace/screenshots/slice30_marked_reviewed.png
- shot /workspace/screenshots/slice30_form_redskap.png
- shot /workspace/screenshots/slice30_picker_15_tiles.png
- shot /workspace/screenshots/slice30_sketch_bom_racke.png
- shot /workspace/screenshots/slice30_tip_source_line.png
- shot /workspace/screenshots/slice30_hall_autoplaced.png
- shot /workspace/screenshots/slice30_forradslista.png
- shot /workspace/screenshots/slice30_golvklart_sketch.png
- shot /workspace/screenshots/slice30_export_share.png
- shot /workspace/screenshots/slice30_share_received_source.png
- edge rows [{"title":"Okänt redskap tas bort","state":"Ny","locked":false,"notes":["Okänt redskap togs bort: eq-ringar"]},{"title":"Fem steg blir fyra","state":"Ny","locked":false,"notes":["Högst fyra steg. Resten togs bort."]},{"title":"Saknar säkerhet","state":"Kan inte importeras","locked":true,"notes":["Saknar säkerhet."]},{"title":"Dubbel id i filen","state":"Kan inte importeras","locked":true,"notes":["Samma övning finns två gånger i filen."]},{"title":"Kullerbytta framåt","state":"Samma namn finns redan","locked":false,"notes":["Kopplingen till en annan övning togs bort.","Källan togs bort. Den behöver en https-länk och ett namn.","Tar du med den får du två övningar med samma namn."]},{"title":"Redskap utanför Teknik","state":"Ny","locked":false,"notes":["Redskapen togs bort. De används bara i Teknik."]},{"title":"Fel id-format","state":"Kan inte importeras","locked":true,"notes":["Övningen har fel format."]}]
- shot /workspace/screenshots/slice30_import_edge.png
- shot /workspace/screenshots/slice30_import_replace.png
- shot /workspace/screenshots/slice30_import_error_ispass.png
- shot /workspace/screenshots/slice30_import_cap_99.png
- shot /workspace/screenshots/slice30_own_full_100.png
- shot /workspace/screenshots/slice30_home_is_exercises.png
- shot /workspace/screenshots/slice30_migration_tonight_off.png
- shot /workspace/screenshots/slice30_migration_owned_toggles.png
- shot /workspace/screenshots/slice30_regress_wizard.png
- shot /workspace/screenshots/slice30_regress_soft_blank.png
- shot /workspace/screenshots/slice30_regress_mall.png
- shot /workspace/screenshots/slice30_desktop_import_preview.png

---

## B1 fix re-smoke (2026-10-02, after verify 304d2f0)

**Fix:** `ActivityDetail` takes `floor` (HallBoard passes `floor={isFloor}`); `detailCoachMeta(activity, floor)` in `lib/source.ts` hides the Källa line and the Behöver granskas badge (+ hint/button) on Golvklart. Biblioteket, Passbyggaren and Hallöversikt edit mode are unchanged. Unit test: `lib/source.test.ts` (3 tests). `bun test src` 49/0, `npm run build` green.

**Smoke** (`node verifier/slice-30-fix-b1-smoke.mjs`, headless Chrome 390×844, local preview; own drill "Formhopp över block från trampett" imported from `example-import.json`: source Prime Coaching Sport · 0:30, needsCoachReview, Teknik, auto-placed on the hall): **PASS 11 / FAIL 0**

| ID | Check | Result |
| --- | --- | --- |
| F1 | Footer still `Träningsplaneraren · Slice 30` | PASS |
| S0 | Own drill stored with source + needsCoachReview, Teknik | PASS |
| L1 | Bibliotek detail: Källa line + badge still shown | PASS |
| E1 | Hallöversikt edit detail: `Källa: Prime Coaching Sport · 0:30 ↗` | PASS |
| E2 | Hallöversikt edit detail: Behöver granskas badge | PASS |
| G0 | Golvklart chip opens the Formhopp detail | PASS |
| G1 | Golvklart detail: no Källa line | PASS |
| G2 | Golvklart detail: no badge / hint / Markera som granskad | PASS |
| G3 | Golvklart detail still shows Redskap + sketch | PASS |
| E3 | After Avsluta golvklart, edit detail shows Källa + badge again | PASS |
| P | No page errors | PASS |

Screenshots: `slice30_fix_bibliotek_detail.png`, `slice30_fix_hall_edit_detail.png`, `slice30_fix_golvklart.png`, `slice30_fix_golvklart_detail.png`, `slice30_fix_hall_edit_detail_after.png` (in `/workspace/screenshots/`). Results: `verifier/slice-30-fix-b1-results.json`.
