# Slice 28 — content

Pack **APPROVED 2026-09-27** — A1/B1/C1/D1/E1/F1. Docs living note shipped.

| File | Role |
| --- | --- |
| [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md) | Living Swedish lock: mall Samling within budget; Soft pair mall default; short leave-alone; math 8→6 |
| Living target | [`docs/mall-samling-budget.sv.md`](../../docs/mall-samling-budget.sv.md) |
| Companion | [`docs/soft-samling.sv.md`](../../docs/soft-samling.sv.md) — Soft blank inject (Slice 27); cross-linked |

## Locked keys (quick)

### Beginner mall gathering (A1)

| Order | activityId | title (from seed) | min |
| --- | --- | --- | ---: |
| 0 | `gather-narvaro` | Närvaro | 3 |
| 1 | `gather-dagens-teknik` | Dagens pass — snabb genomgång | 3 |

**Sum = 6** ≤ `BLOCK_BUDGETS.gathering` (6). Same Soft pair as blank Nytt pass.

### Short mall gathering (B1)

| Order | activityId | title | min |
| --- | --- | --- | ---: |
| 0 | `gather-valkomstcheck-in` | Välkomstcheck-in | 5 |

**Sum = 5** ≤ 6 — leave alone.

### Chrome

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 28 |

### Builder contract (not Docs inventing)

- Edit `seedTemplates.ts` gathering arrays per locked A/B.  
- Do **not** change Soft `createBlankSession` inject.  
- Do **not** lower `BLOCK_BUDGETS.gathering`.  
- Keep all three Samling seeds in library.  
- No Home wizard / hall pre-place.  
- **No** seed retitle (D1).

Footer when shipped: `Träningsplaneraren · Slice 28`. No app code in the Docs pass.
