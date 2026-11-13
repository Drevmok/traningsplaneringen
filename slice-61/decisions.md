# Slice 61 — beslut

**LÅST 2026-11-12 av Christoffer** i egen widget (12:35, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «A1 B1C2 D1 E1 F1»

**Obs: C2, inte C1.** Docs föreslog C1 (Christoffer fyller vänt-fältet i Admin efter merge, ingen SQL). Christoffer valde **C2:** efter merge får den levande banken en `how_to`-endast UPDATE-paste för de 16 id:na. Den körs bara efter Christoffers ja. Christoffer klistrar in själv (eller PO via Supabase MCP efter hans OK). Agenter kör aldrig SQL. C1 är avvisat.

Övriga ★ står kvar (A1 B1 D1 E1 F1). De fem spotting-tunga Teknikerna ligger utanför (B1).

| Fråga | Val |
|---|---|
| A | **A1 ★** — i befintlig `how_to` som onumrerad sista rad `Medan du väntar: …`. Ingen ny kolumn. En hjälpfunktion gör att raden inte räknas som steg. |
| B | **B1 ★** — 16 Teknik (id och texter i `content/microcopy.sv.md`). Inte de fem spotting-tunga, och inte bro, balansgång eller åsnesparkar i den här ronden. |
| C | **C2** — ingen schema-SQL. Packen har `content/update-how-to-waiting.sql`: idempotent UPDATE som bara rör `exercises.how_to` för de 16 id:na. Klistras in **efter merge**, när appen är live, och bara efter Christoffers ja. Aldrig körd av bottar. |
| D | **D1 ★** — raden visas som egen text under «Så gör du» i detaljvyn, på golvkortet och i Kör passet under cue. Cue förblir första steget. Hallen har fortfarande ett märke. Skriv ut passet oförändrat. |
| E | **E1 ★** — inom +512 B gzip, inget undantag. `SLICE_NUMBER = '61'`. Går bygget över: korta texterna eller stryk från slutet av prioriteringslistan ner till 12. |
| F | **F1 ★** — enhetstester för hjälpfunktionen och att de 16 seederna har raden med 1–4 steg. Befintliga tester gröna. Smokes enligt `pick-smokes`; SAMMA förutom footern 59→61. |

## Svar på öppna frågor

Christoffer låste «A1 B1C2 D1 E1 F1» i egen widget. C2 är ett medvetet avsteg från Docs ★ (C1). Övriga ★ togs genom låset. Ingen omformulering av mikrotexten begärdes.

1. **Live-banken:** C2, inte C1. Efter merge en `how_to`-endast UPDATE för de 16 id:na (`content/update-how-to-waiting.sql`). Körs bara efter Christoffers ja. Christoffer klistrar in själv (eller PO via Supabase MCP efter hans OK). Ingen ifyllning i Admin som steg i slicen.
2. **Texterna** i `content/microcopy.sv.md`: oförändrade.
3. **Spotting-tunga Teknik** (rondat–flickis, flickis kudde, falla bakåt, salto från höjd, handstående falla till rygg): kvar utanför (B1).
4. **Lås:** låst som «A1 B1C2 D1 E1 F1».

## Avvisat
- A2, A3, B2, B3, **C1**, C3, D2, D3, E2, E3, F2 och F3.

Bas main @ `9d4813b`. Gren `slice-61-docs`. **Ingen merge utan Christoffers OK.** PO skickar byggkortet till Builder; Docs pingar inte Bob.
