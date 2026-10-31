# Slice 56 — HANDOFF (LÅST)

**Status:** **LÅST** 2026-10-31 («Ja, lås A1 B1 C1 D1 E1 F1», se `decisions.md`) — Builder får bygga. Ingen merge utan Christoffers OK. Radnummer från `6a75ec1`; sök om dem på din tip. ★-vägen: A1 B1 C1 D1 E1 F1.

## 1. A1 + B1 — Passbyggaren → Biblioteket → Lägg till
- `components/SessionBuilder.tsx` `handleAddFromDetail` (256–286), rad 276:
  ```ts
  const placed = autoPlaceItems(addedSession, added)
  const next = dest.type === 'techniques'
    ? applyAllSuggestedStationEquipment(placed).session
    : placed
  ```
- Importera `applyAllSuggestedStationEquipment` från `lib/session`.
- Gäller också när övningens egen blocktyp skiljer sig från `dest` (mismatch-raden): det som avgör är att den hamnar i Teknik.

## 2. A1 — Hallöversikt «Lägg till station»
- `components/HallBoard.tsx` `handleAddStation` (279–288), rad 285:
  ```ts
  const next = applyAllSuggestedStationEquipment(autoPlaceUnplaced(added)).session
  ```
- Importen finns redan (rad 51). `fresh`/`setStationFocusId` oförändrat.

## 3. C1 + D1 + E1 — rör inte
- Ingen toast, ingen ny text. Ändra inte helpern i `lib/session.ts:278`.
- `lib/wizard.ts:148` och `lib/mallApply.ts` oförändrade.
- Öppen fråga 3 låst på ★: kör hela helpern `applyAllSuggestedStationEquipment` på hela passet. **Inte** `onlyIds`, ingen ny parameter. Efter Starta från mall fyller första tillägget alla stationer utan redskap.

## 4. SLICE_NUMBER '55' → '56'
- `data/blockMeta.ts:97`.
- Tester som läser sidfoten: sök `Slice 55` (t.ex. `lib/feedback.test.ts`, `lib/clubTemplates.test.ts`).

## 5. Tester (`bun test src`)
Logiken sitter i komponenterna; testa kedjan i en ren testfil (t.ex. `lib/addTeknikEquipment.test.ts`) eller bryt ut en liten ren funktion om det blir enklare:
- Pass från `composeWizardSession` + `addItemToBlock` Kullerbytta framåt i Teknik + `autoPlaceItems` + helper → nya stationen har `defaultStationEquipment`; `placedTeknikMissingSavedEquipment` tom.
- Station med rensad `[]` före tillägg → fortfarande `[]` efter.
- Station med sparad egen lista → oförändrad.
- Tillägg i Uppvärmning (ej Teknik) → inga `stationEquipment` ändras.
- Övning utan `defaultStationEquipment` → ingen ändring, ingen krasch.
- Befintliga Slice 49-test för `composeWizardSession` gröna utan ändring.

## 6. Levande docs och feature map
- `docs/anvand-alla-forslag.sv.md`, `docs/saknar-redskap-banner.sv.md`, `docs/forradslista.sv.md`, `docs/home-wizard.sv.md`: att förslag nu också fylls i vid Lägg till i Teknik (inte bara Planera pass).
- `verify-traningsplaneraren/features/hall-redigera-redskap.md`, `passbyggaren.md`, `golvklart-forrad.md`: Lägg till Teknik → ingen saknar-rad; rensad lista står kvar.
- `docs/README.md`: rad för Slice 56.

## 7. Budget
- `npm run build`, `npm run lint`, `bun test src` gröna. Rapportera bundle gz mot main i PR (mål ≤ +512 B, väntat +20–80 B).
- Rör inte `slice-56/` utom vid lås (då skriver Docs `decisions.md`).
