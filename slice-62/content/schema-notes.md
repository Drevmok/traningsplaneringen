# Slice 62 — schema

**LÅST 2026-11-15, A1: ingen schema-SQL.** Ingen `schema-62.sql`, ingen `migration-plan.md`, ingen ny kolumn, ingen ny CHECK, ingen triggerändring. `BANK_LIMITS` orörd.

Länkarna bor i befintliga `exercises.progression_of` och `exercises.regression_of` (`slice-31/content/schema-31.sql`, FK till `exercises.id`, `on delete set null`, deferrable). Appen mappar dem redan (`bankRow.ts`).

- Live-banken är sanningen sedan Slice 32. Scout 2026-11: bank-seedens delar skrev de två kolumnerna som null, så ledare ser i praktiken inga länkar mot banken i dag. Seederna i bygg-PR:en är offline-reserv och tester.
- Efter merge, när appen är live, och bara efter Christoffers **separata** ja, klistrar Christoffer in `content/update-progression-links.sql` (eller PO via Supabase MCP efter hans OK). Filen är en idempotent UPDATE som **bara** sätter `progression_of` och `regression_of` för de 16 id:na till värdena i microcopy. Övriga kolumner orörda. Agenter kör aldrig SQL mot riktiga banken. Builder tar med filen oförändrad i bygg-PR:en; skriver inte en ny.
- Pasten är tekniskt inte farlig före live (till skillnad från Slice 61-vänt-raden): kolumnerna finns redan, och gammal app visar bara detaljvy-etiketterna. **Låst regel:** körs ändå bara efter merge, när appen är live, och bara efter Christoffers separata ja, så chip och data kommer samtidigt.
- `push-promote --replace` används inte (A3 avvisat): body:n skriver fler fält än länkarna och sätter `needs_coach_review`.
- Admin «Ändra i banken» skickar medvetet inte länkar (Slice 32). Därför är A2 (ifyllning i Admin) inte ett verkligt alternativ utan nya fält, vilket den här slicen inte tar med.
- `how_to`-taket 800 och steggränsen 1–4 berörs inte. Import-fixen (D1) återanvänder `composeHowTo` så att vänt-raden inte räknas som steg.
