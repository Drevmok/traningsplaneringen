# Slice 26 — Kom igång place step needs real placement

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked  
**Date drafted:** 2026-09-26  
**Status:** **APPROVED 2026-09-26** — Christoffer locked A1/B1/C1/D1/E1/F1 via Planner. Docs may start after Slice 25 Docs; Builder after Docs; Verifier only after Planner ping.

**Backlog:** Christoffer (2026-09-26 via Planner) **Approved** Scout leftover **#2** (Effort S). Live baseline: https://drevmok.github.io/traningsplaneringen/ (footer Slice 24). Repo `Drevmok/traningsplaneringen`.

**Leaves out of this pack:** Hall soft “saknar redskap” banner → **Slice 25** (separate pack; different surface — Hall; **no auto-bundle**).

## Goal

Checklist step “placera på hallen” (`openHallAndPlace`) only checks off after ≥1 Teknik is actually on the schematic — not merely after opening Hallöversikt:

1. **Placement-only auto-progress** — `syncChecklistHeuristics` advances `openHallAndPlace` only when `placementCount >= 1`.
2. **Stop open-only credit** — bare `openedHall` / `markOpenedHall` must not alone check the place step (for new sync).
3. **Legacy soft** — if tips state already has `openHallAndPlace: true` from open-only, leave as-is (no regress old coaches). Keep soft — do not block Hall / Golvklart navigation.

**Coach outcome:** “Kom igång räknar ‘placera’ först när jag faktiskt lagt en Teknik-markör på hallen — inte bara för att jag öppnade Hallöversikt.”

## Locked A–F

| # | Lock | Meaning |
|---|---|---|
| **A** | **A1** | Auto-progress `openHallAndPlace` **only** when `placementCount >= 1`. Stop counting bare `openedHall` for checklist completion. Keep soft — do not block Hall/Golvklart navigation. |
| **B** | **B1** | **Legacy:** If tips state already has `openHallAndPlace: true` from open-only, **leave as-is** (no regress old coaches’ checked step). New sync only advances via placement. Optionally still set `openedHall` flag for other uses if any, but it must not alone check the place step. |
| **C** | **C1** | Docs: clarify step copy if needed so “placera” means on-hall placement; no new tip strip; thin living Kom igång docs. |
| **D** | **D1** | Thin Docs only for step wording if copy changes; no Hall saknar banner (Slice 25). |
| **E** | **E1** | Footer `Träningsplaneraren · Slice 26` |
| **F** | **F1** | No change to Teknik-only placeable set; no compose entry change; no drafts model change; no saknar banner; no library/CAD/cloud; no Pages unless asked; preserve 19–25 when 25 ships first (or if 26 ships before 25: preserve through 24 + don’t absorb 25). |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only
- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** (or existing locked wording) unchanged
- Device-local drafts; **no** accounts / cloud / sync wording
- **NO** CAD / equipment pins / canvas badge
- Footer `Träningsplaneraren · Slice 26` when shipped (locked E)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **11–24** behavior except this Kom igång place heuristic; when Slice 25 has shipped, preserve it too (or if 26 ships first: do not absorb 25)

## Problem baseline

| Pain | Baseline today |
|---|---|
| Open counts as place | `coachTips.ts` `syncChecklistHeuristics`: sets `openHallAndPlace` when `placementCount >= 1 || state.openedHall`. |
| Open path also checks | `markOpenedHall` sets `openedHall: true` **and** `checklist.openHallAndPlace: true` (called from `App.tsx` on Hall open paths). |
| Slice history | Slice 09 shipped open-or-place; Slice 16 added compose step (`composeStationEquipment`) but left place heuristic unchanged. |
| Copy already says place | `UI.komIgangStep3`: “Öppna Hallöversikt och placera stationer”; hint talks about dragging Teknik — heuristic still allows open-only. |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `openHallAndPlace` | `coachTips.ts` checklist key | Kom igång place step |
| `syncChecklistHeuristics` | `app/src/lib/coachTips.ts` | Auto-progress including place OR `openedHall` |
| `markOpenedHall` | `coachTips.ts` | Sets `openedHall` + currently forces `openHallAndPlace: true` |
| `openedHall` | `CoachTipsStateV1` | Flag set on Hall open |
| `placementCount` | `App.tsx` → sync opts | Count of hall placements |
| `KomIgangCard` | `app/src/components/KomIgangCard.tsx` | Renders step `openHallAndPlace` → `UI.komIgangStep3*` |
| `UI.komIgangStep3` / `komIgangStep3Hint` | `blockMeta.ts` | Step label / hint |
| `composeStationEquipment` | Slice 16 | Separate step — do not require compose to check place |
| Slice 22 quiet Kom igång | Home | Compact/quiet chrome stays |
| Caption / compose / library / CAD | Standing locks | Unchanged |

## In scope

1. Change auto-progress so `openHallAndPlace` advances only on `placementCount >= 1` (A1).
2. Stop `markOpenedHall` / bare `openedHall` from alone checking the place step for **new** advances (A1/B1).
3. Legacy: leave already-true `openHallAndPlace` as-is (B1).
4. Thin Docs clarify step wording if needed (C1/D1).
5. Footer → Slice 26 when shipped (E1).
6. Verification checklist covering locked A1/B1/C1/E1/F1 + build green.

## Out of scope

- Requiring compose / saved redskap to check the place step
- Clearing previously checked open-only steps (legacy regress)
- Blocking Hall open / Golvklart when place step unchecked
- Hall soft saknar-redskap banner (**Slice 25**)
- Changing Teknik-only placeable set / compose entry / drafts model
- Passbyggaren compose / library growth / CAD / caption / cloud / sync
- Netlify / Pages republish unless Christoffer asks

## Pipeline note

After Christoffer **APPROVED** A–F:

1. **Docs** → only after Slice 25 Docs; clarify step copy if needed (placera = on-hall); thin living Kom igång docs  
2. **Builder** → only after Docs; implement locked A–F; self-smoke via `verify-traningsplaneraren/`; footer Slice 26  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` as authority + project skill `verify-traningsplaneraren/`

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** — heuristic + optional thin Docs; one Docs → Builder → Verifier loop after APPROVED.
