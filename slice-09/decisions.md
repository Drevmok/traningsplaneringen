# Slice 09 — locked decisions

**App:** Träningsplaneraren  
**Status:** **APPROVED by Christoffer 2026-09-24**
**Source:** Planner product locks (Onboarding / coach tips) + audit of Home / Passbyggaren / Hallöversikt.

Implementation may choose the smallest safe UI pattern (card vs strip vs “i” popover), but must not reopen the locks below.

---

## A. Thin first-run — not a product tour wizard

- First open must **not** present a multi-step modal, carousel, or forced tour that blocks Home or Passbyggaren.
- Prefer a dismissible **Kom igång** card on **Home** (primary). If Home space is too tight on phone, the same card may also appear once on an **empty Passbyggaren** — never both at once after dismiss.
- Contextual tips are optional chrome: strip under header, tray help area, or a small “i” control. They never trap focus or require completing a sequence to continue.
- Coaches who dismiss everything still get full Slice 01–08 functionality.

## B. Kom igång checklist (3–4 steps)

Swedish steps (seed; Docs may polish wording, not order/intent):

1. **Välj eller bygg ett pass** — navigate to Nytt pass / mall / Fortsätt when available.
2. **Lägg till övningar i blocken** — open Passbyggaren (and optionally focus Bibliotek).
3. **Öppna Hallöversikt och placera** — navigate to Hallöversikt when the pass has ≥1 övning; otherwise explain that an övning is needed first (reuse existing disabled-CTA language).
4. **Använd Golvklart på golvet** — enter Golvklart from Hallöversikt when reachable; otherwise soft-disable with a short hint.

Progress = local boolean flags per step (and/or auto-detect from existing draft: has session items, has placements, has opened Golvklart once). **No backend.** Completing a step by doing the action in-app should mark it done even without tapping the checklist row.

## C. Contextual coach tips

Required placements:

| Id (see data-model) | Where | Purpose |
|---|---|---|
| `tip-builder-empty` | Passbyggaren empty / first visit | Orient: mall or lägg till övning; point to Tips tab without replacing it |
| `tip-hall-place` | Hallöversikt edit | Placement / snap / schematic (extend existing `hallCoachTip` / snap hints) |
| `tip-hall-flow-golvklart` | Hallöversikt (near flow / Golvklart) | Stationsordning + Golvklart purpose (wire/adapt `hallFloorCoachTip`) |

Optional:

| Id | Where | Purpose |
|---|---|---|
| `tip-experienced-safety` | Near Erfaren badge or experienced activity detail | Reinforce existing safety — do **not** invent new progressions |

Existing Slice 01 `EMPTY_TIPS`, `TIPS_TAB`, and static hall hints **stay**. Slice 09 tips are additive dismissible chrome, not a rewrite of those strings.

## D. Dismiss forever + Visa tips igen

- Each tip id and the Kom igång card have independent dismiss.
- Dismiss = forever for that browser profile until **Visa tips igen**.
- **Visa tips igen** is light: Home footer area, or a discreet help/footer link near the app footer — not a settings product.
- Persist in localStorage:
  - **Preferred:** dedicated key `gymnastics-planner-tips-v1` (keeps draft payload clean).
  - **Allowed:** additive `coachTips` (or equivalent) map on/near `gymnastics-planner-draft-v1` if Builder finds that simpler — must not break draft load/save or Slice 01–08 fields.
- Clearing tips storage must not delete the session draft.

## E. Swedish only — voice

- All new user-facing strings: Swedish.
- Tone: warm, short, coach-to-coach (see `docs/voice-and-style.md` + club terms).
- Locked vocabulary: **gymnaster**, **pass**, **övning**, **Hallöversikt**, **Golvklart**, **Erfaren**, **Passbyggaren**, **Kom igång**, **Visa tips igen**.
- Docs will polish seed copy in `content/coach-tips.sv.md`; Builder may ship seed until Docs lands.

## F. Explicit non-goals

- No video tour, no account signup, no email drip, no blocking paywall.
- No changes to drill library content or Erfaren selection rules.
- No CAD, meters, new hall geometry, share links, or PDF libraries.
- Footer becomes **Träningsplaneraren · Slice 09** when shipped; do not rewrite historical slice docs.

---

## Rejected alternatives

| Alternative | Decision |
|---|---|
| Multi-step modal / spotlight product tour | Rejected: blocks app; fails new-coach “open and use” goal. |
| Force checklist completion before Hallöversikt / Golvklart | Rejected: soft guidance only. |
| Replace Tips tab or EMPTY_TIPS with onboarding copy | Rejected: those are coaching content; onboarding is navigation chrome. |
| Server-synced tips / accounts | Rejected: local-only MVP. |
| Video / GIF tour overlays | Rejected: out of scope; offline-friendly text only. |
| Email drip or paywall gate | Rejected: not this product. |
| New drill progressions in tip copy | Rejected: safety tip may only echo existing Erfaren language. |
| Rewrite hall caption or change snap/presets | Rejected: Slice 05–08 regression locks. |
| English UI for tips | Rejected: Swedish only. |

## Constraints carried from Slices 01–08

- App: **Träningsplaneraren**; athletes: **gymnaster**; session: **pass**.
- Blocks: Samling → Uppvärmning → Teknik → Styrka → Lek och spel.
- Draft key `gymnastics-planner-draft-v1` remains the session source of truth.
- Hallöversikt entry from Passbyggaren; CTA disabled with Swedish hint when pass empty.
- Caption **Schematisk hall — inte exakt mått**; Golvklart read-only; stationsordning follows pass; Erfaren safety treatment remains.
- Phone targets ≥44px; offline / no CDN for core flows.
- 28 drills + icons unchanged.

## Approval state

- [x] Christoffer approves the seven acceptance bullets in `README.md`.
- [x] Docs may polish `content/coach-tips.sv.md` without changing locks A–F.
- [x] Builder implements only the approved scope.
- [x] Verifier uses `verification-checklist.md` and records PASS/FAIL.
