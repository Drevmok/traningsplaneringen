# Slice 41 — Builder handoff

**Status:** LOCKED 2026-10-14. Scope: `app/src/components/SessionBuilder.tsx`, `app/src/lib/autosave.ts` (or a new small `lib/undo.ts`), `app/src/App.css` (toast button), `app/src/data/blockMeta.ts` (3 keys + `SLICE_NUMBER`), tests. No change to `BlockCard.tsx` markup beyond what is needed, no new component, no dialog.

## What exists today (main @ ce799ca)

- **Toast:** `components/SessionBuilder.tsx:122` `const [toast, setToast] = useState<string | null>(() => carriedToast)`; `:126–130` effect clears it after **2200 ms**; `:189` `showToast(msg: string)`; render `:720–724` `<div className="toast" role="status">{toast}</div>`. Text only, no button, fixed duration. CSS `App.css:1352` `.toast` (fixed bottom 24px, dark pill, z-index 50). HallBoard has its own copy (`HallBoard.tsx:831`), untouched here.
- **Toast across remount:** `SessionBuilder.tsx:66` module `let carriedToast` — App keys the builder by `session.id` (`App.tsx:326`), so applying a mall remounts it.
- **× remove:** `components/BlockCard.tsx:117–124` button `.item-remove` (`title={UI.remove}` «Ta bort», text ×) → `SessionBuilder.tsx:549–550` `onChange(removeItem(session, block.id, itemId))`. `lib/session.ts:364` `removeItem` filters the item, renumbers `order`, then `pruneHallPlacements` (`lib/hall.ts:474`) drops its placement.
- **Använd mall:** `SessionBuilder.tsx:300` `handleConfirmTemplate` (built-in: `autoPlaceUnplaced(cloneTemplate(...))`, `trySaveDraft(cloned)`, `onChange`); `:314` `handleConfirmSaved` (Mina mallar: `adoptAsDraft(autoPlaceUnplaced(savedTemplateToSession(...)))`); `:326` `handleConfirmClub` (föreningsmall, same + `carriedToast = UI.clubTemplateApplied`). Slice 37 auto-placement = `autoPlaceUnplaced` (`lib/hallSuggest.ts`).
- **Autosave (Slice 39):** `lib/useAutosave.ts:10` debounced 800 ms write; `pendingWrite` (`lib/autosave.ts:31`); every draft write goes through `beforeDraftWrite` (`autosave.ts:33`) → flushes a pending write of another pass, then `archiveReplacedDraft` (`:13`) copies the stored pass to Mina mallar via `saveAutoCopy` unless it has 0 stations or `sessionAlreadyArchived` (`savedTemplates.ts:118`). `trySaveDraft` (`:46`) never throws.
- **Leaving the builder:** `App.tsx:329` onHome (`autosave.flush()` then view home), `onOpenHall`, `onRun` — all unmount `SessionBuilder`.

## 1. Toast extension (D1) — smallest change

State becomes an object; plain toasts keep working:

```ts
type Toast = { text: string; action?: { label: string; run: () => void } }
const [toast, setToast] = useState<Toast | null>(...)
function showToast(text: string) { setToast({ text }) }            // all current callers unchanged
function showUndoToast(text: string, run: () => void) { setToast({ text, action: { label: UI.undoAction, run } }) }
```

- Duration: `toast.action ? 5000 : 2200` in the existing effect. Re-arm on each new toast object (a new × gives a fresh 5 s).
- **Pause while focused:** if focus is inside the toast, do not close it (clear the timer on `focusin`, restart 5 s on `focusout`). WCAG 2.2.1, keyboard and switch users need time.
- Render (same element, same `role="status"`):

```tsx
<div className="toast" role="status">
  <span>{toast.text}</span>
  {toast.action && (<>
    <span aria-hidden="true"> · </span>
    <button type="button" className="toast-action" onClick={...}>{toast.action.label}</button>
  </>)}
</div>
```

- The live region is mounted only while a toast shows (as today), so the text is announced once: «Borttagen · Ångra» / «Mallen är i Passbyggaren. Ångra». Do not change the text while it shows (no second announcement).
- CSS (`App.css` after `.toast`): `.toast { display: flex; align-items: center; gap: 4px }`, `.toast-action { background: none; border: 0; color: #fde68a (or current accent on dark); font: inherit; font-weight: 600; text-decoration: underline; min-height: 44px; padding: 0 8px; }` and a visible `:focus-visible` outline. Tap target ≥ 44 px tall; the pill can grow to fit it.
- `carriedToast` becomes `Toast | null` so the mall toast with its action survives the remount.

## 2. Undo state (A1, C1)

Module-level, next to `carriedToast` (must survive the mall remount):

```ts
let pendingUndo: { before: Session; after: Session } | null = null
```

