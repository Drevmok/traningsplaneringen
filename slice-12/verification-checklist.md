# Slice 12 — verification checklist

**Authority after approval.** Overall PASS only if all locked rules pass.

## Locked rules

| # | Rule | Pass if |
|---|---|---|
| 1 | Visual markers | Placed canvas tiles are icon-first markers, not wide text cards |
| 2 | Tap → detail | Tap placed tile opens station detail with correct activity |
| 3 | Drag ≠ detail | Drag-reposition does not open detail on drop |
| 4 | Erfaren | Experienced Teknik station still marked on tile + in detail |
| 5 | Teknik-only | Slice 11 filter/prune unchanged |
| 6 | Tray usable | Unplaced tray still placeable on phone (~390px) |
| 7 | Golvklart | Markers + ranks readable; flow still Teknik-only |
| 8 | Detail read-only | No add-to-pass from hall detail |
| 9 | Footer | Träningsplaneraren · Slice 12 |
| 10 | Scope | No equipment composition / CAD / new placeable blocks |

## Smoke path

1. Pass with ≥2 Teknik + other blocks → hall tray Teknik only.
2. Place two stations → markers compact/icon-led with ranks.
3. Tap one → detail; close → still placed.
4. Drag one → moves; detail does not pop from that drag.
5. Golvklart + phone tray smoke.
6. `npm run build` green.

## Non-blocking

- Netlify republish only if Christoffer asks.
