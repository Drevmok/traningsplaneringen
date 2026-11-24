# Slice 67 — schema

**FÖRESLAGEN, C1/E1: ingen schema-SQL.** Ingen `schema-67.sql`, ingen ny kolumn, ingen ny CHECK, ingen triggerändring. `BANK_LIMITS` orörd.

Kolumnen `public.exercises.default_station_layout` (jsonb) finns sedan Slice 57, med `check_exercise_layout` (poser matchar `default_station_equipment`).

Data-UPDATE `content/update-station-layouts.sql` skrivs efter visuellt ja, inte i FÖRESLAGEN-packen. Idempotent: **bara** `default_station_layout`, och bara där värdet `IS NULL`. Övriga kolumner orörda. Efter merge, bara efter Christoffers **separata** ja (han klistrar in, eller PO via Supabase MCP efter hans OK). Agenter kör aldrig SQL mot riktiga banken. Builder tar med filen oförändrad; kör den inte. sha256 antecknas i HANDOFF när filen finns.

`push-promote --replace` används inte: body:n skriver fler fält och sätter `needs_coach_review`. Inget `DELETE`.

Live-banken är sanningen sedan Slice 32. `seedActivities.ts` lämnas orörd vid E1 (offline-reserv; skiss-JSON i den filen skulle landa i klientbundlen). `tools/bank/export-seed.ts` saknar kolumnen i `cols` — laga inte i den här slicen.
