# Slice 27 Docs start brief — Soft Samling

**Status:** **APPROVED 2026-09-26** · Docs starts now. Builder waits until Docs is done; Verifier waits for Planner’s later ping.

## Deliverable

Create and maintain the Swedish living document at:

- `docs/soft-samling.sv.md`

The document should explain Soft Samling for coaches and future implementers: a blank **Nytt pass** starts with **Närvaro (upprop)** plus a short rundown of what the pass will do; Samling remains fully editable; removing items is allowed; clearing the block does not re-inject items; templates and existing drafts are preserved.

Keep the language Swedish, concise, and aligned with the existing product voice. State clearly that this is soft—not a hard lock—and that Samling is not placeable on the hall.

## Locked A–F

- **A2:** Reuse `gather-narvaro`; retitle/summarize `gather-dagens-teknik` as the pass-rundown activity, keeping the same ID and avoiding a parallel seed.
- **B1:** Inject the pair on blank **Nytt pass** only; template-authored gathering stays unchanged.
- **C1:** Leave existing drafts and already-empty Samling alone; no migration and no re-inject after clearing.
- **D2:** Raise the gathering budget from **5 to 6** so the default 3+3 fits cleanly.
- **E1:** Provide this living doc, an empty-tip tweak, and seed copy for A2.
- **F1:** No hard-lock, no hall change, no Pages unless asked; preserve Slices 22–26; footer is `Träningsplaneraren · Slice 27` when shipped.

## Copy tasks

1. **Living doc:** finish `docs/soft-samling.sv.md` as the Swedish source of truth for intent, blank-pass behavior, editability, template/existing-draft rules, empty-state behavior, and the Kom igång implication that prefilled Samling counts as activities.
2. **A2 seed copy:** update the title/summary and light `howTo`/`watchFor` cues for `gather-dagens-teknik` so it describes a quick overview of the whole pass, not technique-only content. Keep ID `gather-dagens-teknik` and the default duration at 3 minutes. Do not add a parallel seed and do not remove `gather-valkomstcheck-in`.
3. **Empty tip:** update `EMPTY_TIPS.gathering` copy, if needed, to invite a non-mandatory upprop + short pass overview after Samling is cleared. The tip must not imply a hard lock or automatic re-injection.

## Relevant paths / keys

- `slice-27/decisions.md` — approved decision record and rationale.
- `slice-27/HANDOFF.md` — pipeline and scope.
- `slice-27/README.md` — approved pack overview.
- `app/src/data/seedActivities.ts` — `gather-narvaro`, `gather-dagens-teknik`, `gather-valkomstcheck-in`; A2 copy lives here.
- `app/src/data/blockMeta.ts` — `EMPTY_TIPS.gathering` copy; `BLOCK_BUDGETS.gathering` is Builder’s D2 change; preserve footer key/behavior for Builder.
- `app/src/lib/session.ts` — Builder’s blank-pass injection; Docs should not implement this.
- `slice-27/content/` — pack placeholder/reference content.

## Handoff boundary

Docs owns the Swedish living doc and copy only. Do not implement the blank-pass injection or budget change. When the Docs changes are complete, report the paths changed to Planner; Builder may then begin. Do not mark Slice 27 Shipped.
