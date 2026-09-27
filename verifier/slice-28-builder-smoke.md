# Slice 28 — Builder self-smoke

Date: 2026-09-27 23:01:48 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- Doctor HTTP 200 on /traningsplaneringen/
- Nybörjare Samling = Närvaro then Dagens pass — snabb genomgång
- Nybörjare durations 3+3
- Nybörjare Samling 6 / 6 min, no Över budget
- Dagens pass title from Slice 27 seed (D1)
- Footer Träningsplaneraren · Slice 28
- Kort pass Samling = Välkomstcheck-in only (B1 unchanged)
- Kort pass duration 5
- Kort pass 5 / 6 min, no Över budget
- Nytt pass Soft blank still Närvaro+Dagens pass 3+3, 6/6 no Över budget
- Välkomstcheck-in still in library
- Caption Schematisk hall — inte exakt mått
- Samling items not placeable on hall
- No Home 3-question wizard (F1)
- Beginner mall still has all five blocks (non-Samling unchanged)

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Slice 22 quiet / 23 Home / 24 Förråd / 25 saknar / 26 place-step not fully re-walked (hall caption + placeable spot only)
- Library check is UI presence of Välkomstcheck-in after opening Lägg till (not full re-add flow)

## Log
- doctor 200
- PASS: Doctor HTTP 200 on /traningsplaneringen/
- case1 {"budget":"6 / 6 min","over":false,"titles":["Närvaro","Dagens pass — snabb genomgång"],"durations":[3,3]}
- shot /workspace/screenshots/slice28_mall_beginner_samling.png
- PASS: Nybörjare Samling = Närvaro then Dagens pass — snabb genomgång
- PASS: Nybörjare durations 3+3
- PASS: Nybörjare Samling 6 / 6 min, no Över budget
- PASS: Dagens pass title from Slice 27 seed (D1)
- PASS: Footer Träningsplaneraren · Slice 28
- shot /workspace/screenshots/slice28_footer.png
- case2 {"budget":"5 / 6 min","over":false,"titles":["Välkomstcheck-in"],"durations":[5]}
- shot /workspace/screenshots/slice28_mall_short_samling.png
- PASS: Kort pass Samling = Välkomstcheck-in only (B1 unchanged)
- PASS: Kort pass duration 5
- PASS: Kort pass 5 / 6 min, no Över budget
- case3 {"budget":"6 / 6 min","over":false,"titles":["Närvaro","Dagens pass — snabb genomgång"],"durations":[3,3]}
- shot /workspace/screenshots/slice28_blank_soft_pair.png
- PASS: Nytt pass Soft blank still Närvaro+Dagens pass 3+3, 6/6 no Över budget
- library valkomst=true
- shot /workspace/screenshots/slice28_library_valkomst.png
- PASS: Välkomstcheck-in still in library
- hall {"caption":true,"softInUnplaced":false,"softInChips":false,"chips":[],"unplaced":""}
- shot /workspace/screenshots/slice28_hall_caption_and_placeable.png
- PASS: Caption Schematisk hall — inte exakt mått
- PASS: Samling items not placeable on hall
- PASS: No Home 3-question wizard (F1)
- blocks ["Samling","Uppvärmning","Teknik","Styrka","Lek och spel"]
- PASS: Beginner mall still has all five blocks (non-Samling unchanged)
- shot /workspace/screenshots/slice28_beginner_all_blocks.png

## Summary
**PASS** — 15 PASS / 0 FAIL
