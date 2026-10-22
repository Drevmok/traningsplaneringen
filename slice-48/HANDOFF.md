# Slice 48 — Builder handoff

Status: **PROPOSED**. Bygg inget förrän Christoffer har valt A–F. Den här texten beskriver ★-valen. När valen är låsta skriver Docs `slice-48/decisions.md` (PROJECT.md: beslutslogg per slice).

## Vad som finns idag (main @ e605b3f)
- `SessionBuilder.tsx:522–535` har knappen «Hallöversikt» (`.builder-hall`) i raden och `:561–569` har samma knapp i «Mer». Båda anropar `onOpenHall` (App.tsx:410, `handleOpenHallFromBuilder`).
- `export.css:1459–1463` (≤768 px) döljer `.builder-hall`.
- `HallBoard.tsx`: läge `edit`/`floor`, bricka med «Placera här» (telefon), HTML5-drop på brickan (`handleTrayDrop` :309–316), zoom − / + (:371–380), `handlePinchZoom` :233–235.
- `HallCanvas.tsx:74–133`: nypning med `touch*`, beroende `[onViewZoomChange]`. `handleDrop` :135–145. HTML5 `onDragOver` :165–170.
- `HallChip.tsx:16` `HALL_CHIP_MIME`, `draggable`/`onDragStart`/`onDragEnd` :23–27, :113–128.
- `lib/hall.ts`: `passOrder` :111, `placeableItems` :137, `stationRanks` :146, `removePlacement` :427. `lib/hallSuggest.ts`: `autoPlaceUnplaced`.
- `lib/session.ts`: `moveItemWithinBlock` :308 (bara ett steg upp/ner), `removeItem` :364, `addItemToBlock` :463.
- Ångra (Slice 41): `SessionBuilder.tsx` `undoToast` :206, `armUndo` :227, `handleRemoveItem` :231–237, toast :741–755, `lib/undoCarry.ts`. Texter: `blockMeta.ts:508–511`.
- Detaljvyn: `ActivityDetail.tsx:106–114` (`.modal-backdrop` > `.modal.activity-detail`), «Lägg till i valt block» :330. CSS: `App.css:1197–1215` (bas), `:1545–1557` (inuti `@media (max-width:768px)` från :1325).

## 1. A1 — Hallöversikt i raden (`export.css`, `SessionBuilder.tsx`)
- Ta bort `.builder-hall` ur väljaren i export.css:1461. Ordningen i raden ska vara «Kör passet» · «Hallöversikt» · «Mer». «Mer» ligger kvar som `flex:0 0 auto`.
- Ta bort Hallöversikt-knappen i «Mer»-panelen (:563–569). `disabled`/`hall-cta-hint` på knappen i raden finns redan.
- Mål: alla tre knapparna ≥44 px höga och på en rad vid 390 px.

## 2. B1 — Ändra-läget (`HallBoard.tsx`, ny `HallStationList.tsx`)
- Nytt tillstånd: `stationsEdit: boolean`. Knappen «Ändra stationer» (`btn-secondary`) ligger i `.hall-header-actions`, och syns bara när `hallMode === 'edit'`.
- I läget visas `HallStationList` under planen: en rad per `placeableItems(session)`, med nummer (`stationRanks` eller «–» om den inte är placerad), titel, handtag (aria-hidden), ↑, ↓ och «Ta bort». Sist kommer «Lägg till station».
- «Klar» lämnar läget och flyttar fokus tillbaka till «Ändra stationer». «Golvklart» lämnar också läget. Esc lämnar läget när fokus är i listan.
- Inget sparas separat: varje ändring går genom `persist` som idag.

