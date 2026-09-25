# Slice 14 — verification checklist (APPROVED)

**Authority:** Overall PASS only if all locked rules pass — binding after Builder has shipped against this APPROVED pack.  
**Status:** **APPROVED 2026-09-25** (Christoffer) — pack locked; Verifier runs only after Builder ships.

## Locked rules

| # | Rule | Pass if |
|---|---|---|
| 1 | Golvklart shows redskap | In floor mode, each numbered Teknik markör with **non-empty** `stationEquipment` shows composed label lines **under** the markör |
| 2 | Print shows redskap | `@media print` / Skriv ut shows the same equipment lines under those markers **after** existing short titles |
| 3 | Quiet unset | `stationEquipment` **undefined** → no floor/print equipment lines and no forced “inga redskap” |
| 4 | Quiet saved empty | `stationEquipment: []` → nothing shown on floor/print |
| 5 | No förslag on floor | Unset + seed `defaultStationEquipment` does **not** invent floor/print lines (förslag stay detail-only) |
| 6 | Edit canvas clean | Hallöversikt **edit** has **no** under-marker redskap list and **no** equipment-count badge |
| 7 | Format | Swedish library labels; **count === 1** → `{label}` only (omit ×); **count > 1** → `{n}× {label}` |
| 8 | Many pieces | Up to **8** lines shown; **no** “+N till” truncation |
| 9 | Layout | Lines under each markör — **not** a side list beside the schematic |
| 10 | Golvklart screen title | Short activity title stays **print-only**; Golvklart screen shows equipment lines without forcing short titles on screen |
| 11 | Teknik-only | Slice 11 filter/prune unchanged; only Teknik stations on hall |
| 12 | Slice 12–13 intact | One marker per station; tap → detail; drag ≠ detail (edit); **Redigera redskap** from detail only; no Passbyggaren compose |
| 13 | No CAD / pins | No per-piece placeable pins; no exact measures |
| 14 | Caption | **Schematisk hall — inte exakt mått** unchanged |
| 15 | Phone | Golvklart usable ~390px width; equipment lines readable / not blocking marker tap |
| 16 | Scope | No Netlify requirement, accounts, Förrådslista, Kom igång compose gate, or catalog expansion |
| 17 | Footer | Träningsplaneraren · Slice 14 |

## Smoke path

1. Pass with ≥2 Teknik stations; compose one with trampett + landningsmatta (Klar); leave another unset; clear a third to `[]` if easy.  
2. Hallöversikt **edit**: markers look Slice 12 — **no** equipment under markers, **no** badge.  
3. Enter **Golvklart**: composed station shows redskap lines under the markör; unset and `[]` stay quiet; short titles **not** forced on screen.  
4. Confirm count===1 shows label only (e.g. `Landningsmatta`, not `1× Landningsmatta`); count>1 shows `n× …`.  
5. If a station has many slots (up to 8), all lines show — no “+N till”.  
6. Tap composed markör → detail still lists Redskap; **Redigera redskap** works.  
7. **Skriv ut** / print preview: short title + equipment lines on composed stations; quiet stations have no equipment lines; caption present; edit chrome hidden.  
8. Phone (~390px) Golvklart smoke: lines visible, tap still opens detail.  
9. `npm run build` green.  
10. Reload draft → compositions persist; Golvklart still mirrors them.

## Non-blocking (explicitly out / deferred)

- Optional `tipGolvklartEquipment`.  
- Förrådslista (idea 3 Proposed).  
- Kom igång compose step (idea 2 Proposed).  
- Netlify republish only if Christoffer asks.  
- Side-list layout and “+N till” were considered and **rejected** at pack APPROVED.

## Fail if

- Equipment-count badge appears on canvas markers.  
- Redskap lines appear in **edit** Hallöversikt under markers.  
- Unset or `[]` shows forced “inga redskap” on Golvklart/print.  
- Förslag defaults appear on floor/print without a saved composition.  
- Count===1 always shows `1× {label}` instead of `{label}` only.  
- “+N till” truncates visible lines, or a side list replaces under-markör lines.  
- Short activity title appears on Golvklart **screen** (must stay print-only).  
- Per-piece CAD pins or Passbyggaren-only compose path.  
- Caption changed or Teknik-only regresses.  
- Pack treated as shipped without footer Slice 14.
