# Stationsuppsättning av redskap — svensk microcopy (Slice 13)

**Status:** Docs lock — Christoffer approved Slice 13 (2026-09-24). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Compose a Teknik station from equipment **pieces**; Hallöversikt still shows **one** markör per station. Tap → detail includes redskapslista. CTA / sheet title: **Redigera redskap**. Entry: **hall detail only** (no Passbyggaren compose). No marker equipment badge.  
**Carry-forward (Slice 11–12):** Placeable = **Teknik** only. Icon-first markers; tap ≠ drag; Erfaren; ranks / Golvklart Teknik-only.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Erfaren · Passbyggaren  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** CAD, exakta mått, “rita på golvet”, konton, moln, Netlify, Passbyggaren-compose CTA, canvas badge / “har redskap”-pill.

Reuse Slice 11–12 tray / marker / detail chrome unless noted. Reuse ActivityDetail how / watch-for / Erfaren.

---

## Equipment library labels (locked — all 10)

Stable ids for Builder; Swedish labels for UI. **Keep all 10.** **Mattberg** = one piece (not N × matta).

| pieceId | labelSv |
| --- | --- |
| `eq-trampett` | Trampett |
| `eq-satsbrada` | Satsbräda |
| `eq-plint` | Plint |
| `eq-landningsmatta` | Landningsmatta |
| `eq-tumblingmatta` | Tumblingmatta |
| `eq-madrass` | Madrass |
| `eq-mattberg` | Mattberg |
| `eq-flickiskudde` | Flickiskudde |
| `eq-airtrack` | Airtrack |
| `eq-kon` | Kon |

Do not add custom “eget redskap” text fields this slice. Do not ship club inventory counts (“vi har 2 trampetter”).

---

## Soft hint (Hallöversikt)

Quiet one-liner — prefer **one** line; do not stack with older Slice 12 hints.

| Key | Swedish |
| --- | --- |
| `hallTileHint` | Stationerna visas som markörer. Tryck för detaljer och redskap. |
| `hallTileHintShort` | Tryck på en markör för detaljer och redskap. |
| `hallComposeHint` | Du kan sätta upp Teknik-stationer med redskap — listan syns i detaljvyn. |

Prefer `hallTileHint` (or short). Use `hallComposeHint` only if Builder needs a second line after compose ships and the primary hint is still Slice 12-only.

---

## Detail — Redskap section

| Key | Swedish |
| --- | --- |
| `stationEquipmentHeading` | Redskap |
| `stationEquipmentEmpty` | Inga redskap angivna ännu. |
| `stationEquipmentEmptyHint` | Lägg till det ni ställer upp — till exempel Trampett och Landningsmatta. |
| `stationEquipmentEdit` | Redigera redskap |
| `stationEquipmentEditAria` | Redigera redskap för stationen |
| `stationEquipmentCount` | {n}× {label} |
| `stationEquipmentOne` | {label} |
| `stationEquipmentSuggested` | Förslag — du kan ändra |
| `stationEquipmentUseSuggested` | Använd förslag |

- Prefer `stationEquipmentOne` when count === 1; otherwise `stationEquipmentCount`.
- Detail CTA locked: **Redigera redskap** only (not Bygg station / Sätt upp station).
- **No** “Lägg till i passet” from hall detail.
- `stationEquipmentSuggested` / `UseSuggested` only when seed defaults exist (selective vault / trampett / mattberg-style drills — **not** every Teknik drill).
- Legacy `Activity.equipment` free-text is **not** the Redskap list — do not surface raw mixed strings here.

---

## Compose sheet

| Key | Swedish |
| --- | --- |
| `composeTitle` | Redigera redskap |
| `composeTitleWithName` | Redigera redskap: {title} |
| `composeDone` | Klar |
| `composeClose` | Stäng |
| `composeCloseAria` | Stäng redigering av redskap |
| `composeRecipeHeading` | Dina redskap |
| `composeLibraryHeading` | Lägg till |
| `composeAddPiece` | Lägg till {label} |
| `composeRemovePiece` | Ta bort {label} |
| `composeIncrease` | Öka antal |
| `composeDecrease` | Minska antal |
| `composeEmptyRecipe` | Inga redskap i uppsättningen ännu. |
| `composeEmptyRecipeHint` | Tryck på ett redskap nedan för att lägga till det. |
| `composeMaxReached` | Du har lagt till tillräckligt många redskap för den här vyn. |

Sheet title and detail CTA stay **Redigera redskap**.  
Entry: hall detail only — no Passbyggaren compose strings this slice.  
`composeRecipeHeading`: *du*-voice (**Dina redskap**); screen-spec “Er redskap” meant the recipe section, not formal *ni*.

---

## Accessibility

| Key | Swedish |
| --- | --- |
| `hallTileA11y` | Station {rank}: {title}. Tryck för detaljer. |
| `hallTileA11yWithEquipment` | Station {rank}: {title}. Redskap angivna. Tryck för detaljer. |
| `hallTileA11yExperienced` | Station {rank}: {title}. Erfaren. Tryck för detaljer. |
| `hallTileA11yExperiencedWithEquipment` | Station {rank}: {title}. Erfaren. Redskap angivna. Tryck för detaljer. |

Keep Slice 12 a11y as default. Use `…WithEquipment` only when composition is non-empty and easy to detect. Do **not** invent canvas badge a11y (no badge this slice).

---

## Tip overrides (Hallöversikt)

| Key | Swedish |
| --- | --- |
| `tipHallPlace` | Placera Teknik-stationerna ungefär där ni brukar köra dem. De visas som små markörer — tryck för detaljer och redskap. Släpp på en zon för att fästa; på öppen yta kan du placera fritt. |
| `tipStationCompose` | Redigera redskapen ni faktiskt använder. Det sparas i utkastet och syns när du trycker på markören. |

- `tipStationCompose` is optional dismissible chrome (e.g. after first hall detail open) — soft guidance only.
- Do not invent new Teknik progressions or safety rules beyond existing activity copy.
- Keep flow tip: markörer (not brickor); Stationsordning följer passet.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 13 |

Keep **Visa tips igen** / **Om utkast**. Footer remains `no-print`.

---

## Unchanged locks

- Teknik-only placeable + silent prune (Slice 11)
- Caption: **Schematisk hall — inte exakt mått**
- Golvklart / Avsluta golvklart / Skriv ut / Visa flöde / Dölj flöde / Zooma / Placera här / Ta bort från hall
- Drag still repositions; drag-end must **not** open detail
- Icon-first markers (~52px), Erfaren, ranks among placed Teknik
- **No** equipment-count badge on markers — detail is the sole redskapslista

---

## Do not ship

- “Rita redskapen i skalenlig hall” / CAD language
- English “compose equipment rack” as primary chrome
- “Lägg till i passet” from hall detail
- Implying each mat is a separate floor pin
- Copy that places Samling / Uppvärmning / Styrka / Lek on the hall
- Passbyggaren “Redigera redskap” entry copy (out of Slice 13)
- Marker badge / “har redskap”-pill on canvas
- Suggested-equipment chrome on every Teknik drill

---

## Notes for Builder

- Prefer these keys over synonyms (“inventory”, “gear kit”, “apparatus stack”, “Bygg station”).
- Wire compose from **hall detail only**.
- Defaults: only obvious vault / trampett / mattberg-style Teknik drills.
- Soft cap (slots / count) may use `composeMaxReached` — document numbers in ship notes.
- Full tip pack: align `coach-tips.sv.md` / `station-tiles.sv.md` hallTileHint with the soft-hint table above.
