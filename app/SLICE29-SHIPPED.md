# Slice 29 — Home 3-question wizard — SHIPPED

**Date:** 2026-09-27 (Europe/Stockholm)  
**Locks:** A1 / B1 / C1 / D1 / E1 / F1 (APPROVED 2026-09-27)  
**Builder self-smoke:** `verifier/slice-29-builder-smoke.md` — **PASS** (26/0)  
**Screenshots:** `/workspace/screenshots/slice29_*.png`  
**Docs authority:** `docs/home-wizard.sv.md`

## What shipped

Home 3-question wizard as primary start path → complete five-block pass with Teknik pre-placed:

1. **A1** — Primary CTA **Planera pass**; **Nytt pass** + **Starta från mall** demoted to secondary (quieter descs); Fortsätt + Slice 23 Hall/Golvklart unchanged; `homeInvite` Docs string.
2. **B1** — Q1: 4–6 år · 7–9 år · Nybörjare · Träning; Q2: Satsbräda · Trampett · Tumbling · Blandat; Q3: Standard trupp · Tävling / linjer · Liten hall.
3. **C1** — Curated focus paths (+ age46 volt drop) in `wizardPaths.ts`; Soft Samling 3+3; warmup `warm-hall-varv` 10 (not short-mall 11); Teknik 6+6+6; strength 5+8; fun 6.
4. **D1** — Finish sets `hallTemplateId` + places Teknik via tag→zone map (`mapActivityToZone` + `upsertPlacement`); Samling never placed.
5. **E1** — `goNew` / `goTemplate` / Soft blank / `cloneTemplate` unchanged; cancel discards answers (no draft write until Skapa pass).
6. **F1** — Footer `Träningsplaneraren · Slice 29`; no full matrix / Använd-alla-on-finish / Pages; preserve 22–28.

## Changed files

| File | Change |
| --- | --- |
| `app/src/data/wizardPaths.ts` | **new** — curated path table + age46 tweak + title labels |
| `app/src/lib/wizard.ts` | **new** — `composeWizardSession` + `mapActivityToZone` |
| `app/src/components/HomeWizard.tsx` | **new** — quiet 3-step overlay |
| `app/src/components/Home.tsx` | Primary Planera pass; secondary escapes; wizard open/finish |
| `app/src/App.tsx` | `goWizardFinish` → compose → setSession → saveDraft → builder |
| `app/src/data/blockMeta.ts` | Docs UI keys + footer Slice 29 + homeInvite |
| `app/src/App.css` | Quiet wizard chip/overlay styles |

**Unchanged (intentional):** `createBlankSession` Soft inject, `cloneTemplate`, `BLOCK_BUDGETS`, mall gathering, Välkomstcheck-in in library.

## Build

`cd app && npm run build` — **green** (tsc -b && vite build).

## Self-smoke (required cases)

| # | Case | Result |
| --- | --- | --- |
| 1 | Home primary Planera pass; Q1–Q3 labels; Skapa pass | PASS |
| 2 | 7–9 → Trampett → Standard trupp → five blocks; Samling 6/6; warmup 10/10; title Pass — trampett | PASS |
| 3 | Hallöversikt: ≥1 trampett-zone chip; Samling not placeable; caption Schematisk hall — inte exakt mått | PASS |
| 4 | Second wizard Satsbräda → vault-zone chip | PASS |
| 5 | Escape Nytt pass Soft 6/6 empty hall | PASS |
| 6 | Escape Starta från mall → Nybörjare Soft ≤6 | PASS |
| 7 | Footer Slice 29; cancel does not overwrite draft | PASS |

## Confirmations (Architect)

- Trampett path places trampett-zone chips (2× trampett + 1× open for falla-bakat-hojd) — **yes**
- Samling 6/6 no Över — **yes**
- Warmup not over budget (10/10) — **yes**

## Deviations vs A1–F1

None. Paths match Architect sketch (shared skeleton + Teknik-by-focus + age46 volt drop). Teknik durations forced to 6 each (seed defaults for volt/flickis are 9; budget-safe override per sketch).

## Gaps

- Full age×focus matrix deferred (C1/F1)
- Auto Använd alla förslag on finish deferred (F1)
- Short-mall warmup 11/10 left alone
- Pages not republished
- Preserve spot-checks for 22–26 chrome/Förråd/saknar/place-step not fully re-walked in this smoke
