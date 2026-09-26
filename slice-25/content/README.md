# Slice 25 — content

Pack **A1–F1 locked 2026-09-26** — Docs lock finalized (D1). Builder ships from these keys.

| File | Role |
| --- | --- |
| [`saknar-redskap-banner.sv.md`](./saknar-redskap-banner.sv.md) | Locked Swedish: soft saknar banner (+ plural) + optional point-CTA (+ aria/toast); footer Slice 25 |
| Living mirror | [`docs/saknar-redskap-banner.sv.md`](../../docs/saknar-redskap-banner.sv.md) |
| Living companions | `docs/hall-oversikt-copy.sv.md` · `docs/hall-declutter.sv.md` · `docs/ui-chrome.sv.md` · `docs/anvand-alla-forslag.sv.md` |

## Locked keys (quick)

| Key | Swedish |
| --- | --- |
| `hallSaknarRedskapBanner` | {n} stationer saknar redskap |
| `hallSaknarRedskapBannerOne` | 1 station saknar redskap |
| helper `hallSaknarRedskapBannerText(n)` | N===1 → One; else Banner with `{n}` |
| `hallSaknarPointApplyAll` | Använd alla förslag |
| `hallSaknarPointApplyAllAria` | Visa Använd alla förslag. Sparar inte automatiskt. |
| `hallSaknarPointApplyAllToast` | Tryck Använd alla förslag för att spara. *(optional)* |
| `footerSliceLabel` | Träningsplaneraren · Slice 25 |

**Reuse Hall apply-all:** `hallApplyAllSuggested*` — Slice 25 points only; does **not** auto-apply.  
**Reuse unplaced:** `hallUnplacedBanner*` unchanged.

Gate: banner when missing saved composition (unset **or** `[]`) ≥1 on **edit**; CTA only when `eligibleSuggestedCount ≥ 1`. Hide on Golvklart.

Footer when shipped: `Träningsplaneraren · Slice 25`. No Förråd rewrite. No Kom igång place-heuristic copy. No tip strip. No compose-from-banner. No sync/cloud invent.
