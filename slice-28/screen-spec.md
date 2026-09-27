# Slice 28 — screen spec (DRAFT · recommended A–F)

**Status:** **DRAFT** — behavior follows recommended A1/B1/C1/D1/E1/F1 until Christoffer locks. Docs → Builder → Verifier only after APPROVED.  
**Viewport focus:** Passbyggaren · Samling block after **Starta från mall** (phone ~390px and desktop).

## 1) Beginner mall — Samling within budget (recommended A1)

```
Home → Starta från mall → Nybörjare — ca 55 min → Använd mall → cloneTemplate(tmpl-beginner-60)

BEFORE (post Slice 27):
  gathering.items = [
    { activityId: 'gather-valkomstcheck-in', durationMinutes: 5, order: 0 },
    { activityId: 'gather-dagens-teknik',     durationMinutes: 3, order: 1 },
  ]
  filled = 8 / budget 6 → Över budget (red)

AFTER (recommended A1):
  gathering.items = [
    { activityId: 'gather-narvaro',       durationMinutes: 3, order: 0 },  // Närvaro / upprop
    { activityId: 'gather-dagens-teknik', durationMinutes: 3, order: 1 },  // Dagens pass — snabb genomgång
  ]
  filled = 6 / budget 6 → no Över budget
  other blocks unchanged (warmup / techniques / strength / fun)
```

**UI:** Samling shows two editable rows; titles from seeds; Soft chrome — no locked badge. Matches blank Soft Samling composition (Slice 27), different entry path (mall vs Nytt pass).

**If A2 instead:** Keep Välkomstcheck-in + genomgång IDs; shrink minutes so sum ≤ 6.  
**If A3 instead:** Single gathering item only; sum ≤ 6.

## 2) Short mall (recommended B1)

```
Home → Starta från mall → Kort pass — ca 45 min → Använd mall

AFTER (B1 leave alone):
  gathering.items = [
    { activityId: 'gather-valkomstcheck-in', durationMinutes: 5, order: 0 },
  ]
  filled = 5 / budget 6 → no Över budget
```

No composition change under B1. If B2 locks Soft pair, mirror §1 Soft items on short mall too.

## 3) Blank Soft Samling unchanged (Slice 27)

```
Home → Nytt pass → createBlankSession()
  gathering = Närvaro 3 + Dagens pass 3 (unchanged)
  budget 6 → 6 / 6 clean
```

Slice 28 must **not** regress Soft inject, editability, or C1 leave-existing-drafts.

## 4) Budget chrome (recommended C1)

```
block.durationMinutes = BLOCK_BUDGETS.gathering (= 6) after cloneTemplate
Över budget when sum(items.durationMinutes) > block.durationMinutes
Hard block: still none
```

Default beginner (A1) and short (B1) land **without** overflow tag. Coach may still overflow by adding/lengthening.

## 5) Titles (recommended D1)

| activityId | Display title (from seed, Slice 27) |
|---|---|
| `gather-narvaro` | Närvaro |
| `gather-dagens-teknik` | Dagens pass — snabb genomgång |
| `gather-valkomstcheck-in` | Välkomstcheck-in (library + short mall) |

No mall-local title overrides.

## 6) Library / editability

| Action | Behavior |
|---|---|
| Remove / reorder / change duration / add | Unchanged Soft editability |
| Add Välkomstcheck-in from library after A1 mall | Allowed — seed stays |
| Clear Samling | Empty tip (Slice 27); no Soft re-inject mid-edit |
| Hard-lock mall Samling | **Out of scope** |

## 7) Hall / Home / wizard

| Surface | Slice 28 effect |
|---|---|
| Hallöversikt placeable | **Unchanged** — Teknik only |
| Golvklart / Förråd / saknar / Använd alla | Unchanged |
| Home 3-question wizard | **Not built** (Approved backlog later) |
| Hall pre-place on mall apply | **Not built** |
| Soft blank / Kom igång addActivities | Unchanged Slice 27 behavior |

## 8) Controls that must still work

| Control | Behavior |
|---|---|
| Starta från mall → Nybörjare | Samling ≤ budget; Soft pair if A1 |
| Starta från mall → Kort pass | No red (B1: 5/6) |
| Nytt pass | Soft Samling still 6/6 |
| Fortsätt senaste pass | No migrate of old mall drafts |
| Library Samling seeds | All three remain |
| Hall / Golvklart / Förråd / place-step | Unchanged 22–26 |

## Surfaces that must not change

| Surface | |
|---|---|
| Soft blank inject / gathering budget 6 | Slice 27 preserved |
| Teknik-only placeable / caption / CAD | Unchanged |
| Home wizard / hall auto-place | Not introduced |
| Quiet chrome / Home polish / Förråd / saknar / place-step | Unchanged |

## Footer

When Builder ships: `Träningsplaneraren · Slice 28`.
