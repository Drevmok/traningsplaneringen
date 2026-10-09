# Slice 34 — Verification checklist

**Viewport:** 390×844 portrait (iPhone 12–15 class), plus one real iPhone (Safari and home-screen app) and one real Android phone (Chrome). Test pass: 3 steps across 2 blocks, 1 min each (shorten a step to test faster if Builder offers a dev hook; otherwise use 1-min items). One step with a very long title.

| # | Check |
|---|---|
| AC1 | Tone plays when a step's timer reaches 00:00 — **exactly once** per step run |
| AC2 | Tone never loops or repeats while the step stays at 00:00 (wait ≥ 30 s) |
| AC3 | No auto-advance: at 00:00 the same step stays; only tapping **Nästa övning** moves on |
| AC4 | Pause at ~00:05, wait, resume → tone once at 0. Pause **after** 0, resume → no second tone. A paused clock never sounds |
| AC5 | Manual **Nästa övning**/**Föregående**/arrow keys/**Avsluta** never play the tone; a 0-minute step plays no tone on open |
| AC6 | iOS unlock: fresh load on iPhone → tap **Kör passet** → tone plays at the first 0 (no extra tap needed). Also in the home-screen app |
| AC7 | iPhone silent switch on → no tone, no error; switch off → tone at phone volume. App does nothing to override |
| AC8 | Android Chrome: short vibration together with the tone at 0 (once) |
| AC9 | iPhone: no vibration, no console error, no visible change |
| AC10 | Backgrounding: switch app away during a step, come back after its deadline → at most one tone, never several |
| AC11 | «Nästa: {title}» under the timer shows the next step's title, correct across the block boundary (last of block 1 → first of block 2) |
| AC12 | Last step shows «Sista aktiviteten» |
| AC13 | Long title truncates on one line with an ellipsis; no horizontal scroll at 390 px; nothing overlaps the clock or the nav buttons |
| AC14 | No new buttons, settings, toggles, screens, banners or toasts |
| AC15 | Screen-lock: with the screen locked no sound is expected; documented (README E1 / microcopy), no coach-facing text added |
| AC16 | Outside Kör passet nothing changes: no AudioContext created on load (DevTools), Home/Passbyggaren/Hall/Golvklart/Bibliotek identical |
| AC17 | Bundle delta < 1 kB gzipped: `npm run build` on main vs branch, sum of `gzip -9c` sizes of `dist/assets/*.js` + `*.css`; numbers in PR |
| AC18 | `npm run build`, `npm test` (and lint/typecheck if present) green |
| AC19 | Prior slices unaffected: Kör passet clock/pause/wake lock/full screen as before; Slice 31–33 bank + admin login untouched; existing tests pass |
| AC20 | Strings verbatim per `content/microcopy.sv.md`: «Nästa: {title}», «Sista aktiviteten», footer «Träningsplaneraren · Slice 34»; no exclamation marks |
