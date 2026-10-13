# Slice 38 — Verification checklist

**Viewport:** 390×844 portrait (iPhone 12–15 class). Test pass: 3 steps across 2 blocks, 2 min + 1 min + 1 min (4 min total). One step with a very long title.

| # | Check |
|---|---|
| AC1 | Open **Kör passet** → under the timer, below «Nästa: …», a muted line reads «Kvar: 4 min» |
| AC2 | The number is the rest of the current step plus all later steps (step 1 at 01:30 → «Kvar: 4 min»; at 00:59 → «Kvar: 3 min») |
| AC3 | Rounding up: 1–60 s left in total shows «Kvar: 1 min»; only 0 s shows «Kvar: 0 min» |
| AC4 | Updates live while the clock runs, without a tap |
| AC5 | **Nästa övning** / **Föregående** / arrow keys → the line recalculates at once (going back raises it again) |
| AC6 | Pause (tap the clock) → the line freezes with the timer; resume → it continues from the same value |
| AC7 | Earlier step reaches 00:00 → line shows only the later steps' time and stays still |
| AC8 | Last step reaches 00:00 → «Kvar: 0 min»; the line stays visible, no alarm, no colour change, no extra tone beyond Slice 34's |
| AC9 | At 390 px «Nästa: {title}» (long title, ellipsis) and «Kvar: X min» are two separate lines; nothing overlaps, no horizontal scroll |
| AC10 | On the last step «Sista aktiviteten» and «Kvar: X min» both show correctly |
| AC11 | **Föregående** / **Nästa övning** stay visible at 390×844 on a step with long text; only `.run-script` scrolls |
| AC12 | Screen reader (VoiceOver): the line is read in order, is not a live region, and is not announced on its own each minute; clock label unchanged |
| AC13 | No new buttons, settings, toggles, screens, banners or toasts |
| AC14 | Outside Kör passet nothing changes (Home, Passbyggaren, Hall, Golvklart, Bibliotek) |
| AC15 | Bundle delta ≤ +512 B gz (soft): main vs branch, sum of `gzip -9c` for `dist/assets/*.js` + `*.css`; numbers in PR, overrun explained |
| AC16 | `npm run build`, `npm test` (and lint/typecheck if present) green; updated Slice 38 asserts in `feedback.test.ts` and `clubTemplates.test.ts` |
| AC17 | Prior slices unaffected: Slice 34 tone once at 0, «Nästa»/«Sista aktiviteten», pause, wake lock as before |
| AC18 | Strings verbatim per `content/microcopy.sv.md`: «Kvar: {n} min», footer «Träningsplaneraren · Slice 38»; no exclamation marks |
