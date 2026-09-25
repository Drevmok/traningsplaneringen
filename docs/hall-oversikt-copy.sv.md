# Hallöversikt — svensk microcopy (Slice 05)

**Status:** Living Hallöversikt chrome — Slice 05 base; Slice 19 adds bulk **Använd alla förslag**.  
**Terminologi:** **gymnaster**, **pass**. CTA: **Hallöversikt**.  
**Keep caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope (Slice 19):** confirm dialogs, Golvklart/Passbyggaren variants of bulk CTA, auto-apply on place, badge/CAD, Netlify.

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

Slice 20: canvas × uses `hallRemove` with ≥44×44px hit target (edit only) — no new B2 button. See [`dirty-stang.sv.md`](./dirty-stang.sv.md).

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

---

## Använd alla förslag (Slice 19)

Full lock: [`anvand-alla-forslag.sv.md`](./anvand-alla-forslag.sv.md). Edit chrome only — secondary near hall actions; primary stays **Golvklart**.

| Key | Swedish |
| --- | --- |
| `hallApplyAllSuggested` | Använd alla förslag |
| `hallApplyAllSuggestedAria` | Använd alla osparade redskapsförslag på placerade Teknik-stationer |
| `hallApplyAllSuggestedDisabled` | Inga stationer med osparade förslag |
| `hallApplyAllSuggestedResult` | Sparade redskap på {n} stationer |
| `hallApplyAllSuggestedResultOne` | Sparade redskap på 1 station |
| `hallApplyAllSuggestedNone` | Inga osparade förslag just nu. |

- Enabled when ≥1 **placed** Teknik has unset `stationEquipment` + non-empty seed; otherwise disabled (prefer disable over hide).
- Immediate apply; no confirm. Prefer `ResultOne` when N === 1.
- Skip saved lists and `[]`. Same persist path as per-station **Använd förslag**.
- Footer when shipped: **Träningsplaneraren · Slice 19**

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Golvplan”, “Karta”, “Visa hall”, “Acceptera alla seeds”).
- Keep **pass** / **övning** / **gymnaster** consistent with Slice 01–03 chrome.
- Phone alternate place path uses `hallPlaceHere` only — no extra coaching copy required in 05.
- Slice 19: wire `hallApplyAllSuggested*` from edit chrome only; see [`anvand-alla-forslag.sv.md`](./anvand-alla-forslag.sv.md).
