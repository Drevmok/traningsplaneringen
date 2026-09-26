# Slice 25 — Hall soft “saknar redskap” banner

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked  
**Date approved:** 2026-09-26  
**Status:** **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked. Docs may start; Builder only after Docs; Verifier only after Planner ping.

**Backlog:** Christoffer (2026-09-26 via Planner) **Approved** Scout leftover **#1** (Effort S). Live baseline: https://drevmok.github.io/traningsplaneringen/ (footer Slice 24). Repo `Drevmok/traningsplaneringen`.

**Leaves out of this pack:** Kom igång place-step heuristic → **Slice 26** (separate pack; different surface — Home/Kom igång; **no auto-bundle**).

## Goal

On Hallöversikt **edit**, show how many placed Teknik stations still have no useful saved redskap, so Golvklart / Förråd are not a surprise empty floor:

1. **Soft status banner on edit only** — when count of placed Teknik with missing saved composition ≥1 (`stationEquipment` **unset** or empty `[]`).
2. **Optional path to Använd alla förslag** — secondary ≥44px affordance only when `eligibleSuggestedCount ≥ 1` (same Slice 19 eligibility: unset + seed). Never auto-apply.
3. **Quiet chrome** — same visual-weight family as the unplaced banner; respect Slice 22 one-chrome-layer; never block place / Golvklart / Stäng.

**Coach outcome:** “På Hallöversikt i redigering ser jag hur många stationer som saknar redskap — och kan gå till **Använd alla förslag** när det finns förslag — utan att Golvklart blockeras.”

## Locked A–F (2026-09-26)

| # | Lock | Meaning |
|---|---|---|
| **A** | **A1** | Soft `role="status"` banner on Hallöversikt **edit only** when count of placed Teknik with missing saved composition ≥1. Treat **unset (`undefined`) AND empty `[]`** as missing for this signal. Hide on Golvklart / floor view. |
| **B** | **B1** | Copy pattern like unplaced: e.g. “{n} stationer saknar redskap” (Docs owns exact Swedish). Optional secondary affordance (≥44px) pointing at **Använd alla förslag** only when `eligibleSuggestedCount ≥ 1` (Slice 19: unset + seed). Do **not** auto-apply. When eligible count is 0: banner text only (no dead CTA). |
| **C** | **C1** | Soft status chrome, same visual weight family as unplaced banner (`.hall-unplaced-banner`); respect Slice 22 one-chrome-layer — may coexist with unplaced banner if both apply (stacking: unplaced first / saknar under — Builder pick: prefer show both if both counts >0, saknar under unplaced). No tip strip. Never blocks place / Golvklart / Stäng. |
| **D** | **D1** | Thin Docs — banner string (+ pluralization) + optional CTA/aria; living Hall docs touch-up; no Förråd / Kom igång heuristic changes. |
| **E** | **E1** | Footer `Träningsplaneraren · Slice 25` |
| **F** | **F1** | No auto-apply; no compose from banner; no Passbyggaren; no library/CAD/cloud; no Pages republish unless asked; **no** Kom igång place-heuristic (Slice 26); preserve 19+22+23+24. |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only
- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose; **no** compose opened from this banner
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** (or existing locked wording) unchanged
- Device-local drafts; **no** accounts / cloud / sync wording
- **NO** CAD / equipment pins / canvas badge
- Golvklart / Förråd / print = **saved** composition only (Slices 14–15/18) — banner is edit-only signal; never promotes seeds without save
- Footer `Träningsplaneraren · Slice 25` when shipped (locked E1)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **11–24** behavior except this Hall edit soft saknar banner

## Problem baseline

