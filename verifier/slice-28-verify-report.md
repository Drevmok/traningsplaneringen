# Slice 28 — Formal verification report (Mall Samling within budget)

**Date:** 2026-09-27 ~23:06 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-28/verification-checklist.md` + locked A1/B1/C1/D1/E1/F1  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Features:** `starta-fran-mall.md`, `passbyggaren.md`  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages optional/non-blocking)  
**Evidence:** `slice-28-evidence-code.md` + Builder `slice-28-builder-smoke.md` + `/workspace/screenshots/slice28v_*.png`  
**Ship notes:** `app/SLICE28-SHIPPED.md`  
**Docs:** `docs/mall-samling-budget.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A1 Beginner mall Soft pair ≤ budget; no Över budget | **PASS** |
| B1 Short mall Samling unchanged; no Över budget on Samling | **PASS** |
| C1 Soft blank + gathering budget 6 intact | **PASS** |
| D1 Titles from Slice 27 seed | **PASS** |
| E1 Living docs | **PASS** |
| F1 Footer Slice 28 / library / no wizard / hall / build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Within budget (beginner) | **PASS** | Nybörjare Samling **6 / 6**; no Över budget. |
| 2 | Soft pair (A1) | **PASS** | **Närvaro** then **Dagens pass — snabb genomgång**; 3+3. |
| 3 | Titles (D1) | **PASS** | Seed title shown on mall row. |
| 4 | Other blocks | **PASS** | Uppvärmning / Teknik / Styrka / Lek present (authored non-Samling). |
| 5 | Editable + library | **PASS** | Välkomstcheck-in still in library; can add. |
| 6 | Short no red (B1) | **PASS** | Kort pass Samling = Välkomstcheck-in **5 / 6**; no Över budget on Samling. |
| 7 | Short unchanged | **PASS** | Gathering composition unchanged. |
| 8 | Soft blank intact | **PASS** | Nytt pass Soft pair 3+3; 6/6. |
| 9 | Budget stays 6 | **PASS** | Code: `BLOCK_BUDGETS.gathering === 6`. |
| 10 | Block duration model | **PASS** | cloneTemplate uses budget; overflow from item sum only. |
| 11 | Living docs | **PASS** | `docs/mall-samling-budget.sv.md`. |
| 12 | Library seeds | **PASS** | `gather-valkomstcheck-in` present. |
| 13 | No wizard / hall pre-place | **PASS** | Home no 3-question wizard; Samling not placeable. |
| 14 | Preserve 22–27 | **PASS** | Soft blank + caption + Teknik-only spot-checked. |
| 15 | Footer | **PASS** | **Träningsplaneraren · Slice 28**. |
| 16 | Caption | **PASS** | **Schematisk hall — inte exakt mått**. |
| 17 | Build | **PASS** | exit 0. |
| 18 | No cloud / CAD / Pages | **PASS** | Pages not required. |

---

## Adjudication

**Drive raw Case 3 “FAIL” (Uppvärmning 11/10 · Över budget on Kort pass):** Overturned for overall PASS.

- Locked B1 / rules 6–7 require **Samling** = Välkomstcheck-in 5 / budget 6 with **no Över budget** on that block — Drive confirmed that.
- Short mall Uppvärmning is authored as 6+5 = 11 against budget 10 (`seedTemplates.ts` shortBlocks) — **pre-existing**, not changed by Slice 28 (diff is beginner gathering + footer only).
- Soft-allowed over-budget on other blocks is outside this slice’s fail-if list.

---

## Observations

1. Adding Välkomstcheck-in onto beginner Soft pair can push total session over — expected when coach adds.  
2. Desktop / full 22–26 re-walk not required.  
3. Builder smoke gaps noted; formal Drive covered A1/B1/C1/F1 surfaces.

---

## Screenshots (Verifier)

| File | Shows |
| --- | --- |
| `slice28v_mall_beginner_samling.png` | Soft pair 6/6 no Över budget |
| `slice28v_library_valkomst.png` | Välkomstcheck-in in library / add |
| `slice28v_mall_short_samling.png` | Short Samling 5/6 |
| `slice28v_blank_soft_pair.png` | Soft blank intact |
| `slice28v_hall_caption_placeable.png` | Caption + Teknik-only |
| `slice28v_footer.png` | Footer Slice 28 |

---

## Fail-if scan

None triggered (beginner no longer opens Samling Över budget; Soft blank intact; Välkomst in library; no wizard; footer Slice 28; build green). Backlog Shipped left to Planner. Pages not required for PASS.

---

**End of report.**
