# Slice 57 — beslut

**Låst 2026-10-31 av Christoffer** i PO-chatten, ordagrant: «Ja, lås A2 B1 C1 D1 E1 F1. OK över +512 B. SQL före merge. 3D senare.»

**Obs: A2, inte A1.** Docs föreslog A1 (skissyta inuti `StationComposeSheet` under chip-listan). Christoffer valde **A2: ett eget blad** bara för skissen. A1 är avvisat.

| Fråga | Val |
|---|---|
| A | **A2 — eget blad för skissen.** Öppnas med knapp från «Ändra i banken» (Teknik) och Ny egen övning (Teknik). Ingen skissyta inuti redskapsbladet. |
| B | B1 — eget fält `defaultStationLayout` / `default_station_layout jsonb`, form `{ "v": 1, "poses": [{ "pieceId", "x", "z", "yaw" }] }`. Saknas → dagens heuristik. |
| C | C1 — layouten följer chip-listan: nytt redskap/ökat antal → pose sist; borttaget/minskat → poser bort. |
| D | D1 — finns layout gäller den. Inga automatiska ansatskuddar, ingen ansatstext. |
| E | E1 — samma `StationSketch` i övningens detaljvy och **Skriv ut passet**. Hallöversikt orörd. Passets egen lista i **Redigera redskap** (≠ förslaget) → heuristik. |
| F | F1 — ingen CAD på hallschemat, inga nya redskap i `EQUIPMENT_PIECES`, ingen WebGL/Three.js. Footer «Slice 57». SQL-fil `content/schema-57.sql` som Christoffer klistrar in. |

## Svar på öppna frågor
1. **A:** A2, eget blad (inte A1).
2. **Bundle:** OK att gå över mjuka taket +512 B gzip. Builder rapporterar ändå exakt siffra mot main i PR.
3. **D1:** ja, admins layout gäller.
4. **3D senare:** bekräftat. 3D-vyn blir en egen slice och läser samma layout.
5. **SQL före merge:** Christoffer klistrar in `schema-57.sql` **före merge/deploy**, inte efter. Banken hämtar kolumner med namn (`BANK_EXERCISE_COLUMNS`), så kolumnen måste finnas när appen går live. Builder lägger ändå in reserven: misslyckas hämtningen på `default_station_layout`, hämtar appen igen utan kolumnen.
6. **Ny egen övning:** inte besvarad av Christoffer. Docs tar ★-förslaget: **ja**. Knappen till skissbladet finns även i Ny egen övning (`OwnActivityForm`, Teknik), sparas lokalt och följer med vid «Skicka till banken». **Redigera redskap** i Hallöversikt visar fortfarande ingen knapp och inget skissblad (props är opt-in).

Bas main @ `9a452c7`. Gren `slice-57-docs`. Ingen merge utan Christoffers OK, och SQL inklistrad först.