| Pain | Baseline today |
|---|---|
| No pass-wide saknar signal | After place → Använd alla förslag (Slice 19), only a short toast; nothing stays visible that N placed Teknik still lack saved redskap. |
| Unplaced signal exists | `HallBoard.tsx`: `hallUnplacedBannerText` / `UI.hallUnplacedBanner*` — soft `role="status"` (today rendered in **floor** header when `unplaced.length > 0`). Edit uses tray (`hallUnplacedWithCountText` / `hallUnplacedStations`). **No** parallel saknar-redskap count. |
| Apply-all is unset-only | `eligibleSuggestedStationEquipmentItems` (`session.ts`): placed Teknik + **`stationEquipment === undefined`** + non-empty seed. Cleared `[]` is **not** eligible (Slice 19 skips). |
| Quiet floor | Golvklart / Förråd / print stay quiet on unset / `[]` (Slice 18 lock). Banner must not appear on Golvklart and must never block Golvklart. |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `HallBoard` | `app/src/components/HallBoard.tsx` | Edit vs floor chrome; unplaced banner; apply-all; Förråd sheet |
| `hallUnplacedBannerText` | `app/src/data/blockMeta.ts` | Pluralized unplaced banner copy helper |
| `UI.hallUnplacedBanner` / `hallUnplacedBannerOne` | `blockMeta.ts` | Unplaced banner strings |
| `.hall-unplaced-banner` | `App.css` + floor header in `HallBoard` | Soft status chrome visual family |
| `eligibleSuggestedStationEquipmentItems` | `app/src/lib/session.ts` | Slice 19 eligibility (unset + seed only — **not** `[]`) |
| `eligibleSuggestedCount` | `HallBoard.tsx` | `eligibleSuggestedStationEquipmentItems(session).length` |
| `UI.hallApplyAllSuggested*` | `blockMeta.ts` | Existing apply-all CTA — point at / reuse; do not duplicate apply logic |
| `applyAllSuggestedStationEquipment` | `session.ts` | Persist path — **only** via existing Hall CTA, not from banner |
| `stationEquipment` | `types.ts` / SessionItem | `undefined` = unset (förslag); `[]` = cleared; non-empty = saved |
| Slice 22 C1 | Hall chrome layering | One chrome layer — soft banner OK; no tip strip |
| Slice 24 | Förråd empty soft path | Preserve; do not absorb into this pack |
| Caption / compose / library / CAD | Standing locks | Unchanged |

## In scope

1. Soft `role="status"` saknar-redskap banner on Hall **edit** when missing-composition count ≥1 (A1: unset **and** `[]`).
2. Hide banner on Golvklart / floor.
3. Optional ≥44px secondary affordance → point at / focus existing **Använd alla förslag** only when `eligibleSuggestedCount ≥ 1`; never auto-apply (B1).
4. Soft chrome weight family like unplaced; stacking note with unplaced if both visible (C1).
5. Thin Docs for banner (+ plural) + optional CTA/aria; living Hall touch-up (D1).
6. Footer → Slice 25 when shipped (E1).
7. Verification checklist covering locked A1/B1/C1/D1/E1/F1 + build green.

## Out of scope

- Auto-run `applyAllSuggestedStationEquipment` from the banner
- Opening **Redigera redskap** / compose from the banner
- Showing banner on Golvklart / floor; blocking Golvklart / place / Stäng
- Counting **only** unset and ignoring `[]` (rejected A2)
- Kom igång place-heuristic (**Slice 26**)
- Förråd empty soft-path changes (Slice 24 shipped)
- Passbyggaren compose / library growth / CAD / caption / cloud / sync
- Netlify / Pages republish unless Christoffer asks

## Pipeline note

With A1/B1/C1/D1/E1/F1 **locked** (APPROVED 2026-09-26):

1. **Docs may start** → Swedish banner (+ pluralization) + optional CTA/aria; living Hall docs touch-up  
2. **Builder** → after Docs, implement locked A–F; self-smoke via `verify-traningsplaneraren/`; footer Slice 25  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** runs only after the Planner ping, using this pack’s `verification-checklist.md` as authority + project skill `verify-traningsplaneraren/`

**Docs may start. Builder waits for Docs. Verifier waits for the Planner ping.**

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** — soft Hall edit status banner + optional point-at-apply-all; one Docs → Builder → Verifier loop after the APPROVED lock.
