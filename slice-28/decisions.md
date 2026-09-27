# Slice 28 — decisions (APPROVED · A1/B1/C1/D1/E1/F1 locked)

**Status:** **APPROVED 2026-09-27** — A1/B1/C1/D1/E1/F1 locked. Docs may start; Builder follows Docs, then Verifier.  
**Direction lock (product):** Mallar that claim **trygg start** / short pass must not open Passbyggaren with Samling already **Över budget**. Prefer Soft Samling consistency for beginner mall.

Christoffer (2026-09-27 via Planner) **Approved** external-review item “Mall Samling within budget” as **Slice 28**. Home wizard Approved separately (queued after this slice — not in this pack).

## Locked A–F (APPROVED 2026-09-27)

| # | Lock | Meaning |
|---|---|---|
| A | **A1** | Beginner mall Samling → Soft pair (Närvaro 3 + Dagens pass 3 = 6) |
| B | **B1** | Short mall leave alone (Välkomstcheck-in 5 ≤ 6) |
| C | **C1** | Keep `durationMinutes = BLOCK_BUDGETS[type]`; only item sums matter |
| D | **D1** | No extra title work — Slice 27 seed retitle already flows via activityId |
| E | **E1** | Thin living `docs/mall-samling-budget.sv.md` (+ Soft cross-link) |
| F | **F1** | No wizard / hall pre-place / Pages; preserve 22–27; footer Slice 28 |

---

## A. What Slice 28 touches

| Surface | Slice 28 change? |
|---|---|
| `tmpl-beginner-60` gathering items | **Yes** — composition/durations per A |
| `tmpl-short-45` gathering items | **Maybe** — only if B locks align/add |
| Soft blank `createBlankSession` | **No** — Slice 27 stays |
| `BLOCK_BUDGETS.gathering` | **No** under C1 (stays 6) |
| Seed titles / library | **No** under D1 (already retitled); Välkomstcheck-in stays in library |
| Hall / Golvklart / Home wizard | **No** |
| Footer | **Yes** — Slice 28 when shipped |

---

## DECISION RATIONALE — recommended A–F

### A. Beginner mall Samling composition? — **recommend A1**

**Math today:** Välkomstcheck-in **5** + `gather-dagens-teknik` **3** = **8** > budget **6** → red Över budget on first open of the “trygg start” mall.

| Option | Note |
|---|---|
| **A1 (rec)** | Align with Soft Samling: **Närvaro (3) + Dagens pass (3)**; drop Välkomstcheck-in from mall default | Removes red; same story as blank Nytt pass; Soft consistency |
| A2 | Keep Välkomstcheck-in + genomgång but **shrink durations** to fit 6 (e.g. 3+3 or 4+2) | Keeps välkomst framing; still two-item “welcome + rundown”; less aligned with Soft upprop story |
| A3 | **Drop one item** — e.g. only Välkomstcheck-in 5, or only Dagens pass 3 | Fits budget; weaker Soft parity; A3-only-välkomst matches short mall shape |

**Rationale for A1:** Slice 27 Soft Samling locked upprop + kort pass-genomgång as the static club start. Slice 27 F3 deferred mall rewrite — this pack is that rewrite. Aligning beginner with Soft removes the red first impression **and** stops teaching two different “default Samling” stories (mall vs blank). Välkomstcheck-in remains in the library for coaches who want it.

**If A2:** Docs should say mall still uses välkomst framing; Builder only changes minutes (and maybe order), not Soft IDs.

**If A3:** Prefer dropping the 3-min item and keeping Välkomstcheck-in 5 (mirrors short) **or** dropping välkomst and keeping Soft pair single-item — weaker; only if Christoffer rejects Soft alignment on malls.

---

### B. Short mall? — **recommend B1**

**Math today:** Välkomstcheck-in **5** only → **5 / 6** — **under budget**, no red tag.

| Option | Note |
|---|---|
| **B1 (rec)** | **Leave alone** | No red today; Effort stays S; short pass can keep a single välkomst beat |
| B2 | Also replace with Soft pair (Närvaro + Dagens pass) | Consistency with Soft + A1; changes short-pass character (adds a second Samling item; total +1 min Samling) |
| B3 | Replace with Soft pair **single** (e.g. only Närvaro or only Dagens pass) | Odd; avoid unless he insists |

