# Slice 17 — Formal verification report (Golvklart short station titles)

**Date:** 2026-09-25 ~13:35 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-17/verification-checklist.md` (APPROVED; A–F locked)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/` (local; Netlify optional/non-blocking)  
**Evidence:** `slice-17-evidence-code.md` + `/workspace/screenshots/slice17_*.png`  
**Ship notes:** `app/SLICE17-SHIPPED.md`  
**Docs:** `docs/golvklart-short-titles.sv.md`, `docs/golvklart-redskap.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Golvklart titles (A) / edit canvas hidden | **PASS** |
| Stack title then redskap (B) / ellipsis (C) | **PASS** |
| Title when redskap quiet (D) | **PASS** |
| Footer Slice 17 (E) / caption + scope (F) | **PASS** |
| Print / phone / Slice 11–16 intact | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Golvklart titles | **PASS** | Both placed Teknik markörer show short titles (ellipsis e.g. Ljushop…) on `.is-floor`. |
| 2 | Edit canvas | **PASS** | Edit Hallöversikt: titles and under-markör redskap hidden; return from Golvklart still hidden. |
| 3 | Print | **PASS** | Print preview: short title + redskap; no double title. |
| 4 | Stack (B) | **PASS** | Composed station: title then Trampett / Landningsmatta / Satsbräda below; CSS floor `top` mirrors print. |
| 5 | Empty redskap (D) | **PASS** | Quiet station shows title only. |
| 6 | Slice 14 quiet | **PASS** | No “Inga redskap” under quiet markör. |
| 7 | Slice 14–16 intact | **PASS** | Förrådslista CTA; compose/detail path; Kom igång 5 steps intact in code. |
| 8 | Caption | **PASS** | **Schematisk hall — inte exakt mått**. |
| 9 | Scope | **PASS** | No edit titles; no badge/CAD; no idea 1. |
| 10 | Phone | **PASS** | ~390px Golvklart readable. |
| 11 | Footer (E) | **PASS** | **Träningsplaneraren · Slice 17**. |
| 12 | Build | **PASS** | `npm run build` exit 0. |

---

## Smoke path notes

1. ≥2 placed Teknik: one composed (Trampett, Landningsmatta, Satsbräda), one quiet.  
2. Edit: icon + order badge only — no titles / no redskap.  
3. Golvklart: both titles; composed stacks title→redskap; quiet title-only.  
4. Print preview OK; canceled after shot.  
5. Marker detail works; Förrådslista present; caption + footer Slice 17.  
6. Phone OK; edit still clean after return.

---

## Screenshots

| File | Shows |
| --- | --- |
| `slice17_edit.png` | Edit canvas — titles/redskap hidden |
| `slice17_golvklart.png` | Floor titles + composed stack + quiet title-only + footer |
| `slice17_stack.png` | Close-up title-then-redskap vs quiet |
| `slice17_print.png` | Print preview |
| `slice17_phone.png` | ~390px Golvklart |
| `slice17_edit_return.png` | Edit still hides after Golvklart |

---

## Fail-if scan

None triggered (no edit titles; Golvklart shows titles; no title/redskap same-top fight; quiet has no empty redskap chrome; no idea 1/CAD/badge; caption unchanged; Builder had shipped).

---

**End of report.**
