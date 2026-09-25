# Slice 16 — Formal verification report (Kom igång redskap discoverability)

**Date:** 2026-09-25 ~12:20 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-16/verification-checklist.md` (APPROVED)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/` (local; Netlify optional/non-blocking)  
**Evidence:** `slice-16-evidence-code.md` + `/workspace/screenshots/slice16_*.png`  
**Ship notes:** `app/SLICE16-SHIPPED.md`  
**Docs copy:** `docs/kom-igang-redskap.sv.md` + `docs/coach-tips.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Step shape (A) — 5 soft steps / Fem / Ange redskap | **PASS** |
| Auto-progress (B) — non-empty saved `stationEquipment` | **PASS** |
| Tip strip (C) — `tipStationCompose` as-is | **PASS** |
| Soft only (D) — Golvklart never blocked by compose | **PASS** |
| Footer (E) Slice 16 / Visuals (F) no Home redesign | **PASS** |
| Slice 11–15 intact / caption / phone / scope | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Discoverability | **PASS** | Home Kom igång teaches redskap via step 4 + hint → markör → **Redigera redskap**. |
| 2 | Path | **PASS** | Compose step CTA `openHall`; no Passbyggaren compose entry. UI: tap compose → Hallöversikt. |
| 3 | Step shape (A) | **PASS** | UI: `0 av 5`, intro **Fem korta steg…**, fifth step **Ange redskap på Teknik-stationerna** between place and Golvklart. Code: `CHECKLIST_TOTAL = 5`. |
| 4 | Auto-progress (B) | **PASS** | Code predicate on non-empty saved `item.stationEquipment` only (not förslag/`[]`/unset). UI: after Klar with ≥1 piece, compose progressed; place alone left compose unchecked at 3 av 5. |
| 5 | Tip strip (C) | **PASS** | Exact Slice 13 wording captured in UI: *Redigera redskapen ni faktiskt använder…* |
| 6 | Soft only (D) | **PASS** | Golvklart opened successfully with compose unchecked; no hard gate copy. |
| 7 | Home-only | **PASS** | No mandatory new hall/Golvklart compose chrome beyond existing tip. |
| 8 | Teknik-only | **PASS** | `hall.ts` filter/prune unchanged (code evidence). |
| 9 | Slice 12–15 intact | **PASS** | Markers / Redigera redskap detail-only / under-markör / Förrådslista present in smoke + static. |
| 10 | Caption | **PASS** | **Schematisk hall — inte exakt mått** on hall canvas. |
| 11 | Phone ~390px | **PASS** | Home Kom igång readable/tappable at phone width. |
| 12 | Scope | **PASS** | No Netlify requirement; ideas 1 & 3 out of ship. |
| 13 | Footer (E) | **PASS** | **Träningsplaneraren · Slice 16**. |
| 14 | Visuals (F) | **PASS** | Home chrome unchanged aside from checklist copy/progress (5 steps / Fem / 0 av 5). |

---

## Smoke path notes

1. Cleared `gymnastics-planner-tips-v1` + `gymnastics-planner-draft-v1` → fresh **0 av 5** with all five rows including exact compose step.  
2. Place markör without compose → **3 av 5**; compose stayed unchecked.  
3. Compose step tap → Hallöversikt.  
4. Soft Golvklart with compose unchecked → enterable (gap-fill + earlier soft shot).  
5. `tipStationCompose` surfaced with locked wording.  
6. Dismiss + reload + **Visa tips igen** restored (prior smoke).  
7. Build green. Footer Slice 16.

---

## Non-blocking / out of scope (as locked)

- Broader selective redskap-förslag (idea 1).  
- Golvklart short station titles (idea 3).  
- Netlify republish.  
- Strengthening / retiring `tipStationCompose`.  
- Home illustrations / accent redesign.

---

## Screenshots

| File | Shows |
| --- | --- |
| `slice16_home_5steps.png` | Fresh Kom igång: Fem, 0 av 5, Ange redskap step |
| `slice16_compose_cta_hall.png` | Compose step → Hallöversikt |
| `slice16_tip_compose.png` | tipStationCompose strip + Redigera redskap |
| `slice16_golvklart_soft.png` / `slice16_golvklart_gapfill.png` | Soft Golvklart / caption |
| `slice16_phone_home.png` | ~390px Home |
| `slice16_home.png` / `slice16_home_full.png` | 5 av 5 / dismiss restore context |

---

## Fail-if scan

None triggered (Golvklart ungated; no Passbyggaren compose; progress not on förslag alone; 5 steps not 4; under-markör / Förrådslista present; caption & Teknik-only intact; no Home redesign; ideas 1/3 absent; Builder had shipped before verify).

---

**End of report.**
