# Slice 25 — handoff

**Status:** Verifier **PASS 2026-09-26** — Shipped in `backlog/IMPROVEMENTS.md`. A1/B1/C1/D1/E1/F1 locked.  
Phone/Pages remain Slice 24 until Christoffer asks republish; repo footer is already Slice 26 (26 verifying).

Backlog: Hall soft “saknar redskap” banner (Scout leftover #1 → Slice 25 Shipped after Verifier PASS). Kom igång place-heuristic is **Slice 26** (separate). Preserve Slice 19 apply-all + Slice 22 quiet chrome + Slice 23 Home polish + Slice 24 Förråd empty soft path.

## Order (APPROVED 2026-09-26)

1. **A1/B1/C1/D1/E1/F1 are locked** (2026-09-26 via Planner).  
2. **Docs may start** — Finalize Swedish banner (+ pluralization) + optional CTA/aria; living Hall docs touch-up. Start from pack [`content/`](./content/) placeholder. No Förråd rewrite. No Kom igång place-heuristic copy. No tip strip. No republish.  
3. **Builder** — After Docs strings: implement locked A1/B1/C1; missing-count helper (unset **and** `[]`); edit-only banner; optional point-at-apply-all when eligible; footer `Träningsplaneraren · Slice 25`; preserve 11–24 except this Hall edit soft banner. **Self-smoke** via `verify-traningsplaneraren/` before claiming shipped (`backlog/PSTACK-OPS.md`).  
4. **Verifier** — **Planner pings only** after Builder ships. Use [`verification-checklist.md`](./verification-checklist.md) as authority + project skill `verify-traningsplaneraren/`.

## Locked answers

| # | Lock |
|---|---|
| A | **A1** Soft edit-only banner; unset **and** `[]` count as missing; hide on Golvklart |
| B | **B1** Unplaced-like copy; optional ≥44px point-at **Använd alla förslag** when `eligibleSuggestedCount ≥ 1`; no auto-apply; text-only when eligible=0 |
| C | **C1** Soft status (unplaced family); Slice 22 one-chrome-layer; saknar under unplaced if both; no tip strip; never blocks place/Golvklart/Stäng |
| D | **D1** Thin Docs — banner + plural + optional CTA/aria; living Hall; no Förråd / place-heuristic |
| E | **E1** Footer `Träningsplaneraren · Slice 25` |
| F | **F1** No auto-apply; no compose from banner; no Slice 26 place-heuristic; no library/CAD/cloud; no republish unless asked; preserve 19+22+23+24 |

## Paths

| Path | Role |
|---|---|
| `slice-25/` | This pack |
| `slice-25/content/` | Docs fills Swedish after lock (placeholder) |
| `app/src/components/HallBoard.tsx` | Edit chrome; banner mount; point-at apply-all |
| `app/src/lib/session.ts` | Reuse `eligibleSuggestedStationEquipmentItems`; add missing-count helper (or `hall.ts`) |
| `app/src/lib/hall.ts` | `placeableItems` / placements — count helpers |
| `app/src/data/blockMeta.ts` | New saknar banner / CTA / aria keys (+ plural helper) |
| `app/src/App.css` | Soft banner styles (family of `.hall-unplaced-banner`) |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | Approved Slice 25 · Slice 26 separate |

## Not this pack

- Netlify / Pages republish unless Christoffer asks.  
- Auto-apply from banner; compose / Redigera redskap from banner.  
- Kom igång place-heuristic (**Slice 26**).  
- Förråd empty soft-path changes (Slice 24).  
- Passbyggaren Redigera redskap; badge; CAD; seed edits; caption change; sync/accounts.  
- Changing Slice 19 eligibility/persist or Slice 22/23/24 chrome.  
- Self-pinging agents — **Planner** pings Verifier only after Builder ships.
