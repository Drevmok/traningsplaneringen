import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  needsSafetyLine,
  validateActivityTip,
  validateTipCatalog,
} from './activityTips.ts'
import { seedActivities } from './seedActivities.ts'
import type { Activity } from '../types.ts'

function activity(overrides: Partial<Activity> & Pick<Activity, 'id'>): Activity {
  return {
    title: 'Test',
    blockType: 'techniques',
    durationMinutesDefault: 5,
    summary: 'Varför den finns.',
    howTo: '1. Visa.\n2. Prova.',
    watchFor: 'Håll kön.',
    watchForRequired: true,
    visualKey: 'x',
    difficulty: 'easy',
    tags: [],
    ...overrides,
  }
}

describe('validateActivityTip', () => {
  it('accepts a complete technique tip', () => {
    const drill = activity({
      id: 'tech-ljushopp-satsbrada',
    })
    assert.deepEqual(validateActivityTip(drill), [])
  })

  it('does not require safety on gathering', () => {
    const drill = activity({
      id: 'gather-narvaro',
      blockType: 'gathering',
    })
    assert.equal(needsSafetyLine(drill), false)
    assert.deepEqual(validateActivityTip(drill), [])
  })

  it('flags a technique without a safety line', () => {
    const codes = validateActivityTip(
      activity({ id: 'tech-missing-safety' }),
    ).map((issue) => issue.code)
    assert.deepEqual(codes, ['missing-safety'])
  })

  it('flags empty why, how, and required watch', () => {
    const codes = validateActivityTip(
      activity({
        id: 'gather-empty',
        blockType: 'gathering',
        summary: '  ',
        howTo: '',
        watchFor: '',
      }),
    ).map((issue) => issue.code)
    assert.deepEqual(codes, ['missing-why', 'missing-how', 'missing-watch'])
  })

  it('flags more than four floor steps', () => {
    const codes = validateActivityTip(
      activity({
        id: 'gather-long',
        blockType: 'gathering',
        howTo: '1. A\n2. B\n3. C\n4. D\n5. E',
        watchForRequired: false,
      }),
    ).map((issue) => issue.code)
    assert.deepEqual(codes, ['how-too-long'])
  })
})

describe('validateTipCatalog', () => {
  it('accepts the seeded library', () => {
    assert.deepEqual(validateTipCatalog(seedActivities), [])
  })
})
