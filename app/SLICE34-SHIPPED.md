# Slice 34 — Kör passet: tone at 0 + «Nästa: …» — SHIPPED (local branch, not pushed, do not merge)

**Date:** 2026-10-09 (Europe/Stockholm) · **Branch:** `slice-34-code` from `origin/slice-34-docs` @ `337f8d3` (main `f987da8`). No upstream, no push.
**Self-smoke:** `verifier/slice-34-builder-smoke.mjs` → **PASS 31 / FAIL 0** at 390×844 (AudioContext + vibrate spied, Playwright fake clock). Screenshots `/workspace/screenshots/slice34_*.png` (5).

## What shipped
- `app/src/lib/runSignal.ts` (new). `unlockRunSignal()` creates one lazy `AudioContext`, primes it and resumes it. It runs in the Kör passet click (Passbyggaren + delat pass) and again on clock and Föregående/Nästa taps. `playRunSignal()` plays one 880 Hz sine of about 0.3 s with a soft envelope, plus `navigator.vibrate(200)` where available. `shouldSignal()` is the pure fire-once rule. Everything is wrapped in try/catch; with no API, nothing happens.
- `runPass.ts`: `RunClock.run` gives each clock run its own identity (new on every start, kept by pause and resume). `runNextText()` builds the next-step line.
- `RunPass.tsx`: fires once per clock run at 0 (`firedFor` ref), only while running and only if the step started with more than 0 seconds. It never advances. Adds `<p class="run-next">` (no live region).
- `blockMeta.ts`: `runNextLabel` «Nästa: {title}», `runLastActivity` «Sista aktiviteten», footer «Träningsplaneraren · Slice 34».
- `export.css`: `.run-next` is one grey line with ellipsis.
- Tests: `runSignal.test.ts` (new).

## Decisions
**(a) Backgrounded past 0 → fire once on return.** The interval stops while the app is hidden. On the first tick back, `left === 0` and this clock run hasn't fired yet, so it fires once; the `firedFor` key prevents any repeat. Reasoning: it tells the coach time ran out while they weren't looking, and it can never queue or repeat. If iOS suspended the context while the app was in the background, this late tone may stay silent until the next tap resumes the context. That is acceptable, because the pack only requires "at most once".

**(b) Silent buffer prime + `resume()`, both inside the tap.** The first unlock plays a 1-sample silent `AudioBufferSource` and then calls `resume()`. Older iOS Safari, and some home-screen app cases, only unlock output when something actually starts playing inside the gesture; `resume()` alone isn't reliably enough. The prime costs a few bytes and nothing is audible, so this is the robust option. I didn't verify it on a real iPhone (no device here); that is AC6/7 for Verifier.

**(c) Placement:** clock → «Pausad» / «Tiden är ute» → **Nästa line** → script. The status lines belong to the clock, so they stay directly under it. The Nästa line comes after them, still under the timer and above the script (see `slice34_step1_timeup_next.png`).

**(d) Bundle** (sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, plain build):

| | main f987da8 | slice-34-code | Δ |
|---|---|---|---|
| all JS + CSS | 212 912 B | 213 408 B | **+496 B** (< 1024) |
| `index-*.js` | 133 510 B | 133 990 B | +480 B |
| `index-*.css` | 14 020 B | 14 038 B | +18 B |

## Tests
- `bun test src`: **139 pass / 0 fail** (19 files).
- `bun test tools/bank`: **21 pass / 5 skip / 0 fail**.
- `npm run build` (tsc + vite) green.
- oxlint: no new warnings; the one warning in `RunPass.tsx` (`onCloseRef.current = onClose`) is pre-existing.

## Not covered (real device)
- AC6 and AC7 on a real iPhone: the unlock, and the silent switch.
- AC8: a real Android buzz.
- AC9: a real iPhone has no vibrate.
- AC10: real backgrounding.
- AC15: locked screen (documented, no coach-facing text).

The smoke covers proxies for AC6, 8, 9 and 10.

## Deviations
- `RunClock` gained a `run` field (an internal identity for the fire-once key). There is no behaviour change.
- The smoke tests the long-title ellipsis (AC13) by injecting a long text into the Nästa line, because no seed title is long enough to overflow at 390 px.
