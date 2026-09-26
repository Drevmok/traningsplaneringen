# Slice 24 — decisions (DRAFT · recommended locks)

**Status:** **APPROVED 2026-09-26** — Christoffer approved via Planner lock widget; A–F locked as recommended  
Docs may start. Builder after Docs. Verifier only after Planner ping.
**Direction:** Förråd empty soft path → close sheet and point coach at existing Hall edit **Använd alla förslag** when Slice 19–eligible; else keep today’s empty hint


Christoffer (2026-09-26) approved Scout idea #3; Planner drafted this pack with recommended locks.

## Locked A–F (Christoffer 2026-09-26) 

| # | Rec | Meaning |
|---|---|---|
| A | **A1** | Soft empty CTA only when `rows.length === 0` **AND** `eligibleSuggestedCount ≥ 1`; else today’s empty hint |
| B | **B1** | Close Förråd → Hall **edit** → focus/scroll/highlight existing **Använd alla förslag** (or brief toast pointing at it); no auto-apply |
| C | **C1** | Soft secondary text + ≥44px button; Docs Swedish; no tip strip; no saknar banner; brief toast OK under Slice 22 one-chrome-layer |
| D | **D1** | Thin Docs — soft copy + CTA (+ aria); living Förråd docs; no Home/phone changes |
| E | **E1** | Footer `Träningsplaneraren · Slice 24` |
| F | **F1** | No compose from Förråd; no auto-persist; no saknar / place-heuristic / station-breakdown; no library/CAD/cloud; no republish unless asked; preserve 19 + 22 + 23 |

---

## A. What Slice 24 touches

| Surface | Slice 24 change? |
|---|---|
| Förrådslista sheet — empty state | **Yes** — soft path when eligible (A1) |
| Förrådslista sheet — non-empty list | **No** |
| Förråd open from edit + Golvklart | **Keep** entries; CTA may exit Golvklart → edit (B1) |
| Hallöversikt edit — **Använd alla förslag** | **Point at** existing control; do **not** change eligibility / apply semantics |
| Hall soft saknar-redskap banner | **Out** — stays Proposed |
| Kom igång place heuristic | **Out** — stays Proposed |
| Home / Öppna på telefon | **No** — Slice 23 |
| Passbyggaren / library / CAD / caption | **No** |

---

## DECISION RATIONALE — recommended A–F

### A. When to show the soft path?

**Recommended A1: Only when empty AND eligibleSuggestedCount ≥ 1**

- Gate: Förråd `rows.length === 0` **and** `eligibleSuggestedCount ≥ 1`.
- Pass `eligibleSuggestedCount` (or a derived `showApplyAllSoftPath` boolean) into `ForradslistaSheet` from `HallBoard` (count already computed there).
- Eligibility = same as Slice 19: `eligibleSuggestedStationEquipmentItems` — placed Teknik + unset `stationEquipment` + non-empty seed.
- When empty but **not** eligible: keep `forradslistaEmpty` + `forradslistaEmptyHint` only (per-markör Redigera redskap).
- When non-empty: no soft path (list already useful).

| Option | Note |
|---|---|
| **A1 (recommended)** | Empty **and** eligible → soft CTA; else today’s hint | Avoids dead CTA; matches Scout #3 |
| A2 | Soft CTA whenever empty (even if not eligible) | Reject — dead CTA when apply-all disabled |
| A3 | Auto-run apply-all from Förråd when empty+eligible | Reject — too aggressive / wrong surface |

**Rationale:** Empty packing with eligible unset stations is exactly the population Slice 19 solves. Showing a CTA when count is 0 teaches a broken path. Auto-apply from a read-only packing sheet fights “coach still confirms via Använd alla förslag” and standing quiet-until-saved rules.

**Rejected:** A2/A3 — see table.

---

### B. What the CTA does?

**Recommended B1: Close → Hall edit → point at existing Använd alla förslag; coach taps apply-all**

- On tap:
  1. Close Förrådslista sheet (`onClose` / `setForradOpen(false)`).
  2. Ensure Hall **edit** mode (if opened from Golvklart / floor, exit floor to edit).
  3. Focus / scroll / highlight the existing **Använd alla förslag** control — **or** show a brief soft `role="status"` toast pointing at it (Builder picks one or light combination; keep chrome quiet).
- Do **not** call `handleApplyAllSuggested` / `applyAllSuggestedStationEquipment` from the Förråd CTA.
- Coach still taps **Använd alla förslag** to persist.

| Option | Note |
|---|---|
| **B1 (recommended)** | Close + edit + point; no auto-apply | Soft bridge; preserves Slice 19 confirm surface |
| B2 | Close + auto invoke applyAllSuggested | Reject unless Christoffer insists — aggressive / wrong sheet |
| B3 | Only copy, no CTA | Weaker — Scout Approved a path, not prose alone |

**Rationale:** Förråd stays read-only. Hall edit remains the only surface that bulk-persists seeds. Pointing beats duplicating apply logic or inventing compose from Förråd.

