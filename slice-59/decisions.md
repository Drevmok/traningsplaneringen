# Slice 59 — beslut

**LÅST 2026-11-05 av Christoffer** via PO-chatten, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1 G1 H1. Ändra Slice 57-flödet så Klar utan ändring bevarar skissen i alla skissvyer.»

Alla ★-förslag valda (A1 B1 C1 D1 E1 F1 G1 H1). **Ingen SQL.** Bundle **inom** +512 B gzip — **inget undantag** (till skillnad från Slice 57/58). Builder rapporterar exakta byte mot main i PR. Footer `SLICE_NUMBER` → 59. Städpasset efter live gör Christoffer (innehåll, inte Builder).

| Fråga | Val |
|---|---|
| A | **A1 ★** — inget automatiskt. Städningen är manuell: admin går igenom kön och sparar med befintlig redigerare. Inga nya knappar i skissbladet. |
| B | **B1 ★** — kön: Teknik med minst ett redskap, ingen giltig layout efter sanering, status published eller pending (inte dolda). Ordning = `sortOrder`. |
| C | **C1 ★** — egen hopfälld sektion «Saknar skiss (n)» i Admin, under «Importera övningar» och över «Föreningens mallar». Visas bara när n > 0. Ingår inte i `LISTS`. |
| D | **D1 ★** — kort i kön → «Ändra övning i banken» med skissbladet redan öppet. «Klar» → formuläret → «Spara i banken». |
| E | **E1 ★** — ledarens vy byte-identisk med main (heuristik, detaljvy, **Skriv ut passet**, Hallöversikt, **Redigera redskap**, Planera pass). Admin-listorna Väntar/Granskas/Dolda oförändrade. Ingen schemaändring. |
| F | **F1 ★** — A1 B1 C1 D1 E1 G1 H1. Ingen SQL, ingen ny kolumn, inget märke «Automatisk skiss räcker». Footer «Slice 59». Bundle inom +512 B gzip (inget undantag). |
| G | **G1 ★** — «Klar» jämför resultatet med startläget (`sameLayout`). Lika → tillbaka exakt `initialLayout` (flytta och flytta tillbaka = oförändrat). «Ställ i rad igen» → `undefined` (Slice 57-betydelse kvar). |
| H | **H1 ★** — regeln gäller **överallt** där skissbladet öppnas (Admin-kön, Admin «Ny egen övning», Biblioteket «Ändra i banken», egen övning). **Ersätter uttryckligen Slice 57-beteendet för «Klar» utan ändring.** |

## H1 ersätter Slice 57 «Klar»

Slice 57 (`slice-57/decisions.md` @ `658265e`, A2 B1 C1 D1 E1 F1) sa att «Klar» lämnar layouten i formuläret, utan jämförelse mot startläget. Följden på main: öppna skissbladet utan layout → «Klar» sparar startraden som layout.

**H1 supersedes det:** i **alla** skissvyer (alla ställen där `StationLayoutSheet` öppnas) gäller:
- «Klar» **utan ändring** → returnerar startläget (`initialLayout`: `undefined` eller samma objekt). Ingen ny rad-uppställning sparas. «Spara i banken» lämnar `default_station_layout` orörd (`null` kvar, eller befintlig JSON byte för byte samma).
- «Ställ i rad igen» behåller sin Slice 57-betydelse: «Klar» efteråt → `undefined` (tar bort sparad layout / automatisk skiss).

## Svar på öppna frågor

Christoffer låste A1–H1 ordagrant. Fråga 9/H1 fick uttryckligt ja i citatet («Ändra Slice 57-flödet så Klar utan ändring bevarar skissen i alla skissvyer»). Övriga (1–6, 8, 10) besvarades inte var för sig — Docs tar ★-förslagen genom A1–H1-låset. Fråga 7 = själva låscitatet.

1. **Rubrik:** «Saknar skiss (n)» (★). Inte «Saknar layout» / «Saknar uppställning». *(★ via lås; inte svarat separat.)*
2. **Väntande rader:** ja — published + pending, inte dolda (B1). *(★ via lås.)*
3. **Hoppet:** öppna skissbladet direkt från kön (D1). *(★ via lås.)*
4. **Tidiga Slice 57-skisser:** ingen lista «Har skiss (n)» (inte F2). Nås via Biblioteket → «Ändra i banken». *(★ via lås.)*
5. **«Skissen räcker»:** nej i denna slice (skulle kräva kolumn och SQL). *(★ via lås.)*
6. **Städpasset:** Christoffer gör det själv efter live. Verifier stickprovar bara mot testbank. *(★ via lås.)*
7. **Lås:** ja — citatet ovan.
8. **Vad är en ändring (G):** jämför med startläget (G1). Flytta och flytta tillbaka = oförändrat. *(★ via lås; G1 i citatet.)*
9. **Var gäller regeln (H):** överallt där skissbladet öppnas (H1). **Uttryckligt ja** i citatet — ändrar Slice 57-flödet.
10. **Rader som redan fått rad-uppställning av misstag:** visas inte i kön i denna slice (ändrar inte B1). Rättas för hand med «Ställ i rad igen». *(★ via lås.)*

## Avvisat
- A2 (knapp «Ta bort skissen»), A3 (skript/SQL som fyller heuristik), B2 (även dolda), B3 (eget märke för felaktig layout), C2 (fjärde lista i `LISTS`), C3 (filterchips i Biblioteket), D2 (via detaljvyn), D3 (spara direkt från bladet), F2 (lista «Har skiss»), **G2** (ändringsflagga), **H2** (regeln bara från kön).

Bas main @ `3f0a729`. Gren `slice-59-docs`. **Ingen merge utan Christoffers OK.** PO skickar bygg- och verifieringskorten; Docs pingar inte Bob.
