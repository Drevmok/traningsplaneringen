# Slice 62 — HANDOFF till Builder (LÅST: A1 B1 C1 D1 E1 F1)

**Status:** **LÅST** 2026-11-15 — «Ja, lås A1 B1 C1 D1 E1 F1» (Christoffer, 09:41, Europe/Stockholm, reläat av PO). Se `decisions.md`. **Builder får bygga** när PO skickat byggkortet (Docs pingar inte Bob). Bas main @ `04af122`, docs-gren `slice-62-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen schema-SQL. Data-UPDATE `content/update-progression-links.sql` (A1) — Christoffer klistrar in **efter merge**, när appen är live, och bara efter sitt **separata** ja. **Builder kör varken SQL eller `push-promote --replace`.** Agenter kör aldrig filen. Ta med filen oförändrad i bygg-PR:en; skriv inte en ny.
**Bundle:** inom +512 B gzip (uppskattat +0,30–0,50 kB) — **inget undantag**; rapportera exakta byte mot main i PR. Går det över: stryk par 9, sedan 8, enligt microcopy.
**Egen worktree från `04af122`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är (oincheckade borttagningar av `tools/bank/out/*`). Städa den inte, och kör inte Doctor eller smokes därifrån.
Rör inte Hallöversikt, Redigera redskap, Planera pass, `EQUIPMENT_PIECES`, `PassPrint`, Kör passet eller Scout #3. Inget extra hallmärke. Inga nya länkfält i Admin eller egen övning. Ingen `push-promote --replace`, ingen SQL mot riktiga projektet.

## 1. Hjälpfunktion och byte (A1, B1, F1)

Ny fil `app/src/lib/variantLinks.ts` (håll den liten; lägg **inte** bytet i `session.ts` — den filen utlöser också hela smoke-loopen):

```ts
export function easierOf(activity: Activity, getById: (id: string) => Activity | undefined): Activity | undefined
export function harderOf(activity: Activity, getById: (id: string) => Activity | undefined): Activity | undefined
export function swapSessionActivity(session: Session, itemId: string, nextActivityId: string): Session
```

- `easierOf`: först `activity.progressionOf`, annars första katalogen-träffen vars `regressionOf === activity.id`. Målet måste finnas via `getById` och inte vara samma id. Annars `undefined`.
- `harderOf`: först `activity.regressionOf`, annars första träffen vars `progressionOf === activity.id`. Samma regler.
- Stabil ordning: samma som `activitiesForBlock` / seedordning, så testen inte fladdrar.
- `swapSessionActivity`: byt bara `activityId` på posten med `itemId`. Behåll `id`, `durationMinutes`, `note`, `order` och `stationEquipment` (även `undefined`). Okänt `itemId` eller samma id → oförändrad session (ny referens inte nödvändig). Anropa ev. `withComputedTotal` om totaltiden beror av något annat än minuterna (den ska vara oförändrad).
- Bara Teknik-rader i UI: visa chip bara när `activity.blockType === 'techniques'` och motsvarande uppslag ger en övning.

## 2. Visning (B1)

- `BlockCard.tsx`: under eller intill titeln, två textchip/knappar `UI.easier` / `UI.harder` («Lättare» / «Svårare»). Visa bara den som har mål. Ingen chip-rad alls när båda saknas (t.ex. Bro).
- Ny callback, t.ex. `onSwapActivity(itemId, nextActivityId)`, kopplad i `SessionBuilder.tsx` till `swapSessionActivity`. `stopPropagation` som på övriga item-actions, så inte kortet öppnas.
- Återanvänd befintlig knapp/chip-typ (muted, samma brödtextstorlek). Ny CSS bara om det inte går att återanvända — `App.css` är också kärnfil.
- Hallöversikt orörd: märket sitter på `item.id`.
- Redskap: är `stationEquipment` osatt följer förslagen automatiskt den nya övningens `defaultStationEquipment`. Ifylld eller uttryckligt tömd lista lämnas.
- `ActivityDetail` «Bygger på» / «Lättare variant av» orörd.
- Ingen ny yta i Kör passet eller Skriv ut passet.

## 3. Innehåll och footer (C1, E1)

- `data/seedActivities.ts`: sätt exakt `progressionOf` / `regressionOf` enligt tabellen i `content/microcopy.sv.md`. Rör inga andra fält. Komplettera de två ensidiga (`hjul.progressionOf = minihjul`, `balansgang.regressionOf = soldatsparkar-bom`). Skriv reciprokt åt båda håll.
- `data/blockMeta.ts`: `SLICE_NUMBER = '62'`. Nya nycklar `easier` och `harder` enligt microcopy. Inga andra typ- eller lock-strängar.
- Live-banken rörs inte i bygg-PR:en. Ta med `content/update-progression-links.sql` oförändrad. Skriv i `SLICE62-SHIPPED.md` att Christoffer (inte Builder) klistrar in den **efter merge**, när appen är live, och bara efter sitt **separata** ja; att den bara rör de två länkkolumnerna för de 16 id:na, är idempotent, och aldrig körs av bottar.

## 4. Import-fix (D1)

- `ownImport.ts`: importera `composeHowTo` och `waitingText` från `waitingLine.ts`. Byt raden `howTo: normalizeHowTo(raw.howTo as string)` till `howTo: composeHowTo(raw.howTo as string, waitingText(raw.howTo as string))`.
- `parseHowLines` är redan filterad; stegantal och «för många steg»-noten ska bete sig som i dag. Utan vänt-rad ska resultatet vara identiskt med `normalizeHowTo`.

## 5. Tester (`bun test src`)

Ny `lib/variantLinks.test.ts` (eller motsvarande):

- `easierOf` / `harderOf` på Grenhopp: landning respektive formhopp (egna fält).
- På Hjul efter komplett länk: Minihjul via `progressionOf`. Extra: ensidig `minihjul.regressionOf` utan motlänk ger ändå `harderOf(minihjul) === hjul` via omvänd länk (skydd om en seedglidning).
- Bro / övning utan länk → båda `undefined`.
- Saknat eller samma id som mål → `undefined`.
- `swapSessionActivity` byter titel-id, behåller `item.id`, minuter, `note` och `stationEquipment` (`undefined` förblir `undefined`; ifylld lista orörd).
- Seed: de 16 id:na har exakt microcopy-länkarna, reciprokt; de 8 utanför saknar nya fält (behåll ev. tomt). Befintliga `seedActivities.test.ts`-länkasserter gröna.
- `ownImport`: fixture med 3 steg + `Medan du väntar: hoppa` → `activity.howTo` innehåller prefixet och `parseHowLines` har längd 3. Befintliga importtester (klipp, 4 steg, länkar) gröna.
- Befintliga `bankRow`-, `ownActivities`- och `waitingLine`-tester gröna.

## 6. Feature map, docs, smokes

- `verify-traningsplaneraren/features/`: en kort not i Passbyggar-filen (eller motsvarande) att Teknik-raden kan visa «Lättare» / «Svårare» när länk finns, och att bytet behåller minuter och märke. Ingen ny feature-fil krävs.
- Ingen ny `docs/*.sv.md` krävs. En mening i `docs/planera-pass.sv.md` om Passbyggaren redan nämns där är nog.
- `verifier/smoke-map.json`: ingen ny smoke. `pick-smokes 04af122 <head>` styr. Förväntat: **hela loopen** eftersom `blockMeta.ts` är kärnfil (samma läge som Slice 61). Jämför mot main-cachen; SAMMA förutom footer 61→62 och att chip syns på länkade rader.
- `SLICE62-SHIPPED.md` i roten: urval (9 par / 16 id), att omvänd länk finns som skydd, bundle-byte mot main, att live-banken väntar på Christoffers ja att klistra in `content/update-progression-links.sql` efter merge (A1), import-fixen, head-SHA.

## 7. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz (assets js+css) mot main @ `04af122` i PR; gå inte över +512 B (E1).
- Gren `slice-62-code` från `04af122`, PR mot main med `SLICE62-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
