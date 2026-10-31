# Slice 56 — Redskap-förslag även vid «Lägg till» Teknik

**App:** Träningsplaneraren  
**Status:** **LÅST** 2026-10-31 av Christoffer: «Ja, lås A1 B1 C1 D1 E1 F1». Se [`decisions.md`](decisions.md). Öppen fråga 3 → alla stationer (★), 4 → egen senare slice. Bas: main @ `6a75ec1` (Slice 55 mergad, sidfot Slice 55). Gren: `slice-56-docs`.  
**Effort:** **S**  
**Källa:** Scout 2026-10-30 idé 2 (`/workspace/scout-drafts/2026-10-30-ideas.md`). Bilder: `/workspace/screenshots/scout-2026-10-30/` — främst `35-hall-4stations.png` («1 station saknar redskap» efter manuellt tillagd Kullerbytta), även `33-after-add.png`, `34-hall-after-add.png`, `36-forrad-after-manual-add.png`.

## Varför

Efter Planera pass har varje Teknik-station redan redskap, och Förrådslista är ifylld (Slice 49 C1). Lägger du sedan till en Teknik-övning själv från Biblioteket får den nya stationen inga redskap. Hallöversikt visar igen «1 station saknar redskap» och knappen Använd alla förslag, och Förrådslista saknar den nya stationens redskap (`35-hall-4stations.png`, `36-forrad-after-manual-add.png`).

**Vad tränaren får:** «Jag lägger till en station, och redskapen kommer med, precis som när jag planerade passet.»

## Förhållande till Slice 49

Slice 49 låste C1: förslagen fylls i automatiskt **bara efter Planera pass** (inte mall, inte Lägg till; C2 valdes bort). Slice 56 **utökar** C1 till Lägg till i Teknik. Planera pass ändras inte, och C1 för Planera pass står kvar.

## Kod i dag (main @ `6a75ec1`, läst — ingenting byggt)

- `app/src/lib/wizard.ts:148` — `composeWizardSession`: `applyAllSuggestedStationEquipment(autoPlaceUnplaced(session)).session` (Slice 49 C1).
- `app/src/lib/session.ts:278–290` — `applyAllSuggestedStationEquipment(session)` → `{ session, appliedCount }`. Bygger på `eligibleSuggestedStationEquipmentItems` (`session.ts:242`): bara placerade Teknik-stationer där `stationEquipment` är `undefined` och övningen har `defaultStationEquipment`. Sparade listor och rensade `[]` rörs inte.
- `app/src/components/SessionBuilder.tsx:256–286` — `handleAddFromDetail`: `addItemToBlock` (rad 265) + `autoPlaceItems` (rad 276) → `onChange`. **Ingen** redskapsifyllning. Målblocket är `selectedBlock` (`dest`), oavsett övningens egen blocktyp.
- `app/src/components/HallBoard.tsx:279–288` — `handleAddStation` (Hallöversikt «Lägg till station»): `addItemToBlock` (rad 284) + `autoPlaceUnplaced` (rad 285) → `persist`. **Ingen** redskapsifyllning. Lägger alltid i Teknik (`teknikBlockId`, rad 238–240, `type === 'techniques'`).
- `HallBoard.tsx:51` importerar redan helpern; `handleApplyAllSuggested` (rad 420–425) är knappen Använd alla förslag.
- `app/src/data/blockMeta.ts:97` — `SLICE_NUMBER = '55'`.

## A–F (★ = förslag)

### A. Var fylls förslagen i vid tillägg?
- **A1 ★** Båda vägarna som redan placerar Teknik automatiskt: (1) Passbyggaren → Biblioteket → Lägg till i Teknik-blocket (`handleAddFromDetail`), (2) Hallöversikt → «Lägg till station» (`handleAddStation`). Efter `autoPlace*` körs `applyAllSuggestedStationEquipment` på hela passet. Samma helper; den hoppar över sparade och rensade listor.
- A2 Bara Passbyggaren → Biblioteket.
- A3 Bara Hallöversikt «Lägg till station».

### B. Vilka block?
- **B1 ★** Bara när tillägget landar i Teknik. Redskap hör till stationer, och stationer finns bara i Teknik. Andra block rörs inte.
- B2 Alla blocktyper. Onödigt: förslag finns bara för Teknik-stationer.

### C. Återkoppling
- **C1 ★** Tyst, ingen toast (Scout). Saknar-raden och Förrådslista uppdateras som efter Planera pass.
- C2 Kort toast «Redskap tillagda» (ny text, undvik om möjligt).

### D. Tränare som vill börja utan redskap
- **D1 ★** Samma regler som helpern har i dag: en rensad lista `[]` och redan sparade listor rörs inte; nya stationer utan redskap får förslaget. Den som vill ha tomt rensar med Redigera redskap.
- D2 Aldrig automatiskt vid Lägg till, bara knappen. Det är dagens läge, inte en slice.

### E. Starta från mall och Planera pass
- **E1 ★** Planera pass oförändrat (Slice 49 C1 kvar). Starta från mall oförändrat: mallstarten fyller fortfarande inte redskap själv. Det är en egen fråga, inte den här slicen.
- E2 Även mallstart (växer omfånget).

### F. Omfång och budget
- **F1 ★** A1 B1 C1 D1 E1. Sidfot **Slice 56**. Inga nya UI-texter. Mjuk budget +512 B gz; uppskattning **+20–80 B gz** (två anrop och SLICE_NUMBER). Feature map och tester.
- F2 Bara A2.

## Att veta om ★-vägen (A1 + E1)

Helpern arbetar på hela passet. Startar du från mall (stationer utan redskap) och sedan lägger till en Teknik-övning, får **alla** mallens stationer förslag samtidigt, inte bara den nya. Det är samma sak som ett tryck på Använd alla förslag. Starta från mall i sig är oförändrat (E1), men första tillägget efteråt fyller hela Förrådslista. Se öppen fråga 3. Vill Christoffer bara fylla den nya stationen behövs en liten variant (helpern begränsad till de nya id:na), fortfarande S.

## Effort

**S.** Återanvänd helpern, två anropsställen, tester, feature map. Ingen SQL, ingen ny skärm, inga nya texter.

## Utanför omfånget

- Ändra Planera pass eller redskap vid mallstart (E1).
- Nya redskapsförslag i banken.
- Toast (C1).
- Större omläggningar av gränssnittet.

## Öppna frågor (till Christoffer via PO)

1. A: båda tilläggsvägarna (A1) eller bara Biblioteket (A2)?
2. C: bekräfta tyst (C1), eller vill du ha en toast?
3. Efter Starta från mall: ska första tillägget fylla alla stationer (★, samma som Använd alla förslag) eller bara den nya?
4. (Valfritt) Ska mallstart få samma automatik senare, som egen slice?
