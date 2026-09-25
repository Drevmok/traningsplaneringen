# Slice 09 — Onboarding / coach tips specification pack

**App:** Träningsplaneraren  
**Date drafted:** 2026-09-24 (Europe/Stockholm)  
**Status:** **APPROVED by Christoffer 2026-09-24**

## Goal

Help a **new coach** find the next useful step without a blocking tour. Ship a dismissible **Kom igång** checklist on Home (or empty Passbyggaren) plus short contextual coach tips in Passbyggaren and Hallöversikt. Persist dismissals locally. Keep the app immediately usable on first open.

Audience lock remains: intuitive for coaches who have never planned a pass in this app.

## Brief audit (extend, do not duplicate)

| Surface today | What exists | Slice 09 response |
|---|---|---|
| **Home** | Invite: *Börja med en mall…*; cards Nytt pass / mall / Fortsätt. No checklist. | Add dismissible **Kom igång** card; keep existing invite. |
| **Passbyggaren** | Top-bar help: *Ny som tränare? Börja från en mall*; per-block `EMPTY_TIPS`; **Tips** side-tab (`TIPS_TAB`). | Keep block empty tips + Tips tab. Add one thin contextual strip/popover for empty / first visit; do not replace Tips tab. |
| **Hallöversikt** | Static hints: `hallDragHint`, `hallSnapHint`, `hallStationOrderHint`, `hallCoachTip`, `hallPresetCoachTip`. `hallFloorCoachTip` exists in `UI` but is **not wired** in HallBoard. | Promote/wire dismissible tip strips for placement / flow / Golvklart; reuse wording where it already matches. |
| **Persistence** | Draft only: `gymnastics-planner-draft-v1`. No tip dismiss map. | Additive tips map (prefer adjacent key `gymnastics-planner-tips-v1`; draft-key additive OK if simpler). |
| **Drill library / Erfaren** | Safety copy on experienced drills already in library + hall badge. | Optional one tip reinforcing Erfaren safety — **no** new technique progressions, no library edits. |

## In scope

- **Kom igång** checklist card (3–4 steps, Swedish), dismissible, with progress via local flags.
- Checklist step links/navigation into Passbyggaren, library/add flow, Hallöversikt, Golvklart when reachable.
- Contextual tip strips or “i” popovers in Passbyggaren (empty/first visit) and Hallöversikt (placement / flow / Golvklart).
- Optional experienced-drill tip reinforcing existing safety language only.
- **Dismiss forever** per tip + light **Visa tips igen** (Home or footer/help).
- Seed Swedish copy in this pack for Docs polish.
- Footer label update to **Träningsplaneraren · Slice 09** when the slice ships (same pattern as Slice 08).

## Out of scope

- Multi-step modal / product-tour wizard that blocks the app
- Video tour, account signup, email drip, blocking paywall
- Changing the drill library (titles, howTo, watchFor, difficulty, Erfaren rules)
- CAD, exact measurements, new hall presets/zones, hall reorder, share links, PDF export machinery
- New backend, auth, or cloud sync for tips
- Rewriting Slice 01 block empty tips or Tips tab content wholesale
- Inventing new technique progressions or coaching curricula

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Goal, audit, in/out, pack index, acceptance |
| [`decisions.md`](./decisions.md) | Locked decisions A–F + rejected alternatives |
| [`data-model.md`](./data-model.md) | Tip ids, checklist progress, dismiss persistence shape |
| [`screen-spec-onboarding.md`](./screen-spec-onboarding.md) | Kom igång card, tip placements, dismiss / show again |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier PASS/FAIL + scope guard + regression 01–08 |
| [`content/coach-tips.sv.md`](./content/coach-tips.sv.md) | Seed Swedish strings for Docs |

## Acceptance for Christoffer (product owner)

Approve this draft when these seven statements are locked:

1. **Kom igång:** Home (or empty Passbyggaren) shows a dismissible checklist of 3–4 Swedish steps that link into the right views when possible; progress is local flags only (no backend).
2. **Contextual tips:** Short tip strips or “i” popovers appear in Passbyggaren (empty/first visit) and Hallöversikt (placement / flow / Golvklart); optional Erfaren tip only reinforces existing safety copy.
3. **Dismiss + show again:** Each tip (and the checklist) can be dismissed forever; a light **Visa tips igen** control restores them; dismissals persist in local storage (`gymnastics-planner-tips-v1` or additive on the draft key).
4. **Swedish tone:** All new UI copy is Swedish, warm and short, coach-to-coach, using **gymnaster**, **pass**, **övning**, **Hallöversikt**, **Golvklart**, **Erfaren**.
5. **No blocking wizard:** First open never requires a multi-step modal; the app is usable immediately with or without the checklist/tips.
6. **No library / CAD changes:** Drill library content, hall geometry/presets/snap, and CAD/measurement features are untouched.
7. **Regression:** Slices 01–08 behavior (Passbyggaren, 28 drills, icons, Hallöversikt zones/snap/presets, stationsordning/flow, Golvklart/print, polish) remains intact.

**Approval flow:** Christoffer approves this pack → Docs may polish Swedish strings → Builder implements without changing these locked decisions → Verifier records PASS/FAIL in [`verification-checklist.md`](./verification-checklist.md).
