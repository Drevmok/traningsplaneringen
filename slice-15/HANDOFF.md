# Slice 15 — handoff

**Status:** Pack **APPROVED 2026-09-25** (Christoffer) — all Planner recommendations A–F are locked.  
**Do not** message Docs / Builder / Verifier / Scout / user from this pack. **Planner** pings agents in order; agents do not self-ping.

## Order (Planner pings — agents do not self-ping)

1. **Docs first** — Polish Swedish microcopy from `slice-15/content/forradslista.sv.md` → **`docs/forradslista.sv.md`**. Respect final locks A–F: both entry points, bottom sheet, library order, print when non-empty, quiet omit unset/`[]`, footer Slice 15. No inventory / custom / CAD / badge / Passbyggaren compose / Kom igång gate / Netlify copy. Caption unchanged. Reuse Slice 13 count/label vocabulary and **Redigera redskap** empty nudge.
2. **Builder** — Implement against APPROVED `decisions.md` + `screen-spec.md` + polished `docs/forradslista.sv.md`. Read-only aggregate only; reuse `stationEquipment` + library helpers; do not block Golvklart; preserve Slice 11–14; footer `Träningsplaneraren · Slice 15` when shipped.
3. **Verifier** — Planner pings Verifier **only after Builder ships**. Use `verification-checklist.md` (with these approved locks).

## Seed path note

Docs will polish `content/forradslista.sv.md` → `docs/forradslista.sv.md`.

## Locked answers (quick)

| # | Locked answer |
|---|---|
| A | Entry: **both** edit + Golvklart |
| B | UI: **bottom sheet** (read-only) |
| C | Sort: **library order** |
| D | Print: **include** when non-empty |
| E | Unset/`[]`: **omit** (quiet); no förslag |
| F | Footer: **Träningsplaneraren · Slice 15** |

## Not this pack

- **Kom igång** discover Redigera redskap (Approved idea 2) — later slice.
