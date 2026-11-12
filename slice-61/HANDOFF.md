# Slice 61 — HANDOFF till Builder (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

**Status:** **FÖRESLAGEN** — inte låst. Texten följer Docs ★-val A1 B1 C1 D1 E1 F1. **Builder får bygga först när PO skickat byggkortet efter lås** (Docs pingar inte Bob). Bas main @ `9d4813b`, docs-gren `slice-61-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen (C1). **Bundle:** inom +512 B gzip (uppskattat +0,30–0,50 kB) — **inget undantag**; rapportera exakta byte mot main i PR.
**Egen worktree från `9d4813b`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är (oincheckade borttagningar av `tools/bank/out/*`). Städa den inte, och kör inte Doctor eller smokes därifrån.
Rör inte Hallöversikt, Redigera redskap, Planera pass, `EQUIPMENT_PIECES`, `PassPrint` eller scoutidéerna #1 och #3. Inget extra hallmärke. Ingen `push-promote --replace`, ingen SQL mot riktiga projektet.

## 1. Hjälpfunktion (A1, F1)

Ny fil `app/src/lib/waitingLine.ts` (håll den liten; `ownActivities.ts` ska importera härifrån så steg-räkningen och sparningen inte driver isär):

```ts
export const WAITING_PREFIX = 'Medan du väntar:'

export function isWaitingLine(line: string): boolean
export function waitingLine(howTo: string): string | undefined
export function composeHowTo(howText: string, waiting: string): string
```

- `isWaitingLine`: trimma, ta bort ev. inledande `N. `, sedan `startsWith(WAITING_PREFIX)`.
- `waitingLine`: sista raden i `howTo` som matchar, returnerad som `Medan du väntar: ` + texten efter prefixet (en lucka, trimmad). Saknas rad eller tom payload → `undefined`.
- `composeHowTo`: `normalizeHowTo(howText)` (steg bara) plus, om `waiting` (utan eller med prefix) har innehåll, `\n` + prefix + lucka + klippt payload. Förslag: payload högst 120 tecken. Hela strängen får inte överstiga 800 (`BANK_LIMITS.howTo`); korta då payloaden, inte stegen.
- `parseHowLines` (`ownActivities.ts:94–98`) **hoppar över** rader där `isWaitingLine` är sant. Befintliga anrop (stegantal, formulär, `rowToEntry`) får då 1–4 steg som i dag även med vänt-rad.
- `normalizeHowTo` (`:150–154`) arbetar bara på stegen (redan via `parseHowLines`). Den sätter **inte** tillbaka vänt-raden — det gör `composeHowTo`.
- `ownActivityIssues` (`:105–107`) oförändrad i logiken: den räknar bara steg i `draft.howText`. Vänt-fältet är valfritt och ger inget eget fel.
- `floorTip` (`data/activityTips.ts:180–183`) och `howSteps` i `ActivityTip.tsx:18–22` ska använda `parseHowLines` (eller samma filter). De får inte lista vänt-raden som ett steg.
- `saveOwnActivity` (`ownActivities.ts:273`): `howTo: composeHowTo(draft.howText, draft.waiting ?? '')`.
- `AdminBankForm` submit `:104`: `how_to: composeHowTo(draft.howText, draft.waiting ?? '')`.
- `OwnDraft` får `waiting?: string`. Laddning i båda formulären: `howText: parseHowLines(howTo).join('\n')` som i dag, plus `waiting: waitingLine(howTo)?.slice(WAITING_PREFIX.length).trim() ?? ''`.

## 2. Visning (D1)

- `ActivityDetail.tsx` under «Så gör du» (`:191–192`): befintliga `howto-steps` visar bara stegen (`parseHowLines` ihopsatta som i dag, eller `activity.howTo` utan vänt-raden). Om `waitingLine(activity.howTo)` finns: en `<p className="howto-waiting">` med hela raden direkt under. Ingen ny `h3`.
- `ActivityTip.tsx`: steglistan som i dag (utan vänt-raden). Samma rad som egen `<p className="activity-tip-waiting">` efter stegblocket, före «Se upp för».
- `lib/runPass.ts`: `RunStep` får valfri `waiting?: string`. Sätt `waiting: activity ? waitingLine(activity.howTo) : undefined`. `cue` förblir `tip.steps[0]`.
- `RunPass.tsx`: om `step.waiting`, en `<p className="run-waiting">` direkt under cue-raden (`:205–209`), före säkerhet/se upp för. Ingen ändring av klocka, «Nästa», «Kvar» eller nav.
- CSS: återanvänd muted/tip-typ, knapp storlek som övrig brödtext. Ingen ny färgskala. Klassen ska inte se ut som ett femte `li` i steglistan.
- Ingen ny `UI.`-etikett för själva raden — prefixet i texten räcker. Fältetikett och hint: se `content/microcopy.sv.md`.

## 3. Formulär (C1, A1)

- `AdminBankForm.tsx` och `OwnActivityForm.tsx`: efter textarea «Så gör du» (`:174–176` resp. motsvarande `:127–128`), ett valfritt fält `<label class="own-field">` med `UI.waitingLabel` / `UI.waitingHint`, `maxLength={120}`. Synligt för alla block (texten är ofarlig även på samling), men microcopy och seedrunda gäller Teknik.
- Sparning via `composeHowTo` som i avsnitt 1. Rör inte layout-, redskap- eller källfälten. En 4-stegs rad med ifylld vänt-text ska gå att spara och läsas tillbaka utan att `rowToEntry` släpper den.
- Tomt vänt-fält vid sparning tar bort en ev. befintlig vänt-rad och lämnar stegen orörda.

## 4. Innehåll och footer (B1, E1)

- `data/seedActivities.ts`: lägg till exakt raden i `content/microcopy.sv.md` som sista rad i `howTo` för de 16 id:na, med riktigt nyrad-tecken i strängen (samma `\n`-stil som de befintliga stegen). Rör inte de andra fälten.
- `data/blockMeta.ts`: `SLICE_NUMBER = '61'`. Nya nycklar `waitingLabel` och `waitingHint` enligt microcopy.
- Live-banken rörs inte i PR:en (C1). Skriv i `SLICE61-SHIPPED.md` att Christoffer fyller fältet i Admin efter merge för samma 16 id (så länge C1 står kvar vid lås).

## 5. Tester (`bun test src`)

Ny `lib/waitingLine.test.ts` (eller motsvarande i `ownActivities.test.ts`):

- `isWaitingLine` sant för `Medan du väntar: hoppa`, `  5. Medan du väntar: hoppa  `; falskt för vanliga steg och för `Medan du väntar` utan kolon.
- `waitingLine` plockar sista matchande raden; `undefined` när den saknas.
- `parseHowLines` på en 4-stegs `howTo` plus vänt-rad → längd 4, ingen vänt-text i arrayen.
- `composeHowTo` rundar 4 steg + vänt-text; tom waiting tar bort raden; payload trimmas; totalen ≤ 800.
- `rowToEntry` på en giltig 4-stegs bankrad **med** vänt-rad → aktivitet, `howTo` innehåller prefixet. Samma rad med ett femte riktigt steg (utan prefix) → `null`.
- `floorTip(activity).steps` innehåller inte vänt-raden. `runSteps` cue är fortfarande första steget, `waiting` är hela raden.
- Seed: de 16 id:na har exakt microcopy-raden som sista `howTo`-rad; `parseHowLines` 1–4; de 8 Teknik som inte ingår saknar prefixet. Befintliga `seedActivities.test.ts` (bl.a. 2DJ «≤4 steps») ska vara gröna utan att räknas om till att tillåta 5 steg — de ska använda `parseHowLines` om de i dag splittar råa rader och skulle råka räkna vänt-raden.
- Befintliga `bankRow`-, `ownActivities`-, `activityTips`- och `runPass`-tester gröna utan beteendeförändring på rader utan vänt-text.

## 6. Feature map, docs, smokes

- `verify-traningsplaneraren/features/kor-passet.md`: en kort not att Kör visar «Medan du väntar: …» under cue när raden finns; cue oförändrad. Ev. en rad i en befintlig detalj-/biblioteksfil om en sådan beskriver «Så gör du». Ingen ny feature-fil krävs.
- Ingen ny `docs/*.sv.md` krävs. En mening i `docs/planera-pass.sv.md` eller motsvarande om «Så gör du» redan nämns där är nog.
- `verifier/smoke-map.json`: ingen ny smoke. `pick-smokes 9d4813b <head>` styr. Förväntade träffar när filerna ovan ändras: `seed-2DJ_oMM81mI-smoke`, `slice-30-builder-smoke`, `slice-30-fix-b1-smoke`, `slice-34-builder-smoke`, `slice-38-builder-smoke`, `slice-47-builder-smoke`. Jämför mot main-cachen; SAMMA förutom footern 59→61.
- `SLICE61-SHIPPED.md` i roten: urval (16 id), att hjälpfunktionen fanns för att 14 Teknik redan har 4 steg, bundle-byte mot main, att live-banken väntar på Christoffers Admin-runda (C1), head-SHA.

## 7. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz (assets js+css) mot main i PR; gå inte över +512 B (E1: korta eller stryk från listans slut).
- Gren `slice-61-code` från `9d4813b`, PR mot main med `SLICE61-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat i förslaget (byggs inte om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
