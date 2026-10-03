import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { seedTemplates } from '../../data/seedTemplates.ts'
import { formatBankDate, idsUsedByMallsOrWizard, lastChangedText, parseStartTime } from './adminFormat.ts'

const NOW = new Date('2026-10-03T08:00:00Z')

describe('adminFormat (Slice 32)', () => {
  it('formats dates in Stockholm, year only when not this year', () => {
    assert.equal(formatBankDate('2026-10-02T10:00:00Z', NOW), '2 okt')
    assert.equal(formatBankDate('2026-09-30T22:30:00Z', NOW), '1 okt') // after midnight in Stockholm
    assert.equal(formatBankDate('2025-03-05T10:00:00Z', NOW), '5 mar 2025')
    assert.equal(formatBankDate('nonsense', NOW), '')
  })
  it('last changed line by who', () => {
    assert.equal(lastChangedText('2026-10-02T10:00:00Z', 'seed-script', NOW), 'Oförändrad sedan 2 okt')
    assert.equal(lastChangedText('2026-10-02T10:00:00Z', 'bot:planner', NOW), 'Senast ändrad 2 okt av Planner')
    assert.equal(lastChangedText('2026-10-02T10:00:00Z', 'c@x.se', NOW), 'Senast ändrad 2 okt av c@x.se')
    assert.equal(lastChangedText('2026-10-02T10:00:00Z', null, NOW), 'Senast ändrad 2 okt')
    assert.equal(lastChangedText('2026-10-02T10:00:00Z', 'service', NOW), 'Senast ändrad 2 okt')
  })
  it('knows ids used by malls and Planera pass paths', () => {
    const ids = idsUsedByMallsOrWizard()
    const fromMall = seedTemplates[0].blocks.flatMap((b) => b.items)[0].activityId
    assert.ok(ids.has(fromMall))
    assert.ok(ids.size > 10)
  })
  it('parses start times', () => {
    assert.equal(parseStartTime(''), undefined)
    assert.equal(parseStartTime('0:16'), 16)
    assert.equal(parseStartTime('1:02:05'), 3725)
    assert.equal(parseStartTime('1:75'), null)
    assert.equal(parseStartTime('abc'), null)
  })
})
