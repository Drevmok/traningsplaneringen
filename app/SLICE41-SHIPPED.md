# Slice 41 — Ångra (shipped notes)

Branch `slice-41-code` off `main` @ `ce799ca` + docs pack `5b99557`.

## What changed
- **Toast (D1):** `SessionBuilder` toast is now `{ text, undo?, focus? }`. Plain toasts unchanged (2.2 s, no button). Undo toasts show `text · Ångra` (separator `aria-hidden`), 5 s, re-armed per new toast. Timer pauses while keyboard focus (`:focus-visible`) is inside the toast; Escape closes without undo. `.toast-action` ≥ 44 px tall, underlined, `#fde68a`, focus outline.
- **Undo (A1/B1/C1):** module-level `pendingUndo = { before, after, blockId }` (one level). Armed by × (`handleRemoveItem`) and by all three Använd mall handlers (built-in, Mina mallar, föreningsmall), which now all carry «Mallen är i Passbyggaren. · Ångra» across the remount. Disarmed on timer end, on any pass change that isn't `after`, and on leaving Passbyggaren (a mount keeps it only when the carried toast is an undo toast = the mall remount). Ångra checks that the pass on screen is still `after` (reference, then whole-pass JSON); otherwise it does nothing and closes the toast.
- **Ångra:** `restoreDraft(before)` (new in `lib/autosave.ts`: drops another pass's pending write, writes now, skips the Slice 39 auto-copy once), reselects the block, `onChange(before)`, then the toast «Ångrat.» (carried when the id changes back). If the write fails, «Ångrat.» isn't shown and the Slice 39 failure path is left to handle it.
- **Focus:** when × had focus, focus moves to Ångra. After a mall confirm, Ångra is focused. After Ångra, focus isn't moved (HANDOFF: «if easy; else leave it»).
- **useAutosave:** when the session goes back to the last written JSON, the pending timer and pendingWrite are cancelled. Without this, the debounced write of the removed state (× then Ångra within 800 ms) would land after `restoreDraft` and put the removal back. This is a one-hunk fix outside HANDOFF's file list.
- Strings `undoRemoved`, `undoAction`, `undoDone`; `SLICE_NUMBER = '41'`; test asserts bumped.
- Mina mallar auto-copy of the replaced pass is **left** on Ångra (README B1).

## Verification
- `bun test src` 210 pass / 0 fail (+3 restoreDraft tests); `bun test tools/bank` 26/26; `npx tsc -b` clean; `npm run lint` 0 errors (pre-existing warnings only); `npm run build` ok.
- Smoke `verifier/slice-41-builder-smoke.mjs` @ 390×844: 27/27 (results JSON next to it; screenshots `/workspace/screenshots/slice41_*`).
- Not verified by the smoke: AC11 (föreningsmall needs a club backend; same code path as AC9/AC10), AC19 (VoiceOver), AC18 on a real 390 px device with an external keyboard, AC8 Kör passet / Golvklart exits (Hallöversikt and Hem were tested; the same unmount rule applies).

## Bundle (F1, gzip -9)
| | main ce799ca | branch | Δ |
|---|---|---|---|
| all js+css | 218 201 | 218 794 | **+593** |
| eager (index.html) | 154 314 | 154 899 | +585 |

This is over the +512 B soft limit by about 80 B. Small trims made no difference after gzip.
