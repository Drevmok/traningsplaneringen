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
