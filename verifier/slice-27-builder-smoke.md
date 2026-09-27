# Slice 27 — Builder self-smoke

Date: 2026-09-26 23:37:31 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- Blank Nytt pass: Närvaro then Dagens pass — snabb genomgång; 3+3
- Budget 6/6 no Över budget
- Soft items editable (remove + add present)
- Footer Slice 27
- Cleared Samling shows Docs empty tip
- addLabel unchanged
- No auto-refill after clear
- Can add Välkomstcheck-in from library
- tmpl-beginner-60 Samling = mall items (Välkomst + Dagens pass)
- tmpl-short-45 Samling = Välkomstcheck-in only (mall)
- Soft Samling items not placeable on hall (Teknik-only; no-stations empty)
- Caption N/A on soft-only no-stations hall (verified with Teknik in saknar spot)
- Slice 25 saknar banner still present
- Caption still locked (spot)
- Slice 26 place-step caption/hint still present
- Slice 26 place-step checked when placements >= 1
- C1 empty draft Samling stays empty (no migrate)

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Slice 22 quiet / 23 Home / 24 Förråd not fully re-walked (saknar + place-step spot only)
- Rapid multi-remove in one tick avoided (React stale closure); sequential remove used

## Log
- case1 samling {"budget":"6 / 6 min","over":false,"titles":["Närvaro","Dagens pass — snabb genomgång"],"durations":[3,3],"emptyTip":null,"addLabel":null,"removeBtns":2,"addInline":true,"empty":false}
- PASS: Blank Nytt pass: Närvaro then Dagens pass — snabb genomgång; 3+3
- PASS: Budget 6/6 no Över budget
- PASS: Soft items editable (remove + add present)
- footer {"snippet":"Träningsplaneraren · Slice 27","hasSlice27":true,"hasSlice26":false}
- PASS: Footer Slice 27
- shot /workspace/screenshots/slice27_blank_soft_pair.png
- removed first 1
- removed second 1
- case2 after clear {"budget":"0 / 6 min","over":false,"titles":[],"durations":[],"emptyTip":"Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter.","addLabel":"Lägg till din första samlingsövning","removeBtns":0,"addInline":false,"empty":true}
- PASS: Cleared Samling shows Docs empty tip
- PASS: addLabel unchanged
- PASS: No auto-refill after clear
- shot /workspace/screenshots/slice27_cleared_empty_tip.png
- activity card ok
- add click Lägg till i valt block
- case3 {"budget":"5 / 6 min","over":false,"titles":["Välkomstcheck-in"],"durations":[5],"emptyTip":null,"addLabel":null,"removeBtns":1,"addInline":true,"empty":false}
- PASS: Can add Välkomstcheck-in from library
- shot /workspace/screenshots/slice27_added_valkomst.png
- case4 beginner {"budget":"8 / 6 min · Över budget","over":true,"titles":["Välkomstcheck-in","Dagens pass — snabb genomgång"],"durations":[5,3],"emptyTip":null,"addLabel":null,"removeBtns":2,"addInline":true,"empty":false}
- PASS: tmpl-beginner-60 Samling = mall items (Välkomst + Dagens pass)
- shot /workspace/screenshots/slice27_mall_beginner.png
- case4b short {"budget":"5 / 6 min","over":false,"titles":["Välkomstcheck-in"],"durations":[5],"emptyTip":null,"addLabel":null,"removeBtns":1,"addInline":true,"empty":false}
- PASS: tmpl-short-45 Samling = Välkomstcheck-in only (mall)
- shot /workspace/screenshots/slice27_mall_short.png
- case5 hall {"caption":false,"hasHall":true,"hasNarvaroInUnplaced":false,"unplacedTitles":[],"unplacedBanner":null,"markerTitles":[]}
- noStations {"title":true,"bodyHasSoft":false}
- PASS: Soft Samling items not placeable on hall (Teknik-only; no-stations empty)
- PASS: Caption N/A on soft-only no-stations hall (verified with Teknik in saknar spot)
- shot /workspace/screenshots/slice27_hall_soft_not_placeable.png
- saknar spot {"saknar":true,"caption":true}
- PASS: Slice 25 saknar banner still present
- PASS: Caption still locked (spot)
- shot /workspace/screenshots/slice27_saknar_banner_spot.png
- place-step {"label":"Öppna Hallöversikt och placera stationer","hint":"Dra Teknik-stationerna ungefär dit ni brukar vara i hallen.","checked":true}
- PASS: Slice 26 place-step caption/hint still present
- PASS: Slice 26 place-step checked when placements >= 1
- shot /workspace/screenshots/slice27_place_step_spot.png
- C1 empty draft {"budget":"0 / 6 min","over":false,"titles":[],"durations":[],"emptyTip":"Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter.","addLabel":"Lägg till din första samlingsövning","removeBtns":0,"addInline":false,"empty":true}
- PASS: C1 empty draft Samling stays empty (no migrate)
- shot /workspace/screenshots/slice27_empty_draft_no_migrate.png

## Summary
**PASS** — 17 PASS / 0 FAIL
