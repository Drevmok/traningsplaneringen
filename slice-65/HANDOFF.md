# Slice 65 — HANDOFF till Builder (LÅST: A1 B1 C1 D1 E1 F1)

**Status:** **LÅST** 2026-11-21 (se `decisions.md`). Builder bygger när PO skickat byggkortet (Docs pingar inte Bob). Bas main @ `6698a63`, docs-gren `slice-65-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen. Ingen schema-SQL, ingen data-UPDATE, ingen `push-promote`. Agenter kör aldrig SQL mot riktiga projektet.
**Bundle:** inom +512 B gzip (uppskattat +0,30–0,50 kB) — **inget undantag**; rapportera exakta byte mot main i PR. Går det över: korta CSS/mikrotext, inte ta bort stegguide eller utskriftssektion, och rapportera.
**Egen worktree från `6698a63`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är (oincheckade borttagningar av `tools/bank/out/*`). Städa den inte, och kör inte Doctor eller smokes därifrån.
Rör inte Hallöversikt i redigeringsläge, Redigera redskap, Admin-kön, Kör passet, S4–S9, hall-CAD eller den parkerade uppdelningen av Förrådslista. Ett märke per station. Golvklart förblir visningen för gruppen.

## 1. Hjälpfunktion (B1, C1, F1)

Ny liten hjälp, inte i `session.ts` (t.ex. `app/src/lib/hallSetup.ts`, eller intill `hall.ts` om filen hålls liten):

```ts
export function hallSetupSteps(
  session: Session,
): Array<{
  itemId: string
  rank?: number
  slots: StationEquipmentSlot[]
  layout?: StationLayout
}>
```

- Källa: `placeableItems(session)` (bara Teknik).
- Först de som har `stationRanks`-nummer, i den ordningen; sedan oplacerade utan `rank`.
- `slots = item.stationEquipment ?? activity?.defaultStationEquipment ?? []`.
- `layout = layoutForStation(activity, item.stationEquipment)` — oförändrad regel.
- Använd inte `stationCards().rank` som märkesnummer, och inte `aggregateStationEquipment` som antal per steg.
- Avbockning är UI-state (minne under genomgången), inte ett fält på sessionen.

## 2. Stegläge vid Golvklart (A1, C1)

- Knapp «Bygg hallen» i Hallöversikt- och/eller Golvklart-huvudet (intill Förrådslista / Skriv ut passet). Öppnar stegläge över befintlig `HallCanvas hallMode="floor"`.
- Panel: nummer + titel, `StationSketch` när slots finns (auto-rad om layout saknas), redskapsrader med antal (ikon + text som på märket, `equipmentIconId` / `VisualIcon` `gear` om det är billigt, annars text), avbockning, Föregående / Nästa.
- Markera aktuellt *befintligt* märke. I dag är `selected` avstängd på golvet — en diskret markering i stegläget är tillåten; inget extra märke, inga redskapspinnar, ingen flytt.
- Avsluta → vanlig Golvklart eller Hallöversikt. Placeringar oförändrade.
- Förrådslista-arket orört (pass-bred summa).

## 3. Utskrift (D1)

- I `PassPrint`: en kort sektion «Bygg hallen» (samma steg som hjälpen), skiss, redskap + antal, tom avbockningsruta. CSS i `export.css`.
- Befintlig tidslinje, hallkarta och Förrådslista stannar. Ingen andra `print()`-väg. Inte Se upp för / Säkerhet i den nya sektionen.

## 4. Text och footer (E1)

- `data/blockMeta.ts`: `SLICE_NUMBER = '65'`. Nya `UI.`-nycklar enligt `content/microcopy.sv.md`. Låsta termer orörda.
- Ingen seed- eller bankändring. Ingen SQL-fil i den här packen.

## 5. Tester (`bun test src`)

- Placerade Teknik → steg i `stationRanks`-ordning med nummer.
- Oplacerad Teknik → sist, utan `rank`.
- Slots från standard när `stationEquipment` är osatt; från egen lista när den är satt; layout enligt `layoutForStation`.
- Ingen Teknik / tomt pass → `[]`.
- Befintliga tester gröna.

## 6. Feature map, docs, smokes

- `verify-traningsplaneraren/features/golvklart-forrad.md`: kort not om «Bygg hallen» (stegläge, B1-ordning, avbockning i minnet, utskriftssektion). Golvklart förblir gruppvy.
- En mening i `docs/dela-och-utskrift.sv.md` och ev. `docs/golvklart-redskap.sv.md` om uppställningssektionen.
- `verifier/smoke-map.json`: ingen ny smoke. `pick-smokes 6698a63 <head>` styr. Förväntat: **hela loopen** eftersom `blockMeta.ts` (och ev. `App.css`) är kärnfiler. Jämför mot main-cachen; SAMMA förutom footer 64→65, Bygg hallen-steg och utskriftssektionen.
- `SLICE65-SHIPPED.md` i roten: urval (A–F), återanvändning, att S4–S9 och CAD inte lyfts, bundle-byte mot main, att ingen SQL körts, head-SHA.

## 7. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz (assets js+css) mot main @ `6698a63` i PR; gå inte över +512 B (E1).
- Gren `slice-65-code` från `6698a63`, PR mot main med `SLICE65-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
