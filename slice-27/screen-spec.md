# Slice 27 — screen spec (DRAFT · recommended A–F)

**Status:** **DRAFT** — behavior follows recommended A2/B1/C1/D2/E1/F1 until Christoffer locks. Docs → Builder → Verifier only after APPROVED.  
**Viewport focus:** Passbyggaren · Samling block (phone ~390px and desktop).

## 1) Blank “Nytt pass” — Soft Samling (recommended A2/B1/D2)

```
Home → Nytt pass → createBlankSession()

BEFORE:
  gathering.items = []
  budget = 5

AFTER (recommended):
  gathering.items = [
    { activityId: 'gather-narvaro',           durationMinutes: 3, order: 0 },  // Närvaro / upprop
    { activityId: 'gather-dagens-teknik',     durationMinutes: 3, order: 1 },  // pass-rundown copy per A2 Docs
  ]
  BLOCK_BUDGETS.gathering = 6   // D2 — filled 6 / 6, no Över budget on default
  other blocks stay empty
```

**UI:** Samling block shows two editable activity rows like any other items (title from seed, duration steppers, move up/down, remove, add). Soft chrome — no “locked” badge, no disabled remove.

**Kom igång:** Soft items count toward `itemCount` → `addActivities` may auto-check. Intentional.

## 2) Template-started pass (recommended B1)

```
Home → Starta från mall → Använd mall → cloneTemplate(template)

AFTER:
  gathering = template’s authored items (unchanged)
  Soft inject does NOT replace / merge / append

Examples today:
  tmpl-beginner-60 → Välkomstcheck-in (5) + Dagens teknik (3)
  tmpl-short-45    → Välkomstcheck-in (5)
```

If a future template has empty gathering, B1 still does **not** inject (blank-only). B2 would be a later lock if Christoffer wants empty-mall fill.

## 3) Editability (Soft — not hard)

| Action | Behavior |
|---|---|
| Remove one or both soft items | Allowed; no re-inject |
| Reorder | Allowed |
| Change duration | Allowed (1–60 as today) |
| Add more Samling activities from library | Allowed (incl. Välkomstcheck-in) |
| Clear all Samling items | Empty tip returns (see §4); soft does **not** re-prefill mid-edit |
| Hard-lock / hide remove / hide add | **Out of scope (F1)** |

## 4) Empty state when user clears (E1)

```
Samling items.length === 0
  → show EMPTY_TIPS.gathering tip + addLabel
  → Docs may tweak tip to gently suggest upprop + kort genomgång
  → still fully voluntary; no auto-refill
```

## 5) Existing drafts (recommended C1)

```
loadDraft / Fortsätt senaste pass
  If gathering empty → leave empty (no migrate)
  If gathering has items → leave as saved
```

## 6) Golvklart / print / hall

| Surface | Soft Samling effect |
|---|---|
| Hallöversikt placeable set | **Unchanged** — Teknik only; Samling never on hall |
| Golvklart markers | Unchanged — no Samling markers |
| Passbyggaren list | Shows soft items normally |
| Session print / activity list (if any) | Shows Samling items as session activities normally |
| Förrådslista / redskap | Unchanged — Teknik redskap only |

## 7) Budget chrome (recommended D2)

```
Default soft pair: filled 6 / budget 6 → no overflow tag
If coach adds more / lengthens → Över budget tag may appear (existing soft signal)
Hard block of over-budget: still none
```

If D1 locked instead: shorten seed defaults to fit 5.  
If D3 locked: keep budget 5; default shows Över budget.

## 8) Controls that must still work

| Control | Behavior |
|---|---|
| Nytt pass | Soft-prefill Samling |
| Starta från mall | Template gathering unchanged (B1) |
| Fortsätt senaste pass | No migrate (C1) |
| Remove / reorder / duration / add | Unchanged editability |
| Library Samling seeds | All three seeds remain available |
| Hall / Golvklart / Förråd / Kom igång place step | Unchanged (22–26) |

## Surfaces that must not change

| Surface | |
|---|---|
| Hard-lock Samling UI | Not added |
| Teknik-only placeable / caption / CAD | Unchanged |
| Compose / Använd alla förslag / saknar banner | Unchanged |
| Quiet chrome Slice 22 / Home Slice 23 / Förråd 24 | Unchanged |
| Place-step heuristic Slice 26 | Unchanged |

## Footer

When Builder ships: `Träningsplaneraren · Slice 27`.
