# Slice 19 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-25** — Christoffer approved 2026-09-25 via Planner lock widget; A–F locked  
**Direction:** Hall — Använd alla förslag (Scout / backlog idea Approved 2026-09-25; pack locked)

Idea is **Approved** and this pack is **In flight**. Locked answers below are authoritative for Docs, Builder, and Verifier.

## A. What Slice 19 adds

**Decision rationale:** Add one bulk-accept CTA on Hallöversikt **edit** chrome so coaches can persist every unset Teknik seed in one tap. Reuse the existing per-station Använd förslag persist path. No seed table changes; no floor/print promotion without save.

| Surface | Slice 19 change? |
|---|---|
| Hallöversikt **edit** chrome | **Yes** — secondary CTA **Använd alla förslag** |
| Hallöversikt **Golvklart** (floor) chrome | **No** — CTA edit-only |
| Per-station Använd förslag / Klar / unset vs `[]` | **No** — same single-station UX |
| Persist path | **Reuse** `updateItemStationEquipment` (same as Använd förslag) |
| Golvklart / print / Förrådslista | **Indirect** — still saved-only; update after CTA persists |
| Equipment library (10 pieces) | **No** |
| `seedActivities.ts` seeds | **No** — Slice 18 already seeded all nine Teknik |
| Passbyggaren / Home / Kom igång | **No** compose entry; Kom igång still keys off **saved** composition |
| Hall detail Redigera redskap | **No** required redesign |

**Rejected (standing):** CAD pins / Passbyggaren compose / canvas badge / custom library.  
**Rejected (this pack):** Auto-apply on place; promoting förslag onto Golvklart / Förrådslista without Klar / Använd förslag / this CTA; changing caption.

---

## DECISION RATIONALE — locked A–F

### A. CTA placement?

**Lock A: Hallöversikt edit chrome — secondary button near existing hall actions** (`.hall-header-actions` beside Visa/dölj flöde + Förrådslista; primary remains **Golvklart**). Not inside each markör sheet; not on Golvklart floor chrome; not on Passbyggaren.

**Why:** Matches coach intent (“accept all on this pass layout”) without burying the action in N detail sheets. Floor mode is for showing the group — bulk compose belongs in edit.

**Alternatives considered (not locked):**

| Option | Placement | Note |
|---|---|---|
| **A1 (locked)** | Edit chrome secondary near hall actions | Locked |
| **A2** | Edit chrome below canvas / near tray | If header is too crowded on ~390px |
| **A3** | Inside a single “bulk” sheet opened from edit | Extra tap — slower than one-tap goal |
| **A4** | Also on Golvklart | Rejected — floor is show mode; compose is edit |

---

### B. Confirm UX?

**Lock B: Apply immediately on tap + one-line Swedish result** — e.g. “Sparade redskap på N stationer” (`role="status"` toast or light banner). If N=0 after an edge race (all became saved/`[]` between enable check and tap), soft no-op message. **No** `window.confirm` / in-sheet confirm.

**Why:** Action is reversible via **Redigera redskap** per station; confirm slows the core benefit. Existing patterns: SessionBuilder `.toast`; HallBoard `hall-unplaced-banner` with `role="status"`.

**Alternatives considered (not locked):**

| Option | UX | Note |
|---|---|---|
| **B1 (locked)** | Immediate apply + result line | Locked — speed |
| **B2** | In-sheet / light confirm first, then apply | Explicit confirm (not chosen) |
| **B3** | Immediate apply, no feedback | Worse — coach may miss that N stations changed |
| **B4** | Browser `confirm` | Avoid — inconsistent with Swedish in-app voice |

---

### C. Which stations get applied?

**Lock C: Only placed Teknik items where `stationEquipment === undefined` (unset) and `activity.defaultStationEquipment` is non-empty.** Skip: already-saved (defined non-empty or any defined saved list); `[]` cleared; empty/no seed; non-Teknik; unplaced Teknik.

**Why:** Mirrors per-station Använd förslag eligibility; preserves Slice 13 unset vs `[]`; does not invent composition for stations the coach has not placed.

**Eligibility checklist (per SessionItem):**

1. Item is in `placeableItems` (Teknik) **and** has a hall placement  
2. `item.stationEquipment === undefined`  
3. `getActivityById(item.activityId)?.defaultStationEquipment` is a non-empty array  
4. Else skip

**Alternatives considered (not locked):**

