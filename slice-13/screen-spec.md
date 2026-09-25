# Slice 13 — screen spec

**Status:** APPROVED 2026-09-24 (Christoffer)

## Mental model

```
Teknik övning (Passbyggaren)
    └─ SessionItem
           ├─ hall placement → ONE Slice-12 marker on Hallöversikt
           └─ stationEquipment[] → redskapslista in detail + compose sheet
```

Pieces are **not** independently placeable on the canvas.

## Equipment library

- Seed module e.g. `data/equipmentPieces.ts` (id, `labelSv`, `visualKey` / icon).
- **Full catalog (all 10):** Trampett, Satsbräda, Plint, Landningsmatta, Tumblingmatta, Madrass, Mattberg, Flickiskudde, Airtrack, Kon.
- **Mattberg** = one catalog piece (not N×matta).
- Compose sheet: scrollable grid or list of pieces; tap **adds** (or increments count).
- Selected recipe: ordered chips/rows with label, count (+/−), remove.
- Reorder: nice-to-have; not required for PASS if add/remove/count works.
- Max pieces / max count: soft cap (e.g. 8 slots, count ≤ 9) to keep phone UI sane — document in ship notes.

## Compose sheet (phone-first)

- Full-height or large bottom sheet (≥ ~390px width usable).
- Header: station title (from activity) + **Klar** / **Stäng**.
- Sections: **Er redskap** (recipe) · **Lägg till** (library).
- Empty recipe: Swedish empty + short tip (see content seeds).
- Persist to `SessionItem.stationEquipment` on Klar (or live-save — Builder choice; Klar is clearer for new coaches).
- Cancel/Stäng without Klar: discard unsaved edits (or confirm if dirty — prefer discard + no modal unless dirty and easy).

### Entry (v1)

| From | Action |
|---|---|
| Hall detail (placed tap) | **Redigera redskap** → compose sheet |

**Out of Slice 13:** Passbyggaren Teknik-item compose entry — do not implement.

### Exit

Compose closes → previous surface (detail preferred). Placements unchanged.

## Hall marker (canvas)

- Unchanged Slice 12 marker (~44–56px, icon-first, rank, Erfaren).
- Still one marker per placed Teknik item.
- **No** equipment-count badge on the marker this slice — detail only.
- Tray: still readable short title; no need to list all pieces in tray row.

## Detail sheet (hall)

Extend `ActivityDetail` readOnly:

1. Existing: visual, title, block · duration, Erfaren warning, summary, how-to, watch-for  
2. **New:** section **Redskap** — bullet/chips of `{count}× {label}` (omit × when count===1 if copy prefers)  
3. CTA **Redigera redskap** (only compose entry for v1)  
4. Still **no** add-to-pass  

Empty redskap: empty microcopy + CTA.

## Defaults

- Seed `defaultStationEquipment` **only** on obvious vault / trampett / mattberg-style Teknik drills.
- Do **not** pre-fill every Teknik drill.

## Golvklart / print

- Markers + ranks unchanged (Teknik-only).
- Print: optional short equipment line under marker title **only if** space; otherwise detail/print list is enough. Do not explode into multi-piece drawings.

## Teknik-only & prune

- `lib/hall.ts` placeable filter unchanged (`blockType === 'techniques'`).
- Composition on non-Teknik items: ignore / do not surface (no compose outside Teknik; no Passbyggaren compose this slice).

## Implementation hooks (Builder — do not implement in this pack)

| Area | Hook |
|---|---|
| Types | `EquipmentPiece`, `StationEquipmentSlot`; `SessionItem.stationEquipment?` |
| Seed | `equipmentPieces.ts` (all 10); selective `defaultStationEquipment` on vault/trampett/mattberg-style Teknik only |
| Session | create / migrate / sanitize unknown ids; persist with draft |
| UI | `StationComposeSheet` (new); extend `ActivityDetail`; hall CTA **Redigera redskap** from hall detail path only |
| Icons | Reuse / map simple icons (bounce, mats-stack, jump-board, pad, …); fallback OK |
| CSS | Phone sheet; keep marker CSS from Slice 12; **no** badge overlay |
| Footer | Slice 13 label |

## Regression

- Slice 11 Teknik-only + prune  
- Slice 12 tap → detail, drag ≠ detail, Erfaren, tray usable on phone  
- Caption **Schematisk hall — inte exakt mått**  
- No CAD, no new placeable blocks, no Netlify/accounts, no Passbyggaren compose, no marker badge in this slice  
