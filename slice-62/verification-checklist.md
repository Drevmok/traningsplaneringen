# Slice 62 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs. Testdata: bundlade seederna räcker för 1–8 och 10–12 (offline eller stand-in med samma länkar som seederna). Admin-konto bara i testbank / egen databas, **aldrig** den riktiga banken. Ingen SQL. Fixtur för 8: en JSON-övning med 3 steg plus raden «Medan du väntar: hoppa».

**14 kontroller.** Föreslaget lås A1 B1 C1 D1 E1 F1.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Passbyggaren → Minihjul (krabbhjul) på en Teknik-rad | «Svårare» syns, inte «Lättare». Tryck «Svårare»: titeln blir Hjul. Minuterna oförändrade. Ingen ny rad i passet |
| 2 | Hallöversikt för samma station, före och efter bytet | Fortfarande ett märke, på samma plats (`item.id` orört). Ingen ny sidostation |
| 3 | Samma rad efter bytet till Hjul | «Lättare» syns, inte «Svårare». Tryck «Lättare»: titeln blir Minihjul (krabbhjul) igen. Minuter och märke kvar |
| 4 | Grenhopp från trampett (mitt i kedjan) | Båda chippen syns. «Lättare» → Landningar upp på och ner från plint. «Svårare» → Formhopp över block från trampett. Minuter kvar |
| 5 | Bro (inte bland de 16) i Passbyggaren, detaljvy och Kör passet | Inga chip. «Så gör du» och Kör som på main. Inga «Lättare» / «Svårare» i Kör passet ens på länkade övningar (B1) |
| 6 | Detaljvy Minihjul och Hjul | Etiketter som i dag: Minihjul visar «Lättare variant av: Hjul». Hjul visar «Bygger på: Minihjul (krabbhjul)». Inga nya rubriker |
| 7 | En Teknik med osatt redskap byts. En med ifyllda redskap byts | Osatt: förslagen följer den nya övningen. Ifylld lista: samma redskap kvar, inte överskrivna |
| 8 | Admin: importera JSON med 3 steg + «Medan du väntar: hoppa», välj «Ta med», spara som egen/pending enligt befintligt flöde | Övningen har vänt-raden kvar under «Så gör du». Steglistan har 3 punkter, inte 4 |
| 9 | Liggande 844×390, länkad Teknik-rad | Chippen går att trycka utan att täcka × eller minuterna |
| 10 | Footer | «Slice 62» |
| 11 | `npm run build`, `npm run lint`, `bun test src` (inkl. hjälpfunktion, byte, seed-9-par, import med vänt-rad). `pick-smokes 04af122 <head>` och de träffade smokes mot baslinjen | Gröna. Troligen hela loopen p.g.a. `blockMeta.ts`. Smokes SAMMA förutom footer 61→62 och att chip syns på länkade rader |
| 12 | Bundle gz (js+css) mot main @ `04af122` | Rapporterad, väntat ≤ +512 B. Annars stryk par enligt E1, inget undantag |
| 13 | Skriv ut passet för ett pass med en länkad Teknik | Som på main: ingen ny Lättare/Svårare-rad |
| 14 | Efter live (Christoffer, inte Verifier-grind, A1): `content/update-progression-links.sql` inklistrad på riktiga banken, efter Christoffers ja, och först när appen är live | Ledare ser chip på samma 16 övningar efter nästa banksynk. RETURNING kan visa färre än 16 (id saknas, eller värdena fanns redan) — då är det OK. Verifier kör inte SQL och inte mot riktiga banken |
