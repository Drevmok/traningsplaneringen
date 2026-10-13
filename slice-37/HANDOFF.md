# Slice 37 — HANDOFF (Builder)

Locks: [`README.md`](./README.md). Follow `backlog/PSTACK-OPS.md` (Builder minimum bar). Small slice; self-smoke the three apply paths with the verify skill Drive recipe at 390×844.

## 1. What exists today (read from `main` @ `c6a11d5`)

| Piece | Where | Notes |
|---|---|---|
| Helper | `app/src/lib/hallSuggest.ts` : `autoPlaceUnplaced(session)` → `autoPlaceItems` | Places every unplaced Teknik item (`placeableItems`, `lib/hall.ts`) in `suggestZoneId` (saved redskap → drill förslag → tags → `open`), next free slot via `pointInZone`. Keeps existing placements. Returns the same object when nothing changes. Pure. |
| Wizard call site | `app/src/lib/wizard.ts` : `composeWizardSession` | `session = autoPlaceUnplaced(session)` then `withComputedTotal`. **No toast** for this on finish. |
| Hall open fallback | `app/src/components/HallBoard.tsx` : `HallBoard` effect | When Hallöversikt opens with 0 placements and ≥ 1 Teknik, it already calls `autoPlaceUnplaced` and `saveDraft`. So today mall passes get markers *when the hall is opened*; this slice moves that to apply time. Leave the effect as is. |
| Add drill | `SessionBuilder.tsx` : `handleAddFromDetail` | Uses `autoPlaceItems` for newly added items (unchanged). |
| Built-in mall | `SessionBuilder.tsx` : `handleConfirmTemplate` → `lib/session.ts` : `cloneTemplate` | `cloneTemplate` returns `clearHallPlacements(...)` with `hallTemplateId: DEFAULT_HALL_TEMPLATE`. Not saved with `adoptAsDraft`; goes through `onChange`. |
| Egen mall | `SessionBuilder.tsx` : `handleConfirmSaved` → `lib/savedTemplates.ts` : `savedTemplateToSession` → `adoptAsDraft` (`lib/session.ts`) | Keeps the mall's saved `hallPlacements` and hall template. |
| Föreningsmall | `SessionBuilder.tsx` : `handleConfirmClub` → `lib/clubTemplates.ts` : `clubTemplateToSession` → `adoptAsDraft` | `clubTemplateToSession` strips placements (`hallPlacements: []` + `clearHallPlacements`) — Slice 36 E1. Toast via module `carriedToast = UI.clubTemplateApplied` (rides across the remount). Confirm shows `note={UI.clubTemplatePlacementsNote}`. |
| Locks | `lib/hall.ts` : `isPlaceableItem` (Teknik only), `pruneHallPlacements`, `normalizeTemplateId` | `autoPlaceItems` only touches `placeableItems` and keeps `hallTemplateId` (normalized). |
| Footer | `app/src/data/blockMeta.ts` : `SLICE_NUMBER = '36'`, `UI.footerSliceLabel` = `` `Träningsplaneraren · Slice ${SLICE_NUMBER}` `` | Also feeds the Tyck till version line (`lib/feedback.ts`). Tests assert it: `lib/feedback.test.ts`, `lib/clubTemplates.test.ts`. |

## 2. Change (A1, E1)

In `SessionBuilder.tsx`, import `autoPlaceUnplaced` next to `autoPlaceItems` and wrap the new session in each handler:

```ts
// handleConfirmTemplate
const cloned = autoPlaceUnplaced(cloneTemplate(pendingTemplate))
// handleConfirmSaved
const next = adoptAsDraft(autoPlaceUnplaced(savedTemplateToSession(pendingSaved)))
// handleConfirmClub
const next = adoptAsDraft(autoPlaceUnplaced(clubTemplateToSession(pendingClub)))
```

- Place **before** `adoptAsDraft` so the saved draft already has the markers (`adoptAsDraft` calls `saveDraft`). Built-in path: `onChange` as today (App persists as before; check the draft holds placements after reload — AC8).
- `clubTemplateToSession` stays as is: club data must keep having no placements (Slice 36 AC on payload/DB). Placing happens after it.
- Do not touch `lib/hallSuggest.ts`, `HallBoard`'s effect, or **Använd alla förslag** code.
- Alternative (equal): put the call inside `cloneTemplate` / a small `applyMall` wrapper. Keep it in one place per path; don't call it twice.

## 3. B1

Markers from apply are ordinary placements: drag, Placera här, remove and undo work unchanged. Because the pass now has placements, `HallBoard`'s "suggest once when empty" effect will not re-place markers the coach removes later — same rule as today.

## 4. Strings (C1) — no new text

Both Slice 36 strings say the coach places stations, which is no longer true.

| Key | Now | Slice 37 |
|---|---|---|
| `clubTemplateApplied` | Mallen är i Passbyggaren. Placera stationerna i Hallöversikt när du vill. | **Mallen är i Passbyggaren.** |
| `clubTemplatePlacementsNote` | Stationerna placerar du själv i Hallöversikt. | **Remove** the `note=` prop in the club `TemplateConfirm` and delete the key (or leave the key unused only if a test needs it — prefer delete + update test). |

Built-in and Egen mall get no toast (as today). Update `docs/foreningens-mallar.sv.md` is done in this docs branch.

## 5. D1 — open item for Planner

`autoPlaceItems` always places every Teknik item: no redskap falls back to tags and then `open`, and `pointInZone` always returns a point (falls back to `open`, then `{0.4, 0.45}`). Neither "no redskap" nor "no free spot" leaves a marker unplaced today, and the wizard behaves the same.

Builder: **call the helper unchanged** (A1 "same way as the wizard"); add no filter. D1 is then met trivially (nothing extra, nothing loud). If Planner wants drills without any redskap to stay off the hall, that is a helper change that also changes the wizard and the HallBoard fallback; needs a new lock, not this slice.

## 6. Footer

`SLICE_NUMBER = '37'` → footer «Träningsplaneraren · Slice 37» and Tyck till «Version: Slice 37». Update the two test asserts.

## 7. Tests (`node --test`)

- New, next to `hallSuggest.test.ts` (pure, no DOM): built-in mall via `cloneTemplate` + `autoPlaceUnplaced` → every Teknik item placed, non-Teknik not, `hallTemplateId` unchanged; a club mall via `clubTemplateToSession` + helper → placed; `clubPayload` still has no `hallPlacements`; an Egen mall with one saved placement keeps its x/y and only the rest are added.
- Update footer asserts to 37; string test for the shorter toast if one exists.

## 8. Bundle (F1)

Measure like Slice 34–36: `npm ci && npm run build` on `main` @ `c6a11d5` and on the branch, sum `gzip -9c` over `dist/assets/*.js` + `*.css`. Limit +512 B gz total (soft).

Estimate: **net −20 to +120 B**. Three call sites + one named import (~40–80 B); the helper is already in the eager bundle (wizard, HallBoard). Shorter toast and dropped note string save ~60–80 B. Overrun is unlikely; if it happens, explain it in ship notes, don't cut a path.

## 9. Ship notes

`app/SLICE37-SHIPPED.md`: the three handlers changed, strings changed, bundle before/after, deviations (or "none"). Don't ping Verifier; Planner does.