## 3. C1 — Pointer Events (`lib/pointerDrag.ts`, ny, ca 60 rader)
- `startPointerDrag(e, { onMove, onDrop, onCancel })`: `setPointerCapture`. Dragningen startar först efter 6 px. `pointercancel` och Esc avbryter.
- Listan: `touch-action:none` bara på `.hall-station-handle`. Under dragningen räknas målindex ut från radernas `getBoundingClientRect` och visas med en linje (`.is-drop-target`). Vid släpp anropas `moveTechniqueTo`.
- Planen: `HallChip` (inte Golvklart) får `onPointerDown`, som flyttar markören via `clientToNormalized` + `snapPlacement` och anropar `onPlaceAt` vid släpp. Ett tryck utan rörelse öppnar detaljvyn som idag. `.hall-chip:not(.is-readonly){touch-action:none}` finns redan (App.css:2466–2468).
- Brickan: en markör som dras till brickan lyfts av med `removePlacement`. Det ersätter `handleTrayDrop`.

## 4. D1 — En ordning (`lib/session.ts`)
- Ny funktion `moveTechniqueTo(session, itemId, toIndex): Session`. Den sorterar Teknik-blocket på `order`, flyttar posten och skriver om `order` till 0..n−1, och avslutar med `withComputedTotal`.
- ↑ / ↓ kan använda `moveItemWithinBlock` (:308) direkt.
- Placeringarna ändras inte. `stationRanks` och `flowSegments` följer `passOrder`, så siffrorna och flödespilarna uppdateras av sig själva.

## 5. E1 — Lägga till och ta bort (`HallBoard.tsx`)
- «Lägg till station»: öppna `LibraryPanel` i samma ark som i Passbyggaren (`filterBlockType='techniques'`). `onSelectActivity` anropar `addItemToBlock(session, teknikBlockId, id)` och sedan `autoPlaceUnplaced`, och därefter stängs arket. Den nya raden får fokus.
- «Ta bort»: `removeItem(session, teknikBlockId, itemId)`. Placeringen rensas av `pruneHallPlacements`. Toast «Borttagen · Ångra», 5 s, ett steg.
- Ångra i hallen: lyft ut toasten och `armUndo`/`runUndo` från SessionBuilder till en liten delad `UndoToast` + hook (`lib/undoCarry.ts` har redan tillståndet), eller kopiera de ca 25 raderna till HallBoard. ★: dela, så att regeln «en annan ändring avslutar Ångra» (:130–135) finns på ett ställe.

## 6. F1 — Nypning och liggande läge
- `HallCanvas.tsx`: `const zoomCb = useRef(onViewZoomChange); zoomCb.current = onViewZoomChange`. Effekten får beroendet `[]` och anropar `zoomCb.current?.(next)`. Städningen nollar inte `pinchRef` vid omrender.
- Lägg till `gesturestart`/`gesturechange` → `e.preventDefault()` på `wrap` (bara Safari skickar dem).
- `App.css`: `.hall-canvas-wrap { touch-action: pan-x pan-y; }`. Låt `.hall-zoom-bar` vara som den är.
- Låt `index.html` vara (viewport-meta orörd).
- Liggande läge, `App.css`, nytt block efter :1557:
  ```css
  @media (max-height: 500px) {
    .modal-backdrop { align-items: start; place-items: start center; overflow: auto; padding: 8px; }
    .modal { max-height: calc(100svh - 16px); overflow: auto; -webkit-overflow-scrolling: touch; }
  }
  ```
  Kontrollera att `modal--compact` (Slice 45 E1) och Dela-arket fortfarande ser ut som förut i 390×844 (där gäller inte regeln).

## 7. Texter (`data/blockMeta.ts`)
Se `content/microcopy.sv.md`. Nya nycklar läggs nära `hallRemove` (:218): `hallStationsEdit`, `hallStationsDone`, `hallStationsTitle`, `hallStationAdd`, `hallStationUp`, `hallStationDown`, `hallStationRemove`, `hallStationMoved`.

## 8. CSS
`.hall-station-list`, `.hall-station-row`, `.hall-station-handle`, `.is-dragging`, `.is-drop-target`. Ingen ny färg: använd de befintliga `--md-*`-variablerna. Mål ≥44×44.

