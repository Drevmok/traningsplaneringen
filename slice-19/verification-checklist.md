# Slice 19 — verification checklist (DRAFT)

**Authority:** Overall PASS only if all locked rules pass after Builder has shipped against an **APPROVED** pack.  
**Status:** **DRAFT — awaiting Christoffer A–F lock.** Do **not** run Verifier until Planner marks APPROVED **and** pings after Builder ships.  
**Netlify:** Not required unless Christoffer asks. Phone URL may still show Slice 17 until republish.

## Recommended rules (become locked after A–F approval)

| # | Rule | Pass if |
|---|---|---|
| 1 | CTA placement | **Använd alla förslag** (Docs label) appears on Hallöversikt **edit** chrome as secondary near hall actions; **not** on Golvklart floor chrome; **not** on Passbyggaren; **not** required inside each markör sheet |
| 2 | Enable — partial | Pass with some saved + some unset seeded placed Teknik → CTA **enabled** |
| 3 | Enable — all unset with seeds | All placed Teknik unset with seeds → CTA **enabled** |
| 4 | Enable — all already saved | Every placed Teknik has saved composition → CTA **disabled** (or documented no-op); tap does not rewrite saved |
| 5 | Skip `[]` | Cleared `[]` stations are **not** overwritten by bulk apply; still no förslag on those stations |
| 6 | Skip seedless / non-Teknik / unplaced | Non-eligible items unchanged |
| 7 | Apply persists | Tap CTA → eligible stations get saved `stationEquipment` equal to their `defaultStationEquipment` (sanitized), via same path as Använd förslag / `updateItemStationEquipment` |
| 8 | Result feedback | One-line result shows N applied (or soft no-op if N=0); no browser confirm |
| 9 | Golvklart after apply | After CTA, Golvklart shows redskap under markörer for newly saved stations |
| 10 | Förrådslista after apply | After CTA, Förrådslista aggregates pieces from newly saved stations |
| 11 | Quiet before apply | Before CTA / Klar / Använd förslag, Golvklart / print / Förrådslista still **omit** unset förslag |
| 12 | No auto-apply on place | Place a seeded Teknik → `stationEquipment` stays unset until CTA / Använd förslag / Klar |
| 13 | Single-station semantics | Unset vs `[]` + per-station Använd förslag / Klar unchanged |
| 14 | Edit vs Golvklart | CTA visible/usable in edit; not a Golvklart compose control |
| 15 | Phone ~390px | CTA tappable; layout acceptable; no Passbyggaren compose; no badge/CAD |
| 16 | Scope | No library growth; caption **Schematisk hall — inte exakt mått** unchanged; Slices 11–18 intact |
| 17 | Footer (E) | `Träningsplaneraren · Slice 19` when shipped |
| 18 | Build | `npm run build` green |

## Smoke path

1. **Partial pass:** Place ≥3 Teknik with seeds. On station A tap **Använd förslag** (saved). Leave B and C unset. Clear D to `[]` via Redigera redskap → Klar. Confirm Golvklart/Förrådslista show only A.  
2. Edit Hallöversikt: CTA **enabled**. Tap **Använd alla förslag** (no confirm). Result shows N=2 (B+C).  
3. Confirm B and C now saved; D still `[]`; A unchanged. Golvklart shows redskap for A/B/C; Förrådslista aggregates; D quiet.  
4. **All-already-saved:** CTA disabled; tap (if possible) no-ops.  
5. **All-unset with seeds:** New pass, place two seeded Teknik unset → CTA enabled → apply → both saved → floor/list fill.  
6. **Place regression:** Place another seeded Teknik → still unset until CTA/Använd förslag/Klar; Golvklart omits until saved.  
7. Confirm edit-only CTA; Golvklart has no bulk CTA. Caption unchanged. Footer Slice 19. Library still ~10. Build green. Phone ~390px smoke.

## Fail if

- CTA appears as compose control on Golvklart or Passbyggaren.  
- Bulk apply overwrites saved composition or re-fills `[]`.  
- Förslag appears on Golvklart / Förrådslista / print while still unset.  
- Auto-apply on place without CTA / Använd förslag / Klar.  
- Browser `confirm` required for happy path (if B1 locked).  
- New `eq-*` piece; badge/CAD; caption change; seed arrays rewritten.  
- Verifier run before APPROVED pack + Builder ship.
