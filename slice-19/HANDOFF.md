# Slice 19 — handoff

**Status:** Pack **APPROVED 2026-09-25** — Christoffer approved via Planner lock widget; A–F are locked. **Docs may start now.**  
Planner coordinates the Docs → Builder → Verifier sequence; do not start Builder or Verifier before their handoff gates.

Backlog idea **Hall — Använd alla förslag** is **In flight** (Slice 19) in `backlog/IMPROVEMENTS.md`.

## Order (APPROVED handoff sequence)

1. **Docs may start now** — Exact Swedish for CTA label (**Använd alla förslag** recommended), result string (“Sparade redskap på N stationer”), optional disabled/empty + N=0 soft message. Prefer thin update to **`docs/hall-oversikt-copy.sv.md`** (or thin new docs file). Optional one-sentence cross-link in `docs/station-compose.sv.md`. Caption unchanged. No new required tip for PASS. No Netlify / accounts / badge / CAD / Passbyggaren compose.
2. **Builder** — After Docs strings exist (**or parallel only if Planner says**): Hallöversikt **edit** secondary CTA; eligibility + bulk apply via `updateItemStationEquipment`; result toast/banner; footer `Träningsplaneraren · Slice 19`. Preserve Slice 11–18. No seed-table edits; no auto-apply on place; no Passbyggaren compose; no badge/CAD; no Netlify.
3. **Verifier** — Planner pings Verifier **only after Builder ships** the APPROVED pack. Use `verification-checklist.md`.

## Locked answers (quick)

| # | Lock |
|---|---|
| A | Edit chrome secondary CTA near hall actions |
| B | Immediate apply + “Sparade redskap på N stationer”; no confirm |
| C | Placed Teknik + unset + non-empty seed; skip saved and `[]` |
| D | Thin Docs in hall-oversikt-copy.sv.md; no required tip |
| E | Footer `Träningsplaneraren · Slice 19` |
| F | No auto-apply; no promote without CTA/Klar/Använd förslag; no Passbyggaren compose; no badge/CAD; no library growth; no Netlify; caption Schematisk hall — inte exakt mått unchanged; preserve 11–18 |

## Not this pack

- Netlify republish (unless Christoffer asks).  
- Editing Slice 18 seed arrays.  
- Auto-apply on place; Passbyggaren compose; badge/CAD; library growth.  
- Self-pinging Docs / Builder / Verifier — **Planner** pings agents in order.
