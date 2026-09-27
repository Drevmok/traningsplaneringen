# Slice 28 — handoff

**Status:** **SHIPPED after Verifier PASS 2026-09-27** — report `verifier/slice-28-verify-report.md`; A1/B1/C1/D1/E1/F1 locked. Repo footer is Slice 28; Phone/Pages stays Slice 27 until Christoffer asks to republish.

Backlog: **Mall Samling within budget** → **Shipped** after Verifier PASS 2026-09-27. **Home 3-question wizard** stays **Approved** (queued after Slice 28; Effort L; no pack until Planner says).

## Execution order (APPROVED)

1. **Docs** — living `docs/mall-samling-budget.sv.md` (+ Soft Samling cross-link) per locked E.  
2. **Builder** — only after Docs; `seedTemplates.ts` gathering per locked A/B; footer Slice 28; self-smoke.  
3. **Planner** pings **Verifier**.  
4. **Verifier** — this checklist + `verify-traningsplaneraren/`.

## Locked answers (APPROVED 2026-09-27)

| # | Lock | Meaning |
|---|---|---|
| A | **A1** | Beginner mall → Närvaro 3 + Dagens pass 3 (= Soft pair); sum 6 |
| B | **B1** | Short mall leave alone (Välkomstcheck-in 5 ≤ 6) |
| C | **C1** | Block duration stays `BLOCK_BUDGETS`; only item sums matter for Över budget |
| D | **D1** | Titles already from seed retitle Slice 27 — no extra title pass |
| E | **E1** | Thin living mall-samling-budget note |
| F | **F1** | No wizard / hall pre-place / Pages; preserve 22–27; footer 28 |

## Paths

| Path | Role |
|---|---|
| `slice-28/` | This pack |
| `slice-28/content/` | Docs reference placeholder until Docs ships |
| `app/src/data/seedTemplates.ts` | **Primary edit** — beginner (± short) gathering items |
| `app/src/lib/session.ts` | `cloneTemplate` — already rebinds budget; Soft blank untouched |
| `app/src/data/seedActivities.ts` | Soft pair + Välkomstcheck-in seeds (library unchanged) |
| `app/src/data/blockMeta.ts` | `BLOCK_BUDGETS.gathering = 6`; footer → 28 |
| `app/src/components/BlockCard.tsx` | Soft Över budget display (no hard block) |
| `docs/soft-samling.sv.md` | Living Soft Samling — cross-link from E1 |
| `docs/mall-samling-budget.sv.md` | Living Docs deliverable (E1) |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | Mall Samling → Slice 28 Shipped after Verifier PASS; Home wizard → Approved queued |

## Not this pack

- Home 3-question wizard → full pass + hall placements (Approved backlog; **after** Slice 28).  
- Pre-placing Teknik on hall from mall apply.  
- Lowering gathering budget back to 5.  
- Changing Soft blank inject (Slice 27).  
- Deleting Välkomstcheck-in from seed library.  
- Migrating drafts already cloned from old mall compositions.  
- Netlify / Pages republish unless Christoffer asks.  
- CAD / cloud / accounts / sync.  
- Self-pinging agents — Planner coordinates Docs → Builder → Verifier after APPROVED.
