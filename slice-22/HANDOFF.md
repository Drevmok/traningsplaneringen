# Slice 22 — handoff

**Status:** Pack **APPROVED 2026-09-26** — Docs done · Builder shipped · **Verifier in flight** (Planner pinged).

Backlog: Copy quieter / feature-first chrome (progressive Hall hints · quieter Kom igång · one chrome layer). Scout Proposed #1–#2 stay Proposed.

## Order (APPROVED handoff sequence)

1. **Christoffer locked A–F** — done (recommended set).  
2. **Docs** — Finalize Swedish for Hall info control + Kom igång expand/collapse (+ aria). Start from pack draft [`content/copy-quieter-chrome.sv.md`](./content/copy-quieter-chrome.sv.md); update living `docs/hall-declutter.sv.md`, `docs/coach-tips.sv.md`, `docs/kom-igang-redskap.sv.md` (and phone-chrome note only if needed). No saknar-redskap copy. No new required tip. No republish.  
3. **Builder** — After Docs strings (or parallel only if Planner says): implement locked A1/B1/C1; footer `Träningsplaneraren · Slice 22`; preserve 11–21 except quiet rules. **Self-smoke** via `verify-traningsplaneraren/` before claiming shipped (`backlog/PSTACK-OPS.md`).  
4. **Verifier** — **Planner pings only** after Builder ships. Use [`verification-checklist.md`](./verification-checklist.md) as authority + project skill `verify-traningsplaneraren/`.

## Locked answers (Christoffer 2026-09-26)

| # | Rec |
|---|---|
| A | **A1** Progressive Hall hints — durable compact after first Teknik place; info ≥44px reveals full hints |
| B | **B1** Quieter Kom igång — collapsed default once progress > 0 or previously collapsed; 0/n stays expanded |
| C | **C1** One chrome layer — tip strip OR status banner OR multi-line hints; tip suppresses hints; banner suppresses tip on Golvklart |
| D | **D1** Thin Docs — info + collapse/expand Swedish (+ aria); living-doc updates; no saknar copy |
| E | **E1** Footer `Träningsplaneraren · Slice 22` |
| F | **F1** Preserve 11–21 except quiet rules; no saknar / place-heuristic; no pinch/pan/tray-collapse regressions; no republish unless asked |

## Paths

| Path | Role |
|---|---|
| `slice-22/` | This pack |
| `slice-22/content/copy-quieter-chrome.sv.md` | Draft Swedish for Docs |
| `docs/hall-declutter.sv.md` | Living hall hint copy |
| `docs/coach-tips.sv.md` | Living tips / Kom igång |
| `docs/kom-igang-redskap.sv.md` | Living Kom igång Slice 16 companion |
| `app/src/components/HallBoard.tsx` | Hint stack + tip strips |
| `app/src/components/KomIgangCard.tsx` | Checklist card |
| `app/src/components/CoachTipStrip.tsx` | Tip strip |
| `app/src/lib/coachTips.ts` | Tips persistence (extend for compact/collapse flags) |
| `app/src/data/blockMeta.ts` | Hint + Kom igång + new strings |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | In flight / Proposed |

## Not this pack

- Netlify / Pages republish unless Christoffer asks.  
- Saknar-redskap banner; Kom igång place-heuristic (stay Proposed).  
- Passbyggaren Redigera redskap; badge; CAD; seed edits; caption change.  
- Changing Slice 21 pinch / pan / tray-collapse except hint visibility under A1/C1.  
- Self-pinging agents — **Planner** pings in order **after APPROVED** only.
