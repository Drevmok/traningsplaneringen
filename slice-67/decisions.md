# Slice 67 — beslut

**LÅST 2026-11-23 11:27 (Europe/Stockholm) av Christoffer**, reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1»

Alla ★ i `README.md` togs, utan avsteg. Pack: `slice-67-docs` @ `36e18c0`. Bas main @ `329a259`.

| Fråga | Val |
|---|---|
| A | **A1 ★**: Bob föreslår layout-JSON från `how_to` och redskapsförslaget (automatisk rad som start). Christoffer godkänner varje skiss visuellt innan SQL skrivs. |
| B | **B1 ★**: alla i den live-bekräftade kön; id som redan har skiss i live hoppas över. `tech-hjul` ingår inte. |
| C | **C1 ★**: idempotent `UPDATE` av bara `default_station_layout` med `IS NULL`-guard, efter merge och Christoffers separata ja. Agenter kör den aldrig. |
| D | **D1 ★**: förhandsvisning med befintlig StationSketch; SQL skrivs först efter hans ja. |
| E | **E1 ★**: ingen appändring, `SLICE_NUMBER` kvar `'66'`, inget i `seedActivities.ts`. |
| F | **F1 ★**: live-kön bekräftas read-only innan SQL skrivs. |

Avvisat: A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2, F3. **Ingen merge utan Christoffers OK.**

## Godkännande av skisserna (D1)

**2026-11-23 11:45 (Europe/Stockholm), Christoffer**, reläat av Träningsplaneraren - PO, ordagrant: «Godkänn de 11 säkra skisserna, hoppa över de osäkra och de enkla»

Tolkning: godkända är förslagen utan orange ram (osäker) och med mer än ett redskap. Härlett ur `proposals.md`: 25 i live-kön − 6 osäkra − 8 enkla = 11.

**Godkända (11)**, skrivs av `content/update-station-layouts.sql`:

| id | Titel |
|---|---|
| `tech-ljushopp-trampett` | Ljushopp på trampett |
| `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg |
| `tech-rondat-flickis` | Rondat–flickis |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg |
| `tech-salto-fran-hojd` | Salto från höjd |
| `tech-balansgang` | Balansgång (4 koner) |
| `tech-grenhopp-trampett` | Grenhopp från trampett |
| `tech-formhopp-over-block` | Formhopp över block från trampett |
| `tech-l-hang-racke` | L-häng i räcke |
| `tech-soldatsparkar-bom` | Soldatsparkar på bom |
| `tech-ljushopp-rockringar` | Ljushopp i rockringar (4 rockringar) |

**Hoppas över, osäkra (6):** `tech-trampett-volt-mattberg` (landningsmattans läge vid mattberget), `tech-flickis-kudde` («enligt klubbens metod»), `tech-aggrullning-kil` och `tech-stockrullning-kil` (madrass under eller nedanför kilen; lutningen går inte att vända), `tech-stod-racke-pendel` (vilket håll som är «bakåt»), `tech-hjul-mattriangel` (sidovyn visar inte vinkeln).

**Hoppas över, enkla (8, ett redskap):** `tech-handstaende-falla-rygg`, `tech-kullerbytta`, `tech-bro`, `tech-asnesparkar`, `tech-minihjul`, `tech-krabbgang-bom`, `tech-landning-plint`, `tech-igelkottsgunga`. (I steg 1-rapporten stod «9 enkla»; rätt antal är 8.)

**SQL:** `content/update-station-layouts.sql`, sha256 `02fee3adf3bf9af0665fc50ccd5a9ba560096353f5535723d7ec3e85d6d409de`. Kontroll efter körning (read-only): `content/check-station-layouts.sql`. **Ingen SQL har körts.** Filen väntar på Christoffers separata ja, efter merge.
