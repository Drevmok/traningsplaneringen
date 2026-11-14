import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { floorTip } from '../data/activityTips.ts'
import { seedActivities } from '../data/seedActivities.ts'
import type { Activity, Session } from '../types.ts'
import { activityToBankRow, rowToEntry } from './bankRow.ts'
import { parseHowLines } from './ownActivities.ts'
import { runSteps } from './runPass.ts'
import { composeHowTo, howToSteps, isWaitingLine, WAITING_PREFIX, waitingLine } from './waitingLine.ts'

const FOUR = '1. Ett\n2. Två\n3. Tre\n4. Fyra'
const WAIT = 'Medan du väntar: hoppa på stället.'

describe('waitingLine helpers (Slice 61, A1)', () => {
  it('isWaitingLine: prefix with colon, numbering and spaces tolerated', () => {
    assert.equal(isWaitingLine('Medan du väntar: hoppa'), true)
    assert.equal(isWaitingLine('  5. Medan du väntar: hoppa  '), true)
    assert.equal(isWaitingLine('1. Visa hjul'), false)
    assert.equal(isWaitingLine('Medan du väntar hoppa'), false)
  })

  it('waitingLine: last matching line, undefined when missing or empty', () => {
    assert.equal(waitingLine(`${FOUR}\nMedan du väntar: a\nMedan du väntar:  b `), 'Medan du väntar: b')
    assert.equal(waitingLine(FOUR), undefined)
    assert.equal(waitingLine(`${FOUR}\nMedan du väntar:   `), undefined)
  })

  it('parseHowLines: four steps plus waiting line → four steps, no waiting text', () => {
    const steps = parseHowLines(`${FOUR}\n${WAIT}`)
    assert.equal(steps.length, 4)
    assert.ok(!steps.some((s) => s.includes(WAITING_PREFIX)))
    assert.equal(howToSteps(`${FOUR}\n${WAIT}`), FOUR)
  })

  it('composeHowTo: round-trips, empty removes, trims, caps at 800', () => {
    const stored = composeHowTo('Ett\nTvå\nTre\nFyra', '  hoppa på stället.  ')
    assert.equal(stored, `${FOUR}\n${WAIT}`)
    assert.equal(composeHowTo(parseHowLines(stored).join('\n'), 'Medan du väntar: hoppa på stället.'), stored)
    assert.equal(composeHowTo(parseHowLines(stored).join('\n'), '   '), FOUR)
    assert.equal(waitingLine(composeHowTo('Ett', 'x'.repeat(300)))?.length, WAITING_PREFIX.length + 1 + 120)
    const long = Array.from({ length: 4 }, () => 'y'.repeat(180)).join('\n')
    const capped = composeHowTo(long, 'z'.repeat(120))
    assert.ok(capped.length <= 800)
    assert.equal(parseHowLines(capped).length, 4)
  })
})

describe('bank, floor card and Kör passet (Slice 61, D1)', () => {
  const four = seedActivities.find((a) => a.id === 'tech-formhopp-over-block') as Activity

  it('rowToEntry keeps a 4-step row with waiting line; a fifth real step still drops it', () => {
    const row = activityToBankRow(four, 0, floorTip(four).safety ?? null)
    assert.ok(row.how_to.includes(WAITING_PREFIX))
    const entry = rowToEntry(row)
    assert.ok(entry)
    assert.ok(entry.activity.howTo.includes(WAITING_PREFIX))
    const fifth = { ...row, how_to: `${howToSteps(row.how_to)}\n5. Ett femte steg` }
    const quiet = console.warn
    console.warn = () => {}
    try {
      assert.equal(rowToEntry(fifth), null)
    } finally {
      console.warn = quiet
    }
  })

  it('floorTip steps skip the waiting line; runSteps cue stays first step, waiting is the line', () => {
    assert.ok(!floorTip(four).steps.some((s) => s.includes(WAITING_PREFIX)))
    const session = {
      blocks: [{ type: 'techniques', items: [{ id: 'i1', activityId: four.id, order: 0, durationMinutes: 6 }] }],
    } as unknown as Session
    const [step] = runSteps(session)
    assert.equal(step.cue, floorTip(four).steps[0])
    assert.equal(step.waiting, waitingLine(four.howTo))
    assert.ok(step.waiting?.startsWith(WAITING_PREFIX))
  })
})

describe('seed content (Slice 61, B1)', () => {
  const md = readFileSync(new URL('../../../slice-61/content/microcopy.sv.md', import.meta.url), 'utf8')
  const rows = [...md.matchAll(/^\| \d+ \| `(tech-[a-z-]+)` \| [^|]+\| (.+?) \|$/gm)]

  it('the 16 have the exact microcopy line last and still 1–4 steps', () => {
    assert.equal(rows.length, 16)
    for (const [, id, payload] of rows) {
      const a = seedActivities.find((s) => s.id === id)
      assert.ok(a, id)
      assert.equal(a.howTo.split('\n').at(-1), `${WAITING_PREFIX} ${payload}`, id)
      const n = parseHowLines(a.howTo).length
      assert.ok(n >= 1 && n <= 4, `${id}: ${n}`)
    }
  })

  it('the other Teknik have no waiting line', () => {
    const ids = new Set(rows.map((r) => r[1]))
    const rest = seedActivities.filter((a) => a.blockType === 'techniques' && !ids.has(a.id))
    assert.equal(rest.length, 8)
    for (const a of rest) assert.ok(!a.howTo.includes(WAITING_PREFIX), a.id)
  })
})
