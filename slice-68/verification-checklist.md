# Slice 68 — verifieringschecklista (LÅST: A1 B1 C1 D2 E1 F1)

Låst 25 nov 2026 13:42: A1 B1 C1 D2 E1 F1. SQL i `sql/` körs bara efter merge, och bara efter Christoffers **separata** ja. Agenter kör aldrig SQL. **10 kontroller.**

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Footer | «Slice 68». `SLICE_NUMBER = '68'` |
| 2 | Admin → «Föreningens redskap» | De 15 delarna i `EQUIPMENT_PIECES`-ordning, av/på. Inte ifylld från början. Spara som admin. Tränare (utan admin) ser ingen redigeringsyta och inte listan i Förrådslista |
| 3 | Inte ifylld lista | Inga «Föreningen saknar …» i Redigera redskap, Bygg hallen eller utskriften, även om stationen har redskap |
| 4 | Admin tar bort t.ex. Trampett, öppnar Redigera redskap på en station med trampett | Vald rad (och ev. rutnätsknapp) märks. Text «Föreningen saknar: Trampett». Biblioteket filtreras inte; övningen går fortfarande att lägga till. D2: ingen «Förslag:»-rad och inget ersättningsredskap eller annan övning föreslås |
| 5 | Samma station i Bygg hallen och i utskriftens sektion «Bygg hallen» | Samma saknas-rad under redskapen. Ett märke per station. Förrådslista fortfarande platt, utan «Vad finns i hallen ikväll?» och utan stationsuppdelning |
| 6 | Tom lista (alla 15 av) | Varje station med slots visar saknas för de slottade delarna. Giltigt, skilt från «inte ifylld» |
| 7 | Bannern «N stationer saknar redskap» | Oförändrad betydelse (osparad redskapslista). Inte densamma som föreningens lucka |
| 8 | «Visa bara övningar vi kan köra ikväll» och egen redskapskatalog | Finns inte. Bara de 15 fasta delarna. Inga Slice 47-nycklar läses |
| 9 | `bun test src` | Grön, inkl. nya hjälp-tester (F1). Bundle inom +512 B gzip mot `0f3be79`. Coach-GET tillåter `club_equipment` med publishable key, utan `Authorization` |
| 10 | SQL | Filerna i `sql/` är additiva (`IF NOT EXISTS`), utan `DELETE`. Ingen agent har kört dem mot live. Körning bara efter merge, efter hans separata ja |
