# Slice 16 — verification checklist (APPROVED)

**Authority:** Overall PASS only if all locked rules pass after Builder has shipped against this APPROVED pack.  
**Status:** **APPROVED 2026-09-25** (Christoffer)  
**Netlify:** Not required unless Christoffer asks.

Locked answers A–F: new soft checklist step (5 total); auto-progress on any non-empty saved `stationEquipment`; keep `tipStationCompose` as-is; soft only — never block Golvklart; footer Slice 16; no Home visual redesign beyond copy/checklist/progress.

## Locked rules

| # | Rule | Pass if |
|---|---|---|
| 1 | Discoverability | Home Kom igång teaches that coaches should set redskap (markör → **Redigera redskap**) before / alongside Golvklart — not only place markörer |
| 2 | Path | Copy / step points at existing hall detail CTA **Redigera redskap**; no Passbyggaren compose entry |
| 3 | Step shape (A) | **5** soft steps; new step between place and Golvklart (“Ange redskap …”); intro “Fem …”; `CHECKLIST_TOTAL = 5` |
| 4 | Auto-progress (B) | Compose checklist progresses on non-empty saved `stationEquipment` (not förslag alone, not `[]`) |
| 5 | Tip strip (C) | `tipStationCompose` kept as-is (Slice 13 wording / show rules) |
| 6 | Soft only (D) | Golvklart **enterable** with compose step unchecked; no hard gate copy |
| 7 | Home-only | No mandatory new compose chrome on Hallöversikt / Golvklart beyond existing tips |
| 8 | Teknik-only | Slice 11 filter/prune unchanged |
| 9 | Slice 12–15 intact | Markers; tap≠drag; **Redigera redskap** detail-only; under-markör; Förrådslista; no badge; no CAD |
| 10 | Caption | **Schematisk hall — inte exakt mått** unchanged |
| 11 | Phone | ~390px: Kom igång card readable/tappable |
| 12 | Scope | No Netlify requirement; no accounts; no idea 1 / idea 3 work |
| 13 | Footer (E) | Träningsplaneraren · Slice 16 when shipped |
| 14 | Visuals (F) | No Home redesign beyond copy/checklist/progress |

## Smoke path

1. Fresh tips state (or Visa tips igen). Home shows Kom igång with **5** steps; intro “Fem …”; progress `0 av 5`.  
2. Build pass + add Teknik övning + open Hallöversikt + place ≥1 markör → steps 1–3 progress as today.  
3. Compose step still unchecked; tap compose step → opens Hallöversikt (not Passbyggaren compose).  
4. Tap markör → **Redigera redskap** → Klar with ≥1 piece → return Home → compose step checked (heuristic).  
5. With compose **unchecked**, open Golvklart from checklist or hall → **must succeed**; Golvklart step can check; compose may stay unchecked.  
6. Empty Förrådslista / quiet under-markör still OK; no gate.  
7. `tipStationCompose` still available as soft hall chrome (dismissible), wording unchanged.  
8. Dismissed checklist stays dismissed after reload; Visa tips igen restores.  
9. Older draft with existing non-empty `stationEquipment` → compose step auto-checks on sync.  
10. Non-dismissed coach who was 4/4 without compositions sees fifth step unchecked (gentle catch-up).  
11. Phone (~390px) Home card OK. `npm run build` green. Footer Slice 16.  
12. Home card chrome unchanged aside from steps / hints / intro / progress (no new illustration / accent redesign).

## Non-blocking (explicitly out / deferred)

- Broader selective redskap-förslag (Approved idea 1).  
- Golvklart screen short station titles (Approved idea 3).  
- Netlify republish only if Christoffer asks.  
- Strengthening / retiring `tipStationCompose` (locked keep as-is).  
- Home illustrations / accent redesign (locked F = no).

## Fail if

- Golvklart blocked when compose step unchecked.  
- New Passbyggaren compose entry or canvas equipment badge.  
- Compose progress counts förslag / `defaultStationEquipment` without saved non-empty `stationEquipment`.  
- Checklist invents a fifth **placeable** block or custom equipment CRUD.  
- Still only 4 steps / “Fyra korta steg” after ship (A locked 5).  
- Slice 14 under-markör or Slice 15 Förrådslista regresses.  
- Caption changed or Teknik-only regresses.  
- Home visual redesign beyond copy/checklist/progress.  
- Idea 1 or idea 3 scope sneaks into this slice.  
- Verifier run before Builder ships.
