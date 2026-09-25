# Screen spec — Station flow, phone polish, Golvklart (Slice 07)

Swedish UI throughout. Builds on Slice 05 [`screen-spec-hall-board.md`](../slice-05/screen-spec-hall-board.md) and Slice 06 [`screen-spec-hall-presets.md`](../slice-06/screen-spec-hall-presets.md). Entry, tray basics, snap, presets, safety — **unchanged** unless noted.

**Status:** APPROVED by Christoffer 2026-09-24

## 1. What changes from Slice 06

| Area | Slice 06 | Slice 07 |
|---|---|---|
| Placed chips | Title + icon + Erfaren | **+ station badge 1…N** (placed only) |
| Flow | None | Optional dashed connectors; **Visa flöde** toggle |
| Reorder on hall | N/A | **Still none** — Passbyggaren owns order |
| Phone tray | Below canvas, may scroll away | **Sticky** bottom strip |
| Phone pan / drag | Basic / Placera här | Pan unless pointer starts on chip; keep Placera här |
| Zoom | None | Pinch **or** +/− (Builder picks one) |
| Presentation | Edit only | **Golvklart** read-only + **Skriv ut** |

## 2. Edit hall — station numbers

### Badge

- Small circular (or pill) badge on **canvas** chips only, typically top-left or top-right of chip.
- Content: Arabic numerals **1 … N** (placed count).
- Contrast: readable on block-tinted chips (dark text or white on dark pill — Builder choice; must pass contrast for Verifier glance).
- Accessible name: include number, e.g. `"3. {activity title}"`.
- Tray chips: **no** badge.
- Missing activity: still numbered if placed (**Övning saknas** + number).

### Help

- Tray or header muted line: **Stationsordning följer passet.**
- Optional: numbers update live when coach places/removes or reorders in Passbyggaren then returns.

## 3. Edit hall — Visa flöde

**Location:** Hall header row (desktop + phone), near Hallayout / Golvklart — not buried only in tray.

| Control | Spec |
|---|---|
| Label when flow hidden | **Visa flöde** |
| Label when flow shown | **Dölj flöde** (or toggle with `aria-pressed`) |
| Default | ON (`hallShowFlow !== false`) |
| Action | Toggle flow layer; prefer `saveDraft` with `hallShowFlow` |
| Disabled / no-op visual | When <2 placed chips — toggle may stay enabled but draw nothing |

### Flow visuals

- Muted dashed stroke (e.g. slate / gray, ~1–2px), low opacity.
- Chip-center → chip-center in pass order among placed.
- `pointer-events: none` on flow layer so chips stay draggable/tappable.
- Do not draw arrows that imply meters or one-way doors — soft “order hint” only.
- In Golvklart: same flow if preference ON.

## 4. Edit hall — Golvklart CTA

**Location:** Hall header (primary or secondary button).

| Control | Spec |
|---|---|
| Label | **Golvklart** |
| Enabled | Always when hall has ≥1 activity (same guard as hall screen itself) |
| Action | Set `hallMode = 'floor'` |
| Alternate Docs short | **Visa för golvet** — not required on the button if **Golvklart** is used |

Also in header (edit mode): keep back **Tillbaka till Passbyggaren**, Hallayout picker, session title / count.

## 5. Golvklart mode layout

