# Slice 53 — HANDOFF (FÖRESLAGEN)

**Status:** FÖRESLAGEN, inte låst. Bygg inte förrän README visar LOCKED. Radnummer från `7bf99cd`, sök om dem på din tip.

Bygg **inte om** autosparning (Slice 39) eller rutnätet (Slice 40). Båda finns och fungerar.

## 1. A1 — «Sparat» i Hallöversikt
- `App.tsx` (~rad 409 skickar `saveStatus` till `SessionBuilder`): skicka också `saveStatus={autosave.status}` till `HallBoard`.
- `components/HallBoard.tsx`: ny valfri prop `saveStatus?: SaveStatus` (typ från `lib/useAutosave.ts`). Rendera samma `span` som `SessionBuilder.tsx:567–571` i verktygsraden: dolt vid `'idle'`, annars `UI.autosaveSaved` / `UI.autosaveFailed`, klass `save-status` / `save-status-failed`.
- Ingen live region, ingen ny toast (Slice 39 B1).
- Kontrollera 390×844 och 844×390: texten får inte trycka ner hallen under kanten (Slice 43).

## 2. B1 — text
- Ingen ändring i `blockMeta.ts`. Om PO väljer B2: `autosaveSaved: 'Sparat ✓'`, och uppdatera tester som läser texten.

## 3. C1 — fullt rutnät
- `lib/hall.ts` `pickOpenCell` (~345–358): när ingen ruta är fri, prova först mellanpunkter (rutans mitt + halv `OPEN_CELL_W` / `OPEN_CELL_H`, radordning, inom zonens inre ruta) innan minst-överlapp-regeln.
- Första 12 (Stora hallen) och 9 (Grophallen) placeringar ska ge **identiska** positioner som i dag. Lägg ett gyllene test i `hallGrid.test.ts` för båda hallarna, 1–9/12 stationer.
- Nytt test: 14 Teknikstationer i Grophallen → inga två markörer på samma punkt.

## 4. D1
- Ingen migrering. `autoPlaceItems` rör bara nya placeringar (redan så).

## 5. Sidfot och budget
- `data/blockMeta.ts:97` `SLICE_NUMBER = '53'`.
- `npm run build`, `npm run lint`, `bun test src` gröna. Rapportera bundle gz mot main i PR.
