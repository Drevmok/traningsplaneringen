# Slice 62 — Lättare / Svårare på Teknik-rad

**App:** Träningsplaneraren
**Status:** **LÅST** 2026-11-15 av Christoffer (09:41, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1». Se [`decisions.md`](decisions.md). Bas: main @ `04af122` (Slice 61 live, footer «Slice 61», smoke v46 grön). Gren: `slice-62-docs`.
**Uppdrag:** Scout 2026-11 #1, Approved av Christoffer 2026-11-02 i `backlog/IMPROVEMENTS.md` via PR #66 (`3f0a729`). Christoffer valde den som Slice 62 den 15 nov 09:23 (Europe/Stockholm), reläat av PO. Sidofix: JSON-import tappar «Medan du väntar» (QM-fynd i `SLICE61-SHIPPED.md`).
**Effort:** **M** (Scout). Liten UI, befintliga länkfält, 9 par i seederna, en import-rad, footer. Ingen schema-SQL. Data-UPDATE efter merge, A1.
**Källa:** `backlog/IMPROVEMENTS.md` (Approved, Scout outside sweep 2026-11 #1) och Scout-utkastet `/workspace/scout-drafts/2026-11-monthly-sweep.md`. Scout-formen: chip «Lättare» / «Svårare» som byter övning på plats när `progressionOf` / `regressionOf` finns; fyll ~15–25 Teknik-par; behåll minuter och hallmärke; ActivityDetail-etiketter kvar; ev. Kör passet; fas 2 = idé #3 (ingår inte här).

**Tidigare A–F:** inga. Scout gav «Suggested slice shape». A–F nedan är nya.

## Varför

I en blandad grupp är en station ibland för svår eller för lätt. Ny ledare söker då i Biblioteket, tar bort och lägger till — och riskerar att tappa minuter och hallmärke. Fälten finns redan (`Activity.progressionOf` / `regressionOf`, detaljvyn «Bygger på» / «Lättare variant av»). Seederna har 6 länkfält på 5 Teknik, varav två par är ofullständiga åt ett håll. Live-banken skrevs med `progression_of` / `regression_of` som null (Scout 2026-11).

**Vad ledaren får:** På en Teknik-rad i Passbyggaren, när en länk finns, chip «Lättare» och/eller «Svårare». Ett tryck byter övning på plats. Minuter och hallmärke är kvar.

**Vad admin får:** Inga nya formulärfält i den här slicen (länkar skickas medvetet inte från «Ändra i banken», Slice 32). Live-banken fylls med en länk-UPDATE efter merge, A1, bara efter Christoffers separata ja.

## Kod i dag (main @ `04af122`, läst — ingenting byggt)

- Fält: `Activity.progressionOf` / `regressionOf` (`types.ts:75–76`) mappas till `progression_of` / `regression_of` (`bankRow.ts:185–188`, `OWN_LIMITS` via `sanitizeLinkId`). Kolumnerna finns i `slice-31/content/schema-31.sql` (FK till `exercises.id`, `on delete set null`). Ingen ny kolumn behövs. `BANK_LIMITS` orörd (länkar har eget id-tak, inte `howTo`).
- Semantik redan i UI: `progressionOf` = «Bygger på» (lättare underlag), `regressionOf` = «Lättare variant av» (svårare mål) — `blockMeta.ts:651–652`, `ActivityDetail.tsx:101–102, 212–217`. Etiketterna behålls.
- Befintliga seed-länkar (6 fält): `landning-plint` ↔ `grenhopp-trampett` ↔ `formhopp-over-block` (reciproka); `minihjul.regressionOf = hjul` och `soldatsparkar-bom.progressionOf = balansgang` (ensidiga). Tester i `seedActivities.test.ts` kräver att målet finns i katalogen.
- Admin: «Tags, difficulty, links, visual and order are never sent, so the database keeps them» (`AdminBankForm.tsx:38–39`). Länkar kan alltså inte fyllas i Admin i dag. Import (`ownImport.ts:139–147`) och bankrad läser dem redan.
- Passrad: `BlockCard.tsx` visar titel, `ActivityTip` (minuter) och ×. Ingen byte av `activityId`. Hallmärken nycklas på `SessionItem.id`, inte `activityId` (`hall.ts:176–207`) — ett byte som behåller `item.id` lämnar märket. `stationEquipment === undefined` betyder att förslag hämtas från den aktuella övningen; `[]` eller ifyllt är ledares val.
- `SLICE_NUMBER = '61'` (`blockMeta.ts:97`). Ändring i `blockMeta.ts` gör att `pick-smokes` säger hela loopen (kärnfil, samma som Slice 61).
- Sidofix: `ownImport.ts:162` sätter `howTo: normalizeHowTo(...)`. `normalizeHowTo` arbetar bara på steg via `parseHowLines` och släpper vänt-raden. `composeHowTo` / `waitingText` i `lib/waitingLine.ts` finns redan.

## Scope (★)

- Hjälpfunktion som slår upp lättare/svårare (eget fält, annars omvänd länk). Chip i Passbyggaren som byter `activityId`, behåller `item.id`, minuter och anteckning.
- 9 reciproka par i seederna (16 Teknik; listan i `content/microcopy.sv.md`). De övriga 8 Teknik får inga nya länkar.
- Import av egna övningar behåller «Medan du väntar» via samma hjälpfunktion som Slice 61.
- `SLICE_NUMBER = '62'`. Ingen schema-SQL, inga nya Admin-länkfält, ingen ändring i Hallöversikt, Redigera redskap, Planera pass, Skriv ut passet eller Kör passet. Scout #3 (Ny vecka ett steg svårare) ingår inte. Efter merge, när appen är live: `content/update-progression-links.sql` (A1), bara efter Christoffers separata ja.

## Ej scope

- Schema-SQL / nya kolumner (A3).
- «Ny vecka ett steg svårare» (Scout #3, fas 2).
- Chip i Kör passet (B3, budget).
- Admin- eller egen-formulär för att redigera länkar (Slice 32 lämnade dem utanför sparningen).
- `push-promote --replace` mot live-banken.
- Innehåll i uppvärmning, styrka, lek, samling.
- Att visa varianter utan att kunna byta (B2) — det ersätter inte Bibliotek-söket.

## A–F (★ = Docs förslag; **låst: A1 B1 C1 D1 E1 F1**, se `decisions.md`)

### A. Datamodell och bank-SQL
- **A1 ★** Befintliga `progressionOf` / `regressionOf`. Ingen schema-SQL. Seederna i PR:en uppdateras (offline-reserv och tester). Packen har `content/update-progression-links.sql`: en idempotent UPDATE som **bara** sätter `progression_of` och `regression_of` för de 16 id:na, som Christoffer klistrar in **efter merge**, när appen är live, och bara efter sitt **separata** ja (eller PO via Supabase MCP efter hans OK). Builder kör varken SQL eller `push-promote --replace`. Agenter kör aldrig filen. Ta med filen oförändrad i bygg-PR:en. Länkar kan inte fyllas i Admin i dag (Slice 32), därför behövs pasten för live-banken.
- A2 Ingen SQL. Bara seederna. Live-banken förblir utan länkar tills någon skriver kolumnerna på annat sätt. Chip syns då knappt för ledare mot banken. Avråds.
- A3 Nytt fält eller schema-SQL, eller `push-promote --replace`. Onödigt — kolumnerna finns. `replace` skriver fler fält och sätter `needs_coach_review`. Avråds.

### B. Var varianterna syns
- **B1 ★** Chip «Lättare» / «Svårare» på Teknik-raden i Passbyggaren (`BlockCard`), bara när en länk slår. Ett tryck byter `activityId`, behåller `item.id` (hallmärke), `durationMinutes` och `note`. Är `stationEquipment` osatt följer förslagen den nya övningen; en ledares egna redskap lämnas. ActivityDetail-etiketterna oförändrade. Inte Kör passet, inte utskrift, inget extra hallmärke. Det är den godkända Scout-formen («med ett tryck»).
- B2 Bara visa titlar (detaljvy / golvkort), utan byte. Fälten syns redan i detaljvyn. Ersätter inte Bibliotek-sök. Avråds mot det Approved-förslaget.
- B3 Samma som B1, plus chip i Kör passet. Scout sa «ev.»; spräcker lätt +512 B. Inte nu.

### C. Vilka övningar får innehåll
- **C1 ★ — LÅST.** 9 reciproka par (16 Teknik) i `content/microcopy.sv.md`: komplettera de två ensidiga befintliga, behåll trampett-kedjan, lägg fem nya kedjor (äggrullning→kullerbytta, två ljushopp-steg, flickis kudde→rondat–flickis, falla bakåt→salto). Scout skrev ~15–25 par, men det finns bara 24 Teknik och budgeten är +512 B — 9 tydliga par är nog. De spotting-tunga paren ingår med avsikt (fråga 1: ja): här är poängen att kunna byta till lättare, till skillnad från Slice 61 där sidouppgift bredvid spotting lämnades utanför.
- C2 Försök länka alla 24. Tvingar tveksamma par (t.ex. bro, L-häng, volt mot olika redskap). Avråds.
- C3 Bara komplettera de två ensidiga och lämna de 4 redan reciproka fälten. För lite nytta för en M-slice.

### D. JSON-import-fixen
- **D1 ★** I `ownImport.ts`: `howTo: composeHowTo(raw.howTo, waitingText(raw.howTo))` i stället för `normalizeHowTo`. Återanvänder Slice 61-hjälpen. Utan vänt-rad är resultatet identiskt med i dag. Enhetstest att en import med 3 steg + vänt-rad behåller raden.
- D2 Skjut upp. Lämnar QM-fyndet öppet. Avråds — ändringen är en rad.
- D3 Ändra `normalizeHowTo` så att den själv sätter tillbaka vänt-raden. Skulle påverka alla anropare; `composeHowTo` finns just för det. Avråds.

### E. Bundle och footer
- **E1 ★** Inom +512 B gzip, inget undantag. Uppskattning **+0,30–0,50 kB** (hjälpfunktion + två korta chip + 12 nya länkfält i seederna + import-raden + footer). `SLICE_NUMBER = '62'`. Går bygget över: stryk par från slutet av prioriteringslistan i microcopy (8 och 9 först), inte begära undantag. Lägg bytet i en ny liten fil, inte i `session.ts`, så inte två kärnfiler rörs i onödan. `blockMeta.ts` är oundviklig (footer + etiketter) och gör att `pick-smokes` säger hela loopen.
- E2 Bara UI och import-fix, inga nya seed-länkar. Chip syns bara på de fem redan länkade. Avråds.
- E3 Ta även med Scout #3 (Ny vecka). Utanför den här slicen, budgetrisk.

### F. Tester
- **F1 ★** Enhetstester för hjälpfunktionen (eget fält och omvänd länk; inget chip när mål saknas), att bytet behåller `item.id` och minuter, att de 9 paren matchar microcopy, att import behåller vänt-raden, och att befintliga seed-/bank-/importtester är gröna. `pick-smokes 04af122 <head>` styr — troligen hela loopen p.g.a. `blockMeta.ts`. Mot baslinjen: SAMMA förutom footer 61→62 och att chip syns på länkade Teknik-rader (nya assertioner, inte regression).
- F2 Ny egen smoke. Onödigt; befintliga Passbyggar- och importsmokes räcker.
- F3 Bara den manuella checklistan, inga nya enhetstester. Avråds.

## Öppna frågor — besvarade vid lås

Se `decisions.md`. Kort:

1. **Spotting-tunga par** (prio 8–9): ja, de ingår (C1).
2. **Kör passet:** nej, chippen visas inte där (B1).
3. **Live-banken:** ja, A1. `content/update-progression-links.sql` efter merge, när appen är live, bara efter Christoffers separata ja.
