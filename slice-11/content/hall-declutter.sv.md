# Hallöversikt declutter — svensk microcopy (Slice 11)

**Status:** Docs lock — Christoffer approved Slice 11 (2026-09-24). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Placeable = **Teknik** (`techniques`) only. Not on hall: Samling, Uppvärmning, Styrka, Lek och spel.  
**Locked terms:** gymnaster · pass · övning · station / stationer · Hallöversikt · Golvklart · Erfaren · Passbyggaren  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope:** nya övningar, cirkel-som-stationer, CAD, pin-only bricks without titles.

This file **supersedes** Slice 05–07 hall tray wording that implied all pass övningar belong on the floor. Reuse unchanged Golvklart / Hallayout / zoom chrome unless noted below.

---

## Soft note (always available)

Quiet one-liner under caption or above tray — does not block CTAs.

| Key | Swedish |
| --- | --- |
| `hallStationsOnlyHint` | Endast Teknik-stationer placeras på hallen. Samling, Uppvärmning, Styrka och Lek och spel planeras i Passbyggaren. |

---

## Empty — pass has items but no Teknik

| Key | Swedish |
| --- | --- |
| `hallNoStationsTitle` | Inga Teknik-stationer ännu |
| `hallNoStationsBody` | Lägg till övningar under Teknik i Passbyggaren — sedan kan du placera dem här. |
| `hallNoStationsCta` | Tillbaka till Passbyggaren |

Hallöversikt stays openable (CTA not disabled solely for missing Teknik). Show this empty canvas + empty tray instead of listing warmups/etc.

---

## Tray & drop (Teknik only)

| Key | Swedish |
| --- | --- |
| `hallUnplaced` | Ej placerade |
| `hallUnplacedStations` | Ej placerade stationer |
| `hallUnplacedWithCount` | Ej placerade ({n}) |
| `hallTrayEmptyStations` | Alla Teknik-stationer är placerade. |
| `hallAllPlaced` | Alla Teknik-stationer är placerade. |
| `hallDragHint` | Dra Teknik-stationer till hallen. Placeringen sparas med utkastet. |
| `hallDropHintStations` | Dra Teknik-stationer hit, eller välj en och tryck Placera här. |
| `hallDropHintShort` | Dra en Teknik-station hit |
| `hallPlaceHere` | Placera här |
| `hallRemove` | Ta bort från hall |

- Prefer tray heading **Ej placerade stationer** (`hallUnplacedStations`) when space allows; short **Ej placerade** is OK with count.
- `hallAllPlaced` / `hallTrayEmptyStations` are the same coach meaning — pick one key in code.
- Supersedes Slice 05 `Alla övningar är placerade i hallen` / `Dra övningar till hallen…`.

---

## Counts & Golvklart soft banner

Only **unplaced Teknik** count. Never include Samling / Uppvärmning / Styrka / Lek.

| Key | Swedish |
| --- | --- |
| `hallStationCount` | {n} stationer |
| `hallStationCountOne` | 1 station |
| `hallUnplacedBanner` | {n} stationer ej placerade |
| `hallUnplacedBannerOne` | 1 station ej placerad |

Header activity count on Hallöversikt/Golvklart should use station wording when showing the placeable set (not total pass övningar).

---

## Compact canvas chips (copy notes)

No new marketing strings — visual only:

- Show: station rank (when placed), icon, truncated title, **Erfaren** when needed.
- **Hide** duration on canvas (`{n} min` stays in Passbyggaren / tray if space).
- Do not ship pin-only markers without titles.
- Accessible name still includes rank when placed: `{n}. {title}`.

---

## Slice 09 tips — Teknik stations (authoritative overrides)

Update these keys wherever Builder stores Slice 09 copy:

| Key | Swedish |
| --- | --- |
| `komIgangStep3` | Öppna Hallöversikt och placera stationer |
| `komIgangStep3Hint` | Dra Teknik-stationerna ungefär dit ni brukar vara i hallen. |
| `tipHallPlace` | Placera Teknik-stationerna ungefär där ni brukar köra dem. De visas som små markörer — tryck för detaljer och redskap. Släpp på en zon för att fästa; på öppen yta kan du placera fritt. |
| `tipHallFlowGolvklart` | Siffrorna följer Teknik-stationernas ordning i passet, inte var markörerna står i hallen. **Golvklart** är till för att visa gruppen — skriv ut eller håll upp skärmen. |

Always-on one-liners (replace older “övningar” variants):

- `Dra Teknik-stationer till hallen. Placeringen sparas med utkastet.`
- `Släpp på en zon för att fästa stationen där. På öppen yta kan du placera fritt.`
- Keep: **Stationsordning följer passet** (among placed Teknik only).

Do not invent technique progressions. Full tip pack still lives in `coach-tips.sv.md` (Slice 09) — wording there should match this table.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 11 |

Keep **Visa tips igen** / **Om utkast** from prior slices. Footer remains `no-print`.

---

## Unchanged locks

- Caption: **Schematisk hall — inte exakt mått**
- Zones / presets / snap / Hallayout labels from Slices 05–06
- Golvklart / Avsluta golvklart / Skriv ut / Visa flöde / Dölj flöde / Zooma in / Zooma ut
- **Erfaren** badge on Teknik stations
- Passbyggaren still lists all five blocks

---

## Do not ship

- Copy that says “placera alla övningar” or lists warmups in the hall tray.
- “Styrka-stationer” / cirkel as floor stations (rejected this slice).
- English “stations only” as primary chrome.
- Disabling Hallöversikt until Teknik exists (empty state instead).

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“bara teknik”, “floor items”, “declutter mode”).
- Single filter source: `blockType === 'techniques'`; prune non-Teknik placements silently.
- Wire Slice 09 tip keys above so Kom igång / tip-hall-place match the product lock.
