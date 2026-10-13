# Slice 39 — Builder handoff

**Status:** LOCKED 2026-10-13. Scope: `app/src/lib/session.ts`, `app/src/App.tsx`, `app/src/components/SessionBuilder.tsx`, `app/src/components/Home.tsx` (title fallback only), `UI` keys + `SLICE_NUMBER` in `app/src/data/blockMeta.ts`, a few lines in `app/src/export.css`, tests. Nothing else.

## What exists today (main @ 4b056c8)

- `lib/session.ts:22` `STORAGE_KEY = 'gymnastics-planner-draft-v1'`. `saveDraft` (`:117`) = `persistEphemeralOwn` + `localStorage.setItem` (throws on quota / blocked storage). `adoptAsDraft` (`:124`) gives a fresh id and saves. `loadDraft` (`:137`) parses + migrates; `clearDraft` (`:155`).
- `lib/savedTemplates.ts` — Mina mallar, key `gymnastics-planner-templates-v1`, `MAX_TEMPLATES = 8`, `archiveSessionIfNew` dedupes by `passSignature`.
- `App.tsx` owns `session` state; `SessionBuilder` / `HallBoard` get `onChange={setSession}` (`App.tsx:308, 323`).
  - `goNew` (`:161`) → `createBlankSession()`, not saved (good for E1).
  - `goTemplate` (`:169`) → blank session + mall sheet; apply goes through `SessionBuilder.tsx:handleConfirmTemplate` (`:289`) → `onChange(cloned)` only, **not saved** (the C1 gap; Slice 37 verify F2).
  - `goWizardFinish` (`:177`) → `saveDraft(next)`. `receiveSession` / `saveShared` → `adoptAsDraft`.
- `SessionBuilder.tsx`: `handleSave` (`:240`) → `saveDraft` + toast `UI.savedToast`; button at `:465` `{UI.saveDraft}` in `.builder-actions`. `handleConfirmSaved` / `handleConfirmClub` / `handleImported` → `adoptAsDraft` (already C1). `handleNewWeek` (`:252`) saves. Toast: `.toast role="status"` at `:707`.
- `HallBoard.tsx:persist` (`:205`) calls `saveDraft` + `onChange`.
- `Home.tsx:27` reads `loadDraft()` once at mount; shows `UI.continuePass` + `{draft.title} · {draft.totalMinutes} min` (`:76`).

## 1. Safe write (storage full / private mode)

In `lib/session.ts`:

```ts
/** Slice 39: never throws. false = storage full, blocked or private mode. */
export function trySaveDraft(session: Session): boolean {
  try {
    archiveReplacedDraft(session)
    saveDraft(session)
    return true
  } catch {
    return false
  }
}
```

`archiveReplacedDraft(next)`: `const old = loadDraft(); if (old && old.id !== next.id && countSessionItems(old) > 0) archiveSessionIfNew(old)`. Wrap the archive in its own try so a full Mina mallar write never blocks the pass write. Keep `saveDraft` as is for the other callers. Mind the import cycle (`savedTemplates.ts` imports `duplicateSession` from `session.ts`); if it bites, put `archiveReplacedDraft` + `trySaveDraft` in a new `lib/autosave.ts`.

Also route `adoptAsDraft`, `goWizardFinish`, `handleNewWeek`, `HallBoard.persist` through the archive guard (they replace the slot too). `handleNewWeek` already archives via `startNewWeek`; double archive is a no-op thanks to the dedupe.

## 2. Autosave hook (A1, E1)

New `lib/useAutosave.ts` (or inline in `App.tsx`):

```ts
const DELAY = 800
export function useAutosave(session: Session | null, active: boolean): { status: 'idle' | 'saved' | 'failed'; flush: () => void }
```

- Runs only while `view` is `builder` or `hall` (`active`).
- Skip when `countSessionItems(session) < 1` **and** the stored draft id ≠ `session.id` (E1: a Tomt pass waits for its first station; a stored pass whose last station is removed still saves).
- On `session` change: clear timer, set a new 800 ms timer → `trySaveDraft`. Status `saved` / `failed`.
- `flush()`: run the pending write now. Call it in `goHome` (whatever handler sets `view('home')`), before `setView('hall')`, before `setRunSession`, and on `window` `pagehide` + `document` `visibilitychange` when hidden.
- Skip writes when JSON is identical to the last written string (cheap, avoids churn).
- Status starts `saved` when the session came from the stored draft (Fortsätt passet) or was saved at creation (C1), `idle` for a fresh Tomt pass.

