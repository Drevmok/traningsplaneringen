# Slice 08 — SHIPPED

**Date:** 2026-09-24  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-08/` (polish / cleanup)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run dev   # http://localhost:5173
npm run build # production check — green
```

## Changes shipped

1. **P08-01 Footer:** visible app footer is exactly **Träningsplaneraren · Slice 08**. Historical Slice 01–07 records were not changed.
2. **P08-02 Silent placement save:** removed the unused `hallPlacementSaved` / **Placering sparad** UI key. Placement, removal, and preset auto-save remain silent; explicit builder save still uses **Utkast sparat**.
3. **P08-03 Phone tray:** kept the sticky **Ej placerade** tray and horizontal chip behavior, added bottom safe-area padding, and reserve the measured full tray height as canvas scroll padding so the last drop area can be reached above the tray.
4. **P08-05 Swedish accessibility:** added **Zooma** for the zoom group while preserving **Zooma in** and **Zooma ut** on the directional controls. The canonical hall caption remains **Schematisk hall — inte exakt mått**.
5. **P08-08 Golvklart print:** retained the CSS-only A4 landscape print path and added date to the compact print-only title/meta strip when available. Print hides floor heading duplication, edit chrome, navigation/footer, tray, and actions while retaining the schematic, zones, caption, station numbers, flow, and unplaced banner.

## Verification

- `npm run build` — green.
- Active source contains no `hallPlacementSaved` or **Placering sparad** reference.
- `savedToast: 'Utkast sparat'` remains used by the explicit builder save action.
- Storage key and hall placement behavior were not changed.

## Files changed / added

**Added**

- `SLICE08-SHIPPED.md`

**Updated**

- `src/App.tsx` — footer Slice 08.
- `src/App.css` — phone tray safe-area/reserved canvas space and single-title print rules.
- `src/data/blockMeta.ts` — removed dead placement-save copy; added `hallZoom`.
- `src/components/HallBoard.tsx` — measured tray reservation, Swedish zoom group label, print date metadata.

## Blockers / deviations

None.

## Scope guard

No keyboard drag, new drills, coach filter, new routes, hall reorder, new snap rules, PDF/export library, caption rewrite, or storage-key change was introduced.
