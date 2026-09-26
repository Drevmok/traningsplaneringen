# Slice 24 — screen spec (DRAFT · recommended locks)

**Status:** **DRAFT 2026-09-26** — behavior follows **recommended** A1/B1/C1/D1/E1/F1 until Christoffer locks.  
**Viewport focus:** Phone ~390px and desktop; Förrådslista sheet + Hallöversikt edit chrome.

## 1) Soft empty path when eligible (recommended A1)

```
Förrådslista sheet (ForradslistaSheet)

Inputs (from HallBoard):
  rows: AggregatedEquipmentRow[]
  eligibleSuggestedCount: number   ← NEW (or equivalent boolean)
  onClose: () => void
  onPointAtApplyAll?: () => void   ← NEW parent handler (B1)

empty = rows.length === 0

When empty === false:
  Unchanged list UI (title, sub, rows, Stäng)

When empty === true AND eligibleSuggestedCount < 1:
  Today’s empty:
    forradslistaEmpty
    forradslistaEmptyHint   (per-markör Redigera redskap)
  No soft CTA

When empty === true AND eligibleSuggestedCount ≥ 1:
  Soft empty state:
    forradslistaEmpty (or Docs soft lead — keep quiet packing spirit)
    Soft secondary copy (Docs) pointing toward Använd alla förslag
    [ CTA ≥44px ]  → onPointAtApplyAll / parent B1 handler
  Do NOT open Redigera redskap / compose from this sheet
  Do NOT call apply-all from this sheet
```

**Eligibility (unchanged Slice 19):** `eligibleSuggestedStationEquipmentItems(session)` — placed Teknik + unset `stationEquipment` + non-empty `defaultStationEquipment`.

## 2) CTA behavior (recommended B1)

```
On soft CTA tap (parent HallBoard):

  1. Close Förråd sheet (setForradOpen(false) / onClose)
  2. If currently in Golvklart / floor mode → exit to Hall edit
  3. Point at existing Använd alla förslag control:
       - scrollIntoView / focus / brief highlight  AND/OR
       - brief role="status" toast pointing at it
  4. STOP — do not invoke handleApplyAllSuggested

Coach then taps Använd alla förslag (existing Slice 19 path).
```

**Do not change:** `applyAllSuggestedStationEquipment` semantics; disabled title when count===0; Golvklart/Förråd/print quiet-until-saved rules.

## 3) Copy / chrome (recommended C1)

```
Empty eligible (~390px conceptual):

  [ Förrådslista                    [Stäng] ]
  [ Inga redskap summerade ännu.          ]  ← or Docs soft lead
  [ Soft secondary: … Använd alla förslag ]
  [ Använd alla förslag på hallen ]         ← ≥44px secondary CTA (Docs label)
```

- Swedish only; Docs owns keys.
- No new tip strip; no saknar banner inside Förråd.
- If toast after close: one brief line; do not stack with multi-line Hall hints as a second teaching layer (Slice 22 C1 spirit — toast = status, keep short).

## 4) Controls that must still work

| Control | Behavior |
|---|---|
| Förråd open (edit + Golvklart) | Unchanged entry points |
| Förråd Stäng / backdrop | Closes sheet |
| Non-empty Förråd list | Unchanged |
| Empty + not eligible | Today’s empty hint only |
| Empty + eligible soft CTA | B1 close → edit → point |
| Hall **Använd alla förslag** | Unchanged Slice 19 enable/apply/result |
| Per-markör Redigera redskap | Unchanged; not opened from Förråd |
| Golvklart / print quiet rules | Unchanged |
| Caption / Home Slice 23 | Unchanged |

## Surfaces that must not change

| Surface | |
|---|---|
| Saknar-redskap banner | Not added (Proposed) |
| Kom igång place heuristic | Unchanged (Proposed) |
| Förråd station-breakdown | Not added (Parked) |
| Passbyggaren compose / library / CAD / caption / cloud | Unchanged |
| Slice 19 apply-all eligibility / persist | Unchanged (point only) |
| Slice 22 quiet chrome / Slice 23 Home | Unchanged |
| Device-local drafts model | Unchanged |

## Layout sketches

### Empty + eligible (edit)

```
[ Hallöversikt edit · Använd alla förslag visible in header ]
[ Förrådslista sheet open ]
  Title · Stäng
  Empty soft copy
  [ CTA → close sheet → highlight Använd alla förslag ]
```

### Empty + eligible (opened from Golvklart)

```
[ Golvklart · Förråd open ]
  Soft CTA → close sheet → exit floor → Hall edit → point at Använd alla förslag
```

### Empty + not eligible

```
[ Inga redskap summerade ännu. ]
[ Ange redskap… Tryck en markör och välj Redigera redskap. ]
(no soft CTA)
```
