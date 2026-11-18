# Slice 64 — Skiss i Kör passet + redskapsikoner

**App:** Träningsplaneraren
**Status:** **LÅST** 2026-11-17 (A1 B1 C1 D1 E1 F1), se `decisions.md`. Bas: main @ `937829c` (Slice 63 live, PR #71, footer «Slice 63»). Gren: `slice-64-docs`.
**Uppdrag:** Stationer 17 nov 2026 **S1** + **S2**, Approved av Christoffer 2026-11-17 via PO (alla åtta idéer i backloggen; den här slicen är den smala första). S3–S8 stannar Proposed. Se `backlog/IMPROVEMENTS.md`.
**Effort:** **S** (två små ytor, samma mål: nya ledare ska förstå stationerna visuellt). Återanvänder `StationSketch`, `layoutForStation`, `HallChip`, `EQUIPMENT_ICON` / `equipmentIconId` och `VisualIcon`. Ingen SQL.
**Källa:** PO-genomgång 2026-11-17 och `backlog/IMPROVEMENTS.md` (Stationer 17 nov S1–S2).

**Tidigare A–F:** inga för just de här två ytorna. Skissen finns redan i `PassPrint` och `ActivityDetail` (Slices 11 / 57–58). Under-markör-texten finns redan (Slice 14), dold i redigeringsläget, synlig i Golvklart och utskrift. A–F nedan är nya.

## Varför

En ny ledare som kör från telefonen ser i dag titel, klocka och text i Kör passet, men inte hur stationen ska stå. På Golvklart-märket och utskriften står redskapen som text. Målet är en bild: skissen i Kör, typikoner vid märket.

**Vad ledaren får:** På en Teknik-övning med redskap syns skissen «Skiss — så kan stationen stå.» i Kör passet. På Golvklart och Skriv ut passet får den befintliga redskapsraden under märket en liten typikon bredvid texten. Redigeringsläget i Hallöversikt är oförändrat.

**Vad admin får:** Ingenting. Ingen SQL, inga nya bankfält. Befintliga `defaultStationLayout` används där de finns.

## Kod i dag (main @ `937829c`, läst — ingenting byggt)

- `StationSketch` (`components/StationSketch.tsx`): om `layout` finns och överlever `sanitizeStationLayout` ritas de sparade poserna; annars den befintliga auto-raden via `expand(slots)`. Tomt `pieces` → `null`. Bildtext `UI.stationSketchCaption` («Skiss — så kan stationen stå.»), plus `UI.stationSketchApproach` när ansatsen ritas.
- `layoutForStation` (`data/stationLayout.ts:278–286`): ger `defaultStationLayout` bara när listan är osatt eller samma som `defaultStationEquipment`. Bundlade seeds har ingen layout (`stationLayout.test.ts`: «seeds have no layout»).
- `stationCards` (`lib/stationCards.ts:34–51`): bara Teknik (`placeableItems`). Slot: `item.stationEquipment ?? activity?.defaultStationEquipment`. Används av `PassPrint` och `SharePass`, inte av Kör passet.
- `RunPass.tsx` importerar inte `StationSketch`, `layoutForStation` eller `stationCards`. `runSteps()` (`lib/runPass.ts`) tar alla block och har ingen redskaps- eller layoutfält. Kör har i dag kicker, titel, klocka, Nästa, Kvar och `.run-script` (Varför / Så gör du / Medan du väntar / Säkerhet). Bara `.run-script` rullar (Slice 38).
- `HallChip` (`components/HallChip.tsx`): `VisualIcon` för *övningen* (`activity.visualKey`). Under märket, bara när `item.stationEquipment` är satt och inte tom: textrader (Slice 14). CSS döljer blocket i redigeringsläget och visar det på `.hall-canvas.is-floor` (Golvklart) och i utskrift (`App.css`). Brickor i brickraden (`variant="tray"`) har inga redskapsrader.
- `PassPrint` ritar redan `StationSketch` i stationskortet och bäddar in `HallCanvas` med `hallMode="floor"` — samma `HallChip` som Golvklart, utan en andra implementation.
- `EQUIPMENT_ICON` och `equipmentIconId` (`data/equipmentPieces.ts:61–92`) finns, men används inte i `HallChip`. Flera mattor delar `pad`.
- `VisualIcon` tar `visualKey` eller `iconId`. Storlekar i dag: `block` 36, `item` 40, `card` 44, `marker` 48, `detail` 64 — alla för stora för raden under märket (ca 0,58 rem).
- `SLICE_NUMBER = '63'` (`blockMeta.ts:97`). Ändring i `blockMeta.ts` eller `App.css` gör att `pick-smokes` säger hela loopen.

## Scope (★)

- S1: skiss på aktuell Teknik i Kör passet, via `StationSketch` + `layoutForStation`.
- S2: typikon + befintlig text på redskapsraden i `HallChip`, synlig bara i Golvklart och utskrift.
- `SLICE_NUMBER = '64'`. Ingen SQL. Inte S3–S8. Inte den parkerade textraden i Kör passet, inte count-badge, inte hall-CAD, inte redigeringsläget.

## Ej scope

- S3 «Bygg hallen», S4 «Du är här», S5 ovanifrån-mini, S6 fylla kön «Saknar skiss», S7 rotationsklocka, S8 3D / `.glb`.
- Parkerad «Kör passet — redskap line» (Scout 2026-10-13 #2).
- Parkerad «Canvas equipment-count badge» och hall-CAD (Slice 13).
- Nya redskapsrader när bara övningens standardlista finns (behåll Slice 14-regeln på märket).
- Ändrad `StationSketch` i `PassPrint`-kortet, `ActivityDetail`, Redigera redskap eller Admin-kön.
- Schema-SQL, seed-layouter, `push-promote`.

## A–F (★ = Docs förslag; låses av Christoffer)

### A. Skiss utan sparad layout
- **A1 ★** Visa den befintliga auto-raden. `StationSketch` gör redan det när `layout` saknas eller inte är giltig. Samma beteende som `PassPrint` och `ActivityDetail`. Dölj bara när det inte finns några redskap (komponenten returnerar `null`). Seeds saknar layout — A2 skulle lämna de flesta Kör-steg utan bild, mot målet.
- A2 Dölj skissen när `layoutForStation` är `undefined`. Avråds (seeds blir tomma).
- A3 Visa texten «Ingen skiss än» utan bild när layout saknas. Extra sträng, inte visuellt. Avråds.

### B. Ikoner på märket
- **B1 ★** Ikon + befintlig text på varje redskapsrad i `HallChip`, bara där raderna redan syns (explicit `item.stationEquipment`). `equipmentIconId(piece.visualKey)` in i `VisualIcon` med ny kompakt storlek (t.ex. `gear`, ca 12–14 px ritning, `neutral`) och CSS som tar bort kakelramen, samma grepp som `.hall-chip-icon`. Synlighet orörd: dold i redigeringsläget, synlig i Golvklart och utskrift. Inte i brickraden, inte i Redigera redskap. Texten stannar — flera bitar delar ikon (`pad`).
- B2 Bara ikoner, ta bort texten på Golvklart/utskrift. Sämre i utskrift, och `pad`-krocken blir osynlig. Avråds.
- B3 Ikoner även i redigeringsläget. Utanför scope (PO: inte redigeringsläget). Avråds.

### C. Vilka steg och var skissen sitter
- **C1 ★** Bara Teknik-steg med redskapsslots (`item.stationEquipment ?? activity?.defaultStationEquipment`, samma källa som `stationCards`). Inte andra block. Skissen är första barnet i `.run-script` (före Varför), så klocka, Nästa, Kvar och nav står kvar; bara skriptet rullar (Slice 38). Begränsa höjden i `export.css` (där `.run-pass` redan ligger) så nav når skärmens botten på 390×844. Behåll befintlig bildtext. Använd inte `stationCards()` som lista över Kör-steg.
- C2 Under titeln, ovanför klockan. Klockan riskerar att åka ner. Inte ★.
- C3 Även uppvärmning, styrka eller lek. Utanför scope.

### D. Gränser
- **D1 ★** Bara S1 och S2. Inte S3–S8. Inte den parkerade textraden i Kör, inte count-badge, inte hall-CAD. Hallöversikt i redigeringsläge, Redigera redskap, Admin-kön och stationskortets skiss i `PassPrint` orörda. Märkesikonerna kommer åt utskriften via befintlig `HallCanvas hallMode="floor"`.
- D2 Ta även med den parkerade textraden i Kör passet. Utanför scope, fortfarande parkerad.
- D3 Ta även med S3 eller S4. För stort för den här slicen.

### E. Bundle och footer
- **E1 ★** Inom +512 B gzip, inget undantag. Uppskattning **+0,20–0,45 kB**. `StationSketch` ligger redan i bunten (`PassPrint`, `ActivityDetail`); Kör lägger mest import + uppslag + markup. Ikonerna återanvänder `VisualIcon` / `EQUIPMENT_ICON` plus en liten storlek och CSS. `SLICE_NUMBER = '64'`. `blockMeta.ts` är oundviklig (footer) och `App.css` behövs för märkesraden — `pick-smokes` säger hela loopen. Kör-CSS i `export.css`. Går bygget över: korta CSS/maxhöjd, inte ta bort skiss eller ikon, och rapportera — inget undantag utan Christoffers ja.
- E2 Lämna `SLICE_NUMBER` på 63. Avråds.
- E3 Bundleundantag, eller ta med S3–S8. Avråds.

### F. Tester
- **F1 ★** Enhetstester för hjälpfunktionen (se HANDOFF): Teknik med standardredskap, seed utan layout → slots, `layout` undefined; Teknik med sparad layout som matchar förslaget → layout finns; egen lista som skiljer sig från förslaget → ingen admin-layout (samma regel som `layoutForStation`); inte Teknik / inga slots / tom lista → undefined. Befintliga `runPass`- och `stationLayout`-tester gröna. `pick-smokes 937829c <head>` styr — troligen hela loopen p.g.a. `blockMeta.ts` och `App.css`. Mot baslinjen: SAMMA förutom footer 63→64, skiss i Kör på Teknik med redskap, och ikon på Golvklart-/utskriftsraden när `stationEquipment` är satt.
- F2 Ny egen smoke. Onödigt; befintliga Kör-smokes (`slice-34`, `slice-38`) och Golvklart-smokes (`slice-30`) räcker, plus checklistan.
- F3 Bara den manuella checklistan, inga nya enhetstester. Avråds.

## Öppna frågor (besvaras vid lås)

1. **Ingen layout:** A1 (auto-rad, ★) eller A2 (dölj)?
2. **Ikoner:** B1 (ikon + text, ★) eller B2 (bara ikon)?
3. **Skissens plats:** C1 (först i `.run-script`, ★) eller C2 (under titeln)?

Låssträng, om ★ antas: «Ja, lås A1 B1 C1 D1 E1 F1».
