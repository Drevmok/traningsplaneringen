# Slice 41 — Ångra (borttagen station och ersatt pass)

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-14.** A1–F1 locked per Planner (2026-10-14). Docs pack only, no app code. Branch `slice-41-docs` from `main` @ `ce799ca` (verified as `origin/main` tip with `git ls-remote` on 2026-10-14; main had not moved).  
**Effort:** S–M.  
**Source:** Planner (Polish #3).

## Why

Two taps in Passbyggaren throw work away with no way back: × on a station, and «Använd mall» over a pass the coach was building. Slice 39 keeps the old pass under Mina mallar, but finding it there is a detour. A short «Ångra» in the toast is the quiet fix, without adding a confirm dialog to every ×.

**Coach outcome:** "Jag tryckte fel, trycker Ångra, och allt är som innan."

## Locks

| Lock | Decision |
|---|---|
| **A1** | × still removes the station at once. Toast «Borttagen · Ångra» shows for about 5 s. Ångra puts the station back exactly: same block, same place in the order, all fields (minutes, redskap, notes, own/bank source), and its hall placement if it had one. |
| **B1** | After «Använd mall» replaces the pass (built-in mall, Mina mallar, föreningsmall), the toast offers Ångra; it brings back the previous pass (same id, blocks, hall and placements). Works with Slice 39 autosave: the restored pass is written at once. Mina mallar auto-copy of the replaced pass: **leave it** (see «Auto-copy choice»). |
| **C1** | One undo level. No history, no list. A new undoable action replaces the pending undo. |
| **D1** | Reuse the existing builder toast (`SessionBuilder.tsx` `.toast`). It has no action button and a fixed 2.2 s timer today, so the smallest extension is specified in HANDOFF §1. |
| **E1** | No confirm dialog for ×. The existing Använd mall confirm (`TemplateConfirm`) stays as is. |
| **F1** | +512 B gz total, soft. Estimate +300–450 B. |

## Key choices

- **Undo = snapshot of the whole pass before the action.** One `Session` value is kept. Restoring it brings back the station (or pass), its order, fields and hall placement in one step, and with it any Slice 37 auto-placement the mall added goes away. No per-field bookkeeping.
- **The undo ends** after about 5 s, when the coach leaves Passbyggaren (Hallöversikt, Hem, Kör passet, Golvklart), on any other change to the pass, or when a new × / mall gives a new undo. Then the snapshot is dropped.
- **Undo tapped after the pass changed:** not possible by design, since any change closes the toast. As a guard, Ångra checks that the pass on screen is still the one the action produced; if not, it does nothing and the toast closes. Never merges.
- **Mall toast:** combined, not replaced. «Mallen är i Passbyggaren.» stays as the text and gets the Ångra button, now for all three mall kinds (built-in and Mina mallar had no toast before).
- **After Ångra:** a short toast «Ångrat.» (2.2 s, no button) so the coach and screen readers know it worked.

## Auto-copy choice (B1): leave it

When a mall replaces a pass with ≥ 1 station, Slice 39 (`archiveReplacedDraft`) has already copied it to Mina mallar. On Ångra we **leave that copy**.

- **Simpler:** no delete path, no id tracking between the copy and the undo, no cap rewind in `addWithCap`.
- **Loses nothing:** the copy is the same pass the coach now has back. Removing it would risk deleting a copy the coach already relied on, or the wrong one if the cap rule shifted entries.
- **No duplicates later:** `sessionAlreadyArchived` matches by pass signature, so when the restored pass is replaced again, no second copy is made.
- **Cost:** one extra entry in Mina mallar the coach can delete. It is an `auto` copy, so it is the first to go under the cap.

The other direction is handled: restoring the old pass must **not** auto-copy the untouched mall pass to Mina mallar (HANDOFF §3).

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes with file:function refs
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC22
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — strings
- Living doc: [`docs/ui-chrome.sv.md`](../docs/ui-chrome.sv.md) (toast with Ångra)

## Out of scope

Undo for other actions (move station, minutes, Ny vecka, Ta bort in Mina mallar, Hallöversikt drag), redo, history UI, confirm dialogs, undo in Hallöversikt, undo across reloads, removing the Slice 39 auto-copy.
