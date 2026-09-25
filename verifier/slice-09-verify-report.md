# Slice 09 — Formal verification report (onboarding / coach tips)

**Date:** 2026-09-24 ~11:06 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-09/verification-checklist.md` (APPROVED)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/`  
**Evidence:** `slice-09-evidence-code.md` + screenshots under `/workspace/screenshots/slice09_*.png`  
**Ship notes:** `app/SLICE09-SHIPPED.md`  
**Docs copy:** `slice-09/content/coach-tips.sv.md`

**Builder deviation (in-scope):** Kom igång Home-only; no empty-builder duplicate — allowed by pack (“Home or empty Passbyggaren”).

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Product / UX | **PASS** |
| Data / persistence | **PASS** |
| Phone | **PASS** |
| Technical / scope | **PASS** |
| Regression 01–08 | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| Rule | Result | Notes |
| --- | --- | --- |
| No blocking wizard | PASS | Inline Home card |
| Kom igång 3–4 Swedish steps; dismiss survives reload | PASS | 4 steps; Home-only OK |
| Navigation soft-disable + hints | PASS | |
| ≥3 contextual tip surfaces | PASS | builder-empty, hall-place, hall-flow-golvklart (+ Erfaren shipped) |
| Dismiss + Visa tips igen restore | PASS | Home + footer |
| Swedish vocabulary | PASS | |
| Tips storage ≠ break draft | PASS | `gymnastics-planner-tips-v1` |
| Tips not in print | PASS | |
| Scope guard | PASS | |
| Regression 01–08 | PASS | |

---

## Product / UX

| Check | Result |
| --- | --- |
| Kom igång Home 4 steps; dismiss | PASS |
| tip-builder-empty; Tips tab / EMPTY_TIPS kept | PASS |
| tip-hall-place + tip-hall-flow-golvklart | PASS |
| Visa tips igen restores | PASS |
| Tips hidden in Golvklart print / floor | PASS |

---

## Data / persistence

| Check | Result |
| --- | --- |
| gymnastics-planner-tips-v1 | PASS |
| Draft key gymnastics-planner-draft-v1 intact | PASS |
| Tip dismiss ≠ delete placements | PASS |
| Stable tip ids | PASS |

---

## Phone (~390px)

| Check | Result |
| --- | --- |
| Checklist / dismiss / Visa tips igen ≥44px | PASS |
| Tip does not permanently cover tray | PASS |
| Home cards reachable | PASS |

---

## Technical / scope

| Check | Result |
| --- | --- |
| Footer Träningsplaneraren · Slice 09 | PASS |
| npm run build | PASS |
| No video/signup/CAD/new drills/routes | PASS |

---

## Regression 01–08

| Slice | Result |
| --- | --- |
| 01–04 Passbyggaren / phone / library / icons | PASS |
| 05–06 Hall / snap / presets | PASS |
| 07–08 Flow / Golvklart / polish | PASS |

---

## Screenshots

- Home checklist: `slice09_home_checklist.png`
- Checklist dismissed: `slice09_checklist_dismissed.png`
- Dismissed after reload: `slice09_dismissed_reload.png`
- Tips restored: `slice09_tips_restored.png`
- Builder empty tip: `slice09_builder_empty_tip.png`
- Hall tips: `slice09_hall_tips.png`
- Golvklart: `slice09_golvklart.png`
- Print preview: `slice09_print_preview.png`
- Phone tray: `slice09_phone_tray.png`
- Footer: `slice09_footer.png`

(Under `/workspace/screenshots/`.)

---

## Recommendation

Accept Slice 09 as **PASS**.
