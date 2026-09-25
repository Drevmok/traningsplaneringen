# Data model — Slice 05 (hall placements)

Extends Slice 01 `Session` / `SessionItem`. Does **not** change Activity library shape.

## Audit summary (current, pre–Slice 05)

- `Session` = id, title, date?, totalMinutes (computed), notes, basedOnTemplateId?, blocks[]
- `SessionBlock` = id, type, title, durationMinutes (budget), items[], coachNote
- `SessionItem` = id, activityId, durationMinutes, note, order
- Persist: `localStorage['gymnastics-planner-draft-v1']` via `saveDraft` / `loadDraft` in `app/src/lib/session.ts`
- Item identity for hall = **`SessionItem.id`** (stable while the item stays on the pass)

## New types

### HallZoneId

```ts
export type HallZoneId =
  | 'open'
  | 'trampett'
  | 'tumbling'
  | 'vault'
  | 'mats'
```

Swedish labels (UI only — ids stay English enums like block types):

| Id | Label |
|---|---|
| `open` | Öppen yta |
| `trampett` | Trampett |
| `tumbling` | Tumbling |
| `vault` | Satsbräda |
| `mats` | Mattor |

### HallTemplateId

```ts
export type HallTemplateId = 'generic-trupp'
```

Only one template in Slice 05. Slice 06 may extend the union.

### HallPlacement

```ts
export interface HallPlacement {
  /** SessionItem.id — instance on this pass */
  sessionItemId: string
  /** Normalized 0–1, chip center relative to canvas width */
  x: number
  /** Normalized 0–1, chip center relative to canvas height */
  y: number
  /** Soft tag when center was inside a zone bbox at last drop; optional */
  zoneId?: HallZoneId
}
```

**Rules:**

- `x` and `y` clamped to `[0, 1]` on write.
- At most **one** placement per `sessionItemId`.
- Absence of a placement ⇒ item is **unplaced** (shown in tray).
- `zoneId` is best-effort metadata for Slice 05/06; UI must not require it to render a chip on canvas.

## Session extension

```ts
export interface Session {
  id: string
  title: string
  date?: string
  totalMinutes: number
  notes: string
  basedOnTemplateId?: string
  blocks: SessionBlock[]
  /** Slice 05+ */
  hallTemplateId?: HallTemplateId
  hallPlacements?: HallPlacement[]
}
```

Defaults when missing:

- `hallTemplateId` → treat as `'generic-trupp'`
- `hallPlacements` → treat as `[]` (all items unplaced)

## Derived helpers (Builder)

Suggested pure helpers in `lib/session.ts` or `lib/hall.ts` (names flexible):

| Helper | Behavior |
|---|---|
| `listSessionItems(session)` | Flatten blocks → items in block order, then item.order |
| `getUnplacedItems(session)` | Items with no matching `hallPlacements` entry |
| `getPlacement(session, sessionItemId)` | Placement or undefined |
| `upsertPlacement(session, placement)` | Replace/add by sessionItemId; clamp x,y; recompute total unchanged |
| `removePlacement(session, sessionItemId)` | Drop placement only |
| `pruneHallPlacements(session)` | Remove placements whose sessionItemId is not on the pass |
| `clearHallPlacements(session)` | Set `hallPlacements` to `[]` (template replace) |

Always run `pruneHallPlacements` after `removeItem` / moves that recreate ids / template clone.

## Lifecycle

| Event | Hall effect |
|---|---|
| Add activity to pass | No placement (tray) |
| Remove item from pass | Prune that placement |
| Move item within/across blocks | Keep placement (same `SessionItem.id`) — **except** `moveItemToBlock` today recreates id via `uid('item')`; if that remains, prune old + treat as unplaced. Prefer keeping id if Builder can do so without breaking Slice 01 tests; otherwise prune is correct. |
| Template confirm replace | `clearHallPlacements` + new item ids |
| Blank session | Empty placements |
| Load old draft (no hall fields) | Migrate in memory: `hallPlacements = []`, `hallTemplateId = 'generic-trupp'` |

### Note on `moveItemToBlock`

Current `moveItemToBlock` assigns a **new** `SessionItem.id`. For Slice 05:

- **Preferred:** keep the same `id` when moving across blocks so hall position survives.
- **Acceptable fallback:** keep current new-id behavior and prune; item returns to tray. Document in Builder PR if fallback chosen.

## Migration of old drafts

1. Keep storage key `gymnastics-planner-draft-v1`.
2. On `loadDraft`, after JSON parse:
   - If `hallPlacements` missing or not an array → `[]`
   - Filter out entries missing `sessionItemId` or non-finite x/y
   - Clamp x,y to `[0, 1]`
   - Drop unknown `zoneId` values (or set undefined)
   - If `hallTemplateId` missing or unknown → `'generic-trupp'`
3. Call `pruneHallPlacements` against current blocks.
4. No bump to `v2` storage key required for additive fields.

## What we do not store in Slice 05

- Snap offsets, grid cells, station order, flow edges
- Absolute pixel positions
- Per-zone capacity / equipment counts
- Multiple hall templates per draft
- Print layout settings

## Type file touchpoints

- `app/src/types.ts` — add `HallZoneId`, `HallTemplateId`, `HallPlacement`; extend `Session`
- `app/src/lib/session.ts` — migrate on load; prune on remove/template; optional hall helpers
- UI chrome strings in `blockMeta.ts` `UI` — add Hallöversikt and empty-state keys (Docs may supply final copy)
