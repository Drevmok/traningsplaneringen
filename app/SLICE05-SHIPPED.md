# Slice 05 — SHIPPED

**Date:** 2026-09-24  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-05/` (+ locked copy `slice-05/content/hall-oversikt-copy.sv.md`)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run dev   # http://localhost:5173
npm run build # production check — green
```

## Features shipped

1. **Hallöversikt CTA** in Passbyggaren actions — enabled when ≥1 övning; disabled with title/aria “Lägg till minst en övning först”.
2. **App view `hall`** beside `home` | `builder`. Back → **Tillbaka till Passbyggaren** (same draft, not Home). Empty-pass button uses **Till Passbyggaren**.
3. **Generic `generic-trupp` canvas** with five zones: Öppen yta, Trampett, Tumbling, Satsbräda, Mattor + caption **Schematisk hall — inte exakt mått**.
4. **Unplaced tray** (`Ej placerade (N)`); new items start unplaced; empty = “Alla övningar är placerade i hallen.”; help + coach tip (no modal).
5. **Place / move / remove:** HTML5 mouse DnD tray→canvas and reposition; **Ta bort från hall** (×) or drag-back to tray; soft `zoneId` on drop (no snap).
6. **Persist:** `saveDraft` on every placement change; key remains `gymnastics-planner-draft-v1`.
7. **Chips:** VisualIcon (~36px block size) + BLOCK_COLORS tint + Swedish title + duration; compact **Erfaren** badge; missing → **Övning saknas**.
8. **Safety:** tap placed chip → ActivityDetail `readOnly` (add actions hidden); experienced `role="alert"` warning still shown.
9. **Phone (≤768):** stacked header → canvas → tray; horizontal tray scroll; ≥44px taps.
10. **Phone alternate place path:** tap unplaced chip (selects place-mode) → tap canvas (**Placera här**). Mouse DnD still works on desktop.

## Data model notes

- Types: `HallZoneId`, `HallTemplateId`, `HallPlacement`; `Session.hallPlacements?`, `Session.hallTemplateId?`.
- Normalized chip-center coords `[0,1]`; optional soft `zoneId`.
- `loadDraft` migrates missing hall fields → `[]` / `generic-trupp`; clamps; prunes orphans.
- `removeItem` → `pruneHallPlacements`.
- Template replace (`cloneTemplate`) → `clearHallPlacements`.
- **`moveItemToBlock` keeps `SessionItem.id`** so hall placements survive cross-block moves (preferred path from data-model.md).

## Phone alternate place path

**Shipped:** On narrow viewports (`max-width: 768px`), tap an unplaced tray chip to enter place-mode, then tap the canvas to place. Desktop relies on HTML5 drag-and-drop. Place-mode outline + “Placera här” hint shown while active.

## Files changed / added

**Added**

- `src/lib/hall.ts` — helpers, zone bboxes/labels, migrate
- `src/components/HallBoard.tsx`
- `src/components/HallCanvas.tsx`
- `src/components/HallChip.tsx`
- `SLICE05-SHIPPED.md`

**Updated**

- `src/types.ts` — hall types + Session extension
- `src/lib/session.ts` — migrate/prune/clear; keep item id on move; blank/template defaults
- `src/data/blockMeta.ts` — locked Swedish UI keys
- `src/App.tsx` — `hall` view; footer Slice 05
- `src/components/SessionBuilder.tsx` — Hallöversikt CTA + `onOpenHall`
- `src/components/ActivityDetail.tsx` — `readOnly` mode
- `src/App.css` — hall layout / chips / phone

## Gaps / deferred (not FAIL)

- No snap-to-zone / magnetic pull (Slice 06)
- No flow arrows / station order / print (Slice 07)
- No club-specific layouts, export, library edits
- Keyboard full drag not implemented (mouse DnD + phone Placera här sufficient for 05)
- Optional “Placering sparad” toast not shown (silent auto-save on change)

## Regression preserved

Slice 01–04: totals = item sum, soft mismatch, templates, drafts, phone sheets, VisualIcon tiles, 28 drills, experienced badge/warning, export stub.
