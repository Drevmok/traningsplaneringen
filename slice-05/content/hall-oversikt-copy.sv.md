# Hallöversikt — svensk microcopy (Slice 05)

**Status:** Thin Docs pass — strings align with `screen-spec-hall-board.md` / `decisions.md`. Builder already has pack strings; use this as the locked coach-facing wording.  
**Terminologi:** **gymnaster**, **pass**. CTA: **Hallöversikt**.  
**Out of scope:** nya övningar, Passbyggaren-omskrivning, Snap/06–07.

---

## CTA (Passbyggaren)

| Key | Swedish |
| --- | --- |
| `hallOverview` | Hallöversikt |
| `hallCtaDisabled` | Lägg till minst en övning först |

Tooltip / `title` / `aria-describedby` when the CTA is disabled: same as `hallCtaDisabled`.

---

## Navigation & header

| Key | Swedish |
| --- | --- |
| `hallBack` | Tillbaka till Passbyggaren |
| `hallBackShort` | Till Passbyggaren |
| Screen title (beside session title) | Hallöversikt |
| Activity count | `{n} övningar` (singular: `1 övning`) |

Use **Tillbaka till Passbyggaren** on the hall header. Use **Till Passbyggaren** on the empty-pass button (shorter tap target).

---

## Zones (canvas labels)

| zoneId | Label |
| --- | --- |
| `open` | Öppen yta |
| `trampett` | Trampett |
| `tumbling` | Tumbling |
| `vault` | Satsbräda |
| `mats` | Mattor |

Caption (muted, on canvas): **Schematisk hall — inte exakt mått** (`hallSchematicNote`)

---

## Tray

| Key | Swedish |
| --- | --- |
| `hallUnplaced` | Ej placerade |
| Tray with count | Ej placerade ({n}) |
| `hallAllPlaced` | Alla övningar är placerade i hallen. |
| `hallDragHint` | Dra övningar till hallen. Placeringen sparas med utkastet. |
| `hallRemove` | Ta bort från hall |
| `hallPlaceHere` | Placera här |

---

## Empty / edge states

| State | Copy |
| --- | --- |
| Pass has 0 activities (guard) | **Inga övningar i passet ännu.** + button **Till Passbyggaren** (`hallEmptyPass`) |
| ≥1 övning, all unplaced | Canvas caption + soft hint **Dra en övning hit**; tray lists chips |
| All placed | Tray shows `hallAllPlaced` |
| Missing activity | Chip title **Övning saknas** (`hallMissingActivity`) |

---

## Chip chrome

| Element | Swedish |
| --- | --- |
| Experienced badge (compact) | Erfaren |
| Experienced badge (full / a11y) | Erfaren ledare |
| Duration on chip | `{n} min` |
| Optional toast after save | Placering sparad |

Full experienced warning still lives in ActivityDetail — hall never replaces it.

---

## Kort tips till nya tränare

> Placera övningarna ungefär där ni brukar köra dem i hallen. Schemat är en hjälp för gruppen — inte en ritning med mått.

Use once: under the tray help on desktop, or as the canvas soft hint’s second line if space allows. Do **not** add a new modal.

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Golvplan”, “Karta”, “Visa hall”).
- Keep **pass** / **övning** / **gymnaster** consistent with Slice 01–03 chrome.
- Phone alternate place path uses `hallPlaceHere` only — no extra coaching copy required in 05.
