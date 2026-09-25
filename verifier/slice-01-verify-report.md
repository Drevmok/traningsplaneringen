# Slice 01 — Formal verification report

**Date:** 2026-09-23 ~23:06 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-01/verification-checklist.md` (v2)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**Environment:** desktop browser → `http://127.0.0.1:5173/` (`lang=sv`, Träningsplaneraren)  
**Evidence:** `slice-01-evidence-code.md` + UI walkthrough + screenshots under `/workspace/screenshots/`

---

## Overall verdict: **PASS (pending human new-coach gate)**

| Section | Verdict |
| --- | --- |
| Product / UX | **PASS** |
| Data / persistence | **PASS** |
| Content | **PASS** |
| New-coach timed test | **NOT RUN — needs human** |
| Automatic fails | **None triggered** |

Product/UX, data, content, and all auto-fail rules pass on the shipped build. Checklist slice-complete bar still requires a human new-coach timed test ([45,60] item-sum in ≤10:00 + block-purpose explanations). Until that runs, do **not** treat Slice 01 as fully closed.

Known out-of-scope (correctly not failed): export stub, phone polish.

---

## Product / UX

| Item | Result | Notes |
| --- | --- | --- |
| Minimal home: New · Template · Continue draft | PASS | Swedish: Nytt pass · Starta från mall · Fortsätt senaste pass |
| Five blocks in order | PASS | Samling → Uppvärmning → Teknik → Styrka → Lek och spel |
| Title editable | PASS | |
| Live total vs target | PASS | Blank `0/60`; updates with items (UI saw restore at `53/60`) |
| Block budget vs filled + soft overflow | PASS | Inline **Över budget** |
| Empty tip + Add; returns after last remove | PASS | |
| Cards: visual + title + duration | PASS | Emoji via visualKey |
| Stubs labeled | PASS | **UTKAST** / Utkast badges |
| Picker filtered to block type | PASS | |
| Soft mismatch on override-add + move | PASS | Inline banner; item stays; dismissible |
| Reorder within block | PASS | ↑↓ buttons (not drag — meets checklist) |
| Template ≤2 taps; confirm; cancel unchanged | PASS | |
| Tips panel | PASS | |
| Activity detail + Add / Add-and-edit-duration | PASS | Sammanfattning / Så gör du / Se upp för |
| Color/icon map | PASS | amber/sky/violet/rose/green |
| Export stub | PASS (N/A) | Disabled + Kommer snart |

---

## Data / persistence

| Item | Result | Notes |
| --- | --- | --- |
| Save draft + reload restores | PASS | localStorage `gymnastics-planner-draft-v1` |
| Continue last draft from home | PASS | |
| Template clone sets basedOnTemplateId; template not mutated | PASS | |
| Remove item ≠ delete library Activity | PASS | |
| Session total = item sum only | PASS | Computed; not independently editable |

---

## Content

| Item | Result | Notes |
| --- | --- | --- |
| Empty-state tip per block (SV) | PASS | |
| ≥6 activities × 5 types | PASS | 30 total |
| watchForRequired ⇒ non-empty watchFor | PASS | All 6 required filled; safety-hold ids absent |

---

## New-coach test

| Item | Result |
| --- | --- |
| Device / tester type recorded | NOT RUN |
| Item-sum [45,60] in ≤10:00 | NOT RUN — needs human |
| Explain each block in own words | NOT RUN — needs human |

---

## Automatic fails

None observed (blank canvas, title-only library, missing ≤2-tap template, missing mismatch on both paths, save/restore fail, missing required watchFor).

---

## Concrete gaps for Planner (non-blocking for this pass)

1. **`tmpl-short-45` item-sum is 39**, title says «ca 45 min». Beginner template sums to 47 (OK). Flag for Docs/Builder: either bump short template into [45,60] or rename (e.g. ca 40 min).
2. **Reorder is ↑↓ buttons**, not drag — checklist met; note only if product wants drag later.
3. **Human new-coach gate still open** — recommend Christoffer or a stand-in run it on desktop/tablet and record device + tester type.

---

## Screenshots

- `/workspace/screenshots/shot-call_PsVkMyt5YV9Jb3twFEfv4lM4fc_0ef1a03c2966e622.png`
- `/workspace/screenshots/shot-call_CdNEdU7I4egFEDE5SLXAfxdZfc_0ef1a03c2966e622.png`
- `/workspace/screenshots/shot-call_NT3ucfXtR9TBj2XHOATX4tr8fc_0ef1a03c2966e622.png`

---

## Recommendation

Ship Slice 01 product/tech acceptance as **PASS pending human new-coach test**. Fix or relabel `tmpl-short-45` when convenient. Kick the timed coach test next; Verifier will re-open only if that fails or Planner asks for a re-check.
