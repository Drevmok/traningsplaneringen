# Slice 61 — «Medan du väntar» i Teknik-text

**App:** Träningsplaneraren
**Status:** **LÅST** 2026-11-12 av Christoffer i egen widget (12:35, Europe/Stockholm): «A1 B1C2 D1 E1 F1». Se [`decisions.md`](decisions.md). **Obs: C2, inte det föreslagna C1.** Bas: main @ `9d4813b` (Slice 60 live, men footern är fortfarande «Slice 59» — Slice 60 rörde inte appen). Gren: `slice-61-docs`.
**Uppdrag:** Scout 2026-11 #2, Approved av Christoffer 2026-11-02 i `backlog/IMPROVEMENTS.md` via PR #66 (`3f0a729`). PO-kort 2026-11-12: packa som Slice 61, autonomt budgetläge, ingen ny «kör»-fras.
**Effort:** **S** (en hjälpfunktion, ett valfritt fält i två formulär, en visningsrad på tre ytor, 16 korta innehållsrader, footer. Ingen schema-SQL. Data-UPDATE efter merge, C2.)
**Källa:** `backlog/IMPROVEMENTS.md` (Approved, Scout outside sweep 2026-11 #2) och Scout-utkastet `/workspace/scout-drafts/2026-11-monthly-sweep.md`. Scout-formen: innehållspass på ~10–20 Teknik, «Medan du väntar: …» i `how_to`, visa där how_to redan syns, inget nytt schema om text räcker, hallen fortfarande ett märke.

**Tidigare A–F:** inga. Scout gav bara «Suggested slice shape». A–F nedan är nya.

## Varför

När barn står i kön vid en Teknik-station hittar en ny ledare på sidouppgifter mitt på golvet — eller så väntar barnen bara. Kunskapsarenan (Stationsträning) och ChalkBucket-tråden om bar rotation / waiting pekar på samma sak: köarbete kopplat till huvudövningen. Scout valde **text**, inte extra hallmärke (det skulle fighta ett märke per station).

**Vad ledaren får:** En rad «Medan du väntar: …» under «Så gör du» i detaljvyn, på golvkortet i Passbyggaren och i **Kör passet** — just när kön uppstår. Inget nytt steg, ingen ny skärm, ingen sidostation att placera.

**Vad admin får:** Ett valfritt fält i «Ändra övning i banken» / «Ny egen övning», skilt från de högst fyra stegen, så raden inte räknas som ett femte steg.

## Kod i dag (main @ `9d4813b`, läst — ingenting byggt)

- `Activity.howTo` (`types.ts:60`) mappas till bankfältet `how_to` (`lib/bankRow.ts:24,52`). Tak: 800 tecken (`BANK_LIMITS.howTo`), **1–4 steg** (`BANK_LIMITS.steps = 4`, `:81`; `rowToEntry` räknar med `parseHowLines` och hoppar över raden om det blir 0 eller >4, `:146–147`). Schemat har samma tak (`slice-31/content/schema-31.sql`, `char_length` 1–800) men ingen steg-CHECK — appen är grinden.
- `parseHowLines` (`lib/ownActivities.ts:94–98`) och `floorTip` (`data/activityTips.ts:180–183`) räknar **varje** icke-tom rad som steg, efter att ev. `N. ` tagits bort. `normalizeHowTo` (`:150–154`) numrerar om högst fyra rader och **släpper resten**. Admin- och egen-formulären laddar `howText` via `parseHowLines(...).join('\n')` och sparar med `normalizeHowTo` (`AdminBankForm.tsx:51,104`, `OwnActivityForm.tsx:40`, `ownActivities.ts:273`).
- Visning i dag: detaljvyn skriver hela `howTo` under «Så gör du» (`ActivityDetail.tsx:191–192`). Golvkortet (`ActivityTip.tsx:18–22,75–96`, använt i `BlockCard` i Passbyggaren) gör en numrerad lista av alla rader. **Kör passet visar bara första steget som cue** (`lib/runPass.ts:6,51`; `RunPass.tsx:205–209`). **Skriv ut passet** visar inte «Så gör du» (bara Se upp för, Säkerhet, redskap och skiss, `PassPrint.tsx`).
- Bundlade seederna: **24 Teknik**, varav **14 redan har 4 steg** och 10 har 3. Längsta `howTo` är 243 tecken (gott om rum under 800). Inget steg är över 180 tecken. Live-banken är sanningen sedan Slice 32; `seedActivities.ts` är offline-reserv (`slice-31/content/local-vs-bank.md`). Footern: `SLICE_NUMBER = '59'` (`data/blockMeta.ts:97`).

**Gapet som Scout inte nämnde:** en femte rad i `how_to` på de 14 med fyra steg gör att `rowToEntry` **hoppar över hela övningen**. Raden får inte räknas som steg.

## Scope (★)

- En hjälpfunktion som känner igen en onumrerad sista rad «Medan du väntar: …», så den inte räknas som steg och inte blir en femte punkt i golvkortet.
- 16 Teknik i de bundlade seederna får en sådan rad (listan i `content/microcopy.sv.md`). De övriga 8, och ev. fler rader bara i live-banken, ingår inte.
- Visning i detaljvy, golvkort och Kör passet. Valfritt fält i Admin och egen övning.
- `SLICE_NUMBER = '61'`. Ingen schema-SQL, inget extra hallmärke, ingen ändring i Hallöversikt, Redigera redskap, Planera pass eller Skriv ut passet. Scout #1 och #3 (Lättare/Svårare, Ny vecka) ingår inte. Efter merge: `content/update-how-to-waiting.sql` (C2), bara efter Christoffers ja.

## Ej scope

- Nytt bankfält / schema-SQL (A3).
- Sidostation som extra märke i hallen (står som dropped i Scout-svepet).
- Att lägga raden på **Skriv ut passet** (how_to syns inte där i dag).
- `push-promote --replace` mot live-banken (skriver fler fält än `how_to` och sätter `needs_coach_review`).
- Innehåll i uppvärmning, styrka, lek, samling.
- De fem mer spotting-tunga Teknikerna (rondat–flickis, flickis kudde, falla bakåt, salto från höjd, handstående falla till rygg) — låst utanför (B1).

## A–F (★ = Docs förslag; **låst: A1 B1 C2 D1 E1 F1**, se `decisions.md`)

### A. Var texten bor
- **A1 ★** I befintlig `how_to` som onumrerad sista rad `Medan du väntar: …`. Ingen ny kolumn. En liten hjälpfunktion gör att raden inte räknas som steg. Effort stannar S, som Scout föredrog.
- A2 Samma mening klistrad in i sista steget (ingen ny rad). Ser ut som en del av steget, försvinner i `normalizeHowTo` om steget blir längre än 180, och går inte att visa separat i Kör passet. Avråds.
- A3 Nytt bankfält (t.ex. `waiting_drill`). Effort M, schema-SQL och reservhämtning. PO bad att undvika SQL.

### B. Urval
- **B1 ★** 16 Teknik där kön typiskt uppstår (trampett, satsbräda, räcke, bom, plint, kullerbytta, hjul/minihjul, landning, äggrullning, rockringar). Exakta id och texter i `content/microcopy.sv.md`. Inte de fem spotting-tunga (låst utanför) och inte bro eller balansgång i den här ronden.
- B2 Alla 24 Teknik i seederna. Större bundle-risk, och spotting-tunga övningar får sidouppgift bredvid övningar som kräver aktiv spotting.
- B3 Bara 10 (nedre Scout-spannet). Mindre nytta, samma hjälpfunktion ändå.

### C. SQL och live-banken
- C1 Ingen SQL. Seederna i PR:en uppdateras (offline-reserv och tester). Live-banken uppdaterar Christoffer efter merge via det nya fältet i Admin. Avvisat — Docs förslag.
- **C2 — LÅST.** Ingen schema-SQL. Packen har `content/update-how-to-waiting.sql`: en idempotent `how_to`-endast UPDATE för de 16 id:na som Christoffer klistrar in **efter merge**, när appen är live (eller PO via Supabase MCP efter hans OK). Builder kör varken SQL eller `push-promote --replace`. Agenter kör aldrig filen.
- C3 Builder kör `push-promote --replace` efter Christoffers OK. `replaceBody` skickar alla textfält utom status/id/sort och sätter `needs_coach_review`. Layout-kolumnen nämns inte (PATCH lämnar den), men title, summary, redskap och länkar skrivs från seedfilen. Avråds.

### D. Visning
- **D1 ★** Raden visas som egen text under «Så gör du», inte som en punkt i steglistan: i detaljvyn (`ActivityDetail`), på golvkortet (`ActivityTip`) och i **Kör passet** under cue (`RunPass`). Cue förblir första steget. Hallen har fortfarande ett märke. Skriv ut passet oförändrat.
- D2 Bara där hela `how_to` redan syns (detalj + golvkort). Inte Kör passet. Följer Scout bokstavligt («om den redan syns»), men missar golvögonblicket — Kör visar i dag bara första steget.
- D3 Extra märke eller sidostation i Hallöversikt. Fightar låset ett märke per station. Förbjudet.

### E. Bundle och footer
- **E1 ★** Inom +512 B gzip, inget undantag. Uppskattning **+0,30–0,50 kB** (16 korta rader i `seedActivities.ts` + hjälpfunktion + ett fält + en visningsrad + footer). Om bygget går över: korta texterna eller stryk från slutet av prioriteringslistan i microcopy ner till 12, inte begära undantag. `SLICE_NUMBER = '61'` (hoppar över 60 i footern, eftersom Slice 60 lämnade den på 59).
- E2 Bara hjälpfunktion, fält, visning och footer — inte seederna. Mindre bundle, men offline-reserven och testerna saknar raderna tills live-banken synkas tillbaka.
- E3 Alla 24 + rad även på utskriften. Risk att spräcka budgeten.

### F. Tester
- **F1 ★** Enhetstester för hjälpfunktionen och att de 16 seederna har raden samtidigt som stegen fortfarande är 1–4. Befintliga seed-, bank-, tip- och runPass-tester gröna. Smokes enligt `pick-smokes` på ändrade filer (förväntat: `seed-2DJ_oMM81mI-smoke`, s30, s30-fix-b1, s34, s38; s47 när Admin-/egen-formuläret ändras). Mot baslinjen: SAMMA förutom footern 59→61.
- F2 Ny egen smoke. Onödigt för en textrad.
- F3 Bara den manuella checklistan, inga nya enhetstester. Avråds — steggränsen är lätt att bryta.

## Öppna frågor — besvarade vid lås

Se `decisions.md`. Kort:

1. **Live-banken:** C2 (inte C1). `content/update-how-to-waiting.sql` efter merge, bara efter Christoffers ja.
2. **Texterna** i `content/microcopy.sv.md`: oförändrade.
3. **Spotting-tunga Teknik:** kvar utanför (B1).
4. **Lås:** «A1 B1C2 D1 E1 F1» (egen widget 2026-11-12 12:35).
