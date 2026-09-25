# Slice 03 — Code evidence pack (Verifier)

**Date:** 2026-09-24 00:26 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-03/verification-checklist.md` + `app/SLICE03-SHIPPED.md` + `slice-03/content/slice-03-seed-activities.sv.md`  
**Scope:** `npm run build`, seed/types/templates/UI chrome inspection — **not** full browser interaction walkthrough  
**Product rewrite:** none (verify only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm install` | Already present (`node_modules/`); not re-run | `ls app/` |
| `npm run build` | **PASS** | `tsc -b && vite build` → exit 0; `dist/assets/index-DHJbDJ3E.css` 13.73 kB, `index-vVmHhsoY.js` 261.41 kB |
| Dev server | **PASS** — already running on `127.0.0.1:5173` (pid listening); not duplicated | `ss` LISTEN; `curl` → HTTP **200**, `<html lang="sv">` |
| Server URL | `http://127.0.0.1:5173/` | Also `http://localhost:5173/` |
| Footer | Slice 03 | `App.tsx` → `{UI.appName} · Slice 03` |

---

## Legend

- **PASS** — satisfied from code with concrete evidence  
- **PARTIAL** — present but needs UI confirmation  
- **FAIL** — clear violation  
- **BLOCKED** — cannot judge without browser/human  

---

## Counts by `blockType` (seedActivities.ts)

| Block | Expected | Observed | Verdict |
| --- | ---: | ---: | --- |
| Samling (`gathering`) | 3 | 3 | **PASS** |
| Uppvärmning (`warmup`) | 5 | 5 | **PASS** |
| Teknik (`techniques`) | 9 | 9 | **PASS** |
| Styrka (`strength`) | 3 | 3 | **PASS** |
| Lek och spel (`fun_and_games`) | 8 | 8 | **PASS** |
| **Totalt** | **28** | **28** | **PASS** |

All 28 activity `id`s present (gather-*, warm-*, tech-*, strength-*, fun-*). No duplicate ids.

---

## Stub / Utkast

| Check | Verdict | Evidence |
| --- | --- | --- |
| All `stub: false` | **PASS** | 28× `stub: false`; 0× `stub: true` in `seedActivities.ts` |
| No default Utkast in library | **PASS (code)** | Stub badge only renders when `activity.stub` (`ActivityCard.tsx` L22, `ActivityDetail.tsx` L46, `BlockCard.tsx` L120); with all stubs false, Utkast never shows for seed drills |
| `UI.stub` still defined | OK (legacy) | `blockMeta.ts` L135 `'Utkast'` — unused for Slice 03 seeds |

---

## Experienced-coach-only

| Check | Verdict | Evidence |
| --- | --- | --- |
| Exactly two `experiencedCoachOnly: true` | **PASS** | `tech-rondat-flickis`, `tech-salto-fran-hojd` only |
| Matching `newCoachOk: false` | **PASS** | Same two ids only |
| Difficulty `hard` | **PASS** | Both set `difficulty: 'hard'` |
| Other teknik new-coach OK | **PASS** | Remaining 7 teknik have `experiencedCoachOnly: false`, `newCoachOk: true` |
| Badge UI (picker card) | **PASS (code)** | `ActivityCard.tsx` L23–25: `.experienced-badge` + `UI.experiencedCoach` |
| Badge + warning (detail) | **PASS (code)** | `ActivityDetail.tsx` L47–49 badge; L56–60 `.experienced-warning` `role="alert"` |
| Copy | **PASS** | `UI.experiencedCoach = 'Erfaren ledare'`; warning: *Endast med erfaren ledare — kräver aktiv spotting… Du kan ändå lägga till övningen.* (`blockMeta.ts` L160–162) |
| CSS | **PASS** | `App.css` `.experienced-badge` (~L528), `.experienced-warning` (~L541) |
| Not hidden from library | **PASS (code)** | No filter on `experiencedCoachOnly` in library listing; default shows all 28 (per shipped note) |

**Experienced-only list (complete):**

1. `tech-rondat-flickis` — Rondat–flickis  
2. `tech-salto-fran-hojd` — Salto från höjd  

---

## Distinct 1-2-3 drills

| Id | Block | Title | Verdict |
| --- | --- | --- | --- |
| `warm-123-voltpositioner` | warmup | 1-2-3 (voltpositioner) | **PASS** |
| `fun-123-forflyttning` | fun_and_games | 1-2-3 (förflyttningslek) | **PASS** |

Distinct ids, titles, `visualKey`s (`warm-123-volt` vs `fun-123-move`). No collision.

---

## Swedish terminology spot-check

| Term | Verdict | Evidence |
| --- | --- | --- |
| **gymnaster** | **PASS** | Used throughout seed copy (`howTo`/`watchFor`/`summary`); ~14 `gymnast*` hits in `seedActivities.ts`; tips chrome in `blockMeta.ts` |
| **pass** | **PASS** | UI: `Nytt pass`, `Fortsätt senaste pass`, template *Kort pass*; seed summaries reference *passet* |
| Avoid aktiva/elever/session (locked terms) | **PASS** | 0 hits for `aktiva` / `elever` / `session` in seedActivities |
| `lang="sv"` | **PASS** | Dev HTML root |

