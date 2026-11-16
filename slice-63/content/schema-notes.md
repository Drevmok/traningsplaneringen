# Slice 63 — schema

**LÅST 2026-11-16, E1/D1: ingen SQL.** Ingen `schema-63.sql`, ingen `migration-plan.md`, ingen data-UPDATE, ingen ny kolumn, ingen ny CHECK, ingen triggerändring. `BANK_LIMITS` orörd.

Slicen återanvänder befintliga `exercises.progression_of` / `exercises.regression_of` via `harderOf` (Slice 62). Inga seed-länkar läggs till.

- PO (pack-beställning 2026-11-16): alla 16 Teknik har progression-länkar live på main @ `2917296`. Därför behövs ingen ny paste.
- **Uppdatering 2026-11-16 (PO):** `update-progression-links.sql` kördes på live 2026-11-15 ca 15:15 (Europe/Stockholm) med Christoffers ja. 11 rader uppdaterades, 5 hade redan rätt värde, och alla 16 Teknik är länkade. Samma not står i `SLICE62-SHIPPED.md` på den här grenen. Om någon ledare mot förmodan saknar länkar döljs kontrollen när passet inte har någon Teknik med `harderOf`-mål (D1) — det är inte ett SQL-ärende i Slice 63.
- `push-promote --replace` används inte. Admin «Ändra i banken» skickar fortfarande inte länkar (Slice 32).
- `startNewWeek` / arkivet rör bara den lokala enheten. Ingen bankskrivning.
