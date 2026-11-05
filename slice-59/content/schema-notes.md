# Slice 59 — schema

**Med ★ F1: ingen SQL.** Ingen `schema-59.sql` och ingen `migration-plan.md` i packen.

- Kön läser bara fält som redan hämtas: `block_type`, `status`, `default_station_equipment`, `default_station_layout` (`BANK_EXERCISE_COLUMNS`, `lib/bankRow.ts:46–60`; admin lägger till `updated_at`, `updated_by`).
- Sparning går genom befintlig `saveRow` och triggern `check_exercise_layout` från `slice-57/content/schema-57.sql` (`v = 1`, x/z/yaw, antal per `pieceId`). Formen `{ "v": 1, "poses": [...], "surface"? }` är oförändrad sedan Slice 58.
- Ingen backfill. Rader utan layout står kvar som `null` tills admin sparar en. Agenter kör aldrig SQL mot riktiga banken.
- **Reserv:** saknas kolumnen `default_station_layout` (gammal bank) hämtar appen utan den (`lib/bank.ts:193`). Då hamnar alla Teknik med redskap i kön, och ingenting kraschar. Live har kolumnen sedan Slice 57.
- **Kräver SQL (inte ★, utanför slicen):** ett märke «automatisk skiss räcker» (öppen fråga 5) skulle behöva en ny kolumn, t.ex. `layout_skip boolean`, och klistras in **före merge/deploy** med reservhämtning som i Slice 57.
