# Slice 09 — Code evidence pack (Verifier)

**Date:** 2026-09-24 10:59 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-09/verification-checklist.md` (APPROVED 2026-09-24) + `app/SLICE09-SHIPPED.md` + `slice-09/content/coach-tips.sv.md`  
**Scope:** `npm run build`, source/CSS/string inspection, scope guard, regression 01–08 spot-check — **not** full browser viewport / reload / print-preview glance  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build` → vite v8.3.0; 42 modules; `dist/index.html` 0.46 kB; `index-CWxraDuQ.css` 26.34 kB; `index-VN4MOwty.js` 300.90 kB; built in 622 ms; `EXIT:0` |
| Errors | none | clean stdout |
| Footer (source) | **PASS** | `App.tsx:215` → `{UI.appName} · Slice 09` with `UI.appName = 'Träningsplaneraren'` → **Träningsplaneraren · Slice 09** |
| Bundle footer | **PASS** | dist JS contains `Slice 09`, `Träningsplaneraren`, tip ids, tips key, `Kom igång`, `Visa tips igen` |
| Historical docs | **PASS** | `SLICE01`–`SLICE08-SHIPPED.md` retained; not mass-renamed |

---

## Legend

- **PASS** — satisfied from code with concrete evidence  
- **PARTIAL** — present in code; needs UI/browser confirmation  
- **FAIL** — clear violation (none found on code side)  
- **N/A** — explicit non-fail / out of scope per task

---

## 1. Persistence (`coachTips.ts`)

| Check | Verdict | Evidence |
| --- | --- | --- |
| Storage key `gymnastics-planner-tips-v1` | **PASS** | `TIPS_STORAGE_KEY` (`coachTips.ts:3`); `loadCoachTips` / `saveCoachTips` only read/write that key (`:71-93`) |
| Tip ids stable | **PASS** | `tip-builder-empty`, `tip-hall-place`, `tip-hall-flow-golvklart`, `tip-experienced-safety` (`:5-8`); also in dist bundle |
| Defaults when missing | **PASS** | `defaultCoachTips()` → `version:1`, `checklistDismissed:false`, all checklist false, `dismissed:{}` (`:33-45`); load catch → defaults (`:71-78`) |
| Restore / Visa tips igen | **PASS** | `resetTipsVisibility` clears `checklistDismissed` + `dismissed` and sets `showTipsAgain:true` (`:121-128`); `anyTipsHidden` gate (`:131-134`); wired Home + footer (`App.tsx:138-150`, `Home.tsx:75-81,136-151`) |
| Does **not** touch draft key | **PASS** | `coachTips.ts` never references `gymnastics-planner-draft-v1` / `saveDraft` / `loadDraft`; draft remains `session.ts:17` `STORAGE_KEY = 'gymnastics-planner-draft-v1'` |
| Clear tips ≠ delete session/placements | **PASS** | Dismiss/reset only mutate tips state object + tips localStorage key |

---

## 2. Product / UX (locked)

