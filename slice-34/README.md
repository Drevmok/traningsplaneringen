# Slice 34 — Kör passet: signal vid 0 + «Nästa: …»

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-09.** Christoffer approved 2026-10-09; Planner locked A1–F1 under his standing OK for small slices. Docs pack only, no app code. Branch `slice-34-docs` from `main` @ `f987da8` (Slice 33 merge).  
**Source:** Scout outside sweep 2026-10, idea #1 (PR #36, `backlog/IMPROVEMENTS.md`). **Effort:** S.

## Why

A new coach watches and spots gymnasts, not the phone. Today the clock in **Kör passet** reaches 00:00 silently (only the `runTimeUp` text), so stations overrun. A short tone (and a buzz on Android) plus one line saying what comes next lets the coach call the switch and prep the next redskap without reading the screen.

**Coach outcome:** "När tiden är ute hör jag en kort ton, och under klockan ser jag vad som kommer sen."

## Locks

| Lock | Decision |
|---|---|
| **A1** | One short tone generated with WebAudio (`OscillatorNode`, no audio file) when a step's timer hits 0. `navigator.vibrate` where supported (Android). iPhone gets the tone only. |
| **B1** | No new buttons, settings or screens. The phone's volume and silent switch are the only controls. The `AudioContext` is unlocked/resumed on the coach's first tap that starts the run (see HANDOFF §1 — today that tap is **Kör passet**; there is no separate Starta button in run mode), as iOS requires. |
| **C1** | One text line under the timer: «Nästa: {title}». On the last step: «Sista aktiviteten». |
| **D1** | The tone plays once per step, never loops, and nothing advances automatically. The coach still taps **Nästa övning**. |
| **E1** | No wake-lock fight (keep today's best-effort wake lock as is). If the screen locks, no sound is guaranteed. Noted in docs; no coach-facing note in this slice (see microcopy). |
| **F1** | Nothing changes outside Kör passet. Bundle grows by **< 1 kB gzipped**. |

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC20
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — final Swedish + keys

## Out of scope

Sound settings, mute button, choice of tone, countdown beeps (3-2-1), auto-advance, background/locked-screen alerts, notifications, audio files.
