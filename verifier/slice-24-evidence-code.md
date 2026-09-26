# Slice 24 — code evidence (A1/B1/C1/D1/E1/F1)

**Review date:** 2026-09-26 06:49 CEST  
**Scope:** source/code evidence only; no Drive evidence.  
**Authority:** `slice-24/verification-checklist.md`; Docs mirror: `docs/forrad-empty-soft-path.sv.md`.

## A1 — PASS-leaning: soft empty is gated by empty rows and eligibility

- `app/src/components/ForradslistaSheet.tsx:21-22` gives the exact gate:
  > `const empty = rows.length === 0`
  > `const showSoftPath = empty && eligibleSuggestedCount >= 1`
- The empty branch at `ForradslistaSheet.tsx:52-70` always renders the existing lead `UI.forradslistaEmpty` (`:54`).  When `showSoftPath` is true it renders only `UI.forradslistaEmptySoftHint` and the CTA (`:55-65`); otherwise it renders the existing `UI.forradslistaEmptyHint` (`:67-69`).  Thus the per-markör empty hint is not stacked in the soft branch.
- Non-empty rows stay on the list branch at `ForradslistaSheet.tsx:71-79`, mapping the existing `rows` through `stationEquipmentLabelText`; no soft CTA is present there.
- The parent passes the count at `HallBoard.tsx:136-139`:
  > `() => eligibleSuggestedStationEquipmentItems(session).length`
- Same-population proof: `app/src/lib/session.ts:193-204` filters to placed placeable/Teknik items, rejects any defined `stationEquipment`, and requires a non-empty `defaultStationEquipment` seed. This is the same function used for the Slice 19 apply-all population (`session.ts:211-221`).

**Conclusion:** A1 is supported by a direct boolean gate, explicit else branch, unchanged non-empty list branch, and the shared Slice 19 eligibility function.

## B1 — PASS-leaning: close → edit → point; no auto-apply

- The soft CTA is callback-only at `ForradslistaSheet.tsx:58-65`:
  > `onClick={onPointAtApplyAll}`
  It does not import or call `handleApplyAllSuggested` or `applyAllSuggestedStationEquipment`.
- Parent wiring is explicit at `HallBoard.tsx:744-750`:
  > `onClose={() => setForradOpen(false)}`
  > `onPointAtApplyAll={pointAtApplyAllFromForrad}`
- `pointAtApplyAllFromForrad` at `HallBoard.tsx:297-312` performs the locked sequence:
  > `setForradOpen(false)` (`:299`)
  > `if (isFloor) exitFloor()` (`:300`)
  > `btn.scrollIntoView(...)` and `btn.focus(...)` (`:304-305`)
  > `setApplyAllHighlight(true)` (`:306`)
  > `setApplyAllStatus(UI.forradslistaPointApplyAllToast)` (`:309`)
  There is no persistence call and no apply-all call in this function.
- Floor exit is concretely edit mode: `HallBoard.tsx:231-234` defines `exitFloor()` as `setHallMode('edit')` (plus tray reset).
- The target control is the existing button at `HallBoard.tsx:449-465`: it has `ref={applyAllBtnRef}` (`:450`), renders `UI.hallApplyAllSuggested` (`:464`), and separately uses `onClick={handleApplyAllSuggested}` (`:462`).
- Apply-all remains independently functional: `HallBoard.tsx:289-295` calls `applyAllSuggestedStationEquipment(session)`, persists only when `appliedCount > 0`, and reports the result. The library implementation recomputes the shared eligibility at `session.ts:214` and updates each eligible item at `:216-221`.

**Conclusion:** B1 is supported: the soft path closes and points only; the coach must separately activate the existing apply-all button to persist.

## C1 — PASS-leaning: soft copy, target size, quiet chrome, Swedish Docs match

- The soft branch contains one muted secondary paragraph plus one button at `ForradslistaSheet.tsx:55-65`; it has no tip-strip component, saknar banner, compose control, or station breakdown in this path.
- CTA classes at `ForradslistaSheet.tsx:60` are:
  > `btn-secondary hall-tap-target forradslista-soft-cta`
- `app/src/App.css:2229-2233` defines the shared target size:
  > `.hall-tap-target { min-height: 44px; min-width: 44px; padding: 8px 14px; }`