| Locked rule | Verdict | Evidence |
| --- | --- | --- |
| No multi-step blocking tour / modal on first open | **PASS (code)** | `KomIgangCard` is `<section className="kom-igang">` on Home (`KomIgangCard.tsx:78-81`); no wizard/tour-modal/onboarding-modal in `src/`; Home action cards always rendered after checklist (`Home.tsx:100-134`); views remain `home \| builder \| hall` only (`App.tsx:30`) |
| **Kom igång** on Home, 3–4 Swedish steps | **PASS** | Home-only card (`Home.tsx:91-98`); exactly **4** steps (`KomIgangCard.tsx:46-76`, `CHECKLIST_TOTAL = 4`); Swedish from Docs-locked `UI.komIgang*` |
| Home-only (no empty-builder duplicate) | **PASS / in-scope** | No Kom igång on Passbyggaren; SHIPPED deviation matches checklist “Home primary / approved empty-builder alternate” — Home primary is enough; empty-builder duplicate absence is **not FAIL** per task scope |
| Checklist dismiss persists across reload | **PASS (code) / PARTIAL (reload UI)** | `dismissChecklist` → `checklistDismissed:true` saved to tips key (`coachTips.ts:113-118`); card returns `null` when dismissed (`KomIgangCard.tsx:41`); reload path = `loadCoachTips()` on App mount (`App.tsx:37`) — live reload not exercised here |
| Steps navigate when preconditions met; soft hint when not | **PASS (code)** | Steps call `onStep` → Home `handleStep`: chooseOrBuild scrolls/focuses cards; addActivities → builder; openHall/openGolvklart call App openers that return false without items → Swedish `flashHint` (`Home.tsx:49-72`); buttons `disabled` + `title` with `komIgangNeedActivity` / `komIgangNeedHall` (`KomIgangCard.tsx:64-74,119-122`) |
| Auto-progress heuristics | **PASS** | `syncChecklistHeuristics` from draft / itemCount / placements / opened flags (`coachTips.ts:185-218`); App sync during render (`App.tsx:50-59`); hall/golvklart open marks flags (`:106-125,:156-164`) |
| Passbyggaren empty/first-visit tip | **PASS** | `tip-builder-empty` strip when empty **or** first visit (`SessionBuilder.tsx:211-218`); `showFirstVisitTip` from `!builderFirstVisitSeen` (`:75`) |
| Tips tab / EMPTY_TIPS / topBarHelp retained | **PASS** | `topBarHelp` still rendered (`SessionBuilder.tsx:210`); `openPanel('tips')` (`:281`); `LibraryPanel` Tips tab + `TIPS_TAB` (`LibraryPanel.tsx:54,112-117`); `EMPTY_TIPS` in `BlockCard.tsx:46` |
| Hallöversikt placement tip | **PASS** | `tip-hall-place` in edit tray (`HallBoard.tsx:405-411`) |
| Hall flow/Golvklart tip | **PASS** | `tip-hall-flow-golvklart` in edit header (`HallBoard.tsx:312-318`); `UI.tipHallFlowGolvklart` === `UI.hallFloorCoachTip` (Docs-aligned) |
| Optional Erfaren tip | **PASS (shipped)** | `tip-experienced-safety` on experienced detail (`ActivityDetail.tsx:84-94`); optional absence would not FAIL — present |
| **Visa tips igen** restores checklist + tips | **PASS (code)** | Home link + footer button (`Home.tsx:136-143`, `App.tsx:220-226`); `resetTipsVisibility`; feedback `Tips visas igen` / `Tips syns redan` |
| Swedish vocabulary; no aktiva/elever/session UI labels | **PASS** | 29/29 Docs table keys match `blockMeta` UI strings; `aktiva`/`elever` absent from `blockMeta`; `session` only as TypeScript type/module names, not product labels |
| Tips hidden in print / not in Golvklart floor | **PASS (code) / PARTIAL (print preview)** | Tip chrome `no-print` class (`CoachTipStrip.tsx:48`, `KomIgangCard.tsx:80`); `@media print` hides `.kom-igang`, `.coach-tip-strip`, `.visa-tips-igen`, `.no-print` (`App.css:2041+`); hall tips only in **edit** branch (`isFloor ? floorHeader : editHeader`; tray `{!isFloor && …}`) — absent from Golvklart floor UI |

---

## 3. Phone (~390px) — code only

| Check | Verdict | Evidence |
| --- | --- | --- |
| Checklist / dismiss / Visa tips igen ≥44px primary | **PASS (code) / PARTIAL (device)** | `.kom-igang-dismiss`, `.kom-igang-step-btn`, `.kom-igang-alt-dismiss`, `.visa-tips-igen`, `.coach-tip-strip-dismiss` all `min-height: 44px` (`App.css:120-344`); footer `.footer-visa-tips { min-height: auto }` — slightly weaker than Home link |
| Tip strip does not permanently cover Ej placerade tray | **PARTIAL (UI risk)** | `tip-hall-place` is **inside** sticky tray (`HallBoard.tsx:405-411`), not a fixed overlay; tray height still measured via ResizeObserver for canvas padding — live @390 whether tip + list remain reachable **not** verified |
| Home primary cards reachable | **PASS (code)** | Cards after Kom igång in normal flow (`Home.tsx:100+`); no modal trap |

---

## 4. Technical / scope guard

| Check | Verdict | Evidence |
| --- | --- | --- |
| Footer **Träningsplaneraren · Slice 09** | **PASS** | `App.tsx:215`; dist contains string |
| `npm run build` succeeds | **PASS** | exit 0 (above) |
| No new drills / library content for onboarding | **PASS** | Still **28** seed activity ids; **2** `experiencedCoachOnly: true`; tip only echoes safety copy |
| No CAD, exact m, share links, PDF lib, auth/signup, email drip, paywall, video tour | **PASS** | `package.json` deps = react/react-dom only; no jspdf/html2canvas/signup/paywall/video-tour hits in `src/`; print still `window.print` |
| No new App route | **PASS** | `View = 'home' \| 'builder' \| 'hall'` only; inline card/strips |
| Out-of-scope absences (video tour, signup, library/CAD, new progressions, Kom igång on empty Passbyggaren) | **N/A — must not FAIL** | Per checklist scope guard + task; Home-only Kom igång is preferred SHIPPED path |

---

## 5. Regression 01–08 (code spot-check)

