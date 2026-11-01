# Slice 58 — schema

**Med ★ A1 + D1: ingen SQL.**

- `default_station_layout jsonb` finns sedan Slice 57. Formen blir `{ "v": 1, "poses": [{ "pieceId", "x", "z", "yaw", "y"? }], "surface"?: { "w", "h" } }`.
- Triggern `check_exercise_layout` (`slice-57/content/schema-57.sql`) kräver `v = 1`, kollar x/z/yaw och antal per pieceId. Okända fält släpps igenom, så `y` och `surface` sparas utan ändring.
- Appen sanerar vid läsning (klämmer `y` 0–1, `surface` 0–2). Ingen backfill: alla befintliga layouter saknar `y` → golvet.
- `schema-58.sql` (valfri skärpning av `y`/`surface`) **hoppas över** i låset 2026-11-01 — krävs inte. Bara referens. Agenter kör aldrig SQL.
- **A2 (`v: 2`)** kräver att triggern accepterar `v in (1, 2)` och klistras in **före merge**. Annars avvisar banken varje ny layout.
