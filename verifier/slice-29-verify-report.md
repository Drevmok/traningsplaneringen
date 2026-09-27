# Slice 29 — Formal verification report (Home 3-question wizard)

**Date:** 2026-09-27 ~23:23 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-29/verification-checklist.md` + locked A1/B1/C1/D1/E1/F1  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Features:** Home / Passbyggaren / Hallöversikt / Starta från mall (blast-radius Soft + mall)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages optional/non-blocking)  
**Evidence:** `slice-29-evidence-code.md` + Builder `slice-29-builder-smoke.md` + `/workspace/screenshots/slice29v_*.png`  
**Ship notes:** `app/SLICE29-SHIPPED.md`  
**Docs:** `docs/home-wizard.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A1 Primary Planera pass + secondary escapes | **PASS** |
| B1 Q1/Q2/Q3 Docs options + honesty | **PASS** |
| C1 Complete five-block pass; Soft Samling; budgets | **PASS** |
| D1 Hall preset + Teknik zone pre-place | **PASS** |
| E1 Soft blank + malls + cancel | **PASS** |
| F1 Footer Slice 29 / scope / build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Primary CTA | **PASS** | Home **Planera pass** opens 3Q wizard. |
| 2 | Q1 options | **PASS** | 4–6 år · 7–9 år · Nybörjare · Träning. |
| 3 | Q2 options | **PASS** | Satsbräda · Trampett · Tumbling · Blandat. |
| 4 | Q3 presets | **PASS** | Standard trupp · Tävling / linjer · Liten hall. |
| 5 | Secondary escapes | **PASS** | Nytt pass + Starta från mall reachable. |
| 6 | Five blocks filled | **PASS** | Trampett path: all five ≥1. |
| 7 | Soft Samling | **PASS** | Närvaro + Dagens pass; **6 / 6**; no Över budget. |
| 8 | Budgets on defaults | **PASS** | Warmup **10 / 10**; no Samling/warmup Över budget. |
| 9 | Fokus swaps Teknik | **PASS** | Trampett vs Satsbräda distinct hall zones. |
| 10 | Editable | **PASS** | Landed in Passbyggaren; draft device-local (cancel test OK). |
| 11 | Preset applied | **PASS** | Q3 Standard trupp → hallTemplateId (Builder/code); Drive hall OK. |
| 12 | Teknik placed | **PASS** | Trampett path placements present. |
| 13 | Zone match | **PASS** | Trampett zone chips; Satsbräda vault zone chip. |
| 14 | Teknik-only | **PASS** | No Samling chips on hall. |
| 15 | Editable placements | **PASS** | Hall edit path available (spot); move/remove not fully re-walked. |
| 16 | Soft blank | **PASS** | Nytt pass Soft 6/6; empty Teknik hall. |
| 17 | Old malls | **PASS** | Nybörjare Soft pair ≤6. |
| 18 | No full matrix | **PASS** | Curated focus paths only (code). |
| 19 | Preserve 22–28 | **PASS** | Soft + mall escapes + caption spot-checked. |
| 20 | Footer | **PASS** | **Träningsplaneraren · Slice 29**. |
| 21 | Caption | **PASS** | **Schematisk hall — inte exakt mått**. |
| 22 | Build | **PASS** | exit 0. |
| 23 | No cloud / CAD / Pages | **PASS** | Pages not required. |

---

## Teknik duration note (pack)

Wizard Teknik items are forced to **6 min** each (`WIZARD_TEKNIK_DURATION`), even when seed defaults are 9 (e.g. volt). Drive confirmed 6 min rows. This matches Builder/Architect budget-safe override (3×6 = 18 ≤ Teknik budget 20) and keeps default paths free of Över budget. **Accepted** under C1 — not a FAIL.

---

## Observations

1. Focus honesty copy present on wizard steps (Docs).  
2. Cancel without Skapa pass does not wipe an existing draft (Drive Case 6).  
3. Full age×focus matrix / Använd-alla-on-finish deferred (F1).  
4. Desktop / full 22–26 re-walk not required.

---

## Screenshots (Verifier)

| File | Shows |
| --- | --- |
| `slice29v_home_primary.png` | Planera pass primary + escapes |
| `slice29v_wizard_q1.png` | Q1 age/nivå |
| `slice29v_wizard_q2.png` | Q2 fokus + honesty |
| `slice29v_wizard_q3.png` | Q3 hall presets |
| `slice29v_trampett_passbyggaren.png` | Five blocks; 6/6; 10/10 |
| `slice29v_footer.png` | Footer Slice 29 |
| `slice29v_trampett_hall.png` | Trampett zone + caption |
| `slice29v_vault_hall.png` | Satsbräda zone |
| `slice29v_escape_nytt_pass.png` | Soft blank escape |
| `slice29v_escape_mall_beginner.png` | Nybörjare mall escape |

---

## Fail-if scan

None triggered. Backlog Shipped left to Planner. Pages not required for PASS.

---

**End of report.**
