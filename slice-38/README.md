# Slice 38 — Kör passet: «Kvar: X min»

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-13.** A1–F1 locked per Planner (2026-10-13). Docs pack only, no app code. Branch `slice-38-docs` from `main` @ `1769eca` (verified as `origin/main` tip with `git ls-remote` on 2026-10-13).  
**Effort:** S.  
**Source:** Scout idea #3 (`backlog/IMPROVEMENTS.md`).

## Why

In the hall the coach knows how long the current station has left, but not how much of the pass is left. Today they add it up in their head or leave early or late. One quiet line under the timer answers "hinner vi?" without a tap.

**Coach outcome:** "Under klockan ser jag hur mycket som är kvar av hela passet."

## Locks

| Lock | Decision |
|---|---|
| **A1** | One muted line under the step timer: «Kvar: X min». X = the rest of the current step plus the planned time of every later step. Updates live with the clock. |
| **B1** | No new controls, settings or screens. |
| **C1** | When the pass runs over: the line shows **«Kvar: 0 min»** (it is not hidden). Justification: `clockRemaining` already clamps at 0, so the same formula gives 0 with no extra branch, and the line does not jump in and out of the layout under the clock. No alarm, no colour change. |
| **D1** | Pausing freezes it, like the timer (it is computed from the same `left` value). |
| **E1** | Own line, directly **below** the Slice 34 «Nästa: {title}» / «Sista aktiviteten» line. Short text, one line, no overlap at 390 px. |
| **F1** | +512 B gz total, soft. Estimate +100–200 B (one key, one pure helper, a few CSS lines). Builder explains any overrun in the PR. |

**Rounding:** whole minutes, rounded **up** (`Math.ceil(seconds / 60)`). 1–60 s shows «Kvar: 1 min»; only exactly 0 s shows «Kvar: 0 min». So the coach never sees 0 while something is still running.  
**Aria:** plain text, no live region, no `role="status"`. The clock's existing aria-label is unchanged.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC18
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — final Swedish + keys

## Out of scope

Clock time of the pass end («Klart 18:40»), seconds in the line, over-time counting («+3 min»), alarms, colours, settings, changes outside Kör passet.
