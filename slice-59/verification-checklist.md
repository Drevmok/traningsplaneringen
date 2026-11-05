# Slice 59 — verifieringschecklista (FÖRESLAGEN, ★ A1 B1 C1 D1 E1 F1 G1 H1)

Telefon 390×844 om inget annat sägs. Admin-konto i testbank (fake bank / egen databas), **aldrig** den riktiga banken. Ingen SQL. Fixtur: minst 3 published Teknik med redskap utan layout, 1 pending Teknik med redskap utan layout, 1 hidden Teknik med redskap utan layout, 1 Teknik med giltig layout, 1 Teknik utan redskap, 1 published Teknik med layout där antalet inte stämmer mot redskapen, 1 uppvärmning med redskap. En av de 3 published utan layout har trampett utan bana (visar ansatsmattor). Ytterligare 1 Teknik med Slice 58-layout (`y` och `surface`), och 1 egen övning med layout i localStorage.

**Kontroll 9 tömmer kön.** Återställ testbanken till fixturen före kontroll 11. Kontroll 11–23 använder var sin rad i kön där det går, och 16 och 18 tar bort en rad var.

**Läsa layouten:** i testbanken via appens nätverkstrafik eller en läsande REST-hämtning av raden. Ingen SQL. «Identisk» = samma JSON före och efter.

**34 kontroller** (21 före rev 2026-11-05). Nya: 11–23 (G1 H1). Gamla 11–21 är nu 24–34. Kontroll 6 har fått kontrollen av sparad layout.

