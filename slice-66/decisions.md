# Slice 66 — beslut

**LÅST 2026-11-22 11:53 (Europe/Stockholm) av Christoffer**, reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1 och kör Bob nu»

Alla ★ i `README.md` togs, utan avsteg. Pack: `slice-66-docs` @ `4350cfe`. Bas main @ `d347892`.

| Fråga | Val |
|---|---|
| A | **A1 ★**: bara CSS vid `orientation: landscape` och `max-height: 500px`. Med stegläget öppet (`.hall-layout--floor:has(.hall-station-list)`) står karta och panel bredvid varandra. |
| B | **B1 ★**: utan sidrullning syns märket, titeln, «Station n av N» eller «Saknar plats», Byggd och Föregående / Nästa / Avsluta Bygg hallen. Skissen får krympa eller rullas inne i panelen. |
| C | **C1 ★**: utskriftens sektion «Bygg hallen» skriver oplacerade som `☐ {titel} — Saknar plats` (`UI.buildHallUnplaced`). |
| D | **D1 ★**: bara de två fynden. |
| E | **E1 ★**: inom +512 B gzip mot `d347892`, bantat med död CSS och oanvända nycklar. `SLICE_NUMBER = '66'`. |
| F | **F1 ★**: enhetstest för etiketten; `pick-smokes d347892 <head>` styr (hela loopen). |

Avvisat: A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2, F3. Ingen SQL. **Ingen merge utan Christoffers OK.**
