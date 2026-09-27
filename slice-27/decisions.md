# Slice 27 — decisions (APPROVED · locked 2026-09-26)

**Status:** **APPROVED 2026-09-26** — A2/B1/C1/D2/E1/F1 locked. Docs may start now. Builder after Docs. Verifier only after Planner ping.  
**Direction lock (product):** Soft Samling — every **new** blank pass starts with **upprop** + **kort genomgång av passet**; Samling stays fully editable; not the hard path.

Christoffer (2026-09-26 via Planner) chose **Soft** Samling. Planner drafted this pack; all A–F locks are now approved.

## Locked A–F — approved 2026-09-26

| # | Lock | Meaning |
|---|---|---|
| A | **A2** | Närvaro + thin Docs retitle/summary of `gather-dagens-teknik` → pass-rundown (same ID; no parallel duplicate) |
| B | **B1** | Inject on blank **Nytt pass** only; templates keep authored gathering |
| C | **C1** | Existing drafts / already-empty gathering on open — leave alone (soft = new only) |
| D | **D2** | Raise `BLOCK_BUDGETS.gathering` 5 → 6 so soft defaults 3+3 fit without “Över budget” chrome |
| E | **E1** | Living `docs/soft-samling.sv.md` + empty tip tweak + seed title/summary if A2 |
| F | **F1** | No hard-lock UI; no hall change; keep other seeds in library; no Pages unless asked; preserve 22–26; footer Slice 27 |

---

## A. What Slice 27 touches

| Surface | Slice 27 change? |
|---|---|
| Blank “Nytt pass” Samling items | **Yes** — soft-prefill (A/B) |
| Template-started pass Samling | **No** under B1 — keep mall authorship |
| Existing drafts on open | **No** under C1 |
| `BLOCK_BUDGETS.gathering` | **Yes** under D2 (5 → 6) |
| Seed `gather-dagens-teknik` copy | **Maybe** — Docs retitle/summary under A2 |
| Empty tip / Tips-tab Samling | **Maybe** — thin tweak under E1 |
| Hall / Golvklart placeable | **No** — Samling never on hall |
| Hard-lock / remove planning UI | **No** |
| Footer | **Yes** — Slice 27 when shipped |

---

## DECISION RATIONALE — locked A–F

### A. Which default activities? — **A2 locked**

**Locked A2: Närvaro + Docs retitle/summary of `gather-dagens-teknik` (same ID)**

Christoffer: upprop + short rundown of **what the pass will do**.  
- `gather-narvaro` (**Närvaro**, 3 min) matches upprop — **reuse**.  
- `gather-dagens-teknik` is close (3 min, Samling) but framed as today’s **technique**, not whole-pass rundown.  
- Prefer reuse over a parallel seed: thin Docs change title/summary/howTo cues toward “Dagens pass — snabb genomgång” / vad ni skall göra på passet, keep id `gather-dagens-teknik`.  
- Do **not** include `gather-valkomstcheck-in` in the soft default pair (he did not ask).

| Option | Note |
|---|---|
| A1 | Reuse Närvaro + `gather-dagens-teknik` **as-is** (technique frame stays) | Weaker — mismatches “vad vi skall göra på passet” |
| **A2 (locked)** | Närvaro + **Docs retitle/summary** of `gather-dagens-teknik` → pass-rundown; **same ID** | Soft reuse; no parallel duplicate; matches his words |
| A3 | Närvaro + **new** seed e.g. `gather-dagens-pass` (“Dagens pass — snabb genomgång”); leave teknik seed untouched | Cleaner semantics, but invents a parallel Samling seed — only if Christoffer rejects retitle |

**Rationale:** Soft + general across clubs. Retitle keeps one seed, updates meaning to pass rundown, avoids library clutter. Call out A3 if he wants teknik seed preserved for coaches who still mean technique-only.

**If A2:** Docs owns Swedish title/summary/howTo/watchFor; Builder keeps id and 3 min default unless D says otherwise.

---

### B. When to inject? — **B1 locked**

**Locked B1: Blank “Nytt pass” only**

- Inject soft pair inside `createBlankSession` / `createEmptyBlocks` (or a small helper used only by blank create).  
- **Do not** rewrite gathering when applying a template (`cloneTemplate` / mall confirm).  
- **Code discovery:** both seed templates already include gathering:
  - `tmpl-beginner-60`: Välkomstcheck-in (5) + Dagens teknik (3)
  - `tmpl-short-45`: Välkomstcheck-in (5) only  
  Neither uses Närvaro. Soft inject on malls would fight authored malls or be a rare empty-only edge.

| Option | Note |
|---|---|
| **B1 (locked)** | Blank Nytt pass only | Matches Soft = new; preserves mall authorship |
| B2 | Also when applying a template whose gathering is empty | Rare today; optional later if empty mall blocks appear |
| B3 | Always ensure ≥ soft pair whenever gathering empty on any create/open | Too close to migrate / hard soft; fights C1 |

**Rationale:** Soft Samling is the blank-pass skip-planning win. Templates are intentional coach starting points — leave them.