**Rationale for B1:** External review called out beginner over-budget as the immediate pain. Short is already fine mathematically. Aligning short is optional product polish, not the red-chrome fix. If A1 locks Soft on beginner, Scout/Planner can revisit short later if dual Samling stories feel wrong.

**Note for Christoffer:** Short mall **5 vs budget 6** is intentional under B1 — not a bug.

---

### C. Block `durationMinutes` vs item sums? — **recommend C1**

| Option | Note |
|---|---|
| **C1 (rec)** | Keep `seedTemplates.block()` / `cloneTemplate` setting `durationMinutes: BLOCK_BUDGETS[type]` (already); **only item sums** feed `BlockCard` over-budget | No new budget model; Soft 6 stays truth |
| C2 | Author per-template gathering budgets lower/higher than `BLOCK_BUDGETS` | Fights single budget chrome; reject unless he wants mall-specific budgets |
| C3 | Lower global `BLOCK_BUDGETS.gathering` back toward 5 | Fights Slice 27 D2 Soft 3+3 fit; **reject** |

**Rationale for C1:** Code already does the right split — budget chrome is global; mall authorship is items. Fix items; leave budget at 6.

---

### D. Sync titles with Slice 27 retitle? — **recommend D1**

Slice 27 A2 retitled `gather-dagens-teknik` → **Dagens pass — snabb genomgång**. Templates store **activityId**, not title; Passbyggaren resolves title from `seedActivities`.

| Option | Note |
|---|---|
| **D1 (rec)** | **No extra title pass** — seed retitle already flows; A1 uses same Soft IDs | Least work; correct UI |
| D2 | Touch living Soft / seed docs to mention malls now use Soft pair | Harmless companion to E1; not a separate title invent |
| D3 | Invent mall-only display titles / parallel seeds | Reject — library clutter; fights Soft reuse |

**Rationale for D1:** If A1, titles match Soft automatically. If A2 keeps Välkomstcheck-in + `gather-dagens-teknik`, display already says Dagens pass. No hardcoded “Dagens teknik” string in `seedTemplates.ts`.

---

### E. Docs scope? — **recommend E1**

| Option | Note |
|---|---|
| **E1 (rec)** | Thin living `docs/mall-samling-budget.sv.md` (intent, math, Soft alignment, short leave-alone) + one Soft Samling cross-link | Enough for Verifier / future Scout |
| E2 | Only patch existing Soft / seed docs; no new living file | Weaker discoverability |
| E3 | Code comments only; no Docs | Reject — Swedish gate / Verifier handoff |

**Rationale for E1:** Small surface; documents why beginner matches Soft and why short stays at 5. Footer string is Builder (F), not Docs inventing chrome.

---

### F. Out of scope lock? — **recommend F1**

| Option | Note |
|---|---|
| **F1 (rec)** | Mall Samling budget only; **no** Home wizard; **no** hall pre-place; **no** Pages unless asked; preserve **22–27**; footer **Slice 28** |
| F2 | Also start Home 3-question wizard pack in same loop | Reject — Effort L; Christoffer queued **after** Slice 28 |
| F3 | Also pre-place Teknik when applying mall | Reject — wizard/hall pack territory |

**Rejected:** F2/F3. Home wizard remains **Approved** in backlog only.

---

## Implementation sketch (Builder — after Docs, if A1/B1/C1)

```
// seedTemplates.ts — beginnerBlocks gathering
block('gathering', [
  item('gather-narvaro', 3, 0),
  item('gather-dagens-teknik', 3, 1),  // title from Slice 27 seed
]),

// shortBlocks gathering — unchanged under B1
block('gathering', [item('gather-valkomstcheck-in', 5, 0)]),

// BLOCK_BUDGETS.gathering stays 6
// createBlankSession Soft inject unchanged
// UI.footerSliceLabel = 'Träningsplaneraren · Slice 28'
```

`cloneTemplate` already sets `durationMinutes: BLOCK_BUDGETS[b.type]` and copies items — no session.ts change expected under C1.

Library: keep all three Samling seeds. Soft blank path untouched.

---

## Approval record

**APPROVED 2026-09-27:** Christoffer locked **A1/B1/C1/D1/E1/F1**. Docs may start; Builder follows Docs, then Verifier.
