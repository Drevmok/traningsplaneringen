# Slice 58 — verifieringschecklista (LÅST 2026-11-01: A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Admin-konto för bladraderna. Ingen SQL (A1; valfria `schema-58.sql` hoppas över). Bundle över +512 B OK, exakt siffra i PR.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Admin → Teknik-övning med 2 landningsmattor → «Ändra i banken» → «Ställ upp stationen» | Bladet öppnas; knapparna «Höjd +» och «Höjd −» finns för valt redskap; «Höjd −» är avstängd på golvet |
| 2 | Lägg mattorna på samma x/z, välj den ena, «Höjd +» en gång | Den ligger synligt ovanpå den andra; «Lager 1» visas |
| 3 | Dra det staplade redskapet i sidled | x/z ändras, höjden ligger kvar (Lager 1), inget hopp i djup |
| 4 | Tangent PageUp/PageDown på valt redskap; pilar Upp/Ned | PageUp/Down = höjd; pilar = djup som i Slice 57 |
| 5 | «Höjd +» 8 gånger | Stannar på Lager 8; «Höjd +» avstängd |
| 6 | «Klar», spara, ladda om, öppna igen | Samma höjd, position, vridning och yta |
| 7 | Ledare efter synk → detaljvy och **Skriv ut passet** | Stapeln syns lika i båda; inget klipps |
| 8 | Gles layout (2 redskap nära mitten) i detaljvyn | Mindre tom kant än main; inget klipps |
| 9 | Tät layout ända ut till x 0 och 1 med vridning | Inget mark klipps i blad, detaljvy eller utskrift |
| 10 | «Bredare yta» ×2, «Högre yta» ×1, Klar, spara, öppna i detaljvy | Ytan större i båda; «Standardyta» återställer |
| 11 | «Ställ i rad igen» | Poser i rad, ingen höjd, standardyta |
| 12 | Slice 57-layout utan `y` (befintlig rad) | Ritas platt som på main; spara utan ändring → JSON utan `y`/`surface` |
| 13 | Övning utan layout, t.ex. «Ljushopp på satsbräda» | Skiss identisk med main @ b610103 (heuristik) |
| 14 | Cache med trasig `y` (NaN, "hög", 5) och `surface` (-3) | Ingen krasch; y klämt/utelämnat, surface 0–2 |
| 15 | Spara layout med höjd mot banken | Inget triggerfel (befintlig `schema-57.sql`) |
| 16 | Synka, flygplansläge, ladda om | Stapel och yta syns offline |
| 17 | Hallöversikt → **Redigera redskap** | Oförändrat: ett märke per station, inget skissblad |
| 18 | Liggande 844×390, skissbladet | Höjd- och ytknappar nåbara, «Klar» nåbar |
| 19 | Footer | «Slice 58» |
| 20 | `npm run build`, `npm run lint`, `bun test src`; `app/package.json` | Gröna; bundle gz rapporterad mot main; ingen `three`/WebGL |
