# Slice 30 — Formal verification report (Övningsimport)

**Date:** 2026-10-02 ~14:40 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `slice-30/verification-checklist.md` (44 ACs) + locked A1/B3/C1/D1/E1/F1 (`slice-30/decisions.md`)  
**Code under test:** PR #31, branch `slice-30-ovningsimport`, SHA `a252e9a` (checked out locally, **not merged, nothing pushed to main**)  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Build/tests:** `npm run build` exit 0 · `bun test src` **46 pass / 0 fail** (9 files)  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages not required)  
**Evidence:** `slice-30-evidence-code.md` (file:line per AC) · Builder `slice-30-builder-smoke.md` · screenshots `/workspace/screenshots/slice30v_{A,B,C}_*.png` · fixtures `/workspace/s30-fixtures/`  
**Ship notes:** `app/SLICE30-SHIPPED.md` · **Docs:** `docs/ovningsimport.sv.md`, `slice-30/content/microcopy.sv.md`  
**Viewport:** DevTools responsive 400×569 (screen-limited height); compose sheet measured at 390 px.

---

## Overall verdict: **FAIL — 1 blocking item (small)**

| Section | Verdict |
| --- | --- |
| F1 Källa (AC 1–6) | **FAIL** on AC 5 (Golvklart detail) · rest PASS |
| B/E1 own fields (AC 7–12) | **PASS** |
| A1/B3 Import (AC 13–26) | **PASS** |
| D1 Behöver granskas (AC 27–29) | **FAIL** on AC 29 (Golvklart detail) · 27–28 PASS |
| C1 Redskap (AC 30–36) | **PASS** (AC 31 overturned → PASS-with-note) |
| Seed path + preserve (AC 37–44) | **PASS** |

### Blocking item

**B1 — Golvklart shows Källa and the Behöver granskas badge.** In Golvklart (`hallMode === 'floor'`), tapping a station chip opens `ActivityDetail` (`HallBoard.tsx:654-658`, `784-795`). That component renders `SourceLine` unconditionally (`ActivityDetail.tsx:207`) and the own-drill review badge (`ActivityDetail.tsx:126`). Drive: Äggrullning detail from Golvklart showed `Källa: Prime Coaching Sport · 0:50 ↗`; "Okänt redskap tas bort" showed **Behöver granskas** (`slice30v_B_golvklart_detail_okant.png`, `slice30v_B_golvklart_detail_agg.png`).  
Violates lock **D1** ("not shown on Golvklart / stationskort / Kör passet / print"), **AC 29** and **AC 5** ("Källa is not shown on Golvklart"). Builder's deviation 6 discloses the hall-detail badge, but not that it also appears in Golvklart.  
**Fix (small):** hide the badge and Källa line in the hall detail when `isFloor`; Hallöversikt edit mode may keep them. Alternative: Christoffer explicitly accepts this as a deviation. Either way, AC 5 and AC 29 then pass, and nothing else blocks.

---

## Acceptance criteria

