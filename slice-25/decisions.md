# Slice 25 — decisions (APPROVED · A–F locked)

**Status:** **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked.  
Docs may start. Builder only after Docs; Verifier only after the Planner ping.  
**Direction:** Soft Hallöversikt **edit** banner counting placed Teknik with missing saved redskap (unset **and** `[]`); optional point at **Använd alla förslag** when Slice 19–eligible; never block Golvklart.

Christoffer locked A1/B1/C1/D1/E1/F1 on 2026-09-26 via Planner. Slice 26 stays a separate pack.

## Locked A–F (2026-09-26)

| # | Lock | Meaning |
|---|---|---|
| A | **A1** | Soft `role="status"` banner on Hall **edit only** when placed Teknik missing saved composition ≥1; treat **unset and `[]`** as missing; hide on Golvklart |
| B | **B1** | Unplaced-like copy (“{n} stationer saknar redskap”); optional ≥44px CTA → point at **Använd alla förslag** only when `eligibleSuggestedCount ≥ 1`; no auto-apply; text-only when eligible=0 |
| C | **C1** | Soft status chrome (unplaced visual family); Slice 22 one-chrome-layer; may stack under unplaced if both >0; no tip strip; never blocks place/Golvklart/Stäng |
| D | **D1** | Thin Docs — banner + plural + optional CTA/aria; living Hall touch-up; no Förråd / Kom igång heuristic |
| E | **E1** | Footer `Träningsplaneraren · Slice 25` |
| F | **F1** | No auto-apply; no compose from banner; no Passbyggaren; no library/CAD/cloud; no Pages unless asked; **no** Slice 26 place-heuristic; preserve 19+22+23+24 |

---

## A. What Slice 25 touches

| Surface | Slice 25 change? |
|---|---|
| Hallöversikt **edit** header / soft status chrome | **Yes** — saknar-redskap banner (A1) |
| Hallöversikt **Golvklart / floor** | **No** — banner hidden |
| Hall **Använd alla förslag** | **Point at** when eligible; do **not** change eligibility / apply semantics |
| Förrådslista empty soft path | **No** — Slice 24 shipped |
| Kom igång place heuristic | **Out** — Slice 26 |
| Passbyggaren / library / CAD / caption | **No** |

---

## DECISION RATIONALE — locked A–F

### A. When / where / what counts as “saknar”?

**Locked A1: Edit-only soft banner; unset AND `[]` count as missing**

- Show when `missingSavedCompositionCount ≥ 1` among **placed** Teknik (`placeableItems` ∩ `hallPlacements`).
- **Missing** = `stationEquipment === undefined` **OR** `Array.isArray(stationEquipment) && stationEquipment.length === 0`.
- Rationale for including `[]`: both mean “no useful saved redskap for floor” (Golvklart/Förråd/print stay quiet). Coach cleared list still “saknar” for packing readiness.
- **Hide** when `isFloor` / Golvklart.
- Never gate or disable Golvklart / place / Stäng on this count.

| Option | Note |
|---|---|
| **A1 (locked)** | Edit-only; unset **and** `[]` | Matches Scout Approved signal; avoids empty-floor surprise including cleared stations |
| A2 | Edit-only; **unset only** (ignore `[]`) | Reject — cleared `[]` still yields empty floor packing; Scout/Planner lock treats both as missing |
| A3 | Show on Golvklart too | Reject — quiet floor; Scout: hide on Golvklart |
| A4 | Block Golvklart until count=0 | Reject — never block Golvklart |

**Rationale:** Soft readiness signal on the edit surface where coaches compose and apply-all. Floor stays quiet (Slices 14–18). Including `[]` aligns “no useful saved redskap” with what Förråd/Golvklart actually show.

**Code note:** Slice 19 `eligibleSuggestedStationEquipmentItems` still excludes `[]` (only unset + seed). Banner **count** (A1) can be ≥ eligible count; CTA gate (B1) stays Slice 19 eligibility.

**Rejected:** A2/A3/A4 — see table.

---

### B. Copy + optional CTA?

**Locked B1: Unplaced-like copy; optional point-at-apply-all when eligible**

- Docs-owned Swedish, patterned on `hallUnplacedBanner` / `hallUnplacedBannerText` (e.g. “{n} stationer saknar redskap” + singular form).
- Optional secondary ≥44px control: only when `eligibleSuggestedCount ≥ 1`.
- On tap: focus / scroll / brief highlight existing **Använd alla förslag** (and/or brief soft toast) — **do not** call `applyAllSuggestedStationEquipment` / `handleApplyAllSuggested`.
- When `eligibleSuggestedCount === 0`: banner **text only** (stations may be `[]` or unset-without-seed — no dead CTA).

| Option | Note |
|---|---|
| **B1 (locked)** | Text + optional point CTA when eligible | Soft bridge; no dead CTA; preserves Slice 19 confirm |
| B2 | Auto-apply from banner when eligible | Reject — too aggressive; wrong confirm surface |
| B3 | Always show CTA (even when eligible=0) | Reject — dead CTA |
| B4 | Open Redigera redskap / compose from banner | Reject — standing compose entry lock |

