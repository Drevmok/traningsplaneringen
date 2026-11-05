# Slice 59 — Städning av stationsskisser + Admin-kö «Saknar skiss»

**App:** Träningsplaneraren
**Status:** **FÖRESLAGEN** 2026-11-05. Christoffers «Kör på med Slice 59!» (via PO) startar slicen men är inget A–F-lås. Låset går via PO och Christoffer, ordagrant. `decisions.md` skrivs först vid lås. Bas: main @ `3f0a729` (Slice 58 live, footer «Slice 58»). Gren: `slice-59-docs`.
**Effort:** **S** (en ren hjälpfunktion, en hopfälld lista i Admin, en prop i `AdminBankForm`, två strängar. Ingen SQL.)
**Källa:** Scout 2026-11-01 idé 2 och 3 (`/workspace/scout-drafts/2026-11-01-s57-followup.md`). Scout föreslog att de två idéerna buntas («Bundle med #2»). Slice 58 lämnade dem uttryckligen utanför (`slice-58/decisions.md`).

**Tidigare A–F:** inga. Varken Scout-utkastet, `backlog/IMPROVEMENTS.md`, `slice-57/`, `slice-58/` eller PO-anteckningarna har A–F för idé 2 och 3. Scout gav bara en «Suggested slice shape». A–F nedan är nya och bygger på den texten.

## Varför

Telefonpunkt 3 från Christoffer: «i vissa fall ser [skisserna] dåliga ut». De flesta Teknik-övningar i banken har ingen sparad uppställning (`default_station_layout = null`), så ledaren ser den automatiska skissen (heuristiken från Slice 13). Seedfilen visar storleken: **23 av 24 Teknik har redskap, 0 har uppställning** (`evidence/seed-teknik.md`). Live har troligen fler rader från import och egna övningar.

Med Slice 58 går det att stapla och ändra ytan. Det som saknas är en arbetslista, så att admin inte missar rader.

**Vad admin får:** I Admin finns en hopfälld lista **«Saknar skiss (n)»**. Tryck på en övning, så öppnas skissbladet direkt. Ställ upp, «Klar», «Spara i banken». Övningen försvinner ur listan.

**Vad ledaren får:** Inget nytt att lära. Efter städpasset visar fler bankövningar en riktig uppställning i detaljvyn och på **Skriv ut passet**.

## Vad «städning» betyder här (enligt Scout)

Scout definierar städning som en **manuell innehållsrunda**: «Christoffer/admin öppnar «Ställ upp stationen» per Teknik som behöver det och sparar». Två grupper:

1. **Heuristik:** Teknik med redskap men utan sparad uppställning. Kön i den här slicen fångar dem.
2. **Tidig layout:** uppställningar sparade i Slice 57 (före höjd och yta). Scout nämner dem men ger ingen lista. Se öppen fråga 4.

Scout säger uttryckligen: «Inga automatiska bildgenereringar». Scout-texten nämner **inte** automatisk återställning, rensning av redskap som inte längre finns i listan, eller klämning av värden. Två av dem finns redan i koden och behöver inget nytt:

- Poser för redskap som inte finns i listan tas bort, och x/z/y/yaw kläms, vid varje läsning (`sanitizeStationLayout`, `data/stationLayout.ts:73–101`) och följer listan vid ändring (`syncLayout` `:192–211`).
- En layout vars antal inte stämmer med redskapslistan kastas redan vid läsning (`bankRow.ts:181`). Appen behandlar den som saknad, så den hamnar i kön.
- Att gå tillbaka till automatisk skiss går redan: «Ställ i rad igen» → «Klar» skickar ingen layout (`StationLayoutSheet.tsx:248`), och «Spara i banken» sparar `null` (`AdminBankForm.tsx:111`).

## Kod i dag (main @ `3f0a729`, läst, ingenting byggt)

- Admin-vyn: `app/src/components/AdminArea.tsx` (128 rader, lat chunk). `LISTS` `:15–19` (Väntar på godkännande / Behöver granskas / Dolda). Tom text «Inget väntar just nu.» `:63` gäller bara de listorna. Sektioner: listor `:62–76`, Ny egen övning + Importera `:78–87`, Föreningens mallar `:89–91`. Kort → detaljvy `:70`, formulär `:101–111`.
- Formuläret: `app/src/components/AdminBankForm.tsx`. `placing` `:63` styr skissbladet. Knappen «Ställ upp stationen» `:190–192`. Sparar via `saveRow` (`lib/admin/bankWrite.ts:69`), som sätter `needs_coach_review: false`, kollar `updated_at` (konflikt) och laddar om admin-banken (`loadAdminBank`). Raden lämnar alltså kön av sig själv efter sparning.
- Skissbladet: `app/src/components/StationLayoutSheet.tsx` (props `slots`, `initialLayout`, `onDone`, `onClose`).
- Admin-data: `lib/admin/state.ts` `AdminEntry { activity, status, needsReview, … }`. `lib/admin/adminBank.ts:17–31` `toAdminEntries` → `rowToEntry` (`lib/bankRow.ts:181`), som sanerar layouten mot redskapen.
- Kolumner: `BANK_EXERCISE_COLUMNS` (`lib/bankRow.ts:46`, med `default_station_layout` `:60`). Reservhämtning utan kolumnen: `lib/bank.ts:193`.
- Ledarens regel E1 (`layoutForStation`, `data/stationLayout.ts:238–246`) gäller pass med egen redskapslista. För en bankrad är listan alltid den föreslagna, så «fallit tillbaka» i kön = «saknas eller ogiltig».
- Text: `data/blockMeta.ts` `adminFilter*` `:487–489`, `adminSaved` `:516`, `stationLayoutOpen` `:336`. Footer `SLICE_NUMBER = '58'` `:97`.

## A–F (★ = Docs förslag)

### A. Vad gör appen för städningen?
- **A1 ★** Inget automatiskt. Städningen är ett manuellt pass: admin går igenom kön och sparar med befintlig redigerare. Rensning och klämning sker redan vid läsning och sparning (se ovan). Inga nya knappar i skissbladet.
- A2 Som A1 plus en tydlig knapp «Ta bort skissen» i bladet. Behövs inte: «Ställ i rad igen» + «Klar» gör redan det. Scout nämner det inte.
- A3 Skript eller SQL som fyller i layouter från heuristiken för alla rader. Avvisas: Scout säger «Inga automatiska bildgenereringar», och det skulle kräva SQL mot riktiga banken.

### B. Vilka övningar hamnar i kön?
- **B1 ★** `blockType === 'techniques'`, minst ett redskap i `defaultStationEquipment`, **ingen giltig** `defaultStationLayout` efter sanering (saknas eller antal stämmer inte), status **published eller pending**. Dolda (`hidden`) räknas inte. Ordning som admin-banken (`sortOrder`).
- B2 Som B1 men även dolda. Mer att gå igenom för övningar ingen ledare ser.
- B3 Eget märke för «layout finns men matchar inte redskapen». Kräver att rå-JSON sparas i `AdminEntry`. Scout nämner fallet, men för en bankrad ser det likadant ut för ledaren som «saknas», så B1 slår ihop dem.

### C. Var ligger kön?
- **C1 ★** Egen hopfälld sektion (`<details>`) i Admin, **under «Importera övningar» och över «Föreningens mallar»**. Rubrik «Saknar skiss (n)», en kort hint, sedan korten. Visas bara när n > 0. Ingår inte i `LISTS`, så «Inget väntar just nu.» och ordningen överst är som förut.
- C2 Fjärde lista i `LISTS` överst. Då försvinner «Inget väntar just nu.» så länge någon Teknik saknar skiss, och ordningen ändras (Slice 47-smoken AC11 måste skrivas om). Med ~23 rader trycks Väntar/Granskas ner.
- C3 Filterchips «Saknar skiss / Har skiss» i Biblioteket i admin-läge. Mer chrome, och Slice 47 AC12 säger att Biblioteket inte har admin-chips.

### D. Från kön till skissbladet
- **D1 ★** Tryck på ett kort i kön → «Ändra övning i banken» öppnas med **«Så ska stationen stå» redan öppet** ovanpå. «Klar» → tillbaka i formuläret → «Spara i banken» → toast «Sparat i banken.», och raden försvinner ur kön. Samma sparväg som i dag (konfliktkoll, offline-spärr). Stänger admin bladet utan «Klar» står formuläret kvar, och «Avbryt» sparar inget.
- D2 Som de andra listorna: kort → detaljvy → «Ändra i banken» → «Ställ upp stationen». Ingen ny kod för hoppet, men fyra tryck per rad.
- D3 Spara direkt från bladet (bara layout, utan formuläret). Ny skrivväg och ingen synlig kontroll av övriga fält. Avvisas för en S-slice.

### E. Oförändrat
- **E1 ★** Ledarens vy är byte-identisk med main: heuristikgrenen i `StationSketch`, detaljvy, **Skriv ut passet**, **Hallöversikt**, **Redigera redskap**, Planera pass. Admin-listorna Väntar/Behöver granskas/Dolda och deras väg via detaljvyn är oförändrade. Ingen schemaändring. Slice 57/58-regler (E1 `layoutForStation`, `{v:1}`, `y`, `surface`) oförändrade.

### F. Omfång, budget, SQL
- **F1 ★** A1 B1 C1 D1 E1. **Ingen SQL**, ingen ny kolumn, inget märke «Automatisk skiss räcker». Footer «Slice 59». Bundle inom mjuka +512 B gzip. Städpasset görs av Christoffer efter att Slice 59 är live (innehåll, inte Builder).
- F2 Som F1 plus en andra hopfälld lista «Har skiss (n)» direkt under, för att gå igenom tidiga Slice 57-uppställningar (Scouts «Har layout»). Ca +40–80 B gzip, samma komponent.

**Utanför omfånget:** Scout månadssvep 2026-11 #1–#3 (Lättare/Svårare, Medan du väntar, Ny vecka svårare; Approved i backlog, egen slice), 3D-vy/WebGL/`three`, hall-CAD, nya redskap i `EQUIPMENT_PIECES`, ledare som redigerar layout, automatiska skisser, märket «skissen räcker» (skulle kräva kolumn och SQL), ändringar i Redigera redskap eller Hallöversikt.

## Effort: S

Ren funktion `needsLayout` + test, en sektion i `AdminArea`, en prop `openLayout` i `AdminBankForm`, två strängar, footer. Ingen SQL, ingen cache-bump, ingen ny skrivväg.

**Bundle:** uppskattat **+0,15–0,35 kB gzip** totalt. Huvudchunken får bara strängarna och footern (ca +60–100 B, `blockMeta.ts`). Resten hamnar i den lata admin-chunken (`AdminArea`, `AdminBankForm`). Inget undantag väntas. Med F2: ca +0,2–0,4 kB.

## Risker
- **«Klar» utan ändring är inte neutralt.** En rad utan layout får då en sparad rad-uppställning, och heuristikens automatiska ansatsmattor försvinner (Slice 57 D1). Hinten i kön säger «ställ upp», och HANDOFF ändrar inget i bladet. Vill admin behålla den automatiska skissen stänger hen bladet och trycker «Avbryt».
- **Spara kräver hela formuläret.** «Spara i banken» validerar alla fält (`ownActivityIssues`). En importerad rad med tomt fält måste fyllas i först. Det gäller redan i dag.
- **Sparning nollställer «Behöver granskas».** Befintligt beteende i `saveRow`. Notera i ship notes.
- **Smokes:** `AdminArea.tsx` och `AdminBankForm.tsx` finns i `verifier/smoke-map.json` (slice-32, slice-47). C1 lägger sektionen mellan «Importera övningar» och «Föreningens mallar», så ordningskollen i slice-47 AC11 håller. Verifier kör ändå båda mot baslinjen.

## Öppna frågor till Christoffer (★ = förslag om du inte svarar)

1. **Rubrik:** «Saknar skiss (n)» ★, «Saknar layout (n)» eller «Saknar uppställning (n)»?
2. **Väntande rader:** ska Teknik som väntar på godkännande också stå i kön? ★ Ja, published + pending, inte dolda (B1).
3. **Hoppet:** öppna skissbladet direkt från kön (D1 ★) eller gå via detaljvyn som de andra listorna (D2)?
4. **Tidiga Slice 57-skisser:** behövs en lista «Har skiss (n)» också (F2)? ★ Nej. De är få, och du når dem via Biblioteket → «Ändra i banken».
5. **«Skissen räcker»:** ska en övning där den automatiska skissen ser bra ut kunna markeras och lämna kön? ★ Nej i denna slice (kräver ny kolumn och SQL). Kön är en arbetslista och behöver inte bli tom.
6. **Städpasset:** gör du det själv efter att Slice 59 är live? ★ Ja. Verifier gör bara stickprov mot testbank, aldrig mot den riktiga banken.
7. **Lås:** Effort S skulle enligt PROJECT.md kunna låsas av Planner, men kortet säger att du låser. ★ Svara ordagrant, t.ex. «Ja, lås A1 B1 C1 D1 E1 F1».
