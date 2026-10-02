# Redskap library +5 (C1 · DRAFT)

Fixed catalog grows **10 → 15**. Still no coach-authored / free-text redskap (Parked item stands).  
Ids are ASCII like today (`eq-satsbrada`). Labels singular; counts render as `{n}× {label}` (e.g. `4× Rockring`).

## New pieces

| id | labelSv | Trial need | Sketch kind (`EquipmentKind`) | Look (#12 style: isometric `Box`, 1.3 stroke `#161616`) | Row width | Sketch cap | Hall zone (`PIECE_ZONE`) | `EQUIPMENT_ICON` fallback |
|---|---|---|---|---|---:|---:|---|---|
| `eq-kilmatta` | Kilmatta | Äggrullning, Spindelmannen | `wedge` | Triangular prism, high end left, mat indigo (`#5348e6` front / `#6a60f2` slope / `#3d34c4` side) | 120 | 2 | `mats` | `pad` |
| `eq-skumblock` | Skumblock | Formhopp över block, Landningar (orange låda) | `block` | Small soft `Box` w44 d26 h18, coral (`#e2674f` / `#ee8a74` / `#b84a36`) | 64 | 3 | `open` | `pad` |
| `eq-bom` | Bom | Soldatsparkar, Krabbgång | `beam` | Long low beam `Box` w150 d14 h8 on two short legs (h10), suede tan (`#c9a77a` / `#dcc29c` / `#a5845a`) | 168 | 1 | `open` | `fallback` |
| `eq-racke` | Räcke | L-häng, Stöd med pendel | `bar` | Two thin uprights (h≈46) on small feet + round bar on top, steel (`#8a8f99` uprights, `#d5d8de` bar) | 110 | 1 | `open` | `hands-up` |
| `eq-rockring` | Rockring | Ljushopp i rockringar | `hoop` | Flat ring on floor: ellipse rx18 ry6, stroke 4 (`#d9534f`), no fill | 44 | 4 | `open` | `target` |

Each kind also needs an `ICON_FRAME` entry so `EquipmentIcon` (compose grid, detail lists, stationskort, Förrådslista) draws it — same crop approach as existing kinds.

## Library order (`EQUIPMENT_PIECES`)

**Append** after `eq-kon` in this order: Kilmatta · Skumblock · Bom · Räcke · Rockring.  
Appending keeps Slice 15 Förrådslista order for the first 10 (no regression in existing verify recipes).

## StationSketch row order (`expand()` in `StationSketch.tsx`)

```
airtrack · tumblingmatta · madrass · KILMATTA · satsbräda · trampett · SKUMBLOCK ·
flickiskudde · plint · mattberg · RÄCKE · BOM · landningsmatta · kon · ROCKRING
```

- Skumblock sits right after trampett → "trampett → block → landningsmatta" (trial station 2).
- Räcke/Bom before landningsmatta → dismount mat lands after the apparatus.
- Rockring last (floor markers, like kon).
- `approach` (4 cushions before trampett/satsbräda when no runway) unchanged; new pieces do **not** count as runway.

## Zone suggestion (`hallSuggest.ts` · PR #4)

Strongest apparatus still wins. New order of `PIECE_ZONE`:

```
satsbräda→vault · trampett→trampett · tumblingmatta→tumbling · airtrack→tumbling ·
flickiskudde→tumbling · mattberg→mattberg · RÄCKE→open · BOM→open · plint→open ·
KILMATTA→mats · madrass→mats · landningsmatta→mats · kon→open · SKUMBLOCK→open · ROCKRING→open
```

| Example slots | Zone |
|---|---|
| trampett + skumblock + landningsmatta | `trampett` (unchanged winner) |
| kilmatta + madrass | `mats` |
| räcke + landningsmatta | `open` (räcke outranks the mat — no "Mattor" zone for a bar) |
| bom only | `open` |
| rockring only | `open` |

No new hall zones (no räcke/bom zone in presets) — out of scope. `lib/wizard.ts` `mapActivityToZone` uses tags only → unchanged.

## Förrådslista + "Vad finns i hallen ikväll?"

- `aggregateStationEquipment` emits in library order → new pieces appear after Kon. No other change.
- Owned toggles list grows to 15 rows (same component).
- **Migration (must):** `loadOwnedEquipment()` treats a missing key as "owns all". Coaches with a saved explicit list would otherwise *not* own the 5 new pieces → `ownsEveryPiece` false → "Visa bara övningar vi kan köra ikväll" defaults **on** and hides drills. Fix: keep a seen-ids key (`gymnastics-planner-owned-equipment-seen-v1`); any catalog id not yet seen is added to the owned list once and marked seen. Later unticks stick.

## Other consumers (automatic, verify only)

`StationComposeSheet` grid (15 tiles — check 390 px wraps cleanly) · `ActivityDetail` Redskap lists · `stationCards.ts` / Golvklart / print equipment line · saknar banner · Använd alla förslag (now also own Teknik drills with redskap).