---

### C. Copy / chrome?

**Recommended C1: Soft secondary text + ≥44px button; quiet layering**

- Soft secondary Swedish text under (or replacing emphasis of) the empty body when A1 applies — Docs owns exact wording.
- ≥44×44px secondary button for the CTA.
- Aria / labels reuse the idea of pointing at **Använd alla förslag** (may reference existing `hallApplyAllSuggested` wording; Docs picks keys).
- **No** new coach tip strip for this pack.
- **No** saknar-redskap banner (Proposed — separate).
- If a toast is used after close: keep **brief**; respect Slice 22 one-chrome-layer — toast is status feedback, not a tip strip stacked with multi-line instructional hints.

| Option | Note |
|---|---|
| **C1 (recommended)** | Soft text + button; no tip strip; brief toast OK | Matches Scout + Slice 22 spirit |
| C2 | Tip strip advertising apply-all from Förråd | Reject — new teaching chrome; F1 / Slice 22 |
| C3 | Inline saknar-style count banner inside Förråd | Reject — absorbs Proposed banner; keep separate |

**Rationale:** One soft empty affordance is enough. Do not stack teaching chrome or smuggle the Hall saknar banner into Förråd.

---

### D. Docs surface?

**Recommended D1: Thin Docs**

- Finalize Swedish for soft empty copy + CTA label (+ aria).
- Update living `docs/forradslista.sv.md` (empty-state section) with the eligible soft path; cross-ref `docs/anvand-alla-forslag.sv.md` if useful.
- **No** Home / Öppna på telefon / honesty changes (Slice 23).
- **No** saknar banner copy; **no** new tip strip copy.

| Option | Note |
|---|---|
| **D1 (recommended)** | Thin strings + Förråd living-doc touch-up | Enough for A1/B1/C1 |
| D2 | Rewrite all Förråd + apply-all docs | Reject — scope |
| D3 | No Docs pass | Reject — new visible Swedish needs Docs |

Pack placeholder: [`content/`](./content/) — Docs fills Swedish after lock.

---

### E. Footer?

**Recommended E1:** `Träningsplaneraren · Slice 24` when Builder ships.

| Option | Note |
|---|---|
| **E1 (recommended)** | Footer Slice 24 | Standard |
| E2 | Keep Slice 23 footer | Reject — ship marker |

---

### F. Hard non-goals (this pack)?

**Recommended F1 — all stand:**

- **No** compose / **Redigera redskap** opened from Förråd
- **No** auto-persist seeds from Förråd (no call to apply-all / Klar path from the sheet)
- **No** saknar-redskap banner (stays Proposed — keep separate)
- **No** Kom igång place-heuristic change (stays Proposed)
- **No** Parked Förråd station-breakdown UI
- **No** Passbyggaren compose; no library growth; no CAD / pins / badge
- Caption **Schematisk hall — inte exakt mått** unchanged
- **No** accounts / cloud / sync wording
- **No** Netlify / GitHub Pages republish unless Christoffer asks
- Preserve Slice **19** apply-all semantics, Slice **22** quiet chrome / one chrome layer, Slice **23** Home polish

| Option | Note |
|---|---|
| **F1 (recommended)** | All non-goals above | Keeps pack Förråd-soft-bridge-only |
| F2 | Bundle saknar banner or place-heuristic | Reject — different surfaces/axes; default keep separate |

---

## Open questions (recommended answers)

| # | Question | Recommended answer |
|---|---|---|
| Q1 | Pass count or boolean into sheet? | Either fine; prefer `eligibleSuggestedCount` for symmetry with HallBoard, or `showSoftApplyAllPath = empty && count ≥ 1` computed in parent. |
| Q2 | Focus vs toast to point at CTA? | Builder picks: scrollIntoView + brief highlight preferred; optional brief toast if focus alone is easy to miss on phone. Not both loud — keep one soft cue. |
| Q3 | Replace empty hint or add below it when eligible? | Prefer soft path **replaces** the per-markör-only hint when eligible (still can mention Redigera redskap as secondary line if Docs wants); avoid three stacked paragraphs. |
| Q4 | Soft path visible from Golvklart-opened Förråd? | **Yes** if A1 gates met — CTA must exit floor → edit before pointing at apply-all (apply-all is edit-only). |
| Q5 | Interaction with Proposed saknar banner? | None this pack — do not draft banner UI/copy here. |

---

## Rejected alternatives (brief)

| Rejected | Why |
|---|---|
| A2 soft CTA whenever empty | Dead CTA when not eligible |
| A3 / B2 auto-apply from Förråd | Wrong surface; too aggressive; skips coach confirm on Hall |
| B3 copy-only | Weaker than Approved Scout path |
| C2/C3 tip strip / saknar-in-Förråd | Chrome / absorbs Proposed |
| D2/D3 heavy or no Docs | Scope / Swedish gate |
| F2 bundle Proposed hall items | Different packs |
