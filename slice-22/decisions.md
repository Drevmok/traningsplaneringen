# Slice 22 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-26** — Christoffer approved via Planner lock widget; A–F locked as recommended  
**Direction:** Copy quieter / feature-first chrome — progressive Hall hints + quieter Kom igång + one chrome layer at a time

Docs may start. Builder after Docs (or parallel only if Planner says). Verifier only after Planner ping.

Christoffer (2026-09-26) approved the three themes, then locked recommended A–F.

## Locked A–F (Christoffer 2026-09-26)

| # | Rec | Meaning |
|---|---|---|
| A | **A1** | Progressive Hall hints — durable compact after first Teknik place; info reveals full hints; zero placements keep today’s full hints |
| B | **B1** | Quieter Kom igång — collapsed default once progress > 0 or previously collapsed; brand-new 0/n stays expanded |
| C | **C1** | One chrome layer — at most one of {tip strip, status banner, multi-line hints}; tip > suppress hints; banner > suppress tip on that surface |
| D | **D1** | Thin Docs — info + Kom igång collapse/expand Swedish (+ aria); update living docs; no saknar copy |
| E | **E1** | Footer `Träningsplaneraren · Slice 22` |
| F | **F1** | Hard non-goals — preserve 11–21 except quiet rules; no saknar / place-heuristic; no pinch/pan/tray-collapse regressions; no republish unless asked |

---

## A. What Slice 22 touches

| Surface | Slice 22 change? |
|---|---|
| Hallöversikt **edit** — multi-line instructional hints | **Yes** — progressive disclosure (A1) + layering vs tip strip (C1) |
| Hallöversikt **edit** — chips / Placera här / tray expand-collapse | **No** primary-action change; hints may hide behind info |
| Hallöversikt **Golvklart** | **Layering only** if tip + unplaced banner would stack; no edit-tray hints (already hidden) |
| Home **Kom igång** | **Yes** — collapse-by-default after progress (B1) |
| Coach tip strip dismiss / Visa tips igen / Dölj Kom igång | **Keep** paths; Visa tips igen may reset compact/collapse prefs (see open Q) |
| Scout Proposed #1 saknar-redskap banner | **Out** — stays Proposed (would ADD chrome) |
| Scout Proposed #2 place-step heuristic | **Out** — stays Proposed (different axis) |
| Pinch / pan / tray collapse (Slice 21) | **Preserve** — only tray **hint** visibility may change |

---

## DECISION RATIONALE — locked A–F

### A. Progressive Hall hints?

**Locked A1: Compact after first successful Teknik place; info reveals full hints**

**Trigger (recommended):** Durable browser-local flag `hallHintsCompact` in the tips store (`gymnastics-planner-tips-v1` / `CoachTipsStateV1`) set `true` once the coach has ever successfully placed ≥1 Teknik station (`placementCount ≥ 1` at least once). Returning coaches stay quiet even on a new draft.

**When compact (`hallHintsCompact === true`):**

- **Hide** multi-line instructional paragraphs from expanded tray and above-canvas:
  - Tray: `hallDragHint`, `hallSnapHint`
  - Above canvas / header: `hallStationsOnlyHint`, `hallStationOrderHint`, `hallTileHint` (and any equivalent multi-line instructional block — not primary actions)
- **Keep** primary actions: chips, **Placera här**, tray expand/collapse (Slice 21), zoom, Hallayout, Golvklart CTA
- Provide an **info control** (≥44×44px) that reveals the full hint set on demand (popover, sheet, or expandable region — Builder picks; Docs locks Swedish + aria)

**When not compact (zero placements ever / flag false):**

- Show today’s full hints as now (prefer **keep current full hints** until first place so new coaches still learn — not a single condensed paragraph)

| Option | Note |
|---|---|
| **A1 (recommended)** | Durable compact after first place; info on demand; full hints until then | Matches Christoffer “copy great but takes precedence” |
| A2 | Delete hints forever | Reject — new coaches lose Teknik-only / drag / snap teaching |
| A3 | Always show all | Reject — the pain |
| A4 | Move hints into Kom igång only | Reject — wrong surface; Home ≠ Hall muscle memory |