## 9. Dödkod (med A1 + C1)
| Var | Vad |
|---|---|
| `SessionBuilder.tsx:563–569` | Hallöversikt i «Mer» |
| `export.css:1461` | `.builder-hall` i `display:none` |
| `HallChip.tsx:16, 23–27, 42–45, 113–128` | `HALL_CHIP_MIME`, `draggable`, `onDragStart`, `onDragEnd` |
| `HallCanvas.tsx:12, 27–29, 57–59, 135–145, 165–170, 270, 278–282` | `onDragOverCanvas`, `draggingId`/`setDraggingId`, `handleDrop`, HTML5 `onDragOver` |
| `HallBoard.tsx:52, 79, 215, 309–316, 563, 585–587, 644` | MIME-import, `draggingId`, `handleTrayDrop`, noop `onDragOverCanvas`, brickans `onDragOver`, `onDragStart` |
| `SharePass.tsx:119–121`, `PassPrint.tsx:102–104` | noop-props `onDragOverCanvas`, `draggingId`, `setDraggingId` |
Med C2 ligger raderna HallChip/HallCanvas/HallBoard kvar.

## 10. Tester (`bun test src`, idag 245/0)
- SLICE-bump '47'→'48': `data/blockMeta.ts:97` `SLICE_NUMBER = '48'`. `lib/feedback.test.ts:25` 'Version: Slice 48'. `:45` `'48'`. `:46` och `lib/clubTemplates.test.ts:316` 'Träningsplaneraren · Slice 48'.
- Nya tester:
  - `moveTechniqueTo` (först→sist, sist→först, samma plats, okänt id, `order` 0..n−1, andra block orörda).
  - `stationRanks` efter flytt.
  - Ta bort plus Ångra återställer pass och placering.
  - Lägg till ger en ny placering på en fri ruta.
  - Logik i `pointerDrag`: tröskeln och målindex (rena funktioner).
- `npm run build` och `npm run lint` ska vara gröna.

## 11. Bundle (mjuk budget ca +512 B gz)
| Del | ca gz |
|---|---|
| `pointerDrag.ts` | +0,35 kB |
| `HallStationList` + läget | +0,6 kB |
| `moveTechniqueTo` | +0,1 kB |
| Delad Ångra | +0,15 kB |
| Texter + CSS | +0,25 kB |
| Nypningsfix + liggande CSS | +0,05 kB |
| Dödkod HTML5-dragning | −0,2 kB |
| **Summa C1** | **ca +1,3 kB** (över budget; fråga 4 i README) |
| Summa C2 | ca +0,8 kB |
Baslinje: index 132,35 kB gz.

## 12. Living docs och Verifier
- `docs/hall-oversikt-copy.sv.md`: avsnittet om ändra-läget (texter, ordningsregeln D1).
- `docs/hall-phone-chrome.sv.md`: Hallöversikt i raden (A1), nypningsfixen (F1), dra med fingret.
- `docs/ui-chrome.sv.md`: «Mer» innehåller inte längre Hallöversikt. Detaljvyn i liggande läge.
- `docs/README.md`: rad för Slice 48.
- Verifier (`verify-traningsplaneraren/features/`):
  - `passbyggaren.md`: Reach på telefon via raden, inte «Mer». Ordningen följer hallen.
  - `hall-redigera-redskap.md`: Drive-steg för Ändra stationer / Klar, ↑ ↓, Ta bort + Ångra, Lägg till station. Punkt 3 «drag does not» blir «ett tryck öppnar detaljvyn, en dragning flyttar».
  - `golvklart-forrad.md`: siffrorna följer ordningen. Inget ändra-läge på Golvklart.
  - Ny rad i `README.md` (kartindex) för liggande läge 844×390.

## 13. Self-smoke (Builder, innan PR)
`npm run build`, preview på 4173, och 390×844: A1-raden, ändra-läget hela vägen, dra med touch (Playwright `hasTouch`), Ångra. Sedan 844×390: detaljvyn och knappen nås. Nypningen testas på en riktig iPhone.
