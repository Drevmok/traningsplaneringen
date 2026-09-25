# Slice 15 — verification checklist (APPROVED)

**Authority:** Overall PASS only if all locked rules pass after Builder has shipped against this APPROVED pack.  
**Status:** **APPROVED 2026-09-25** (Christoffer)  
**Netlify:** Not required unless Christoffer asks.

Locked answers A–F: both entry points; bottom sheet; library order; print when non-empty; quiet omit of unset/`[]`; footer Slice 15.

## Locked rules

| # | Rule | Pass if |
|---|---|---|
| 1 | Aggregate merge | Förrådslista sums counts by `pieceId` across all non-empty `stationEquipment` on the pass |
| 2 | Labels | Swedish labels from fixed 10-piece library; unknown ids ignored |
| 3 | Format | count===1 → `{label}` only; count>1 → `{n}× {label}` |
| 4 | Quiet omit | Stations with `undefined` or `[]` do **not** contribute; no förslag / defaults in the sum |
| 5 | Empty state | Empty aggregate shows nudge pointing at compose / **Redigera redskap** — no inventory language |
| 6 | Entry — edit | Hallöversikt **edit** exposes Förrådslista CTA; opens read-only sheet |
| 7 | Entry — Golvklart | Golvklart exposes Förrådslista CTA; opens same sheet |
| 8 | Read-only | Sheet has no +/− / remove / custom add; closing returns to prior surface |
| 9 | Sort | Rows follow locked sort |
| 10 | Print | Print shows compact Förrådslista when non-empty; quiet when empty |
| 11 | No Golvklart block | Empty compositions / empty aggregate still allow Golvklart |
| 12 | Teknik-only | Slice 11 filter/prune unchanged |
| 13 | Slice 12–14 intact | One marker; tap → detail; drag ≠ detail; **Redigera redskap** detail-only; under-markör redskap on floor/print; edit canvas clean (no badge) |
| 14 | No CAD / pins / inventory / custom | No per-piece pins; no “vi har N”; no custom catalog |
| 15 | Caption | **Schematisk hall — inte exakt mått** unchanged |
| 16 | Phone | ~390px: CTA + sheet usable; list readable |
| 17 | Scope | No Netlify requirement; no Kom igång compose gate (idea 2); no accounts |
| 18 | Footer | Träningsplaneraren · Slice 15 |
| 19 | Multi-station sum | Same piece on two stations sums correctly (e.g. 1+1 → `2× …` or two singles → `2×`); aggregate may exceed per-station max count 9 |

## Smoke path

1. Pass with ≥2 Teknik stations placed. Compose station A: Trampett + Landningsmatta (Klar). Compose station B: 2× Madrass (or another Landningsmatta). Leave station C unset if present.  
2. Hallöversikt **edit**: open **Förrådslista** → list shows merged pieces with correct sums; unset station omitted.  
3. Confirm count===1 shows label only; multi shows `n× …`.  
4. Stäng → back on edit canvas; markers still Slice 12 (no badge); Slice 14 lines still hidden in edit.  
5. Enter **Golvklart**: under-markör redskap still shows per Slice 14; open **Förrådslista** → same aggregate.  
6. Empty path: clear all compositions (or fresh pass with no Klar) → Förrådslista empty nudge mentions **Redigera redskap**; Golvklart still enterable.  
7. **Skriv ut** / print preview: per-station lines intact; Förrådslista print block present iff aggregate non-empty; caption present; chrome hidden.  
8. Phone (~390px) smoke: CTA + sheet OK.  
9. `npm run build` green.  
10. Reload draft → compositions persist; Förrådslista still matches.

## Non-blocking (explicitly out / deferred)

- Kom igång compose checklist step (Approved idea 2 — later slice).  
- Optional icons on Förrådslista rows.  
- “N stationer saknar redskap” partial banner.  
- Tap row → jump to station.  
- Netlify republish only if Christoffer asks.  
- Editing counts from the packing list.

## Fail if

- Aggregate invents lines from förslag / `defaultStationEquipment` without saved composition.  
- Unset or `[]` stations inflate the list.  
- Custom equipment field or “vi har N i förrådet” inventory copy ships.  
- Sheet becomes a compose editor or Passbyggaren gains compose entry.  
- Canvas equipment-count badge appears.  
- Golvklart blocked when aggregate empty.  
- Slice 14 under-markör / edit-clean regresses.  
- Caption changed or Teknik-only regresses.  
- Pack treated as shipped without footer Slice 15.  
- Verifier run before pack APPROVED or before Builder ships.
