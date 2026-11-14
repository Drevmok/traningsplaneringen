# Slice 61 — schema

**LÅST 2026-11-12, C2: ingen schema-SQL.** Ingen `schema-61.sql`, ingen `migration-plan.md`, ingen ny kolumn, ingen ny CHECK, ingen triggerändring.

Texten bor i befintligt `exercises.how_to` (`slice-31/content/schema-31.sql`, `char_length` 1–800).

- Steggränsen 1–4 finns bara i appen (`BANK_LIMITS.steps`, `rowToEntry` via `parseHowLines`). Därför måste vänt-raden filtreras bort från stegräkningen — annars hoppas 14 av 24 seed-Teknik över, eftersom de redan har fyra steg.
- Live-banken är sanningen sedan Slice 32. Seederna i bygg-PR:en är offline-reserv och tester. Efter merge, när appen är live, klistrar Christoffer in `content/update-how-to-waiting.sql` (eller PO via Supabase MCP efter hans OK). Filen är en idempotent UPDATE som **bara** sätter `how_to` för de 16 id:na (lägger till `Medan du väntar: …` om raden saknas och resultatet ryms i 800 tecken). Agenter kör aldrig SQL mot riktiga banken.
- Körs pasten **före** appen är live räknas vänt-raden som ett femte steg, och 14 Teknik försvinner ur Biblioteket. Därför: efter merge, inte före.
- `push-promote --replace` används inte (C3 avvisat): body:n skriver fler fält än `how_to` och sätter `needs_coach_review`.
- **C1 avvisat:** ingen ifyllning i Admin som steg i slicen.
