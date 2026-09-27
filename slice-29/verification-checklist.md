# Slice 29 — verification checklist (DRAFT · recommended A–F)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **DRAFT** — Verifier runs only after Christoffer APPROVED A–F + Docs + Builder ship + Planner ping.  
**Skill:** `verify-traningsplaneraren/` + project skill `verify-traningsplaneraren/`; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Recommended choices (awaiting lock):** **A1 / B1 / C1 / D1 / E1 / F1**.

## Rules (recommended → locked after approval)

### Home wizard entry (A1 / B1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Primary CTA | Home shows wizard as **primary** card (Planera/Skapa pass or locked label); opens 3-question flow |
| 2 | Q1 options (B1) | Ålder/nivå offers **4–6 år · 7–9 år · Nybörjare · Träning** (or locked set) |
| 3 | Q2 options (B1) | Fokus offers **Satsbräda · Trampett · Tumbling · Blandat** (or locked set) |
| 4 | Q3 presets | Hallayout offers **Standard trupp · Tävling / linjer · Liten hall** |
| 5 | Secondary escapes (E1) | **Nytt pass** + **Starta från mall** still reachable from Home |

### Complete pass (C1)

| # | Rule | Pass if |
|---|---|---|
| 6 | Five blocks filled | After finish, Samling / Uppvärmning / Teknik / Styrka / Lek each have ≥1 item |
| 7 | Soft Samling | Wizard Samling = Närvaro + Dagens pass (3+3) or locked Soft-consistent pair; **no** Över budget on Samling default |
| 8 | Budgets on defaults | Wizard default paths: **no** Över budget on gathering or warmup (warmup ≤10; do not ship 11/10) |
| 9 | Fokus swaps Teknik | Satsbräda vs Trampett vs Tumbling vs Blandat produce distinct Teknik sets (or clearly focus-matched) |
| 10 | Editable | Coach can edit any block after land; draft saves device-local |

### Hall pre-place (D1)

| # | Rule | Pass if |
|---|---|---|
| 11 | Preset applied | `hallTemplateId` matches Q3 choice |
| 12 | Teknik placed | All (or locked “all”) Teknik items have hall placements after finish |
| 13 | Zone match | Focus Satsbräda → ≥1 placement in vault zone; Trampett → trampett zone; etc. per locked map |
| 14 | Teknik-only | No Samling/warmup/styrka/lek chips on hall |
| 15 | Editable placements | Move/remove/re-place still works; preset switch remaps |

### Escapes / preserve (E1 / F1)

| # | Rule | Pass if |
|---|---|---|
| 16 | Soft blank | Nytt pass still Soft pair 3+3; empty placements; budget 6 |
| 17 | Old malls | Starta från mall → Nybörjare Soft pair ≤6; Kort Samling 5/6 (Slice 28) |
| 18 | No full matrix required | Ship has curated paths — not 16 separate age×focus templates unless C2 locked |
| 19 | Preserve 22–28 | Quiet chrome, Home polish, Förråd, saknar, place-step, Soft Samling, mall budget still behave |
| 20 | Footer | `Träningsplaneraren · Slice 29` when shipped |
| 21 | Caption | Schematisk hall — inte exakt mått unchanged |
| 22 | Build | `npm run build` green in `app/` |
| 23 | No cloud / CAD / Pages | No accounts/sync/CAD; no republish required for PASS |

## Smoke path

1. Home → primary **Planera pass** → pick 7–9 → Trampett → Standard trupp → Skapa pass.  
2. Passbyggaren: five blocks filled; Samling 6/6; no warmup Över budget.  
3. Hallöversikt: trampett zone has Teknik chip(s); Samling not in tray as placeable.  
4. Home → Nytt pass: Soft blank intact.  
5. Home → Starta från mall → Nybörjare: Slice 28 Samling OK.  
6. Repeat wizard once for Satsbräda; confirm vault zone chip.  
7. Footer Slice 29; build green.

## Fail if

- Wizard missing or blank Nytt pass still the only primary with no 3Q flow.  
- Finish yields empty Teknik or empty non-Samling blocks.  
- Default wizard path opens with Samling or Uppvärmning **Över budget**.  
- Non-Teknik items placed on hall.  
- Soft blank or Slice 28 malls regress.  
- Full-matrix scope creep without C2 lock.  
- Footer not Slice 29; build red.  
- Verifier run before APPROVED + Docs + Builder ship + Planner ping.
