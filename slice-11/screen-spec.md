# Slice 11 — screen spec (Hallöversikt declutter)

## Placeable set

```
placeableItems(session) =
  session items whose activity.blockType === 'techniques'
  (missing activity → treat as not placeable; prune placement)
```

- **Ej placerade tray:** only `placeableItems` without a placement.
- **Canvas anchors:** only placements whose item is still placeable.
- **Placera här / drag:** reject non-placeable ids (should not appear in UI).

## Compact canvas chip

| Element | Canvas | Tray |
|---|---|---|
| Station rank | Yes when placed | No |
| Icon | `item` size | `block` or `item` (≥44px row) |
| Title | Truncated, ~8–10ch preferred / max-width 28% hall | Truncated, readable |
| Duration | Hidden | Optional (keep if space) |
| Erfaren | Short badge | Short badge |
| Remove | Keep (≥44px hit on phone) | N/A |

## Empty states (Swedish seeds in content/)

1. **Pass has items but no Teknik:** explain that only Teknik stations are placed on the hall; link attention back to Passbyggaren.
2. **Teknik exists, all unplaced:** keep “dra till hallen” coaching (updated to say stationer/Teknik).
3. **All Teknik placed:** tray empty message unchanged in spirit.

## Golvklart / print

- Only placed Teknik stations + flow among them.
- Soft banner: count of **unplaced Teknik** only (not warmups).
- Print CSS: compact chips must remain legible (rank + title).

## Implementation hooks (Builder)

- Filter in `getUnplacedItems` / placed list helpers in `lib/hall.ts` (single source of truth).
- Extend prune/migrate to drop non-Teknik placements.
- CSS: `.hall-chip--canvas` compact rules; leave `.hall-chip--tray` usable on phone.
- Update any coach tip that implies “alla övningar” go on the hall (Slice 09 copy) if it contradicts — Docs owns Swedish; Builder wires keys.

## Regression

- Passbyggaren still lists all five blocks.
- Hall presets / snap / zoom / Golvklart chrome unchanged except filter + chip size.
- Experienced Teknik drills still show Erfaren on hall.
