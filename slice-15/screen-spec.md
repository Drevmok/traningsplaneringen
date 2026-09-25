# Slice 15 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-25** (Christoffer)  
Behavior below follows the approved Planner locks A–F.

## Mental model

```
Teknik SessionItem[]
   ├─ each non-empty stationEquipment[]
   │     └─ slots { pieceId, count }
   └─ NEW: Förrådslista = merge by pieceId, SUM counts
         → read-only list (Swedish labels from EQUIPMENT_PIECES)
```

Per-station under-markör lines (Slice 14) stay as-is. Förrådslista is the **pass-wide packing rollup**, not a replacement for floor lines.

## Entry points (locked: both)

### Hallöversikt edit

- Add a secondary CTA in edit header actions (near **Visa flöde** / **Golvklart**), e.g. **Förrådslista**.
- Phone: must remain tappable (~44px); may sit as `btn-secondary` so **Golvklart** stays primary.
- Opens the Förrådslista sheet over the edit hall (does not enter Golvklart).

### Golvklart (floor)

- Add a CTA in Golvklart header (near **Avsluta golvklart** / **Skriv ut**), e.g. **Förrådslista**.
- Opens the same sheet over floor mode.
- Does **not** replace **Skriv ut**; does **not** block entering Golvklart when empty.

### Out

- Passbyggaren
- Home / Kom igång (later slice)
- Canvas markör / under-markör lines (not a tap target for Förråd)
- Station detail (compose stays **Redigera redskap**; no mandatory Förråd CTA there)

## Sheet UI (locked: bottom sheet)

Phone-first bottom sheet:

```
┌─────────────────────────────┐
│ Förrådslista          Stäng │
│ Ta med från förrådet …      │  (optional one-line sub)
├─────────────────────────────┤
│ 2× Trampett                 │
│ Landningsmatta              │  (count===1 → label only)
│ 3× Madrass                  │
│ …                           │
└─────────────────────────────┘
```

### Rules

- **Read-only** — no steppers, no remove, no “Lägg till”.
- Rows: one per aggregated `pieceId` with count > 0 after merge.
- Format: count===1 → `{label}`; count>1 → `{n}× {label}` (reuse helpers / keys).
- **Sort (locked: library order):** library order — walk `EQUIPMENT_PIECES`, emit only pieces present in the aggregate map.
- Optional small icon per row via existing `EQUIPMENT_ICON` — nice-to-have, not required for PASS.
- Scroll if many rows (max 10 library pieces → always short).
- `Stäng` / backdrop / swipe-down (Builder pick) returns to prior surface.
- Sheet is **not** a compose entry.

## Aggregate algorithm (Builder)

```
map = {}
for each SessionItem in session (Teknik / all items with stationEquipment):
  eq = item.stationEquipment
  if !Array.isArray(eq) || eq.length === 0: continue   // quiet omit
  for each slot in eq:
    piece = getEquipmentPiece(slot.pieceId)
    if !piece: continue
    map[pieceId] = (map[pieceId] ?? 0) + slot.count
# do NOT clamp sum to STATION_EQUIPMENT_MAX_COUNT
# do NOT include defaultStationEquipment / förslag
```

Emit rows in locked library order.

## Empty state

When aggregate map is empty:

```
Förrådslista
Inga redskap summerade ännu.
Ange redskap på Teknik-stationerna — tryck en markör → Redigera redskap.
[Stäng]
```

- Nudge must use / align with existing detail CTA wording (**Redigera redskap**).
- Do **not** say “vi har 0 i förrådet” or imply club stock.
- Do **not** auto-open compose from the empty sheet (optional soft text only).
- Empty sheet still reachable (CTA always visible) so coaches discover the feature.

## Partial state

- Some stations composed, some unset/`[]`: list shows **only** summed pieces from non-empty stations.
- No required “N stationer saknar redskap” banner this slice (keep quiet).

## Print (locked: include when non-empty)

When coach uses **Skriv ut** from Golvklart:

- Keep Slice 07/12/14 print: title strip, schematic, ranks, short titles, under-markör redskap, caption, hide edit chrome.
- **New:** if aggregate non-empty, print a compact **Förrådslista** block (heading + lines) **after** the schematic/caption area (or as a short list under the print title strip — Builder pick; prefer after schematic so floor map stays primary).
- If aggregate empty: **no** empty Förrådslista block on paper (quiet).

## Visibility matrix

| Mode | Under-markör redskap (14) | Förrådslista CTA | Förrådslista sheet |
|---|---|---|---|
| Edit canvas | Hidden | Yes (locked) | On demand |
| Golvklart screen | Shown if non-empty | Yes (locked) | On demand |
| Print | Shown if non-empty | n/a (chrome hidden) | Compact block if non-empty |

## Implementation hooks (Builder — do not implement in this pack)

| Area | Hook |
|---|---|
| Aggregate | Pure helper e.g. `aggregateStationEquipment(session.items)` in `lib/` or `equipmentPieces.ts` |
| UI | New `ForradslistaSheet` (or thin section) + CTAs in `HallBoard` edit + floor headers |
| Data | Reuse `getEquipmentPiece`, `stationEquipmentLabelText` / UI keys |
| CSS | Bottom sheet styles (may reuse compose sheet shell); print block `.forradslista-print` |
| Copy | Keys from polished `docs/forradslista.sv.md` → `blockMeta` |
| Footer | `Träningsplaneraren · Slice 15` |
| Out | Netlify, inventory, custom pieces, Kom igång step, Passbyggaren compose, badge, CAD, edit-from-list |

## Regression

- Slice 11 Teknik-only + prune  
- Slice 12 tap → detail, drag ≠ detail, Erfaren, print short titles  
- Slice 13 compose + detail Redskap + no Passbyggaren compose + no marker badge  
- Slice 14 Golvklart/print under-markör redskap; edit canvas clean  
- Caption **Schematisk hall — inte exakt mått**  
- Golvklart enter/exit/print with zero compositions still works  
