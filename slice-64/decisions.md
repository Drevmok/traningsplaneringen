# Slice 64 — beslut

**LÅST 2026-11-17 av Christoffer** (10:43, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1»

Alla ★ togs, utan avsteg. Låst pack: `slice-64-docs` @ `c11b9f7`. Detaljer i `README.md` och `HANDOFF.md`.

| Fråga | Val |
|---|---|
| A | **A1 ★**: utan sparad layout visar `StationSketch` den befintliga auto-raden. Dold bara när det saknas redskap. |
| B | **B1 ★**: ikon och befintlig text på redskapsraderna i `HallChip` (kompakt `VisualIcon`), bara i Golvklart och utskrift. Inte i redigeringsläget. |
| C | **C1 ★**: bara Teknik-steg med redskapsslots. Skissen är första barnet i `.run-script`, så bara skriptet rullar (Slice 38). |
| D | **D1 ★**: bara S1 och S2. S3–S8, den parkerade redskapsraden, count-badge och hall-CAD ingår inte. |
| E | **E1 ★**: inom +512 B gzip, inget undantag. `SLICE_NUMBER = '64'`. |
| F | **F1 ★**: enhetstester för hjälpfunktionen, och `pick-smokes 937829c <head>` styr (troligen hela loopen). |

Svar på öppna frågor: 1 A1, 2 B1, 3 C1.
Avvisat: A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2, F3.

Bas main @ `937829c`. Ingen SQL. **Ingen merge utan Christoffers OK.** PO skickar byggkortet. Docs pingar inte Bob.
