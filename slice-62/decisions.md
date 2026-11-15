# Slice 62 — beslut

**LÅST 2026-11-15 av Christoffer** (09:41, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1»

Alla ★ togs. Inget avsteg från Docs förslag.

| Fråga | Val |
|---|---|
| A | **A1 ★** — befintliga `progressionOf` / `regressionOf`. Ingen schema-SQL. Seederna i PR:en uppdateras (offline-reserv och tester). Packen har `content/update-progression-links.sql`: en idempotent UPDATE som **bara** sätter `progression_of` och `regression_of` för de 16 id:na. Klistras in **efter merge**, när appen är live, och körs bara efter Christoffers **separata** ja. Christoffer klistrar in själv (eller PO via Supabase MCP efter hans OK). Agenter kör aldrig SQL. Builder tar med filen oförändrad i bygg-PR:en. |
| B | **B1 ★** — chip «Lättare» / «Svårare» på Teknik-raden i Passbyggaren, bara när en länk slår. Ett tryck byter `activityId`, behåller `item.id`, minuter och anteckning. Inte i Kör passet. |
| C | **C1 ★** — 9 reciproka par (16 Teknik) i `content/microcopy.sv.md`, inklusive spotting-tunga prio 8–9 (flickis kudde↔rondat–flickis, falla bakåt↔salto). |
| D | **D1 ★** — JSON-import av egna övningar behåller «Medan du väntar» via `composeHowTo` / `waitingText`. |
| E | **E1 ★** — inom +512 B gzip, inget undantag. `SLICE_NUMBER = '62'`. Går bygget över: stryk par från slutet av prioriteringslistan (9, sedan 8). |
| F | **F1 ★** — enhetstester för hjälpfunktionen, bytet, de 9 paren och import med vänt-rad. Befintliga tester gröna. Smokes enligt `pick-smokes`; SAMMA förutom footer 61→62 och att chip syns på länkade Teknik-rader. |

## Svar på öppna frågor

Christoffer låste «Ja, lås A1 B1 C1 D1 E1 F1» (reläat av PO 2026-11-15 09:41). Alla ★ togs genom låset. Ingen omformulering av mikrotexten begärdes.

1. **Spotting-tunga par** (prio 8–9: flickis kudde↔rondat–flickis, falla bakåt↔salto): **ja, de ingår** (C1).
2. **Kör passet:** **nej**, chippen visas inte där (B1).
3. **Live-banken:** **ja**, A1. `content/update-progression-links.sql` klistras in efter merge, när appen är live, och körs bara efter Christoffers **separata** ja. Agenter kör aldrig filen.

## Avvisat
- A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.

Bas main @ `04af122`. Gren `slice-62-docs`. **Ingen merge utan Christoffers OK.** PO skickar byggkortet till Builder; Docs pingar inte Bob.
