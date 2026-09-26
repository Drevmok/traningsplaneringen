# Slice 26 — verification checklist (APPROVED 2026-09-26 · locked A–F)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **APPROVED 2026-09-26** — Docs may start after Slice 25 Docs; Builder after Docs; Verifier runs only after Builder ships and Planner ping.  
**Skill:** `verify-traningsplaneraren/` + project skill `verify-traningsplaneraren/`; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Locked choices:** **A1 / B1 / C1 / D1 / E1 / F1**.

## Rules (locked)

### Placement-only progress (A1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Open alone does not check | Fresh tips / unchecked step: open Hallöversikt with `placementCount === 0` → `openHallAndPlace` stays **false** |
| 2 | Place checks | After ≥1 Teknik placement, step becomes **true** (sync and/or place path) |
| 3 | Soft nav | Unchecked place step does **not** block Hallöversikt or Golvklart navigation (existing need-activity / need-hall gates only) |
| 4 | Compose not required | Place step can check with zero saved `stationEquipment` (compose remains separate Slice 16 step) |

### Legacy (B1)

| # | Rule | Pass if |
|---|---|---|
| 5 | No regress | Tips with `openHallAndPlace: true` and `placementCount === 0` remain **true** after sync |
| 6 | openedHall alone insufficient | Setting / having `openedHall` without placement does **not** newly advance a false place step |

### Copy / chrome / scope (C1 / E1 / F1) + build

| # | Rule | Pass if |
|---|---|---|
| 7 | Chrome | No new tip strip; Swedish Docs-locked labels if copy changed |
| 8 | Footer | `Träningsplaneraren · Slice 26` when shipped |
| 9 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 10 | Scope F1 | No saknar banner (Slice 25); no placeable-set / compose-entry / drafts change; no library/CAD/cloud/sync; preserve 19–24 (+25 if already shipped) |
| 11 | Build | `npm run build` green in `app/` |
| 12 | No window regressions | No new `window.confirm` for this change |

## Home / Kom igång smoke

1. **Open only:** new draft, add Teknik, open Hall, return — place step unchecked.  
2. **Place:** place one Teknik — place step checked.  
3. **Legacy:** simulate/preseed tips with place step true + zero placements — stays checked.  
4. **Regression:** compose step still separate; Slice 22 quiet Kom igång; Slice 23 Home CTAs; Slice 24 Förråd path; no saknar banner unless Slice 25 already shipped separately.  
5. Footer Slice 26; caption unchanged; build green.

## Fail if

- Open Hall alone newly checks `openHallAndPlace`.  
- Previously checked open-only step cleared.  
- Place step requires compose / blocks Hall or Golvklart.  
- Saknar banner / placeable-set / compose-entry / drafts model / tip strip shipped in this pack.  
- Footer not Slice 26; build red.  
- Verifier run before APPROVED + Slice 25 Docs + Docs + Builder ship + Planner ping.
