# Slice 14 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-25** (Christoffer)

## Mental model

```
Teknik SessionItem
   ├─ hall placement → ONE Slice-12 markör (rank 1…N among placed)
   ├─ stationEquipment[] → Slice 13 detail + compose
   └─ NEW: same non-empty stationEquipment → lines under markör
         in Golvklart (screen) and @media print
```

Edit Hallöversikt canvas does **not** show under-marker redskap or a badge.

## Visibility matrix

| Mode | Marker icon + rank | Short activity title | Redskap lines |
|---|---|---|---|
| Edit canvas | Yes | Hidden (print-only class) | **Hidden** |
| Golvklart screen | Yes | **Hidden** (print-only — Q D locked) | **Shown** if non-empty |
| Print | Yes | Shown (`hall-chip-title--print`) | **Shown** if non-empty (after short title) |

## Equipment lines (under markör)

- Source: `item.stationEquipment` after Slice 13 sanitize semantics.
- Show only when `Array.isArray(eq) && eq.length > 0`.
- Each slot → one line: resolve `getEquipmentPiece(pieceId)?.labelSv`; format via `stationEquipmentLabelText` / locked keys:
  - **count === 1:** `{label}` only (`stationEquipmentOne` / `hallFloorEquipmentOne`)
  - **count > 1:** `{count}× {label}` (`stationEquipmentCount` / `hallFloorEquipmentCount`)
- Order: same order as saved composition.
- **Cap:** show all lines up to **8** (soft library max); **no** “+N till” truncation.
- Placement: **under** each numbered Teknik markör (not a side list).
- Styling: muted, small type (~0.55–0.65rem), centered under marker; max-width so neighbors do not heavily overlap; `pointer-events: none`; `aria-hidden` OK if accessible name already covers equipment (optional a11y enhancement — non-blocking).
- Do **not** show icons per piece on the floor (text only).
- Do **not** show “Inga redskap…” / förslag chrome on floor/print.

### Example (non-empty)

```
[3]  (icon)
     2× Trampett
     Landningsmatta
```

(count===1 for Landningsmatta → `{label}` only; Trampett count 2 → `2× Trampett`.)

## Golvklart (floor)

- Existing header: Avsluta golvklart · Skriv ut · title · duration · unplaced banner.
- Canvas `is-floor`: markers read-only; tap → detail.
- **New:** under-marker redskap for non-empty compositions.
- Short activity title stays **print-only** on Golvklart screen (equipment lines only on screen).
- Tray remains hidden in floor mode.
- Phone (~390px): lines must remain readable; prefer wrap / ellipsis over expanding the 52px hit target itself (hit target stays the marker tile).

## Print (`@media print`)

- Keep Slice 07/12 print rules (hide chrome, show print title strip, schematic, ranks, short titles, caption, flow if on).
- **New:** equipment lines visible under markers when non-empty (**after** short title).
- A4 landscape baseline unchanged.
- `print-color-adjust: exact` may apply to new text for legibility.

## Hall detail / compose

- **Unchanged** Slice 13: Redskap section, empty copy, förslag, **Redigera redskap**.
- Floor/print do not replace detail; they only mirror **saved non-empty** recipes.

## Edit Hallöversikt

- No under-marker redskap list.
- No equipment-count badge.
- Compose entry still detail-only.

## Implementation hooks (Builder — do not implement in this pack)

| Area | Hook |
|---|---|
| UI | `HallChip` canvas: render equipment block when non-empty; gate visibility to floor + print |
| Data | Reuse `item.stationEquipment`, `getEquipmentPiece`, `stationEquipmentLabelText` / UI keys |
| CSS | `.hall-canvas.is-floor …` show lines; edit hide; `@media print` show; avoid growing edit 52px tile |
| Copy | Keys from polished `docs/golvklart-redskap.sv.md` → `blockMeta` / docs |
| Footer | `Träningsplaneraren · Slice 14` |
| Out | Netlify, Passbyggaren compose, CAD pins, badge, Förrådslista, Kom igång step, side list, “+N till”, Golvklart-screen short titles |

## Regression

- Slice 11 Teknik-only + prune  
- Slice 12 tap → detail, drag ≠ detail, Erfaren, print short titles  
- Slice 13 compose + detail Redskap + no Passbyggaren compose + no marker badge  
- Caption **Schematisk hall — inte exakt mått**  
- Golvklart enter/exit/print still work with zero compositions (quiet)  
