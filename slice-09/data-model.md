# Slice 09 — data model (tips & checklist)

**Status:** **APPROVED by Christoffer 2026-09-24**
**Does not change** Session / hall placement schema from Slices 01–08 except optional non-breaking additive tips storage.

## 1. Storage keys

| Key | Role |
|---|---|
| `gymnastics-planner-draft-v1` | Existing session draft (unchanged contract). |
| `gymnastics-planner-tips-v1` | **Preferred** tips/checklist dismiss + progress map. |

**Allowed alternative:** nest a `coachTips` object inside or adjacent to the draft save path **only if** load/save remains backward compatible (old drafts without `coachTips` still load; missing fields default). Prefer the dedicated tips key so clearing tips never risks draft corruption.

## 2. Tips document shape (`gymnastics-planner-tips-v1`)

```ts
type CoachTipsStateV1 = {
  version: 1
  /** ISO timestamp of last write (optional, debugging) */
  updatedAt?: string
  /** Kom igång card dismissed forever */
  checklistDismissed: boolean
  /** Per checklist step completion */
  checklist: {
    chooseOrBuildPass: boolean
    addActivities: boolean
    openHallAndPlace: boolean
    useGolvklart: boolean
  }
  /** tipId → dismissed forever */
  dismissed: Record<string, boolean>
  /** If true, treat all dismissed as false until next per-tip dismiss (Visa tips igen) */
  showTipsAgain?: boolean
}
```

Defaults when key missing:

- `checklistDismissed: false`
- all `checklist.*: false` (Builder may auto-set from draft heuristics — see below)
- `dismissed: {}`
- `showTipsAgain` absent/false

**Visa tips igen:** set `dismissed` to `{}`, `checklistDismissed` to `false`, and optionally set `showTipsAgain: true` then clear it after tips reappear once — Builder choice as long as tips and checklist become visible again.

## 3. Tip ids (stable strings)

| tipId | Surface | Required? |
|---|---|---|
| `kom-igang` | Kom igång card (Home / empty builder) | Yes (card; dismiss flag is `checklistDismissed`) |
| `tip-builder-empty` | Passbyggaren empty / first visit | Yes |
| `tip-hall-place` | Hallöversikt — placement / zones | Yes |
| `tip-hall-flow-golvklart` | Hallöversikt — flow / Golvklart | Yes |
| `tip-experienced-safety` | Erfaren context | Optional |

Do not rename ids after ship without a migration note; treat as stable for dismiss persistence.

## 4. Checklist auto-progress heuristics (optional but recommended)

| Step key | Mark done when |
|---|---|
| `chooseOrBuildPass` | Draft exists **or** user opened Passbyggaren from Home Nytt/mall/Fortsätt |
| `addActivities` | `session.blocks` have ≥1 item total |
| `openHallAndPlace` | `hallPlacements` has ≥1 entry **or** user opened Hallöversikt at least once (local flag `openedHall` allowed inside tips state) |
| `useGolvklart` | User entered Golvklart at least once (local flag `openedGolvklart` in tips state) |

Manual “mark done” on the checklist row is optional; auto-detect is enough if reliable.

Extra optional flags on tips state (not shown in UI):

```ts
openedHall?: boolean
openedGolvklart?: boolean
builderFirstVisitSeen?: boolean
```

## 5. Relationship to Session draft

- Tips state **must not** be required to load a draft.
- Session fields (`hallPlacements`, `hallPresetId`, `hallShowFlow`, items, orders) unchanged.
- Do **not** store tip dismissals only in React state — must survive reload.
- Do **not** put tip UI chrome into printed Golvklart / print CSS (hide tips in print like other edit chrome).

## 6. UI string keys (Builder / Docs)

Suggested keys for `blockMeta` / chrome (Docs finalizes in `content/coach-tips.sv.md`):

- `komIgangTitle`, `komIgangIntro`
- `komIgangStep1` … `komIgangStep4` (+ optional `komIgangStepDone` affordance)
- `komIgangDismiss`, `komIgangShowAgain` / `visaTipsIgen`
- `tipBuilderEmpty`, `tipHallPlace`, `tipHallFlowGolvklart`, `tipExperiencedSafety`
- `tipDismiss`, `tipInfoAria` (for “i” button)

Reuse existing: `hallCoachTip`, `hallFloorCoachTip`, `hallSnapHint`, `topBarHelp`, `EMPTY_TIPS`, `TIPS_TAB` — do not delete.

## 7. Non-goals in data

- No sync, no user id, no analytics events required for Slice 09.
- No change to activity seed schema or `experiencedCoach` flags.
- No new App routes required (inline card + strips; optional hash/query not needed).
