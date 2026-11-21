# Slice 65 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Testdata: bundlade seederna efter Planera pass eller «Använd alla förslag» så att stationer är placerade och `stationEquipment` satt. En oplacerad Teknik behövs för kontroll 3 (ta bort ett märke i redigeringsläget). En övning med sparad `defaultStationLayout` behövs för kontroll 4 — seeds har ingen layout. Ingen SQL. Admin-konto behövs inte för kontroll 1–3 och 5–13.

**13 kontroller.** Föreslaget A1 B1 C1 D1 E1 F1 — uppdateras vid lås.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Ett pass med minst två placerade Teknik. Öppna «Bygg hallen» från Hallöversikt eller Golvklart | Första steget: märkesnummer + titel, skiss (auto-rad om ingen layout), redskap med antal från stationen, avbockning. Det befintliga märket är markerat. Inget extra märke |
| 2 | Gå Nästa / Föregående genom stationerna | Ordningen följer märkesnumren (passordning), inte var märkena står på kartan. Markeringen flyttar till aktuellt märke |
| 3 | En Teknik utan plats på hallen | Steget kommer efter de numrerade, utan nummer, med text «Saknar plats». Inget påhittat märke på kartan |
| 4 | En Teknik med giltig sparad layout, och en utan (seed) | Sparad layout ritas; seed visar auto-rad. Bildtext «Skiss — så kan stationen stå.» Teknik utan redskapsslots: ingen skiss, steget finns kvar |
| 5 | Bocka «Byggd», byt steg och tillbaka; avsluta guiden och öppna den igen | Avbockningen håller under genomgången. Efter avsluta är den borta (minne, ingen sessionsfält). Placeringar oförändrade |
| 6 | Efter Avsluta: Golvklart | Vanlig gruppvy. «Avsluta golvklart», Förrådslista och Skriv ut passet fungerar som på main. Inget stegläge kvar |
| 7 | Hallöversikt i redigeringsläge, brickraden och Redigera redskap | Som på main. Inga nya märken, ingen CAD, inga redskapspinnar |
| 8 | Skriv ut passet (från Dela och från Golvklart) | En sektion «Bygg hallen» med samma stationer, skiss, redskap + antal och tom avbockningsruta. Tidslinje, hallkarta och Förrådslista (pass-bred summa) är kvar. Ingen andra utskrift. Inte Se upp för / Säkerhet i uppställningssektionen |
| 9 | Förrådslista på skärmen | Oförändrad platta summa. Ingen per-stationsuppdelning, inga «saknas»/alternativ (S9) |
| 10 | Liggande 844×390, Bygg hallen + Golvklart | Panel, skiss, nav och märken går att läsa. Inget täcker Avsluta |
| 11 | Footer | «Slice 65» |
| 12 | `npm run build`, `npm run lint`, `bun test src` (inkl. `hallSetupSteps`). `pick-smokes 6698a63 <head>` och de träffade smokes mot baslinjen | Gröna. Troligen hela loopen p.g.a. `blockMeta.ts` (och ev. `App.css`). Smokes SAMMA förutom footer 64→65, Bygg hallen-steg och utskriftssektionen |
| 13 | Bundle gz (js+css) mot main @ `6698a63` | Rapporterad, väntat ≤ +512 B. Ingen SQL har körts |
