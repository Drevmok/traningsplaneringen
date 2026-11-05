# Slice 59 — Städning av stationsskisser + Admin-kö «Saknar skiss»

**App:** Träningsplaneraren
**Status:** **FÖRESLAGEN** 2026-11-05. Christoffers «Kör på med Slice 59!» (via PO) startar slicen men är inget A–F-lås. Låset går via PO och Christoffer, ordagrant. `decisions.md` skrivs först vid lås. Bas: main @ `3f0a729` (Slice 58 live, footer «Slice 58»). Gren: `slice-59-docs`.
**Rev 2026-11-05 (PO-kort):** «Klar» utan ändring ska inte skapa eller spara en uppställning. Nya bokstäver **G** (vad som är en ändring) och **H** (var regeln gäller). A–F har samma innebörd som PO redan fått, med en not i E1 och F1. Fortfarande FÖRESLAGEN, inget lås.
**Effort:** **S** (två rena hjälpfunktioner, en hopfälld lista i Admin, en prop i `AdminBankForm`, en jämförelse i «Klar» i skissbladet, två strängar. Ingen SQL.)
**Källa:** Scout 2026-11-01 idé 2 och 3 (`/workspace/scout-drafts/2026-11-01-s57-followup.md`). Scout föreslog att de två idéerna buntas («Bundle med #2»). Slice 58 lämnade dem uttryckligen utanför (`slice-58/decisions.md`).

**Tidigare A–F:** inga. Varken Scout-utkastet, `backlog/IMPROVEMENTS.md`, `slice-57/`, `slice-58/` eller PO-anteckningarna har A–F för idé 2 och 3. Scout gav bara en «Suggested slice shape». A–F nedan är nya och bygger på den texten.

## Varför

Telefonpunkt 3 från Christoffer: «i vissa fall ser [skisserna] dåliga ut». De flesta Teknik-övningar i banken har ingen sparad uppställning (`default_station_layout = null`), så ledaren ser den automatiska skissen (heuristiken från Slice 13). Seedfilen visar storleken: **23 av 24 Teknik har redskap, 0 har uppställning** (`evidence/seed-teknik.md`). Live har troligen fler rader från import och egna övningar.

Med Slice 58 går det att stapla och ändra ytan. Det som saknas är en arbetslista, så att admin inte missar rader.

**Vad admin får:** I Admin finns en hopfälld lista **«Saknar skiss (n)»**. Tryck på en övning, så öppnas skissbladet direkt. Ställ upp, «Klar», «Spara i banken». Övningen försvinner ur listan. Trycker admin «Klar» utan att ändra något behålls den automatiska skissen, och övningen står kvar i listan (G1).

**Vad ledaren får:** Inget nytt att lära. Efter städpasset visar fler bankövningar en riktig uppställning i detaljvyn och på **Skriv ut passet**.

## Vad «städning» betyder här (enligt Scout)

Scout definierar städning som en **manuell innehållsrunda**: «Christoffer/admin öppnar «Ställ upp stationen» per Teknik som behöver det och sparar». Två grupper:

1. **Heuristik:** Teknik med redskap men utan sparad uppställning. Kön i den här slicen fångar dem.
2. **Tidig layout:** uppställningar sparade i Slice 57 (före höjd och yta). Scout nämner dem men ger ingen lista. Se öppen fråga 4.

Scout säger uttryckligen: «Inga automatiska bildgenereringar». Scout-texten nämner **inte** automatisk återställning, rensning av redskap som inte längre finns i listan, eller klämning av värden. Två av dem finns redan i koden och behöver inget nytt:

- Poser för redskap som inte finns i listan tas bort, och x/z/y/yaw kläms, vid varje läsning (`sanitizeStationLayout`, `data/stationLayout.ts:73–101`) och följer listan vid ändring (`syncLayout` `:192–211`).
- En layout vars antal inte stämmer med redskapslistan kastas redan vid läsning (`bankRow.ts:181`). Appen behandlar den som saknad, så den hamnar i kön.
- Att gå tillbaka till automatisk skiss går redan: «Ställ i rad igen» → «Klar» skickar ingen layout (`StationLayoutSheet.tsx:248`), och «Spara i banken» sparar `null` (`AdminBankForm.tsx:111`).

En sak finns **inte** i koden: att «Klar» utan ändring lämnar skissen som den var. I dag sparar den en rad-uppställning (se nästa avsnitt och G).

## Kod i dag (main @ `3f0a729`, läst, ingenting byggt)

- Admin-vyn: `app/src/components/AdminArea.tsx` (128 rader, lat chunk). `LISTS` `:15–19` (Väntar på godkännande / Behöver granskas / Dolda). Tom text «Inget väntar just nu.» `:63` gäller bara de listorna. Sektioner: listor `:62–76`, Ny egen övning + Importera `:78–87`, Föreningens mallar `:89–91`. Kort → detaljvy `:70`, formulär `:101–111`.
- Formuläret: `app/src/components/AdminBankForm.tsx`. `placing` `:63` styr skissbladet. Knappen «Ställ upp stationen» `:190–192`. Sparar via `saveRow` (`lib/admin/bankWrite.ts:69`), som sätter `needs_coach_review: false`, kollar `updated_at` (konflikt) och laddar om admin-banken (`loadAdminBank`). Raden lämnar alltså kön av sig själv efter sparning.
- Skissbladet: `app/src/components/StationLayoutSheet.tsx` (props `slots`, `initialLayout`, `onDone`, `onClose`).
  - Startläge `:33`: finns `initialLayout` → `syncLayout(initialLayout, slots)`, annars `defaultLayoutFrom(slots)` (`data/stationLayout.ts:214–227`: heuristikens ordning, jämnt fördelat x, z 0,5, yaw 0, **utan** ansatsmattor).
  - «Klar» `:244–249`: `onDone(empty || reset ? undefined : { v: 1, poses, surface? })`. Bladet har ingen jämförelse mot startläget och ingen ändringsflagga. **Följd:** utan layout → öppna → «Klar» skickar startraden som layout.
  - `reset` `:38` sätts av «Ställ i rad igen» `:231–242` (poser = `defaultLayoutFrom`, yta 0) och nollas av varje `update` `:43–46` (drag, piltangenter, Vrid, Höjd) och av Bredare/Högre yta `:96–99`. «Standardyta» `:224–226` nollar **inte** `reset`.
  - «Avbryt»-motsvarighet: bladet har ingen; klick på bakgrunden → `onClose` `:137–139`, som i formulären bara stänger (`placing=false`) utan att röra layouten.
- Formulären håller layouten i `draft.layout`: `AdminBankForm.tsx:53` (från sanerad `a.defaultStationLayout`), `OwnActivityForm.tsx:44`. «Klar» → `set('layout', layout)` (`AdminBankForm.tsx:252–255`, `OwnActivityForm.tsx:193–196`). Chip-ändring (C1 från 57): `layout: prev.layout && slots.length > 0 ? syncLayout(prev.layout, slots) : undefined` (`AdminBankForm.tsx:268–271`, `OwnActivityForm.tsx:208–212`), alltså **ingen layout förblir ingen layout** redan i dag.
- Sparvägen håller redan `null`: `AdminBankForm.tsx:109–111` skickar layouten bara om `draft.layout` finns, och `null` bara om raden hade en. Ny rad: `pendingRow` (`lib/admin/bankWrite.ts:94–105`) utelämnar fältet utan layout. Egen övning: `build` (`lib/ownActivities.ts:277`) sätter `defaultStationLayout: draft.layout`. Felet sitter alltså bara i bladets «Klar».
- Ledarens skiss: `StationSketch.tsx:13–15` ritar den sparade layouten om den är giltig (D1 från 57: inga ansatsmattor, ingen ansatstext); annars heuristiken `:43–73` med `expand` (ansatsmattor när trampett/satsbräda saknar bana, `data/stationLayout.ts:44–59`).
- Slice 58 (`y`, `surface`): `y` i steg om 1/8 (`sanitizeY` `:106–109`), yta w/h 0–2 och utelämnad när båda är 0 (`sanitizeSurface` `:115–122`). «Klar» skickar `surface` bara ≠ 0.
- Var bladet öppnas: `AdminBankForm` (Admin «Ny egen övning», Admin-kön med D1, Biblioteket «Ändra i banken» via `SessionBuilder.tsx:780`) och `OwnActivityForm` (egen övning i Biblioteket, `SessionBuilder.tsx:768`). En ändring i bladet gäller alltså alla fyra vägarna.
- Slice 57 om «Ställ i rad igen»: HANDOFF «→ layout `undefined` (heuristik)», mikrotext «Återgår till appens förslag (tar bort sparad layout)» (commit `658265e`, `slice-57/HANDOFF.md:25`, `slice-57/content/microcopy.sv.md:14`). Slice 57 säger inget om «Klar» utan ändring.
- Admin-data: `lib/admin/state.ts` `AdminEntry { activity, status, needsReview, … }`. `lib/admin/adminBank.ts:17–31` `toAdminEntries` → `rowToEntry` (`lib/bankRow.ts:181`), som sanerar layouten mot redskapen.
- Kolumner: `BANK_EXERCISE_COLUMNS` (`lib/bankRow.ts:46`, med `default_station_layout` `:60`). Reservhämtning utan kolumnen: `lib/bank.ts:193`.
- Ledarens regel E1 (`layoutForStation`, `data/stationLayout.ts:238–246`) gäller pass med egen redskapslista. För en bankrad är listan alltid den föreslagna, så «fallit tillbaka» i kön = «saknas eller ogiltig».
- Text: `data/blockMeta.ts` `adminFilter*` `:487–489`, `adminSaved` `:516`, `stationLayoutOpen` `:336`. Footer `SLICE_NUMBER = '58'` `:97`.

## A–H (★ = Docs förslag)

A–F som PO redan fått. G och H är nya i rev 2026-11-05.

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
- *Not (rev):* E1 gäller ledarens vy och admin-listorna och är oförändrad. Skissbladets «Klar» ändras genom G1/H1, inte genom E1.

### F. Omfång, budget, SQL
- **F1 ★** A1 B1 C1 D1 E1 (*rev:* plus G1 H1, som låses tillsammans med A–F). **Ingen SQL**, ingen ny kolumn, inget märke «Automatisk skiss räcker». Footer «Slice 59». Bundle inom mjuka +512 B gzip. Städpasset görs av Christoffer efter att Slice 59 är live (innehåll, inte Builder).
- F2 Som F1 plus en andra hopfälld lista «Har skiss (n)» direkt under, för att gå igenom tidiga Slice 57-uppställningar (Scouts «Har layout»). Ca +40–80 B gzip, samma komponent.

### G. Vad räknas som en ändring i skissbladet? (ny, rev)
- **G1 ★ Jämför med startläget.** «Klar» jämför bladets resultat med startläget (`start` `:33`) med en ren funktion `sameLayout` i `data/stationLayout.ts`. Lika → bladet lämnar tillbaka **exakt det det fick** (`initialLayout`: `undefined` eller samma objekt). Olika → ny layout som i dag. Ordning när «Klar» trycks:
  1. Inga redskap → `undefined` (som i dag).
  2. «Ställ i rad igen» tryckt och inget ändrat efteråt → `undefined` (Slice 57: tillbaka till automatisk skiss, tar bort en sparad layout).
  3. Resultatet = startläget → `initialLayout` oförändrad.
  4. Annars → `{ v: 1, poses, surface? }`.
  «Lika» betyder: samma antal poser, samma `pieceId` i samma ordning, x och z inom ±0,005, yaw inom ±0,01 rad (efter `normalizeYaw`), samma antal lager (`round(y·8)`, saknas = 0), samma yta (w/h, saknas = 0). Toleransen tar bort flyttalsbrus. Den är mindre än ett piltangentsteg (0,02) och ungefär 3 px i bladets 640-bredd.
  *Varför:* PO-kortet frågar efter resultatet («ingen verklig ändring»), inte efter om någon knapp tryckts. Flytta och flytta tillbaka med piltangenter, Vrid ×4, Höjd upp och ner, Bredare yta och sedan Standardyta ger alla «ingen ändring». Det blir en ren funktion med tester i `stationLayout.test.ts`. Ingen flagga som varje handler måste komma ihåg att sätta (Slice 58 lade till fem knappar, nästa slice kanske fler).
  **Spara:** «Spara i banken» skickar `default_station_layout` bara när `draft.layout` inte längre är samma objekt som den sparade layouten (samma referens = fältet följer inte med). Ingen layout → fältet skickas inte, banken står kvar på `null`. Befintlig layout → kolumnen rörs inte, alltså byte för byte samma.
  **Kön:** efter «Klar» utan ändring och «Spara i banken» står övningen kvar i «Saknar skiss (n)», och n är oförändrat. Den lämnar kön först när en verklig ändring sparas.

  | Fall | «Klar» ger | Efter «Spara i banken» |
  |---|---|---|
  | Ingen layout, öppna, «Klar» | `undefined` | `null` kvar, automatisk skiss med mattor, kvar i kön |
  | Layout finns, öppna, «Klar» | samma objekt | kolumnen orörd |
  | Flytta ett redskap, «Klar» | ny layout | sparas, lämnar kön |
  | Flytta och flytta tillbaka (piltangent, Vrid ×4, Höjd upp och ner, Bredare och sedan Standardyta) | som startläget | som raderna ovan, beroende på om layout fanns |
  | Flytta och dra tillbaka med fingret | ny layout (sällan inom ±0,005) | sparas |
  | Ingen layout, «Ställ i rad igen», «Klar» | `undefined` | `null` kvar |
  | Layout finns, «Ställ i rad igen», «Klar» | `undefined` | `null` sparas (Slice 57), tillbaka i kön |
  | «Ställ i rad igen» och sedan en flytt | ny layout | sparas |
  | Layout med fel antal (läses som ingen layout), «Klar» | `undefined` | kolumnen orörd (gamla JSON kvar), kvar i kön |
  | Ändra redskap i formuläret utan layout | – | `null` kvar (C1, redan i dag) |
  | Ändra redskap med layout | – | `syncLayout`, sparas (C1, redan i dag) |
  | Stäng bladet (bakgrund) eller «Avbryt» i formuläret | – | ingenting ändras |

- G2 **Ändringsflagga.** Varje drag, piltangent, Vrid, Höjd och yta sätter `changed = true`. «Klar» utan flagga → `initialLayout`. Enklare att läsa, men flytta och flytta tillbaka räknas som ändring, och flaggan måste sättas i varje ny handler (ett exempel finns redan: «Standardyta» `:224–226` nollar inte `reset`). Kan inte testas utan React.
- *Båda:* ett tryck som utlöser `pointermove` flyttar redskapets mitt till fingret (`:63–66`), så det räknas som ändring med båda reglerna. Att bara välja ett redskap (fokus, markering) är ingen ändring.

### H. Var gäller regeln? (ny, rev)
- **H1 ★ Överallt där skissbladet öppnas:** Admin-kön, Admin «Ny egen övning», Biblioteket «Ändra i banken» och egen övning (`OwnActivityForm`). Det är samma blad, och regeln rättar ett beteende från Slice 57 som aldrig var beställt. **Det ändrar Slice 57-flödet** (låst A2 B1 C1 D1 E1 F1), så Christoffer behöver säga ja uttryckligen.
- H2 Bara när bladet öppnas från kön (`openLayout`). Då beter sig samma blad olika beroende på varifrån man kom, och Biblioteket fortsätter att spara rad-uppställningar av misstag. Avvisas.

**Utanför omfånget:** Scout månadssvep 2026-11 #1–#3 (Lättare/Svårare, Medan du väntar, Ny vecka svårare; Approved i backlog, egen slice), 3D-vy/WebGL/`three`, hall-CAD, nya redskap i `EQUIPMENT_PIECES`, ledare som redigerar layout, automatiska skisser, märket «skissen räcker» (skulle kräva kolumn och SQL), ändringar i Redigera redskap eller Hallöversikt.

## Effort: S

Ren funktion `needsLayout` + test, en sektion i `AdminArea`, en prop `openLayout` i `AdminBankForm`, två strängar, footer. G1: ren funktion `sameLayout` + test, ändring i «Klar» i `StationLayoutSheet`, och i `AdminBankForm` en rad som inte skickar en oförändrad layout. Ingen SQL, ingen cache-bump, ingen ny skrivväg. Effort fortfarande **S**.

**Bundle:** uppskattat **+0,25–0,45 kB gzip** totalt (förut +0,15–0,35). Huvudchunken får strängarna och footern (ca +60–100 B, `blockMeta.ts`) och G1 (`sameLayout` och «Klar», ca +80–120 B). `StationLayoutSheet` ligger i huvudchunken eftersom `OwnActivityForm` importeras direkt av `SessionBuilder`. Resten hamnar i den lata admin-chunken (`AdminArea`, `AdminBankForm`). Inget undantag väntas, men marginalen mot +512 B är mindre. Med F2: ca +0,3–0,5 kB.

## Risker
- ~~«Klar» utan ändring är inte neutralt.~~ **Löst genom G1.** (I dag på main: en rad utan layout får en rad-uppställning, och ansatsmattorna försvinner.)
- **Rader som redan har fått en rad-uppställning av misstag** (sedan Slice 57 är live) har en layout och hamnar därför inte i kön. G1 rättar inte dem i efterhand. Admin rättar en sådan rad med «Ställ i rad igen» → «Klar» → «Spara i banken», som sparar `null`. Se öppen fråga 10.
- **H1 ändrar Slice 57-flödet** överallt där skissbladet öppnas. Ledarens vy ändras inte. Slice 57/58-tester för `syncLayout`, `defaultLayoutFrom` och sanering ska vara gröna utan ändring.
- **Toleransen i G1:** ett medvetet drag kortare än ±0,005 (ca 3 px) sparas inte. Det är avsiktligt.
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
7. **Lås:** Effort S skulle enligt PROJECT.md kunna låsas av Planner, men kortet säger att du låser. ★ Svara ordagrant, t.ex. «Ja, lås A1 B1 C1 D1 E1 F1 G1 H1».
8. **Vad är en ändring (G):** jämföra med startläget (G1 ★) eller en flagga som sätts så fort man drar, vrider eller ändrar höjd eller yta (G2)? Med G1 räknas «flytta och flytta tillbaka» inte som ändring.
9. **Var gäller regeln (H):** överallt där skissbladet öppnas, även Biblioteket «Ändra i banken» och egen övning (H1 ★)? Det ändrar Slice 57-flödet, så svara uttryckligen. Alternativet är bara från kön (H2).
10. **Rader som redan fått en rad-uppställning av misstag:** ska kön även visa layouter som är exakt appens startrad? ★ Nej i denna slice (ändrar B1). Du rättar dem för hand med «Ställ i rad igen» när du hittar dem.
