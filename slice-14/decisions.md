# Slice 14 — locked decisions (APPROVED)

**Status:** **APPROVED 2026-09-25** (Christoffer)  
**Direction:** Golvklart & print show composed redskap under each numbered Teknik station (2026-09-25 backlog Approve + pack lock)

Pack is **locked**. Docs polish → Builder implement → Planner pings Verifier after ship.

## A. What Slice 14 adds

**Lock:** Surface existing `SessionItem.stationEquipment` on **Golvklart** and **`@media print`**, under each **numbered** placed Teknik markör.

| Surface | Redskap under markör? |
|---|---|
| Hallöversikt **edit** canvas | **No** (no under-marker list; **no** equipment badge) |
| **Golvklart** (floor mode) | **Yes** when composition non-empty |
| **`@media print`** | **Yes** when composition non-empty |

**Rejected:** Equipment-count badge on the marker tile (parked).  
**Rejected:** Separate CAD pins per piece.  
**Rejected:** Passbyggaren compose entry (still parked / Slice 13 lock).

## B. Data source (reuse Slice 13 — no new model)

**Lock:** Read only `SessionItem.stationEquipment` (already device-local with the draft).

| State | Floor / print |
|---|---|
| `undefined` (unset) | **Quiet** — no lines, no “inga redskap” |
| `[]` (coach cleared) | **Quiet** — nothing shown |
| Non-empty array | Show ordered lines from saved slots |

**Lock:** Do **not** promote seed `defaultStationEquipment` (förslag) onto Golvklart/print. Förslag remain hall-detail / compose only (Slice 13 D).

**Lock:** Resolve `pieceId` → Swedish `labelSv` via the fixed 10-piece library (`equipmentPieces.ts` / `docs/station-compose.sv.md`). Ignore unknown ids (same sanitize spirit as Slice 13).

**Rejected:** Overloading legacy `Activity.equipment: string[]` on floor/print.

## C. Line format

**Lock:** Prefer `{count}× {label}` (Unicode ×) when count > 1.

**Lock (Q A — APPROVED):** For `count === 1`, use detail’s omit-× form — `{label}` only (`stationEquipmentOne` / `hallFloorEquipmentOne`). **Not** always `1× {label}`.

**Carry-forward keys (Slice 13):** `stationEquipmentCount` = `{n}× {label}`; `stationEquipmentOne` = `{label}`. Floor may alias as `hallFloorEquipmentCount` / `hallFloorEquipmentOne` with the same strings.

## D. Layout placement

**Lock (Q C — APPROVED):** Render equipment as **compact text under each numbered Teknik markör** (same anchor family as print’s `hall-chip-title--print`), **not** a side list beside the schematic.

- Keep icon + rank (+ Erfaren) as Slice 12 anatomy.  
- Equipment lines sit **below** the 52px tile (and below short title in print when both show).  
- **Lock (Q B — APPROVED):** Show **all** soft-capped slots (≤8 lines). **No** “+N till” truncation. CSS wraps tightly.  
- Side-list alternative: **rejected**.

**Rejected:** Expanding the edit-mode marker into a text card.  
**Rejected:** Mini blueprint drawings of trampett+mat on the floor.

## E. Golvklart vs edit visibility

**Lock:** Under-marker redskap is a **floor + print** feature.

Implementable approach (Builder choice of mechanism, same outcome):

- DOM may live on canvas `HallChip` when non-empty, but CSS shows it only under `.hall-canvas.is-floor` and `@media print`; **hidden in edit**.  
- Or pass `hallMode` / `showEquipmentLines` into `HallChip` and render only when floor (print still needs lines when printing from Golvklart).

**Lock:** Edit Hallöversikt must not gain an equipment **badge** on markers.

## F. Print behavior

**Lock:** Print keeps:

- Title / session meta strip (`print-only`)
- Schematic + numbered Teknik markers
- Short activity title under marker (`hall-chip-title--print`) when already shipped
- Caption **Schematisk hall — inte exakt mått**
- Hide edit chrome / tray / tips / footer (`no-print`) as today

**Lock:** Add equipment lines under the marker (after short title) when composition non-empty.

**Lock:** Print may be triggered from Golvklart **Skriv ut** (`window.print()`); pack does not require print from edit mode.

**Lock (Q D — APPROVED):** On **Golvklart screen**, show equipment lines only; short station title stays **print-only** as today (do not also show short title on the Golvklart screen).

## G. Interaction

**Lock:** Golvklart stays read-only for placement (no drag / no tray). Tap markör → detail (Slice 12–13) still works; compose remains **Redigera redskap** from detail only.

**Lock:** Floor equipment lines are **not** a tap target / not a compose entry. No new CTA on the canvas.

## H. Carry-forwards (unchanged)

- Placeable = Teknik only; silent prune non-Teknik  
- Caption: **Schematisk hall — inte exakt mått**  
- Tap placed → detail; drag ≠ detail (edit)  
- gymnaster / pass / Swedish UI  
- Device-local drafts; no accounts / cloud  
- **Netlify out of this pack**  
- Footer `Träningsplaneraren · Slice 14` when shipped  
- Slice 13 compose library (all 10), Mattberg one piece, selective defaults in detail only  
- No canvas equipment badge; no Passbyggaren compose entry  

## Locked answers (former open questions A–D)

| # | Topic | Locked answer (Christoffer 2026-09-25) |
|---|---|---|
| **A** | Count === 1 format | `{label}` only (omit ×) — match Slice 13 detail; not always `1× {label}` |
| **B** | Many pieces clutter | Show all lines up to soft cap **8**; no “+N till” truncation |
| **C** | Under-markör vs side list | **Under** each numbered Teknik markör (not a side list) |
| **D** | Short title on Golvklart screen | Equipment lines on Golvklart screen; short title stays **print-only** as today |

## Standing locks (confirmed)

| Topic | Answer |
|---|---|
| Surfaces | Golvklart + `@media print` |
| Source | `SessionItem.stationEquipment` |
| Unset / `[]` | Quiet — nothing shown |
| Badge / CAD / Passbyggaren compose / Netlify | Out |
| Teknik-only + Slice 12–13 | Intact |
| Caption | Unchanged (**Schematisk hall — inte exakt mått**) |
| Footer when shipped | Träningsplaneraren · Slice 14 |
| Swedish / gymnaster / pass / device-local | Intact |
