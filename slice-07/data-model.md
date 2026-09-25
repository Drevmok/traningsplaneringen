# Data model — Slice 07 (flow, mode, print)

Extends Slice 05–06 hall types. Does **not** change Activity library, snap/preset rules, or Passbyggaren block editing beyond hall UI.

**Status:** APPROVED by Christoffer 2026-09-24

## Audit summary (live Slice 06)

- `Session`: `hallTemplateId?`, `hallPlacements?` — **no** `hallShowFlow` yet
- `HallPlacement` = `{ sessionItemId, x, y, zoneId? }` — unchanged for 07
- `listSessionItems(session)` walks `session.blocks` then sorts each block’s items by `order`
- Persist: `localStorage['gymnastics-planner-draft-v1']`
- UI: `HallBoard` / `HallCanvas` / `HallChip`; no station badges, no flow SVG, no Golvklart mode

## Session fields

```ts
export interface Session {
  // … existing fields …
  hallTemplateId?: HallTemplateId
  hallPlacements?: HallPlacement[]
  /** Slice 07 — show flow connectors between placed stations. Default true when absent. */
  hallShowFlow?: boolean
}
```

| Field | Persist? | Default | Notes |
|---|---|---|---|
| `hallShowFlow` | Yes (optional) | `true` if missing | Toggle **Visa flöde** / **Dölj flöde** |
| `hallMode` | **No** | always `'edit'` on open | UI-only on hall view |
| placements / template | Yes | unchanged | Slice 06 rules |

### HallPlacement

**Unchanged.** No station-number or edge fields stored — numbers and flow are **computed** from pass order + current placements.

### Storage

- Key remains **`gymnastics-planner-draft-v1`**.
- Additive field only; old drafts load with `hallShowFlow === undefined` → treat as `true`.
- No storage key bump.

## UI-only state (not on Session)

```ts
type HallMode = 'edit' | 'floor'

// On HallBoard (or App hall view):
hallMode: HallMode  // default 'edit'; never written to draft
viewZoom?: number   // phone zoom factor, e.g. 1–2; not persisted; does not alter x,y
```

Leaving hall or reload → always `edit`. **Avsluta golvklart** sets `hallMode = 'edit'`.

## Flow / station-number algorithm

### Pass order (stationsordning source)

```
passOrder(session): SessionItem[] =
  for blockType in BLOCK_ORDER:           // gathering → … → fun_and_games
    block = session.blocks.find(type)
    yield items sorted by item.order asc
```

Equivalent to existing `listSessionItems` **if** `session.blocks` stay in `BLOCK_ORDER` (locked). Builder should sort by `BLOCK_ORDER` explicitly when computing station ranks so accidental block array order cannot scramble numbers.

### Placed subsequence + badges

```
stationRanks(session): Map<sessionItemId, number>  // 1-based
  placedIds = set of hallPlacements.sessionItemId
  n = 0
  for item in passOrder(session):
    if item.id in placedIds:
      n += 1
      ranks[item.id] = n
  return ranks
```

- Badge on canvas chip = `ranks.get(itemId)` when placed.
- Tray / unplaced → no badge.
- N = count of placed items; badges are **1…N contiguous in pass order among placed**, even if spatial positions are scattered.

### Flow segments

```
flowSegments(session): Array<{ fromId, toId, x1,y1,x2,y2 }>
  orderedPlaced = passOrder filtered to placed, each with placement (x,y)
  if orderedPlaced.length < 2 or hallShowFlow === false: return []
  for i in 0 .. length-2:
    emit segment from orderedPlaced[i].center → orderedPlaced[i+1].center
```

Render as muted dashed SVG/CSS polyline (or one path per segment) above schematic, below or above chips (Builder: chips should remain tappable — prefer lines under chip hit targets or `pointer-events: none` on flow layer).

### Toggle persistence

```
setShowFlow(session, on: boolean):
  session.hallShowFlow = on
  saveDraft(session)
```

If UI-only for PASS: remember in component state for the hall visit; next open defaults ON.

## Golvklart / print (no new persisted model)

| Concern | Model |
|---|---|
| Enter Golvklart | `hallMode = 'floor'` |
| Exit | `hallMode = 'edit'` |
| Unplaced banner | `unplacedCount = getUnplacedItems(session).length` → show if > 0 |
| Duration summary | Prefer `session.totalMinutes` (item-sum total already maintained) |
| Print | `window.print()`; `@media print` CSS only — no blob/PDF types |

Print CSS should:

- Hide: app nav, back-to-builder chrome if desired (title stays), tray, edit toggles, Golvklart exit/print buttons themselves optional hide-on-print.
- Show: session title, schematic, zone labels, placed chips + numbers, flow if on, caption, optional duration.
- Prefer `@page { size: A4 landscape; }` and reasonable margins.

## Migration

On `loadDraft` / migrate:

1. Keep key `gymnastics-planner-draft-v1`.
2. If `hallShowFlow` missing → runtime default `true` (may omit writing until user toggles).
3. Ignore unknown fields; do not invent placement extras.
4. Slice 06 template alias / zone sanitize unchanged.
5. Never persist `hallMode`.

## Lifecycle (hall + flow)

| Event | Effect |
|---|---|
| Place / remove / move | Recompute ranks + flow; persist placements as today |
| Toggle Visa flöde | Update `hallShowFlow` (+ save if persisting) |
| Enter / exit Golvklart | UI only |
| Preset switch | Slice 06 remap; ranks follow same item ids |
| Template replace | Clear placements (05/06); flow empty until re-place |
| Remove pass item | Prune placement; renumber remaining placed |
| Reorder in Passbyggaren | Ranks / flow update on next hall render (no hall mutation) |

## What we still do not store

- Flow edge list / station number on `HallPlacement`
- Print layout blobs / PDF
- Absolute pixels / meters
- Zoom level
- `hallMode`
- Share links / multi-user state

## Type / file touchpoints (Builder guidance — do not edit app from this pack)

- `app/src/types.ts` — optional `hallShowFlow?: boolean`
- `app/src/lib/hall.ts` — `stationRanks`, `flowSegments`, `passOrder` helpers (names flexible)
- `app/src/data/blockMeta.ts` — Golvklart / flow / print UI strings
- `HallBoard` / `HallCanvas` / `HallChip` — badges, flow layer, mode, sticky tray, zoom, print CSS in `App.css`
