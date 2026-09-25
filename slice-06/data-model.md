# Data model — Slice 06 (presets, zones, snap, migration)

Extends Slice 05 hall types. Does **not** change Activity library or Passbyggaren block editing beyond hall UI.

## Audit summary (live Slice 05)

- `HallZoneId` = `'open' | 'trampett' | 'tumbling' | 'vault' | 'mats'`
- `HallTemplateId` = `'generic-trupp'`
- `HallPlacement` = `{ sessionItemId, x, y, zoneId? }` — chip center normalized 0–1
- Persist: `localStorage['gymnastics-planner-draft-v1']`
- Soft `resolveZoneId` on drop; **no snap**
- `migrateHallFields` only accepts `generic-trupp`; unknown → default

## Updated types

### HallZoneId

```ts
export type HallZoneId =
  | 'open'
  | 'trampett'
  | 'tumbling'
  | 'vault'
  | 'mattberg' // NEW Slice 06
  | 'mats'
```

| Id | Label |
|---|---|
| `open` | Öppen yta |
| `trampett` | Trampett |
| `tumbling` | Tumbling |
| `vault` | Satsbräda |
| `mattberg` | Mattberg |
| `mats` | Mattor |

### HallTemplateId (presets)

```ts
export type HallTemplateId =
  | 'standard-trupp'
  | 'tavling-linjer'
  | 'liten-hall'

/** Legacy Slice 05 id — migrate on load only; do not write anew */
export type LegacyHallTemplateId = 'generic-trupp'
```

| Id | Swedish UI label |
|---|---|
| `standard-trupp` | Standard trupp |
| `tavling-linjer` | Tävling / linjer |
| `liten-hall` | Liten hall |

`DEFAULT_HALL_TEMPLATE = 'standard-trupp'`.

### HallPlacement (unchanged shape)

```ts
export interface HallPlacement {
  sessionItemId: string
  x: number // chip center, clamped [0, 1]
  y: number
  zoneId?: HallZoneId
}
```

**No new required fields for snap.** Snap is a write-time behavior: `upsertPlacement` / `placeAt` compute snapped `(x,y)` before persist.

### Session (unchanged keys)

```ts
hallTemplateId?: HallTemplateId  // now one of three presets
hallPlacements?: HallPlacement[]
```

## Preset definition (code data, not on Session)

Builder should hold a static map (e.g. `HALL_PRESETS` in `lib/hall.ts` or `data/hallPresets.ts`):

```ts
export interface HallZoneDef {
  id: HallZoneId
  label: string // Swedish
  bbox: { x: number; y: number; w: number; h: number }
  /** Chip-center snap target; omit or unused for `open` (free place) */
  snap?: { x: number; y: number }
  /** If true, drops inside bbox snap to snap point (default: id !== 'open') */
  snaps?: boolean
}

export interface HallPreset {
  id: HallTemplateId
  label: string // Swedish
  aspect?: '16:10' | '3:2'
  zones: HallZoneDef[]
  /** Hit-test priority: first match wins (apparatus before open) */
  zonePriority: HallZoneId[]
}
```

Canonical bboxes / snaps: [`hall-presets.md`](./hall-presets.md).

### Recommended zonePriority (all presets)

1. trampett  
2. tumbling  
3. vault  
4. mattberg  
5. mats  
6. open  

Apparatus before open so overlapping soft edges prefer equipment.

## Snap helpers (Builder)

Suggested pure functions (names flexible):

| Helper | Behavior |
|---|---|
| `getPreset(id)` | Resolve preset; alias `generic-trupp` → `standard-trupp` |
| `resolveZoneId(preset, x, y)` | Priority hit-test against that preset’s bboxes |
| `snapPlacement(preset, x, y, occupied?)` | If hit zone has snaps≠false and id≠`open`, return snap slot (+ multi-chip offset); else return `{x,y}` clamped; always attach resolved `zoneId` when inside a bbox |
| `upsertPlacement` | Call snap helper when writing from UI drops |
| `applyPreset(session, nextId)` | Set `hallTemplateId`; remap placements per rules below; save |
| `migrateHallFields` | Alias template id; expand known zones; prune; clamp |

### Multi-chip offset (guidance)

When N chips already occupy the same `zoneId` after remapping or dropping:

- Base = zone `snap` point
- Offset ≈ `(i % 3) * 0.035` in x and `Math.floor(i / 3) * 0.04` in y (Builder may tune)
- Clamp final center to canvas and preferably keep inside zone bbox

## Migration from Slice 05 drafts

On `loadDraft` / `migrateHallFields`:

1. Keep key `gymnastics-planner-draft-v1`.
2. **Template alias:** if `hallTemplateId` is missing, unknown, or `'generic-trupp'` → `'standard-trupp'`.
3. Sanitize placements: require `sessionItemId` + finite x,y; clamp; drop duplicate ids.
4. **zoneId:** keep if in the six-id set; drop unknown strings (leave undefined, then optionally re-resolve from x,y against **current** preset).
5. Do **not** auto-snap existing free positions on load (avoid surprising jumps). Snap applies on **next** drop/move or on **explicit preset switch**.
6. `pruneHallPlacements` as today.
7. No storage key bump.

### Preset switch algorithm

```
applyPreset(session, nextId):
  preset = getPreset(nextId)
  for each placement p:
    if p.zoneId in preset.zones and zone.snaps:
      (x,y) = snap slot for zone (+ offset by how many already remapped to that zone)
      zoneId = p.zoneId
    else:
      (x,y) = clamp(p.x, p.y)
      zoneId = resolveZoneId(preset, x, y)  // may be open / undefined
  session.hallTemplateId = nextId
  session.hallPlacements = remapped
  saveDraft
```

Chips never forced back to tray by preset change.

### Lifecycle (unchanged + preset)

| Event | Hall effect |
|---|---|
| Add activity | Unplaced (tray) |
| Remove item | Prune placement |
| Cross-block move | Keep placement (Slice 05 preferred: same SessionItem.id) |
| Template replace | `clearHallPlacements` |
| Change hall preset | Remap as above; persist `hallTemplateId` |
| Load Slice 05 draft | Alias `generic-trupp` → `standard-trupp`; keep x,y |

## What we still do not store

- Flow edges / station order (→ 07)
- Print layout
- Absolute pixels / meters
- Per-zone capacity hard limits
- Snap animation state

## Type / file touchpoints

- `app/src/types.ts` — extend `HallZoneId`, `HallTemplateId`
- `app/src/lib/hall.ts` — presets, snap, migrate alias, `applyPreset`
- `app/src/data/blockMeta.ts` / Docs — preset picker + snap hint strings
- `HallBoard` / `HallCanvas` — render active preset zones; picker UI
