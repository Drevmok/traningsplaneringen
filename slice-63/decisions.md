# Slice 63 — beslut

**LÅST 2026-11-16 av Christoffer** (07:16, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1»

Alla ★ togs. Inget avsteg från Docs förslag. Packen som låstes: `slice-63-docs` @ `5b09f87`.

| Fråga | Val |
|---|---|
| A | **A1 ★** — efter «Skapa kopia», på kopian i Passbyggaren: en valfri rad/knapp `UI.stepTeknikHarder` «Gör Teknik ett steg svårare». Visa den bara på den session Ny vecka just skapade, och bara om minst en Teknik-rad har `harderOf`-mål. Inget extra «Inte nu» — att inte trycka räcker. Dölj efter användning, och när passet ersätts. Efter Ångra (B1) visas raden igen på samma kopia. Inte i bekräftelserutan, inte i Kör passet, inte i utskrift. |
| B | **B1 ★** — en ångranivå, samma mönster som Slice 41: efter bytet en toast («Teknik är ett steg svårare.» · «Ångra») som lägger tillbaka kopian som den var före steget. Annan ändring avslutar. Förra veckans mall och Ny vecka-kopieringen rörs inte. |
| C | **C1 ★** — Kör passet orört. Ingen ny kontroll, inga nya chip. Efter bytet (eller om ledaren hoppar över) visar Kör de titlar som ligger i passet. |
| D | **D1 ★** — bara poster i Teknik-blocket där `harderOf` ger ett mål. Ett steg per tryck, inte till kedjans slut. Återanvänd `swapSessionActivity` (behåll `item.id`, minuter, anteckning, ordning och `stationEquipment`). Hallmärket sitter kvar. Andra block, Bro och redan svåraste led orörda. Ingen SQL. |
| E | **E1 ★** — inom +512 B gzip, inget undantag. `SLICE_NUMBER = '63'`. Går bygget över: korta toasten, inte ta bort kontrollen, och rapportera — inget undantag utan Christoffers ja. |
| F | **F1 ★** — enhetstester för hjälpfunktionen plus befintliga `weekCopy`-tester. `pick-smokes` styr; troligen hela loopen p.g.a. `blockMeta.ts`. Mot baslinjen: SAMMA förutom footer 62→63 och att kontrollen syns efter Ny vecka när länkade rader finns. |

## Svar på öppna frågor

Christoffer låste «Ja, lås A1 B1 C1 D1 E1 F1» (eget svar 2026-11-16 07:16, Europe/Stockholm, reläat av PO). Alla ★ togs genom låset. Ingen omformulering av mikrotexten begärdes.

1. **Placering:** **A1** — rad på kopian i Passbyggaren, efter «Skapa kopia» (inte A2, kryssruta i bekräftelsen).
2. **Ångra:** **B1** — toast med Ångra (inte B2, ingen egen ångra).

## Avvisat
- A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.

Bas main @ `2917296`. Gren `slice-63-docs`. **Ingen merge utan Christoffers OK.** Ingen SQL. PO skickar byggkortet till Builder; Docs pingar inte Bob.
