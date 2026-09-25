# Slice 18 — handoff

**Status:** Pack **APPROVED 2026-09-25** — Christoffer approved via Planner lock widget; A–F are locked. **Docs may start now.**  
Planner coordinates the Docs → Builder → Verifier sequence; do not start Builder or Verifier before their handoff gates.

## Order (APPROVED handoff sequence)

1. **Docs may start now** — Polish `content/redskap-forslag-seeds.sv.md` → update **`docs/station-compose.sv.md`** (table of drills that ship förslag; keep Använd förslag / unset vs `[]` copy). Optional thin `docs/redskap-forslag.sv.md` only if Docs prefers a dedicated page. Caption unchanged. No Netlify / accounts / badge / CAD / Passbyggaren compose.
2. **Builder** — Extend `defaultStationEquipment` in `seedActivities.ts` for locked drills only; keep existing four arrays unchanged; footer `Träningsplaneraren · Slice 18`. Prefer **no** UI chrome redesign. Preserve Slice 11–17.
3. **Verifier** — Planner pings Verifier **only after Builder ships**. Use `verification-checklist.md`.

## Locked answers (quick)

| # | Lock |
|---|---|
| A | Seed all five remaining Teknik (see locked table in `decisions.md`) |
| B | No UX change to Använd förslag / unset vs `[]` / Klar |
| C | Golvklart / Förrådslista / print still omit unset förslag |
| D | Thin Docs update to station-compose.sv.md; no required tip |
| E | Footer Slice 18 |
| F | No library growth; no Passbyggaren compose; no badge/CAD; no auto-apply; no Netlify; caption unchanged |

## Not this pack

- Netlify republish (unless Christoffer asks).  
- Editing the four existing vault/trampett/mattberg seed arrays.  
- Promoting förslag onto floor/print/aggregate before Klar / Använd förslag.
