# Slice 67 — steg 1: live-kö och skissförslag

**Live-kön (read-only, 2026-11-23):** 25 Teknik med redskapsförslag och `default_station_layout` = null, status published (inga dolda). Källa: live-appens egen läsning av `/rest/v1/exercises` (GET, `status=in.(published,hidden)`), sparad som `live-queue.json` (id, titel, status, redskap, how_to). Ingen SQL-fil, ingen skrivning.

**Mot seed-listan i README (23):** `tech-ljushopp-satsbrada` har redan skiss i live och hoppas över (B1). Tre nya i live, inte i seed-listan: `tech-igelkottsgunga`, `tech-hjul-mattriangel`, `tech-stockrullning-kil`. `tech-hjul` och `tech-bygga-tak-vagg` saknar redskapsförslag och ingår inte. Väntande (pending) rader syns inte för den publika läsningen; Admin-kön kan därför visa fler om sådana finns.

**Filer:** `layouts/<id>.json` (en skiss per övning, Slice 57-format, validerad med `sanitizeStationLayout`: poser matchar redskapen 1:1), `layouts/all-proposals.json`, `previews/<id>.png`, `previews/contact-sheet.png`, `previews/index.html` (telefonvänlig, förslag + dagens automatiska rad). Harness: `harness/` (utanför `app/src`).

**Allmänt:** med sparad skiss ritar StationSketch inte ansatskuddarna (de finns inte i redskapslistan) och yaw vrider märket i bildplanet, så alla förslag har yaw 0 och visar riktningen med ordning vänster → höger.

| # | id | Titel | Redskap | Förslag | Osäker |
|---|---|---|---|---|---|
| 1 | `tech-ljushopp-trampett` | Ljushopp på trampett | trampett, landningsmatta | Ansats från vänster, trampett, landningsmatta direkt efter. |  |
| 2 | `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | satsbrada, landningsmatta | Satsbräda, landningsmattan (rygglandning) direkt bakom, ansats från vänster. |  |
| 3 | `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | trampett, mattberg, landningsmatta | Trampett, mattberget nära, landningsmatta bakom berget som säkring. | how_to säger landning högt på mattberget; om landningsmattan ska ligga ovanpå eller runt berget går inte att utläsa. |
| 4 | `tech-rondat-flickis` | Rondat–flickis | tumblingmatta, landningsmatta | Tumblingmattan som löpbana, landningsmatta i slutet. |  |
| 5 | `tech-flickis-kudde` | Flickis med flickiskudde | flickiskudde, madrass | Kudden först, madrassen där händer/fötter landar bakom. | how_to: «enligt klubbens metod» — kuddens läge mot madrassen är inte beskrivet. |
| 6 | `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | plint, madrass | Plinten som höjd, madrassen direkt bakom för fallet bakåt. |  |
| 7 | `tech-salto-fran-hojd` | Salto från höjd | plint, landningsmatta | Plint, landningsmatta direkt efter. |  |
| 8 | `tech-handstaende-falla-rygg` | Handstående falla till rygg | madrass | En madrass mitt i bild. | Ett enda redskap: skissen blir i praktiken samma som den automatiska raden. |
| 9 | `tech-kullerbytta` | Kullerbytta framåt | madrass | En madrass mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 10 | `tech-bro` | Bro | madrass | En madrass mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 11 | `tech-balansgang` | Balansgång | 4× kon | Fyra koner på en rak linje med gångavstånd. |  |
| 12 | `tech-grenhopp-trampett` | Grenhopp från trampett | trampett, landningsmatta | Kort ansats från vänster, trampett, landningsmatta direkt efter. |  |
| 13 | `tech-formhopp-over-block` | Formhopp över block från trampett | trampett, skumblock, landningsmatta | Trampett, lågt block i mellanrummet, landningsmatta efter blocket. |  |
| 14 | `tech-aggrullning-kil` | Äggrullning nerför kil | kilmatta, madrass | Kilen med madrassen nedanför, där rullningen slutar. | how_to: «kilen på en matta» — kanske ska madrassen ligga under kilen; kilens lutningsriktning i ritningen går inte att vända (yaw vrider bara i bildplanet). |
| 15 | `tech-l-hang-racke` | L-häng i räcke | racke, landningsmatta | Räcket med landningsmattan under. |  |
| 16 | `tech-stod-racke-pendel` | Stöd på räcke med pendel | racke, landningsmatta | Räcket, landningsmattan under och lite bakom för avhoppet. | Vilket håll som är «bakåt» i sidovyn är ett val. |
| 17 | `tech-asnesparkar` | Åsnesparkar | tumblingmatta | Tumblingmattan mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 18 | `tech-minihjul` | Minihjul (krabbhjul) | tumblingmatta | Tumblingmattan mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 19 | `tech-soldatsparkar-bom` | Soldatsparkar på bom | bom, landningsmatta | Bommen, landningsmatta vid slutet för nedhoppet. |  |
| 20 | `tech-krabbgang-bom` | Krabbgång längs bom | bom | Bommen mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 21 | `tech-ljushopp-rockringar` | Ljushopp i rockringar | 4× rockring | Fyra rockringar i sicksack (fram/bak). |  |
| 22 | `tech-landning-plint` | Landningar upp på och ner från plint | plint | Plinten mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 23 | `tech-igelkottsgunga` | Igelkottsgunga (gunga i krupen form) | madrass | En madrass mitt i bild. | Ett enda redskap: samma som den automatiska raden. |
| 24 | `tech-hjul-mattriangel` | Hjul över hajarna (mattriangel) | 3× madrass | Tre madrasser som en triangel: två fram, en bak i mitten. | Sidovyn kan inte visa vinkeln mellan mattorna; triangeln antyds bara med djup. |
| 25 | `tech-stockrullning-kil` | Stockrullning nerför kil | kilmatta, madrass | Kilen med madrassen nedanför. | Samma fråga som äggrullning: madrassen kanske under kilen; lutningsriktningen går inte att vända. |
