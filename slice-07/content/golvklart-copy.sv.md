# Golvklart, flöde & telefon — svensk microcopy (Slice 07)

**Status:** Docs lock — Christoffer approved Slice 07 (2026-09-24). Strings align with `screen-spec-floor-ready.md` / `decisions.md`. Builder may start from these keys.  
**Tone:** Same as Slice 05–06 Hallöversikt / Hallayout.  
**Terminologi:** **gymnaster**, **pass**. Caption unchanged: **Schematisk hall — inte exakt mått**.  
**Out of scope:** nya övningar, snap/preset-omskrivning, CAD, dela-länkar, PDF-export.

Reuse Slice 05–06 keys for back, tray, Placera här, Hallayout, Erfaren, Övning saknas, zones, etc.

**Slice 14:** Redskap lines under Teknik markörer in Golvklart/print — see `golvklart-redskap.sv.md` (under `docs/` and `slice-14/content/`). This file stays Golvklart chrome only.

---

## Golvklart (floor-ready)

| Key | Swedish |
| --- | --- |
| `hallFloorReady` | Golvklart |
| `hallFloorReadyShort` | Visa för golvet |
| `hallExitFloor` | Avsluta golvklart |
| `hallPrint` | Skriv ut |
| `hallUnplacedBanner` | {n} övningar ej placerade |
| `hallUnplacedBannerOne` | 1 övning ej placerad |
| `hallFloorModeLabel` | Golvklart |

- Primary CTA on hall header (edit mode): **Golvklart**.
- `hallFloorReadyShort` is secondary help / Docs only — not required on the button.
- Exit: **Avsluta golvklart** → back to editable Hallöversikt.
- Print: **Skriv ut** (required at least in Golvklart).
- Soft unplaced banner does **not** block entry. Prefer singular `hallUnplacedBannerOne` when n = 1; plural otherwise. Plural-only for all n ≥ 1 is OK for first ship if meaning stays clear.
- Optional duration in Golvklart header: `{n} min` (same total as Passbyggaren).
- Optional read-only preset name: reuse Swedish preset labels (Standard trupp / Tävling / linjer / Liten hall) — no “Hallayout”-select chrome in floor mode.

---

## Stationsordning & flöde

| Key | Swedish |
| --- | --- |
| `hallShowFlow` | Visa flöde |
| `hallHideFlow` | Dölj flöde |
| `hallStationOrderHint` | Stationsordning följer passet |

- Toggle: **Visa flöde** / **Dölj flöde** (`aria-pressed` if toggle pattern).
- Tray or header muted hint: **Stationsordning följer passet.**
- Badges **1…N** only on *placed* canvas chips; tray chips have no number.
- Chip accessible name includes number: `{n}. {title}` (e.g. `3. Ljushopp på trampett`).
- Do not invent “Banor”, “Rutt med mått”, or English “Show flow” as primary chrome.
- Flow is an order hint — not a measured path on the floor.

---

## Telefon (≤768px) — short chrome only

Most phone polish is interaction (sticky tray, pan vs drag, zoom). Extra chrome only if Builder ships visible controls:

| Key | Swedish |
| --- | --- |
| `hallZoomIn` | Zooma in |
| `hallZoomOut` | Zooma ut |
| `hallPlaceHere` | Placera här *(keep from Slice 05)* |
| `hallRemove` | Ta bort från hall *(keep)* |

- Visible “+” / “−” OK; `aria-label` = Zooma in / Zooma ut.
- Pinch-only zoom needs no extra strings.
- Sticky tray uses existing **Ej placerade** / tray help — no new tray title.

---

## Keep from prior slices

| Key | Swedish |
| --- | --- |
| `hallSchematicNote` | Schematisk hall — inte exakt mått |
| `hallOverview` | Hallöversikt |
| `hallBack` | Tillbaka till Passbyggaren |
| `hallRemove` | Ta bort från hall |
| `hallPlaceHere` | Placera här |
| `hallExperiencedShort` | Erfaren |
| `hallExperienced` | Erfaren ledare |
| `hallMissingActivity` | Övning saknas |
| `hallDragHint` | Dra övningar till hallen. Placeringen sparas med utkastet. |
| `hallSnapHint` | Släpp på en zon för att fästa övningen där. På öppen yta kan du placera fritt. |

---

## Empty / edge (Golvklart)

| State | Copy |
| --- | --- |
| All placed | No unplaced banner |
| Some unplaced | Soft banner (`hallUnplacedBanner` / One); still enter Golvklart |
| Zero placed | Schematic + title + banner with full N; flow empty; **Skriv ut** still allowed |
| Empty pass | Should not reach hall — existing **Inga övningar i passet ännu.** |

---

## Kort tips till nya tränare

> Siffrorna följer passets ordning, inte var chipset står i hallen. Golvklart är till för att visa gruppen — skriv ut eller håll upp skärmen.

> På telefonen: dra på tom yta för att panorera; dra på en övning för att flytta den. Zooma om zonen känns liten.

Use at most one tip near the station-order hint or under Golvklart the first time. Do **not** add a modal.

---

## Do not invent

- English “Floor ready”, “Print view”, “Show flow” as primary chrome
- “PDF”, “Exportera hall”, “Dela” as Slice 07 CTAs
- Copy that blocks Golvklart until all övningar are placed
- Synonyms that sound like CAD paths (“Banplan med mått”, “Rutt”)

---

## Notes for Builder

- Prefer these strings over inventing synonyms.
- Keep **pass** / **övning** / **gymnaster** consistent with Slice 01–06.
- Flow layer is decorative (`aria-hidden`); chip names carry the station number.
- Print CSS hides edit chrome; keep title, schematic, chips + numbers, caption, flow if on.
