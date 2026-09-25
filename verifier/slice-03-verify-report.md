# Slice 03 — Formal verification report (real drill library)

**Date:** 2026-09-24 ~00:35 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-03/verification-checklist.md`  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/`  
**Evidence:** `slice-03-evidence-code.md` + UI screenshots under `/workspace/screenshots/`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Library content | **PASS** |
| Behavior smoke | **PASS** |
| Phone sheet (Slice 02) | **PASS** |
| Automatic fails | **None triggered** |

---

## Library content

| Item | Result | Notes |
| --- | --- | --- |
| 28 drills: 3 / 5 / 9 / 3 / 8 | PASS | gathering 3, warmup 5, techniques 9, strength 3, fun 8 |
| Not Utkast/stub | PASS | All `stub: false`; no Utkast badges in UI |
| Swedish; gymnaster + pass | PASS | Spot-checked copy |
| Distinct warm 1-2-3 vs fun 1-2-3 | PASS | voltpositioner vs förflyttningslek |
| Exactly two experiencedCoachOnly | PASS | `tech-rondat-flickis`, `tech-salto-fran-hojd` only |
| Badge + warning; still visible/addable | PASS | **Erfaren ledare** on card + detail; Lägg till works |
| Other teknik new-coach OK | PASS | |

---

## Behavior smoke

| Item | Result | Notes |
| --- | --- | --- |
| Add from each block | PASS | |
| Soft mismatch / filter | PASS | |
| Templates avoid experienced-only | PASS | beginner sum 55; short ≈45 |
| Draft save/restore | PASS | |
| Phone sheet opens library | PASS | 390px |

---

## Automatic fails

None: stubs do not dominate; experienced have badge/warning; counts exact; desktop/phone core flows OK.

---

## Non-blocking notes (documented in ship notes)

- No coach-level filter chip (out of scope)
- `needsCoachReview` not shown as picker badge
- Old Slice 01/02 drafts with stub ids may show missing titles until re-planned

---

## Screenshots

- Library overview: `shot-call_I6meVE1LAoC6MMkHOigaPTFlfc_0c1fe1eb8090ee07.png`
- Experienced badges in picker: `shot-call_KAckSziFeCCwu0q8qjPiOE0Ufc_010374219e14029c.png`
- Rondat detail warning: `shot-call_rwuuXeG2ax3Pg6VcHkwCgMhqfc_0c1fe1eb8090ee07.png`
- Salto detail warning: `shot-call_75BxVZuztyiLTUW0EJVCKh4sfc_0c1fe1eb8090ee07.png`
- Distinct 1-2-3 titles: `shot-call_zBViBxtMg5caugZpde5FWSmHfc_010374219e14029c.png
- Phone sheet: `shot-call_4jOLJjve2NlrVnhqOUhLDzLFfc_0c1fe1eb8090ee07.png`

(Paths under `/workspace/screenshots/`.)

---

## Recommendation

Accept Slice 03 as **PASS**.
