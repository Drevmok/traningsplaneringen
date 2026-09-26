# Hall soft “saknar redskap” — svensk microcopy (Slice 25)

**Status:** Docs lock — Christoffer locked Slice 25 A1–F1 (2026-09-26). Builder may ship from these keys.  
**Tone:** Soft status, warm, short, coach-to-coach. Prefer *du*. Not a hard banner.  
**Product lock:** Hallöversikt **edit only** soft `role="status"` when ≥1 **placed** Teknik has missing saved redskap (`stationEquipment` **unset** or `[]`). Optional ≥44px CTA points at existing **Använd alla förslag** only when `eligibleSuggestedCount ≥ 1`. **No auto-apply. No compose from banner. Hide on Golvklart.**  
**Carry-forward:** Apply-all eligibility + persist (19). Quiet chrome / one layer (22). Home polish (23). Förråd empty soft path (24) untouched.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Använd förslag · Använd alla förslag · Passbyggaren · Kom igång · Starta från mall  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** Förråd empty rewrite · Kom igång place-heuristic (Slice 26) · tip strip · auto-apply · compose-from-banner · Golvklart saknar chrome · CAD/library/cloud/accounts · Netlify/Pages republish

Living mirror: [`docs/saknar-redskap-banner.sv.md`](../../docs/saknar-redskap-banner.sv.md).  
Living companions: [`docs/hall-oversikt-copy.sv.md`](../../docs/hall-oversikt-copy.sv.md) · [`docs/hall-declutter.sv.md`](../../docs/hall-declutter.sv.md) · [`docs/ui-chrome.sv.md`](../../docs/ui-chrome.sv.md) · [`docs/anvand-alla-forslag.sv.md`](../../docs/anvand-alla-forslag.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| A | Soft `role="status"` on Hall **edit only** when missing saved composition ≥1; count **unset and `[]`**; hide on Golvklart |
| B | Unplaced-like plural copy; optional ≥44px point-CTA only when `eligibleSuggestedCount ≥ 1`; no auto-apply; text-only when eligible=0 |
| C | Soft status chrome (unplaced visual family); Slice 22 one-chrome-layer; saknar under unplaced if both; no tip strip; never blocks place / Golvklart / Stäng |
| D | Thin strings below + living Hall / ui-chrome / apply-all cross-ref; no Förråd / place-heuristic |
| E | Träningsplaneraren · Slice 25 |
| F | No auto-apply; no compose from banner; no Slice 26 place-heuristic; no library/CAD/cloud; preserve 19+22+23+24 |

---

## Banner (A1 / B1) — edit only

Show when `isFloor === false` **and** `missingSavedCompositionCount ≥ 1`.

**Missing** = placed Teknik where `stationEquipment === undefined` **OR** `Array.isArray(stationEquipment) && stationEquipment.length === 0`.

| Key | Swedish |
| --- | --- |
| `hallSaknarRedskapBanner` | {n} stationer saknar redskap |
| `hallSaknarRedskapBannerOne` | 1 station saknar redskap |

### Pluralization helper

Mirror `hallUnplacedBannerText`:

```
hallSaknarRedskapBannerText(n):
  n === 1 → hallSaknarRedskapBannerOne
  else    → hallSaknarRedskapBanner with {n} replaced
```

- Soft `role="status"` — same visual-weight family as `.hall-unplaced-banner`.  
- Prefer singular key when N === 1.  
- **Do not** render on Golvklart / floor (`isFloor`).  
- **Do not** disable Golvklart / place / Stäng because of this count.  
- Banner count (unset + `[]`) may be **≥** Slice 19 `eligibleSuggestedCount` (unset + seed only).

---

## Optional point-CTA (B1) — only when eligible ≥ 1

When banner is visible **and** `eligibleSuggestedCount ≥ 1` (Slice 19: placed Teknik + unset + non-empty seed), show a secondary ≥44px control. When eligible === 0: **banner text only** — no CTA.

| Key | Swedish |
| --- | --- |
| `hallSaknarPointApplyAll` | Använd alla förslag |
| `hallSaknarPointApplyAllAria` | Visa Använd alla förslag. Sparar inte automatiskt. |
| `hallSaknarPointApplyAllToast` | Tryck Använd alla förslag för att spara. |

### Behavior (copy contract for Builder)

1. On tap: focus / scroll / brief highlight existing **Använd alla förslag** (`hallApplyAllSuggested`) and/or show `hallSaknarPointApplyAllToast` (`role="status"`, brief).  
2. **Stop.** Do **not** call `applyAllSuggestedStationEquipment` / `handleApplyAllSuggested`.  
3. Coach taps the real Hall **Använd alla förslag** to persist (Slice 19 unchanged).  
4. Do **not** open **Redigera redskap** / compose from this banner.

### Notes

- Visible CTA reuses the locked term **Använd alla förslag** (same naming family as Slice 19 / Slice 24 point path).  
- Aria states explicitly: **sparar inte automatiskt**.  
- Toast is optional (Builder picks focus vs toast vs light combo); keep quiet — toast ≠ tip strip.  
- Cleared `[]` stations still count toward the banner but are **not** Slice 19–eligible → often text-only banner.  
- Do **not** invent a second apply path or “Acceptera alla” synonyms.

Conceptual layout (~390px), missing ≥1 · eligible ≥1:

```
Hallöversikt edit
{n} stationer saknar redskap          ← role="status"
[ Använd alla förslag ]               ← ≥44px secondary; points only
… canvas / tray …
[ Golvklart ]                         ← still enabled
```

Missing ≥1 · eligible = 0:

```
Hallöversikt edit
{n} stationer saknar redskap          ← text only; no CTA
```

Golvklart: no saknar banner.

---

## Hall apply-all (reuse — do not duplicate)

| Key | Swedish |
| --- | --- |
| `hallApplyAllSuggested` | Använd alla förslag |
| `hallApplyAllSuggestedAria` | Använd alla osparade redskapsförslag på placerade Teknik-stationer |
| `hallApplyAllSuggestedDisabled` | Inga stationer med osparade förslag |
| `hallApplyAllSuggestedResult` | Sparade redskap på {n} stationer |
| `hallApplyAllSuggestedResultOne` | Sparade redskap på 1 station |
| `hallApplyAllSuggestedNone` | Inga osparade förslag just nu. |

Full lock: [`anvand-alla-forslag.sv.md`](../../docs/anvand-alla-forslag.sv.md). Slice 25 only **points** at this control.

---

## Unplaced banner (reuse — do not change)

| Key | Swedish |
| --- | --- |
| `hallUnplacedBanner` | {n} stationer ej placerade |
| `hallUnplacedBannerOne` | 1 station ej placerad |

If both unplaced status and saknar are visible on the same surface: unplaced first, saknar under (C1). Today’s floor unplaced banner stays; saknar is **edit-only** — stacking may be rare.

---

## Footer (E1)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 25 |

Keep footer `no-print`.

---

## Out of scope (do not invent)

- Auto-apply / auto-spara from this banner  
- Opening Redigera redskap / compose from banner  
- Showing saknar banner on Golvklart  
- Förråd empty soft-path rewrite (Slice 24 stays)  
- Kom igång place-heuristic copy (Slice 26)  
- New tip strip (`tip*` for this signal)  
- Synonyms that imply cloud/sync/accounts  
- Renaming **Använd alla förslag** / **Hallöversikt** / caption  
- Counting only unset and ignoring `[]`

---

## Notes for Builder

- Wire `hallSaknarRedskapBanner` / `One` + `hallSaknarRedskapBannerText(n)` in `blockMeta.ts` (mirror `hallUnplacedBannerText`).  
- Wire optional `hallSaknarPointApplyAll` (+ aria / optional toast) only when `eligibleSuggestedCount ≥ 1`.  
- Mount on Hall **edit** soft status region; hide when `isFloor`.  
- Missing-count helper: unset **and** `[]` among placed Teknik — keep Slice 19 eligibility unchanged.  
- Soft chrome family of `.hall-unplaced-banner`; never block Golvklart / place / Stäng.  
- Prefer these strings over inventing synonyms (“Acceptera alla”, “Saknar utrustning”, “Fyll redskap”).  
- Living companions updated in the same Docs pass. No Förråd file edits. No Kom igång place-heuristic.
