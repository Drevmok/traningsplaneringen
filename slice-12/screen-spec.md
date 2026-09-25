# Slice 12 — screen spec

## Canvas placed tile (marker)

- Shape: compact square/rounded marker, footprint clearly smaller than a text chip row; aim for icon-led ~44–56px touch target minimum on phone.
- Content: visual icon (activity `visualKey`) + rank badge; Erfaren mark if needed.
- Title: not required on-canvas; if shown, single truncated line secondary to icon.
- Selected/focus: visible ring for a11y without looking like a card again.

## Interactions

| Gesture | Placed on canvas | Unplaced in tray |
|---|---|---|
| Tap | Open detail | Phone: toggle place-mode (existing); desktop: may open detail or start drag per Builder judgment — prefer not breaking Placera här |
| Drag | Reposition / return to tray | Place on hall |
| Detail close | Back to hall; same placements | — |

Drag vs tap: use existing movement threshold / pointer logic; document in ship notes if adjusted.

## Detail sheet

- Reuse `ActivityDetail` readOnly (or thin hall wrapper).
- Shows station name, visual, duration, how-to, watch-for, Erfaren warning when applicable.
- No add-to-pass actions from hall.

## Golvklart / print

- Markers remain; ranks visible.
- Print: if icon-only fails readability, allow short title under/ beside icon for print CSS only.

## Tips / copy

- Optional one-line hint near hall: stations are markers; tap for details (Docs seeds).
- Update hall tip if it still describes “cards” / full titles on the floor.

## Implementation hooks

- `HallChip` canvas variant → marker layout (or `HallStationMarker` used on canvas only).
- Keep tray variant for unplaced.
- `HallBoard` / `HallCanvas`: ensure tap-on-placed → `openDetail`; suppress detail after drag.
- CSS in `App.css` for marker size; preserve Slice 11 Teknik filter in `lib/hall.ts`.