---

## Templates (seedTemplates.ts vs SLICE03-SHIPPED remapping)

### `tmpl-beginner-60` — “Nybörjare — ca 55 min”

| Item | Expected | Observed | Verdict |
| --- | --- | --- | --- |
| Item sum | 55 | **55** (5+3+10+6+6+6+5+8+6) | **PASS** |
| `targetLevel` | new_coach_safe | `new_coach_safe` | **PASS** |
| Experienced-only ids | none | none | **PASS** |
| Ids match shipped table | yes | gather-valkomstcheck-in, gather-dagens-teknik, warm-hall-varv, tech-ljushopp-satsbrada, tech-handstaende-falla-rygg, tech-falla-bakat-hojd, strength-styrkelatar, strength-burpee-emom, fun-rundpingis-medicinboll | **PASS** |
| All ids exist in seed | yes | yes | **PASS** |

### `tmpl-short-45` — “Kort pass — ca 45 min”

| Item | Expected | Observed | Verdict |
| --- | --- | --- | --- |
| Item sum | ≈45 | **45** (5+6+5+6+6+8+5+4) | **PASS** |
| Experienced-only ids | none | none | **PASS** |
| Ids match shipped table | yes | gather-valkomstcheck-in, warm-uppvarmningsdans, warm-tojning-coach, tech-ljushopp-satsbrada, tech-handstaende-falla-rygg, strength-burpee-emom, fun-handstaende-utmaning, fun-123-forflyttning | **PASS** |
| All ids exist in seed | yes | yes | **PASS** |

---

## Types / shipped file list spot-check

| File | Verdict |
| --- | --- |
| `types.ts` — `experiencedCoachOnly?`, `newCoachOk?`, `needsCoachReview?` | **PASS** (L28–30) |
| `seedActivities.ts` — 28 real drills | **PASS** |
| `seedTemplates.ts` — remapped | **PASS** |
| `blockMeta.ts` — Erfaren ledare chrome + VISUAL_EMOJI keys | **PASS** |
| ActivityCard / ActivityDetail / App.css | **PASS** |

---

## Gaps (documented, not fails)

From `SLICE03-SHIPPED.md` (accepted):

1. Optional library filter chip for coach level **not** added — all 28 shown with badge.  
2. `needsCoachReview` stored on some seeds but **not** surfaced as picker badge (`UI.needsCoachReview` exists for later).  
3. Drafts saved under Slice 01/02 with old stub activity ids may show missing titles until re-planned — expected after catalog replace.

No automatic-fail criteria met from code (stubs do not dominate; experienced drills have badge/warning code; counts exact).

---

## Checklist mapping (code-only)

| Checklist item | Code verdict |
| --- | --- |
| 28 drills: 3·5·9·3·8 | **PASS** |
| Not Utkast/stub | **PASS** |
| Swedish gymnaster + pass | **PASS** |
| Distinct warm vs fun 1-2-3 | **PASS** |
| Exactly two experiencedCoachOnly | **PASS** |
| Badge + warning in picker/detail; still visible | **PASS (code)** → UI confirm render |
| Soft mismatch / block filter / draft / phone sheet | **BLOCKED / UI agent** (behavior smoke) |
| Templates avoid experienced-only; sums | **PASS** |

---

## UI agent focus items

1. Confirm **Erfaren ledare** rose badge on library cards for `tech-rondat-flickis` and `tech-salto-fran-hojd` only.  
2. Open detail for each → badge + warning alert; **Lägg till** still enabled.  
3. Confirm **no Utkast** badges on any of the 28; library shows all 28 (no accidental filter-out).  
4. Spot one drill per block (samling / uppvärmning / teknik / styrka / lek) — Swedish titles readable.  
5. Confirm warm **1-2-3 (voltpositioner)** vs fun **1-2-3 (förflyttningslek)** both listed distinctly.  
6. Load `tmpl-short-45` / `tmpl-beginner-60` → totals 45 / 55; no experienced-only drills appear.  
7. Smoke: add drill per block, soft mismatch, draft save/restore, phone sheet library (Slice 02).  
8. Desktop + phone: builder not regressed.

---

## Overall (code/build)

| Area | Result |
| --- | --- |
| Build | **PASS** |
| Dev server | **PASS** (200) |
| Counts / stubs / experienced-only / 1-2-3 / terminology / templates | **PASS** |
| Badge/warning UI code | **PASS** |
| Interactive behavior smoke | **Deferred to UI agent** |

**Code/build verdict: PASS** for Slice 03 library content + template remapping + experienced chrome wiring. UI visual/behavior confirmation still required for checklist “behavior smoke” rows.
