# Slice 26 — screen spec (APPROVED 2026-09-26 · locked A–F)

**Status:** **APPROVED 2026-09-26** — behavior follows locked A1/B1/C1/D1/E1/F1. Docs may start after Slice 25 Docs; Builder after Docs; Verifier only after Planner ping.  
**Viewport focus:** Home / Kom igång checklist (phone ~390px and desktop).

## 1) Place-step auto-progress (locked A1)

```
coachTips.syncChecklistHeuristics(state, { placementCount, … })

BEFORE (Slice 09 / current):
  if (!checklist.openHallAndPlace && (placementCount >= 1 || state.openedHall))
    checklist.openHallAndPlace = true

AFTER (Slice 26 A1):
  if (!checklist.openHallAndPlace && placementCount >= 1)
    checklist.openHallAndPlace = true

// Never clear an already-true openHallAndPlace (B1)
```

```
markOpenedHall(state):

BEFORE:
  openedHall: true
  checklist.openHallAndPlace: true   // open alone checks the step

AFTER (A1/B1):
  openedHall: true                   // OK to keep recording open
  checklist.openHallAndPlace:        // do NOT set true solely from open
    leave existing value unchanged
```

**Soft navigation:** Hallöversikt / Golvklart Home + Kom igång CTAs stay available regardless of place-step checked state (subject to existing need-activity / need-hall gates — unchanged).

## 2) Legacy (locked B1)

```
If local tips already have checklist.openHallAndPlace === true
  (including from historical open-only):
  Leave true — do not recompute to false on sync

New coaches / false step:
  Open Hall alone → step stays unchecked
  Place ≥1 Teknik → step checks via sync (placementCount >= 1)
```

## 3) Copy / chrome (locked C1)

```
Kom igång step openHallAndPlace:
  label: UI.komIgangStep3   // Docs may clarify “placera” = on hall
  hint:  UI.komIgangStep3Hint

No new tip strip.
Compose step (composeStationEquipment) unchanged — still separate Slice 16 step.
```

## 4) Controls that must still work

| Control | Behavior |
|---|---|
| Open Hallöversikt (Home / Kom igång) | Unchanged entry; does **not** alone check place step (new) |
| Place Teknik on schematic | Unchanged; causes place step to check when count ≥1 |
| Compose step / Redigera redskap | Unchanged (Slice 16) |
| Golvklart open | Unchanged; soft — not blocked by unchecked place step |
| Slice 22 quiet / compact Kom igång | Unchanged |
| Slice 23 Home Hallöversikt / Golvklart / Öppna på telefon | Unchanged |

## Surfaces that must not change

| Surface | |
|---|---|
| Hall saknar-redskap banner | Not added (**Slice 25**) |
| Teknik-only placeable set | Unchanged |
| Compose entry / drafts model | Unchanged |
| Passbyggaren / library / CAD / caption / cloud | Unchanged |
| Slice 19 apply-all / Slice 24 Förråd soft path | Unchanged |

## Behavior sketches

### New coach — open only

```
[ Kom igång ]
  ☐ Öppna Hallöversikt och placera stationer
→ Open Hallöversikt (no placement)
→ Return Home
  ☐ still unchecked
```

### New coach — place one Teknik

```
→ Place ≥1 Teknik on schematic
→ Home / sync
  ☑ Öppna Hallöversikt och placera stationer
```

### Legacy coach — already checked via open-only

```
tips.checklist.openHallAndPlace === true (historical)
→ Sync with placementCount === 0
  ☑ stays checked (B1 — no regress)
```
