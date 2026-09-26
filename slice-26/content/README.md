# Slice 26 — content

Pack **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked; Docs lock finalized (D1). Builder ships heuristic from pack; strings below.

| File | Role |
| --- | --- |
| [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md) | Docs lock: step 3 **unchanged** (placera = on-hall); Builder heuristic contract; footer Slice 26 |
| Living mirror | [`docs/kom-igang-place-step.sv.md`](../../docs/kom-igang-place-step.sv.md) |
| Living companions | `docs/kom-igang-redskap.sv.md` · `docs/coach-tips.sv.md` |

## Locked keys (quick)

| Key | Swedish | Docs |
| --- | --- | --- |
| `komIgangStep3` | Öppna Hallöversikt och placera stationer | **Unchanged** — already on-hall placera |
| `komIgangStep3Hint` | Dra Teknik-stationerna ungefär dit ni brukar vara i hallen. | **Unchanged** |
| `footerSliceLabel` | Träningsplaneraren · Slice 26 | When Builder ships |

**Builder (not Docs inventing):** `openHallAndPlace` only when `placementCount >= 1`; legacy already-true left as-is; `markOpenedHall` must not alone check the step.

Footer when shipped: `Träningsplaneraren · Slice 26`. No saknar banner copy. No Förråd rewrite. No tip strip. No app code in this Docs pass.
