# Slice 23 — handoff

**Status:** Pack **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked. Docs may start; Builder after Docs; Verifier only after Planner ping.

Backlog: Home polish (Hallöversikt / Golvklart when draft + Öppna på telefon). Scout Proposed saknar / place-heuristic stay Proposed. Förråd empty CTA Approved → **Slice 24** (queued; no pack yet).

## Order (after APPROVED)

1. **Christoffer locks A–F** — **DONE** (A1/B1/C1/D1/E1/F1).  
2. **Docs** — Finalize Swedish for Home Hallöversikt / Golvklart CTAs (+ aria); confirm Öppna-på-telefon + live URL presentation; update living `docs/distribution-copy.sv.md` (+ ui-chrome/Home as needed). Start from pack [`content/`](./content/) placeholder / key list. No Förråd empty copy. No saknar copy. No new tip strip. No republish.  
3. **Builder** — After Docs strings (or parallel only if Planner says): implement locked A1/B1/C1; footer `Träningsplaneraren · Slice 23`; preserve 11–22 except this Home chrome. **Self-smoke** via `verify-traningsplaneraren/` before claiming shipped (`backlog/PSTACK-OPS.md`).  
4. **Verifier** — **Planner pings only** after Builder ships. Use [`verification-checklist.md`](./verification-checklist.md) as authority + project skill `verify-traningsplaneraren/`.

## Locked answers (Christoffer 2026-09-26)

| # | Rec |
|---|---|
| A | **A1** Two secondary Home actions when draft — Hallöversikt + Golvklart; hide when no draft; reuse open + flash |
| B | **B1** Always show Öppna på telefon near honesty; live Pages URL text + link; keep honesty |
| C | **C1** Secondary in home-actions; phone with honesty; no Kom igång expand; no tip strips |
| D | **D1** Thin Docs — CTA labels (+ aria) + URL; living distribution/Home; no new tip |
| E | **E1** Footer `Träningsplaneraren · Slice 23` |
| F | **F1** No Förråd empty (Slice 24); no saknar / place-heuristic; no compose/library/CAD/caption/cloud; no republish unless asked; preserve Slice 22 quiet chrome |

## Paths

| Path | Role |
|---|---|
| `slice-23/` | This pack |
| `slice-23/content/` | Docs fills Swedish after lock (key list placeholder) |
| `docs/distribution-copy.sv.md` | Living Öppna-på-telefon + honesty |
| `docs/ui-chrome.sv.md` | Home chrome labels |
| `app/src/components/Home.tsx` | Primary cards + honesty; add secondary + phone block |
| `app/src/App.tsx` | `openHallFromHome` / `openGolvklartFromHome` (reuse) |
| `app/src/data/blockMeta.ts` | `oppnaPaTelefon*` + new Home CTA / aria keys |
| `app/src/App.css` | Secondary home-actions + phone block styles |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | In flight Slice 23 · Approved Slice 24 · Proposed leftovers |

## Not this pack

- Netlify / Pages republish unless Christoffer asks.  
- Förråd empty → Använd alla förslag (**Slice 24**).  
- Saknar-redskap banner; Kom igång place-heuristic (stay Proposed).  
- Passbyggaren Redigera redskap; badge; CAD; seed edits; caption change; sync/accounts.  
- Expanding Kom igång or adding tip strips to replace hall entry.  
- Self-pinging agents — **Planner** pings in order **after APPROVED** only.  
- Drafting `slice-24/` yet.
