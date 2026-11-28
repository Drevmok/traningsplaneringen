# Slice 69 — beslut

**Status:** **FÖRESLAGEN** (inte låst). Bas: main @ `83965f7`. Gren: `slice-69-docs`. Detaljer i `README.md` och `HANDOFF.md`.

Docs förslag (★): **A1 B1 C1 D1 E1 F1**.

| Fråga | Förslag |
|---|---|
| A Placering | **A1 ★**: i `.run-script`, ovanför skissen. Bara skriptet rullar (Slice 38). |
| B Storlek | **B1 ★**: hallens aspect-ratio, `max-height: 16svh`, `min-height: 0`. Minin rullar inte och nypzoomar inte. |
| C Ingen hall / oplacerad | **C1 ★**: karta bara när minst en Teknik är placerad och steget är Teknik. Oplacerad med andra märken: karta + «Saknar plats». Inga placeringar eller inte Teknik: ingen karta. |
| D Markör | **D1 ★**: alla placerade märken, aktiv `is-selected`. Inget extra stift, ingen CAD. Inte D2 (bara aktivt märke). |
| E Tryck | **E1 ★**: visning bara. Ingen träffyta, lämnar inte Kör passet. |
| F Bundle | **F1 ★**: `SLICE_NUMBER = '69'`. Tester för `runHallMini`. Inom +512 B gzip mot `83965f7`. |

Avvisat om ★ låses: A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2, F3.

**Lås** (lämnas tomt tills Christoffers egna, ordagranna ord reläas):

>
