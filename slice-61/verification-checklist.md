# Slice 61 — verifieringschecklista (LÅST: A1 B1 C2 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Testdata: bundlade seederna räcker för kontroll 1–8 och 10–12 (offline eller stand-in med samma `how_to` som seederna). Admin-konto bara i testbank / egen databas, **aldrig** den riktiga banken. Ingen SQL. Fixtur för 6–8: en published Teknik med 4 steg plus vänt-rad (t.ex. Grenhopp från trampett), en Teknik utan vänt-rad (t.ex. Bro), och möjlighet att skapa en egen Teknik.

**14 kontroller.** Låst A1 B1 C2 D1 E1 F1.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Biblioteket → Grenhopp från trampett (detaljvy) | Under «Så gör du» syns de fyra stegen som i dag, plus en egen rad «Medan du väntar: öva grenhopp på golvet, landa mjukt på två fötter.» Raden är inte ett femte numrerat steg |
| 2 | Passbyggaren: samma övning på ett golvkort (ActivityTip) | Steglistan har exakt 4 punkter. Vänt-raden ligger som egen text under stegen, före «Se upp för» |
| 3 | Kör passet på ett pass där den övningen ingår | Cue under «Så gör du» är fortfarande första steget («Kort ansats, studs mitt i trampetten.»). Under cue syns vänt-raden. «Nästa», «Kvar», klocka och nav oförändrade |
| 4 | Hallöversikt för samma station | Fortfarande ett märke. Ingen ny sidostation |
| 5 | Detaljvy och Kör passet för Bro (inte bland de 16) | Ingen vänt-rad. «Så gör du» som på main |
| 6 | Admin → «Ändra i banken» på Grenhopp från trampett | Textarean «Så gör du» har 4 rader (inga vänt-rad där). Fältet «Medan du väntar» visar payloaden utan prefix. Spara utan ändring: toast som i dag, övningen syns fortfarande i Biblioteket, raden kvar |
| 7 | Samma formulär: töm vänt-fältet, spara. Sedan fyll i en kort rad och spara igen | Först: vänt-raden borta i detaljvy och Kör, de 4 stegen kvar. Sedan: den nya raden syns med prefixet, fortfarande 4 steg, övningen inte försvunnen ur banken |
| 8 | Egen övning, Teknik, 3 steg, ifyllt vänt-fält, spara. Öppna detaljvy och Kör | Vänt-raden syns på båda ställena. Steglistan har 3 punkter |
| 9 | Liggande 844×390 | Vänt-raden syns i detaljvy och i Kör utan att täcka klocka eller nav |
| 10 | Footer | «Slice 61» |
| 11 | `npm run build`, `npm run lint`, `bun test src` (inkl. hjälpfunktion, `rowToEntry` med 4 steg + vänt-rad, seed-16). `pick-smokes 9d4813b <head>` och de träffade smokes mot baslinjen | Gröna. Smokes SAMMA förutom footern 59→61. En 4-stegs rad med vänt-text laddas; en rad med fem riktiga steg hoppas över som i dag |
| 12 | Bundle gz (js+css) mot main @ `9d4813b` | Rapporterad, väntat ≤ +512 B. Annars korta/stryk enligt E1, inget undantag |
| 13 | Skriv ut passet för ett pass med en av de 16 | Som på main: ingen «Så gör du»-sektion, ingen vänt-rad tillagd |
| 14 | Efter live (Christoffer, inte Verifier-grind, C2): `content/update-how-to-waiting.sql` inklistrad på riktiga banken, efter Christoffers ja, och först när appen är live | Ledare ser samma text som i seederna efter nästa synk. RETURNING kan visa färre än 16 (rad fanns redan, id saknas, eller tillägget skulle bli längre än 800) — då fylls ev. rest i Admin. Verifier kör inte SQL och inte mot riktiga banken |
