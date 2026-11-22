# Slice 66 — HANDOFF till Builder (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

**Status:** **FÖRESLAGEN**. Builder bygger när PO skickat byggkortet efter lås (Docs pingar inte Bob). Bas main @ `d347892`, docs-gren `slice-66-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen.
**Bundle:** inom +512 B gzip mot `d347892` (`verifier/tools/build-dists.sh`, `gzip -9`, js+css TOTAL). Slice 65 slutade på +511/512. Banta minst lika mycket som slicen lägger till (E1). Går det över: korta ny CSS, inte ta bort ett fynd, rapportera — inget undantag utan Christoffers ja.
**Egen worktree från `d347892`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är. Städa den inte, och kör inte Doctor eller smokes därifrån.
Ett märke per station. Golvklart förblir visningen för gruppen. Rör inte S4–S9, hall-CAD, Kör passet, tidslinjen i `PassPrint` eller `hallSetupSteps`.

## 1. Liggande panel (A1, B1)

I `App.css`, vid `orientation: landscape` och `max-height: 500px` (samma brytpunkt som Slice 48), när stegläget är öppet:

```css
@media (orientation: landscape) and (max-height: 500px) {
  .hall-layout--floor:has(.hall-station-list) { /* två kolumner, karta | panel */ }
}
```

`:has()` räcker — ingen ny klass krävs. Begränsa kartans höjd så att aktuellt märke ryms. Skissen i panelen får `max-height` eller inre scroll. Sidolayout bara medan guiden är öppen. Stående 390×844 får inte bli sämre. Ingen ny duk, inget extra märke, `selectedItemId` orörd.

## 2. Utskrift (C1)

I `PassPrint`, sektionen `.pass-sheet-build`: när `step.rank` saknas, skriv `☐ {titel} — Saknar plats` med `UI.buildHallUnplaced`. Ingen ny `UI.`-nyckel. Placerade rader oförändrade. Inte tidslinjen. CSS i `export.css` bara om etiketten behöver en diskret markering; annars orörd.

## 3. Footer och bantning (E1)

- `SLICE_NUMBER = '66'`.
- Ta bort död CSS `.hall-drop-hint` / `.hall-drop-hint p` / `.hall-coach-tip` / `.hall-coach-tip--tray` (~421 B rå, ingen TSX-markup).
- Ta bort oanvända, icke visade nycklar `hallDropHint`, `hallDropHintStations`, `hallAllPlaced`, `hallFloorReadyShort`, `hallFloorEquipmentCount` (~260 B rå). Rör inte låst visad mikrotext (`Golvklart`, `hallFloorCoachTip` o.d.) utan att först bekräfta att de bara är dubbletter.
- Rapportera exakta gzip-byte mot `d347892` och vad som bantades.

## 4. Tester (`bun test src`)

- `PassPrint`: oplacerad Teknik i Bygg hallen-sektionen innehåller «Saknar plats» och saknar nummer; placerad rad oförändrad (`☐ n. {titel}`).
- Befintliga tester gröna. Ingen ny hjälp att enhetstesta.

## 5. Feature map, docs, smokes

- `verify-traningsplaneraren/features/golvklart-forrad.md` och `liggande-844x390.md`: en mening var (panel bredvid kartan i liggande kort höjd; «Saknar plats» på papperet).
- `verifier/smoke-map.json`: ingen ny smoke. `pick-smokes d347892 <head>` styr. Förväntat: **hela loopen** (`App.css` + `blockMeta.ts`). SAMMA förutom footer 65→66, liggande panel i vyn och utskriftsetiketten.
- `SLICE66-SHIPPED.md`: urval (A–F), bantning, bundle-byte mot main, att ingen SQL körts, head-SHA.

## 6. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz mot main @ `d347892` i PR; gå inte över +512 B (E1).
- Gren `slice-66-code` från `d347892`, PR mot main med `SLICE66-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
