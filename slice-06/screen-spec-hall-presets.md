# Screen spec — Hall presets & snap (Slice 06)

Swedish UI throughout. Builds on Slice 05 [`screen-spec-hall-board.md`](../slice-05/screen-spec-hall-board.md). Entry, tray, chips, back, safety — **unchanged** unless noted.

## 1. What changes from Slice 05

| Area | Slice 05 | Slice 06 |
|---|---|---|
| Zones | 5 labels | **6** — add **Mattberg**; refine Mattor |
| Drop | Free place + soft zoneId | **Snap** on apparatus; **free** on öppen yta |
| Template | Fixed `generic-trupp` | **Preset picker** (3 layouts) |
| Phone Placera här | Raw tap coords | **Same snap helper** as DnD |

## 2. Preset picker UI

**Location:** Hall header row (desktop and phone), near title / activity count — not buried in tray.

```
┌─────────────────────────────────────────────────────────────┐
│ ← Tillbaka till Passbyggaren                                │
│ {session.title} · Hallöversikt · N övningar                 │
│ Hallayout: [ Standard trupp ▾ ]                             │
├──────────────────────────────┬──────────────────────────────┤
│   Canvas (active preset)     │ Ej placerade (tray) …        │
└──────────────────────────────┴──────────────────────────────┘
```

| Control | Spec |
|---|---|
| Label | **Hallayout** (visible) |
| Control | Native `<select>` or button+menu — Builder choice |
| Options (order) | **Standard trupp**, **Tävling / linjer**, **Liten hall** |
| Selected | Current `session.hallTemplateId` (after migrate) |
| Change | Call `applyPreset` → remap chips → `saveDraft` → re-render zones |
| Confirm | **No** modal for first ship — instant switch. Optional one-line muted note under picker: “Placerade övningar flyttas till samma zon i den nya layouten när det går.” |

**A11y:** `aria-label="Hallayout"` on the control; options use Swedish labels.

## 3. Snap behavior (coach-visible)

### Apparatus zones (trampett, tumbling, vault, mattberg, mats)

1. Coach drops (or Placera här taps) with chip center inside zone bbox.
2. Chip **snaps** to that zone’s snap slot (plus multi-chip offset if needed).
3. Soft highlight of the target zone during drag/place-mode is **nice-to-have** (dashed border brighten) — not required for PASS.
4. `zoneId` set to that zone.
5. Short ease animation OK; hard jump OK for PASS.

### Öppen yta

1. Drop / tap inside `open` bbox → **no snap**; store exact clamped center.
2. `zoneId = 'open'`.

### Outside zones but on canvas

1. Free place; `zoneId` undefined (or leave unset).
2. Still clamped so chip remains mostly on-canvas (Slice 05 rule).

### Move between zones

- Dragging from trampett to tumbling → on drop, snap to tumbling slot.
- Dragging from trampett to open → free place on open.
- Easy remove: **Ta bort från hall** / drag to tray — unchanged.

### Visual feedback (recommended)

| Moment | Feedback |
|---|---|
| Drag over snappable zone | Zone outline slightly stronger (optional) |
| After snap | Chip settles on slot |
| Place-mode (phone) | Existing outline + **Placera här**; if finger/tap hits apparatus zone, result is snapped |

## 4. Canvas rendering

- Draw zones from **active preset** only ([`hall-presets.md`](./hall-presets.md)).
- Six labels when present in preset (Liten hall still includes all six, with smaller apparatus strips).
- Caption muted: **Schematisk hall — inte exakt mått**
- Chips above schematic; z-index unchanged.
- Zone glyphs abstract; Mattberg = soft stacked/foam cue; reuse Slice 04 icon language sparingly.

## 5. Tray & chips

Unchanged from Slice 05:

- **Ej placerade (N)**; empty = **Alla övningar är placerade i hallen.**
- Help: keep **Dra övningar till hallen. Placeringen sparas med utkastet.**
- Optional extra line (Docs may lock): **Släpp på en zon för att fästa övningen där. På öppen yta kan du placera fritt.**
- Chip chrome: VisualIcon + BLOCK_COLORS + title + Erfaren badge.

## 6. Empty / edge cases

| State | UI |
|---|---|
| Empty pass guard | Unchanged — **Inga övningar i passet ännu.** |
| All unplaced | Schematic of active preset; tray full; soft **Dra en övning hit** |
| Preset switch with placements | Chips remap; no toast required; canvas updates |
| Preset switch, chip had `mats`, target has `mats` | Snaps to new mats slot |
| Preset switch, chip had only free x,y | Keeps x,y; zone re-resolved |
| Multiple chips same zone | Offset stack — all remain visible enough to tap |
| Missing activity | **Övning saknas** — still placeable / snappable |
| Orphan placement | Pruned on load — never ghost |

## 7. Phone notes (≤768px)

- Keep Slice 05 stack: header (include **Hallayout** picker — full width OK) → canvas → tray.
- Picker must be usable ≥44px height.
- **Placera här** path: select unplaced chip → tap canvas → **snap helper** with tap coordinates.
- Touch-drag still not required if Placera här works with snap.
- Advanced gestures → Slice 07.

## 8. Persistence UX

- Place / move / remove / **preset change** → update session + `saveDraft`.
- No separate “Spara hallayout” button.
- Silent save OK (toast still optional).

## 9. Copy keys (suggested additions)

| Key | Swedish |
|---|---|
| hallLayout | Hallayout |
| hallPresetStandard | Standard trupp |
| hallPresetTavling | Tävling / linjer |
| hallPresetLiten | Liten hall |
| hallSnapHint | Släpp på en zon för att fästa övningen där. På öppen yta kan du placera fritt. |
| hallPresetMigrateNote | Placerade övningar flyttas till samma zon i den nya layouten när det går. |

Reuse Slice 05 keys for back, tray, schematic note, Placera här, etc.

## 10. Accessibility

- Preset control named in Swedish.
- Zone labels visible text (or aria on zone groups).
- Snapped position must not remove accessible name on chips.
- Do not rely on snap animation for understanding — final position is enough.

## 11. Out of this screen (still)

- Flow arrows / station numbers
- Print / floor-ready
- Editing pass structure on hall
- Club CAD / meters
