import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { playRunSignal, resetRunSignalForTests, shouldSignal, unlockRunSignal } from './runSignal.ts'
import { clockRemaining, pauseClock, resumeClock, runNextText, startClock } from './runPass.ts'

/** Drives the same rule RunPass uses: a fired key per clock run. */
function sim() {
  let fired: string | null = null
  let count = 0
  return {
    tick(clock: ReturnType<typeof startClock>, now: number, startSeconds: number) {
      const left = clockRemaining(clock, now)
      if (shouldSignal(fired, clock.run, left, clock.paused, startSeconds)) {
        fired = clock.run
        count++
      }
      return count
    },
  }
}

describe('shouldSignal (Slice 34, fire once at 0)', () => {
  it('fires once at 0 and never again while it stays at 0', () => {
    const s = sim()
    const c = startClock(0, 60, 0)
    assert.equal(s.tick(c, 59_000, 60), 0)
    assert.equal(s.tick(c, 60_000, 60), 1)
    for (let t = 60_200; t < 120_000; t += 200) s.tick(c, t, 60)
    assert.equal(s.tick(c, 120_000, 60), 1)
  })
  it('pause before 0 → silent while paused, once after resume at 0', () => {
    const s = sim()
    let c = startClock(0, 60, 0)
    c = pauseClock(c, 55_000)
    assert.equal(s.tick(c, 200_000, 60), 0)
    c = resumeClock(c, 200_000)
    assert.equal(s.tick(c, 204_000, 60), 0)
    assert.equal(s.tick(c, 205_000, 60), 1)
  })
  it('pause after 0 and resume → no second tone', () => {
    const s = sim()
    let c = startClock(0, 60, 0)
    assert.equal(s.tick(c, 61_000, 60), 1)
    c = pauseClock(c, 62_000)
    assert.equal(s.tick(c, 63_000, 60), 1)
    c = resumeClock(c, 64_000)
    assert.equal(s.tick(c, 65_000, 60), 1)
  })
  it('0-second step never fires on open', () => {
    const s = sim()
    assert.equal(s.tick(startClock(1, 0, 0), 0, 0), 0)
  })
  it('manual navigation starts a new clock (no tone); a re-run of a step may fire again', () => {
    const s = sim()
    const a = startClock(0, 60, 0)
    assert.equal(s.tick(a, 10_000, 60), 0)
    const b = startClock(1, 60, 10_000)
    assert.equal(s.tick(b, 10_000, 60), 0)
    assert.equal(s.tick(b, 70_000, 60), 1)
    const back = startClock(0, 60, 80_000)
    assert.equal(s.tick(back, 140_000, 60), 2)
  })
  it('backgrounded past the deadline → one tone on return, not several', () => {
    const s = sim()
    const c = startClock(0, 60, 0)
    assert.equal(s.tick(c, 600_000, 60), 1)
    assert.equal(s.tick(c, 600_200, 60), 1)
  })
})

describe('runNextText (Slice 34)', () => {
  const steps = [{ title: 'Hoppa hage' }, { title: 'Kullerbytta' }, { title: 'Ljushopp' }]
  it('middle and block-boundary step → next title; last → Sista aktiviteten', () => {
    assert.equal(runNextText(steps, 0, 'Nästa: {title}', 'Sista aktiviteten'), 'Nästa: Kullerbytta')
    assert.equal(runNextText(steps, 1, 'Nästa: {title}', 'Sista aktiviteten'), 'Nästa: Ljushopp')
    assert.equal(runNextText(steps, 2, 'Nästa: {title}', 'Sista aktiviteten'), 'Sista aktiviteten')
  })
})

describe('runSignal without / with audio (Slice 34)', () => {
  afterEach(() => {
    resetRunSignalForTests()
    Reflect.deleteProperty(globalThis, 'window')
  })
  it('no window / AudioContext / vibrate → no throw', () => {
    unlockRunSignal()
    playRunSignal()
  })
  it('unlock makes one context (+ silent prime); play makes one non-looping oscillator', () => {
    const log: string[] = []
    class FakeCtx {
      state = 'suspended'
      currentTime = 1
      destination = {}
      constructor() {
        log.push('new')
      }
      resume() {
        log.push('resume')
        this.state = 'running'
        return Promise.resolve()
      }
      createBuffer() {
        return {}
      }
      createBufferSource() {
        return { connect() {}, start: () => log.push('prime') }
      }
      createGain() {
        const g = { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (d: unknown) => d, disconnect() {} }
        return g
      }
      createOscillator() {
        const o = { type: '', frequency: { value: 0 }, loop: undefined, onended: null, connect: (g: unknown) => g, disconnect() {}, start: () => log.push('start'), stop: (t: number) => log.push(`stop@${t}`) }
        return o
      }
    }
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: FakeCtx } })
    unlockRunSignal()
    unlockRunSignal()
    playRunSignal()
    assert.deepEqual(log, ['new', 'prime', 'resume', 'start', 'stop@1.3'])
  })
})
