# Slice 69 — «Du är här»-minikarta i Kör passet

**App:** Träningsplaneraren
**Status:** **FÖRESLAGEN** (inte låst). Bas: main @ `83965f7` (Slice 68 live, PR #76 + hotfix #77; footer «Slice 68»). Gren: `slice-69-docs`.
**Uppdrag:** Backlog S4 «Du är här»-minikarta. Godkänd av Christoffer 28 nov 2026 (Europe/Stockholm), via PO. Inte S5, S7 eller S8.
**Effort:** **M**. Håll slicen liten. Ingen SQL. Inte en ny editor, inte CAD, inte den parkerade redskapsraden i Kör passet.

## Varför

Mitt i passet ska ledaren se var den aktuella stationen står i hallen, utan att lämna Kör passet.

## Kod i dag (main @ `83965f7`, läst — ingenting byggt)

- Kör passet är `RunPass.tsx`: kicker, titel, klocka, Nästa, Kvar, `.run-script`, nav (Föregående / Nästa). Bara `.run-script` rullar (Slice 38). Skissen från Slice 64 är första barnet i skriptet, via `runStationSketch` + `StationSketch`, och bara på Teknik med redskap. Den ersätts inte här.
- `runSteps()` går igenom *alla* block, inte bara Teknik. `isPlaceableItem` / `placeableItems` är bara Teknik (Slice 11). `hallSetupSteps` tillhör Bygg hallen i Golvklart, inte Kör passet — återanvänd den inte.
- Hallen ritas av `HallCanvas` (`hallMode="floor"` är redan visningsläge i Golvklart, `PassPrint` och `SharePass`): `getPreset` + planlager, `getPlacedItems`, `stationRanks`, `HallChip`, ev. flödesstreck (`isHallShowFlow`, på som standard). `HallBoard` är hela redigeraren (988 rader) och ska inte monteras i Kör.
- `.hall-canvas` har `min-height: 280px` och `.hall-canvas-wrap` har `overflow: auto`. Båda måste åsidosättas i minin, annars bryts Slice 38.
- Det finns inget «hallöst» fält: `hallTemplateId` faller tillbaka på `DEFAULT_HALL_TEMPLATE` (`forening-bla`). «Ingen hall» = inga rader i `hallPlacements` (`getPlacedItems` är tom). Oplacerad Teknik: `getUnplacedItems`. `UI.buildHallUnplaced` («Saknar plats») finns redan (Slice 66).
- `HallCanvas` och `HallChip` ligger redan i huvudbunten (`HallBoard` och `RunPass` importeras båda ivrigt från `App.tsx`). `SLICE_NUMBER = '68'`.

## Scope (★)

- En miniatyr av den befintliga hallen på aktuellt steg i Kör passet, med den aktiva stationen markerad.
- Visning bara. Kompletterar skissen från Slice 64, ersätter den inte.
- `SLICE_NUMBER = '69'`. Ingen SQL.

## Ej scope (står tills Christoffer säger annat i A–F)

- Inte S5, S7 eller S8.
- Inte en ny haleditor. Inte hall-CAD. Inte extra stift utöver stationsmärket.
- Inte den parkerade «Kör passet — redskap line».
- Inte Bygg hallen, inte utskriften, inte Hallöversikt/Golvklart i övrigt.

## A–F (★ = Docs förslag; låses av Christoffer)

### A. Placering
- **A1 ★** Inne i `.run-script`, ovanför skissen (när den finns). Kartan först («var står den»), skissen sedan («hur står den»). Klocka, Nästa, Kvar och nav är fasta; bara skriptet rullar (Slice 38).
- A2 Inne i `.run-script`, under skissen. Skissen behåller första platsen, men «var» hamnar under «hur».
- A3 Hopfällbar knapp mellan klockraderna och skriptet. Extra krom och tryck; öppen äter den höjd från klocka och nav. Avråds.

### B. Storlek
- **B1 ★** Hallens egen aspect-ratio, `max-width: 100%`, `max-height: 16svh`, `min-height: 0` (åsidosätt `280px`). Miniatyrens egen yta rullar inte och nypzoomar inte (`overflow: hidden`, `pointer-events: none`). På 844×390 blir kartan kort, men den ligger i skriptet så klocka och nav når fortfarande.
- B2 `max-height: 24svh` (samma som skissen). Karta + skiss kan ta ~48svh innan texten. Onödigt stort.
- B3 Fast bredvid klockan eller i kickern. Krockar med klockan eller blir oläslig. Avråds.

### C. Ingen hall, oplacerad, inte Teknik
- **C1 ★** Karta bara när minst en Teknik är placerad *och* aktuellt steg är Teknik. Placerad → kartan med den stationen markerad. Oplacerad, men andra stationer står i hallen → samma karta utan aktiv markering, plus `UI.buildHallUnplaced` («Saknar plats»). Inte Teknik, eller inga placeringar alls → ingen karta och ingen rad. «Ingen hall» = inga placeringar, inte ett saknat hall-id.
- C2 Visa alltid hallplanen, även utan placeringar (tom plan). Mot «ingen hall = ingen karta».
- C3 Visa kartan även på uppvärmning och styrka (utan markering). Tar plats utan «du är här».

### D. Markör
- **D1 ★** Miniatyr av den hall ledaren redan har: alla placerade stationsmärken (`HallChip`, `stationRanks`), flödesstreck om passet har dem. Den aktiva stationen använder befintlig `is-selected`. Inget extra «Du är här»-stift, ingen CAD. Redskapsraderna under märket döljs med CSS (oläsliga i miniformat; inte ett nytt märke). «Inga extra märken» betyder inget andra stift och ingen CAD — inte att de andra stationerna ska döljas. En ensam prick är en sämre karta.
- D2 Bara den aktiva stationens märke, övriga dolda. Sämre som karta.
- D3 Ett nytt «Du är här»-stift utöver märket. Extra märke, mot stående lås.

### E. Tryck
- **E1 ★** Ingen träffyta. Visning bara. Tryck, drag och nyp gör ingenting (`pointer-events: none`). Klockan fortsätter. Kör passet lämnas inte.
- E2 Tryck öppnar Hallöversikt. Lämnar Kör passet medan klockan går. Utanför «bara visa».
- E3 Nyp eller drag zoomar och panorerar. Krockar med skriptets rullning. Avråds.

### F. Footer, tester, bundle
- **F1 ★** `SLICE_NUMBER = '69'` (samma längd som 68). Enhetstester för hjälpen `runHallMini` (namnet fritt) i `runPass.test.ts`. `feedback.test.ts` 68→69. `pick-smokes 83965f7 <head>` styr — troligen hela loopen p.g.a. `blockMeta.ts`. Bundle +512 B gzip mot `83965f7` (`build-dists.sh`, `gzip -9`, js+css TOTAL). Uppskattning före bantning **+0,20–0,45 kB** gzip: `HallCanvas` / `HallChip` finns redan i huvudbunten; tillägget är koppling, en kort hjälp och CSS. Går det över: korta CSS och ev. ny aria först, inte ta bort kartan eller markeringen, och rapportera — inget undantag utan Christoffers ja.
- F2 Höj det stående +512 B-taket. Kräver hans ja. Inte förstaval.
- F3 Lämna `SLICE_NUMBER` på 68, eller inga nya enhetstester. Avråds.

## Öppna frågor (besvaras vid lås)

1. **Placering:** A1 (ovanför skissen, ★) eller A2 (under)?
2. **Markör:** D1 (hela hallen, aktiv markerad, ★) eller D2 (bara aktivt märke)?

## Låsrad

Om alla ★: «Ja, lås A1 B1 C1 D1 E1 F1».