- **Arm:** on × → `const after = removeItem(session, blockId, itemId); pendingUndo = { before: session, after }; onChange(after); showUndoToast(UI.undoRemoved, undo)`.
- On mall confirm (all three handlers) → `pendingUndo = { before: session, after: next }` (before = the pass on screen when Använd mall was confirmed, read before the new pass is created), and `carriedToast = { text: UI.clubTemplateApplied, action: undo }`.
- A new × or mall replaces `pendingUndo` (C1). The toast shows the newest only.
- **Disarm** (`pendingUndo = null`, toast closed) on: timer end; `SessionBuilder` unmount *that is not the mall remount* (see below); any `session` prop change where `session !== pendingUndo.after`.
  - Mall remount: on mount, if `pendingUndo && pendingUndo.after.id === session.id`, keep it; otherwise clear it. The unmount cleanup should not clear it (the remount check decides). Leaving to Home / Hall / Kör passet and coming back gives a session that is not `after` by id or reference → cleared, no toast.
- **Run (Ångra):** 
  1. Guard: `if (!pendingUndo || session !== pendingUndo.after) { close toast; return }` — stale undo does nothing (README «Undo tapped after the pass changed»). Compare by reference; React keeps the same object until the next `onChange`. For the remounted builder, compare `session.id === after.id` and a cheap signature check (`JSON.stringify` of blocks) as fallback if the reference differs.
  2. `const before = pendingUndo.before; pendingUndo = null`.
  3. Write first, then show: `restoreDraft(before)` (§3), `setSelectedBlockId(...)` (× case: the block the item was in; mall case: `before.blocks[0]?.id`), `onChange(before)`.
  4. `showToast(UI.undoDone)` (2.2 s, no button). In the mall case the builder remounts again (id changes back), so carry it with `carriedToast = { text: UI.undoDone }`.
- Because `before` is the whole pass, the station returns in its block, at its `order`, with every field and its `hallPlacements` entry; for the mall, the old pass returns with its own hall and placements, and the Slice 37 auto-placement of the mall pass goes with the mall pass. No extra code for placements.
- Focus: if the × that was tapped had focus (`document.activeElement` was the removed button), move focus to the Ångra button so focus is not lost on `body`. Same after a mall confirm (the sheet closes). Escape while the toast has focus closes it (no undo). After Ångra, return focus to the restored item's × button (× case) or the builder heading (mall case) if easy; else leave it.

## 3. Autosave (B1)

New tiny helper in `lib/autosave.ts`:

```ts
/** Slice 41: put back the pass from before × or Använd mall. Saved at once, no auto-copy of the pass it replaces. */
export function restoreDraft(before: Session): boolean {
  if (pendingWrite.current?.id !== before.id) pendingWrite.current = null // drop the mall pass's pending write
  skipArchiveOnce = true
  try { return trySaveDraft(before) } finally { skipArchiveOnce = false }
}
```

and in `archiveReplacedDraft` return `false` when `skipArchiveOnce`. Why: the mall pass being undone is untouched (any edit would have ended the undo), so copying it to Mina mallar would be noise. Same-id restore (× case) never archives anyway.

- × case: same pass id → `restoreDraft` writes it now (no 800 ms wait); the debounced write of the removed state, if pending, is dropped because the id matches and `useAutosave` then sees the restored session (writing it again is harmless).
- Mall case: the old pass's id comes back; App re-keys the builder; `useAutosave` treats it as the stored pass (`storedId === session.id`), so later edits autosave as usual.
- Mina mallar auto-copy of the replaced pass: **left** (README). Do not call `deleteSavedTemplate`.
- If the write fails (`false`), still restore on screen; the existing Slice 39 failure path (`saveStatus === 'failed'`, once-per-pass toast) handles it. Do not show «Ångrat.» over the failure toast; failure wins.

## 4. Strings

See `content/microcopy.sv.md`. Keys: `undoRemoved` «Borttagen», `undoAction` «Ångra», `undoDone` «Ångrat.»; `clubTemplateApplied` «Mallen är i Passbyggaren.» unchanged but now used for all three mall kinds.

## 5. Slice bump

- `app/src/data/blockMeta.ts:111` `SLICE_NUMBER = '40'` → `'41'`.
- Test asserts (confirmed on main @ ce799ca):
  - `app/src/lib/feedback.test.ts:25` `'Version: Slice 40'` → `'Version: Slice 41'`
  - `app/src/lib/feedback.test.ts:45` `assert.equal(SLICE_NUMBER, '40')` → `'41'`
  - `app/src/lib/feedback.test.ts:46` `'Träningsplaneraren · Slice 40'` → `Slice 41`
  - `app/src/lib/clubTemplates.test.ts:316` `'Träningsplaneraren · Slice 40'` → `Slice 41`

## 6. Tests (suggested)

- `lib/autosave.test.ts`: `restoreDraft(before)` after a mall `adoptAsDraft` → stored draft is `before` (same id), Mina mallar count unchanged by the restore (only the Slice 39 copy of `before`), no copy of the mall pass.
- Pure undo test (if the arm/run logic is lifted into `lib/undo.ts`): remove middle item with a placement → undo → deep-equal to the original session (blocks, order, fields, `hallPlacements`).
- Stale guard: arm, change session, run → no change.

## 7. Bundle (F1)

Estimate +300–450 B gz: toast object + action button and focus/timer handling (~200–250), undo arm/run/guard in SessionBuilder (~100–150), `restoreDraft` + skip flag (~40), 3 strings + CSS (~60). Measure as in Slice 40 AC15 (sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, main vs branch) and put numbers in ship notes.

## Deviations allowed

None without Planner. If the focus move to Ångra feels intrusive in the Drive check, report it rather than dropping it.
