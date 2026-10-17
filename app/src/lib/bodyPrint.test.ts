import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PRINT_CLASS, PRINT_STALL_MS, startPassPrint } from './bodyPrint.ts'

function fakeWindow() {
  const classes = new Set<string>()
  const listeners = new Map<string, Set<() => void>>()
  const timers: { fn: () => void; ms: number }[] = []
  const rafs: (() => void)[] = []
  let prints = 0
  const win = {
    document: { body: { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } } },
    addEventListener: (t: string, fn: () => void) => { if (!listeners.has(t)) listeners.set(t, new Set()); listeners.get(t)!.add(fn) },
    removeEventListener: (t: string, fn: () => void) => listeners.get(t)?.delete(fn),
    requestAnimationFrame: (fn: () => void) => { rafs.push(fn); return rafs.length },
    cancelAnimationFrame: () => {},
    setTimeout: (fn: () => void, ms: number) => { timers.push({ fn, ms }); return timers.length },
    clearTimeout: () => {},
    print: () => { prints++ },
  }
  const fire = (t: string) => [...(listeners.get(t) ?? [])].forEach((fn) => fn())
  return { win: win as unknown as Window, classes, fire, timers, rafs, prints: () => prints }
}

describe('Slice 44 startPassPrint (A1/B1)', () => {
  it('adds the class, prints in a rAF and keeps the class after afterprint', () => {
    const f = fakeWindow()
    startPassPrint(f.win, () => {})
    assert.ok(f.classes.has(PRINT_CLASS))
    f.rafs.forEach((fn) => fn())
    assert.equal(f.prints(), 1)
    f.fire('beforeprint'); f.fire('afterprint')
    assert.ok(f.classes.has(PRINT_CLASS))
  })
  it('stalled after 1.5 s when beforeprint never arrives', () => {
    const f = fakeWindow()
    let stalled = false
    startPassPrint(f.win, () => { stalled = true })
    assert.equal(f.timers[0].ms, PRINT_STALL_MS)
    f.timers[0].fn()
    assert.equal(stalled, true)
  })
  it('not stalled when beforeprint fired', () => {
    const f = fakeWindow()
    let stalled = false
    startPassPrint(f.win, () => { stalled = true })
    f.fire('beforeprint')
    f.timers[0].fn()
    assert.equal(stalled, false)
  })
})