| Option | Scope | Note |
|---|---|---|
| **C1 (locked)** | Placed Teknik + unset + non-empty seed | Locked |
| **C2** | Also unplaced Teknik with seeds | Rejected — Golvklart/hall show placed layout; unplaced not on floor |
| **C3** | Overwrite saved with seed | Rejected — would clobber coach Klar edits |
| **C4** | Re-apply onto `[]` | Rejected — `[]` means coach cleared |

---

### D. Docs surface?

**Lock D: Thin Swedish strings in `docs/hall-oversikt-copy.sv.md`** (or a thin new file if Docs prefers, e.g. `docs/anvand-alla-forslag.sv.md`) for: CTA label, result string with `{n}`, optional disabled/empty aria/title, optional N=0 soft message. **No** new required tip for PASS. Cross-link from `docs/station-compose.sv.md` in one sentence if useful.

**Why:** Hallöversikt chrome already lives in hall-oversikt-copy; compose semantics stay in station-compose. Slice is chrome + bulk persist, not new tip choreography.

**Alternatives considered:** New tip (`tipAnvandAllaForslag`) — soft optional, not required for PASS; skip docs update (weaker for Verifier / future Scout).

---

### E. Footer?

**Lock E: `Träningsplaneraren · Slice 19`**

---

### F. Scope guards?

**Lock F:**

- **No** auto-apply förslag on place  
- **No** promoting förslag onto Golvklart / Förrådslista / print without this CTA / Klar / Använd förslag  
- **No** Passbyggaren compose  
- **No** canvas badge / CAD pins  
- **No** library growth  
- **No** Netlify in pack  
- Caption **Schematisk hall — inte exakt mått** unchanged  
- Preserve Slices 11–18 behavior otherwise (Teknik-only placeable; quiet redskap; Förrådslista saved-only; Kom igång; Golvklart short titles; unset vs `[]`; per-station Använd förslag)

---

## Locked summary

| # | Lock |
|---|---|
| A | Edit chrome secondary CTA near hall actions — not markör sheet, not Golvklart, not Passbyggaren |
| B | Immediate apply + one-line “Sparade redskap på N stationer”; soft no-op if N=0; no browser confirm |
| C | Only placed Teknik with unset + non-empty seed; skip saved and `[]` |
| D | Thin Docs Swedish strings (CTA + result); no required tip |
| E | Footer `Träningsplaneraren · Slice 19` |
| F | No auto-apply on place; no promote without CTA/Klar/Använd förslag; no Passbyggaren compose; no badge/CAD; no library growth; no Netlify; caption Schematisk hall — inte exakt mått unchanged; preserve 11–18 |

---

## LOCKED ANSWERS — A–F

**Lock:** Christoffer approved via Planner lock widget on 2026-09-25. These answers are authoritative for Builder, Docs, and Verifier.

### A. CTA placement

**Lock:** Hallöversikt **edit** chrome secondary CTA near existing hall actions — not markör sheet, not Golvklart, not Passbyggaren.

### B. Confirm UX

**Lock:** Immediate apply + one-line “Sparade redskap på N stationer”; soft no-op if N=0; no confirm.

### C. Which stations

**Lock:** Only placed Teknik with unset + non-empty seed; skip saved and `[]`.

### D. Docs surface

**Lock:** Thin Docs Swedish strings (CTA + result) in `docs/hall-oversikt-copy.sv.md` (or thin new file); no required tip.

### E. Footer

**Lock:** `Träningsplaneraren · Slice 19`.

### F. Scope guards

**Lock:** No auto-apply on place; no promote without CTA/Klar/Använd förslag; no Passbyggaren compose; no badge/CAD; no library growth; no Netlify; caption **Schematisk hall — inte exakt mått** unchanged; preserve Slices 11–18.

## Carry-forwards (unchanged — hard locks)

- Placeable = Teknik only  
- Caption: **Schematisk hall — inte exakt mått**  
- Compose = hall detail **Redigera redskap** only  
- Fixed ~10-piece library  
- No canvas equipment badge; no CAD pins  
- Slice 13 unset vs `[]` + Använd förslag / Klar intact  
- Slice 14 quiet redskap rules intact  
- Slice 15 Förrådslista intact (saved composition only)  
- Slice 16 Kom igång intact (saved composition for progress)  
- Slice 17 Golvklart short titles intact  
- Slice 18 nine Teknik seeds intact (no seed-table work in 19)  
- gymnaster / pass / Swedish UI  
- Device-local drafts; no accounts / cloud  
- **Netlify out of this pack**