| AC | Result | Evidence |
| --- | --- | --- |
| 1 | PASS | `ActivitySource` / `Activity.source?` in `types.ts`; `sanitizeSource` (`lib/source.ts`). |
| 2 | PASS | Detail: `Källa: Prime Coaching Sport · 0:30 ↗` (Formhopp) and `· 0:50` (Äggrullning). The pass-row info panel shows the same line (Äggrullning ERSATT check). Drills without a source show nothing (edge-01). |
| 3 | PASS | Inspected: `href=https://youtu.be/2DJ_oMM81mI?t=30`, `target=_blank`, `rel=noopener noreferrer`; https only (http source dropped with a note, edge row 05). |
| 4 | PASS | No iframe, video or thumbnail in the DOM; greps in `app/src` (`iframe`, `<video`, `youtube`, `fetch(`) show no embed or fetch (evidence-code). |
| 5 | **FAIL** | Stationskort, Kör passet and print have no Källa (`slice30v_B_stationskort/korpasset/print_preview.png`), **but the detail opened from Golvklart shows Källa** → B1. |
| 6 | PASS | `ShareOwn` carries `source` + new optional fields (`ownActivities.ts`, `sharePass.ts:51-87`; `sharePass.test.ts:138-200`). Drive C: share link opened in a fresh incognito profile → **Spara på den här enheten** → Formhopp/Äggrullning arrive as **Egen** with `Källa: Prime Coaching Sport · 0:30 ↗` / `· 0:50 ↗` (`slice30v_C_receive_info.png`, `slice30v_C_receive_detail.png`). |
| 7 | PASS | Stored Formhopp after reload: `tags` (+`egen`), `progressionOf`, `source` intact; edge-01 `defaultStationEquipment` = trampett only. |
| 8 | PASS | After Ändra and saving "Okänt redskap tas bort": tags incl. `egen` kept, `needsCoachReview` cleared. Merge of hidden fields is in `ownActivities.ts` (evidence-code). |
| 9 | PASS | The Redskap / Välj redskap field shows only for Teknik. Kilmatta + Rockring saved; moving to Uppvärmning and saving cleared `defaultStationEquipment`. |
| 10 | PASS | Formhopp chip detail shows Redskap förslag + StationSketch; Använd alla förslag worked; zone suggestion used it. |
| 11 | PASS | At 100 own: `Du har 100 egna övningar. Ta bort en först.` A five-step Så gör du gives `Högst fyra steg.`; `MAX_FLOOR_STEPS` untouched. |
| 12 | PASS | `Bygger på: Ljushopp på trampett` / `Lättare variant av: Kullerbytta framåt`; the unresolved link from edge row 05 is dropped and renders nothing. |
| 13 | PASS | **Importera övningar** sits next to **Ny egen övning**; the sheet has Välj fil, Klistra in kod and Läs in (`slice30v_A_bibliotek_entry/sheet.png`). |
| 14 | PASS | File and paste both give a preview with the batch note, `Plats för 100 till`, and 2 rows marked **Ny** with **Ta med**. |
| 15 | PASS | `gymnastics-planner-own-activities-v1` was `null` before Importera and after Avbryt. |
| 16 | PASS | Both drills show **Egen** + **Behöver granskas**, filter by Teknik, and can be added to a pass. |
| 17 | PASS | `Filen eller koden gick inte att läsa.` / `Det finns inga övningar i filen.` / `Filen kommer från en nyare version av appen. Uppdatera appen och försök igen.` / `Det här är ett pass. Öppna det under Hämta ett pass på startsidan.` (Drive A's first newer-file attempt showed the generic text; the parser returns `newer` for that file, and Drive B confirmed the exact text via Välj fil.) |
| 18 | PASS | Home **Hämta ett pass** with an exercise file shows `Det här är övningar. Importera dem under Bibliotek → Importera övningar.`; the draft is untouched. |
| 19 | PASS | Edge row 01: `Okänt redskap togs bort: eq-ringar`; saved `[{"pieceId":"eq-trampett","count":1}]`. |
| 20 | PASS | Edge row 02: `Högst fyra steg. Resten togs bort.`; saved howTo has 4 steps. |
| 21 | PASS | Rows 03, 04 and 07 show **Kan inte importeras** with the toggle locked (`Saknar säkerhet.` / `Samma övning finns två gånger i filen.` / `Övningen har fel format.`). |
| 22 | PASS | Row 05 shows **Samma namn finns redan** + the link note + the source note (http). |
| 23 | PASS | Row 06 is importable with `Redskapen togs bort. De används bara i Teknik.`; the card shows Egen and **no** badge (`slice30v_B_edge06_card.png`). |
| 24 | PASS | Re-import shows both rows **Finns redan** / **Hoppa över**. Ersätt updated Äggrullning in place (same id, no duplicate), and the pass-row info showed the new "ERSATT" text. |
| 25 | PASS | At 99 own: row A **Ny**, row B **Ingen plats** (locked), `Plats för 1 till`, Importera 1 övning (`slice30v_B_cap_preview.png`). |
| 26 | PASS | `Förkortad.`: title 80, summary/watchFor/safety 240 each, step 180 (stored line is 183 including the `1. ` prefix). |
| 27 | PASS | Badge on card + detail; detail has the hint + **Markera som granskad**. |
| 28 | PASS | Markera som granskad → toast `Markerad som granskad.`, badge gone after reload; saving via Ändra also clears it. |
| 29 | **FAIL** | Never blocks adding. Not on seeds (Närvaro checked; `needsCoachReview` seeds have no badge because the check requires `own`), stationskort, Kör passet or print. **Shown in the detail opened from Golvklart** → B1. |
| 30 | PASS | 15 pieces; Kilmatta · Skumblock · Bom · Räcke · Rockring appended after Kon with exact ids/labels. |
| 31 | PASS-with-note (overturned) | Icons appear on every surface that has icons (compose grid, detail list, form chips); no blank tiles (`slice30v_B_compose15.png`). Förrådslista rows are text-only and stationskort use StationSketch for **all** pieces. That was already true before Slice 30 (`68b9645^`), and the new pieces show there as text rows or sketch marks. The AC assumed icon lists that don't exist; adding them would change Slice 14/15 surfaces outside this pack. |
| 32 | PASS | Formhopp sketch draws trampett → skumblock → landningsmatta; Äggrullning draws madrass + kilmatta. |
| 33 | PASS | `hallSuggest.test.ts` covers the four zone cases; Drive: Formhopp → Trampett, Äggrullning → Mattor. |
| 34 | PASS | Förrådslista lists Kilmatta + Skumblock in catalog order (after the old pieces); the owned toggles list 15. |
| 35 | PASS | Old list of 10 without the seen key → 15 owned, seen key = 15, "Visa bara övningar vi kan köra ikväll" stays **off**; unticking Rockring survives a reload. |
| 36 | PASS | Compose sheet at 390 px: document 390/390, sheet overflow 0. |
| 37 | PASS | `content/seed-promotion.md` exists and is linked from HANDOFF. No seeds added. |
| 38 | PASS | The seed type accepts `source` (shared `Activity`). No seed carries one yet. |
| 39 | PASS | Old pass JSON and share data without the new fields parse (`sharePass.test.ts:202-233`). |
| 40 | PASS | Teknik-only placements; caption is exactly **Schematisk hall — inte exakt mått**. |
| 41 | PASS | Wizard Q1–Q3 gives five blocks; Nytt pass and Starta från mall (Nybörjare, 9 items) work; Förråd/Använd alla, Kör passet and egna mallar ("Spara som egen mall" present) behave as before. |
| 42 | PASS | Footer **Träningsplaneraren · Slice 30**. |
| 43 | PASS | Build green; 46/46 tests (`ownImport`, `ownedEquipment` new; `ownActivities`/`sharePass`/`hallSuggest` extended). |
| 44 | PASS | No AI, API keys, YouTube/social fetch, embeds, accounts or cloud (greps in evidence-code). |

---

## Builder deviations (ruled against locks)

| # | Deviation | Ruling |
| --- | --- | --- |
| 1 | Room counter = room before import (`100 − own`) | **Accept.** It matches AC 25, which overrides the mock. |
| 2 | `importIsExercises` also in Exportera → Importera fil | **Accept.** Verified in the UI; same copy; consistent with A1. |
| 3 | Picker reuses `StationComposeSheet` | **Accept.** builder-notes allowed it. |
| 4 | File pick reads at once | **Accept.** Still nothing is written before Importera (AC 15). |
| 5 | Recipe-label wrap CSS fix | **Accept.** It only removes a 14 px overflow; compose is 390/390. |
| 6 | Badge in the hall read-only detail | **Accept in Hallöversikt edit mode; reject in Golvklart** → B1 (badge **and** Källa). |
| 7 | Lenient source fields (clip creator, drop bad time only) | **Accept.** Within F1: https + creator are still required. |
| 8 | Up to 8 tags + `egen` | **Accept.** Matches the schema ("≤8 tags; egen always added"). |
| 9 | Unresolved links dropped at write | **Accept.** Matches the schema; render also hides them. |
| 10 | `role="status"` on all builder toasts | **Accept.** Accessibility gain, no visual change. |

## Known gaps (ruled)

- **AC 31 icon lists:** PASS-with-note (see AC 31).
- **Tapping a preview row to open its detail:** not built. The screen spec marks it "optional, nice", so it is **not required**.
- **Kör passet / print / stationskort:** now driven; no Källa or badge there.
- **QR long-link fallback:** a 1.7k-character share link rendered a QR. The fallback path is unchanged since before Slice 30 (ExportSheet diff is only the +5-line exercise-file check). `qrSvg` throws `Data too long` at ~3000 characters, so `exportQrLong` ("Länken är för lång för en QR. Kopiera den eller ladda ner filen.") shows. Own drills with Källa make links longer, so this fallback will be hit sooner; it is non-blocking.
- **Exportera → Importera fil with an exercise file:** driven; shows `importIsExercises`, pass unchanged.

## Observations (non-blocking)

- **Ersätt resets review:** Ersätt with a file whose `needsCoachReview` is true brings **Behöver granskas** back. That's reasonable, because the text is new and unreviewed.
- **Import toast not captured:** the import success toast wasn't caught on screen in Drive A because it disappears quickly. The code calls `showToast(ownImportDoneText(n))` (`SessionBuilder.tsx:250`), and the review toast was captured.
- **Edge row 06 stores no review flag:** its `needsCoachReview: false` is stored as absent, which means no badge.

## Screenshots

| Step | File |
| --- | --- |
| Footer | `slice30v_A_footer.png` |
| Entry + sheet | `slice30v_A_bibliotek_entry.png`, `slice30v_A_sheet.png` |
| Errors | `slice30v_A_err_bad.png`, `slice30v_A_err_empty.png`, `slice30v_B_err_newer.png`, `slice30v_A_err_pass.png` |
| Preview | `slice30v_A_preview_paste.png`, `slice30v_A_preview_file.png` |
| Cards / seed | `slice30v_A_cards.png`, `slice30v_A_seed_no_badge.png`, `slice30v_B_edge06_card.png` |
| Detail + Källa | `slice30v_A_detail_formhopp.png`, `slice30v_A_detail_formhopp_inspect.png`, `slice30v_A_detail_agg.png` |
| Reviewed | `slice30v_A_reviewed_reload.png`, `slice30v_B_marked_reviewed.png` |
| Edge | `slice30v_A_edge_1..3.png`, `slice30v_A_edge_after_01/02/06.png` |
| Ersätt | `slice30v_A_reimport.png`, `slice30v_A_ersatt_info.png`, `slice30v_A_ersatt_detail.png` |
| Long | `slice30v_A_long.png` |
| Hall / Förråd / compose | `slice30v_B_hall_placed.png`, `slice30v_B_forradslista.png`, `slice30v_B_compose15.png` |
| **Golvklart (B1)** | `slice30v_B_golvklart.png`, `slice30v_B_golvklart_detail_agg.png`, `slice30v_B_golvklart_detail_okant.png` |
| Stationskort / Kör / print | `slice30v_B_stationskort.png`, `slice30v_B_korpasset.png`, `slice30v_B_print_preview.png` |
| Form | `slice30v_B_form_redskap.png`, `slice30v_B_form_5steps.png` |
| Share | `slice30v_B_share_qr.png`, `slice30v_B_share_receive_detail.png`, `slice30v_C_receive_*.png` |
| Receive paths | `slice30v_B_export_import_exercises.png`, `slice30v_B_home_hamta.png` |
| Cap | `slice30v_B_cap_preview.png`, `slice30v_B_cap_full.png`, `slice30v_B_cap_none.png` |
| Migration | `slice30v_B_migr_after.png`, `slice30v_B_migr_untick.png` |
| Regression | `slice30v_B_wizard_done.png`, `slice30v_B_mall.png` |

## Fail-if scan

| Fail if | Result |
| --- | --- |
| Anything saved before Importera | No (storage null before Importera / after Avbryt) |
| Video embed / thumbnails / YouTube fetch | No |
| Seeds show review badges | No |
| Unknown redskap survive / 4-step rule relaxed | No |
| Tonight filter flips on after upgrade | No |
| Old share links break; build/tests red; footer ≠ 30 | No |
| Verifier run before lock + Docs + Builder + Planner ping | No (Planner ping 2026-10-02 13:00) |

**Re-verify scope after the B1 fix:** Golvklart chip detail (no Källa, no badge), Hallöversikt detail unchanged, Passbyggaren detail unchanged, footer, build/tests. Everything else stands.

_Preview storage on 127.0.0.1:4173 was wiped and filled with test data (100 own drills); this is not Christoffer's device._