Home reads `loadDraft()` at mount, so flushing before `setView('home')` is enough for Fortsätt passet to show the latest.

## 3. Save on create (C1)

- `SessionBuilder.tsx:handleConfirmTemplate`: after `cloneTemplate`, call `trySaveDraft(cloned)` before `onChange(cloned)`.
- The others already write at creation. Ensure the hook does not write the same pass again (identical-JSON skip).

## 4. Remove the button, add «Sparat» (B1)

- Delete `handleSave` and the `{UI.saveDraft}` button (`SessionBuilder.tsx:240–243, 465–467`). Delete `UI.saveDraft`, `UI.savedToast`.
- New prop `saveStatus` on `SessionBuilder` (from App). Render at the end of `.builder-actions`:

```tsx
{saveStatus !== 'idle' && (
  <span className={`save-status${saveStatus === 'failed' ? ' save-status-failed' : ''}`}>
    {saveStatus === 'failed' ? UI.autosaveFailed : UI.autosaveSaved}
  </span>
)}
```

- No `role`, no `aria-live`. The text is static after first save, so screen readers meet it in order and are not spammed.
- On the first switch to `failed` for a pass id: `showToast(UI.autosaveFailedToast)` (existing toast, already `role="status"`, so it is announced exactly once). Back to `saved` when a later write succeeds; no toast for that.

CSS (`export.css`, near `.builder-actions`):

```css
/* Slice 39: quiet «Sparat» where Spara utkast was. */
.save-status { align-self: center; color: #78716c; font-size: 0.85rem; white-space: nowrap; }
.save-status-failed { color: #9a3412; }
```

At 390 px the row loses a button, so it gets shorter; check `.more-menu` still sits right.

## 5. Untitled name

`Home.tsx:76`: `{draft.title.trim() || UI.untitledPass}`. `archiveSessionIfNew` → `saveSessionAsTemplate` falls back to `'Mall'` today; pass `old.title.trim() || UI.untitledPass` as title. `UI.untitledPass = 'Nytt pass'` (same text as `createBlankSession`, `session.ts:52`; use the key there too).

## 6. Strings and footer

See `content/microcopy.sv.md`: add `autosaveSaved`, `autosaveFailed`, `autosaveFailedToast`, `untitledPass`; remove `saveDraft`, `savedToast`; change `templateBody`, `oppnaPaTelefonHonesty`.

- `SLICE_NUMBER = '39'` (`blockMeta.ts:111`).
- **Test asserts to update** (they hard-code 38):
  - `app/src/lib/feedback.test.ts:25` `'Version: Slice 38'` → `'Version: Slice 39'`
  - `app/src/lib/feedback.test.ts:45` `SLICE_NUMBER, '38'` → `'39'`
  - `app/src/lib/feedback.test.ts:46` `'Träningsplaneraren · Slice 38'` → `Slice 39`
  - `app/src/lib/clubTemplates.test.ts:316` `'Träningsplaneraren · Slice 38'` → `Slice 39`
  - Run `rg -n "Slice 38'" app/src` for others.
- Verifier smoke scripts that click «Spara utkast» (`verifier/slice-30/31/33/37/38-*.mjs`) will fail on purpose; they are history, not changed by Builder.

## 7. Tests

Unit (`node:test`, stub `localStorage`):
- `trySaveDraft` returns `false` when `setItem` throws (`QuotaExceededError`), `true` otherwise; never throws.
- Replacing a stored pass with ≥1 station and another id archives it once into Mina mallar; same id → no archive; empty old → no archive; second identical replace → no duplicate.
- Archive title falls back to «Nytt pass» for a blank title.
- Hook logic (pure part): skip rule for empty fresh pass vs stored pass.

## 8. Budget (F1)

`cd app && npm run build` on main and branch; sum `gzip -9c` of `dist/assets/*.js` + `*.css`. Soft limit +512 B; estimate +250–450 B. Numbers in the PR.

## Open for Builder

1. Mina mallar is capped at 8: archiving a replaced pass can push out the oldest mall. Accepted risk (same as Ny vecka today); note it in ship notes if seen.
2. Two tabs on the same pass: last write wins. Not handled (out of scope); note only.
3. Confirm `pagehide` flush works on iOS Safari home-screen app (Drive: edit, swipe app away within 1 s, reopen).
