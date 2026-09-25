# Slice 20 — Formal verification report (phone polish)

**Date:** 2026-09-26 ~00:31 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-20/verification-checklist.md` + `slice-20/decisions.md` (APPROVED A–F)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/traningsplaneringen/` (local; Netlify optional/non-blocking)  
**Evidence:** `slice-20-evidence-code.md` + `/workspace/screenshots/slice20_*.png`  
**Ship notes:** `app/SLICE20-SHIPPED.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| A1 Dirty Stäng (in-sheet confirm; no window.confirm) | **PASS** |
| B1 Canvas remove ≥44×44 edit-only; tap≠drag; no Golvklart remove | **PASS** |
| C1 Starta från mall scroll; sheet closed; flag consumed; body unlock | **PASS** |
| E1 Footer Slice 20 / F1 scope / caption / build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | No `window.confirm` on dirty Stäng | **PASS** | In-sheet only; zero `window.confirm` in `app/src`. |
| 2 | Discard — Stäng utan att spara | **PASS** | Closes sheet; recipe not persisted (UI smoke). |
| 3 | Keep editing — Fortsätt redigera | **PASS** | Hides confirm; sheet stays open. |
| 4 | Clean Stäng | **PASS** | Immediate close, no confirm. |
| 5 | Klar | **PASS** | Saves without discard confirm. |
| 6 | Phone confirm actions ≥44px | **PASS** | CSS `min-height: 44px` at ≤768px; smoke OK. |
| 7 | Canvas remove hit ≥44×44 | **PASS** | Measured rect **44×44**; CSS locked. No B2 text CTA. |
| 8 | Edit only — no Golvklart remove | **PASS** | Floor `showRemove={!isFloor}`; smoke confirmed. |
| 9 | Tap → detail; drag ≠ detail | **PASS** | Tap opened detail; short drag moved without open. |
| 10 | Remove works | **PASS** | Placement removed; returned to tray. |
| 11 | Starta från mall happy path | **PASS** | Nybörjare cloned; Passbyggaren scrollable (~390px); mid-scroll shot. |
| 12 | No stuck sheet after apply | **PASS** | Mall/library sheet closed. |
| 13 | Body unlock | **PASS** | After apply `body.style.overflow` empty (not `hidden`); scrollHeight 2443 / clientHeight 844. |
| 14 | Cancel path | **PASS** | Close without apply → builder still scrollable. |
| 15 | Flag consumed | **PASS** | `onInitialTemplateConsumed` clears `openTemplates`; apply uses `closePanel()`. |
| 16 | Scope (F1) | **PASS** | No Passbyggaren compose; library 10 `eq-*`; caption **Schematisk hall — inte exakt mått**; 11–19 intact; no auto-apply. |
| 17 | Footer (E1) | **PASS** | **Träningsplaneraren · Slice 20**. |
| 18 | Build | **PASS** | `npm run build` exit 0. |

---

## Screenshots

| File | Shows |
| --- | --- |
| `slice20_a1_dirty_confirm.png` | In-sheet dirty Stäng confirm |
| `slice20_b1_marker_remove.png` | Edit canvas remove control |
| `slice20_b1_golvklart.png` | Golvklart without remove; caption |
| `slice20_c1_template_midscroll.png` | Passbyggaren mid-scroll after mall apply |
| `slice20_c1_cancel_builder.png` | Cancel/close mall path — builder OK |

---

## Fail-if scan

None triggered (no `window.confirm`; remove ≥44px; no Golvklart remove; scroll/body unlock OK after mall; no Passbyggaren compose / badge / CAD / library growth / caption change; Builder had shipped).

---

**End of report.**
