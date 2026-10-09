/**
 * Slice 34 — the one short tone (+ buzz where supported) when a Kör passet step reaches 0.
 *
 * One shared AudioContext, created lazily inside the Kör passet tap (iOS only starts audio in a
 * user gesture) and never on page load. Every call is best effort: no AudioContext / no
 * vibrate → nothing happens, never an error. No file, no loop, no override of the silent switch.
 */
type Ctor = typeof AudioContext

let ctx: AudioContext | null = null

function audioCtor(): Ctor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return w.AudioContext ?? w.webkitAudioContext
}

/** Call synchronously inside a tap (Kör passet, clock, Föregående/Nästa). Idempotent. */
export function unlockRunSignal(): void {
  try {
    if (!ctx) {
      const C = audioCtor()
      if (!C) return
      ctx = new C()
      // Prime with a 1-sample silent buffer inside the gesture: older iOS Safari only
      // unlocks output when something actually plays in the tap, resume() alone may not.
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  } catch {
    // no sound is fine
  }
}

/** One ~0.3 s 880 Hz sine with a soft envelope, plus one 200 ms buzz where supported. */
export function playRunSignal(): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(200)
  } catch {
    // ignore
  }
  try {
    const c = ctx
    if (!c) return
    if (c.state === 'suspended') void c.resume().catch(() => {})
    const t = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.3)
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  } catch {
    // no sound is fine
  }
}

/**
 * Fire rule (pure): only a running clock, at 0, for a step that had a countdown,
 * and only once per clock run (`key` changes when a new clock starts for a step).
 */
export function shouldSignal(firedKey: string | null, key: string, left: number, paused: boolean, startSeconds: number): boolean {
  return !paused && left === 0 && startSeconds > 0 && firedKey !== key
}

/** Tests only. */
export function resetRunSignalForTests(): void {
  ctx = null
}
