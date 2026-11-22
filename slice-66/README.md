# Slice 66 — Putsa Bygg hallen

**App:** Träningsplaneraren
**Status:** **FÖRESLAGEN**. Bas: main @ `d347892` (Slice 65 live, PR #73, footer «Slice 65»). Gren: `slice-66-docs`.
**Uppdrag:** De två Low-fynden från QM i Slice 65 (rapport `/workspace/s65-verify/verifier/slice-65-verify-report.md`, 21 nov). Approved av Christoffer 2026-11-22 11:45 via PO. S4–S9 ingår inte.
**Effort:** **S**. Ingen SQL. Inte en andra halleditor, inte hall-CAD, ett märke per station.
**Källa:** QM-rapporten (anmärkning A låg/medel, B låg). Inget AC i Slice 65 bröts; det här är puts.

## Varför

I liggande 844×390 ligger stegpanelen i «Bygg hallen» under kartan och syns först efter scroll (kartan själv rinner ur vyn). På papperet skrivs oplacerade Teknik som «☐ Titel» utan «Saknar plats», som redan står i stegläget. En ny ledare som bara tar upp telefonen kort, eller som bär utskriften i hallen, ska se steget och förstå vilka stationer som saknar plats.

## Kod i dag (main @ `d347892`, läst — ingenting byggt)

- Panelen är `<section class="hall-station-list">` *efter* `HallCanvas` och `.hall-schematic-note` i `.hall-layout--floor`. Den klassen sätter `grid-template-columns: 1fr`, så den vanliga tvåkolumns-`.hall-layout` är avstängd. Kartan har `aspect-ratio: 16 / 10`. QM 844×390: karta `top=158,6` / `bottom=602,5` (vh=390), panel `top=673,2`, `inView=false`. På 390×844 ryms karta och panel; bara «Avsluta Bygg hallen» kan kräva en liten extra rullning.
- `App.css` lämnades orörd i Slice 65 (återanvänd liststil). Ingen liggande-regel för stegläget. Slice 48 använder redan `max-height: 500px` för liggande modaler — samma brytpunkt täcker 844×390.
- `PassPrint` (sektion `.pass-sheet-build`): `☐ {rank}. {titel}` eller utan rank `☐ {titel}`. `UI.buildHallUnplaced` «Saknar plats» finns och används i stegläget, inte i utskriften. Tidslinjen utelämnar också etiketten för oplacerade — utanför den här slicen.
- `hallSetupSteps`, märkesmarkering (`.is-selected`) och avbockning i minnet lämnas som de är.
- Bundle mäts med `verifier/tools/build-dists.sh`: `gzip -9` på `assets` js+css, raden `TOTAL`, mot main. Slice 65: 221150 → **221661 = +511 B** av taket +512 (1 B marginal). `SLICE_NUMBER = '65'`.
- `UI.buildHallPrev` fanns i 65-packen; koden återanvänder `UI.runPrev` (godtaget av QM).

## Scope (★)

- Liggande 844×390: stegpanelen synlig utan sidrullning (eller med tydligt minimum, se B).
- Utskriftens Bygg hallen-sektion märker oplacerade med befintlig «Saknar plats».
- `SLICE_NUMBER = '66'`. Ingen SQL. Inte S4–S9.

## Ej scope

- S4–S9, hall-CAD, extra märken, typikon på redskapsraden, uppdelad Förrådslista, Kör passet, tidslinjen i `PassPrint`, ny hjälpfunktion, ny utskriftsväg, ny SQL.

## A–F (★ = Docs förslag; låses av Christoffer)

### A. Liggande layout
- **A1 ★** Bara CSS vid kort liggande höjd (samma brytpunkt som Slice 48: `orientation: landscape` och `max-height: 500px`, täcker 844×390). När stegläget är öppet (`.hall-layout--floor:has(.hall-station-list)`) två kolumner: karta till vänster, panel till höger. Begränsa kartans höjd så att aktuellt märke och panelen delar vyn. Ingen ny vy, inget extra märke. Stående 390×844: ingen försämring. Sidolayout bara medan guiden är öppen; vanlig Golvklart förblir fullbredd.
- A2 Panel ovanpå kartan. Riskerar att skymma märket. Avråds som förstaval.
- A3 Ny komponent, JS-layout eller egen skärm. För stort för budgeten. Avråds.

### B. Tydligt minimum (liggande)
- **B1 ★** Utan att rulla *sidan* syns (1) kartan med aktuellt märke (inte nödvändigtvis hela hallen) och (2) stegets titel, «Station n av N» eller «Saknar plats», Byggd samt Föregående / Nästa / Avsluta Bygg hallen. Skissen får krympas (`max-height`) eller rullas *inne i panelen*. Inget täcker Avsluta. Stående: minst lika bra som på main.
- B2 Hela hallen och fullstor skiss utan någon rullning. För trångt på 390 px höjd. Avråds.
- B3 Bara panelen i vyn, kartan får ligga utanför. Motverkar märkesmarkeringen. Avråds.

### C. Utskrift, oplacerade
- **C1 ★** Bara i sektionen «Bygg hallen»: oplacerad rad blir `☐ {titel} — Saknar plats` (`UI.buildHallUnplaced`, ingen ny sträng, inget påhittat nummer). Placerade rader oförändrade (`☐ n. {titel}`). Samma från Dela och från Golvklart. Tidslinje, hallkarta och Förrådslista orörda.
- C2 Ny formulering eller nummer i stil med «–» / «0». Avråds.
- C3 Märk även tidslinjen. Utanför omfånget. Avråds.

### D. Omfång
- **D1 ★** Bara de två fynden. `hallSetupSteps`-ordningen, ett märke per station, Golvklart som gruppvy och övriga ytor orörda.
- D2 Bredare omarbetning av Bygg hallen. Avråds.
- D3 Bara ett av fynden. Avråds.

### E. Bundle och footer
- **E1 ★** Inom +512 B gzip mot main `d347892`, samma mätning som i dag (`build-dists.sh`, `gzip -9`, js+css TOTAL). `SLICE_NUMBER = '66'`. Banta minst lika mycket som slicen lägger till. Uppskattad tillägg *före* bantning **+0,10–0,25 kB** gzip (kort media query + befintlig `UI.buildHallUnplaced` i `PassPrint`; footer 65→66 samma längd). Betala med död CSS och oanvända strängar, se nedan. Förväntat netto **+0–0,15 kB**. Går det ändå över: korta den *nya* CSS:en, inte ta bort ett fynd, och rapportera — inget undantag utan Christoffers ja.
- E2 Höj det stående +512 B-taket. Kräver Christoffers uttryckliga ja. Inte förstaval.
- E3 Undantag bara för Slice 66 (får gå över, taket kvar). Kräver också hans ja. Avråds om E1 räcker.

**Bantningskandidater** (syns inte i UI i dag; rör inte låst visad mikrotext):

| Vad | Var | Rå storlek | Kommentar |
|---|---|---|---|
| `.hall-drop-hint`, `.hall-drop-hint p`, `.hall-coach-tip`, `.hall-coach-tip--tray` | `App.css` | ~421 B | Ingen TSX-markup |
| `hallDropHint`, `hallDropHintStations`, `hallAllPlaced`, `hallFloorReadyShort`, `hallFloorEquipmentCount` | `blockMeta.ts` | ~260 B | Inga träffar i `app/src` utanför nyckeln |

Valfritt därefter: `hallCoachTip` / `hallFloorCoachTip` / `hallTileHintShort` bara om de är oanvända dubbletter av fortfarande visade `tip*`-strängar — inte unika låsta tipstexter. Rör inte `hallFloorCoachTip` lättvindigt: den bär låst Golvklart-text.

### F. Tester
- **F1 ★** Enhetstest: Bygg hallen-sektionen i `PassPrint` skriver «Saknar plats» för oplacerade, utan påhittat nummer; placerade rader oförändrade. Befintliga `hallSetupSteps`- och `PassPrint`-tester gröna. `pick-smokes d347892 <head>` styr — troligen hela loopen (`App.css` + `blockMeta.ts`). Mot baslinjen: SAMMA förutom footer 65→66, panelen i vyn på 844×390 och utskriftsetiketten. En mening var i `golvklart-forrad.md` och `liggande-844x390.md`. `SLICE66-SHIPPED.md`.
- F2 Ny egen smoke. Onödigt.
- F3 Bara checklistan, inget utskriftstest. Avråds.

Låssträng, om ★ antas: «Ja, lås A1 B1 C1 D1 E1 F1».
