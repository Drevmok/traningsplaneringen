# Slice 65 — beslut

**LÅST 2026-11-21 av Christoffer** (12:08, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1»

Alla ★ togs, utan avsteg. Låst pack: `slice-65-docs` @ `fb6a12d`. Detaljer i `README.md` och `HANDOFF.md`.

| Fråga | Val |
|---|---|
| A | **A1 ★**: stegläge «Bygg hallen» över den befintliga Golvklart-kartan. Aktuellt märke markeras. Ingen ny duk och ingen egen vy. |
| B | **B1 ★**: ordningen följer `stationRanks`, alltså placerade Teknik i passordning. Oplacerade kommer sist utan nummer. |
| C | **C1 ★**: nummer, titel, `StationSketch`, redskap och antal från stationens slots, och avbockning «Byggd» i minnet. Förrådslista blir kvar som hämtlista. |
| D | **D1 ★**: en kort sektion «Bygg hallen» i befintlig `PassPrint`, med avbockningsruta. Ingen andra utskrift. |
| E | **E1 ★**: inom +512 B gzip, inget undantag. `SLICE_NUMBER = '65'`. |
| F | **F1 ★**: enhetstester för hjälpfunktionen, och `pick-smokes 6698a63 <head>` styr (troligen hela loopen). |

Svar på öppna frågor: 1 A1, 2 B1, 3 D1.
Avvisat: A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2, F3.

Bas main @ `6698a63`. Ingen SQL. S4–S9 ingår inte. **Ingen merge utan Christoffers OK.** PO skickar byggkortet. Docs pingar inte Bob.
