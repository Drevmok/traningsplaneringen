# Slice 24 — handoff

**Status:** Pack **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked. Docs may start; Builder after Docs; Verifier only after Planner ping.

Backlog: Förråd tom → peka på Använd alla förslag (Scout #3 Approved → this pack **In flight** drafting). Scout Proposed saknar / place-heuristic stay Proposed. Preserve Slice 19 apply-all + Slice 22 quiet chrome + Slice 23 Home polish.

## Order (after APPROVED)

1. **Christoffer locks A–F** — recommended A1/B1/C1/D1/E1/F1 (or alternate letters).  
2. **Docs** — Finalize Swedish soft empty copy + CTA label (+ aria); update living `docs/forradslista.sv.md`; cross-ref apply-all docs if needed. Start from pack [`content/`](./content/) placeholder. No saknar copy. No new tip strip. No Home/phone rewrite. No republish.  
3. **Builder** — After Docs strings (or parallel only if Planner says): implement locked A1/B1/C1; pass eligibility into `ForradslistaSheet`; close → edit → point (no auto-apply); footer `Träningsplaneraren · Slice 24`; preserve 11–23 except this Förråd empty soft path. **Self-smoke** via `verify-traningsplaneraren/` before claiming shipped (`backlog/PSTACK-OPS.md`).  
4. **Verifier** — **Planner pings only** after Builder ships. Use [`verification-checklist.md`](./verification-checklist.md) as authority + project skill `verify-traningsplaneraren/`.

## Recommended answers (awaiting Christoffer)

| # | Rec |
|---|---|
| A | **A1** Soft empty CTA only when `rows.length === 0` AND `eligibleSuggestedCount ≥ 1`; else today’s hint |
| B | **B1** Close Förråd → Hall edit → focus/scroll/highlight **Använd alla förslag** (or brief toast); no auto-apply |
| C | **C1** Soft secondary text + ≥44px button; Docs Swedish; no tip strip; no saknar; brief toast OK under Slice 22 |
| D | **D1** Thin Docs — soft copy + CTA (+ aria); living Förråd; no Home/phone |
| E | **E1** Footer `Träningsplaneraren · Slice 24` |
| F | **F1** No compose from Förråd; no auto-persist; no saknar / place-heuristic / station-breakdown; no library/CAD/cloud; no republish unless asked; preserve 19+22+23 |

## Paths

| Path | Role |
|---|---|
| `slice-24/` | This pack |
| `slice-24/content/` | Docs fills Swedish after lock (placeholder) |
| `docs/forradslista.sv.md` | Living Förråd empty-state copy |
| `docs/anvand-alla-forslag.sv.md` | Living Slice 19 apply-all (cross-ref only) |
| `app/src/components/ForradslistaSheet.tsx` | Empty state; receive eligibility + soft CTA |
| `app/src/components/HallBoard.tsx` | `eligibleSuggestedCount`; open sheet; B1 close→edit→point |
| `app/src/lib/session.ts` | `eligibleSuggestedStationEquipmentItems` (reuse; do not change) |
| `app/src/data/blockMeta.ts` | New soft empty / CTA / aria keys |
| `app/src/App.css` | Soft empty + optional highlight styles |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | In flight Slice 24 · Proposed leftovers |

## Not this pack

- Netlify / Pages republish unless Christoffer asks.  
- Auto-apply from Förråd; compose / Redigera redskap from Förråd.  
- Saknar-redskap banner; Kom igång place-heuristic (stay Proposed).  
- Parked Förråd station-breakdown.  
- Passbyggaren Redigera redskap; badge; CAD; seed edits; caption change; sync/accounts.  
- Changing Slice 19 eligibility/persist or Slice 22/23 chrome.  
- Self-pinging agents — **Planner** pings in order **after APPROVED** only.
