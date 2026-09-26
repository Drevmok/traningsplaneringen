# Slice 24 — verification checklist (DRAFT · recommended locks)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **DRAFT** — Verifier runs only after Christoffer A–F lock → Docs → Builder ship **and** Planner ping.  
**Skill:** `verify-traningsplaneraren/` + this checklist; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Recommended locks (awaiting Christoffer):** **A1 / B1 / C1 / D1 / E1 / F1**.  
Update PASS rows if Christoffer locks a different letter.

## Rules (recommended)

### Soft empty path (A1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Eligible empty shows soft path | Förråd empty **and** ≥1 Slice 19–eligible station: soft secondary copy + ≥44px CTA visible |
| 2 | Non-eligible empty keeps today | Förråd empty **and** `eligibleSuggestedCount === 0`: only today’s empty + per-markör hint; **no** soft CTA |
| 3 | Non-empty unchanged | With saved redskap rows: list UI unchanged; no soft empty CTA |
| 4 | Same eligibility | Soft path uses same population as `eligibleSuggestedStationEquipmentItems` / Hall apply-all enable |

### CTA behavior (B1)

| # | Rule | Pass if |
|---|---|---|
| 5 | Closes sheet | Soft CTA closes Förrådslista |
| 6 | Hall edit | After CTA, coach is on Hallöversikt **edit** (if opened from Golvklart, floor exited) |
| 7 | Points at apply-all | Existing **Använd alla förslag** is focused/scrolled/highlighted and/or a brief toast points at it |
| 8 | No auto-apply | Soft CTA does **not** persist seeds; `stationEquipment` unchanged until coach taps Använd alla förslag |
| 9 | Apply-all still works | After pointing, tapping **Använd alla förslag** still applies Slice 19 path + result toast |

### Copy / chrome / scope (C1 / E1 / F1) + build

| # | Rule | Pass if |
|---|---|---|
| 10 | Chrome | Soft text + button; no new tip strip; no saknar banner; Swedish Docs-locked labels; ≥44px CTA |
| 11 | Footer | `Träningsplaneraren · Slice 24` when shipped |
| 12 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 13 | Scope F1 | No compose from Förråd; no auto-persist; no saknar banner; no place-heuristic; no station-breakdown; no Passbyggaren compose / library / CAD / cloud / sync; Slice 19/22/23 intact |
| 14 | Build | `npm run build` green in `app/` |
| 15 | No window regressions | No new `window.confirm` for this chrome |

## Phone / Hall smoke

1. **Eligible empty:** place ≥1 Teknik with seed, leave unset, open Förråd → soft CTA → closes → edit → point at Använd alla förslag → tap apply-all → Förråd fills.  
2. **Not eligible empty:** no placements / no seeds / already saved or cleared `[]` → empty hint only, no soft CTA.  
3. **From Golvklart:** open Förråd on floor when eligible empty → soft CTA exits to edit and points at apply-all.  
4. **Regression:** Slice 19 disabled title when count=0; Slice 22 quiet chrome; Slice 23 Home Hallöversikt/Golvklart + Öppna på telefon intact.  
5. Footer Slice 24; caption unchanged; build green.

## Fail if

- Soft CTA shown when not eligible (dead path).  
- Soft CTA auto-persists seeds or opens Redigera redskap / compose.  
- Apply-all semantics / eligibility changed.  
- Saknar banner / place-heuristic / station-breakdown / tip strip / Home-phone rewrite shipped.  
- Footer not Slice 24; build red.  
- Verifier run before APPROVED + Builder ship + Planner ping.