```
┌─────────────────────────────────────────────────────────────┐
│ Avsluta golvklart          {session.title}     [Skriv ut]   │
│ Golvklart · {N min} (if space)                              │
│ ⚠ N övningar ej placerade   (only if unplaced > 0)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Hall canvas (read-only)                                   │
│   zones + caption + numbered chips + flow (if on)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visible

- Schematic for current preset (zones + labels)
- Caption **Schematisk hall — inte exakt mått**
- Placed chips with station numbers
- Flow connectors if `hallShowFlow` is on
- Session title; duration summary if space (`{totalMinutes} min`)
- **Erfaren** badge on experienced chips
- Soft banner: **N övningar ej placerade** when `unplaced.length > 0` (does not block)

### Hidden / disabled

- Unplaced tray editing chrome (entire tray OK to hide)
- Drag affordances, place-mode, **Placera här**
- **Ta bort från hall**
- Prefer hide Hallayout `<select>` (show read-only preset name optional)
- Prefer hide **Visa flöde** toggle in floor mode (flow follows last edit preference) — or keep toggle if Builder wants live adjust; **default: hide edit toggles**, keep print + exit

### Interactions

| Action | Behavior |
|---|---|
| Tap chip | Optional open ActivityDetail read-only (experienced warning must show if opened) |
| Drag chip | No-op |
| Tap empty canvas | No-op (pan/zoom still OK on phone) |
| **Avsluta golvklart** | `hallMode = 'edit'` |
| **Skriv ut** | `window.print()` |

### Empty / edge

| State | UI |
|---|---|
| All placed | No unplaced banner |
| Some unplaced | Soft banner; still enter Golvklart |
| Zero placed | Schematic + title + banner with full N; flow empty; print still allowed |
| Empty pass | Should not reach hall; existing empty guard |

## 6. Print (`Skriv ut`)

- Button visible in Golvklart (also OK in edit header as secondary — **required at least in Golvklart**).
- Handler: `window.print()` only.
- `@media print` (or `print.css`):

  - Prefer landscape A4 (`@page { size: A4 landscape; margin: ~10–12mm; }`).
  - Hide: site nav, footer Slice badge, tray, edit buttons, Golvklart chrome buttons (exit/print), toasts.
  - Keep: title, schematic, zones, chips + numbers, flow if on, caption, optional duration.
  - Backgrounds: allow schematic fills to print (`print-color-adjust: exact` where needed).
  - No external PDF library / CDN scripts.

## 7. Phone polish (≤768px) — edit mode

### Sticky tray

- Tray = bottom sticky strip (`position: sticky` or fixed within hall layout) so chips stay reachable while canvas pans.
- Horizontal scroll of tray chips OK.
- Header (back, Golvklart, flow, Hallayout) remains reachable — may compact wrap.

### Pan vs drag

- Pointer down on chip → chip drag / select (existing DnD or pointer move).
- Pointer down on empty canvas → pan/scroll canvas (overflow or transform pan).
- Do not start chip drag from empty floor.
- **Placera här** remains: tap unplaced tray chip → tap canvas → snap helper (Slice 06).

### Zoom

- Builder implements **exactly one** of:
  1. Pinch-zoom on canvas, or
  2. Visible **+** / **−** controls (≥44px) adjusting a CSS scale / viewBox zoom.
- Zoom factor does **not** write to `HallPlacement.x/y`.
- Reset-on-leave optional; not required to persist.

### Remove

- Keep explicit **Ta bort från hall** (or equivalent) on placed chip / detail.
- Avoid remove on the same short tap used for detail.
- Long-press-to-remove is OK **in addition** if clearly discoverable; not required if clear button exists and is ≥44px.

### Preset picker

- Compact select OK; min height ≥44px; Swedish labels unchanged.

### Golvklart on phone

- Same mode; sticky tray hidden; exit + print ≥44px; unplaced banner readable; canvas still pannable / zoomable.

## 8. Desktop notes

- Tray may stay side panel (Slice 05–06); sticky not required on wide.
- Flow toggle + Golvklart in header.
- Mouse: chip drag vs empty-canvas no-op (no pan required on desktop if canvas fits).

## 9. Copy keys (seeds for Docs / `UI`)

| Key | Swedish |
|---|---|
| hallFloorReady | Golvklart |
| hallFloorReadyShort | Visa för golvet |
| hallExitFloor | Avsluta golvklart |
| hallShowFlow | Visa flöde |
| hallHideFlow | Dölj flöde |
| hallPrint | Skriv ut |
| hallUnplacedBanner | {n} övningar ej placerade |
| hallStationOrderHint | Stationsordning följer passet |
| hallSchematicNote | Schematisk hall — inte exakt mått *(keep)* |

Reuse Slice 05–06 keys for back, tray, Placera här, Hallayout, Erfaren, etc.

Unplaced banner singular optional: `1 övning ej placerad` — Builder/Docs may use plural form for all N≥1 for PASS simplicity, or proper pluralization; Verifier accepts either if meaning clear.

## 10. Accessibility

- Flow toggle: button with accessible name Visa/Dölj flöde; `aria-pressed` if toggle pattern.
- Golvklart / Avsluta / Skriv ut: clear names.
- Station badge included in chip accessible name.
- Flow decorative: `aria-hidden` on SVG layer.
- Print: content remains in DOM (not canvas-only bitmap) so print CSS works.
- Experienced warning path preserved when detail opens from Golvklart.

## 11. Out of this screen

- Drag-reorder mutating pass order
- Club CAD / meters / share links
- Changing snap or preset definitions
- New App route required for Golvklart
- PDF export library
