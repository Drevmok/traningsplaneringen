# Slice 57 — verifieringschecklista (LÅST: A2 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Admin-konto för A-raderna. SQL inklistrad av Christoffer före merge/deploy (och före körning).

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Admin → Biblioteket → Teknik-övning → «Ändra i banken» → «Ställ upp stationen» | Ett **eget blad** «Så ska stationen stå» öppnas med redskapen i appens ordning. Redskapsbladet (Välj redskap) har **ingen** skissyta under chip-listan |
| 1b | Ny egen övning (Teknik) → «Ställ upp stationen» | Samma skissblad öppnas; layouten följer med vid «Skicka till banken» |
| 2 | I skissbladet: dra ett redskap, tryck «Vrid», «Klar», spara formuläret, ladda om sidan, öppna igen | Samma position och vridning |
| 3 | Ledare (annan enhet/profil) efter synk → övningens detaljvy | Skissen visar admins ordning, inte heuristiken |
| 4 | Samma övning med layout som har trampett utan madrass | Inga automatiska ansatskuddar, ingen ansatstext (D1) |
| 5 | Övning utan layout, t.ex. «Ljushopp på satsbräda» | Skiss identisk med main @ 9a452c7 (`evidence/c2-detail.png`, `c3-detail-scrolled.png`) |
| 6 | Skriv ut passet med övningen | Utskriften visar samma skiss som detaljvyn (jfr `evidence/c5-print.png`) |
| 7 | Ta bort ett redskap i Välj redskap, öppna skissbladet igen | Dess poser är borta; Förrådslista och skiss har samma redskap |
| 8 | Öka antal 1 → 3, minska till 2 | 2 nya poser, sedan 1 bort; sparat utan fel från triggern |
| 9 | Icke-Teknik-övning i «Ändra i banken» | Ingen knapp «Ställ upp stationen» |
| 10 | Passbyggaren → Hallöversikt → **Redigera redskap** | Ingen knapp, inget skissblad; Hallöversikt ser ut som på main (ett märke per station) |
| 11 | Ledaren ändrar redskap för passet i **Redigera redskap** | Detaljvy/utskrift visar heuristik från passets lista; «Använd förslag» → layout igen |
| 12 | Synka, flygplansläge, ladda om, öppna övningen | Layouten syns offline |
| 13 | Cache med trasig layout (fel `v`, NaN, okänt pieceId) | Ingen krasch, heuristik |
| 14 | Bank utan kolumnen (fixtur/testprojekt) | Bank laddar, heuristik |
| 15 | Liggande telefon 844×390, skissbladet | Går att dra och trycka «Klar»; inget utanför skärmen |
| 16 | Footer | «Slice 57» |
| 17 | `npm run build`, `npm run lint`, `bun test src` | Gröna; bundle gz rapporterad mot main, över +512 B godkänt av Christoffer (siffran ändå i PR) |
| 18 | `app/package.json` | Ingen `three`/WebGL-beroende |
