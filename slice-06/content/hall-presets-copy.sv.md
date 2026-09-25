# Hallayout & snap — svensk microcopy (Slice 06)

**Status:** Thin Docs pass — strings align with `screen-spec-hall-presets.md` / `decisions.md` / `hall-presets.md`. Builder already has pack strings; this locks coach-facing wording.  
**Tone:** Same as Slice 05 Hallöversikt (`slice-05/content/hall-oversikt-copy.sv.md`).  
**Terminologi:** **gymnaster**, **pass**. Caption unchanged: **Schematisk hall — inte exakt mått**.  
**Out of scope:** nya övningar, Passbyggaren-omskrivning, flöde/print (Slice 07).

Reuse Slice 05 keys for back, tray, empty pass, Placera här, Övning saknas, Erfaren, etc.

---

## Preset picker

| Key | Swedish |
| --- | --- |
| `hallLayout` | Hallayout |
| `hallPresetStandard` | Standard trupp |
| `hallPresetTavling` | Tävling / linjer |
| `hallPresetLiten` | Liten hall |
| `hallPresetMigrateNote` | Placerade övningar flyttas till samma zon i den nya layouten när det går. |

- Visible label: **Hallayout** (`aria-label="Hallayout"`).
- Option order: Standard trupp → Tävling / linjer → Liten hall.
- First ship: **no confirm modal** on switch — instant. Show `hallPresetMigrateNote` as one muted line under the picker (optional but recommended).
- Do not invent synonyms (e.g. “Layout”, “Hallmall”, “Golvtyp”).

### Short help under picker (optional one-liner)

Same as `hallPresetMigrateNote`. No second sentence needed.

---

## Zones (canvas labels)

| zoneId | Label | Snap |
| --- | --- | --- |
| `open` | Öppen yta | Free place (no snap) |
| `trampett` | Trampett | Snaps |
| `tumbling` | Tumbling | Snaps |
| `vault` | Satsbräda | Snaps |
| `mattberg` | Mattberg | Snaps (**new**) |
| `mats` | Mattor | Snaps |

**Mattberg vs Mattor:** both labels stay. Mattberg = foam mountain; Mattor = general mats. Do not merge or rename.

Caption (every preset): **Schematisk hall — inte exakt mått** (`hallSchematicNote`)

---

## Snap hint (tray / help)

| Key | Swedish |
| --- | --- |
| `hallSnapHint` | Släpp på en zon för att fästa övningen där. På öppen yta kan du placera fritt. |

Place as an optional second line under the Slice 05 tray help  
(**Dra övningar till hallen. Placeringen sparas med utkastet.**).  
Phone: no extra copy required beyond existing **Placera här** — snap is silent behavior.

---

## Empty / edge (preset switch)

| State | Copy |
| --- | --- |
| Empty pass | Unchanged — **Inga övningar i passet ännu.** |
| All unplaced | Unchanged — soft **Dra en övning hit** |
| Preset switch with placements | No toast required; canvas updates; migrate note under picker is enough |
| Missing activity | **Övning saknas** — still placeable / snappable |
| Never on switch | Do not say chips were removed or sent back to tray |

---

## Kort tips till nya tränare

> Välj den hallayout som liknar er hall mest. Övningar på trampett, tumbling och liknande fäster i zonen; på öppen yta placerar du fritt.

Use once near the picker or under snap hint. Do **not** add a modal.

---

## Notes for Builder

- Labels must match tables exactly (including **Tävling / linjer** with slash and spaces).
- Prefer these strings over inventing “Snap”, “Magnetisk zon”, or English preset names in UI.
- Keep **pass** / **övning** / **gymnaster** consistent with prior slices.
