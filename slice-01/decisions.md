# Slice 01 — Locked decisions (2026-09-23)

From Builder clarifying questions; Planner decisions pending Christoffer approval to implement.

1. **Totals:** Session total = sum of item durations only. Blank = `0 / 60`. Empty block budgets on cards: Gathering 5, Warm-up 10, Techniques 20, Strength 15, Fun and games 10.
2. **Mismatch:** After drop, keep item; show inline banner on destination block (dismissible). No blocking dialog, no auto-revert.
3. **Block order:** Locked for Slice 01. Items reorder within a block only.
4. **Template replace:** Confirm first. Replaces blocks/items, sets title from template, clears notes, sets `basedOnTemplateId`.
5. **Export:** Disabled control + “Coming soon” (tooltip/toast). Stub only.
6. **Visuals:** `visualKey` → emoji/icon map OK for Slice 01.
7. **Language:** TBD by Christoffer (English vs Swedish-first). English placeholders until decided.
8. **Home:** Minimal — New session · Start from template · Continue last draft → builder.
9. **Seed:** ~6 stub activities per block type OK if labeled stubs; replace with Docs copy when ready.

**Stack (when kicked off):** Vite + React + TypeScript, localStorage drafts, no auth/backend for Slice 01. Scaffold may already exist at `/workspace/gymnastics-planner/app`.

## Verifier ambiguities locked (same day)
- Soft warning = inline banner; keep item; covers add-override + move
- Template ≤2 taps; confirm/cancel
- Visual = emoji/icon OK; not title-only
- 45–60 = item-sum inclusive; under 10 min = wall clock to runnable/saved plan
- totalMinutes computed-only (not editable)
- Home minimal in scope
- High-risk via `watchForRequired: true` on Activity
- Checklist v2 written to verification-checklist.md — Verifier should use v2 as sole authority

## Product decisions locked by Christoffer
- **Slice 01 approved** for Builder implementation (2026-09-23).
- **Language:** Swedish for Slice 01 UI and coach-facing copy (empty states, tips, activities, chrome).

## Swedish terminology (Christoffer)
- Athletes: **gymnaster**
- Training session: **pass**
- Loanwords: leave as in Docs pack for now
