# Slice 65 — Bygg hallen

**App:** Träningsplaneraren
**Status:** **LÅST** 2026-11-21 (A1 B1 C1 D1 E1 F1, se `decisions.md`). Bas: main @ `6698a63` (Slice 64 live, PR #72, footer «Slice 64»). Gren: `slice-65-docs`.
**Uppdrag:** Stationer 17 nov 2026 **S3** «Bygg hallen», Approved av Christoffer 2026-11-20 via PO. S4–S8 och S9 stannar Proposed. S9 ingår inte. Se `backlog/IMPROVEMENTS.md`.
**Effort:** **M**. Återanvänder `StationSketch`, `layoutForStation`, `runStationSketch`, `HallChip`, `EQUIPMENT_ICON` / `equipmentIconId`, Golvklart, Förrådslista och `PassPrint`. Ingen SQL. Inte en andra halleditor, inte hall-CAD, ett märke per station.
**Källa:** PO-genomgång 2026-11-17 och 2026-11-20; `backlog/IMPROVEMENTS.md` (S3). Produktmål 20 nov: en ny ledare ska kunna ställa i ordning hallen och förstå bygget. Mobilen tas bara fram kort i hallen (mobilförbud under träningen), så utskriften och Golvklart är viktiga.

**Tidigare A–F:** inga för just den här guiden. Skiss, redskapslistor, Golvklart, Förrådslista och Skriv ut passet finns redan.

## Varför

En ny ledare som ska ställa hallen ser i dag en karta (Golvklart) och en summerad Förrådslista, plus skiss och redskap i utskriftens stationskort. Det saknas en guidning station för station: vad som ska stå just här, i vilken ordning, och om stationen är klar. Målet är en uppställningsguide före passet, inte mer att göra under träningen.

**Vad ledaren får:** «Bygg hallen» går igenom Teknik-stationerna en i taget med skiss, redskap och antal, en avbockning och det befintliga märket markerat. Samma innehåll i en kort sektion i Skriv ut passet, så pappret kan bäras i hallen. Golvklart förblir visningen för gruppen.

**Vad admin får:** Ingenting. Ingen SQL, inga nya bankfält. Befintliga `defaultStationLayout` och redskapslistor används där de finns.

## Kod i dag (main @ `6698a63`, läst — ingenting byggt)

- Golvklart är hallens `hallMode="floor"` i `HallBoard` — visning för gruppen (låst text: «Golvklart är till för att visa gruppen — skriv ut eller håll upp skärmen.»). Knappar: Avsluta golvklart, Förrådslista, Skriv ut passet. Ingen stegguide, ingen sträng «Bygg hallen». Markörens `selected`-ram är avstängd på golvet (`HallCanvas`: `selected={!isFloor && …}`).
- Ett märke per Teknik-station (`HallChip`). Nummer kommer från `stationRanks`: 1-baserat bland *placerade* Teknik i Passbyggaren-ordning, inte var märket står. Oplacerade saknar nummer (samma i `PassPrint`). Tipstexten är redan låst till den ordningen.
- `stationCards().rank` numrerar däremot *alla* placeable Teknik, även oplacerade — använd inte den som märkesnummer.
- Under märket (Slice 14/64): typikon + text, bara när `item.stationEquipment` är satt; dolt i redigeringsläget, synligt i Golvklart och utskrift.
- `StationSketch` + `layoutForStation` + `runStationSketch` (Slice 64) finns. Auto-rad när layout saknas (A1 i 64). Seeds har ingen layout. Slots: `item.stationEquipment ?? activity?.defaultStationEquipment`.
- Förrådslista (`aggregateStationEquipment` i `ForradslistaSheet` och utskrift) är en *pass-bred* summa av sparad `stationEquipment`. Den tar inte med förslag/standardlista, och den visar inte vilken station som bidrar (parkerad «Förrådslista — show which stations contribute»). Antal *per station* ska alltså tas från stationens egna slots, inte från Förrådslistans rader.
- `PassPrint` (Skriv ut passet, både från Dela och från Golvklart via `usePassPrint`) har redan tidslinje med `StationSketch` + redskapsrad på Teknik, hallkarta (`HallCanvas hallMode="floor"`) och summerad Förrådslista. Det saknas en uppställningssektion med avbockning; korten blandar också Se upp för / Säkerhet (körmaterial).
- Ingen föreningsinventarie. Slice 47 tog bort «Vad finns i hallen ikväll?» / `ownedEquipment.ts`. Det är S9 (Proposed), inte den här slicen.
- `SLICE_NUMBER = '64'` (`blockMeta.ts:97`). Ändring i `blockMeta.ts` eller `App.css` gör att `pick-smokes` säger hela loopen.

## Scope (★)

- S3: uppställningsguide «Bygg hallen», station för station, före passet.
- Återanvänd skiss, redskap, befintliga märken, Golvklart och Förrådslista (som hämtlista).
- En kort sektion i Skriv ut passet.
- `SLICE_NUMBER = '65'`. Ingen SQL. Inte S4–S9. Inte hall-CAD. Inte en andra halleditor.

## Ej scope

- S4 «Du är här», S5 ovanifrån-mini, S6 kön «Saknar skiss», S7 rotationsklocka, S8 3D / `.glb`.
- S9 föreningens tillgängliga redskap / saknas / alternativ (Christoffer 20 nov, Proposed). Inte återinföra «ikväll».
- Hall-CAD, extra märken eller redskapspinnar. Parkerad count-badge. Parkerad textrad i Kör passet.
- Ändrad redigering i Hallöversikt, Redigera redskap, Admin-kön, Kör passet, eller stationskortens Se upp för / Säkerhet.
- Att bryta ner Förrådslista per station (fortfarande parkerad).
- Schema-SQL, seed-layouter, `push-promote`.

## A–F (★ = Docs förslag; låses av Christoffer)

### A. Var guiden lever
- **A1 ★** Stegläge i anslutning till Golvklart: en knapp «Bygg hallen» i Hallöversikt / Golvklart-huvudet öppnar en genomgång över den befintliga golvkartan. Aktuellt märke markeras (samma `HallChip`, inget nytt märke). Skiss, redskap och avbockning i en panel. Avsluta återgår till vanlig Golvklart (gruppen) eller Hallöversikt. Placeringar och redigeringsläget orörda. Inte en ny duk.
- A2 Egen helskärm «Bygg hallen» vid sidan av Golvklart. Extra nav, två ytor. Avråds.
- A3 Bara utskrift, ingen skärmguide. Missar den korta titt i telefonen före passet. Avråds som enda väg (utskrift behövs ändå, se D).

### B. Ordning
- **B1 ★** Samma som märkesnumren: `stationRanks` — placerade Teknik i passets ordning, inte kartposition. Oplacerade kommer efter, utan nummer och utan påhittat märke; en kort «saknar plats» räcker. Samma regel som den låsta tipstexten.
- B2 Gångordning efter var märkena står. Bryter mot siffrorna på kartan. Avråds.
- B3 Alla Teknik i `placeableItems`-ordning med `stationCards.rank` även för oplacerade. Numret i guiden skulle saknas på kartan. Avråds.

### C. Vad varje steg visar
- **C1 ★** Nummer (om placerad) + titel, `StationSketch` (samma källa som `runStationSketch` / `stationCards`: slots `item.stationEquipment ?? defaultStationEquipment`, auto-rad när layout saknas), redskap med antal från *stationens* slots, och en avbockning «Byggd» som bara lever i minnet under genomgången (ingen ny sessionsfält, ingen SQL). Markera det befintliga märket. Förrådslista stannar som summerad «Ta med från förrådet» vid sidan av, inte som källa för antal per steg. Dölj skissen när det inte finns slots. Inte S9 (saknas/alternativ).
- C2 Bara skiss, ingen redskapslista eller avbockning. För tunt för att ställa i ordning. Avråds.
- C3 Samma som C1 plus hela Förrådslista i varje steg. Tungt och upprepar hämtlistan. Avråds.

### D. Utskrift
- **D1 ★** En kort sektion «Bygg hallen» i befintlig `PassPrint` (Skriv ut passet från både Dela och Golvklart): stationerna i B1-ordning, skiss, redskap + antal, en tom avbockningsruta. Inte ett andra utskriftsdokument. Befintlig tidslinje, hallkarta och Förrådslista stannar; blanda inte in Se upp för / Säkerhet i uppställningssektionen.
- D2 Egen utskrift bara för guiden. Två utskriftsvägar. Avråds.
- D3 Ingen ändring i utskriften. Mot produktmålet (mobilförbud). Avråds.

### E. Bundle och footer
- **E1 ★** Inom +512 B gzip, inget undantag. Uppskattning **+0,30–0,50 kB**. Återanvänder skiss, märken och `PassPrint`; nytt är steghjälp, lite panel/CSS och ett fåtal `UI.`-strängar. `SLICE_NUMBER = '65'`. `blockMeta.ts` är oundviklig (footer + strängar) — `pick-smokes` säger hela loopen. Golvklart-CSS i `App.css` om märkesmarkering på golvet behövs; utskrifts-CSS i `export.css`. Går bygget över: korta CSS och mikrotext, inte ta bort stegguide eller utskriftssektion, och rapportera — inget undantag utan Christoffers ja.
- E2 Lämna `SLICE_NUMBER` på 64. Avråds.
- E3 Bundleundantag, eller ta med S4–S9. Avråds.

### F. Tester
- **F1 ★** Enhetstester för hjälpfunktionen (se HANDOFF): placerade Teknik i `stationRanks`-ordning med nummer; oplacerade sist utan nummer; slots från egen lista eller standard; layout enligt `layoutForStation`; tomt pass / ingen Teknik → tom lista. Befintliga `stationRanks`-, `runStationSketch`-, `stationLayout`- och `PassPrint`-tester gröna. `pick-smokes 6698a63 <head>` styr — troligen hela loopen p.g.a. `blockMeta.ts` (och ev. `App.css`). Mot baslinjen: SAMMA förutom footer 64→65, Bygg hallen-steg på Golvklart och sektionen i utskriften.
- F2 Ny egen smoke. Onödigt; befintliga Golvklart- och utskrifts-smokes plus checklistan räcker.
- F3 Bara den manuella checklistan, inga nya enhetstester. Avråds.

## Öppna frågor (besvaras vid lås)

1. **Yta:** A1 (stegläge vid Golvklart, ★) eller A2 (egen vy)?
2. **Ordning:** B1 (märkesnummer / passordning, ★) eller B2 (gångordning)?
3. **Utskrift:** D1 (sektion i Skriv ut passet, ★) eller D3 (ingen utskriftsändring)?

Låssträng, om ★ antas: «Ja, lås A1 B1 C1 D1 E1 F1».
