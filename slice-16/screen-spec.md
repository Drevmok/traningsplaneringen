# Slice 16 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-25** (Christoffer)  
Behavior below follows the approved Planner locks A–F.

## Mental model

```
Home · Kom igång (Home-only card)
  1 chooseOrBuildPass
  2 addActivities
  3 openHallAndPlace
  4 composeStationEquipment   ← NEW (locked A)
       hint: markör → Redigera redskap
       auto: any non-empty stationEquipment (locked B)
  5 useGolvklart              ← NEVER blocked by step 4 (locked D)

Hall tip strip: tipStationCompose stays as-is (locked C)
Golvklart / Förrådslista / compose UX: unchanged (Slices 13–15)
Home chrome: no visual redesign beyond copy/checklist/progress (locked F)
```

## Surface: Home Kom igång card only

### Visible when

- `tips.checklistDismissed === false` (unchanged)
- Same placement on Home as today (`KomIgangCard`)

### Not changed

- Passbyggaren layout
- Hallöversikt edit/Golvklart headers (no new mandatory banners)
- Compose sheet / detail CTA (**Redigera redskap** stays Slice 13)
- Canvas markers / under-markör / Förrådslista
- Home card visual chrome beyond steps / hints / intro / progress (locked F)

## UI (locked A = new step)

```
┌─────────────────────────────────────┐
│ Kom igång              Dölj Kom igång│
│ Fem korta steg — från tomt pass …   │
│ 2 av 5 klart                        │
│                                     │
│ ✓ Välj eller bygg ett pass          │
│ ✓ Lägg till övningar i blocken      │
│ ○ Öppna Hallöversikt och placera …  │
│ ○ Ange redskap på Teknik-stationerna│
│   Tryck en markör → Redigera redskap│
│ ○ Använd Golvklart på golvet        │
│                                     │
│            Jag klarar mig           │
└─────────────────────────────────────┘
```

### Step rules

| Step key (proposed name) | Label seed | Hint seed | CTA on tap | Disabled when |
|---|---|---|---|---|
| `chooseOrBuildPass` | (unchanged) | (unchanged) | Open builder / choose | — |
| `addActivities` | (unchanged) | (unchanged) | Open builder | — |
| `openHallAndPlace` | (unchanged) | May lightly mention redskap if Docs wants; primary place copy stays | Open Hallöversikt | `!canOpenHall` |
| **`composeStationEquipment`** *(new)* | Ange redskap på Teknik-stationerna | Tryck en markör och välj **Redigera redskap**. | Open **Hallöversikt** (soft) | `!canOpenHall` (same as hall/Golvklart) |
| `useGolvklart` | (unchanged) | Optional soft mention that redskap helps Golvklart / Förrådslista — **not** a requirement | Open Golvklart | `!canOpenHall` / need activity — **not** “need compose” |

**Hard:** Golvklart step must **not** gain `disabled` because compose is unchecked.

### Progress / all-done

- `CHECKLIST_TOTAL = 5` (locked A)
- Progress: `{done} av {total} klart` (existing key)
- All-done only when all five flags true (including compose)
- All-done copy may stay floor-focused; optional Docs one-liner if compose is part of the journey — do not invent a gate message

## Auto-progress (locked B)

Extend `syncChecklistHeuristics`:

```
hasComposedEquipment =
  some SessionItem has Array.isArray(stationEquipment)
  && stationEquipment.length > 0

if !checklist.composeStationEquipment && hasComposedEquipment:
  checklist.composeStationEquipment = true
```

- Do **not** count `defaultStationEquipment` / förslag alone
- Do **not** count `[]`
- Klar and Använd förslag that persist non-empty both qualify
- Does not clear already-true flags (same as other heuristics)

## Tip strip (locked C)

- Keep `tipStationCompose` string and show rules as shipped in Slice 13
- Soft dismissible; not required for checklist PASS
- Do not add a second competing compose tip on Home

## Soft-only Golvklart (locked D)

| Action | Allowed when compose step unchecked? |
|---|---|
| Enter Golvklart from checklist CTA | **Yes** |
| Enter Golvklart from Hallöversikt | **Yes** |
| Print / Förrådslista empty | **Yes** (existing Slice 14–15 quiet/empty) |
| Mark `useGolvklart` done | **Yes** (opening Golvklart) even if compose unchecked |

Compose step may remain unchecked while Golvklart is done — card shows partial progress until compose or dismiss.

## Migration (locked)

- `normalize()`: missing `composeStationEquipment` → `false`
- Dismissed checklists stay dismissed
- Non-dismissed coaches who already completed 4/4 without compositions: see fifth step unchecked (gentle catch-up)
- Non-dismissed with existing non-empty compositions: sync marks compose done

## Implementation hooks (Builder — do not implement in this pack)

| Area | Hook |
|---|---|
| Tips state | `ChecklistKey` + `checklist.composeStationEquipment`; `CHECKLIST_TOTAL = 5` |
| Heuristics | `syncChecklistHeuristics` + `hasComposedEquipment` from session items |
| UI | `KomIgangCard` steps array; `blockMeta` / Docs keys |
| CTA | New step action → open Hallöversikt (reuse `openHall` path) |
| Copy | Polished `docs/coach-tips.sv.md` from `content/kom-igang-redskap.sv.md` |
| Tip | Leave `tipStationCompose` as-is (locked C) |
| Footer | `Träningsplaneraren · Slice 16` (locked E) |
| Visuals | No Home redesign beyond copy/checklist/progress (locked F) |
| Out | Netlify; Golvklart block; Passbyggaren compose; badge; CAD; idea 1 & 3 |

## Regression

- Slice 09 dismiss / Visa tips igen / tip strips  
- Slice 11 Teknik-only + prune  
- Slice 12 tap → detail, drag ≠ detail  
- Slice 13 compose + **Redigera redskap** detail-only + no marker badge  
- Slice 14 Golvklart/print under-markör; edit canvas clean  
- Slice 15 Förrådslista both entries + print when non-empty  
- Caption **Schematisk hall — inte exakt mått**  
- Golvklart enter/exit with zero compositions still works  
