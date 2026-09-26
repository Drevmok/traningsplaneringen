# Kom igång — place step (on-hall) — svensk Docs (Slice 26)

**Status:** Docs lock — recommended A1–F1 (D1). Builder ships heuristic from pack; use these keys (unchanged) + notes below.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Soft Kom igång step `openHallAndPlace` auto-progresses only when ≥1 Teknik is on the schematic (`placementCount >= 1`). Opening Hallöversikt alone must **not** check the step for new advances. Legacy already-true left as-is. Soft — never block Hallöversikt / Golvklart.  
**Carry-forward:** Five soft steps (16). Quiet/collapse chrome (22). Home polish (23). Förråd empty soft path (24). Saknar banner is **Slice 25** — not this pack.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · Hallöversikt · Golvklart · Passbyggaren · Placera här · Kom igång · Redigera redskap · Förrådslista · Starta från mall · Använd alla förslag  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** saknar-redskap banner (Slice 25) · Förråd rewrite · tip strip · compose/placeable-set/drafts invent · library/CAD/cloud/accounts · Netlify/Pages republish

Living mirror of pack: [`slice-26/content/kom-igang-place-step.sv.md`](../slice-26/content/kom-igang-place-step.sv.md).  
Living companions: [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md) · [`coach-tips.sv.md`](./coach-tips.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| A | Auto-progress `openHallAndPlace` only when `placementCount >= 1`; soft — no Hall/Golvklart block |
| B | Legacy already-true left as-is; `markOpenedHall` may set `openedHall` but must **not** alone set place step true |
| C | Step wording **unchanged** — existing copy already means on-hall placera; no tip strip |
| D | Thin Docs: this file + living Kom igång heuristic note; **no** saknar banner |
| E | Träningsplaneraren · Slice 26 |
| F | No placeable/compose/drafts; no saknar; no library/CAD/cloud; preserve 19–25 (or through 24 if 26 ships first) |

---

## Step 3 — placera = on-hall (unchanged)

Existing label + hint already say open **and place** Teknik on the hall schematic. Heuristic was the mismatch (open-only credit) — not the Swedish. **Do not** invent synonyms or a tip strip.

| Key | Swedish | Docs |
| --- | --- | --- |
| `komIgangStep3` | Öppna Hallöversikt och placera stationer | **Unchanged** — “placera stationer” = on-hall placement (not open-only). App: `blockMeta.ts`. Living: [`coach-tips.sv.md`](./coach-tips.sv.md), [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md). |
| `komIgangStep3Hint` | Dra Teknik-stationerna ungefär dit ni brukar vara i hallen. | **Unchanged** — drag/place on hall. Redskap stays step 4 (`komIgangStepCompose*`). |

Related tip (unchanged; not Kom igång checklist):

| Key | Swedish | Docs |
| --- | --- | --- |
| `tipHallPlace` | Placera Teknik-stationerna ungefär där ni brukar köra dem. De visas som små markörer — tryck för detaljer och redskap. Släpp på en zon för att fästa; på öppen yta kan du placera fritt. | **Unchanged** — already on-hall. See [`coach-tips.sv.md`](./coach-tips.sv.md). |

Compose step (`komIgangStepCompose*`) and Golvklart step (`komIgangStep4*`) — **unchanged** (Slice 16).

---

## Builder contract (heuristic — not Docs inventing logic)

Internal checklist key: `openHallAndPlace` (not shown to coach).

1. **`syncChecklistHeuristics`:** advance `openHallAndPlace` only when `!checklist.openHallAndPlace && opts.placementCount >= 1`. Drop `|| state.openedHall` for new advances.
2. **`markOpenedHall`:** may still set `openedHall: true`. Must **not** set `checklist.openHallAndPlace: true` solely because Hall opened. Leave existing place-step value unchanged.
3. **Legacy (B1):** if `checklist.openHallAndPlace === true` already (including historical open-only), **do not clear** on sync.
4. **Soft:** unchecked place step must not disable Hallöversikt / Golvklart (existing need-activity / need-hall gates only).
5. **Compose not required:** place step must not require non-empty `stationEquipment` (Slice 16 owns compose).

Symbols: `app/src/lib/coachTips.ts` (`syncChecklistHeuristics`, `markOpenedHall`); `placementCount` from `App.tsx`; UI in `KomIgangCard.tsx`.

---

## Footer (E1)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 26 |

Keep footer `no-print`. Ship when Builder lands the heuristic.

---

## Do not ship (Docs / Builder)

- Rewriting `komIgangStep3*` just to “sound more placement” — already clear  
- New tip strip teaching place  
- Saknar-redskap banner copy (Slice 25)  
- Förråd empty rewrite  
- Requiring compose to check place; clearing legacy open-only checks; blocking Hall open  
- Placeable-set / compose-entry / drafts / library / CAD / caption / cloud invent  

---

## Notes for Builder

- Prefer locked strings above — **no string change** for step 3 unless a later pack re-locks.  
- Wire heuristic A1/B1; footer Slice 26.  
- Self-smoke via `verify-traningsplaneraren/` + pack `verification-checklist.md`.  
- Living companions updated: [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md) · [`coach-tips.sv.md`](./coach-tips.sv.md).
