# Hall template — generic truppgymnastik (`generic-trupp`)

Slice 05 ships **one** schematic. Not a club blueprint. Not to scale.

Builder may implement as SVG background, CSS absolute regions, or both. Coordinates below are **normalized 0–1** of the drawable canvas (same space as chip centers).

## Design intent

- Top-down abstract hall rectangle
- Soft zone fills + dashed outlines + short Swedish labels
- Large central open floor for fogis / games / general stations
- Apparatus strips along one long side (typical trupp feel without copying a real club)
- Caption: **Schematisk hall — inte exakt mått**

## Canvas

| Property | Value |
|---|---|
| Template id | `generic-trupp` |
| Aspect | ~16:10 (acceptable 3:2) |
| Outer hall | Full canvas inset ~2–3% margin (walls as light stroke) |
| Floor fill | Neutral warm gray / pale wood tone — calm, not loud |
| Zone fills | Very light tint + 1–2px dashed border |
| Labels | Swedish, small, centered in zone or along edge |

## Zones (bounding boxes)

Rects as `{ x, y, w, h }` in normalized 0–1. Soft overlap with open floor is OK visually; hit-test for soft `zoneId` uses these boxes (first match by priority list below if overlapping).

### Priority for soft zoneId (first hit wins)

1. `trampett`
2. `tumbling`
3. `vault`
4. `mats`
5. `open` (fallback for anything else on floor)

### Zone table

| zoneId | Label | Suggested bbox `{x,y,w,h}` | Visual cue |
|---|---|---|---|
| `open` | Öppen yta | `{0.06, 0.10, 0.55, 0.78}` | Largest pale region; optional faint center mark |
| `trampett` | Trampett | `{0.64, 0.12, 0.28, 0.18}` | Small elongated oval / board glyph + label |
| `tumbling` | Tumbling | `{0.64, 0.34, 0.28, 0.22}` | Long strip suggesting track |
| `vault` | Satsbräda | `{0.64, 0.60, 0.28, 0.14}` | Short runway + small vault table icon (abstract) |
| `mats` | Mattor | `{0.64, 0.78, 0.28, 0.12}` | Stacked rectangle glyph |

ASCII sketch (not to scale):

```
+--------------------------------------------------+
|  HALL (generic trupp)                            |
|  +---------------------------+  +--------------+ |
|  |                           |  |  Trampett    | |
|  |                           |  +--------------+ |
|  |       Öppen yta           |  +--------------+ |
|  |                           |  |  Tumbling    | |
|  |                           |  +--------------+ |
|  |                           |  +--------------+ |
|  |                           |  |  Satsbräda   | |
|  +---------------------------+  +--------------+ |
|                                 +--------------+ |
|                                 |  Mattor      | |
|                                 +--------------+ |
|  Schematisk hall — inte exakt mått               |
+--------------------------------------------------+
```

## Drawing rules for Builder

1. Zones are **regions**, not equipment CAD. Prefer simple shapes over photo-real apparatus.
2. Do not label meters or draw a scale bar.
3. Do not name a real club.
4. Chips float **above** the schematic (higher z-index); schematic is non-interactive except as drop target.
5. Zone labels stay readable when chips overlap — chips may obscure labels temporarily; that is OK.
6. Reuse existing icon language sparingly for zone glyphs (e.g. `jump-board`, `bounce`, `mats-stack` from Slice 04) if helpful; text label is mandatory.
7. Color: zones should not clash with block chip colors — keep zone fills muted (slate/stone), chips carry block amber/sky/violet/rose/green.

## Soft zoneId on drop

When a chip is dropped, if its center `(x,y)` lies inside a zone bbox, set `placement.zoneId` to that zone (priority order above). If outside all specific zones but inside hall, set `open` or leave undefined — **prefer set `open`** when inside the open bbox, else undefined.

No animation, no snap. Chip stays exactly where dropped (clamped).

## Slice 06 preview (do not build now)

Richer zones (mattberg, more trampett detail), snap-to-zone, and hall presets will replace/extend this template later. Keep `zoneId` strings stable so 06 can migrate.

## Acceptance sketch for Verifier

- Five labels visible: Öppen yta, Trampett, Tumbling, Satsbräda, Mattor
- Caption about schematic / not exact measurements visible
- Looks like one hall overview, not five disconnected cards
