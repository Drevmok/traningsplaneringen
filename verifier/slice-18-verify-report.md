# Slice 18 — Formal verification report (broader selective redskap-förslag seeds)

**Date:** 2026-09-25 ~19:56 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-18/verification-checklist.md` (APPROVED A–F)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/traningsplaneraren/` (local; Netlify optional/non-blocking)  
**Evidence:** `slice-18-evidence-code.md` + `/workspace/screenshots/slice18_*.png`  
**Ship notes:** `app/SLICE18-SHIPPED.md`  
**Docs:** `docs/station-compose.sv.md`, `docs/redskap-forslag-seeds.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| New five seeds (A) / existing four KEEP | **PASS** |
| Förslag UX unset / Använd förslag / `[]` (B) | **PASS** |
| Floor/list/print omit unset förslag (C) | **PASS** |
| Footer Slice 18 (E) / scope (F) | **PASS** |
| Library 10 / compose entry / Slice 14–17 | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | New seeds present | **PASS** | Code: five locked arrays match table (flickis-kudde, rondat-flickis, falla-bakat-hojd, salto-fran-hojd, handstaende-falla-rygg). |
| 2 | Existing four untouched | **PASS** | KEEP arrays match locked Slice 13/18 table (no git; intentional identical). |
| 3 | Förslag when unset | **PASS** | UI: Flickis med flickiskudde shows Flickiskudde + Madrass + **Använd förslag**. |
| 4 | Använd förslag persists | **PASS** | After Använd förslag: Golvklart under-markör Flickiskudde / Madrass; Förrådslista aggregates. |
| 5 | Unset quiet on floor | **PASS** | While unset, Golvklart / Förrådslista omit förslag. |
| 6 | Cleared `[]` | **PASS** | Clear all → Klar: no förslag; quiet on floor/list. |
| 7 | Library size | **PASS** | Exactly 10 `eq-*` in `EQUIPMENT_PIECES`. |
| 8 | Compose entry | **PASS** | Redigera redskap / Använd förslag from hall detail only. |
| 9 | Scope | **PASS** | No badge/CAD/auto-apply/caption change. Caption **Schematisk hall — inte exakt mått**. |
| 10 | Slice 14–17 intact | **PASS** | Quiet redskap; Förrådslista; short titles on floor; Kom igång 5 in code. |
| 11 | Footer (E) | **PASS** | **Träningsplaneraren · Slice 18**. |
| 12 | Build | **PASS** | `npm run build` exit 0. |

---

## Smoke path notes

1. New seeded drills (Flickis med flickiskudde, Falla bakåt från höjd) + old Ljushopp på trampett.  
2. Unset detail shows förslag + Använd förslag.  
3. Unset → floor/list quiet (förslag not applied).  
4. Använd förslag → saved composition visible on Golvklart + Förrådslista.  
5. Cleared `[]` stays quiet.  
6. Footer Slice 18; caption unchanged; short titles still on floor.

---

## Screenshots

| File | Shows |
| --- | --- |
| `slice18_forslag.png` | Unset förslag + Använd förslag (Flickiskudde, Madrass) |
| `slice18_golvklart_unset.png` | Unset quiet / caption / footer Slice 18 |
| `slice18_forrad_unset.png` | Förrådslista omits unset förslag |
| `slice18_golvklart_saved.png` | After Använd förslag: title + under-markör redskap |
| `slice18_forrad_saved.png` | Förrådslista aggregate after save |
| `slice18_cleared.png` / `slice18_cleared_floor.png` | Cleared `[]` quiet |

---

## Fail-if scan

None triggered (KEEP four intact; unset förslag not on floor/list; library still 10; no Passbyggaren compose / badge / CAD / auto-apply; caption unchanged; Builder had shipped before verify).

---

**End of report.**
