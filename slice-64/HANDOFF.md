# Slice 64 — HANDOFF till Builder (LÅST: A1 B1 C1 D1 E1 F1)

**Status:** **LÅST** 2026-11-17 (`decisions.md`). Builder bygger när PO skickat byggkortet (Docs pingar inte Bob). Bas main @ `937829c`, docs-gren `slice-64-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen. Ingen schema-SQL, ingen data-UPDATE, ingen `push-promote`. Agenter kör aldrig SQL mot riktiga projektet.
**Bundle:** inom +512 B gzip (uppskattat +0,20–0,45 kB) — **inget undantag**; rapportera exakta byte mot main i PR. Går det över: korta CSS/maxhöjd, inte ta bort skiss eller ikon, och rapportera.
**Egen worktree från `937829c`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är (oincheckade borttagningar av `tools/bank/out/*`). Städa den inte, och kör inte Doctor eller smokes därifrån.
Rör inte Redigera redskap, Admin-kön «Saknar skiss», Planera pass, `EQUIPMENT_PIECES`, Ny vecka, eller den parkerade textraden i Kör passet. Hallöversikt i redigeringsläge ska se ut som i dag (redskapsblocket förblir dolt). `PassPrint`-kortets `StationSketch` lämnas. Inte S3–S8.

## 1. Hjälpfunktion (A1, C1, F1)

I `app/src/lib/runPass.ts` (håll filen liten; lägg **inte** hjälpen i `session.ts`):

```ts
export function runStationSketch(
  session: Session,
  itemId: string,
): { slots: StationEquipmentSlot[]; layout?: StationLayout } | undefined
```

- Uppslag av posten i passet. Bara om den är Teknik / `placeableItems` (samma urval som `stationCards`).
- `slots = item.stationEquipment ?? activity?.defaultStationEquipment`. Saknas aktivitet, slots eller slots är tom → `undefined`.
- `layout = layoutForStation(activity, item.stationEquipment)` — oförändrad regel (osatt eller samma som förslaget → ev. `defaultStationLayout`; egen avvikande lista → ingen admin-layout).
- Använd inte `stationCards()` som lista över Kör-steg (`runSteps` omfattar alla block).

## 2. Skiss i Kör passet (A1, C1)

- I `RunPass.tsx`: för aktuellt `step.itemId`, om `runStationSketch(session, step.itemId)` ger något, rendera `StationSketch` som **första barn i `.run-script`**, före Varför. `slots` och `layout` rakt in (layout kan vara `undefined` → auto-rad, A1).
- Återanvänd `StationSketch` oförändrad. Ingen ny bildtext — `UI.stationSketchCaption` / `UI.stationSketchApproach` räcker.
- CSS i `export.css` (där `.run-pass` redan ligger), inte i `App.css` för Kör. Begränsa figurens höjd så att `.run-nav` fortfarande når skärmens botten på 390×844, och så att bara `.run-script` rullar (Slice 38). Skissen behåller sin ljusa yta mot Körs mörka bakgrund; rita inte om redskapsstrecken.
- Inte på Samling, styrka eller lek. Inte en ny yta utanför Kör.

## 3. Ikoner på Golvklart / utskrift (B1, D1)

- I `HallChip`, på befintliga `equipmentLines` (samma villkor som i dag: canvas + satt `item.stationEquipment`): en `VisualIcon` per rad, `iconId={equipmentIconId(piece.visualKey)}`, `neutral`, ny kompakt `VisualIconSize` (t.ex. `gear`, ca 12–14 px ritning) i `icons/types.ts`. CSS intill `.hall-chip-equipment` i `App.css` tar bort kakelramen, samma grepp som `.hall-chip-icon`. Texten `line.text` stannar.
- Ändra inte visningsregeln: blocket förblir `display: none` i redigeringsläget, `display: flex` på `.hall-canvas.is-floor` och i `@media print`. Brickraden (`variant="tray"`) orörd.
- Ingen separat implementation i `PassPrint` — utskriftens hallkarta går redan via `HallCanvas hallMode="floor"`. Stationskortets skiss i `PassPrint` orörd.
- Rör inte Redigera redskap / `StationComposeSheet`.

## 4. Text och footer (E1)

- `data/blockMeta.ts`: `SLICE_NUMBER = '64'`. Inga nya `UI.`-nycklar (se `content/microcopy.sv.md`).
- Ingen seed- eller bankändring. Ingen SQL-fil i den här packen.

## 5. Tester (`bun test src`)

Utöka `lib/runPass.test.ts` (eller motsvarande intill `stationLayout.test.ts`):

- Teknik med `defaultStationEquipment`, osatt `stationEquipment`, seed utan layout → slots ifyllda, `layout` undefined.
- Teknik med `defaultStationLayout` och osatt (eller identisk) lista → `layout` är den sparade.
- Teknik med egen lista som skiljer sig från förslaget → slots är den egna listan, `layout` undefined.
- Post i uppvärmning / tom lista / okänt id → `undefined`.
- Befintliga `runPass`-tester (klocka, Nästa, Kvar, Slice 61 waiting) och `stationLayout`-tester gröna.

## 6. Feature map, docs, smokes

- `verify-traningsplaneraren/features/kor-passet.md`: en kort not att Teknik-steg med redskap visar `StationSketch` först i `.run-script`; auto-rad när layout saknas; dold annars; klocka/Nästa/Kvar/nav orörda.
- `verify-traningsplaneraren/features/golvklart-forrad.md`: en kort not att redskapsraden under märket på Golvklart och utskrift även visar typikon (ikon + text); inte i redigeringsläget.
- Ingen ny `docs/*.sv.md` krävs. En mening i `docs/dela-och-utskrift.sv.md` eller `docs/golvklart-redskap.sv.md` räcker om de redan beskriver raden under märket.
- `verifier/smoke-map.json`: ingen ny smoke. `pick-smokes 937829c <head>` styr. Förväntat: **hela loopen** eftersom `blockMeta.ts` och `App.css` är kärnfiler. Jämför mot main-cachen; SAMMA förutom footer 63→64, skiss i Kör på Teknik med redskap, och ikon på Golvklart-/utskriftsraden när listan är satt.
- `SLICE64-SHIPPED.md` i roten: urval (A–F), att skiss och ikoner återanvänds, att parkerade poster inte lyfts, bundle-byte mot main, att ingen SQL körts, head-SHA.

## 7. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz (assets js+css) mot main @ `937829c` i PR; gå inte över +512 B (E1).
- Gren `slice-64-code` från `937829c`, PR mot main med `SLICE64-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
