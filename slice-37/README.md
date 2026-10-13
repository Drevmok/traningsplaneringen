# Slice 37 — Teknik på plats direkt från mall

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-13.** A1–F1 locked per Planner (2026-10-13). Docs pack only, no app code. Branch `slice-37-docs` from `main` @ `c6a11d5` (verified as `origin/main` tip with `git ls-remote` on 2026-10-13).  
**Effort:** S.  
**Source:** Scout run 2026-10-13, idea #1 (`backlog/IMPROVEMENTS.md` on branch `scout/2026-10-13-ideas`, backlog PR #40, not merged when this pack was written).

## Why

The home wizard (**Planera pass**) gives a pass with Teknik already on the hall. A pass started from a mall does not: the draft has no placements until the coach opens Hallöversikt. Golvklart and the hall preview stay empty until then. After this slice, all three mall paths place unplaced Teknik markers on apply, with the same helper the wizard uses.

**Coach outcome:** "Jag startar från en mall och stationerna står redan i hallen. Jag flyttar dem om jag vill."

## Locks

| Lock | Decision |
|---|---|
| **A1** | After applying a mall from **Starta från mall** (built-in), **Föreningsmall** (Slice 36) or **Egen mall**, run the existing `autoPlaceUnplaced` (`app/src/lib/hallSuggest.ts`) on the new pass, the same way `composeWizardSession` (`app/src/lib/wizard.ts`) does. Do **not** trigger **Använd alla förslag**. |
| **B1** | Coaches move, remove and undo markers as today. No new controls. |
| **C1** | Reuse existing copy only. The wizard has **no** toast, so no new toast. The Slice 36 toast and note that say "place them yourself" get shorter (see HANDOFF §4). No new UI strings. |
| **D1** | No redskap or no free spot → the marker stays unplaced, silently. See HANDOFF §5: today's helper never hits either case, so D1 is met by not adding anything. Open item for Planner. |
| **E1** | Only Teknik is placed (`isPlaceableItem`); the pass's hall template is kept; placements already in an Egen mall stay where they are. |
| **F1** | Bundle: +512 B gz total, soft. Estimate +40–120 B. |

## Scope

- One call to `autoPlaceUnplaced` in each of the three apply handlers in `SessionBuilder.tsx`.
- Shorter `clubTemplateApplied`; drop `clubTemplatePlacementsNote` from the club confirm.
- Footer `Träningsplaneraren · Slice 37` (`SLICE_NUMBER = '37'`).
- Living doc [`docs/foreningens-mallar.sv.md`](../docs/foreningens-mallar.sv.md) updated in this branch.

## Non-goals

Auto **Använd alla förslag** · changes to `hallSuggest.ts` zone logic · placements inside club mallar (Slice 36 E1 stays: none in payload or DB) · new toast, banner, button or setting · Kom igång changes · new dependencies.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC14
- No `content/microcopy.sv.md`: no new text. The two string changes are in HANDOFF §4.
