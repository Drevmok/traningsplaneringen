# Förråd tom → Använd alla förslag — svensk microcopy (Slice 24)

**Status:** Docs lock — Christoffer approved Slice 24 A–F (2026-09-26). Builder may ship from these keys.  
**Tone:** Soft secondary, warm, short, coach-to-coach. Prefer *du*. Not a hard banner.  
**Product lock:** When Förrådslista is empty **and** `eligibleSuggestedCount ≥ 1` (same Slice 19 population), show soft empty copy + ≥44px CTA that closes the sheet and points at Hall edit **Använd alla förslag**. Coach still taps apply-all. **No auto-apply. No compose from Förråd.**  
**Carry-forward:** Empty quiet packing (15). Apply-all eligibility + persist (19). Quiet chrome / one layer (22). Home polish (23) untouched.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Använd förslag · Använd alla förslag · Passbyggaren · Kom igång · Starta från mall  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** saknar-redskap banner · Kom igång place-heuristic · Förråd station-breakdown · tip strip · auto-spara från Förråd · compose från Förråd · Home/phone · CAPTION/CAD/library/cloud/accounts · Netlify/Pages republish

Living mirror: [`docs/forrad-empty-soft-path.sv.md`](../../docs/forrad-empty-soft-path.sv.md).  
Living companions: [`docs/forradslista.sv.md`](../../docs/forradslista.sv.md) · [`docs/anvand-alla-forslag.sv.md`](../../docs/anvand-alla-forslag.sv.md) · [`docs/ui-chrome.sv.md`](../../docs/ui-chrome.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| A | Soft path only when `rows.length === 0` **and** `eligibleSuggestedCount ≥ 1`; else today’s empty hint |
| B | CTA closes Förråd → Hall **edit** → focus/scroll/highlight **Använd alla förslag** (or brief toast); **no** auto-apply |
| C | Soft secondary text + ≥44px button; no tip strip; no saknar banner; brief toast OK under Slice 22 |
| D | Thin strings below + living Förråd / apply-all / ui-chrome |
| E | Träningsplaneraren · Slice 24 |
| F | No compose from Förråd; no auto-persist; no saknar / place-heuristic / station-breakdown / library / CAD / cloud |

---

## When empty + **not** eligible (unchanged)

Reuse Slice 15 — do **not** rewrite.

| Key | Swedish |
| --- | --- |
| `forradslistaEmpty` | Inga redskap summerade ännu. |
| `forradslistaEmptyHint` | Ange redskap på Teknik-stationerna. Tryck en markör och välj Redigera redskap. |
| `forradslistaEmptyHintShort` | Tryck en markör och välj Redigera redskap. |

No soft CTA.

---

## When empty + eligible (A1 / C1) — soft path

Show lead + soft hint + CTA. Soft hint **replaces** `forradslistaEmptyHint` (avoid stacked paragraphs). Do **not** also show the per-markör hint in this branch.

| Key | Swedish |
| --- | --- |
| `forradslistaEmpty` | Inga redskap summerade ännu. |
| `forradslistaEmptySoftHint` | Det finns osparade förslag. Stäng och tryck Använd alla förslag — då syns redskapen i Förrådslista. |
| `forradslistaPointApplyAll` | Använd alla förslag på hallen |
| `forradslistaPointApplyAllAria` | Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt. |
| `forradslistaPointApplyAllToast` | Tryck Använd alla förslag för att spara. |

### Behavior (copy contract for Builder)

1. Soft CTA closes Förrådslista.  
2. Ensure Hallöversikt **edit** (exit Golvklart / floor if needed).  
3. Point at existing `hallApplyAllSuggested` (**Använd alla förslag**) — scroll/focus/brief highlight and/or show `forradslistaPointApplyAllToast` (`role="status"`, brief).  
4. **Stop.** Do **not** call `applyAllSuggestedStationEquipment` / `handleApplyAllSuggested`.  
5. Coach taps **Använd alla förslag** on Hall to persist (Slice 19 unchanged).

### Notes

- Visible CTA reuses the locked term **Använd alla förslag** plus “på hallen” so Förråd does not look like it applies seeds itself.  
- Aria states explicitly: **sparar inte automatiskt**.  
- Toast is optional (Builder picks focus vs toast vs light combo); keep quiet — toast ≠ tip strip.  
- Eligibility = Slice 19 `eligibleSuggestedStationEquipmentItems` (placed Teknik + unset + non-empty seed).  
- Do **not** open **Redigera redskap** / compose from Förråd.  
- Do **not** invent saknar-count / place-heuristic / station-breakdown copy here.

Conceptual layout (~390px):

```
Förrådslista                         Stäng
Inga redskap summerade ännu.
Det finns osparade förslag. Stäng och
tryck Använd alla förslag — då syns
redskapen i Förrådslista.
[ Använd alla förslag på hallen ]     ← ≥44px secondary
```

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

Full lock: [`anvand-alla-forslag.sv.md`](../../docs/anvand-alla-forslag.sv.md). Slice 24 only **points** at this control.

---

## Footer (E1)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 24 |

Keep footer `no-print`.

---

## Out of scope (do not invent)

- Auto-apply / auto-spara from Förråd  
- Opening Redigera redskap / compose from Förråd  
- Saknar-redskap banner copy  
- Kom igång place-heuristic copy  
- Förråd station-breakdown UI copy  
- New tip strip (`tip*` for this path)  
- Home / Öppna på telefon changes  
- Synonyms that imply cloud/sync/accounts  
- Renaming **Använd alla förslag** / **Förrådslista** / caption  

---

## Notes for Builder

- Wire new keys into `blockMeta.ts` (or equivalent). Pass `eligibleSuggestedCount` (or derived boolean) into `ForradslistaSheet`.  
- Soft branch: `empty && eligibleSuggestedCount ≥ 1` → Empty + EmptySoftHint + PointApplyAll button.  
- Else empty: Empty + EmptyHint only.  
- Parent B1 handler owns close → edit → point; sheet stays read-only.  
- Prefer these strings over inventing synonyms (“Acceptera alla”, “Fyll Förråd”, “Spara förslag här”).  
- Living companions updated in the same Docs pass.
