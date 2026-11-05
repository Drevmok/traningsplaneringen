# Slice 59 — verifieringschecklista (FÖRESLAGEN, ★ A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Admin-konto i testbank (fake bank / egen databas), **aldrig** den riktiga banken. Ingen SQL. Fixtur: minst 3 published Teknik med redskap utan layout, 1 pending Teknik med redskap utan layout, 1 hidden Teknik med redskap utan layout, 1 Teknik med giltig layout, 1 Teknik utan redskap, 1 published Teknik med layout där antalet inte stämmer mot redskapen, 1 uppvärmning med redskap.

Raderna skrivs om vid låset om Christoffer väljer annat än ★.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Admin → Admin-vyn | Sektionen «Saknar skiss (5)» finns under «Importera övningar» och över «Föreningens mallar», hopfälld |
| 2 | Öppna sektionen | Hinten syns. Exakt de 3 published, den pending (med märket «Väntar») och raden med felaktigt antal. Inte hidden, inte raden med layout, inte Teknik utan redskap, inte uppvärmningen |
| 3 | Ordning i kön | Samma inbördes ordning som i banken (`sortOrder`) |
| 4 | Tryck på ett kort i kön | «Ändra övning i banken» öppnas med «Så ska stationen stå» redan öppet ovanpå |
| 5 | Flytta ett redskap, «Klar» | Bladet stängs, formuläret står kvar med samma redskap |
| 6 | «Spara i banken» | Toast «Sparat i banken.»; raden borta ur kön; rubriken visar «Saknar skiss (4)» |
| 7 | Nästa kort i kön: stäng skissbladet utan «Klar», sedan «Avbryt» | Inget sparas; raden står kvar i kön |
| 8 | Raden med felaktigt antal: ställ upp, «Klar», spara | Raden borta ur kön; sparad layout har samma antal som redskapen; inget triggerfel |
| 9 | Spara alla rader i kön | Sektionen försvinner helt |
| 10 | En sparad rad: Biblioteket → «Ändra i banken» → «Ställ upp stationen» → «Ställ i rad igen» → «Klar» → «Spara i banken» | Layouten tas bort; raden tillbaka i kön; ledaren ser den automatiska skissen |
| 11 | Konflikt: ändra raden i en annan flik, spara sedan från kön | «adminSaveConflict»-texten som i dag; raden kvar i kön |
| 12 | Offline (flygplansläge) med formuläret öppet från kön | «Spara i banken» avstängd med offline-texten som i dag |
| 13 | Inga Väntar/Granskas/Dolda men kön har rader | «Inget väntar just nu.» syns överst; kön syns längre ner |
| 14 | Kort i «Väntar på godkännande» / «Behöver granskas» / «Dolda» | Öppnar detaljvyn som i dag, inte formuläret |
| 15 | Ledare (inte admin) efter synk: en städad rad och en ostädad rad, detaljvy och **Skriv ut passet** | Städad: sparad uppställning. Ostädad: skiss identisk med main @ `3f0a729` |
| 16 | Biblioteket i admin-läge | Inga nya chips eller filter (Slice 47 AC12) |
| 17 | Hallöversikt → **Redigera redskap**; Planera pass | Oförändrat mot main |
| 18 | Liggande 844×390 | Sektionen går att öppna; skissbladets «Klar» och formulärets «Spara i banken» nås |
| 19 | Footer | «Slice 59» |
| 20 | `npm run build`, `npm run lint`, `bun test src` (inkl. `layoutQueue.test.ts`); smokes slice-32 och slice-47 mot baslinjen | Gröna; smokes SAMMA förutom footern; bundle gz mot main rapporterad, väntat ≤ +512 B |
| 21 | Efter live (Christoffer, inte Verifier-grind): städpass, sedan stickprov på 3 städade rader som ledare | Raderna visar uppställningen; heuristiken finns kvar där layout saknas |
