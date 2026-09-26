# Slice 26 — decisions (APPROVED 2026-09-26 · locked A–F)

**Status:** **APPROVED 2026-09-26** — A1/B1/C1/D1/E1/F1 locked via Planner.  
Docs may start only after Slice 25 Docs. Builder after Docs. Verifier only after Planner ping.  
**Direction:** Kom igång `openHallAndPlace` auto-progresses only on real placement (`placementCount >= 1`); legacy checked open-only steps stay checked; soft — never block Hall/Golvklart.

Christoffer (2026-09-26 via Planner) approved Scout leftover #2 and locked A1/B1/C1/D1/E1/F1. This pack is approved; Slice 25 stays a separate pack and Docs precedes this pack.

## Locked A–F

| # | Lock | Meaning |
|---|---|---|
| A | **A1** | Auto-progress `openHallAndPlace` only when `placementCount >= 1`; stop bare `openedHall` credit; soft — no nav block |
| B | **B1** | Legacy: leave already-true `openHallAndPlace` as-is; new advances via placement only; `openedHall` may still be set but must not alone check the step |
| C | **C1** | Docs clarify “placera” = on-hall if needed; no tip strip; thin living Kom igång docs |
| D | **D1** | Thin Docs for step wording only; no Hall saknar banner (Slice 25) |
| E | **E1** | Footer `Träningsplaneraren · Slice 26` |
| F | **F1** | No placeable-set / compose-entry / drafts change; no saknar banner; no library/CAD/cloud; no Pages unless asked; preserve 19–25 (or through 24 if 26 ships first — don’t absorb 25) |

---

## A. What Slice 26 touches

| Surface | Slice 26 change? |
|---|---|
| Kom igång checklist — `openHallAndPlace` heuristic | **Yes** — placement-only auto-progress (A1) |
| `markOpenedHall` / `openedHall` | **Yes** — may still record open; must **not** alone set place step true for new advances (B1) |
| Kom igång step copy | **Maybe** — thin Docs if “placera” needs clarifying (C1) |
| Hall saknar-redskap banner | **Out** — Slice 25 |
| Hall placeable set / compose / Golvklart | **No** |
| Passbyggaren / library / CAD / caption | **No** |

---

## DECISION RATIONALE — locked A–F

### A. When does place step auto-progress?

**Locked A1: Only when `placementCount >= 1`**

- In `syncChecklistHeuristics`, change:
  - **From:** `!checklist.openHallAndPlace && (opts.placementCount >= 1 || state.openedHall)`
  - **To:** `!checklist.openHallAndPlace && opts.placementCount >= 1`
- Soft: do **not** disable Hallöversikt / Golvklart CTAs based on unchecked place step.
- Do **not** require compose / non-empty `stationEquipment` (that’s Slice 16’s separate step).

| Option | Note |
|---|---|
| **A1 (locked)** | Placement-only auto-progress | Matches Scout Approved; teaches real place habit |
| A2 | Keep open-or-place | Reject — Approved idea is to stop open-only credit |
| A3 | Require placement **and** compose | Reject — conflates with Slice 16 compose step |
| A4 | Block Hall open until placed | Reject — soft checklist only |

**Rationale:** Step label already says placera. Open-only credit teaches the wrong habit before Redigera redskap / Använd alla förslag.

**Rejected:** A2/A3/A4.

---

### B. Legacy open-only checked steps?

**Locked B1: Leave already-true as-is; stop new open-only advances**

- If `checklist.openHallAndPlace` is already `true` (including from historical open-only), **do not clear** it on sync.
- `markOpenedHall`: still may set `openedHall: true` for any other use, but **must not** set `openHallAndPlace: true` solely because Hall opened.
- New coaches: opening Hall alone leaves step unchecked; placing ≥1 Teknik checks it (via sync and/or place path).

| Option | Note |
|---|---|
| **B1 (locked)** | Legacy leave-as-is; new = placement only | No regress old coaches |
| B2 | Recompute / clear open-only checked steps | Reject — regresses existing tips state |
| B3 | Keep `markOpenedHall` forcing place step true | Reject — defeats A1 |

