# Slice 27 — Formal verification report (Soft Samling)

**Date:** 2026-09-26 ~23:50 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-27/verification-checklist.md` + locked A2/B1/C1/D2/E1/F1  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Features:** `passbyggaren.md`, `starta-fran-mall.md`, `home-kom-igang.md` (blast-radius)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages optional/non-blocking)  
**Evidence:** `slice-27-evidence-code.md` + Builder `slice-27-builder-smoke.md` + `/workspace/screenshots/slice27v_*.png`  
**Ship notes:** `app/SLICE27-SHIPPED.md`  
**Docs:** `docs/soft-samling.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A2 Soft pair + pass-rundown framing (same id) | **PASS** |
| B1 Blank inject only; templates keep authored Samling | **PASS** |
| C1 No draft migrate; no mid-edit re-inject | **PASS** |
| D2 Gathering budget 6; soft 3+3 no Över budget | **PASS** |
| E1 EMPTY tip + living Docs | **PASS** |
| F1 Footer Slice 27 / hall untouched / preserve 22–26 / build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Blank prefill | **PASS** | Nytt pass → Samling **Närvaro** then **Dagens pass — snabb genomgång** (`gather-narvaro` / `gather-dagens-teknik`). |
| 2 | Order / duration | **PASS** | 3+3 minutes in that order. |
| 3 | Budget fit (D2) | **PASS** | **6 / 6** without Över budget on blank default. |
| 4 | Editable | **PASS** | Remove + add controls present; library add works. |
| 5 | No hard lock | **PASS** | Soft items removable; add UI present. |
| 6 | Template authorship (B1) | **PASS** | Beginner: Välkomst + Dagens pass (8/6 · Över budget OK); short: Välkomst only — not soft overwrite. |
| 7 | No mid-edit re-inject | **PASS** | Clear both → Docs empty tip; stays empty. |
| 8 | No draft migrate (C1) | **PASS** | Empty-Samling draft Fortsätt/load stays 0/6. |
| 9 | Pass-rundown framing (A2) | **PASS** | Seed title/summary match Docs; Drive shows retitled title. |
| 10 | Living docs | **PASS** | `docs/soft-samling.sv.md` present. |
| 11 | Empty tip | **PASS** | Cleared Samling shows Docs tip + addLabel. |
| 12 | Kom igång | **PASS** | Soft-prefill may auto-check addActivities — no crash; place-step spot OK. |
| 13 | Hall untouched | **PASS** | Soft Samling not placeable; empty Teknik / no-stations. |
| 14 | Library seeds | **PASS** | Välkomstcheck-in addable from library. |
| 15 | Preserve 22–26 | **PASS** | Saknar banner + caption + place-step labels spot-checked. |
| 16 | Footer | **PASS** | **Träningsplaneraren · Slice 27**. |
| 17 | Caption | **PASS** | **Schematisk hall — inte exakt mått** (with Teknik). |
| 18 | Build | **PASS** | exit 0. |
| 19 | No cloud / CAD / Pages | **PASS** | Pages not required for PASS. |

---

## Observations

1. **Beginner mall over budget** expected under B1 (authored 5+3 = 8 against budget 6).  
2. **Same-id retitle:** templates referencing `gather-dagens-teknik` show the new pass-rundown title — expected under A2.  
3. **Desktop / full 22–24 re-walk:** not required; saknar + place-step spots covered.  
4. **Rapid multi-remove:** sequential remove used (pre-existing React stale-closure note from Builder).

---

## Screenshots (Verifier)

| File | Shows |
| --- | --- |
| `slice27v_blank_soft_pair.png` | Soft pair + 6/6 + footer Slice 27 |
| `slice27v_cleared_empty_tip.png` | Empty tip after clear; no refill |
| `slice27v_added_valkomst.png` | Välkomstcheck-in from library |
| `slice27v_mall_beginner.png` | Beginner mall Samling authorship |
| `slice27v_mall_short.png` | Short mall Samling authorship |
| `slice27v_hall_soft_not_placeable.png` | Soft not on hall |
| `slice27v_saknar_preserved.png` | Slice 25 saknar + caption |
| `slice27v_place_step_spot.png` | Slice 26 place-step chrome |
| `slice27v_empty_draft_no_migrate.png` | C1 empty draft stays empty |

---

## Fail-if scan

None triggered. Backlog Shipped left to Planner. Pages not required for PASS.

---

**End of report.**