**Kom igång note:** Soft-prefill makes `itemCount >= 1` immediately → `addActivities` auto-checks. Document as intentional; do not exclude soft Samling items from the heuristic.

---

### C. Existing drafts / empty gathering on open? — **C1 locked**

**Locked C1: Leave alone (soft = new only)**

- `loadDraft` / open existing empty Samling: **no** inject, **no** migrate.  
- Coach who cleared Samling on purpose keeps empty tip.  
- Soft does **not** re-inject mid-session after remove-all.

| Option | Note |
|---|---|
| **C1 (locked)** | Leave existing alone | Soft = new blank only |
| C2 | Migrate empty gathering on `loadDraft` | Reject unless Christoffer wants backfill — surprises old drafts |
| C3 | One-time offer / banner to add soft pair | Extra chrome; fights Slice 22 quiet |

**Rejected:** C2/C3 unless he insists.

---

### D. Budget / duration? — **D2 locked**

**Locked D2: Raise gathering budget 5 → 6**

- Soft defaults: Närvaro 3 + genomgång 3 = **6**.  
- Today `BLOCK_BUDGETS.gathering = 5`.  
- **Over-budget is already allowed** (`BlockCard` tag `Över budget`; no hard block). Templates already ship over (beginner Samling 8).  
- Raising to **6** lets the soft default land **without** “Över budget” on every Nytt pass — cleaner soft chrome.

| Option | Note |
|---|---|
| D1 | Keep budget 5; shorten defaults (e.g. 2+3 or 2+2) to fit | Possible; slightly stingier upprop/genomgång |
| **D2 (locked)** | Raise gathering budget **5 → 6**; keep seed defaults 3+3 | Soft pair fits; no overflow chrome on intended default |
| D3 | Keep budget 5; allow soft over-budget (3+3=6 shows Över budget) | Allowed today — noisier for the happy path |

**Rationale:** Soft static start should feel normal, not already-over. D1 is fine if Christoffer wants to keep the 60-min budget arithmetic stricter.

---

### E. Docs / copy? — **E1 locked**

**Locked E1: Living soft-samling + empty tip tweak (+ seed copy if A2)**

- New living `docs/soft-samling.sv.md` (product intent Soft vs hard; inject rules; editability; Kom igång note).  
- Optional empty tip tweak so cleared Samling still invites upprop + kort genomgång without sounding mandatory.  
- If A2: Docs locks new Swedish title/summary (and light howTo) for `gather-dagens-teknik`.  
- Footer string to Slice 27 is Builder (F), not a tip strip.

| Option | Note |
|---|---|
| **E1 (locked)** | Living docs + empty tip (+ seed copy if A2) | Matches Soft product lock + Swedish gate |
| E2 | Titles/summaries only; no living docs file | Weaker handoff for Verifier / future Scout |
| E3 | Empty tip only; leave seed teknik framing | Reject if A2 — copy must move with retitle |

**Rejected:** E3 if A2 locked.

---

### F. Out of scope lock? — **F1 locked**

**Locked F1: Soft only; preserve spine**

- **No** hard-lock UI (cannot remove Samling items / hide add/reorder).  
- **No** hall change — Samling never placeable.  
- **No** remove of other seeds from library (Välkomstcheck-in stays available).  
- **No** auto-republish Pages/Netlify unless Christoffer asks.  
- Preserve Slices **22–26** (quiet chrome, Home polish, Förråd soft path, saknar banner, place-step heuristic).  
- Footer when shipped: `Träningsplaneraren · Slice 27`.

| Option | Note |
|---|---|
| **F1 (locked)** | Soft only + preserve 22–26 + footer 27 | Matches product lock |
| F2 | Also hard-lock remove of soft pair | Reject — Christoffer chose Soft, not hard |
| F3 | Also rewrite templates to soft pair | Reject — separate pack if wanted later |

**Rejected:** F2/F3.

---

## Implementation sketch (Builder — after Docs)

```
createBlankSession / createEmptyBlocks (gathering only):
  items = [
    createSessionItem('gather-narvaro', 3, 0),
    createSessionItem('gather-dagens-teknik', 3, 1),  // copy per A2 Docs
  ]
  // other blocks remain []

cloneTemplate / loadDraft:
  unchanged under B1/C1

BLOCK_BUDGETS.gathering = 6  // if D2

UI.footerSliceLabel = 'Träningsplaneraren · Slice 27'
```

Editability unchanged: `removeItem`, reorder, duration, add from library all still work. Cleared gathering → `EMPTY_TIPS.gathering` (Docs may tweak). Soft does not re-run inject after clear.

Golvklart / hall: Samling items never appear as placeable markers (Teknik-only). Passbyggaren / any session activity list shows them normally.

---

## Approval record

Christoffer locked all selected answers on **2026-09-26 (evening)**: **A2 B1 C1 D2 E1 F1**. This pack is approved; Docs starts now, Builder waits for the Docs deliverable, and Verifier waits for Planner’s post-Builder ping.
