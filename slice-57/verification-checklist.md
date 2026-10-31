# Slice 57 — verifieringschecklista (★-vägen)

Telefon 390×844 om inget annat sägs. Admin-konto för A-raderna. SQL inklistrad av Christoffer före körning.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Admin → Biblioteket → Teknik-övning → «Ändra i banken» → Välj redskap | Skissytan «Så ska stationen stå» syns under chip-listan med redskapen i appens ordning |
| 2 | Dra ett redskap, tryck «Vrid», spara, ladda om sidan, öppna igen | Samma position och vridning |
| 3 | Ledare (annan enhet/profil) efter synk → övningens detaljvy | Skissen visar admins ordning, inte heuristiken |
| 4 | Samma övning med layout som har trampett utan madrass | Inga automatiska ansatskuddar, ingen ansatstext (D1) |
| 5 | Övning utan layout, t.ex. «Ljushopp på satsbräda» | Skiss identisk med main @ 9a452c7 (`evidence/c2-detail.png`, `c3-detail-scrolled.png`) |
| 6 | Skriv ut passet med övningen | Utskriften visar samma skiss som detaljvyn (jfr `evidence/c5-print.png`) |
| 7 | I skissytan: ta bort ett redskap ur chip-listan | Dess poser försvinner direkt; Förrådslista och skiss har samma redskap |
| 8 | Öka antal 1 → 3, minska till 2 | 2 nya poser, sedan 1 bort; sparat utan fel från triggern |
| 9 | Icke-Teknik-övning i «Ändra i banken» | Ingen skissyta |
| 10 | Passbyggaren → Hallöversikt → **Redigera redskap** | Ingen skissyta; Hallöversikt ser ut som på main (ett märke per station) |
| 11 | Ledaren ändrar redskap för passet i **Redigera redskap** | Detaljvy/utskrift visar heuristik från passets lista; «Använd förslag» → layout igen |
| 12 | Synka, flygplansläge, ladda om, öppna övningen | Layouten syns offline |
| 13 | Cache med trasig layout (fel `v`, NaN, okänt pieceId) | Ingen krasch, heuristik |
| 14 | Bank utan kolumnen (fixtur/testprojekt) | Bank laddar, heuristik |
| 15 | Liggande telefon 844×390, skissytan | Går att dra och spara; inget utanför skärmen |
| 16 | Footer | «Slice 57» |
| 17 | `npm run build`, `npm run lint`, `bun test src` | Gröna; bundle gz rapporterad mot main, över +512 B bara med Christoffers OK |
| 18 | `app/package.json` | Ingen `three`/WebGL-beroende |
