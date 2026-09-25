# Slice 15 — locked decisions (APPROVED)

**Status:** **APPROVED 2026-09-25** (Christoffer)  
**Direction:** Read-only Förrådslista — aggregate packing list across the pass (Scout idea 3 Approved 2026-09-25)

Pack is **locked**. Docs polish → Builder implement → Planner pings Verifier after ship.

## A. What Slice 15 adds

**Lock:** A **read-only** aggregate packing list (**Förrådslista**) that merges all **non-empty** `SessionItem.stationEquipment` on the current draft pass by `pieceId`, **sums** counts, and shows Swedish labels from the fixed 10-piece library.

| Surface | Förrådslista? |
|---|---|
| Hallöversikt **edit** chrome | **Yes** — locked entry point |
| **Golvklart** (floor mode) | **Yes** — locked entry point |
| Passbyggaren | **No** |
| Home / Kom igång | **No** (idea 2 is a later slice) |
| Canvas under markör | **No** (Slice 14 owns per-station lines) |

**Rejected (standing):** Custom equipment CRUD.  
**Rejected (standing):** Club inventory counts (“vi har N i förrådet”).  
**Rejected (standing):** CAD pins / Passbyggaren compose / canvas badge.

## B. Data source (reuse Slice 13 — no new model)

**Lock:** Read only `SessionItem.stationEquipment` on Teknik items in the draft (already device-local).

| State on a station | Aggregate contribution |
|---|---|
| `undefined` (unset) | **Omit** (quiet) — locked E |
| `[]` (coach cleared) | **Omit** (quiet) — locked E |
| Non-empty array | Include each slot; merge by `pieceId`, **sum** counts |

**Lock:** Do **not** promote seed `defaultStationEquipment` (förslag) into the aggregate. Förslag remain hall-detail / compose only (Slice 13 D / Slice 14 B).

**Lock:** Resolve `pieceId` → Swedish `labelSv` via `EQUIPMENT_PIECES` / `getEquipmentPiece`. Ignore unknown ids (same sanitize spirit as Slice 13).

**Lock — aggregate totals:** Per-station soft caps (8 slots / count ≤ 9) stay for compose. The **packing list may show summed totals > 9** when the same piece appears on multiple stations (e.g. 3 stations × 2 Landningsmatta → `6× Landningsmatta`). Do **not** clamp the aggregate to `STATION_EQUIPMENT_MAX_COUNT`.

**Rejected:** Overloading legacy `Activity.equipment: string[]`.  
**Rejected:** Persisting a separate “förråd” document — derive on the fly from session items.

## C. Line format

**Lock:** Reuse Slice 13/14 vocabulary:

- **count === 1:** `{label}` only (`stationEquipmentOne` / Förråd alias)
- **count > 1:** `{count}× {label}` (`stationEquipmentCount` / Förråd alias), Unicode ×

## D. Sort order — locked C

**Lock:** **Library order** (`EQUIPMENT_PIECES` array order: Trampett → … → Kon). Stable; matches compose “Lägg till” mental model; does not reshuffle as coaches compose.

Alternatives: count descending (largest need first — useful for packing urgency); alphabetical Swedish (`sv` locale).

## E. Entry points — locked A

**Lock:** **Both** — Hallöversikt **edit** header actions **and** Golvklart header.

- Edit: coach is composing / placing — packing list rewards compose without leaving prep.
- Golvklart: coach is about to show the floor / print — last check before pulling mats.

Same sheet component; two CTAs. Do **not** require compositions to enter Golvklart.

**Rejected default:** Passbyggaren entry (compose stays hall-detail-only).

## F. UI chrome — locked B

**Lock:** **Bottom sheet** (phone-first), patterned after `StationComposeSheet` but **read-only** (title + list + Stäng; no +/−).

- Not a full-screen dedicated route that replaces Hallöversikt.
- Not only a permanent section under Golvklart (would hide edit-prep use).
- Optional: if opened from Golvklart and list is long, sheet still scrolls; keep header chrome usable.

## G. Print — locked D

**Lock:** **Include** Förrådslista on **print** as a compact block **after** the schematic + caption (or below the print title strip as a short “Ta med från förrådet” list) when the aggregate is non-empty.

Rationale: coaches often walk to the förråd with paper; Slice 14 already prints per-station lines — aggregate is the packing checklist. Quiet when aggregate empty (no empty print block).

Screen-only print is rejected for this slice; include the block when non-empty.

## H. Empty / partial states

**Lock:**

- **Empty aggregate** (no station has non-empty `stationEquipment`): show empty title + short nudge that reuses / points at existing compose wording (**Redigera redskap** / “Inga redskap angivna ännu” spirit). Do **not** invent inventory language. Soft CTA copy may say to open a markör → **Redigera redskap** (no new compose entry surface).
- **Partial:** only composed stations contribute; no “Saknas på N stationer” warning required this slice (keep quiet; optional Docs one-liner deferred).
- List is **not** a compose entry itself — tapping a row does nothing required (optional future: jump to first station using that piece — **out**).

## I. Interaction

**Lock:** Read-only. Opening Förrådslista does not change placements, compositions, or Golvklart mode.

**Lock:** Do **not** block Golvklart if aggregate is empty.

**Lock:** Closing the sheet returns to the surface it was opened from (edit or Golvklart).

## J. Carry-forwards (unchanged)

- Placeable = Teknik only; silent prune non-Teknik
- Caption: **Schematisk hall — inte exakt mått**
- Tap placed → detail; drag ≠ detail (edit)
- Compose = hall detail **Redigera redskap** only
- No canvas equipment badge; no CAD pins
- Slice 14 under-markör redskap on Golvklart + print intact
- gymnaster / pass / Swedish UI
- Device-local drafts; no accounts / cloud
- **Netlify out of this pack**
- Footer `Träningsplaneraren · Slice 15` when shipped
- Kom igång compose step = **later slice** (idea 2)

---

## LOCKED ANSWERS — A–F

| # | Topic | Locked answer |
|---|---|---|
| **A** | Entry points | **Both** — Hallöversikt edit chrome **and** Golvklart. Same sheet; do not block Golvklart. |
| **B** | UI | **Bottom sheet** (read-only), phone-first — not a dedicated full-screen panel; not Golvklart-only section. |
| **C** | Sort order | **Library order** (`EQUIPMENT_PIECES`). Stable; matches compose library. |
| **D** | Print | **Include** compact Förrådslista on print when aggregate non-empty (after schematic/caption); quiet if empty. |
| **E** | Unset / `[]` stations | **Omit** from aggregate (quiet). Confirm — matches Slice 14 floor quiet. No förslag in sum. |
| **F** | Footer | **Yes** — `Träningsplaneraren · Slice 15` when shipped. |

Christoffer approved all Planner recommendations on 2026-09-25. A–F are binding for Slice 15.

## Standing locks (confirmed — do not reopen)

| Topic | Answer |
|---|---|
| Library | Fixed 10 pieces; no custom CRUD |
| Inventory | No “vi har N i förrådet” |
| Source | `SessionItem.stationEquipment` only |
| Compose entry | Hall detail only |
| Badge / CAD / Passbyggaren compose | Out |
| Teknik-only + Slice 11–14 | Intact |
| Caption | Unchanged (**Schematisk hall — inte exakt mått**) |
| Golvklart gate | Do not block |
| Kom igång (idea 2) | Not this pack |
| Netlify | Out of pack |
| Swedish / gymnaster / pass / device-local | Intact |
