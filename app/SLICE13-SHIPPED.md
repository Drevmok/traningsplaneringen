# Slice 13 — SHIPPED

**Date:** 2026-09-24 (Europe/Stockholm)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-13/` (compose stations from equipment pieces)  
**Copy authority:** `docs/station-compose.sv.md` (Docs lock; pack mirror `slice-13/content/station-compose.sv.md`)

## Goal delivered

Coaches compose a Teknik station from a fixed Swedish **redskap** library. Hallöversikt still places **one** Slice-12 marker per station. Tap → hall detail shows activity **plus** redskapslista. CTA **Redigera redskap** opens compose from **hall detail only**.

## Features shipped

1. **Types & persistence** — `SessionItem.stationEquipment?: StationEquipmentSlot[]` (`{ pieceId, count }`). Legacy `Activity.equipment?: string[]` untouched and **not** surfaced as Redskap. `createSessionItem` / `migrateSessionEquipment` / `sanitizeStationEquipment` / `updateItemStationEquipment` in `lib/session.ts` + `data/equipmentPieces.ts`. Unknown `pieceId`s ignored on load; draft persists with Klar / Använd förslag.

2. **Semantics (unset vs `[]`)** — Prefer: **`undefined` = unset** (UI may show seed **förslag**); **`[]` = coach cleared** (no förslag; empty microcopy + CTA). Documented here per decisions.md D.

3. **Equipment library (all 10)** — `src/data/equipmentPieces.ts`: Trampett, Satsbräda, Plint, Landningsmatta, Tumblingmatta, Madrass, **Mattberg** (one piece), Flickiskudde, Airtrack, Kon. Icons remapped to existing `IconId`s (bounce, jump-board, mats-stack, pad, …); fallback OK.

4. **Soft caps** — Max **8** slots; count **≤ 9** per piece. UI shows `composeMaxReached` when slots full. Documented here.

5. **Selective defaults only** — `Activity.defaultStationEquipment` seeded only on vault/trampett/mattberg-style Teknik:
   - `tech-ljushopp-trampett` → trampett + landningsmatta  
   - `tech-trampett-volt-mattberg` → trampett + mattberg + landningsmatta  
   - `tech-ljushopp-satsbrada` → satsbräda + landningsmatta  
   - `tech-satsbrada-volt-rygg` → satsbräda + landningsmatta  
   **Not** on rondat-flickis, flickiskudde, handstånd, fall bakåt, salto, etc.

6. **Compose UI (hall detail only)** — New `StationComposeSheet`: header Klar/Stäng; sections **Dina redskap** + **Lägg till**; +/− count; remove. Entry: ActivityDetail `readOnly` from HallBoard → **Redigera redskap**. Klar persists via `updateItemStationEquipment`; Stäng without Klar discards (confirm if dirty). Close compose → back to detail. **No** Passbyggaren compose entry.

7. **Detail Redskap section** — Heading Redskap; `{count}× {label}` / single label when count===1; empty microcopy + CTA; förslag + **Använd förslag** when unset + seed defaults. Still **no** add-to-pass.

8. **Canvas marker** — Slice 12 icon-first anatomy unchanged. **No** equipment-count badge. One marker per Teknik station. Optional a11y `…WithEquipment` when composition non-empty.

9. **Hints / tips** — `hallTileHint` / `hallTileHintShort` + `tipHallPlace` aligned to Docs (markörer + redskap). Optional dismissible `tipStationCompose`.

10. **Preserved** — Teknik-only + prune (`lib/hall.ts`); tap ≠ drag detail suppress; Erfaren; Golvklart; caption **Schematisk hall — inte exakt mått**.

11. **Footer** — Exact: **Träningsplaneraren · Slice 13** via `UI.footerSliceLabel`.

## Verification (Builder)

- `npm run build` — exit 0 (tsc + vite).
- Did **not** redeploy Netlify / touch hosting.
- Did **not** message Verifier.

## Files changed / added

**Added**

- `src/data/equipmentPieces.ts`
- `src/components/StationComposeSheet.tsx`
- `SLICE13-SHIPPED.md` (this file)

**Updated**

- `src/types.ts` — `StationEquipmentSlot`, `EquipmentPiece`; `SessionItem.stationEquipment?`; `Activity.defaultStationEquipment?`
- `src/lib/session.ts` — create / migrate / sanitize / update helpers; loadDraft migrates equipment
- `src/data/seedActivities.ts` — selective defaults (4 drills)
- `src/data/blockMeta.ts` — Slice 13 UI + tip strings; footer Slice 13; a11y helpers
- `src/lib/coachTips.ts` — `TIP_STATION_COMPOSE`
- `src/components/ActivityDetail.tsx` — Redskap section + hall CTAs
- `src/components/HallBoard.tsx` — detail by item id; compose sheet wiring; persist
- `src/components/HallChip.tsx` — optional WithEquipment a11y
- `src/App.css` — compose sheet + Redskap list styles

**Untouched (by design)**

- `src/lib/hall.ts` — Teknik-only / prune / ranks / flow
- Passbyggaren compose entry
- Canvas marker badge / multi-piece anatomy
- Netlify / Verifier

## Deviations

- Compose sheet recipe heading uses Docs *du*-voice **Dina redskap** (not screen-spec “Er redskap”).
- Dirty Stäng uses a simple `window.confirm` (easy path per screen-spec).
- Soft caps 8 / 9 chosen and documented (screen-spec suggested e.g. those numbers).

## Out of scope (not done)

- CAD / exact measures / club inventory / custom equipment text field  
- Passbyggaren compose entry / marker equipment badge  
- New Teknik drills beyond selective defaults  
- Accounts / cloud / Netlify republish / Verifier ping  
