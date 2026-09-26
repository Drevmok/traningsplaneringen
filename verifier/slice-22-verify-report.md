# Slice 22 — Formal verification report (quieter chrome)

**Date:** 2026-09-26 ~01:50 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-22/verification-checklist.md` + locked A1/B1/C1/D1/E1/F1  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Features:** `home-kom-igang.md`, `hall-redigera-redskap.md`, `golvklart-forrad.md`  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages optional/non-blocking)  
**Evidence:** `slice-22-evidence-code.md` + Builder `slice-22-builder-smoke.md` + `/workspace/screenshots/slice22v_*.png`  
**Ship notes:** `app/SLICE22-SHIPPED.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A1 Progressive Hall hints + info ≥44 + durable compact | **PASS** |
| B1 Kom igång first-run 0/5 expanded; collapse after progress | **PASS** |
| C1 One chrome layer (tip vs hints; Golvklart banner vs tip) | **PASS** |
| E1 Footer Slice 22 / F1 scope / Slice 21 chrome / build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Full hints first | **PASS** | Zero placements / not compact: multi-line hints visible (subject to C1). |
| 2 | Compact after place | **PASS** | After Teknik place: multi-line hidden; compact set. |
| 3 | Info ≥44 reveals hints | **PASS** | Single header info control reveals full hint set (Planner-noted OK). |
| 4 | Durable compact | **PASS** | Reload still compact until Visa tips igen. |
| 5 | Primary CTAs when compact | **PASS** | Tray / Placera här still work. |
| 6 | First-run 0/5 expanded | **PASS** | After clearing **tips + draft** keys: expanded 0 av 5 + intro. Prior Drive 3/5 was leftover draft auto-progress — not a product FAIL. |
| 7 | Collapsed after progress | **PASS** | After mall apply: collapsed summary + Visa steg. |
| 8 | Expand / collapse ≥44 | **PASS** | Expand/collapse cycle OK. |
| 9 | Dölj Kom igång path | **PASS** | Code + Builder smoke; not re-failed. |
| 10 | Visa tips igen | **PASS** | Clears compact/collapse per code Q4; Drive saw “Tips syns redan” when already visible — OK. |
| 11 | Tip suppresses multi-line | **PASS** | Hall edit with tip: multi-line absent; info available. |
| 12 | Banner suppresses tip on Golvklart | **PASS** | Unplaced banner; no tip strip stacked. |
| 13–14 | Blocking / CTAs | **PASS** | Soft teaching yields; CTAs usable. |
| 15 | Footer E1 | **PASS** | **Träningsplaneraren · Slice 22**. |
| 16 | Caption | **PASS** | **Schematisk hall — inte exakt mått**. |
| 17 | Scope F1 | **PASS** | No saknar banner; no place-heuristic change; no compose/library/CAD. |
| 18 | Slice 21 intact | **PASS** | Tray collapse + zoom present; pinch not re-failed. |
| 19 | Build | **PASS** | exit 0. |
| 20 | No window.confirm | **PASS** | None in app/src. |

---

## Observations

1. **B1 first-run:** Requires empty `gymnastics-planner-tips-v1` **and** `gymnastics-planner-draft-v1`. Draft heuristics auto-check steps; incomplete wipe looks like “not 0/5” without being a Slice 22 lock fail.  
2. **Info control:** Header-only (not tray duplicate) per Builder deviation — accepted.  
3. **compact on placeAt only:** Pre-Slice-22 placements keep full hints until next place — accepted per Planner.

---

## Screenshots (Verifier)

| File | Shows |
| --- | --- |
| `slice22v_b1_first-run.png` | Home 0/5 expanded |
| `slice22v_b1_collapsed.png` | Collapsed after progress |
| `slice22v_hall_compact.png` / `slice22v_hall_tips_expanded.png` | A1 compact + info |
| `slice22v_golvklart_unplaced.png` | C1 banner, no tip |
| `slice22v_home_collapsed.png` / `slice22v_home_expanded.png` | Earlier B1 cycle |

---

## Fail-if scan

None triggered.

---

**End of report.**