| Slice | Verdict | Evidence |
| --- | --- | --- |
| **01** Passbyggaren | **PASS (code)** | Home Nytt/mall/Fortsätt; five `BLOCK_ORDER`; save utkast toast; Tips tab; `EMPTY_TIPS`; `topBarHelp` |
| **02** Phone builder | **PASS (code)** | Narrow MQ / library-tips sheets retained in `SessionBuilder` |
| **03** Library | **PASS (code)** | 28 drills; 2 Erfaren; warnings intact + optional tip additive |
| **04** Icons | **PASS (code)** | `VisualIcon` still used in cards/chips/detail |
| **05** Hallöversikt | **PASS (code)** | CTA guard empty pass; tray; caption `Schematisk hall — inte exakt mått` |
| **06** Presets/snap | **PASS (code)** | `standard-trupp` / `tavling-linjer` / `liten-hall`; snap hint retained |
| **07** Flow/Golvklart | **PASS (code)** | Station order; flow toggle; Golvklart; print path; floor tips hidden |
| **08** Polish | **PASS (code)** | No `Placering sparad` / `hallPlacementSaved` in active UI; sticky tray + Zooma labels; print-only title retained |

---

## 6. Files inspected (Slice 09 surface)

| Path | Role |
| --- | --- |
| `src/lib/coachTips.ts` | Tips persistence API |
| `src/components/KomIgangCard.tsx` | Checklist card |
| `src/components/CoachTipStrip.tsx` | Dismissible tip chrome |
| `src/components/Home.tsx` | Kom igång + Visa tips igen |
| `src/components/SessionBuilder.tsx` | `tip-builder-empty` + retained Tips/`topBarHelp` |
| `src/components/HallBoard.tsx` | Hall tip strips; Golvklart hide |
| `src/components/ActivityDetail.tsx` | Erfaren tip |
| `src/App.tsx` | Wiring, footer Slice 09, restore |
| `src/data/blockMeta.ts` | Locked Swedish strings |
| `src/App.css` | Kom igång / tip / print hide / 44px |
| `src/lib/session.ts` | Draft key unchanged |

---

## 7. Checklist row map (code verifier)

### Product / UX

| Result | Check |
| --- | --- |
| **PASS (code)** | No multi-step blocking tour on first open |
| **PASS** | Kom igång checklist visible (Home primary) with 3–4 Swedish steps |
| **PASS (code) / PARTIAL (reload)** | Checklist dismiss hides card and survives reload |
| **PASS (code)** | Steps link/navigate when preconditions met; soft hint when not |
| **PASS** | Passbyggaren shows dismissible empty/first-visit tip (Tips tab / EMPTY_TIPS kept) |
| **PASS** | Hallöversikt shows dismissible placement tip |
| **PASS** | Hallöversikt shows dismissible flow/Golvklart tip |
| **PASS (code)** | Visa tips igen restores checklist + tips |
| **PASS** | Vocabulary lock (gymnaster/pass/övning/Hallöversikt/Golvklart/Erfaren) |
| **PASS (code) / PARTIAL (print)** | Tips hidden in print / do not dominate Golvklart floor |

### Data / persistence

| Result | Check |
| --- | --- |
| **PASS** | Tips state in `gymnastics-planner-tips-v1` |
| **PASS** | Draft key still `gymnastics-planner-draft-v1` |
| **PASS** | Clearing tips does not delete session items / placements |
| **PASS** | Tip ids stable |

### Phone

| Result | Check |
| --- | --- |
| **PASS (code) / PARTIAL (device)** | ≥44px primary targets |
| **PARTIAL** | Tip strip vs Ej placerade tray (inside tray — live reachability unchecked) |
| **PASS (code)** | Home primary cards reachable |

### Technical / scope

| Result | Check |
| --- | --- |
| **PASS** | Footer **Träningsplaneraren · Slice 09** |
| **PASS** | `npm run build` succeeds |
| **PASS** | No new drills / library edits for onboarding |
| **PASS** | No CAD / auth / paywall / video tour / etc. |
| **PASS** | No new App route |

### Regression 01–08

All **PASS (code)** per §5.

---

## Sign-off (code pass)

| Role | Name | Date (Europe/Stockholm) | Outcome |
| --- | --- | --- | --- |
| Verifier (code) | executor subagent | 2026-09-24 10:59 CEST | **PASS (code)** — no locked-rule FAIL found |
| Notes | | | UI/browser still needed for dismiss→reload, Visa tips igen live restore, print preview, and phone tray with tip strip |

---

## Lean verdict

**PASS (code)** — build exit 0; tips key + ids + restore isolated from draft; Kom igång Home 4 Swedish steps with soft-disable; three required tip surfaces (+ Erfaren shipped); Tips/EMPTY_TIPS/topBarHelp retained; Visa tips igen on Home + footer; print/`no-print` + Golvklart edit-only tips; footer exact Slice 09; Docs Swedish 29/29; scope guard clean; regression 01–08 spot-check green.

### UI risks (not code FAILs)

1. **Kom igång dismiss → reload** — persistence coded; live reload not exercised.  
2. **Tip surfaces** — wiring present; visual polish / redundancy with always-on hall one-liners not UI-glanced.  
3. **Visa tips igen** — Home + footer restore path coded; live feedback not clicked.  
4. **Print hide** — CSS + `no-print` + floor branch hide coded; print-preview not run.  
5. **Phone tray** — `tip-hall-place` lives inside sticky tray; whether tip + list stay fully reachable @~390px **not covered**.
