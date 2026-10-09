# Slice 34 — Builder handoff

**Status:** LOCKED 2026-10-09. Scope: `app/src/components/RunPass.tsx`, a tiny helper (e.g. `app/src/lib/runSignal.ts`), `UI` keys in `app/src/data/blockMeta.ts`, a few lines of CSS, tests. Nothing else.

## What exists today (main @ f987da8)

- `RunPass.tsx` is the Kör passet overlay. It is opened by the **Kör passet** button (`SessionBuilder.tsx:417`, `SharePass.tsx:58`) via `setRunSession` in `App.tsx`.
- `runSteps(session)` (`lib/runPass.ts`) flattens the pass: `BLOCK_ORDER`, then items by `order`. Each item = one step ("aktivitet"/"station" are the same thing here: one row in the pass). `title` = `activity.title` (full title; the Slice 17 short title is used only on Golvklart/print, **not** in Kör passet — keep using `step.title`).
- The clock **starts automatically** when the overlay mounts (`startClock(0, …)`) and restarts on every step change (`go`, arrow keys). Tapping the clock toggles pause/resume. There is **no Starta button inside run mode**.
- 00:00 shows `runTimeUp` («Tiden är ute», `role="status"`). Best-effort wake lock already exists — leave it alone (E1).

## 1. AudioContext unlock (B1)

- iOS only lets audio start inside a user gesture. The gesture that starts the run is the tap on **Kör passet**. Create (or `resume()`) one shared `AudioContext` synchronously inside that click handler, before `setRunSession`. A module-level lazy singleton in `runSignal.ts` is enough: `unlockRunSignal()` called from the Kör passet click, `playRunSignal()` called at 0.
- Fallback: also call `unlockRunSignal()` on the clock tap and on Föregående/Nästa övning taps (cheap, idempotent), so a context that iOS suspended (e.g. after backgrounding) recovers on the next tap.
- Optional iOS nicety: play a 1-sample silent buffer or a zero-gain oscillator on unlock. Not required if `resume()` inside the gesture works on the test iPhone.
- If `window.AudioContext ?? window.webkitAudioContext` is missing, do nothing. Wrap everything in `try/catch`; never surface an error.
- Do **not** create the context on page load or outside Kör passet (F1).

## 2. Tone sketch (A1)

```ts
export function playRunSignal(ctx: AudioContext) {
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02)   // attack, no click
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28) // decay
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.3)
  osc.onended = () => { osc.disconnect(); gain.disconnect() }
}
```

~0.25–0.3 s sine, gain envelope to avoid clicks. No `loop`, no repeat, no `<audio>`, no file. Respect the device: no attempt to bypass the iPhone silent switch (WebAudio on iOS follows it by default — do not set `navigator.audioSession.type = 'playback'` or similar).

## 3. Vibrate guard (A1)

```ts
if (typeof navigator.vibrate === 'function') { try { navigator.vibrate(200) } catch {} }
```

Single pulse, no pattern loop. iPhone Safari has no `vibrate` → skipped silently, no console error.

## 4. Fire exactly once at 0 (D1)

- Key the signal on the step: keep a `firedFor = useRef<number | null>(null)` (step index + a run/restart counter, or the clock object identity). When `left === 0 && !paused && clock.index === index && firedFor.current !== key` → fire, set `firedFor.current = key`.
- Reset the key whenever a **new clock** starts (`go`, arrow keys, overlay open). Going back to a step and running it again may fire again — that is a new run of that step.
- Pause/resume: pausing at, say, 00:05 and resuming must fire once when it later reaches 0. Pausing **after** 0 and resuming must **not** fire again. A paused clock never fires.
- Steps with 0 seconds (`durationMinutes` 0/invalid → `seconds` 0): do **not** fire on open (there was no countdown). Rule: fire only if the step's start seconds > 0.
- Backgrounding/lock: the interval stops while hidden. On return, if the deadline has passed and this step hasn't fired, it is OK to fire once on return (or skip — pick one and note it in the PR; Verifier tests "at most once"). Never queue several tones.
- Don't fire on manual Nästa/Föregående, on close (Avsluta), or on unmount. Close the `AudioContext`? Not needed; just stop using it. Never auto-advance.

## 5. «Nästa» line (C1)

- Source: `steps[index + 1]?.title` from the same `runSteps` list, so ordering follows the pass exactly: `BLOCK_ORDER`, then `order` within a block, across block boundaries (last item of Uppvärmning → first item of the next block).
- Render one `<p className="run-next">` directly under the clock (below `run-status`/`run-timeup` if shown, or directly under the clock button — Builder's choice, but under the timer, above `run-script`).
- Text: `UI.runNextLabel.replace('{title}', next.title)`; last step: `UI.runLastActivity`.
- One line: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%`. Quiet grey (`--muted`-style token already in use for `run-kicker`), normal size, no icon. No horizontal scroll at 390 px.
- No live region on this line (it changes on every step and would be noisy).

## 6. Screen reader (quiet)

- Existing `runTimeUp` already has `role="status"`; no extra announcement needed. Do not add a second live region.

## 7. Budget (F1)

- Measure: `cd app && npm run build` on main and on the branch, then `gzip -9c dist/assets/index-*.js | wc -c` (sum all JS + CSS chunks). Delta must be < 1024 bytes. Put both numbers in the PR description.
- No dependency added.

## 8. Tests

- Unit test for the "fire once" rule (pure helper, e.g. `shouldSignal(prevKey, key, left, paused, startSeconds)`), including pause-before-0, pause-after-0, 0-second step, manual navigation.
- Unit/render test for the Nästa line: middle step, block boundary, last step → `Sista aktiviteten`.
- Mock `AudioContext`/`vibrate` in tests; jsdom has neither — the code must not throw without them.
- Footer: `footerSliceLabel` → «Träningsplaneraren · Slice 34».

## Open for Builder

1. Fire-on-return after backgrounding: fire once or skip (document choice).
2. Confirm on a real iPhone that `resume()` in the Kör passet click is enough (otherwise add the silent-buffer prime).
3. Exact placement of the Nästa line relative to `Tiden är ute`.
