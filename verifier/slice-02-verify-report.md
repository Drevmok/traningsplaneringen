# Slice 02 — Formal verification report (phone layout)

**Date:** 2026-09-23 ~23:25 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-02/verification-checklist.md`  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**Browser:** Chrome on box desktop  
**Evidence:** `slice-02-evidence-code.md` + UI walkthrough screenshots

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Layout (390 / 360 / 768 / desktop) | **PASS** |
| Behavior smoke | **PASS** |
| Automatic fails | **None triggered** |
| Slice 01 product regression | **PASS** (behavior intact) |

---

## Viewports

| Viewport | Verdict | Notes |
| --- | --- | --- |
| 390×844 | PASS | document width = 390; no H-scroll; sheets + 44px taps |
| 360×740 | PASS | document width = 360; no H-scroll |
| 768×1024 | PASS | single-column; library still bottom sheet + Stäng |
| 1280×800 (≥1100) | PASS | two-column intact; side panel not a sheet |

---

## Layout checklist

| Item | Result | Notes |
| --- | --- | --- |
| No horizontal scroll at 390 on Home / Passbyggaren | PASS | |
| Home CTAs full-width stack; ≥44px | PASS | ~358×135 measured on home cards |
| Top bar title + n/60 usable; actions reachable | PASS | action buttons 44px high |
| ≤480/≤768 Library/Tips/Templates sheet not skinny sidebar | PASS | bottom sheet + Stäng + backdrop |
| Sheet Stäng; Add opens filtered library | PASS | Samling filter confirmed |
| Empty tip + Add visible | PASS | |
| Item controls ≥44px | PASS | duration, ↑↓, move/remove |
| Activity detail usable on 390 | PASS | |
| Mismatch banner + template dialog on 390 | PASS | |
| Title input ≈16px+ | PASS | 16px font |

---

## Behavior smoke

| Item | Result |
| --- | --- |
| Add / remove / reorder within block | PASS |
| Soft mismatch override-add + move | PASS |
| Template ≤2 taps + confirm/cancel | PASS |
| Draft save + Fortsätt senaste pass | PASS |
| Session total = item sum only | PASS (47 = sum of items) |

---

## Automatic fails

None: no H-scroll at 390; library reachable as sheet; primary taps ≥44px; desktop two-column intact.

---

## Notes / gaps (non-blocking)

1. **SLICE02-SHIPPED claimed “no seed/template changes”** but `seedTemplates.ts` was updated so `tmpl-short-45` item-sum is now **45** (was 39 in Slice 01). Product-positive fix from Slice 01 gap; treat as doc claim mismatch, not a Slice 02 layout fail.
2. Known ship notes accepted: no overflow “⋯” menu; no full focus-trap library; 769–900px still stacks panel (sheet only ≤768).

---

## Screenshots

- Home: `/workspace/screenshots/shot-call_glwziS9wSXPRJFF5V8sURFZOfc_068e151bc6a34750.png`
- 390 builder: `/workspace/screenshots/shot-call_Utqs8T9IfCSORIM8oaO2P0i9fc_068e151bc6a34750.png`
- 390 library sheet: `/workspace/screenshots/shot-call_GsA7OQg3W8eakLEgYUOMNK5xfc_068e151bc6a34750.png`
- Desktop two-column: `/workspace/screenshots/shot-call_sJKBrFSC8wraZPgKZbyPGvOMfc_0ddada40afedc2aa.png`

---

## Recommendation

Accept Slice 02 as **PASS**. Optional: update SLICE02-SHIPPED.md to mention the short-template duration correction.