- The Slice 24 point highlight is narrowly scoped to the existing apply-all target at `App.css:2942-2960` (`.hall-apply-all--point` and one brief pulse animation).
- Swedish source strings are in `app/src/data/blockMeta.ts:336-342`:
  - `forradslistaEmptySoftHint`: `Det finns osparade förslag. Stäng och tryck Använd alla förslag — då syns redskapen i Förrådslista.`
  - `forradslistaPointApplyAll`: `Använd alla förslag på hallen`
  - aria: `Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt.`
  - toast: `Tryck Använd alla förslag för att spara.`
- These match the locked Docs table at `docs/forrad-empty-soft-path.sv.md:47-53`; the Docs behavior contract also explicitly says no auto-apply at `:57-61`.

**Conclusion:** C1 is supported by the rendered soft-only chrome, shared 44px target CSS, quiet point highlight, and exact Swedish Docs strings.

## D1 — PASS-leaning: Docs keys wired in `blockMeta`

`app/src/data/blockMeta.ts:336-342` defines all four Slice 24 keys (`forradslistaEmptySoftHint`, `forradslistaPointApplyAll`, `forradslistaPointApplyAllAria`, `forradslistaPointApplyAllToast`). They are consumed from `UI` by the sheet at `ForradslistaSheet.tsx:57,61,64` and by the Hall point handler at `HallBoard.tsx:309`. This is thin key wiring; no duplicate literal is introduced in the component path.

**Conclusion:** D1 is supported.

## E1 — PASS-leaning: footer label

- `app/src/data/blockMeta.ts:353-354` sets the exact value:
  > `footerSliceLabel: 'Träningsplaneraren · Slice 24'`
- `app/src/App.tsx:246-249` renders `{UI.footerSliceLabel}` inside the existing `app-footer no-print` footer.

**Conclusion:** E1 is supported; the footer slice label is exactly `Träningsplaneraren · Slice 24`.

## F1 — PASS-leaning: hard non-goals and blast radius

- **No compose from Förråd:** `ForradslistaSheet.tsx:1-10` imports only blockMeta, scroll lock, and row type; its soft branch only invokes `onPointAtApplyAll` (`:62`). The sheet has no compose import/open or `Redigera redskap` action.
- **No auto-persist:** `pointAtApplyAllFromForrad` (`HallBoard.tsx:297-312`) only changes sheet/mode/focus/highlight/toast state. It does not call `persist`, `onChange`, `saveDraft`, or an equipment update. The existing `persist` helper is separately defined at `HallBoard.tsx:184-187`; the apply-all handler is separately wired at `:289-295`.
- **No new saknar/tip chrome for this path:** the soft branch is exactly the two elements shown at `ForradslistaSheet.tsx:55-65`; the alternate branch is the reused quiet empty hint at `:67-69`. No `CoachTipStrip` is imported by `ForradslistaSheet.tsx`.
- **No place heuristic/station breakdown/compose/library/CAD/cloud/sync path:** no such operation or UI is reachable from the soft CTA callback; the callback graph terminates in `pointAtApplyAllFromForrad` and the existing Hall button remains the only apply action.
- **No `window.confirm`:** repository source scan of `app/src` returned no `window.confirm` occurrence.
- **Caption unchanged:** `app/src/data/blockMeta.ts:169` remains `hallSchematicNote: 'Schematisk hall — inte exakt mått'`; `app/src/components/HallCanvas.tsx:237` continues to render `UI.hallSchematicNote`.
- **No Home rewrite in the Slice 24 source diff:** `git diff -- app/src/App.tsx` was empty. The Slice 24 source diff was limited to `App.css`, `ForradslistaSheet.tsx`, `HallBoard.tsx`, and `blockMeta.ts`; Home labels remain at `blockMeta.ts:355-359`.
- **Blast-radius preservation:** Slice 19 apply-all remains the separate button/handler cited above; Slice 22 progressive-hints logic remains in `HallBoard.tsx:113-123`; Slice 23 Home entry labels remain in `blockMeta.ts:355-359`.

**Build check:** `npm run build` in `app/` succeeded (TypeScript + Vite; exit code 0) at 2026-09-26 06:49 CEST.

**Conclusion:** F1 is supported by the callback boundary, absence of persistence/compose/confirm in the new path, unchanged caption/Home wiring, and the separate Slice 19/22/23 paths.

## Overall code-only result

A1 **PASS-leaning** · B1 **PASS-leaning** · C1 **PASS-leaning** · D1 **PASS-leaning** · E1 **PASS-leaning** · F1 **PASS-leaning**.
