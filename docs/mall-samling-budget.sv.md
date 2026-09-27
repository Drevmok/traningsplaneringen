# Mall Samling within budget — svensk Docs (Slice 28)

**Status:** Docs lock — Christoffer approved A1/B1/C1/D1/E1/F1 (2026-09-27). Builder may ship from these keys.  
**Tone:** Clear technical living note for Verifier / Scout / Builder. Coach-facing chrome uses existing locked terms; prefer *du* if any new user-facing string appears (none invented here beyond footer).  
**Product lock:** **Nybörjare** mall (`tmpl-beginner-60`) Samling must open **within budget 6** — Soft pair is the mall default. **Välkomstcheck-in** stays in the seed library. Short mall leave alone. Soft blank inject (Slice 27) unchanged.  
**Carry-forward:** Soft Samling blank + gathering budget 6 (27). Quiet chrome (22). Home polish (23). Förråd / saknar / place-step (24–26).  
**Locked terms:** gymnaster · pass · övning · Samling · Uppvärmning · Teknik · Styrka · Lek och spel · Passbyggaren · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Starta från mall · Kom igång · Använd alla förslag · Nytt pass · Nybörjare  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** seed retitle / howTo rewrite · Home / wizard · hall / Golvklart / Förråd · Soft blank inject · draft migrate · Netlify/Pages · app code in this Docs pass

Pack mirror: [`slice-28/content/mall-samling-budget.sv.md`](../slice-28/content/mall-samling-budget.sv.md).  
Living companion: [`soft-samling.sv.md`](./soft-samling.sv.md) · chrome: [`ui-chrome.sv.md`](./ui-chrome.sv.md) · [`home-wizard.sv.md`](./home-wizard.sv.md) (Slice 29 — **Starta från mall** remains secondary escape; mall gathering lock unchanged).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| **A1** | Beginner mall Samling → Soft pair: **Närvaro** 3 + **Dagens pass — snabb genomgång** 3 = **6**; drop Välkomstcheck-in from mall default |
| **B1** | Short mall (`tmpl-short-45`): **leave alone** (Välkomstcheck-in 5 ≤ 6; no red) |
| **C1** | Keep `block.durationMinutes = BLOCK_BUDGETS[type]` (already via `cloneTemplate`); only **item sums** drive Över budget |
| **D1** | **No** seed retitle / howTo rewrite — Slice 27 already retitled `gather-dagens-teknik`; titles flow via activityId |
| **E1** | This living note + Soft Samling cross-link |
| **F1** | No Home wizard; no hall pre-place; no Pages unless asked; preserve 22–27 Soft locks; footer Slice 28 |

---

## Why budget 6 matters for the mall

After Slice 27, `BLOCK_BUDGETS.gathering = **6**`. Soft blank **Nytt pass** fits: Närvaro 3 + Dagens pass 3 = 6 / 6 — clean.

**Before Slice 28**, beginner mall Samling was:

| Order | activityId | title (seed) | min |
| --- | --- | --- | ---: |
| 0 | `gather-valkomstcheck-in` | Välkomstcheck-in | 5 |
| 1 | `gather-dagens-teknik` | Dagens pass — snabb genomgång | 3 |

**Sum = 8 > 6** → red **Över budget** on first open of a mall that claims *trygg start*. That fights Soft Samling and coach trust.

**After A1**, beginner mall matches the Soft pair story (same ids, same minutes) so mall and blank teach one default Samling — not two.

---

## Soft pair — Nybörjare mall default (A1)

Same Soft pair as blank Nytt pass (Slice 27). Soft **inject** remains blank-only; mall composition is **authored** in `seedTemplates.ts`.

| Order | activityId | title (from seed, Slice 27) | durationMinutes |
| --- | --- | --- | ---: |
| 0 | `gather-narvaro` | Närvaro | 3 |
| 1 | `gather-dagens-teknik` | Dagens pass — snabb genomgång | 3 |

**Sum = 6** ≤ budget **6** → no Över budget on default open.

