# Slice 38 — Builder handoff

**Status:** LOCKED 2026-10-13. Scope: `app/src/lib/runPass.ts`, `app/src/components/RunPass.tsx`, one `UI` key + `SLICE_NUMBER` in `app/src/data/blockMeta.ts`, a few lines in `app/src/export.css`, tests. Nothing else.

## What exists today (main @ 1769eca)

- `RunPass.tsx:RunPass` is the Kör passet overlay. `steps = runSteps(session)` (`lib/runPass.ts:runSteps`) gives every step with `seconds` (`runSeconds`, 0 for invalid/0 minutes).
- `left = clockRemaining({ ...clock, index }, now)` (`RunPass.tsx:34`, `lib/runPass.ts:clockRemaining`) is the current step's seconds left. It is frozen while paused (`frozen`) and clamped at 0.
- A 200 ms interval (`RunPass.tsx:83–91`) updates `now` while the clock runs and stops at the deadline or on pause.
- Under the clock: `run-status` («Pausad»), `run-timeup` («Tiden är ute», `role="status"`), then `<p className="run-next">` with `runNextText(...)` (`RunPass.tsx:194`, Slice 34).
- `.run-next` CSS: `app/src/export.css:909`.

## 1. Pure helper (A1, C1, rounding)

In `lib/runPass.ts`, next to `runNextText`:

```ts
/** Slice 38: rest of the current step + every later step, in seconds. */
export function runRemainingSeconds(steps: Pick<RunStep, 'seconds'>[], index: number, left: number): number {
  let total = Math.max(0, left)
  for (let i = index + 1; i < steps.length; i++) total += steps[i].seconds
  return total
}

/** Slice 38: «Kvar: X min», whole minutes rounded up (1–60 s → 1, 0 → 0). */
export function runLeftText(steps: Pick<RunStep, 'seconds'>[], index: number, left: number, label: string): string {
  return label.replace('{n}', String(Math.ceil(runRemainingSeconds(steps, index, left) / 60)))
}
```

- Over time: `left` is already 0 at 00:00, so on the last step the line shows «Kvar: 0 min». On earlier steps at 00:00 it shows the sum of the later steps (correct: that time is still planned). Do **not** hide the line and do **not** add an over-time branch (C1).
- Going back (Föregående) restarts that step's clock, so the number goes up again. That is correct.

## 2. Render (A1, E1)

In `RunPass.tsx`, directly after the `run-next` line:

```tsx
<p className="run-left">{runLeftText(steps, index, left, UI.runLeftLabel)}</p>
```

- No `role`, no `aria-live`, no `aria-label` (Aria: no live-region spam; it changes once a minute and readers reach it in normal reading order). Leave `clockLabel` as is.
- Pause (D1) needs nothing: `left` is frozen, so the line is frozen.

## 3. CSS (E1)

```css
/* Slice 38: «Kvar: X min» — quiet line under «Nästa: …». */
.run-left {
  margin: 0;
  color: #a8a29e;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
```

Muted (a step quieter than `.run-next`), one line. At 390 px the longest realistic text («Kvar: 120 min») is well under the width. Check that `.run-script` still gets room on 844 px height (it is `flex: 1; overflow: auto`, so it shrinks; the nav buttons must stay visible).

## 4. Strings and footer

- `UI.runLeftLabel: 'Kvar: {n} min'` next to `runLastActivity` (`blockMeta.ts:598`).
- `SLICE_NUMBER = '38'` (`blockMeta.ts:111`). This changes `footerSliceLabel` and the feedback mail version line.
- **Test asserts to update** (they hard-code 37):
  - `app/src/lib/feedback.test.ts:25` `'Version: Slice 37'` → `'Version: Slice 38'`
  - `app/src/lib/feedback.test.ts:45` `SLICE_NUMBER, '37'` → `'38'`
  - `app/src/lib/feedback.test.ts:46` `'Träningsplaneraren · Slice 37'` → `Slice 38`
  - `app/src/lib/clubTemplates.test.ts:316` `'Träningsplaneraren · Slice 37'` → `Slice 38`
  - Run `rg -n "Slice 37'" app/src` to catch any others.

## 5. Tests

Unit tests for `runRemainingSeconds` / `runLeftText`:
- middle step: `left` + later steps; 3 steps × 60 s, index 0, left 60 → «Kvar: 3 min».
- rounding: 61 s → 2, 60 s → 1, 1 s → 1, 0 s → 0.
- last step at 0 → «Kvar: 0 min»; earlier step at 0 → later steps only.
- 0-second steps add nothing; empty tail works.

## 6. Budget (F1)

`cd app && npm run build` on main and branch; sum `gzip -9c` of `dist/assets/*.js` + `*.css`. Soft limit +512 B; estimate +100–200 B. Numbers in the PR.

## Open for Builder

1. Confirm at 390×844 that the extra line does not push **Föregående / Nästa övning** off screen on a step with a long safety text (`.run-script` should scroll, not the page).
2. Confirm colour `#a8a29e` on the run background meets contrast for small text; if not, reuse `#d6d3d1` with the smaller size.
3. Update the `verify-traningsplaneraren` feature map if Verifier wants a Kör passet feature file (none exists today).
