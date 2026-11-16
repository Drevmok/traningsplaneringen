# Slice 63 — HANDOFF till Builder (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

**Status:** **FÖRESLAGEN** — inte låst. Builder får bygga först när Christoffer låst och PO skickat byggkortet (Docs pingar inte Bob). Bas main @ `2917296`, docs-gren `slice-63-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen. Ingen schema-SQL, ingen data-UPDATE, ingen `push-promote`. Länkarna finns redan (Slice 62; PO: alla 16 Teknik har dem live). Agenter kör aldrig SQL mot riktiga projektet.
**Bundle:** inom +512 B gzip (uppskattat +0,12–0,30 kB) — **inget undantag**; rapportera exakta byte mot main i PR. Går det över: korta toasten, inte ta bort kontrollen, och rapportera.
**Egen worktree från `2917296`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är (oincheckade borttagningar av `tools/bank/out/*`). Städa den inte, och kör inte Doctor eller smokes därifrån.
Rör inte Hallöversikt, Redigera redskap, Planera pass, `EQUIPMENT_PIECES`, `PassPrint`, Kör passet eller Ny vecka-kopieringen (`startNewWeek` / `duplicateSession` ska förbli ostegade). Inget extra hallmärke. Inga nya länkar i seed eller bank.

## 1. Hjälpfunktion (D1, F1)

I `app/src/lib/variantLinks.ts` (håll filen liten; lägg **inte** hjälpen i `session.ts`):

```ts
export function teknikItemsWithHarder(session: Session, getById: GetById): { itemId: string; nextActivityId: string }[]
export function stepTeknikHarder(session: Session, getById: GetById): Session
```

- `teknikItemsWithHarder`: bara poster i block med `type === 'techniques'` där `getById(item.activityId)` finns och `harderOf(activity, getById)` ger ett mål med annat id. Stabil ordning: blockordning, sedan `item.order`.
- `stepTeknikHarder`: applicera `swapSessionActivity` för varje träff, ett steg (gå inte längs kedjan i samma anrop). Noll träffar → samma session.
- Återanvänd `harderOf` och `swapSessionActivity` oförändrade. Använd **inte** `replaceItemActivity` (den nollar `stationEquipment`).
- `getById` är samma uppslag som chippen redan använder i Passbyggaren.

## 2. Visning (A1, B1, C1)

- Efter `handleNewWeek`: om `teknikItemsWithHarder` inte är tom, visa raden/knappen `UI.stepTeknikHarder` på kopian i Passbyggaren (t.ex. ovanför Teknik-blocket eller som en smal statusrad under titeln). Flaggan lever på den nya `session.id`.
- Ett tryck: `const after = stepTeknikHarder(session, getActivityById)`, `onChange(after)`, dölj raden. Vid B1: `armUndo(after, teknik-blockets id)` och toast `UI.stepTeknikHarderDone` med `UI.undoAction` («Ångra»), samma mönster som Slice 41. Ångra lägger tillbaka kopian före steget och visar raden igen om målen fortfarande finns; förra veckans mall rörs inte.
- Dölj raden efter användning, och när `session.id` ändras (ny Ny vecka, Använd mall, Nytt pass). Lämna den om ledaren bara tittar i Passbyggaren eller går till Hallöversikt och tillbaka. Visa den inte i `NewWeekConfirm`, Kör passet eller Skriv ut passet.
- Återanvänd befintlig knapp- eller bannertyp (t.ex. `btn-secondary` eller en redan använd statusrad). Ny CSS bara om det inte går — `App.css` är kärnfil.
- Hallöversikt orörd: märket sitter på `item.id`. Redskap: samma regel som Slice 62 (osatt följer den nya övningen; ifylld eller uttryckligt tömd lista lämnas).
- Befintliga chip «Lättare» / «Svårare» orörda.

## 3. Text och footer (A1, E1)

- `data/blockMeta.ts`: `SLICE_NUMBER = '63'`. Nya nycklar enligt `content/microcopy.sv.md`. Inga andra typ- eller lock-strängar. Befintliga Ny vecka-texter orörda.
- Ingen seed- eller bankändring. Ingen SQL-fil i den här packen.

## 4. Tester (`bun test src`)

Utöka `lib/variantLinks.test.ts` (eller motsvarande):

- Pass med Minihjul, Grenhopp och Bro: `stepTeknikHarder` ger Hjul resp. Formhopp; Bro orörd; `item.id`, minuter, anteckning, `stationEquipment` och `hallPlacements` oförändrade.
- Formhopp / Hjul / bara Bro → oförändrad session; `teknikItemsWithHarder` tom.
- Ljushopp i rockringar: ett anrop → satsbräda, inte trampett. Andra anropet (om det görs) → trampett.
- `startNewWeek` / `weekCopy.test.ts` orörda i beteendet: kopian är ostegad, arkivet är förra passet, signaturen matchar före steget.
- Befintliga `variantLinks`-tester gröna.

## 5. Feature map, docs, smokes

- `verify-traningsplaneraren/features/passbyggaren.md`: en kort not att Ny vecka-resultatet kan visa «Gör Teknik ett steg svårare» när minst en Teknik-rad har svårare mål; bytet är ett steg och behåller minuter och märke; kontrollen är dold annars; inte i Kör passet.
- Ingen ny `docs/*.sv.md` krävs. En mening i `docs/planera-pass.sv.md` om Ny vecka redan nämns där är nog.
- `verifier/smoke-map.json`: ingen ny smoke. `pick-smokes 2917296 <head>` styr. Förväntat: **hela loopen** eftersom `blockMeta.ts` är kärnfil. Jämför mot main-cachen; SAMMA förutom footer 62→63 och att kontrollen syns efter Ny vecka när länkade rader finns.
- `SLICE63-SHIPPED.md` i roten: urval (A–F), att `harderOf` återanvänds, att Ny vecka-arkivet är ostegat, bundle-byte mot main, att ingen SQL körts, head-SHA.

## 6. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz (assets js+css) mot main @ `2917296` i PR; gå inte över +512 B (E1).
- Gren `slice-63-code` från `2917296`, PR mot main med `SLICE63-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
