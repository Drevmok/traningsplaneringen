# Slice 67 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Innehållsslice. Ingen ny yta. Live-kön bekräftas read-only **innan** SQL-filen skrivs; SQL körs bara efter Christoffers separata ja, efter merge. Agenter kör aldrig SQL. **10 kontroller.** Föreslaget A1 B1 C1 D1 E1 F1 — uppdateras vid lås.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Live-kö «Saknar skiss» avstämd read-only mot seed-listan i README, före SQL | Antal och id noterade. Id som redan har skiss i live hoppas över. `tech-hjul` ingår inte |
| 2 | Varje föreslagen skiss i Admin / StationSketch | Visar uppställningen, inte bara automatisk rad. Poser matchar redskapsförslaget (antal per `pieceId` = slotens count) |
| 3 | Christoffers ja till skisserna, sedan SQL-filen | `content/update-station-layouts.sql` finns. Bara `UPDATE` av `default_station_layout`. `IS NULL`-guard. Inget `DELETE`, inget `--replace`. sha256 i HANDOFF stämmer |
| 4 | Efter körning (hans ja): `RETURNING` | Precis de id som saknade skiss uppdaterades. Redan fyllda orörda |
| 5 | Admin-kön efter körning | «Saknar skiss ({n})» har minskat med samma antal (kvar blir bara ev. nya/andra rader) |
| 6 | Stickprov: ActivityDetail, Golvklart, utskrift, Kör passet | Sparad skiss syns, inte bara automatisk rad |
| 7 | `tech-hjul`, icke-Teknik, dolda rader, andra kolumner | Orörda |
| 8 | Footer och app | «Slice 66» om E1. Ingen appdiff |
| 9 | `bun test src` om någon kör den | Grön, inkl. befintliga `layoutQueue`-tester. Ingen ny smoke krävs |
| 10 | Agenter / Builder | Ingen SQL har körts av dem. Ingen `push-promote --replace` |
