# Slice 61 — mikrotext (sv)

**Status:** **LÅST** 2026-11-12 (A1 B1 C2 D1 E1 F1). Texterna oförändrade vid lås.

Prefixet `Medan du väntar:` är låst (Scout / IMPROVEMENTS). Ändra inte formuleringen och översätt den inte. Låsta termer orörda (Passbyggaren, Hallöversikt, Kör passet, Redigera redskap, …). «redskap», inte «utrustning». Ingen sidostation, inget extra hallmärke i texten.

## UI-strängar

| Nyckel (`UI.`) | Text | Var |
|---|---|---|
| `waitingLabel` | Medan du väntar | Etikett på det valfria fältet i Admin och egen övning |
| `waitingHint` | Valfri. En övning i kön, kopplad till huvudövningen. Inget extra märke i hallen. | Under fältet |

Själva raden i detaljvy, golvkort och Kör passet använder prefixet plus payloaden, utan extra etikett.

**Återanvänds oförändrat:** «Så gör du» (`howTo` / `ownSteps`), «Ett steg per rad. Högst fyra.» (`ownStepsHint`), «Se upp för», «Säkerhet», «Kör passet», «Nästa», «Kvar».

## Innehåll — 16 Teknik (B1), prioriteringsordning

Sista raden i `howTo` ska vara exakt `Medan du väntar: ` + payloaden nedan. Om bundle går över +512 B gzip: korta payloaderna först, stryk sedan från slutet av tabellen ner till 12 (E1).

| Prio | id | Titel | Payload (efter prefixet) |
|---|---|---|---|
| 1 | `tech-ljushopp-satsbrada` | Ljushopp på satsbräda | stå på en fot och fäll kroppen fram som till sats. |
| 2 | `tech-ljushopp-trampett` | Ljushopp på trampett | öva ljushopp på stället: armarna upp, landa mjukt. |
| 3 | `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | sitt i kön, haka i och öva rund rygg. |
| 4 | `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | sitt i kön, rulla ihop och öppna igen. |
| 5 | `tech-grenhopp-trampett` | Grenhopp från trampett | öva grenhopp på golvet, landa mjukt på två fötter. |
| 6 | `tech-formhopp-over-block` | Formhopp över block från trampett | hoppa ljushopp på stället och landa stilla på två fötter. |
| 7 | `tech-l-hang-racke` | L-häng i räcke | sitt med raka ben och håll L-formen i fem andetag. |
| 8 | `tech-stod-racke-pendel` | Stöd på räcke med pendel | stå i plankan på golvet och räkna till fem. |
| 9 | `tech-soldatsparkar-bom` | Soldatsparkar på bom | öva soldatsparkar på golvet, armarna ut. |
| 10 | `tech-krabbgang-bom` | Krabbgång längs bom | gå krabbgång på golvet, i kön. |
| 11 | `tech-landning-plint` | Landningar upp på och ner från plint | hoppa på stället och landa stilla: böjda knän, armarna fram. |
| 12 | `tech-kullerbytta` | Kullerbytta framåt | sitt på huk i kön, haka i och håll ryggen rund. |
| 13 | `tech-hjul` | Hjul | stå i stjärna och flytta blicken mot händerna. |
| 14 | `tech-minihjul` | Minihjul (krabbhjul) | på huk, sätt händerna i golvet en i taget och tillbaka. |
| 15 | `tech-aggrullning-kil` | Äggrullning nerför kil | sitt, dra upp knäna och håll äggformen i fem andetag. |
| 16 | `tech-ljushopp-rockringar` | Ljushopp i rockringar | hoppa jämfota på stället: armarna upp, benen ihop. |

**Inte i den här ronden (8 Teknik):** `tech-rondat-flickis`, `tech-flickis-kudde`, `tech-falla-bakat-hojd`, `tech-salto-fran-hojd`, `tech-handstaende-falla-rygg` (spotting-tunga, låst utanför med B1), samt `tech-bro`, `tech-balansgang`, `tech-asnesparkar`.
