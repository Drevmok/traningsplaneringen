# Slice 17 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-25** — behavior below follows Planner recommendations A–F per locked A–F.

## Mental model

```
Teknik SessionItem (placed)
   ├─ markör (icon + rank) — Slice 12
   ├─ short title (.hall-chip-title--print) — activity.title, CSS ellipsis
   │     Edit canvas: HIDDEN
   │     Golvklart (.is-floor): SHOW  ← NEW
   │     Print: SHOW (already)
   └─ redskap lines — Slice 14
         Edit: HIDDEN
         Golvklart + print: SHOW if non-empty, BELOW short title
```

## Visibility matrix (proposed locks A, B, D)

| Mode | Marker icon + rank | Short activity title | Redskap lines |
|---|---|---|---|
| Edit canvas | Yes | **Hidden** | Hidden |
| Golvklart screen | Yes | **Shown** (new) | Shown if non-empty (below title) |
| Print | Yes | Shown | Shown if non-empty (below title) |

## Layout (locked B recommend)

```
[3]  (icon)
     Volthop…          ← short title (~9–10ch ellipsis)
     2× Trampett       ← Slice 14 lines (offset below title)
     Landningsmatta
```

When redskap quiet:

```
[3]  (icon)
     Volthop…          ← title still shown (locked D)
```

## Implementation hooks (Builder — do not implement in this pack)

| Area | Hook |
|---|---|
| CSS | `.hall-canvas.is-floor .hall-chip--canvas .hall-chip-title--print { display: block; … }` |
| CSS stack | On `.is-floor`, offset `.hall-chip-equipment` below title (mirror `@media print` `top` treatment) |
| TSX | Prefer **no** structural change — title already in `HallChip`; comment update only if needed |
| Docs | Supersede Slice 14 “print-only on Golvklart screen” line |
| Footer | `footerSliceLabel` → `Träningsplaneraren · Slice 17` |

## Unchanged

- Edit canvas declutter (no titles)
- Caption **Schematisk hall — inte exakt mått**
- Redskap format / quiet / cap 8 / no “+N till”
- Tap markör → detail; Förrådslista; Kom igång
- Title source = `activity.title` (not a new field)

## Phone

~390px Golvklart: title + up to a few equipment lines must remain readable without expanding the 52px hit target. Prefer ellipsis over growing the marker tile.
