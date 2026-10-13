import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { UI } from '../data/blockMeta.ts'
import { runLeftText, runRemainingSeconds } from './runPass.ts'

const L = UI.runLeftLabel
const s = (...secs: number[]) => secs.map((seconds) => ({ seconds }))

describe('Slice 38 runRemainingSeconds / runLeftText', () => {
  it('label is verbatim', () => assert.equal(L, 'Kvar: {n} min'))
  it('middle step: left + later steps', () => {
    assert.equal(runLeftText(s(60, 60, 60), 0, 60, L), 'Kvar: 3 min')
    assert.equal(runRemainingSeconds(s(120, 60, 60), 0, 90), 210)
    assert.equal(runLeftText(s(120, 60, 60), 0, 90, L), 'Kvar: 4 min')
    assert.equal(runLeftText(s(120, 60, 60), 0, 59, L), 'Kvar: 3 min')
  })
  it('rounds up', () => {
    assert.equal(runLeftText(s(120), 0, 61, L), 'Kvar: 2 min')
    assert.equal(runLeftText(s(120), 0, 60, L), 'Kvar: 1 min')
    assert.equal(runLeftText(s(120), 0, 1, L), 'Kvar: 1 min')
    assert.equal(runLeftText(s(120), 0, 0, L), 'Kvar: 0 min')
  })
  it('last step at 0 → 0; earlier step at 0 → later steps only', () => {
    assert.equal(runLeftText(s(60, 60, 60), 2, 0, L), 'Kvar: 0 min')
    assert.equal(runLeftText(s(60, 60, 120), 0, 0, L), 'Kvar: 3 min')
  })
  it('0-second steps add nothing; empty tail and negative left work', () => {
    assert.equal(runRemainingSeconds(s(60, 0, 0), 0, 30), 30)
    assert.equal(runRemainingSeconds([], 0, 0), 0)
    assert.equal(runRemainingSeconds(s(60), 0, -5), 0)
  })
})
