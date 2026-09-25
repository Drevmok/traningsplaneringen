# Verification checklist — Slice 09 (Onboarding / coach tips)

**Slice passes when** a new coach sees a dismissible **Kom igång** checklist and short contextual tips, can dismiss them forever and restore via **Visa tips igen**, all in Swedish — without a blocking wizard, without library/CAD changes, and without regressing Slices 01–08.

Use this checklist as sole Slice 09 authority after Christoffer approval.

**Status:** **APPROVED by Christoffer 2026-09-24**
**Verifier:** record PASS/FAIL per row when implementing is done.

---

## Locked pass/fail rules

- **No blocking wizard:** Fail if first open requires a multi-step modal/tour before using Home or Passbyggaren.
- **Kom igång:** Fail if checklist missing on Home (or approved empty-builder alternate), or if steps are not Swedish, or if there are fewer than 3 / more than 4 primary steps, or if dismiss does not hide it across reload.
- **Navigation:** Fail if checklist steps that claim to navigate never attempt the matching view when the preconditions are met (e.g. Hallöversikt with ≥1 övning). Soft-disabled with Swedish hint when preconditions unmet is PASS.
- **Contextual tips:** Fail if Passbyggaren empty/first-visit tip **and** Hallöversikt placement tip **and** flow/Golvklart tip are all missing (minimum three required tip surfaces). Optional Erfaren tip absence is not FAIL.
- **Dismiss + restore:** Fail if tip dismiss does not persist across reload, or if **Visa tips igen** is missing / does not restore dismissed tips + checklist.
- **Swedish:** Fail if new onboarding chrome is English-only or uses forbidden athlete/session terms (aktiva/elever/session as UI labels).
- **Persistence:** Fail if tips require a backend, or if tips storage breaks draft load (`gymnastics-planner-draft-v1`).
- **Print:** Fail if Kom igång / tip strips appear in Golvklart print output.
- **Scope guard:** Absence of video tour, signup, email drip, paywall, new drills, CAD — must **not** cause FAIL. Presence of those as new work → FAIL.
- **Regression:** Slice 01–08 behaviors below must still PASS.

---

## Product / UX

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | No multi-step blocking tour on first open |
| [ ] PASS [ ] FAIL | **Kom igång** checklist visible (Home primary) with 3–4 Swedish steps |
| [ ] PASS [ ] FAIL | Checklist dismiss hides card and survives reload |
| [ ] PASS [ ] FAIL | Steps link/navigate when preconditions met; soft hint when not |
| [ ] PASS [ ] FAIL | Passbyggaren shows dismissible empty/first-visit tip (does not remove Tips tab / EMPTY_TIPS) |
| [ ] PASS [ ] FAIL | Hallöversikt shows dismissible placement tip |
| [ ] PASS [ ] FAIL | Hallöversikt shows dismissible flow/Golvklart tip (or wired `hallFloorCoachTip` equivalent) |
| [ ] PASS [ ] FAIL | **Visa tips igen** restores checklist + tips |
| [ ] PASS [ ] FAIL | Vocabulary: gymnaster, pass, övning, Hallöversikt, Golvklart, Erfaren as applicable |
| [ ] PASS [ ] FAIL | Tips hidden in print / do not dominate Golvklart floor view |

## Data / persistence

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Tips state in `gymnastics-planner-tips-v1` **or** additive compatible `coachTips` on draft path |
| [ ] PASS [ ] FAIL | Draft key still `gymnastics-planner-draft-v1`; old drafts load |
| [ ] PASS [ ] FAIL | Clearing/dismissing tips does not delete session items or hall placements |
| [ ] PASS [ ] FAIL | Tip ids stable (`tip-builder-empty`, `tip-hall-place`, `tip-hall-flow-golvklart`, …) |

## Phone (~390px)

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Checklist / dismiss / Visa tips igen targets usable (≥44px primary) |
| [ ] PASS [ ] FAIL | Tip strip does not permanently cover Ej placerade tray |
| [ ] PASS [ ] FAIL | Home primary cards remain reachable |

## Technical / scope guard

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Footer reads **Träningsplaneraren · Slice 09** when slice ships |
| [ ] PASS [ ] FAIL | `npm run build` succeeds |
| [ ] PASS [ ] FAIL | No new drills / library content edits for onboarding |
| [ ] PASS [ ] FAIL | No CAD, exact m, share links, PDF library, auth/signup, email drip, paywall, video tour |
| [ ] PASS [ ] FAIL | No new App route required (inline card/strips OK) |

## Regression (Slices 01–08)

| Slice | Result | Check |
|---|---|---|
| **01 — Passbyggaren** | [ ] PASS [ ] FAIL | Home → Nytt/mall/Fortsätt; five blocks; save utkast; Tips tab; EMPTY_TIPS |
| **02 — Phone builder** | [ ] PASS [ ] FAIL | Builder usable ~390px; library/tips sheets |
| **03 — Library** | [ ] PASS [ ] FAIL | 28 drills still present; Erfaren warnings intact |
| **04 — Icons** | [ ] PASS [ ] FAIL | VisualIcon / activity icons unchanged |
| **05 — Hallöversikt** | [ ] PASS [ ] FAIL | CTA guard empty pass; tray; schematic caption lock |
| **06 — Presets/snap** | [ ] PASS [ ] FAIL | Three presets; zone snap; free open |
| **07 — Flow/Golvklart** | [ ] PASS [ ] FAIL | Station order; flow toggle; Golvklart; print path |
| **08 — Polish** | [ ] PASS [ ] FAIL | Silent placement save; phone tray reachability; Swedish zoom labels; print one title |

## Sign-off

| Role | Name | Date (Europe/Stockholm) | Outcome |
|---|---|---|---|
| Verifier | | | [ ] PASS [ ] FAIL |
| Notes | | | |

**FAIL requires:** short note of which locked rule broke + screenshot path if UI.
