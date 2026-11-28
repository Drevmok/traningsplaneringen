# Slice 69 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Föreslaget A1 B1 C1 D1 E1 F1 — uppdateras vid lås. Ingen SQL. **10 kontroller.**

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Footer | «Slice 69». `SLICE_NUMBER = '69'` |
| 2 | 390×844, Kör passet, placerad Teknik med skiss | Minikarta ovanför skissen (skissen finns kvar). Aktiv station markerad, övriga placerade märken syns. Klocka och nav når skärmen. Bara `.run-script` rullar; minin själv rullar inte |
| 3 | 844×390 liggande, samma steg | Karta syns i skriptet (kort men läsbar nog för märkesnummer). Klocka och nav når skärmen. Bara `.run-script` rullar; minin själv rullar inte och nypzoomar inte |
| 4 | Markörer | Ett märke per station, samma typ som Golvklart. Aktiv = befintlig `is-selected`. Inget extra «Du är här»-stift. Ingen CAD. Inga redskapsrader under märket i minin |
| 5 | Pass utan placeringar («ingen hall») | Ingen karta och ingen «Saknar plats»-rad, även på en Teknik |
| 6 | Oplacerad Teknik, andra stationer placerade | Karta visas utan aktiv markering. Text «Saknar plats» (`UI.buildHallUnplaced`). Inget spökmärke |
| 7 | Uppvärmning eller styrka, hallen har placeringar | Ingen karta på det steget. Nästa placerade Teknik visar kartan igen |
| 8 | Tryck på kartan | Ingenting: Hallöversikt öppnas inte, steget byts inte, klockan påverkas inte |
| 9 | Skiss från Slice 64 | Kvar på Teknik med redskap, under kartan (A1). Saknas fortfarande när steget inte är Teknik eller saknar redskap |
| 10 | `bun test src` | Grön, inkl. nya `runHallMini`-tester (F1). Bundle inom +512 B gzip mot `83965f7` |