- Titles resolve from `seedActivities` via activityId — **D1: no mall-local title overrides, no seed retitle.**  
- Soft chrome: editable rows; no locked badge; Samling never on hall.  
- Other beginner blocks (warmup / techniques / strength / fun) **unchanged**.

### Library — Välkomstcheck-in stays

| activityId | Role after Slice 28 |
| --- | --- |
| `gather-narvaro` | Soft pair + beginner mall default |
| `gather-dagens-teknik` | Soft pair + beginner mall default (title from Slice 27) |
| `gather-valkomstcheck-in` | **Library** + short mall default; coach may add after A1 mall |

Do **not** delete Välkomstcheck-in from the seed library.

---

## Short mall — leave alone (B1)

| Order | activityId | title | durationMinutes |
| --- | --- | --- | ---: |
| 0 | `gather-valkomstcheck-in` | Välkomstcheck-in | 5 |

**Sum = 5** ≤ 6 — intentional under B1, not a bug. No Soft-pair rewrite of short this slice.

---

## Budget chrome (C1)

| Symbol | Value / rule |
| --- | --- |
| `BLOCK_BUDGETS.gathering` | **6** (Slice 27 D2) — **do not lower** |
| `block.durationMinutes` after `cloneTemplate` | `BLOCK_BUDGETS[type]` (already) |
| Över budget | when `sum(items.durationMinutes) > block.durationMinutes` |
| Hard block | still **none** — soft tag only |

Default beginner (A1) and short (B1) land without overflow. Coach may still overflow by adding or lengthening.

---

## Soft blank unchanged (Slice 27)

```
Home → Nytt pass → createBlankSession()
  gathering = Närvaro 3 + Dagens pass 3
  budget 6 → 6 / 6 clean
```

Slice 28 must **not** regress Soft inject, editability, empty tip, or gathering budget 6. See [`soft-samling.sv.md`](./soft-samling.sv.md).

---

## Builder contract (document only — do not implement in Docs)

```
// seedTemplates.ts — beginnerBlocks gathering (A1)
block('gathering', [
  item('gather-narvaro', 3, 0),
  item('gather-dagens-teknik', 3, 1),  // title from Slice 27 seed
]),

// shortBlocks gathering — unchanged (B1)
block('gathering', [item('gather-valkomstcheck-in', 5, 0)]),
```

| Do | Do not |
| --- | --- |
| Edit beginner gathering items to Soft pair | Change Soft `createBlankSession` inject |
| Leave short gathering alone | Lower `BLOCK_BUDGETS.gathering` |
| Keep all three Samling seeds in library | Seed retitle / howTo rewrite of `gather-dagens-teknik` |
| `footerSliceLabel` → Slice 28 | Home wizard / hall pre-place / Pages unless asked |
| Preserve 22–27 Soft locks | Migrate old mall drafts |

`cloneTemplate` already rebinds budget and copies items — no `session.ts` change expected under C1.

---

## Footer (F1 companion)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 28 |

Keep footer `no-print`. Ship when Builder lands mall Samling budget. **No new Home / hall / wizard strings.**

---

## Do not ship (Docs / Builder this pack)

- Seed retitle or howTo rewrite of `gather-dagens-teknik` (D1 — Slice 27 already did)  
- Home 3-question wizard / CoachVault copy  
- Hall / Golvklart / Förråd / saknar / place-step copy  
- Soft blank inject changes; lowering gathering budget  
- Deleting Välkomstcheck-in from the library  
- Migrating drafts already cloned from old mall compositions  
- Hard-lock mall Samling  
- Netlify / Pages republish unless Christoffer asks  
- App code in the Docs pass

---

## Builder checklist (after Docs)

1. `seedTemplates.ts` beginner gathering → Soft pair (A1).  
2. Short gathering leave alone (B1).  
3. Confirm `BLOCK_BUDGETS.gathering` stays **6**; Soft blank inject untouched.  
4. Library still has Närvaro, Dagens pass, Välkomstcheck-in.  
5. `footerSliceLabel` → `Träningsplaneraren · Slice 28`.  
6. Preserve 22–27; no Home / hall invent. Self-smoke via `verify-traningsplaneraren/`.
