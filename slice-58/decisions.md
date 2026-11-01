# Slice 58 — beslut

**LÅST 2026-11-01 av Christoffer** via PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1».

Alla ★-förslag valda. Bundle över +512 B gzip OK (som Slice 57). **Ingen SQL nu** — valfria `content/schema-58.sql` hoppas över. Städning (Scout #2) och Admin-kö (Scout #3) ligger utanför.

| Fråga | Val |
|---|---|
| A | **A1 ★** — valfri `y` (0–1) per pose i **`v: 1`**. Saknas → 0 (golvet). Gamla layouter ritas som i dag. Ingen SQL. |
| B | **B1 ★** — knappar «Höjd +» / «Höjd −» på valt redskap, ett steg = ett lager (1/8), max 8 lager. PageUp/PageDown. Drag/pilar ändrar bara x/z. «Lager N» när N > 0. |
| C | **C1 ★** — ritordning `y` stigande, sedan `z` fallande, sedan index. Lagerlyft `8 · LAYER_PX · y` från `cy`; skala bara av `z`. Samma i blad, detaljvy och **Skriv ut passet**. |
| D | **D1 ★** — auto-viewBox från posernas gränser (aldrig mindre än dagens ytor, klipper aldrig) + «Bredare yta» / «Högre yta» (0–2 steg) och «Standardyta». Sparas som valfritt `surface: { w, h }`. |
| E | **E1 ★** — heuristikgrenen i `StationSketch`, bankrader utan layout, Hallöversikt och **Redigera redskap** byte-identiska med main. |
| F | **F1 ★** — A1 B1 C1 D1 E1. Ingen CAD, ingen WebGL/Three.js, `EQUIPMENT_PIECES` orörd. Footer «Slice 58». Ingen SQL. Mjukt bundle-undantag. |

## Svar på öppna frågor
1. **A:** valfri `y` i `v: 1` (A1). Ingen `v: 2`, ingen SQL före merge.
2. **B:** knappar «Höjd +/−» i lager (B1). 8 lager räcker.
3. **C:** ritordning y sedan z (C1) — OK.
4. **D:** auto + manuella knappar «Bredare yta»/«Högre yta» (D1).
5. **Bundle:** OK över +512 B gzip, som Slice 57. Builder rapporterar exakt siffra mot main i PR.
6. **SQL:** nej, ingen striktare trigger nu. `schema-58.sql` klistras inte in; appen sanerar `y`/`surface`. Kan tas upp i en senare slice.

## Avvisat
- A2 (`v: 2`, SQL före merge), B2 (reglage), B3 (lägesväxel Flytta/Höj), C2 (z före y), D2 (bara auto), D3 (fri storlek/hörndrag), E2 (auto-viewBox i heuristiken), F2 (obligatorisk SQL-skärpning).

Bas main @ `b610103`. Gren `slice-58-docs`. **Ingen merge utan Christoffers OK.** PO skickar byggkortet till Builder.
