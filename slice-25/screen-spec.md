# Slice 25 — screen spec (APPROVED · A–F locked)

**Status:** **APPROVED 2026-09-26** — behavior follows locked A1/B1/C1/D1/E1/F1.  
**Viewport focus:** Phone ~390px and desktop; Hallöversikt **edit** chrome (not Golvklart).

## 1) Soft saknar banner on edit (locked A1)

```
HallBoard edit header / soft status region (NOT isFloor)

missingSavedCompositionCount =
  count of placed Teknik (placeableItems ∩ hallPlacements)
  where stationEquipment === undefined
     OR (Array.isArray(stationEquipment) && stationEquipment.length === 0)

When isFloor === true (Golvklart):
  Do NOT render saknar banner

When isFloor === false AND missingSavedCompositionCount < 1:
  No saknar banner

When isFloor === false AND missingSavedCompositionCount ≥ 1:
  <p class="…" role="status">
    Docs pluralized string (e.g. "{n} stationer saknar redskap")
  </p>
  + optional B1 CTA (see §2)
```

**Do not change:** Golvklart / Förråd / print quiet-until-saved rules; Slice 19 eligibility (unset+seed only).

## 2) Optional CTA (locked B1)

```
eligibleSuggestedCount = eligibleSuggestedStationEquipmentItems(session).length
  // placed Teknik + stationEquipment === undefined + non-empty seed
  // NOTE: [] is NOT eligible — CTA may be absent while banner still shows

When missing count ≥ 1 AND eligibleSuggestedCount ≥ 1:
  Secondary ≥44px control (Docs label / aria)
  On tap:
    1. Focus / scroll / brief highlight existing Använd alla förslag
       AND/OR brief role="status" toast pointing at it
    2. STOP — do not invoke handleApplyAllSuggested / applyAllSuggestedStationEquipment

When missing count ≥ 1 AND eligibleSuggestedCount === 0:
  Banner text only — no CTA
```

## 3) Copy / chrome (locked C1)

```
Hall edit (~390px conceptual):

  [ Hallöversikt · actions: Flöde · Förråd · Använd alla förslag · Golvklart ]
  [ (optional) unplaced status if present on this surface ]
  [ {n} stationer saknar redskap ]
  [ Använd alla förslag ]   ← only if eligibleSuggestedCount ≥ 1; ≥44px secondary
```

- Swedish only; Docs owns keys (pattern after `hallUnplacedBanner` / `hallUnplacedBannerOne` + `hallUnplacedBannerText`).
- Visual weight family: soft status like `.hall-unplaced-banner`.
- Stacking if both unplaced + saknar visible: unplaced first, saknar under (Builder pick).
- No tip strip. Never disable Golvklart / place / Stäng because of saknar count.

**Code note:** Today `hall-unplaced-banner` lives in the **floor** header; edit lists unplaced in the tray. Saknar is **edit-only** — stacking may be rare unless both status lines share edit chrome.

## 4) Controls that must still work

| Control | Behavior |
|---|---|
| Golvklart / enterFloor | Unchanged; never blocked by saknar banner |
| Place / remove / tray | Unchanged |
| **Använd alla förslag** | Unchanged Slice 19 enable/apply/result; banner may point at it |
| Förråd (Slice 24 soft path) | Unchanged |
| Stäng / back | Unchanged |
| Floor unplaced banner | Unchanged (out of scope to relocate) |
| Caption / Home Slice 23 | Unchanged |

## Surfaces that must not change

| Surface | |
|---|---|
| Kom igång place heuristic | Unchanged (**Slice 26**) |
| Förråd empty soft path | Unchanged (Slice 24) |
| Passbyggaren compose / library / CAD / caption / cloud | Unchanged |
| Slice 19 apply-all eligibility / persist | Unchanged (point only) |
| Slice 22 quiet chrome / Slice 23 Home | Unchanged |
| Device-local drafts model | Unchanged |

## Layout sketches

### Edit · missing ≥1 · eligible ≥1

```
[ Hallöversikt edit ]
[ {n} stationer saknar redskap ]
[ Använd alla förslag → ]  ← points at header apply-all; does not auto-apply
[ … canvas / tray … ]
[ Golvklart ]  ← still enabled
```

### Edit · missing ≥1 · eligible = 0 (e.g. all cleared `[]`)

```
[ Hallöversikt edit ]
[ {n} stationer saknar redskap ]   ← text only; no CTA
```

### Golvklart

```
[ Golvklart header · optional floor unplaced banner ]
(no saknar-redskap banner)
```
