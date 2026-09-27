# Slice 27 — verification checklist (DRAFT · recommended A–F)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **DRAFT** — Verifier runs only after Christoffer APPROVED A–F + Docs + Builder ship + Planner ping.  
**Skill:** `verify-traningsplaneraren/` + project skill `verify-traningsplaneraren/`; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Recommended choices (awaiting lock):** **A2 / B1 / C1 / D2 / E1 / F1**.

## Rules (recommended → locked after approval)

### Soft prefill — blank Nytt pass (A2 / B1 / D2)

| # | Rule | Pass if |
|---|---|---|
| 1 | Blank prefill | Home → **Nytt pass** → Samling has **Närvaro** (`gather-narvaro`) then pass-rundown activity (`gather-dagens-teknik` per A2 copy) |
| 2 | Order / duration | Order: Närvaro first, genomgång second; durations 3+3 (unless D1 shortened) |
| 3 | Budget fit (D2) | With D2: gathering budget **6**; default filled shows **6 / 6** without Över budget |
| 4 | Editable | Coach can remove, reorder, change duration, add more — controls enabled |
| 5 | No hard lock | Soft items are removable; add UI still present |

### Templates / drafts (B1 / C1)

| # | Rule | Pass if |
|---|---|---|
| 6 | Template authorship | Apply `tmpl-beginner-60` / `tmpl-short-45` → Samling matches **template** items (not forcibly replaced by soft pair) |
| 7 | No mid-edit re-inject | Clear both soft items → empty tip; items stay empty until coach adds |
| 8 | No draft migrate | Pre-existing draft with empty Samling stays empty on Fortsätt / load |

### Docs / chrome / Kom igång (A2 / E1)

| # | Rule | Pass if |
|---|---|---|
| 9 | Pass-rundown framing (A2) | Seed title/summary for genomgång reads as **pass** rundown (not technique-only), if A2 locked |
| 10 | Living docs | `docs/soft-samling.sv.md` exists (or pack content mirrored) describing Soft inject rules |
| 11 | Empty tip | Cleared Samling shows tip (+ optional Docs tweak); Swedish |
| 12 | Kom igång | Soft-prefill may auto-check `addActivities` (`itemCount >= 1`) — allowed; no crash |

### Scope / footer / build (F1)

| # | Rule | Pass if |
|---|---|---|
| 13 | Hall untouched | Samling items **not** placeable on hall; Teknik-only unchanged |
| 14 | Library seeds | `gather-valkomstcheck-in` still in library / seeds; not deleted |
| 15 | Preserve 22–26 | Quiet chrome, Home polish, Förråd soft path, saknar banner, place-step placement-only still behave |
| 16 | Footer | `Träningsplaneraren · Slice 27` when shipped |
| 17 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 18 | Build | `npm run build` green in `app/` |
| 19 | No cloud / CAD / Pages | No accounts/sync/CAD; no republish required for PASS |

## Passbyggaren smoke

1. **Nytt pass:** Samling shows soft pair; budget OK per locked D; editable.  
2. **Clear:** Remove both → empty tip; no auto-refill.  
3. **Re-add:** Add Välkomstcheck-in from library — works.  
4. **Mall:** Apply beginner/short — Samling = mall, not soft overwrite.  
5. **Hall:** Soft Samling items do not appear as hall markers.  
6. **Regression:** Slice 26 place-step still placement-only; Slice 25 saknar banner; Slice 24 Förråd path; footer Slice 27; build green.

## Fail if

- Blank Nytt pass still has empty Samling (no soft pair).  
- Soft pair hard-locked (cannot remove) or planning UI removed.  
- Template Samling forcibly rewritten to soft pair under B1.  
- Existing empty drafts migrated under C1.  
- Samling placeable on hall / Teknik-only broken.  
- Välkomstcheck-in removed from seed library.  
- Footer not Slice 27; build red.  
- Verifier run before APPROVED + Docs + Builder ship + Planner ping.
