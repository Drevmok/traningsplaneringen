# Slice 64 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Testdata: bundlade seederna räcker för auto-rad och ikonvägen (efter «Använd alla förslag» eller motsvarande så att `stationEquipment` är satt). En övning med sparad `defaultStationLayout` behövs för kontroll 3 — stand-in/bank eller en egen övning med skiss; seeds har ingen layout. Ingen SQL. Admin-konto behövs inte för kontroll 1–2 och 4–13.

**13 kontroller.** Föreslaget A1 B1 C1 D1 E1 F1 — uppdateras vid lås.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Ett pass med Teknik som har standardredskap men ingen sparad layout (seed, t.ex. efter Planera pass). Öppna Kör passet på den övningen | Skissen syns först i `.run-script`, auto-rad, bildtext «Skiss — så kan stationen stå.» (plus ansatsmening om trampett/satsbräda). Titel, klocka, Nästa, Kvar och texten under skissen är kvar |
| 2 | Samma Kör: en Samling- eller Lek-rad, och en Teknik utan redskap | Ingen skiss. Klocka och nav fungerar som på main |
| 3 | En Teknik med giltig sparad layout (bank eller egen övning) i Kör | Skissen visar de sparade poserna, inte auto-raden |
| 4 | 390×844: klocka, Nästa, Kvar och nav | Ingen överlappning. Nav når skärmens botten. Bara `.run-script` rullar (Slice 38). Skissen får plats utan att knuffa bort klockan |
| 5 | Hallöversikt i redigeringsläge, station med satt `stationEquipment` | Ingen redskapsrad och inga ikoner under märket (som i dag) |
| 6 | Samma pass, Golvklart, efter att redskapen är applicerade («Använd alla förslag» eller motsvarande) | Under märket: typikon + befintlig text per redskap. Kort titel som i dag. Ett märke per station |
| 7 | Skriv ut passet för samma pass | Hallkartans märken har samma ikon + text. Stationskortets `StationSketch` är som på main (auto-rad eller sparad layout). Ingen ny Kör-rad i utskriften |
| 8 | Station där `stationEquipment` inte är satt (bara övningens standardlista) i Golvklart | Ingen redskapsrad och inga ikoner under märket — samma Slice 14-regel som på main |
| 9 | Brickraden och Redigera redskap | Som på main. Inga nya ikoner där |
| 10 | Liggande 844×390, Kör + Golvklart | Skiss och ikoner täcker inte nav, klocka eller märken. Går att läsa och bläddra |
| 11 | Footer | «Slice 64» |
| 12 | `npm run build`, `npm run lint`, `bun test src` (inkl. `runStationSketch`). `pick-smokes 937829c <head>` och de träffade smokes mot baslinjen | Gröna. Troligen hela loopen p.g.a. `blockMeta.ts` och `App.css`. Smokes SAMMA förutom footer 63→64, skiss i Kör på Teknik med redskap, och ikon på Golvklart-/utskriftsraden när listan är satt |
| 13 | Bundle gz (js+css) mot main @ `937829c` | Rapporterad, väntat ≤ +512 B. Ingen SQL har körts |
