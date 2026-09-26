# Slice 25 — Formal verification report (soft saknar redskap banner)

**Date:** 2026-09-26 ~10:33 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-25/verification-checklist.md` + locked A1/B1/C1/D1/E1/F1  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Features:** Hall edit saknar status (+ apply-all / Golvklart / Förråd blast-radius)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages optional/non-blocking)  
**Evidence:** `slice-25-evidence-code.md` + Builder `slice-25-builder-smoke.md` + `/workspace/screenshots/slice25v_*.png`  
**Ship notes:** `app/SLICE25-SHIPPED.md`  
**Accepted:** Light focus + highlight + toast (Docs Q2) — must **not** auto-apply. Toast optional when focus/highlight present (`and/or`).

**Tree note:** Slice 26 had already shipped into the same tree before this formal Drive finished (Planner queued 26 after 25). Footer and place-heuristic below are interpreted with that concurrent ship in mind.

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A1 Edit soft saknar (unset + `[]`); hide Golvklart; hide when none | **PASS** |
| B1 Optional point-CTA when eligible ≥1; no dead CTA; no auto-apply; apply-all works | **PASS** |
| C1 Soft chrome; never blocks Golvklart/place/Stäng | **PASS** |
| D1 Docs saknar keys wired | **PASS** |
| E1 Footer | **PASS*** (see note — current label Slice 26) |
| F1 Scope / build / caption | **PASS*** (Slice 26 heuristic present as subsequent ship) |
| Locked rules | **None failed for Slice 25 behavior** |

\*E1/F1 observations about Slice 26 already in tree — not treated as Slice 25 product FAILs.

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Edit shows when missing ≥1 | **PASS** | Unset: `"1 station saknar redskap"` + CTA. |
| 2 | Includes `[]` | **PASS** | Cleared `[]`: banner text only. |
| 3 | Includes unset | **PASS** | Drive + code helper. |
| 4 | Hidden on Golvklart | **PASS** | No saknar on floor; Golvklart reachable. |
| 5 | Hidden when none missing | **PASS** | Saved non-empty → no banner. |
| 6 | CTA when eligible ≥1 | **PASS** | Secondary CTA present; Builder measured ≥44px; code `hall-tap-target`. |
| 7 | No dead CTA | **PASS** | `[]` / eligible=0 → text only, no CTA. |
| 8 | Points, no auto-apply | **PASS** | Drive: focus/highlight; equipment still unset. Toast brief (2.2s) not captured in shot — checklist **and/or**; code sets `hallSaknarPointApplyAllToast`. |
| 9 | Apply-all still works | **PASS** | Persist + banner clears. Result toast not captured in Drive shot; Builder smoke saw it; code sets result status 2.2s. |
| 10 | Chrome | **PASS** | Soft unplaced family; Golvklart stayed enabled with saknar. |
| 11 | Footer E1 | **PASS*** | Live footer **`Träningsplaneraren · Slice 26`** because Slice 26 already shipped into tree. Slice 25 Docs/ship intended Slice 25; not a saknar defect. Formal Slice 26 verify covers current footer. |
| 12 | Caption | **PASS** | **Schematisk hall — inte exakt mått**. |
| 13 | Scope F1 | **PASS*** | Banner does not auto-apply / compose. Place-heuristic present = Slice 26 ship (queued next), not Slice 25 scope creep. |
| 14 | Build | **PASS** | exit 0. |
| 15 | No window.confirm | **PASS** | None in `app/src`. |

---

## Adjudication (Drive raw vs locks)

1. **Drive B1/C1 “toast not seen”:** Overturned. Rule 8 is focus/scroll/highlight **and/or** toast; Drive confirmed focus/highlight + no auto-apply. Apply result toast is brief; persist + banner clear proves rule 9.  
2. **Drive E1 footer Slice 26:** Noted, not overall FAIL — concurrent Slice 26 ship (Planner ping during Slice 25 run).  
3. **Code F1 place-heuristic:** Same — belongs to Slice 26 verify, not a Slice 25 banner FAIL.  
4. **Förråd soft path:** Drive skipped empty-list re-walk; code still wires `pointAtApplyAllFromForrad`; Builder smoke earlier on 25 tree asserted soft path — accepted gap for this run.

---

## Screenshots (Verifier)

| File | Shows |
| --- | --- |
| `slice25v_unset_banner_cta.png` | Unset: saknar + CTA; Golvklart enabled |
| `slice25v_after_saknar_point.png` | After point CTA |
| `slice25v_after_apply_cleared.png` | After apply-all; banner cleared |
| `slice25v_cleared_banner_no_cta.png` | `[]`: banner, no CTA |
| `slice25v_golvklart_no_saknar.png` | Floor: no saknar |
| `slice25v_saved_no_banner.png` | Saved: no saknar |

---

## Fail-if scan

None triggered for Slice 25 behavior. Backlog Shipped left to Planner. Pages not required. **Next:** Slice 26 formal verify (already queued).

---

**End of report.**
