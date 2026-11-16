# Slice 63 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Testdata: bundlade seederna räcker (offline eller stand-in med samma länkar som seederna). Ingen SQL. Admin-konto behövs inte.

**12 kontroller.** Föreslaget A1 B1 C1 D1 E1 F1 — uppdateras vid lås.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Ett pass med Minihjul, Grenhopp och Bro (gärna hallmärken). Tryck Ny vecka → Skapa kopia | Kopian landar i Passbyggaren med titel «Ny vecka — …». Raden «Gör Teknik ett steg svårare» syns. Övningarna är ännu oförändrade. Förra passet finns som mall, ostegat |
| 2 | Tryck «Gör Teknik ett steg svårare» | Minihjul blir Hjul, Grenhopp blir Formhopp över block. Bro orörd. Inga nya rader. Minuter oförändrade. Raden försvinner |
| 3 | Hallöversikt för samma stationer, före och efter steget | Fortfarande ett märke per station, på samma plats (`item.id` orört). Ingen ny sidostation |
| 4 | Toast «Teknik är ett steg svårare.» · Ångra. Tryck Ångra | Minihjul och Grenhopp tillbaka. Bro orörd. Förra veckans mall fortfarande ostegad. Raden kan visas igen (samma kopia, fortfarande mål) |
| 5 | Ny vecka från ett pass med bara Bro, eller bara redan svåraste led (Formhopp, Hjul) | Kopian skapas som i dag. Raden «Gör Teknik ett steg svårare» syns inte. Inget är bytt |
| 6 | Ett pass med Ljushopp i rockringar. Ny vecka, ett tryck på raden | Titeln blir Ljushopp på satsbräda, inte Ljushopp på trampett. Minuter och märke kvar |
| 7 | Kör passet, både om ledaren hoppat över raden och efter ett steg | Ingen ny kontroll, inga «Lättare»/«Svårare»-chip (Slice 62). Kör visar de titlar som ligger i passet |
| 8 | En Teknik med osatt redskap stegas. En med ifyllda redskap stegas | Osatt: förslagen följer den nya övningen. Ifylld lista: samma redskap kvar, inte överskrivna |
| 9 | Liggande 844×390, efter Ny vecka | Raden går att trycka utan att täcka Ny vecka, Teknik-raderna eller × |
| 10 | Footer | «Slice 63» |
| 11 | `npm run build`, `npm run lint`, `bun test src` (inkl. hjälpfunktion och att Ny vecka själv inte stegar). `pick-smokes 2917296 <head>` och de träffade smokes mot baslinjen | Gröna. Troligen hela loopen p.g.a. `blockMeta.ts`. Smokes SAMMA förutom footer 62→63 och att kontrollen syns efter Ny vecka när länkade rader finns |
| 12 | Bundle gz (js+css) mot main @ `2917296`. Skriv ut passet efter ett steg | Bundle rapporterad, väntat ≤ +512 B. Utskriften som på main, med de nya titlarna, utan den valfria raden |
