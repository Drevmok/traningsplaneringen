# Slice 63 — Ny vecka, ett steg svårare

**App:** Träningsplaneraren
**Status:** **LÅST** 2026-11-16 av Christoffer (07:16, Europe/Stockholm), reläat av Träningsplaneraren - PO, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1». Se [`decisions.md`](decisions.md). Bas: main @ `2917296` (Slice 62 live, footer «Slice 62»; PO: alla 16 Teknik har progression-länkar live). Gren: `slice-63-docs`.
**Uppdrag:** Scout 2026-11 #3, Approved av Christoffer 2026-11-02 i `backlog/IMPROVEMENTS.md` via PR #66 (`3f0a729`). #1 är live som Slice 62 (PR #70). Christoffer valde #3 som Slice 63, reläat av PO 2026-11-16.
**Effort:** **S** (Scout, efter #1). En valfri kontroll. Återanvänder `harderOf` och `swapSessionActivity`. Ingen SQL.
**Källa:** `backlog/IMPROVEMENTS.md` (Approved, Scout outside sweep 2026-11 #3) och Scout-utkastet `/workspace/scout-drafts/2026-11-monthly-sweep.md`. Scout-formen: efter att Ny vecka kopierat passet, en valfri rad «Gör Teknik ett steg svårare» som applicerar Svårare på varje Teknik med svårare mål; rader utan länk orörda; kontrollen dold om ingen rad har länk.

**Tidigare A–F:** inga för den här ytan. Slice 62 låste bytet per rad (A1 B1 C1 D1 E1 F1). A–F nedan är nya.

## Varför

Ny vecka kopierar passet oförändrat. Vecka 2 kräver i dag att ledaren trycker «Svårare» på varje Teknik-rad. Pembee/Scout: återanvänd samma mall, byt bara stationens nivå.

**Vad ledaren får:** Efter «Skapa kopia», på kopian i Passbyggaren, en valfri rad «Gör Teknik ett steg svårare» när minst en Teknik-rad har ett svårare mål. Ett tryck byter de raderna ett steg. Minuter och hallmärke är kvar. Rader utan mål lämnas.

**Vad admin får:** Ingenting. Inga nya bankfält, ingen SQL. Länkarna finns redan (Slice 62).

## Kod i dag (main @ `2917296`, läst — ingenting byggt)

- Ny vecka: knappen `UI.newWeek` i `SessionBuilder.tsx` öppnar `NewWeekConfirm`. `handleNewWeek` anropar `startNewWeek` (`savedTemplates.ts:129–131`): arkiverar förra passet som mall om det är nytt, och returnerar `duplicateSession` (nya `session.id` och `item.id`, titel `Ny vecka — …`, hallmärken flyttade till de nya id:na). Utkastet ersätts av kopian. Ingen nivåändring. Det finns ingen separat resultatsida — resultatet är kopian i Passbyggaren.
- `harderOf` / `swapSessionActivity` i `lib/variantLinks.ts` (Slice 62): `harderOf` tar först `regressionOf`, annars första katalogen-träffen vars `progressionOf === activity.id`. Bytet behåller `item.id`, minuter, anteckning, ordning och `stationEquipment`. Chippen på Teknik-raden använder redan funktionerna. Inte i Kör passet.
- Scout/IMPROVEMENTS skrev «har en `progressionOf`-länk». Det är löst språk: en övning som bara har `progressionOf` är redan den svåra änden (t.ex. Formhopp). Den här slicen följer PO och återanvänder `harderOf` — alltså rader som *har ett svårare mål*.
- `replaceItemActivity` i `session.ts` nollar redskap. Används inte här.
- `SLICE_NUMBER = '62'` (`blockMeta.ts:97`). Ändring i `blockMeta.ts` gör att `pick-smokes` säger hela loopen.
- Ångra: Slice 41-mönstret i Passbyggaren (`armUndo` / toast `UI.undoAction` «Ångra»), en nivå; annan ändring avslutar.

## Scope (★)

- Valfri kontroll på Ny vecka-resultatet i Passbyggaren. Ett tryck applicerar ett steg via `harderOf` + `swapSessionActivity` på varje Teknik-rad med mål.
- Kontrollen dold när ingen rad skulle ändras.
- `SLICE_NUMBER = '63'`. Ingen SQL, inga nya länkar, ingen ändring i Kör passet, Hallöversikt, Redigera redskap, Planera pass, Skriv ut passet eller i själva Ny vecka-kopieringen (arkivet av förra veckan förblir ostegat).

## Ej scope

- Schema-SQL / bank-UPDATE (länkarna är live enligt PO).
- Automatiskt steg när kopian skapas, utan val.
- Kontroll eller nya chip i Kör passet.
- Att gå längs hela kedjan på ett tryck.
- Nya par, Admin-länkfält, `push-promote`.
- Ändrad `startNewWeek` så att kopian redan är stegad.

## A–F (★ = Docs förslag; **låst: A1 B1 C1 D1 E1 F1**, se `decisions.md`)

### A. Placering och text
- **A1 ★ — LÅST.** Efter «Skapa kopia», på kopian i Passbyggaren: en valfri rad/knapp `UI.stepTeknikHarder` «Gör Teknik ett steg svårare» (Scout-/IMPROVEMENTS-formuleringen, ändra inte). Visa den bara på den session Ny vecka just skapade, och bara om minst en Teknik-rad har `harderOf`-mål. Inget extra «Inte nu» — att inte trycka räcker. Dölj efter användning, och när passet ersätts (ny Ny vecka, Använd mall, Nytt pass). Efter Ångra (B1) visas raden igen på samma kopia. Finns kvar om ledaren bara tittar i Passbyggaren eller går till Hallöversikt och tillbaka. Inte i bekräftelserutan, inte i Kör passet, inte i utskrift. Återanvänd befintlig knapp- eller bannertyp; ny CSS bara om det inte går (`App.css` är kärnfil).
- A2 Kryssruta i `NewWeekConfirm`, applicerad när kopian skapas. Ett steg färre, men Scout sa «efter Ny vecka» / «på resultatet», och det blandar obligatorisk bekräftelse med valfri uppgradering. Dölj rutan när ingen rad skulle ändras. Inte ★.
- A3 Ingen egen kontroll — bara chippen från Slice 62. Det är inte det Approved-förslaget (många tryck). Avråds.

### B. Ångra
- **B1 ★ — LÅST.** En ångranivå, samma mönster som Slice 41: efter bytet en toast («Teknik är ett steg svårare.» · «Ångra») som lägger tillbaka kopian som den var före steget. Annan ändring (även ett enskilt «Lättare»/«Svårare») avslutar. Förra veckans mall och Ny vecka-kopieringen rörs inte.
- B2 Ingen egen ångra; ledaren trycker «Lättare» per rad. Billigare, men en massåtgärd utan ångra är hård. Inte ★.
- B3 En andra kontroll «ett steg lättare» på samma resultat. Utanför scope, budgetrisk.

### C. Kör passet
- **C1 ★** Kör passet orört. Ingen ny kontroll, inga nya chip. Efter bytet (eller om ledaren hoppar över) visar Kör de titlar som ligger i passet. Samma linje som Slice 62 (chippen inte i Kör).
- C2 Samma kontroll även i Kör om de öppnar Kör innan de använt den. Budget, och Kör är inte resultytan. Avråds.
- C3 Auto-applicera när Kör startas från ett Ny vecka-pass. Inte valfritt. Avråds.

### D. Vilka rader och vilka regler
- **D1 ★** Bara poster i Teknik-blocket där `harderOf(activity, getById)` ger ett mål (bank, seed eller egen övning med länk). Ett steg per tryck, inte till kedjans slut. Återanvänd `swapSessionActivity`: behåll `item.id`, minuter, anteckning, ordning och `stationEquipment` (osatt följer den nya övningens förslag; ifylld eller uttryckligt tömd lista lämnas). Hallmärket sitter kvar. Andra block, Bro och redan svåraste led (t.ex. Formhopp, Hjul, Salto från höjd) orörda. Kontrollen dold om noll rader skulle ändras. Använd inte `replaceItemActivity` (den nollar redskap).
- D2 Ändra minuter, eller hoppa till slutet av kedjan. Avråds — Scout är ett steg och samma minuter.
- D3 Även uppvärmning, styrka eller lek om de skulle ha länkar. Utanför scope.

### E. Bundle och footer
- **E1 ★** Inom +512 B gzip, inget undantag. Uppskattning **+0,12–0,30 kB** (hjälpfunktion intill `variantLinks.ts` + en rad + 2–3 UI-strängar + footer). `SLICE_NUMBER = '63'`. Lägg inte hjälpfunktionen i `session.ts`. `blockMeta.ts` är oundviklig (footer + text) och gör att `pick-smokes` säger hela loopen. Går bygget över: korta toasten, inte ta bort kontrollen, och rapportera — inget undantag utan Christoffers ja.
- E2 Lämna `SLICE_NUMBER` på 62. Avråds.
- E3 Ta även med andra Scout-rester eller Admin-länkfält. Utanför den här slicen.

### F. Tester
- **F1 ★** Enhetstester för hjälpfunktionen: Minihjul → Hjul och Grenhopp → Formhopp i samma pass, Bro orörd; `item.id`, minuter, anteckning, redskap och hallmärke kvar; redan svåraste orörd; noll mål → oförändrad session; ett anrop går inte längs hela kedjan (Ljushopp i rockringar → satsbräda, inte trampett). Befintliga `weekCopy`-tester gröna: Ny vecka själv stegar inte, och arkivet är förra passet ostegat. `pick-smokes 2917296 <head>` styr — troligen hela loopen p.g.a. `blockMeta.ts`. Mot baslinjen: SAMMA förutom footer 62→63 och att kontrollen syns efter Ny vecka när länkade rader finns.
- F2 Ny egen smoke. Onödigt; befintliga Ny vecka- och Passbyggar-smokes räcker, plus checklistan.
- F3 Bara den manuella checklistan, inga nya enhetstester. Avråds.

## Öppna frågor — besvarade vid lås

Se `decisions.md`. Kort:

1. **Placering:** A1 — rad på kopian i Passbyggaren, efter «Skapa kopia».
2. **Ångra:** B1 — toast med Ångra.
