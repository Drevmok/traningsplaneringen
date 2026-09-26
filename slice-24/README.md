# Slice 24 — Förråd tom → peka på Använd alla förslag

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — recommended A–F locked  
**Date drafted:** 2026-09-26  
**Status:** **APPROVED** — Christoffer approved via Planner lock widget; Docs may start.

**Backlog:** Christoffer (2026-09-26) approved Scout idea **#3** (Effort S). Live baseline: https://drevmok.github.io/traningsplaneringen/ (Slice 23 Home polish). Slice 19 **Använd alla förslag** + Slice 22 quiet chrome + Slice 23 Home polish stay.

**Leaves Proposed (out of this pack):** Hall soft “saknar redskap” banner · Kom igång place-step heuristic.

## Goal

When Förrådslista is empty **and** at least one placed Teknik still has unset `stationEquipment` with a non-empty seed (same eligibility as Slice 19), the empty sheet should offer a soft path toward the existing Hall edit CTA — without inventing compose, auto-persist, or a saknar banner:

1. **Soft empty-state path when eligible** — secondary Swedish copy + ≥44px CTA only when `rows.length === 0` **and** `eligibleSuggestedCount ≥ 1`.
2. **CTA closes Förråd → Hall edit → point at Använd alla förslag** — coach still taps the existing apply-all; do **not** auto-run it from Förråd.
3. **When not eligible** — keep today’s empty hint only (per-markör Redigera redskap).

**Coach outcome:** “När Förrådslistan är tom men det finns förslag att spara, stänger jag arket och hittar **Använd alla förslag** på Hallöversikt — utan att öppna Redigera redskap från Förråd.”

## Locked A–F (Christoffer 2026-09-26) (awaiting Christoffer lock)

| # | Rec | Meaning |
|---|---|---|
| **A** | **A1** | Show soft empty-state CTA only when Förråd `rows.length === 0` **AND** `eligibleSuggestedCount ≥ 1` (pass count into `ForradslistaSheet` from `HallBoard`). Else keep current empty hint. |
| **B** | **B1** | CTA: close Förråd sheet → ensure Hall **edit** mode (not Golvklart) → focus/scroll/highlight existing **Använd alla förslag** (or brief soft toast pointing at it). Do **not** call apply-all automatically. |
| **C** | **C1** | Soft secondary text + ≥44px button; Swedish via Docs; reuse/aria for pointing at Använd alla förslag; no new tip strip; no saknar banner; if toast used, brief only (Slice 22 one-chrome-layer — toast ≠ tip strip stacking with multi-line hints). |
| **D** | **D1** | Thin Docs — empty-state soft copy + CTA label (+ aria); update living Förråd docs if any; no Home / Öppna på telefon changes. |
| **E** | **E1** | Footer `Träningsplaneraren · Slice 24` |
| **F** | **F1** | No compose from Förråd; no auto-persist; no saknar-redskap banner; no place-heuristic; no station-breakdown; no library/CAD/cloud; no Pages republish unless asked; preserve Slice 19 apply-all + Slice 22 quiet chrome + Slice 23 Home polish. |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only
- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose; **no** compose opened from Förråd
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** (or existing locked wording) unchanged
- Device-local drafts; **no** accounts / cloud / sync wording
- **NO** CAD / equipment pins / canvas badge
- Golvklart / Förråd / print = **saved** composition only (Slices 14–15/18) — soft path may lead coach to persist via existing Slice 19 CTA, never promote seeds without save
- Footer `Träningsplaneraren · Slice 24` when shipped (recommended E)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **11–23** behavior except this Förråd empty soft path

## Problem baseline

| Pain | Baseline today |
|---|---|
| Empty Förråd | `ForradslistaSheet.tsx`: `empty = rows.length === 0` → only `forradslistaEmpty` + `forradslistaEmptyHint` (per-markör Redigera redskap). No bridge to Hall apply-all. |
| Apply-all exists | `HallBoard.tsx` edit chrome: **Använd alla förslag** gated by `eligibleSuggestedCount === 0`; eligibility = `eligibleSuggestedStationEquipmentItems` in `session.ts` (placed Teknik + unset + non-empty seed). |
| Quiet floor | Förråd / Golvklart / print still omit unset / `[]` — empty packing is often “placed but unset”, which Slice 19 already solves on Hall edit. |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `ForradslistaSheet` | `app/src/components/ForradslistaSheet.tsx` | Props today: `rows`, `onClose`; empty = `rows.length === 0` |
| `forradOpen` / sheet open | `HallBoard.tsx` | Opens sheet from edit **and** Golvklart chrome |
| `eligibleSuggestedCount` | `HallBoard.tsx` | `eligibleSuggestedStationEquipmentItems(session).length` |
| `UI.hallApplyAllSuggested` | `blockMeta.ts` + Docs | Existing Hall edit CTA — **reuse**, do not duplicate apply logic in Förråd |
| `eligibleSuggestedStationEquipmentItems` | `app/src/lib/session.ts` | Slice 19 eligibility — **same** gate for soft path |
| `applyAllSuggestedStationEquipment` | `session.ts` | Persist path — **only** via existing Hall CTA, not from Förråd |
| `UI.forradslistaEmpty` / `EmptyHint` | `blockMeta.ts` + `docs/forradslista.sv.md` | Today’s empty copy — keep when not eligible |
| Slice 22 C1 | Hall chrome layering | Tip strip / banner / multi-line hints — toast OK if brief; no new tip strip |
| Caption / compose / library / CAD | Standing locks | Unchanged |

## In scope

1. Soft empty-state CTA + copy when empty **and** eligible (A1).
2. Pass `eligibleSuggestedCount` (or equivalent boolean) into `ForradslistaSheet` from `HallBoard`.
3. CTA closes sheet → Hall edit → point at existing **Använd alla förslag** without auto-apply (B1).
4. Thin Docs for soft copy + CTA (+ aria); living Förråd touch-up (D1).
5. Footer → Slice 24 when shipped (E1).
6. Verification checklist covering recommended A1/B1/C1/E1/F1 + build green.

## Out of scope

- Auto-run `applyAllSuggestedStationEquipment` from Förråd
- Opening **Redigera redskap** / compose from Förråd
- Promoting seeds onto Förråd / Golvklart / print without save
- Scout Proposed **saknar-redskap** banner (keep separate)
- Scout Proposed Kom igång **place-heuristic**
- Parked Förråd station-breakdown UI
- Passbyggaren compose / library growth / CAD / caption / cloud / sync
- Home / Öppna på telefon changes (Slice 23)
- Netlify / Pages republish unless Christoffer asks

## Pipeline note

After Christoffer **APPROVES** A–F:

1. **Docs** → Swedish soft empty copy + CTA label (+ aria); living `docs/forradslista.sv.md` (+ apply-all cross-ref if needed)  
2. **Builder** → implement locked A–F; self-smoke via `verify-traningsplaneraren/`; footer Slice 24  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` as authority + project skill `verify-traningsplaneraren/`

**Do not ping Docs / Builder / Verifier while status is DRAFT.**

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** — soft empty bridge to existing Slice 19 CTA; one Docs → Builder → Verifier loop after APPROVED.
