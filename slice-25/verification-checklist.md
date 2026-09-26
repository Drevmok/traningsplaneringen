# Slice 25 — verification checklist (APPROVED · A–F locked)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **APPROVED 2026-09-26** — Docs may start; Builder ships after Docs; Verifier runs only after Builder ships and the Planner ping.  
**Skill:** `verify-traningsplaneraren/` + this checklist; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Locked decisions:** **A1 / B1 / C1 / D1 / E1 / F1** (2026-09-26).

## Rules (locked)

### Soft saknar banner (A1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Edit shows when missing ≥1 | Hall **edit**: ≥1 placed Teknik with `stationEquipment` unset **or** `[]` → soft `role="status"` banner with Docs pluralized count |
| 2 | Includes `[]` | Placed Teknik with cleared `[]` (and no other missing) still shows banner |
| 3 | Includes unset | Placed Teknik with unset `stationEquipment` shows banner |
| 4 | Hidden on Golvklart | Floor / Golvklart: **no** saknar banner |
| 5 | Hidden when none missing | All placed Teknik have non-empty saved `stationEquipment` → no saknar banner |

### Optional CTA (B1)

| # | Rule | Pass if |
|---|---|---|
| 6 | CTA when eligible ≥1 | Banner visible **and** `eligibleSuggestedCount ≥ 1`: ≥44px secondary affordance present |
| 7 | No dead CTA | Banner visible **and** `eligibleSuggestedCount === 0`: **no** CTA (text only) |
| 8 | Points, no auto-apply | CTA closes nothing required; focuses/scrolls/highlights **Använd alla förslag** and/or brief toast; `stationEquipment` unchanged until coach taps apply-all |
| 9 | Apply-all still works | After pointing, tapping **Använd alla förslag** still applies Slice 19 path + result toast |

### Copy / chrome / scope (C1 / E1 / F1) + build

| # | Rule | Pass if |
|---|---|---|
| 10 | Chrome | Soft status (unplaced visual family); no tip strip; Swedish Docs-locked labels; never blocks place / Golvklart / Stäng |
| 11 | Footer | `Träningsplaneraren · Slice 25` when shipped |
| 12 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 13 | Scope F1 | No auto-apply; no compose from banner; no place-heuristic (Slice 26); no Passbyggaren compose / library / CAD / cloud / sync; Slice 19/22/23/24 intact |
| 14 | Build | `npm run build` green in `app/` |
| 15 | No window regressions | No new `window.confirm` for this chrome |

## Phone / Hall smoke

1. **Unset eligible:** place ≥1 Teknik with seed, leave unset → edit shows saknar banner + CTA → point → tap apply-all → banner clears (or count drops) after save.  
2. **Cleared `[]`:** place Teknik, clear redskap to `[]` → banner shows; **no** CTA (eligible=0).  
3. **Golvklart:** with missing count ≥1, enter Golvklart → no saknar banner; Golvklart still reachable.  
4. **Regression:** Slice 19 disabled title when count=0; Slice 22 quiet chrome; Slice 23 Home; Slice 24 Förråd empty soft path intact.  
5. Footer Slice 25; caption unchanged; build green.

## Fail if

- Banner shown on Golvklart.  
- Banner counts only unset and ignores `[]` (if A1 locked).  
- CTA shown when not eligible (dead path) or auto-persists seeds / opens compose.  
- Golvklart / place / Stäng blocked by saknar count.  
- Slice 26 place-heuristic / Förråd rewrite / tip strip / Home-phone rewrite shipped.  
- Footer not Slice 25; build red.  
- Verifier run before Builder ships or before the Planner ping.
