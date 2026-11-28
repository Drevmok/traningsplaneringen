# Slice 69 — HANDOFF till Builder (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

**Status:** **FÖRESLAGEN**. Builder bygger när PO skickat byggkortet efter lås (Docs pingar inte Bob). Bas main @ `83965f7`, docs-gren `slice-69-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen.
**Bundle:** inom +512 B gzip mot `83965f7` (`verifier/tools/build-dists.sh`, `gzip -9`, js+css TOTAL). Uppskattning före bantning +0,20–0,45 kB. Går det över: korta CSS och ev. ny aria först, inte ta bort kartan eller markeringen, och rapportera — inget undantag utan Christoffers ja.
**Egen worktree från `83965f7`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är. Städa den inte, och kör inte Doctor eller smokes därifrån.
Inte S5, S7, S8. Inte hall-CAD. Inte den parkerade redskapsraden i Kör passet. Inte en ny editor.

## 1. Hjälp (C1)

I `app/src/lib/runPass.ts`, bredvid `runStationSketch`, t.ex. `runHallMini(session, itemId)`:

- `show`: `true` bara när `getPlacedItems(session).length > 0` och aktuellt item är Teknik (`isPlaceableItem`).
- `selectedItemId`: item-id om `getPlacement` finns, annars `null`.
- `unplaced`: Teknik utan placering. Synlig «Saknar plats» bara när `show && !selectedItemId` (alltså när andra stationer står i hallen).

Återanvänd `getPlacedItems`, `getPlacement`, `isPlaceableItem` från `lib/hall.ts`. Använd inte `hallSetupSteps`.

## 2. Yta (A1, B1, D1, E1)

- `RunPass.tsx`: när `show`, bädda in `HallCanvas` med `hallMode="floor"`, `viewZoom={1}`, `placeModeItemId={null}`, `selectedItemId` från hjälpen, och tomma `onPlaceAt` / `onChipClick` / `onRemovePlacement` (samma mönster som `PassPrint`). Ingen `onViewZoomChange`. Montera inte `HallBoard`.
- Placering: första barnet i `.run-script`, skissen (`StationSketch`) därefter oförändrad.
- CSS i `export.css` under t.ex. `.run-script .run-hall-mini` (`export.css` laddas efter `App.css`):
  - `min-height: 0` på `.hall-canvas` (basklassen har `280px`).
  - `max-height: 16svh`, `max-width: 100%`, behåll hallens aspect-ratio (contain).
  - `.hall-canvas-wrap { overflow: hidden }` — minin får inte bli en andra rullyta.
  - `pointer-events: none` på hela minin (E1; `HallCanvas` sätter annars nyplyssnare).
  - Dölj `.hall-chip-equipment` i minin.
- D1: lämna övriga placerade märken och ev. flödesstreck. Aktiv = `is-selected`. Inget nytt stift.
- Mikrotext: `slice-69/content/microcopy.sv.md`. Återanvänd `UI.buildHallUnplaced`. En kort aria räcker.

## 3. Footer och bantning (F1)

- `SLICE_NUMBER = '69'` i `blockMeta.ts`. `feedback.test.ts`: `'68'` → `'69'`.
- Rapportera exakta gzip-byte mot `83965f7` och vad som bantades.

## 4. Tester (`bun test src`)

- `runPass.test.ts` (F1): placerad Teknik → `show`, `selectedItemId` satt; oplacerad Teknik med andra märken → `show`, `selectedItemId` null, `unplaced`; inga placeringar → inte `show`; uppvärmning trots placeringar → inte `show`. Befintliga `runSteps`- och `runStationSketch`-tester gröna.
- Ingen ny egen smoke (F1). `pick-smokes 83965f7 <head>` styr — troligen hela loopen p.g.a. `blockMeta.ts`.
- Feature-karta: en mening i `verify-traningsplaneraren/features/` som täcker minikartan i Kör passet (klocka/nav, bara `.run-script` rullar, ingen karta utan placeringar).
- `SLICE69-SHIPPED.md`: urval (A–F), bantning, bundle-byte, head-SHA.

## 5. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz mot main @ `83965f7` i PR; gå inte över +512 B (F1).
- Gren `slice-69-code` från `83965f7`, PR mot main med `SLICE69-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.

## Filer som rörs (förväntat)

- `app/src/lib/runPass.ts`, `app/src/lib/runPass.test.ts`
- `app/src/components/RunPass.tsx`
- `app/src/export.css`
- `app/src/data/blockMeta.ts`, `app/src/lib/feedback.test.ts`
- ev. en mening i `verify-traningsplaneraren/features/`
- `SLICE69-SHIPPED.md`

Rör inte `HallBoard.tsx`, `hallSetup.ts`, `PassPrint.tsx` eller `app/` utanför listan.
