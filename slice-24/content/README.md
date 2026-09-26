# Slice 24 — content

Pack **APPROVED 2026-09-26** — Docs lock finalized (D1). Builder ships from these keys.

| File | Role |
| --- | --- |
| [`forrad-empty-soft-path.sv.md`](./forrad-empty-soft-path.sv.md) | Locked Swedish: soft Förråd empty + point-CTA (+ aria/toast); footer Slice 24 |
| Living mirror | [`docs/forrad-empty-soft-path.sv.md`](../../docs/forrad-empty-soft-path.sv.md) |
| Living companions | `docs/forradslista.sv.md` · `docs/anvand-alla-forslag.sv.md` · `docs/ui-chrome.sv.md` |

## Locked keys (quick)

| Key | Swedish |
| --- | --- |
| `forradslistaEmpty` | Inga redskap summerade ännu. *(reuse lead)* |
| `forradslistaEmptySoftHint` | Det finns osparade förslag. Stäng och tryck Använd alla förslag — då syns redskapen i Förrådslista. |
| `forradslistaPointApplyAll` | Använd alla förslag på hallen |
| `forradslistaPointApplyAllAria` | Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt. |
| `forradslistaPointApplyAllToast` | Tryck Använd alla förslag för att spara. |
| `footerSliceLabel` | Träningsplaneraren · Slice 24 |

**Reuse unchanged when not eligible:** `forradslistaEmptyHint` (+ optional `forradslistaEmptyHintShort`).  
**Reuse Hall apply-all:** `hallApplyAllSuggested*` — Slice 24 points only; does **not** auto-apply.

Gate: soft path only when `rows.length === 0` **and** `eligibleSuggestedCount ≥ 1`.

Footer when shipped: `Träningsplaneraren · Slice 24`. No saknar copy. No tip strip. No compose-from-Förråd. No Home/phone invent. No sync/cloud invent.
