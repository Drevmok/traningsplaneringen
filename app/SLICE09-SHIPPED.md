# Slice 09 — SHIPPED

**Date:** 2026-09-24 (Europe/Stockholm)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-09/` (onboarding / coach tips) — Docs copy locked in `slice-09/content/coach-tips.sv.md` (+ `docs/coach-tips.sv.md`)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run dev   # http://localhost:5173
npm run build # production check — green
```

## Features shipped

1. **Persistence** — dedicated key `gymnastics-planner-tips-v1` (`src/lib/coachTips.ts`). Shape matches data-model (`version`, `checklistDismissed`, `checklist.*`, `dismissed`, optional `openedHall` / `openedGolvklart` / `builderFirstVisitSeen` / `showTipsAgain`). Defaults when missing. Clearing / restoring tips does **not** touch `gymnastics-planner-draft-v1`.

2. **Kom igång** — dismissible Home card (not a modal): title, intro, 4 actionable steps with hints, progress `{done} av {total} klart`, **Dölj Kom igång** / **Jag klarar mig**. Soft-disabled Hall/Golvklart steps with Swedish hints when the pass has no övningar. Home action cards remain usable without the checklist. Home-only (no empty-builder duplicate).

3. **Auto-progress** — heuristics: draft / open from Home → `chooseOrBuildPass`; ≥1 item → `addActivities`; placements or `openedHall` → `openHallAndPlace`; `openedGolvklart` → `useGolvklart`.

4. **Contextual tips** (dismissible strips, × / **Dölj tips**):
   - `tip-builder-empty` — Passbyggaren empty / first visit (keeps `topBarHelp`, Tips tab, `EMPTY_TIPS`)
   - `tip-hall-place` — Hallöversikt tray (longer coach tip); always-on drag/snap one-liners kept
   - `tip-hall-flow-golvklart` — near flow / Golvklart; wording aligned with `hallFloorCoachTip`
   - `tip-experienced-safety` — **shipped** near Erfaren detail (reinforces existing safety only)

5. **Visa tips igen** — quiet link on Home and in app footer. Restores checklist + tip dismissals. Feedback: **Tips visas igen** / **Tips syns redan**.

6. **Print / Golvklart** — tip chrome uses `no-print`; tips prefer hide in Golvklart floor mode (edit-only strips).

7. **Footer** — exactly **Träningsplaneraren · Slice 09**.

## Tip ids

| tipId | Surface |
| --- | --- |
| `kom-igang` | Checklist card (`checklistDismissed`) |
| `tip-builder-empty` | Passbyggaren |
| `tip-hall-place` | Hallöversikt placement |
| `tip-hall-flow-golvklart` | Hallöversikt flow / Golvklart |
| `tip-experienced-safety` | Erfaren activity detail (optional — shipped) |

## Storage key

`gymnastics-planner-tips-v1`

## Verification

- `npm run build` — green.
- No blocking wizard/modal tour.
- Tips tab / `EMPTY_TIPS` / `topBarHelp` retained.
- Draft key unchanged; tips clear does not delete draft.

## Files changed / added

**Added**

- `src/lib/coachTips.ts`
- `src/components/CoachTipStrip.tsx`
- `src/components/KomIgangCard.tsx`
- `SLICE09-SHIPPED.md`

**Updated**

- `src/App.tsx` — tips state, checklist navigation, footer Slice 09, Visa tips igen
- `src/components/Home.tsx` — Kom igång + Visa tips igen
- `src/components/SessionBuilder.tsx` — `tip-builder-empty`
- `src/components/HallBoard.tsx` — `tip-hall-place`, `tip-hall-flow-golvklart`, Golvklart entry flag
- `src/components/ActivityDetail.tsx` — `tip-experienced-safety`
- `src/data/blockMeta.ts` — Slice 09 strings from Docs; `hallFloorCoachTip` wording aligned
- `src/App.css` — Kom igång / tip strip / Visa tips igen styles; print hide

## Blockers / deviations

- None blocking.
- Kom igång is Home-only (preferred); empty Passbyggaren alternate not used to avoid double chrome.
- Optional Erfaren tip **shipped** (not deferred).

## Scope guard

No blocking wizard, video, signup, library/CAD/snap/preset changes, new drills/progressions, backend sync, or new routes.
