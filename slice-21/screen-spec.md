# Slice 21 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-26** — behavior follows locked A1/B1/C1/D1/E1/F1.  
**Viewport focus:** Phone ~390px width (≤768px sticky/collapse rules). Desktop: pinch optional; +/− and existing layout remain.

## 1) Pinch-zoom (locked A1)

```
Hallöversikt edit OR Golvklart
  Two-finger pinch on canvas → change viewZoom
  Clamp same as +/− today: ZOOM_MIN (1) … ZOOM_MAX (2)
  Stored placement x,y unchanged (view-only scale)
  +/− buttons remain visible (hall-zoom-bar); same clamp; ≥44px
  After zoom + reload: placements at same normalized coords
```

**Phone required.** Desktop pinch optional; must not break mouse +/−.

**Strings:** Existing `hallZoom` / `hallZoomIn` / `hallZoomOut` stay. No new required chrome label for pinch itself.

## 2) Collapsible sticky tray — edit only (locked B1)

```
Phone ≤768px, hallMode = edit, unplaced tray present
  Default: tray COLLAPSED (canvas needs space)
    Compact bar:
      - Unplaced count (reuse hallUnplacedStations / count)
      - Expand control ≥44×44px (draft: "Visa stationsbricka")
    Canvas wrap uses reduced --hall-tray-reserved (compact bar height, not ~14rem full tray)
  Expanded:
      - Today's sticky tray (title, hints, chips, Placera här / drag)
      - Collapse control ≥44px (draft: "Dölj bricka")
  Placera här: works when tray expanded (tap chip → tap canvas) — unchanged when expanded
  Drag-from-tray: available when expanded — unchanged

Golvklart / floor:
  Edit tray fully hidden (Slice 07) — no collapse/expand chrome
```

Desktop (>768px): no required collapse behavior.

## 3) Pan while zoomed (locked C1)

```
When viewZoom > 1 (and generally when panning the zoomed view):
  One-finger on empty canvas / background → pan the view
  One-finger on markör → drag moves marker (edit); does NOT pan the canvas
  Two-finger pinch → zoom (not pan)
  Pan gesture must NOT open detail
  Short tap on markör (no drag) → detail (edit + Golvklart) — unchanged
  +/− still zoom; after zoomOut to 1, pan/scroll remains usable
```

**Gesture priority (phone):** pinch → zoom; chip contact → drag; empty one-finger move → pan; empty/chip short tap → place-mode / detail as today.

## 4) Controls that must still work

| Control | Behavior |
|---|---|
| Placera här | When tray **expanded**: tap unplaced chip → tap canvas → place/snap |
| Canvas remove | Edit only; ≥44px hit (Slice 20) — no regression |
| Tap ≠ drag | Tap markör → detail; drag moves without treating as tap-open |
| Golvklart enter/exit | Unchanged; tray hidden in floor |
| Caption | **Schematisk hall — inte exakt mått** (or locked wording) unchanged |
| Redigera redskap / Använd alla / Förråd | No behavior change |

## Surfaces that must not change

| Surface | |
|---|---|
| Passbyggaren compose | Still none |
| Library size / seeds | Unchanged |
| Kom igång heuristics | Unchanged (Proposed #2 stays out) |
| Saknar-redskap banner | Not added (Proposed #1 stays out) |
| Caption | Unchanged |
| Device-local drafts | Unchanged |

## Phone layout sketch (~390px, edit, collapsed)

```
[ Header · Hallayout · Golvklart · … ]
[ Zooma  −  +                         ]
[                                     ]
[         Hall canvas (more height)   ]
[         pinch / pan / markers       ]
[                                     ]
[ Caption: Schematisk hall …          ]
[ Compact: Ej placerade (n)  [Visa…]  ]  ← sticky compact bar
```

Expanded: compact bar replaced by full sticky tray (today’s chips + hints).
