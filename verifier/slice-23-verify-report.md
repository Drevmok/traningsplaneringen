# Slice 23 — Formal verification report (Home polish)

**Date:** 2026-09-26 ~06:22 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-23/verification-checklist.md` + locked A1/B1/C1/D1/E1/F1  
**Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence) + `backlog/PSTACK-OPS.md`  
**Features:** `home-kom-igang.md` (+ hall/golvklart open paths)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:4173/traningsplaneringen/` (preview; Pages optional/non-blocking)  
**Evidence:** `slice-23-evidence-code.md` + Builder `slice-23-builder-smoke.md` + `/workspace/screenshots/slice23v_*.png`  
**Ship notes:** `app/SLICE23-SHIPPED.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A1 Hallöversikt / Golvklart secondary when draft; hide without; soft flash | **PASS** |
| B1 Öppna på telefon + live Pages URL; honesty kept | **PASS** |
| C1 Layout / quiet Kom igång / no new tip | **PASS** |
| E1 Footer Slice 23 / F1 scope / build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Hidden without draft | **PASS** | After tips+draft clear: no Hall/Golvklart secondary. |
| 2 | Visible with draft | **PASS** | Empty draft + draft with activities: both secondary under primary. |
| 3 | Hit targets ≥44 | **PASS** | Code + Builder ≥44; Drive secondary usable. |
| 4 | Hallöversikt opens edit | **PASS** | With activities → Hallöversikt edit. |
| 5 | Golvklart opens floor | **PASS** | With activities → Golvklart. |
| 6 | Soft fail flash | **PASS** | Empty activities: stays Home; Home-level soft-fail (`.home-step-hint`). Home-level-only intentional (Planner accepted). |
| 7 | Swedish labels | **PASS** | Hallöversikt / Golvklart. |
| 8 | Öppna på telefon always | **PASS** | Visible with and without draft (`no-print`). |
| 9 | Existing oppnaPaTelefon* | **PASS** | No sync/account invent. |
| 10 | Live URL | **PASS** | `https://drevmok.github.io/traningsplaneringen/` text + link. |
| 11 | Honesty kept | **PASS** | Slice 10 honesty present. |
| 12 | No dismiss required | **PASS** | Phone block not dismiss-gated. |
| 13 | Layering C1 | **PASS** | Secondary in home-actions; phone with honesty; Kom igång not force-expanded; no new tip strip. |
| 14 | Footer E1 | **PASS** | **Träningsplaneraren · Slice 23**. |
| 15 | Caption | **PASS** | **Schematisk hall — inte exakt mått**. |
| 16 | Scope F1 | **PASS** | No Förråd empty CTA / saknar / compose / library / CAD / cloud / sync; Slice 22 quiet intact. |
| 17 | Build | **PASS** | exit 0. |
| 18 | No window.confirm | **PASS** | None for this chrome. |

---

## Observations

1. **Home-level-only `stepHint`:** Soft flash under `home-actions` so it works when Kom igång is collapsed/dismissed — accepted intentional deviation.  
2. **need-hall soft-fail:** Not exercised (Builder gap; Golvklart fail path currently 0 activities) — not a FAIL.  
3. **Desktop:** Not driven — not required.

---

## Screenshots (Verifier)

| File | Shows |
| --- | --- |
| `slice23v_no_draft.png` | No secondary; phone + honesty |
| `slice23v_soft_fail.png` | Empty-draft soft fail |
| `slice23v_with_draft_home.png` | Secondary CTAs with draft |
| `slice23v_open_hall.png` | Hallöversikt from Home |
| `slice23v_open_golvklart.png` | Golvklart from Home |

---

## Fail-if scan

None triggered. Backlog Shipped left to Planner.

---

**End of report.**
