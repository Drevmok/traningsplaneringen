# Slice 65 — mikrotext (sv)

**Status:** **FÖRESLAGEN** (A1 B1 C1 D1 E1 F1). Texterna låses med A–F.

Nya korta `UI.`-strängar för guiden. Låsta termer orörda (Kör passet, Golvklart, Hallöversikt, Passbyggaren, Redigera redskap, Förrådslista, Skriv ut passet). «redskap», inte «utrustning». «Skiss», inte en ny produktterm. «Bygg hallen» är den nya ytan. Inget extra hallmärke i texten.

## UI-strängar

| Nyckel (`UI.`) | Text | Var |
|---|---|---|
| `buildHall` | Bygg hallen | Knapp och rubrik (skärm + utskrift) |
| `buildHallAria` | Bygg hallen, station för station | `aria-label` på knappen |
| `buildHallDone` | Byggd | Avbockning per steg |
| `buildHallUnplaced` | Saknar plats | Steg utan märke på hallen |
| `buildHallExit` | Avsluta Bygg hallen | Lämna stegläget |
| `buildHallPrev` | Föregående | Föregående station |
| `buildHallNext` | Nästa | Nästa station |
| `buildHallStep` | Station {n} av {total} | Stegräkning (hoppa {n} om stationen saknar nummer) |

**Återanvänds oförändrat:**

| Nyckel (`UI.`) | Text | Var |
|---|---|---|
| `stationSketchCaption` | Skiss — så kan stationen stå. | Bildtext under `StationSketch` |
| `stationSketchApproach` | Ansatskuddarna framför trampett och satsbräda är en skiss, inte en rad i förrådet. | När auto-raden ritar ansats |
| `hallFloorReady` | Golvklart | Oförändrad gruppvy |
| `forradslistaTitle` / `forradslistaPrintHeading` | Förrådslista | Oförändrad hämtlista |
| `forradslistaPrintIntro` | Ta med från förrådet: | Oförändrad |
| `exportPrintPass` | Skriv ut passet | Oförändrad |

Ingen sträng för «saknas» eller alternativ (S9). Ingen ny sträng som döper om Golvklart.
