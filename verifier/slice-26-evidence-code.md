# Slice 26 — code evidence

**Run:** 2026-09-26 10:36 CEST  
**Authority:** `slice-26/verification-checklist.md`  
**Ship marker:** `app/SLICE26-SHIPPED.md`  
**Scope:** source/build verification only; this verifier wrote evidence and did not change product code.

## Verdict

**Overall: PASS.** All locked A1–F1 checks pass in the shipped source; `npm run build` exits 0.

## A1 — placement-only progress: PASS

- `app/src/lib/coachTips.ts:203-211` defines sync input `placementCount`; the Slice 26 branch at `:224-227` is exactly:
  > `if (!checklist.openHallAndPlace && opts.placementCount >= 1) {`
  > `  checklist.openHallAndPlace = true`
  > `}`
  There is no `openedHall` alternative. Thus Hall open alone does not newly check the step, while one or more placements does.
- `app/src/App.tsx:46-49` derives `placementCount` from `hallPlacements.length`, and `:66-71` passes it to `syncChecklistHeuristics`.
- Navigation remains soft. Step 3 is disabled only by `!canOpenHall` (`app/src/components/KomIgangCard.tsx:79-85`), and the Home Hall/Golvklart handlers gate only on an activity (`app/src/App.tsx:121-140`), then set the view. The unchecked place flag is not a navigation gate.
- Compose remains separate: `stationEquipment` is a separate sync input/branch (`app/src/lib/coachTips.ts:208-210`, `:229-233`), while the place branch requires only `placementCount`.

## B1 — legacy/open bookkeeping: PASS

- `markOpenedHall` is open-only (`app/src/lib/coachTips.ts:166-173`):
  > `if (state.openedHall) return state`
  > `return saveCoachTips({ ...state, openedHall: true })`
  It does not write `checklist.openHallAndPlace`, and therefore cannot force the place step true from an open.
- Already-true legacy state is preserved: sync tests `!checklist.openHallAndPlace` before setting true (`app/src/lib/coachTips.ts:224-227`) and has no false assignment/clear path; the function also spreads the existing state (`:169-172`).
- App call sites still record opens only: Home Hall (`app/src/App.tsx:121-128`), Home Golvklart (`:131-140`), and builder Hall (`:181-185`). No App.tsx call site manually advances the place flag.

## C1 — copy/chrome: PASS

- The locked Step 3 strings are unchanged in `app/src/data/blockMeta.ts:228-230`:
  > `komIgangStep3: 'Öppna Hallöversikt och placera stationer'`
  > `komIgangStep3Hint: 'Dra Teknik-stationerna ungefär dit ni brukar vara i hallen.'`
  These match the Docs lock (`docs/kom-igang-place-step.sv.md:29-36`).
- `KomIgangCard` maps the existing keys directly (`app/src/components/KomIgangCard.tsx:79-85`); there is no new tip-strip component/reference in that checklist component. Existing HallBoard coach strips remain separate (`app/src/components/HallBoard.tsx:561-568`, `:692-698`).

## D1 — thin Docs / no invent: PASS

- The Docs explicitly require unchanged copy and no tip strip (`docs/kom-igang-place-step.sv.md:20-25`, `:29-45`). Source retains exactly the two existing strings (`app/src/data/blockMeta.ts:228-230`); no replacement synonym, compose-entry, placeable-set, or new checklist copy was added.
- The implementation is limited to the locked heuristic functions in `coachTips.ts` and the footer value; `App.tsx` retains its existing call sites.

## E1 — footer: PASS

- The exact value is present at `app/src/data/blockMeta.ts:360-361`:
  > `footerSliceLabel: 'Träningsplaneraren · Slice 26'`
- The app renders that key at `app/src/App.tsx:246-249`.

## F1 — preserved Slice 25 / caption / no confirm: PASS

- Slice 25’s saknar strings remain in `app/src/data/blockMeta.ts:353-359`, and HallBoard still renders the banner in edit mode at `app/src/components/HallBoard.tsx:511-526`, including `hallSaknarRedskapBannerText(...)` and the existing optional point CTA.
- The hall caption remains exactly `Schematisk hall — inte exakt mått` (`app/src/data/blockMeta.ts:169`) and is rendered by `HallCanvas` (`app/src/components/HallCanvas.tsx:237`).
- `rg -n 'window\\.confirm' app/src` returned no matches. No new `window.confirm` exists.
- The Slice 26 source branch does not require saved equipment and does not alter drafts/library/CAD/cloud behavior; the builder smoke also records the saknar banner and caption as preserved (`verifier/slice-26-builder-smoke.md`, 18 PASS / 0 FAIL).

## Build

`cd app && npm run build` — **exit code 0** (`tsc -b && vite build`; 46 modules transformed).

## Lock summary

| Lock | Result |
|---|---|
| A1 | PASS |
| B1 | PASS |
| C1 | PASS |
| D1 | PASS |
| E1 | PASS |
| F1 | PASS |
| Build | PASS |
