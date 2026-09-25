# Slice 18 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-25** — ready for Docs handoff; behavior below follows Christoffer’s locked A–F approval via Planner on 2026-09-25.

## Mental model (förslag UX — unchanged)

```
Teknik SessionItem (placed)
   └─ hall detail → Redskap
         stationEquipment === undefined (unset)
            └─ if activity.defaultStationEquipment non-empty
                  → show förslag (“Förslag — du kan ändra”)
                  → CTA Använd förslag → persist copy as saved composition
         stationEquipment === []
            → coach cleared — no förslag (empty sheet)
         stationEquipment non-empty (saved)
            → show saved list; Redigera redskap / Klar as today

Golvklart / print / Förrådslista
   → SAVED stationEquipment only
   → never promote unset defaultStationEquipment / förslag
```

**Slice 18 only changes how many Teknik activities have a non-empty `defaultStationEquipment` seed.** No new sheet chrome, no badge, no Passbyggaren compose.

## Locked drills that get seeds (A)

### Keep (do not change)

| activityId | title | slots |
|---|---|---|
| `tech-ljushopp-satsbrada` | Ljushopp på satsbräda | Satsbräda ×1, Landningsmatta ×1 |
| `tech-ljushopp-trampett` | Ljushopp på trampett | Trampett ×1, Landningsmatta ×1 |
| `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | Satsbräda ×1, Landningsmatta ×1 |
| `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | Trampett ×1, Mattberg ×1, Landningsmatta ×1 |

### Add (locked)

| activityId | title | locked slots | pieceIds |
|---|---|---|---|
| `tech-flickis-kudde` | Flickis med flickiskudde | Flickiskudde ×1, Madrass ×1 | `eq-flickiskudde`, `eq-madrass` |
| `tech-rondat-flickis` | Rondat–flickis | Tumblingmatta ×1, Landningsmatta ×1 | `eq-tumblingmatta`, `eq-landningsmatta` |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | Plint ×1, Madrass ×1 | `eq-plint`, `eq-madrass` |
| `tech-salto-fran-hojd` | Salto från höjd | Plint ×1, Landningsmatta ×1 | `eq-plint`, `eq-landningsmatta` |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg | Madrass ×1 | `eq-madrass` |

After ship: **9 / 9** Teknik drills have förslag seeds.

## Builder hooks (do not implement in this pack)

| Area | Hook |
|---|---|
| Seeds only | `app/src/data/seedActivities.ts` — add `defaultStationEquipment` arrays on locked new drills; **do not** edit the four existing arrays |
| Slot shape | `{ pieceId: 'eq-…', count: n }` — mirror existing seeds |
| Library | `equipmentPieces.ts` — **read-only**; no new ids |
| UI / sheet | Prefer **no** TSX change — förslag chrome already exists when seed is non-empty |
| Footer | `footerSliceLabel` → `Träningsplaneraren · Slice 18` |
| Docs | Update `docs/station-compose.sv.md` drill list / selective-förslag sentence |

## Unchanged

- Använd förslag / Klar / unset vs `[]`
- Caption **Schematisk hall — inte exakt mått**
- Golvklart short titles (Slice 17) + redskap quiet rules (Slice 14)
- Förrådslista aggregate (Slice 15) — saved only
- Kom igång progress — saved composition only
- Edit canvas declutter; no under-markör badge
- Hall detail entry for Redigera redskap only

## Phone

No new chrome. Förslag block in detail / compose sheet already ships; more drills simply populate it when unset.
