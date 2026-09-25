# Stationmarkörer & detaljer — svensk microcopy (Slice 12)

**Status:** Docs lock — Christoffer approved Slice 12 (2026-09-24). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Placed canvas tiles = **icon-first markers** (not text cards). Tap placed → station detail; drag must not open detail.  
**Carry-forward (Slice 11):** Placeable = **Teknik** (`techniques`) only. Not on hall: Samling, Uppvärmning, Styrka, Lek och spel.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · Hallöversikt · Golvklart · Erfaren · Passbyggaren  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Slice 13:** Equipment compose lives in `station-compose.sv.md` (hall detail **Redigera redskap**).
**Out of scope (Slice 12):** equipment composition, CAD, new placeable blocks, add-from-hall, parallel detail UI.

Reuse Slice 11 tray / empty / unplaced-banner strings unless noted. Reuse ActivityDetail read-only content (how / watch-for / Erfaren).

---

## Soft hint (Hallöversikt)

Quiet one-liner near caption or above canvas — does not block place/drag.

| Key | Swedish |
| --- | --- |
| `hallTileHint` | Stationerna visas som markörer. Tryck för detaljer och redskap. |
| `hallTileHintShort` | Tryck på en markör för detaljer och redskap. |

Prefer `hallTileHint` once; use short on very tight phone layouts.

---

## Accessibility (placed marker)

| Key | Swedish |
| --- | --- |
| `hallTileA11y` | Station {rank}: {title}. Tryck för detaljer. |
| `hallTileA11yNoRank` | {title}. Tryck för detaljer. |
| `hallTileA11yExperienced` | Station {rank}: {title}. Erfaren. Tryck för detaljer. |

- Title lives in `aria-label` (and detail) even when hidden on the floor.
- Include rank when the station is placed and numbered.
- Append Erfaren in a11y when the badge is shown.

---

## Detail sheet (hall)

| Key | Swedish |
| --- | --- |
| `hallDetailClose` | Stäng |
| `hallDetailCloseAria` | Stäng stationsdetaljer |
| `hallDetailReadonlyNote` | *(optional, Docs only — usually omit in UI)* Visar stationen — ändringar görs i Passbyggaren. |

- Reuse existing **Stäng** / `tipClose` if already wired; do not invent “Klar” / “Tillbaka till hall” unless Builder needs a second exit.
- **No** “Lägg till i passet” / add-from-hall actions.
- Content: same ActivityDetail read-only (name, visual, duration, how-to, watch-for, Erfaren warning when applicable).

---

## Marker anatomy (copy notes — visual, not marketing)

On canvas show:

- Activity icon (primary)
- Station rank badge (1…N among placed Teknik)
- Compact **Erfaren** mark when needed

Hide on **edit** canvas: duration; full/short title under markör (declutter).  
Tray may keep a short title for pick/drag.  
**Golvklart screen** + **print** show the short title under the markör (Slice 17 — [`golvklart-short-titles.sv.md`](./golvklart-short-titles.sv.md)); stack redskap below when present.

Do **not** ship: wide text cards on the floor, dots with no icon, pin-only without recognizable station visual.

---

## Slice 09/11 tip overrides (markers + tap)

Align these keys with Slice 12 (update wherever Builder stores tip copy):

| Key | Swedish |
| --- | --- |
| `tipHallPlace` | Placera Teknik-stationerna ungefär där ni brukar köra dem. De visas som små markörer — tryck för detaljer och redskap. Släpp på en zon för att fästa; på öppen yta kan du placera fritt. |
| `tipHallFlowGolvklart` | Siffrorna följer Teknik-stationernas ordning i passet, inte var markörerna står i hallen. **Golvklart** är till för att visa gruppen — skriv ut eller håll upp skärmen. |

Always-on one-liners (prefer over older “brickor/kort” wording):

- `Dra Teknik-stationer till hallen. Placeringen sparas med utkastet.`
- `hallTileHint` / `Stationerna visas som små markörer…`
- Keep: **Stationsordning följer passet** · **Schematisk hall — inte exakt mått**

Do not invent technique progressions or equipment lists.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 12 |

Keep **Visa tips igen** / **Om utkast**. Footer remains `no-print`.

---

## Unchanged locks

- Teknik-only placeable + silent prune (Slice 11)
- Caption: **Schematisk hall — inte exakt mått**
- Golvklart / Avsluta golvklart / Skriv ut / Visa flöde / Dölj flöde / Zooma / Placera här / Ta bort från hall
- Tray empty / no-Teknik empty from Slice 11
- Drag still repositions; drag-end must **not** open detail

---

## Do not ship

- “Kort” / “bricka med hela titeln” as the primary description of floor tiles.
- Equipment composition copy (“bygg station av redskap”).
- “Lägg till i passet” from hall detail.
- English “tap marker for details” as primary chrome.

---

---

## Canvas remove hit target (Slice 20)

Edit canvas only: enlarge remove control hit area to **≥44×44px**. Keep existing label / aria:

| Key | Swedish |
| --- | --- |
| `hallRemove` | Ta bort från hall |

- Tap markör (not on remove) → detail; drag ≠ detail; Golvklart has **no** remove.
- **No** B2 detail text button this slice.
- Strings: [`dirty-stang.sv.md`](./dirty-stang.sv.md).

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“ikon-pin”, “station card”, “info sheet”).
- Wire `hallTileA11y*` on placed markers; use movement threshold so drag ≠ detail.
- Reuse ActivityDetail readOnly — no second detail system this slice.
- Full tip pack: `coach-tips.sv.md` should match the tip overrides above.