Raderna skrivs om vid låset om Christoffer väljer annat än ★.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Admin → Admin-vyn | Sektionen «Saknar skiss (5)» finns under «Importera övningar» och över «Föreningens mallar», hopfälld |
| 2 | Öppna sektionen | Hinten syns. Exakt de 3 published, den pending (med märket «Väntar») och raden med felaktigt antal. Inte hidden, inte raden med layout, inte Teknik utan redskap, inte uppvärmningen |
| 3 | Ordning i kön | Samma inbördes ordning som i banken (`sortOrder`) |
| 4 | Tryck på ett kort i kön | «Ändra övning i banken» öppnas med «Så ska stationen stå» redan öppet ovanpå |
| 5 | Flytta ett redskap, «Klar» | Bladet stängs, formuläret står kvar med samma redskap |
| 6 | «Spara i banken» | Toast «Sparat i banken.»; raden borta ur kön; rubriken visar «Saknar skiss (4)»; raden har `default_station_layout` `{ "v": 1, "poses": [...] }` med den flyttade posen |
| 7 | Nästa kort i kön: stäng skissbladet utan «Klar», sedan «Avbryt» | Inget sparas; raden står kvar i kön |
| 8 | Raden med felaktigt antal: ställ upp, «Klar», spara | Raden borta ur kön; sparad layout har samma antal som redskapen; inget triggerfel |
| 9 | Spara alla rader i kön | Sektionen försvinner helt |
| 10 | En sparad rad: Biblioteket → «Ändra i banken» → «Ställ upp stationen» → «Ställ i rad igen» → «Klar» → «Spara i banken» | Layouten tas bort; raden tillbaka i kön; ledaren ser den automatiska skissen |
| 11 | **G1 (a)** Kort i kön (Teknik med trampett, ingen bana, ingen layout): rör ingenting, «Klar», «Spara i banken» | Toast «Sparat i banken.». Raden har fortfarande `default_station_layout` = `null`. Raden står kvar i kön, n oförändrat. Ledaren: automatisk skiss med ansatsmattor och ansatstexten, i detaljvyn och på **Skriv ut passet** |
| 12 | **G1 (a)** Samma rad: välj ett redskap med Tab (fokus, markering) utan att flytta, «Klar», spara | Som föregående rad: `null`, kvar i kön |
| 13 | **G1 (b)** Rad med giltig layout: Biblioteket → «Ändra i banken» → «Ställ upp stationen» → «Klar» → «Spara i banken» | Sparbegäran innehåller inte `default_station_layout`. Kolumnens JSON före och efter är identisk. Ledarens skiss oförändrad |
| 14 | **G1 (b)** Rad med Slice 58-layout (`y` och `surface`): samma flöde | Kolumnen identisk, `y` och `surface` kvar |
| 15 | **G1 (d)** Kort i kön: piltangent → och sedan ←; Vrid fyra gånger; Höjd upp och sedan ner; Bredare yta och sedan Standardyta. «Klar», spara | Räknas som oförändrat: `null` kvar, kvar i kön, automatisk skiss |
| 16 | **G1 (d)** Kort i kön: dra ett redskap tydligt (minst 1 cm) med fingret och ungefär tillbaka, «Klar», spara | Räknas som ändring: layout sparas, raden lämnar kön |
| 17 | **G1 (e)** Kort i kön: «Ställ i rad igen», «Klar», spara | `null` kvar, kvar i kön, automatisk skiss (ingen layout = automatisk) |
| 18 | **G1 (e)** Kort i kön: «Ställ i rad igen», flytta ett redskap, «Klar», spara | Layout sparas, raden lämnar kön |
| 19 | Kort i kön: öppna inte bladet, «Välj redskap» och lägg till ett redskap, spara | `null` kvar, kvar i kön (C1 från 57) |
| 20 | **G1 (f)** Rad med layout: flytta, stäng bladet via bakgrunden, «Spara i banken». Sedan: flytta, «Klar», «Avbryt» | Båda gångerna: kolumnen identisk med före |
| 21 | **H1 (g)** Biblioteket → «Ändra i banken» på Teknik utan layout (inte via kön): «Ställ upp stationen» → «Klar» → spara | `null` kvar, raden i kön, automatisk skiss |
| 22 | **H1 (g)** Admin → «Ny egen övning», Teknik med trampett: «Ställ upp stationen» → «Klar» → spara | Ny pending rad utan layout (`null`), syns i kön med «Väntar» |
| 23 | **H1 (g)** Biblioteket → egen övning (inte admin), Teknik med trampett: «Ställ upp stationen» → «Klar» → spara. Sedan en egen övning med layout: «Klar» utan ändring, spara | Första: ingen `defaultStationLayout` sparad, detaljvyn visar automatisk skiss med ansatsmattor. Andra: layouten oförändrad |
| 24 | Konflikt: ändra raden i en annan flik, spara sedan från kön | «adminSaveConflict»-texten som i dag; raden kvar i kön |
| 25 | Offline (flygplansläge) med formuläret öppet från kön | «Spara i banken» avstängd med offline-texten som i dag |
| 26 | Inga Väntar/Granskas/Dolda men kön har rader | «Inget väntar just nu.» syns överst; kön syns längre ner |
| 27 | Kort i «Väntar på godkännande» / «Behöver granskas» / «Dolda» | Öppnar detaljvyn som i dag, inte formuläret |
| 28 | Ledare (inte admin) efter synk: en städad rad och en ostädad rad, detaljvy och **Skriv ut passet** | Städad: sparad uppställning. Ostädad: skiss identisk med main @ `3f0a729` |
| 29 | Biblioteket i admin-läge | Inga nya chips eller filter (Slice 47 AC12) |
| 30 | Hallöversikt → **Redigera redskap**; Planera pass | Oförändrat mot main |
| 31 | Liggande 844×390 | Sektionen går att öppna; skissbladets «Klar» och formulärets «Spara i banken» nås |
| 32 | Footer | «Slice 59» |
| 33 | `npm run build`, `npm run lint`, `bun test src` (inkl. `layoutQueue.test.ts` och `sameLayout` i `stationLayout.test.ts`); smokes slice-32 och slice-47 mot baslinjen | Gröna; smokes SAMMA förutom footern; bundle gz mot main rapporterad, väntat ≤ +512 B |
| 34 | Efter live (Christoffer, inte Verifier-grind): städpass, sedan stickprov på 3 städade rader som ledare | Raderna visar uppställningen; heuristiken finns kvar där layout saknas |
