# Slice 55 — HANDOFF (FÖRESLAGEN)

**Status:** FÖRESLAGEN — bygg inte förrän Christoffer låst A–F. Radnummer från `5e57fd0`, sök om dem på din tip. ★-vägen nedan.

## 1. B1 — steget Passlängd på mallvägen
- `lib/wizard.ts:43`: `mall: ['hall', 'mall', 'length']`.
- `components/HomeWizard.tsx:18`: `{ path: 'mall'; hallTemplateId; pick: MallPick; targetMinutes: PassLength }`.
- `HomeWizard.tsx` `choose`/`result` (~52–95): mallsteget sparar `pick` och går vidare (inte `finish`); längdsteget avslutar. `result()` kräver `pick` och `a.length` för mallvägen.
- Tillbaka från Passlängd → Mall med vald mall kvar markerad (om enkelt; annars bara tillbaka).
- Kontrollera att rubriken på längdsteget är samma som i Frågor-vägen (`UI.passLength`).

## 2. A1 + C1 — skalning
- `lib/mallApply.ts`: ny ren `scaleToLength(session: Session, length: PassLength): Session`.
  - Alla övningar i blockordning; vikter = `max(1, durationMinutes)`.
  - `splitMinutes(length, vikter)` från `data/wizardPaths.ts`; sedan höj varje 0 till 1 och ta minuten från största övningen (behövs bara om fler övningar än minuter).
  - Inga övningar → bara `setSessionLength`.
  - Returnera `withComputedTotal(setSessionLength(...))`.
- `applyMall(pick, hall, length?)`: om `length` finns, `scaleToLength` efter hallbytet. Utan `length` exakt som i dag (Mallar-fliken, D1).

## 3. App
- `App.tsx:197`: `applyMall(plan.pick, plan.hallTemplateId, plan.targetMinutes)`. Spara, Ångra och toast som i dag (E1).

## 4. SLICE_NUMBER '54'/'53' → '55'
- `data/blockMeta.ts:97` (står '53' på main).
- Tester som läser sidfoten: `lib/feedback.test.ts`, `lib/clubTemplates.test.ts` (sök `Slice 53`).

## 5. Tester (`bun test src`)
- `lib/wizardSteps.test.ts`: mallvägen har 3 steg; Slice 49-testet för Frågor-vägen oförändrat.
- `lib/mallApply.test.ts`:
  - inbyggd mall × 60/90/120 → `totalMinutes` = längd; alla tider hela, ≥ 1.
  - proportioner: varje övnings andel avviker högst 1 min från `längd × andel i mallen`.
  - Mina mall och föreningsmall, samma kontroller.
  - mallen själv (input) oförändrad efter anrop.
  - `applyMall` utan längd ger samma resultat som main (gyllene).
  - mall utan övningar → bara `targetMinutes`.

## 6. Levande docs och feature map
- `docs/home-wizard.sv.md`, `docs/planera-pass.sv.md`: Starta från mall frågar Passlängd.
- `verify-traningsplaneraren/features/starta-fran-mall.md` och `home-kom-igang.md`: «Fråga 3 av 3», «60 / 60 min» efter mall.
- `docs/README.md`: rad för Slice 55.

## 7. Budget
- `npm run build`, `npm run lint`, `bun test src` gröna. Rapportera bundle gz mot main i PR (mål ≤ +512 B, väntat +120–250 B).