**Rationale:** Banner informs; apply-all remains the only bulk-persist confirm. Pointing beats duplicating apply logic or inventing compose-from-banner.

**Rejected:** B2/B3/B4.

---

### C. Chrome / stacking?

**Locked C1: Soft status family; may coexist under unplaced; no tip strip**

- Same visual-weight family as `.hall-unplaced-banner` (`role="status"`).
- Slice 22 one-chrome-layer: soft banner OK; **no** new tip strip.
- If both unplaced count >0 and saknar count >0 on a surface that shows both: prefer **show both**, saknar **under** unplaced (Builder pick documented).
- **Code surprise for Builder:** today’s `hall-unplaced-banner` in `HallBoard.tsx` renders in the **floor** header (`isFloor` branch), while saknar (A1) is **edit-only**. They may not stack on the same view unless Builder also surfaces unplaced status on edit (tray already lists unplaced). Prefer stacking rule if/when both appear; do not relocate floor unplaced banner as part of this pack unless needed for coexistence.
- Never blocks place / Golvklart / Stäng.

| Option | Note |
|---|---|
| **C1 (locked)** | Soft status; stack under unplaced if both; no tip strip | Matches Scout + Slice 22 |
| C2 | Tip strip for saknar | Reject — new teaching chrome / F1 |
| C3 | Blocking modal / disable Golvklart | Reject — Scout lock |

**Rejected:** C2/C3.

---

### D. Docs surface?

**Locked D1: Thin Docs**

- Banner string (+ pluralization helper like `hallUnplacedBannerText`) + optional CTA label/aria.
- Living Hall docs touch-up (e.g. hall-declutter / ui-chrome companions as Docs picks).
- **No** Förråd empty-path rewrite (Slice 24).
- **No** Kom igång place-heuristic copy (**Slice 26**).

| Option | Note |
|---|---|
| **D1 (locked)** | Thin strings + Hall living-doc touch-up | Enough for A1/B1/C1 |
| D2 | Rewrite Förråd + Kom igång docs | Reject — other packs |
| D3 | No Docs pass | Reject — new visible Swedish needs Docs |

Pack placeholder: [`content/`](./content/) — Docs fills Swedish after lock.

---

### E. Footer?

**Locked E1:** `Träningsplaneraren · Slice 25` when Builder ships.

| Option | Note |
|---|---|
| **E1 (locked)** | Footer Slice 25 | Standard |
| E2 | Keep Slice 24 footer | Reject — ship marker |

---

### F. Hard non-goals (this pack)?

**Locked F1 — all stand:**

- **No** auto-apply from banner
- **No** compose / **Redigera redskap** from banner
- **No** Kom igång place-heuristic (**Slice 26** — separate pack; F1 explicitly excludes)
- **No** Passbyggaren compose; no library growth; no CAD / pins / badge
- Caption **Schematisk hall — inte exakt mått** unchanged
- **No** accounts / cloud / sync wording
- **No** Netlify / GitHub Pages republish unless Christoffer asks
- Preserve Slice **19** apply-all semantics, Slice **22** quiet chrome / one chrome layer, Slice **23** Home polish, Slice **24** Förråd empty soft path

| Option | Note |
|---|---|
| **F1 (locked)** | All non-goals above | Keeps pack Hall-saknar-banner-only |
| F2 | Bundle Slice 26 place-heuristic | Reject — different surface (Home/Kom igång); no auto-bundle |

---

## Open questions (implementation notes)

| # | Question | Guidance |
|---|---|---|
| Q1 | Helper location for missing count? | Prefer pure helper near `eligibleSuggestedStationEquipmentItems` / `hall.ts` (e.g. `placedTeknikMissingSavedEquipment`) — count unset **and** `[]`; keep Slice 19 eligibility unchanged. |
| Q2 | Focus vs toast for optional CTA? | Builder picks: scrollIntoView + brief highlight preferred; optional brief toast if easy to miss on phone. Not both loud. |
| Q3 | Stacking with today’s floor unplaced banner? | Saknar is edit-only; floor unplaced stays. If both ever share a view: saknar under unplaced. Do not move floor unplaced into this pack’s scope unless Builder needs edit coexistence. |
| Q4 | Banner when count>0 but eligible=0? | Yes — text only (A1 + B1). |
| Q5 | Interaction with Slice 26? | None — F1 excludes place-heuristic. |

---

## Rejected alternatives (brief)

| Rejected | Why |
|---|---|
| A2 count unset only (not `[]`) | Empty floor still surprises after clear |
| A3 show on Golvklart | Quiet floor |
| A4 / C3 block Golvklart | Scout / standing soft chrome |
| B2 auto-apply | Wrong confirm surface |
| B3 dead CTA when eligible=0 | Broken path |
| B4 compose from banner | Standing compose entry |
| C2 tip strip | Chrome / F1 |
| D2/D3 heavy or no Docs | Scope / Swedish gate |
| F2 bundle Slice 26 | Different packs / surfaces |
