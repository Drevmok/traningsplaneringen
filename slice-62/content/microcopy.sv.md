# Slice 62 — mikrotext (sv)

**Status:** **FÖRESLAGEN.** Inte låst.

«Lättare» och «Svårare» är Scout-/IMPROVEMENTS-formuleringarna. Ändra inte och översätt dem inte. Låsta termer orörda (Passbyggaren, Hallöversikt, Kör passet, Redigera redskap, Biblioteket, …). «redskap», inte «utrustning». Inget extra hallmärke i texten. ActivityDetail behåller «Bygger på» och «Lättare variant av».

## UI-strängar

| Nyckel (`UI.`) | Text | Var |
|---|---|---|
| `easier` | Lättare | Chip på Teknik-rad i Passbyggaren, bara när lättare mål finns |
| `harder` | Svårare | Samma, bara när svårare mål finns |

Ingen extra etikett runt chippen. Ingen ny `UI.`-sträng för Kör passet (ingår inte, B1).

**Återanvänds oförändrat:** «Bygger på» (`progressionOfLabel`), «Lättare variant av» (`regressionOfLabel`), «Så gör du», «Medan du väntar», «Kör passet», «Nästa», «Kvar», «Redigera redskap».

## Innehåll — 9 par (C1), prioriteringsordning

Varje par är reciprokt. `progressionOf` = lättare underlag («Bygger på»). `regressionOf` = svårare mål («Lättare variant av»). Om bundle går över +512 B gzip: stryk från slutet av tabellen (prio 9, sedan 8), inte de redan befintliga 1–4 (E1).

| Prio | Lättare (id · titel) | Svårare (id · titel) | Anmärkning |
|---|---|---|---|
| 1 | `tech-landning-plint` · Landningar upp på och ner från plint | `tech-grenhopp-trampett` · Grenhopp från trampett | Finns redan, reciprokt |
| 2 | `tech-grenhopp-trampett` · Grenhopp från trampett | `tech-formhopp-over-block` · Formhopp över block från trampett | Finns redan, reciprokt |
| 3 | `tech-minihjul` · Minihjul (krabbhjul) | `tech-hjul` · Hjul | Finns ensidigt (`regressionOf` på Minihjul). Komplettera: `hjul.progressionOf = minihjul` |
| 4 | `tech-balansgang` · Balansgång | `tech-soldatsparkar-bom` · Soldatsparkar på bom | Finns ensidigt (`progressionOf` på Soldatsparkar). Komplettera: `balansgang.regressionOf = soldatsparkar-bom` |
| 5 | `tech-aggrullning-kil` · Äggrullning nerför kil | `tech-kullerbytta` · Kullerbytta framåt | Ny. Kil → plan (Pembee-leden Scout pekade på) |
| 6 | `tech-ljushopp-rockringar` · Ljushopp i rockringar | `tech-ljushopp-satsbrada` · Ljushopp på satsbräda | Ny |
| 7 | `tech-ljushopp-satsbrada` · Ljushopp på satsbräda | `tech-ljushopp-trampett` · Ljushopp på trampett | Ny. Satsbräda är mittled (både prio 6 och 7) |
| 8 | `tech-flickis-kudde` · Flickis med flickiskudde | `tech-rondat-flickis` · Rondat–flickis | Ny, spotting-tung. Öppen fråga 1 |
| 9 | `tech-falla-bakat-hojd` · Falla bakåt från höjd till rygg | `tech-salto-fran-hojd` · Salto från höjd | Ny, spotting-tung. Öppen fråga 1 |

**Seed-fält per id** (tom cell = fältet sätts inte / lämnas borta):

| id | progressionOf | regressionOf |
|---|---|---|
| `tech-landning-plint` | — | `tech-grenhopp-trampett` |
| `tech-grenhopp-trampett` | `tech-landning-plint` | `tech-formhopp-over-block` |
| `tech-formhopp-over-block` | `tech-grenhopp-trampett` | — |
| `tech-minihjul` | — | `tech-hjul` |
| `tech-hjul` | `tech-minihjul` | — |
| `tech-balansgang` | — | `tech-soldatsparkar-bom` |
| `tech-soldatsparkar-bom` | `tech-balansgang` | — |
| `tech-aggrullning-kil` | — | `tech-kullerbytta` |
| `tech-kullerbytta` | `tech-aggrullning-kil` | — |
| `tech-ljushopp-rockringar` | — | `tech-ljushopp-satsbrada` |
| `tech-ljushopp-satsbrada` | `tech-ljushopp-rockringar` | `tech-ljushopp-trampett` |
| `tech-ljushopp-trampett` | `tech-ljushopp-satsbrada` | — |
| `tech-flickis-kudde` | — | `tech-rondat-flickis` |
| `tech-rondat-flickis` | `tech-flickis-kudde` | — |
| `tech-falla-bakat-hojd` | — | `tech-salto-fran-hojd` |
| `tech-salto-fran-hojd` | `tech-falla-bakat-hojd` | — |

**Inte i den här ronden (8 Teknik):** `tech-bro`, `tech-handstaende-falla-rygg`, `tech-l-hang-racke`, `tech-stod-racke-pendel`, `tech-asnesparkar`, `tech-krabbgang-bom`, `tech-satsbrada-volt-rygg`, `tech-trampett-volt-mattberg`.