**Rationale:** Evidence in `HallBoard.tsx` — expanded tray alone stacks drag + snap (+ tip strip); header stacks order + stations-only + tile (+ flow tip). After first place, the coach already knows the loop; feature chrome should win.

**Rejected alternatives:** A2/A3/A4 — see table.

---

### B. Quieter Kom igång?

**Locked B1: Collapsed by default once progress > 0 or previously collapsed**

- **Collapsed summary:** title **Kom igång** + progress “{done} av {total} klart” (reuse `komIgangProgress`) + **expand** control ≥44px
- **Expanded:** today’s full intro + step list + step hints + dismiss paths
- **Brand-new** (`done === 0` and never interacted / never collapsed): stay **expanded** so first-run coaching still works
- **Persist** collapsed preference in the same local tips store as tip dismissals (`komIgangCollapsed` on `CoachTipsStateV1`)
- Keep **Dölj Kom igång** / **Jag klarar mig** (full dismiss → `checklistDismissed`) and **Visa tips igen** (restore checklist visibility)

**Collapse trigger (recommended):** Default next Home visit to collapsed when **either**:

1. `checklistDoneCount > 0`, **or**
2. Coach previously expanded then collapsed (`komIgangCollapsed === true`)

Expanding again stays expanded for the session until they collapse; next visit still respects persisted preference if progress > 0.

| Option | Note |
|---|---|
| **B1 (recommended)** | Collapse after progress / prior collapse; 0/n stays expanded | Feature-first without killing first-run |
| B2 | Remove Kom igång | Reject — Slice 09/16 discoverability still needed for new coaches |
| B3 | Always expanded | Reject — the pain |
| B4 | Move checklist off Home | Reject — wrong product shape; bigger than polish |

**Rationale:** `KomIgangCard` today always renders full intro + 5 steps whenever not dismissed — even at 4/5. Collapsed summary keeps progress visible without eating Home.

---

### C. One chrome layer at a time?

**Locked C1: At most one teaching surface among tip strip / status banner / multi-line hints**

**Priority (global):**

1. **Blocking / required confirm UI** (e.g. dirty Stäng in-sheet confirm) — **always wins**; not part of the soft trio
2. Else soft teaching — show **at most ONE** of:
   - (a) soft **coach tip strip** (`CoachTipStrip`)
   - (b) hall **status banner** (today: Golvklart `hallUnplacedBanner*`; future saknar banner is **out** of this pack)
   - (c) **multi-line** tray/canvas instructional hints (the A1 paragraphs)

**Clearest Hall rules (recommended):**

| If visible… | Then… |
|---|---|
| Tip strip on Hall edit | Suppress multi-line hall hints (A1 full paragraphs). **Info control still available** so coach can open hints without dismissing the tip. |
| Unplaced status banner (Golvklart) | Suppress tip strip on that Golvklart surface until banner dismisses/clears (unplaced → 0). Banner is operational status; tip is teaching. |
| Neither tip nor banner | Multi-line hints follow A1 (full until compact; then info-only). |

**Never hide:** Placera här, chips, tray expand/collapse, Golvklart / Förråd / print primary CTAs, zoom, Hallayout.

**Golvklart:** edit tray (and its hints) already hidden — C1 only prevents tip+banner stack there.

**Home:** tip strip (if any) vs fully expanded Kom igång teaching body — prefer: if a Home tip strip is visible, keep Kom igång in **collapsed** summary when B1 would allow collapse (do not stack tip + full checklist). Brand-new 0/n expanded still OK without a competing tip, or tip demoted until checklist collapsed — document: **Home prefers Kom igång expanded for 0/n over tip strip**; once progress > 0, B1 collapse + tip strip OK as the single teaching layer.

| Option | Note |
|---|---|
| **C1 (recommended)** | One of tip / banner / multi-line hints; rules above | Stops stacked chrome |
| C2 | Show everything stacked | Reject — the pain |
| C3 | Remove all tips | Reject — loses soft coaching; overkill vs progressive quiet |

**Rationale:** Christoffer’s “one chrome layer” maps cleanly onto three existing surfaces in code. Tip strip is dismissible teaching; unplaced banner is status; multi-line hints are always-on teaching — pick one.

