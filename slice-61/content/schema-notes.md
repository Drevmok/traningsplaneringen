# Slice 61 — schema

**Med ★ C1: ingen SQL.** Ingen `schema-61.sql`, ingen `migration-plan.md` och ingen data-UPDATE i packen.

- Texten bor i befintligt `exercises.how_to` (`slice-31/content/schema-31.sql`, `char_length` 1–800). Ingen ny kolumn, ingen ny CHECK, ingen triggerändring.
- Steggränsen 1–4 finns bara i appen (`BANK_LIMITS.steps`, `rowToEntry` via `parseHowLines`). Därför måste vänt-raden filtreras bort från stegräkningen — annars hoppas 14 av 24 seed-Teknik över, eftersom de redan har fyra steg.
- Live-banken är sanningen sedan Slice 32. Med C1 uppdateras den inte i PR:en; Christoffer fyller fältet i Admin efter merge. Agenter kör aldrig SQL mot riktiga banken.
- `push-promote --replace` används inte (C3 avvisat): body:n skriver fler fält än `how_to` och sätter `needs_coach_review`.
- **Inte ★ (C2, öppen fråga 1):** en `how_to`-endast UPDATE för de 16 id:na, som Christoffer klistrar in. Ingen schemaändring. Skrivs inte förrän C2 låses.
