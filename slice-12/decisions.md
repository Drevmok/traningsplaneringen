# Slice 12 — locked decisions

**Status:** **APPROVED by Christoffer 2026-09-24**  
**Direction approved:** visual tiles + tap-to-detail now; equipment composition later (2026-09-24)

## A. What a floor tile shows

**Lock:** Canvas placed tile = **marker**:

| Element | On canvas |
|---|---|
| Activity visual icon | Primary (larger than Slice 11 chip text row) |
| Station rank | Small badge (1…N among placed Teknik) |
| Title | Optional ultra-short / hidden on floor; always in `aria-label` and in detail |
| Duration | Hidden (Slice 11) |
| Erfaren | Compact badge or corner mark — must remain visible for safety |

**Rejected:** Full title + meta text card on the floor (clutters; fights the goal).  
**Rejected:** Dot with no icon (not recognizable as the station).

## B. Tap vs drag

**Lock:**

- **Tap/click** placed canvas tile → open station detail (read-only ActivityDetail or equivalent).
- **Drag** still repositions; finishing a drag must **not** open detail.
- Phone tray unplaced: keep Slice 11 place-mode (tap selects for Placera här); detail opens from placed tiles (and optionally a explicit “info” control if Builder needs disambiguation — prefer pure tap-on-placed first).

## C. Detail content

**Lock:** Reuse existing activity detail content (how-to, watch-for, Erfaren warning). Hall mode stays read-only (no “add to pass” from hall detail).  
**Rejected:** Building a second parallel detail UI from scratch this slice.

## D. Equipment composition

**Lock:** Out of scope. Track as future slice (equipment pieces → compose station). No data-model fields for equipment inventory in Slice 12.

## E. Carry-forwards

- Placeable = Teknik only; silent prune non-Teknik
- Caption: Schematisk hall — inte exakt mått
- gymnaster / pass
- Footer Träningsplaneraren · Slice 12 when shipped