---

### D. Docs surface?

**Locked D1: Thin Docs**

- Finalize Swedish for:
  - Hall **info** control label + aria (reveal progressive hints)
  - Kom igång **expand / collapse** labels + aria
- Update living docs: `docs/hall-declutter.sv.md`, `docs/coach-tips.sv.md`, `docs/kom-igang-redskap.sv.md` (and `hall-phone-chrome.sv.md` only if hint-layering notes belong there)
- **No** new required tip content; may shorten references to always-on hints
- **No** saknar-redskap banner copy
- Pack draft: [`content/copy-quieter-chrome.sv.md`](./content/copy-quieter-chrome.sv.md)

| Option | Note |
|---|---|
| **D1 (recommended)** | Thin strings + living-doc touch-ups | Enough for A1/B1 |
| D2 | New required tip for “hints moved” | Reject — tips already dense; info control replaces |
| D3 | No Docs pass | Reject — new visible Swedish needs Docs |

---

### E. Footer?

**Locked E1:** `Träningsplaneraren · Slice 22` when Builder ships.

| Option | Note |
|---|---|
| **E1 (recommended)** | Footer Slice 22 | Standard |
| E2 | Keep Slice 21 footer | Reject — ship marker |

---

### F. Hard non-goals (this pack)?

**Locked F1 — all stand:**

- Preserve Slices **11–21** behavior except the quiet-chrome rules above  
- **No** pinch / pan / tray-**collapse** regressions (Slice 21) — only tray **hint** visibility may change under A1/C1  
- **No** saknar-redskap banner (Scout Proposed #1 stays Proposed)  
- **No** Kom igång place-heuristic change (Scout Proposed #2 stays Proposed)  
- No Passbyggaren compose; no library growth; no CAD / pins / badge  
- Caption **Schematisk hall — inte exakt mått** unchanged  
- No Netlify / GitHub Pages republish unless Christoffer asks  
- Device-local drafts only; no accounts / cloud  

| Option | Note |
|---|---|
| **F1 (recommended)** | All non-goals above | Keeps pack quiet-chrome-only |
| F2 | Bundle Proposed #1 or #2 | Reject — #1 adds chrome; #2 is heuristic axis |

---

## Open questions (recommended answers)

| # | Question | Recommended answer |
|---|---|---|
| Q1 | Persistence key for hall compact? | Add `hallHintsCompact?: boolean` on `CoachTipsStateV1` under `gymnastics-planner-tips-v1` (same store as tip dismissals). |
| Q2 | Persistence key for Kom igång collapse? | Add `komIgangCollapsed?: boolean` on the same tips state. |
| Q3 | First place = per-draft or durable forever? | **Durable** after first successful Teknik place ever in this browser (`hallHintsCompact = true`). Returning coaches stay quiet. |
| Q4 | Does **Visa tips igen** reset compact / collapse? | **Yes (recommended):** clear `hallHintsCompact` and `komIgangCollapsed`, and restore checklist visibility as today — so coaches who want full teaching again get it. |
| Q5 | Exact C1 priority on Hall edit vs Golvklart vs Home? | Hall edit: tip strip → suppress multi-line hints (info still on). Golvklart: unplaced banner → suppress tip strip. Home: 0/n Kom igång expanded preferred over tip; progress > 0 → B1 collapsed + tip OK as single layer. Blocking confirm always wins. |
| Q6 | Info UI shape (popover vs sheet vs expand)? | Builder chooses; Docs locks Swedish + ≥44px + aria. Prefer non-modal expand/popover so Placera här stays usable. |

---

## Rejected alternatives (brief)

| Rejected | Why |
|---|---|
| A2 delete hints | Loses first-run Teknik teaching |
| A3 always show all | Misses the coach ask |
| A4 hints only in Kom igång | Wrong surface |
| B2 remove Kom igång | Loses Slice 09/16 path |
| B3 always expanded | The pain |
| B4 move checklist off Home | Product reshape, not polish |
| C2 stack everything | The pain |
| C3 remove all tips | Overkill |
| D2 new required tip | Scope / density |
| F2 bundle #1 or #2 | Different axes; #1 adds chrome |
