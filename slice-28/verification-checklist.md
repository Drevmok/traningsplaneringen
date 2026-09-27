# Slice 28 — verification checklist (DRAFT · recommended A–F)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **DRAFT** — Verifier runs only after Christoffer APPROVED A–F + Docs + Builder ship + Planner ping.  
**Skill:** `verify-traningsplaneraren/` + project skill `verify-traningsplaneraren/`; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Recommended choices (awaiting lock):** **A1 / B1 / C1 / D1 / E1 / F1**.

## Rules (recommended → locked after approval)

### Beginner mall Samling (A1 / C1 / D1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Within budget | Home → Starta från mall → **Nybörjare** → Använd mall → Samling filled **≤ 6** with budget **6**; **no** Över budget on default |
| 2 | Soft pair (if A1) | Gathering items = **Närvaro** (`gather-narvaro`) then **Dagens pass** (`gather-dagens-teknik`); durations 3+3 |
| 3 | Titles (D1) | Genomgång row shows Slice 27 title **Dagens pass — snabb genomgång** (from seed) |
| 4 | Other blocks | Warmup / Teknik / Styrka / Lek for beginner mall still match authored non-Samling items |
| 5 | Editable | Coach can remove/reorder/change duration/add — including re-add Välkomstcheck-in from library |

### Short mall (B1)

| # | Rule | Pass if |
|---|---|---|
| 6 | No red (B1) | Apply **Kort pass** → Samling = Välkomstcheck-in **5** / budget **6**; **no** Över budget |
| 7 | Unchanged if B1 | Short gathering composition unchanged from pre-Slice-28 unless B2/B3 locked |

### Soft blank / budget model (C1 / preserve 27)

| # | Rule | Pass if |
|---|---|---|
| 8 | Soft blank intact | **Nytt pass** still Soft pair 3+3; 6/6; editable; no mid-edit re-inject |
| 9 | Budget stays 6 | `BLOCK_BUDGETS.gathering` remains **6** (not lowered) |
| 10 | Block duration | After cloneTemplate, gathering `durationMinutes` equals budget 6; overflow driven by **item sum** only |

### Docs / library / scope (E1 / F1)

| # | Rule | Pass if |
|---|---|---|
| 11 | Living docs | `docs/mall-samling-budget.sv.md` exists (or pack content mirrored) describing mall math + Soft alignment |
| 12 | Library seeds | `gather-valkomstcheck-in` still in seed library (not deleted) |
| 13 | No wizard / hall pre-place | Home has no 3-question wizard; mall apply does **not** auto-place Teknik |
| 14 | Preserve 22–27 | Soft Samling, quiet chrome, Home polish, Förråd path, saknar banner, place-step placement-only still behave |
| 15 | Footer | `Träningsplaneraren · Slice 28` when shipped |
| 16 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 17 | Build | `npm run build` green in `app/` |
| 18 | No cloud / CAD / Pages | No accounts/sync/CAD; no republish required for PASS |

## Passbyggaren smoke

1. **Nybörjare mall:** Samling ≤ budget; Soft pair if A1; no Över budget; other blocks look right.  
2. **Kort pass mall:** No Över budget (B1: 5/6).  
3. **Nytt pass:** Soft Samling still 6/6 (Slice 27).  
4. **Library:** Add Välkomstcheck-in onto A1 mall Samling — works.  
5. **Hall:** Samling items never placeable; Teknik-only unchanged.  
6. **Regression:** Footer Slice 28; Slice 26 place-step; Slice 25 saknar; Slice 24 Förråd; build green.

## Fail if

- Beginner mall Samling still opens with Över budget on default items.  
- Soft blank Samling regresses (empty, wrong pair, or budget back to 5).  
- Välkomstcheck-in removed from seed library.  
- Home wizard or hall auto-place shipped in this slice.  
- Footer not Slice 28; build red.  
- Verifier run before APPROVED + Docs + Builder ship + Planner ping.
