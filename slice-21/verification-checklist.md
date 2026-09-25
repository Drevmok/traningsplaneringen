# Slice 21 — verification checklist (APPROVED locks)

**Authority:** Overall PASS only if all locked rules pass after Builder ships.  
**Status:** Pack **APPROVED 2026-09-26** — Verifier runs only after Docs → Builder ship **and** Planner ping.  
**Skill:** `verify-traningsplaneraren/` + this checklist; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Locked:** **A1 / B1 / C1 / D1 / E1 / F1**.

## Rules (locked)

### Pinch-zoom (A1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Pinch present | On phone (~390px), two-finger pinch on hall canvas changes view scale (edit **and** Golvklart) |
| 2 | Clamp | Pinch cannot go below ZOOM_MIN or above ZOOM_MAX (same as +/−; today 1…2) |
| 3 | +/− kept | Zoom bar +/− still work; ≥44px; same clamp |
| 4 | View-only | After zoom (pinch and/or +/−) + reload, stored placement x,y unchanged |
| 5 | Desktop | Phone path required; desktop may be button-only — do not FAIL solely for missing desktop pinch |

### Collapsible tray (B1)

| # | Rule | Pass if |
|---|---|---|
| 6 | Collapsed default | Phone ≤768px edit: tray starts collapsed (or collapses when canvas needs space) with compact bar showing unplaced count + expand ≥44px |
| 7 | More canvas | Collapsed state uses less vertical chrome than full ~14rem reserved tray (canvas visibly taller) |
| 8 | Expand | Expand opens today’s tray (chips / Placera här / hints as today) |
| 9 | Collapse again | Coach can collapse; control ≥44px |
| 10 | Placera här | With tray **expanded**, Placera här still places/snaps |
| 11 | Golvklart | Floor mode: edit tray hidden (no collapse chrome required) |

### Pan while zoomed (C1)

| # | Rule | Pass if |
|---|---|---|
| 12 | One-finger pan | When zoomed (>1): one-finger on empty canvas/background pans the view |
| 13 | Marker drag | Drag on markör moves marker (edit); does not pan canvas instead |
| 14 | Pinch ≠ pan | Pinch zooms; does not leave view only-panned without scale change |
| 15 | Pan ≠ detail | Panning empty/background does not open station detail |
| 16 | Tap still detail | Short tap on markör still opens detail (edit + Golvklart) |
| 17 | +/− after pan | +/− still zoom; usable after pan |

### Scope / chrome (E1 / F1) + build

| # | Rule | Pass if |
|---|---|---|
| 18 | Footer | `Träningsplaneraren · Slice 21` when shipped |
| 19 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 20 | Scope F1 | No CAD/pins/badge; no Passbyggaren compose; no library growth; no saknar-redskap banner; no Kom igång heuristic change; Slices 11–20 intact |
| 21 | Remove ≥44 | Edit canvas remove still ≥44px (Slice 20); none on Golvklart |
| 22 | Build | `npm run build` green in `app/` |
| 23 | No window regressions | No new `window.confirm` for hall chrome; dirty Stäng still in-sheet (Slice 20) |

## Phone viewport smoke (~390px)

1. **Edit + pinch:** Open Hallöversikt edit → pinch in/out → confirm clamp → +/− still work → reload → placements same coords.  
2. **Tray:** Confirm collapsed compact bar → expand → Placera här one Teknik → collapse → canvas taller again.  
3. **Pan:** Zoom in → one-finger pan empty → move a markör by drag → pan does not open detail → short tap opens detail.  
4. **Golvklart:** Enter Golvklart → pinch + pan work → no edit tray / no remove → exit.  
5. Footer Slice 21; caption unchanged; build green.

## Fail if

- Pinch missing on phone hall canvas (edit or Golvklart) when A1 locked.  
- +/− removed or clamp differs from buttons when A1 locked.  
- Stored x,y change after zoom/reload.  
- Phone edit tray never collapsible / always eats ~14rem with no compact state when B1 locked.  
- Placera här broken when tray expanded.  
- When zoomed, cannot pan with one finger on empty canvas; or pan opens detail; or marker drag pans instead of moving.  
- CAD/badge/Passbyggaren compose/library growth/saknar banner/Kom igång heuristic change/caption change.  
- Footer not Slice 21; build red.  
- Verifier run before APPROVED + Builder ship + Planner ping.
