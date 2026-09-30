import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { Session, SessionBlock } from '../types.ts'
import {
  clockRemaining,
  formatRunClock,
  pauseClock,
  resumeClock,
  runSteps,
  startClock,
} from './runPass.ts'

function session(): Session {
  const blocks: SessionBlock[] = BLOCK_ORDER.map((type) => ({
    id: `block-${type}`,
    type,
    title: BLOCK_LABELS[type],
    durationMinutes: BLOCK_BUDGETS[type],
    coachNote: '',
    items: [],
  }))
  const byType = new Map(blocks.map((b) => [b.type, b]))
  byType.get('techniques')!.items.push({
    id: 'vault',
    activityId: 'tech-ljushopp-satsbrada',
    durationMinutes: 6,
    note: '',
    order: 0,
  })
  byType.get('gathering')!.items.push({
    id: 'hello',
    activityId: 'gather-valkomstcheck-in',
    durationMinutes: 5,
    note: '',
    order: 0,
  })
  byType.get('fun_and_games')!.items.push({
    id: 'moved',
    activityId: 'warm-hall-varv',
    durationMinutes: 4,
    note: '',
    order: 0,
  })
  return {
    id: 's',
    title: 'Test',
    totalMinutes: 15,
    notes: '',
    blocks: [...blocks].reverse(),
    hallTemplateId: 'standard-trupp',
    hallPlacements: [],
  }
}

describe('runSteps', () => {
  it('walks the pass, not the map, and keeps the cue to the first step', () => {
    const steps = runSteps(session())
    assert.deepEqual(
      steps.map((s) => s.itemId),
      ['hello', 'vault', 'moved'],
    )
    assert.equal(steps[0]?.blockLabel, 'Samling')
    assert.equal(steps[0]?.cue, 'Samla gymnasterna så alla syns och hör.')
    assert.equal(steps[0]?.safety, undefined)
    assert.equal(steps[0]?.seconds, 300)
    assert.equal(steps[1]?.title, 'Ljushopp på satsbräda')
    assert.match(steps[1]?.safety ?? '', /En i taget/)
    assert.equal(steps[1]?.experienced, false)
    assert.equal(steps[2]?.blockLabel, 'Lek och spel')
    assert.match(steps[2]?.safety ?? '', /Handstående/)
  })

  it('marks experienced-only drills', () => {
    const base = session()
    const tech = base.blocks.find((b) => b.type === 'techniques')
    tech!.items = [
      {
        id: 'flick',
        activityId: 'tech-rondat-flickis',
        durationMinutes: 8,
        note: '',
        order: 0,
      },
    ]
    const steps = runSteps(base).filter((s) => s.itemId === 'flick')
    assert.equal(steps[0]?.experienced, true)
  })
})

describe('formatRunClock', () => {
  it('pads minutes and seconds', () => {
    assert.equal(formatRunClock(0), '00:00')
    assert.equal(formatRunClock(65), '01:05')
    assert.equal(formatRunClock(600), '10:00')
    assert.equal(formatRunClock(-4), '00:00')
  })
})

describe('clock', () => {
  it('pauses and resumes without giving time back', () => {
    const started = startClock(0, 10, 1_000)
    const paused = pauseClock(started, 6_000)
    assert.equal(clockRemaining(paused, 9_000), 5)
    const again = resumeClock(paused, 9_000)
    assert.equal(clockRemaining(again, 11_000), 3)
    assert.equal(clockRemaining(again, 20_000), 0)
  })
})