**Code symbols:** `markOpenedHall` (not `markHallOpened`) in `coachTips.ts`; callers in `App.tsx` on Hall / Golvklart open paths.

**Rejected:** B2/B3.

---

### C. Copy / chrome?

**Locked C1: Clarify step copy if needed; no tip strip**

- Docs may tighten `komIgangStep3` / `komIgangStep3Hint` so “placera” clearly means on-hall placement (not “öppna”).
- If current copy already sufficient, Docs may leave strings and only touch living docs that describe the heuristic.
- **No** new tip strip.

| Option | Note |
|---|---|
| **C1 (locked)** | Thin clarify if needed; no tip strip | Matches Scout |
| C2 | New tip strip teaching place | Reject — chrome / F1 / Slice 22 |
| C3 | Rename step to require compose | Reject — Slice 16 owns compose |

**Rejected:** C2/C3.

---

### D. Docs surface?

**Locked D1: Thin Docs only**

- Step wording if copy changes; living Kom igång / `docs/kom-igang-redskap.sv.md` heuristic note.
- **No** Hall saknar banner copy (**Slice 25**).

| Option | Note |
|---|---|
| **D1 (locked)** | Thin Kom igång Docs | Enough |
| D2 | Also draft saknar banner Docs | Reject — Slice 25 |
| D3 | No Docs even if copy changes | Reject — Swedish gate if strings change |

Pack placeholder: [`content/`](./content/) — Docs fills after Slice 25 Docs.

---

### E. Footer?

**Locked E1:** `Träningsplaneraren · Slice 26` when Builder ships.

| Option | Note |
|---|---|
| **E1 (locked)** | Footer Slice 26 | Standard |
| E2 | Keep prior footer | Reject — ship marker |

---

### F. Hard non-goals (this pack)?

**Locked F1 — all stand:**

- **No** change to Teknik-only placeable set
- **No** compose entry change (still hall detail **Redigera redskap** only)
- **No** drafts model change
- **No** Hall saknar-redskap banner (**Slice 25** — F1 explicitly excludes)
- **No** Passbyggaren compose; no library growth; no CAD / pins / badge
- Caption unchanged; no accounts / cloud / sync wording
- **No** Netlify / GitHub Pages republish unless Christoffer asks
- Preserve Slice **19–24**; when **25** ships first, preserve it; if **26** ships before 25: preserve through 24 and **do not absorb** 25

| Option | Note |
|---|---|
| **F1 (locked)** | All non-goals above | Keeps pack Kom-igång-heuristic-only |
| F2 | Bundle Slice 25 saknar banner | Reject — different surface (Hall); no auto-bundle |

---

## Open questions (locked answers)

| # | Question | Locked answer |
|---|---|---|
| Q1 | Still set `openedHall` on open? | Yes optional — fine for analytics/other; must not alone advance `openHallAndPlace`. |
| Q2 | Who advances on place — sync only or also placeAt path? | Sync on `placementCount >= 1` is enough; Builder may also mark on successful place if cleaner — either OK; never clear. |
| Q3 | Copy change required? | Docs decides; recommended clarify only if heuristic/docs mismatch confuses. Current `komIgangStep3` already says placera. |
| Q4 | Interaction with Slice 25? | None — F1 excludes saknar banner. |
| Q5 | Ship order vs Slice 25? | Prefer 25 then 26 by numbering; if 26 ships first, preserve through 24 and leave 25 alone. |

---

## Rejected alternatives (brief)

| Rejected | Why |
|---|---|
| A2 keep open-or-place | Defeats Approved idea |
| A3 require compose for place step | Conflates Slice 16 |
| A4 block Hall open | Soft checklist only |
| B2 clear legacy open-only checks | Regress old coaches |
| B3 keep markOpenedHall forcing step | Defeats A1 |
| C2 tip strip | Chrome |
| D2/F2 absorb Slice 25 | Different pack / surface |
