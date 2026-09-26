# Slice 26 — handoff

**Status:** **SHIPPED** — Verifier **PASS 2026-09-26**; report [`verifier/slice-26-verify-report.md`](../verifier/slice-26-verify-report.md). Backlog moved to **Shipped**; A1/B1/C1/D1/E1/F1 remain locked.

Backlog: Kom igång place step needs real placement (Scout leftover #2 → **Shipped as Slice 26**). Hall saknar-redskap banner is **Slice 25** (separate). Preserve Slice 19–24 + Slice 25; no republish unless Christoffer asks.

## Order (after APPROVED)

1. **Docs** — Only after Slice 25 Docs; clarify step copy if needed (“placera” = on-hall); thin living Kom igång docs / heuristic note. Start from pack [`content/`](./content/) placeholder. No saknar banner copy. No tip strip. No republish.  
2. **Builder** — After Docs: implement locked A1/B1; `syncChecklistHeuristics` placement-only; `markOpenedHall` must not alone set place step; legacy leave-as-is; footer `Träningsplaneraren · Slice 26`; preserve 11–24 (+25 if present) except this heuristic. **Self-smoke** via `verify-traningsplaneraren/` before claiming shipped (`backlog/PSTACK-OPS.md`).  
3. **Planner** pings **Verifier** only after Builder ships.  
4. **Verifier** — Runs only after Planner ping. Use [`verification-checklist.md`](./verification-checklist.md) as authority + project skill `verify-traningsplaneraren/`.

## Locked answers

| # | Lock |
|---|---|
| A | **A1** Auto-progress `openHallAndPlace` only when `placementCount >= 1`; soft — no Hall/Golvklart block |
| B | **B1** Legacy leave already-true as-is; `openedHall` must not alone check the place step |
| C | **C1** Docs clarify placera if needed; no tip strip; thin living Kom igång docs |
| D | **D1** Thin Docs for step wording; no Hall saknar banner (Slice 25) |
| E | **E1** Footer `Träningsplaneraren · Slice 26` |
| F | **F1** No placeable/compose/drafts change; no saknar banner; no library/CAD/cloud; no Pages unless asked; preserve 19–25 (or through 24 if 26 first) |

## Paths

| Path | Role |
|---|---|
| `slice-26/` | This pack |
| `slice-26/content/` | Docs fills Swedish after lock (placeholder) |
| `app/src/lib/coachTips.ts` | `syncChecklistHeuristics`, `markOpenedHall`, `openHallAndPlace`, `openedHall` |
| `app/src/App.tsx` | `placementCount` sync opts; `markOpenedHall` callers |
| `app/src/components/KomIgangCard.tsx` | Step UI for `openHallAndPlace` |
| `app/src/data/blockMeta.ts` | `komIgangStep3*` (+ footer key) |
| `docs/kom-igang-redskap.sv.md` | Living Kom igång / compose docs companion |
| `verify-traningsplaneraren/features/home-kom-igang.md` | Feature notes for Verifier |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | Shipped Slice 26 · Shipped Slice 25 separate |

## Not this pack

- Netlify / Pages republish unless Christoffer asks.  
- Clearing legacy open-only checked steps.  
- Requiring compose to check place; blocking Hall open.  
- Hall saknar-redskap banner (**Slice 25**).  
- Passbyggaren Redigera redskap; badge; CAD; caption change; sync/accounts.  
- Changing Slice 19/22/23/24 (+25 if shipped) beyond this heuristic.  
- Self-pinging agents — **Planner** pings in order **after APPROVED** only.
