# Slice 26 — Builder self-smoke

Date: 2026-09-26 10:27:43 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- E1 footer Slice 26
- C1 step 3 caption unchanged
- C1 step 3 hint unchanged
- C1 no tip strip on Home (quiet tips)
- B1 markOpenedHall still sets openedHall
- A1 open alone does not set openHallAndPlace in storage
- F1 caption unchanged
- A1 Case1: open Hall with 0 placements → place step unchecked
- A1 soft: Hallöversikt + Golvklart still enabled with unchecked place
- A1 soft: Golvklart open works with unchecked place
- A1 Case2: placementCount >= 1 → place step checked
- A1 compose not required — compose step still unchecked
- B1 Case3: legacy openHallAndPlace true + 0 placements stays checked
- B1 openedHall alone does not newly advance false place step
- F1 Slice 25 saknar banner still present on Hall edit
- F1 caption still locked on Hall
- C1 no new tip strip on Hall
- No new window.confirm during smoke

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Place via UI DnD / Placera här not driven (seeded hallPlacements for Case2 sync path — equivalent to placementCount >= 1)
- Slice 22 quiet / Slice 23 Home polish / Slice 24 Förråd path assumed intact (not fully re-walked; saknar spot-check only)

## Log
- footer {"hasSlice26":true,"hasSlice25":false,"snippet":"Träningsplaneraren · Slice 26"}
- PASS: E1 footer Slice 26
- before open {"placeChecked":false,"placeDisabled":false,"placeLabel":"Öppna Hallöversikt och placera stationer","placeHint":"Dra Teknik-stationerna ungefär dit ni brukar vara i hallen.","composeChecked":false,"tipStrip":false,"progress":"2 av 5 klart"}
- PASS: C1 step 3 caption unchanged
- PASS: C1 step 3 hint unchanged
- PASS: C1 no tip strip on Home (quiet tips)
- tips after open hall {"openedHall":true,"openHallAndPlace":false,"placements":0}
- PASS: B1 markOpenedHall still sets openedHall
- PASS: A1 open alone does not set openHallAndPlace in storage
- hall open chrome {"caption":"← Tillbaka till PassbyggarenHallöversiktSlice 26 smoke1 stationVisa flödeFörrådslistaAnvänd alla förslagGolvklartHallayoutStandard truppTävling / linjerLiten hallPlacerade övningar flyttas till samma zon i den nya layouten när det går.Välj den hallayout som liknar er hall mest. Övningar på trampett, tumbling och liknande fäster i zonen; på öppen yta placerar du fritt.Tips om placeringSlice 26 smoke · 6 min−+Öppen ytaTrampettTumblingSatsbrädaMattbergMattorSchematisk hall — inte exakt måttDra Teknik-stationer hit, eller välj en och tryck Placera här.Placera Teknik-stationerna ungefär där ni brukar köra dem i hallen. Schemat är en hjälp för gruppen — inte en ritning med mått.Ej placerade (1)Visa stationsbrickaTräningsplaneraren · Slice 26·Visa tips igen","saknar":false,"saknarText":null,"isFloor":false,"tipStrip":false}
- PASS: F1 caption unchanged
- after open return home {"placeChecked":false,"placeDisabled":false,"placeLabel":"Öppna Hallöversikt och placera stationer","placeHint":"Dra Teknik-stationerna ungefär dit ni brukar vara i hallen.","composeChecked":false,"tipStrip":false,"progress":"2 av 5 klart"}
- tips home after open {"chooseOrBuildPass":true,"addActivities":true,"openHallAndPlace":false,"composeStationEquipment":false,"useGolvklart":false}
- PASS: A1 Case1: open Hall with 0 placements → place step unchecked
- shot /workspace/screenshots/slice26_open_only_unchecked.png
- soft CTAs {"hallEnabled":true,"golvEnabled":true,"homeHallDisabled":false,"homeGolvDisabled":false}
- PASS: A1 soft: Hallöversikt + Golvklart still enabled with unchecked place
- PASS: A1 soft: Golvklart open works with unchecked place
- after place seed {"ui":true,"compose":false,"storage":{"chooseOrBuildPass":true,"addActivities":true,"openHallAndPlace":true,"composeStationEquipment":false,"useGolvklart":false},"placements":1}
- PASS: A1 Case2: placementCount >= 1 → place step checked
- PASS: A1 compose not required — compose step still unchecked
- shot /workspace/screenshots/slice26_placed_checked.png
- legacy {"ui":true,"storage":true,"placements":0}
- PASS: B1 Case3: legacy openHallAndPlace true + 0 placements stays checked
- shot /workspace/screenshots/slice26_legacy_stays_checked.png
- openedHall alone {"ui":false,"storage":false,"openedHall":true}
- PASS: B1 openedHall alone does not newly advance false place step
- shot /workspace/screenshots/slice26_openedHall_alone_unchecked.png
- saknar spot {"caption":"← Tillbaka till PassbyggarenHallöversiktSlice 26 smoke1 stationVisa flödeFörrådslistaAnvänd alla förslagGolvklartHallayoutStandard truppTävling / linjerLiten hallPlacerade övningar flyttas till samma zon i den nya layouten när det går.Välj den hallayout som liknar er hall mest. Övningar på trampett, tumbling och liknande fäster i zonen; på öppen yta placerar du fritt.1 station saknar redskapAnvänd alla förslagTips om placeringSlice 26 smoke · 6 min−+Öppen ytaTrampettTumblingSatsbrädaMattbergMattorSchematisk hall — inte exakt mått1Ljushopp på satsbräda×Ej placerade (0)Visa stationsbrickaTräningsplaneraren · Slice 26·Visa tips igen","saknar":true,"saknarText":"1 station saknar redskap","isFloor":false,"tipStrip":false}
- PASS: F1 Slice 25 saknar banner still present on Hall edit
- PASS: F1 caption still locked on Hall
- PASS: C1 no new tip strip on Hall
- shot /workspace/screenshots/slice26_saknar_banner_preserved.png
- PASS: No new window.confirm during smoke

## Summary
**PASS** — 18 PASS / 0 FAIL
