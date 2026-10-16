# Slice 42 — Builder handoff

**Status:** LOCKED 2026-10-16. Scope: a new small `app/src/lib/freshPass.ts` (or in `lib/autosave.ts`), `app/src/components/SessionBuilder.tsx`, `app/src/App.tsx` (mark fresh), `app/src/lib/autosave.ts` (`archiveReplacedDraft`), `app/src/data/blockMeta.ts` (`SLICE_NUMBER` only), tests. No CSS, no new component, no new strings.

## What exists today (main @ 1814e50)

- **Tip:** `components/SessionBuilder.tsx:519–527` — `!isTipDismissed(tips, TIP_BUILDER_EMPTY) && (countSessionItems(session) < 1 || showFirstVisitTip)` → `CoachTipStrip` with `UI.tipBuilderEmpty`. `showFirstVisitTip` is `useState(() => !tips.builderFirstVisitSeen)` at `:156`. `countSessionItems` is `lib/hall.ts:182` (counts every item, soft pair included). This is the **only** render site of `tipBuilderEmpty` (`TIP_BUILDER_EMPTY` defined `lib/coachTips.ts:5`; HallBoard uses its own tips).
- **Soft pair:** `lib/session.ts:39` `createBlankSession` puts `gather-narvaro` + `gather-dagens-teknik` in Samling; same pair in `data/wizardPaths.ts:24–25` and `data/seedTemplates.ts:35–36`.
- **Confirm:** picking a mall sets `setPendingTemplateId` / `setPendingSavedId` / `setPendingClub` (`SessionBuilder.tsx:675–683`, also `ClubAdminSection onPick`), which renders `TemplateConfirm` (`:736–772`, component `components/TemplateConfirm.tsx:13`). Confirm runs `handleConfirmTemplate` `:361`, `handleConfirmSaved` `:377`, `handleConfirmClub` `:391` (each calls `armUndo` + `carriedToast = undoToast(true)` from Slice 41).
- **Pass creation:** `App.tsx:164` `goNew` and `:172` `goTemplate` → `createBlankSession()`; `:180` `goWizardFinish` → `composeWizardSession` + `saveDraft`.
- **Auto-copy:** `lib/autosave.ts:14` `archiveReplacedDraft` skips when `countSessionItems(old) < 1` — a stored Tomt pass (2 soft items) **is** copied today.
- **Signature:** `lib/savedTemplates.ts:84` `passSignature(sessionToShare(s))` (blocks, placements, hall; not title/notes).

## 1. Pure helpers (`lib/freshPass.ts`)

```ts
const SOFT = new Set(['gather-narvaro', 'gather-dagens-teknik'])
export const coachStationCount = (s: Session) =>
  s.blocks.reduce((n, b) => n + b.items.filter((i) => !SOFT.has(i.activityId)).length, 0)
export function isEmptyPass(s: Session): boolean {
  const t = s.title.trim()
  return coachStationCount(s) === 0 && (!t || t === UI.untitledPass) && !(s.notes ?? '').trim()
    && s.blocks.every((b) => !(b.coachNote ?? '').trim())
}
const freshSig = (s: Session) => JSON.stringify([passSignature(sessionToShare(s)), s.title, s.notes ?? '', s.blocks.map((b) => b.coachNote ?? '')])
let origin: { id: string; sig: string } | null = null
export function markFresh(s: Session) { origin = { id: s.id, sig: freshSig(s) } }
export function isFreshPass(s: Session): boolean {
  return isEmptyPass(s) || (origin?.id === s.id && origin.sig === freshSig(s))
}
```

Watch the import cycle note in `lib/autosave.ts:1–3`; `freshPass.ts` may import `savedTemplates` and `sharePass`, but `session.ts` must not import it.

## 2. Mark fresh

- `App.tsx` `goNew`, `goTemplate`, `goWizardFinish`: `markFresh(next)` right after creating it.
- `SessionBuilder.tsx` the three confirm handlers: `markFresh(next)` (the `cloned`/`next` that goes to `onChange`, after `autoPlaceUnplaced`).
- Slice 41 `runUndo` restoring a pass: do **not** mark (the restored pass keeps whatever it was; if it was fresh by `origin` it is no longer the latest origin, so it reads as fresh only if empty — fine and conservative).

## 3. Tip (A1)

Replace `:520` with `coachStationCount(session) < 1` and drop `showFirstVisitTip` from the condition. If `showFirstVisitTip` has no other use, remove the state. Do not touch `builderFirstVisitSeen` bookkeeping (`lib/coachTips.ts:185–190`), Kom igång still reads it.

## 4. Skip confirm (B1, C1)

In the pick callbacks: if `isFreshPass(session)`, call the matching confirm handler directly instead of setting the pending state. Easiest: keep setting pending state, and add in each handler path a small helper:

```ts
function pick<T>(set: (v: T) => void, v: T, run: (v: T) => void) { isFreshPass(session) ? run(v) : set(v) }
```

with the handlers taking the template as an argument (refactor `handleConfirm*` to accept it instead of reading `pending*`). Ångra toast and `armUndo` stay as they are, so an accidental mall over a fresh pass can still be undone. `onInitialTemplateConsumed` and `closePanel` must run as in the confirm path. Focus: with no dialog, Slice 41 already moves focus to Ångra (`undoToast(true)`); keep it.

## 5. Auto-copy (D1)

`lib/autosave.ts:18`: replace `countSessionItems(old) < 1` with `isFreshPass(old)`. `old` comes from `loadDraft()`, so the `origin` comparison works by id + signature. Slice 41 `skipArchiveOnce` unchanged. After this, `countSessionItems` import in `autosave.ts` stays for `shouldAutosave` (E1 of Slice 39 is unchanged).

## 6. Slice bump

- `app/src/data/blockMeta.ts:111` `SLICE_NUMBER = '41'` → `'42'`.
- Test asserts (confirmed on main @ 1814e50):
  - `app/src/lib/feedback.test.ts:25` `'Version: Slice 41'` → `'Version: Slice 42'`
  - `app/src/lib/feedback.test.ts:45` `assert.equal(SLICE_NUMBER, '41')` → `'42'`
  - `app/src/lib/feedback.test.ts:46` `'Träningsplaneraren · Slice 41'` → `Slice 42`
  - `app/src/lib/clubTemplates.test.ts:316` `'Träningsplaneraren · Slice 41'` → `Slice 42`

## 7. Tests (suggested)

- `freshPass.test.ts`: blank → empty + fresh; add one bank station → not empty, not fresh; title typed → not empty, not fresh, coach stations 0; mall clone marked → fresh; change one minute → not fresh; remove a soft item → still empty (soft items do not count).
- `autosave.test.ts`: stored blank pass replaced by a mall → Mina mallar count unchanged; stored edited pass → +1 (Slice 39 behaviour kept); stored untouched mall pass (marked) → no copy.

## 8. Bundle (F1)

Estimate +150–250 B gz (helpers ~100, pick wiring ~60, mark calls ~30). Measure as in Slice 41 AC21 (sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, main vs branch).

## Deviations allowed

None without Planner. If the handler refactor in §4 gets larger than expected, report it rather than adding a second code path.
