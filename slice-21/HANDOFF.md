# Slice 21 — handoff

**Status:** Pack **APPROVED 2026-09-26** — Docs done · Builder shipped · Pages live · **Verifier PASS 2026-09-26** · **Shipped**.

Backlog: Hallöversikt phone usability (pinch + canvas chrome + pan) → Slice 21. Scout Proposed #3 (pinch-zoom) absorbed; Proposed #1–#2 stay Proposed.

## Order (APPROVED handoff sequence)

1. **Christoffer locked A–F** — done (recommended set).  
2. **Docs** — Finalize Swedish for tray collapse/expand (+ aria). Start from pack draft [`content/hall-phone-chrome.sv.md`](./content/hall-phone-chrome.sv.md); update living `docs/` (e.g. `hall-oversikt-copy.sv.md` / `ui-chrome.sv.md`). No new required Kom igång tip. No republish.  
3. **Builder** — After Docs strings (or parallel only if Planner says): implement locked A1/B1/C1; footer `Träningsplaneraren · Slice 21`; preserve 11–20. **Self-smoke** via `verify-traningsplaneraren/` Drive for hall / Golvklart features before claiming shipped (`backlog/PSTACK-OPS.md`).  
4. **Verifier** — **Planner pings only** after Builder ships. Use [`verification-checklist.md`](./verification-checklist.md) as authority + project skill `verify-traningsplaneraren/`.

## Locked answers (Christoffer 2026-09-26)

| # | Rec |
|---|---|
| A | **A1** Pinch-to-zoom beside +/−; same clamp; view-only; phone required |
| B | **B1** Collapsible sticky tray; collapsed default; compact bar + expand ≥44px |
| C | **C1** One-finger pan empty when zoomed; marker drag; pinch=zoom; pan≠detail |
| D | **D1** Thin Docs (tray collapse/expand + aria); no new tip |
| E | **E1** Footer `Träningsplaneraren · Slice 21` |
| F | **F1** No CAD/pins/badge; no Passbyggaren compose; no library growth; no saknar banner; no Kom igång heuristic; caption unchanged; preserve 11–20; no republish unless asked |

## Paths

| Path | Role |
|---|---|
| `slice-21/` | This pack |
| `slice-21/content/hall-phone-chrome.sv.md` | Draft Swedish for Docs |
| `docs/` | Living Docs after APPROVED |
| `app/src/components/HallBoard.tsx` | Zoom + tray reserved |
| `app/src/components/HallCanvas.tsx` | `hall-canvas-zoom` |
| `app/src/App.css` | Sticky tray, touch-action, reserved padding |
| `app/src/data/blockMeta.ts` | `hallZoom*` + new tray strings |
| `verify-traningsplaneraren/` | Verifier skill + hall feature maps |
| `backlog/PSTACK-OPS.md` | Slice 21+ rigor |
| `backlog/IMPROVEMENTS.md` | In flight / Proposed |

## Not this pack

- Netlify / Pages republish unless Christoffer asks.  
- Saknar-redskap banner; Kom igång place-heuristic (stay Proposed).  
- Passbyggaren Redigera redskap; badge; CAD; seed edits; remove +/−.  
- Self-pinging agents — **Planner** pings in order after APPROVED.
