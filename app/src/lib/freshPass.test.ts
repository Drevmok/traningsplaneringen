import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { seedActivities } from '../data/seedActivities.ts'
import { cloneTemplate, createBlankSession, createSessionItem, updateItemDuration } from './session.ts'
import { coachStationCount, isEmptyPass, isFreshPass, markFresh, noteChange } from './freshPass.ts'
import { seedTemplates } from '../data/seedTemplates.ts'

const tech = seedActivities.find((a) => a.blockType === 'techniques')!.id

describe('Slice 42 freshPass', () => {
  it('blank Tomt pass: empty and fresh; soft pair is not content', () => {
    const s = createBlankSession()
    assert.equal(coachStationCount(s), 0)
    assert.ok(isEmptyPass(s) && isFreshPass(s))
  })
  it('one bank station → not empty, not fresh', () => {
    const s = createBlankSession()
    s.blocks.find((b) => b.type === 'techniques')!.items.push(createSessionItem(tech, 5, 0))
    assert.equal(coachStationCount(s), 1)
    assert.ok(!isEmptyPass(s) && !isFreshPass(s))
  })
  it('typed title → 0 coach stations but not empty / not fresh', () => {
    const s = { ...createBlankSession(), title: 'Tisdag' }
    assert.equal(coachStationCount(s), 0)
    assert.ok(!isEmptyPass(s) && !isFreshPass(s))
  })
  it('pass note or block note → not empty', () => {
    const s = createBlankSession()
    assert.ok(!isEmptyPass({ ...s, notes: 'x' }))
    assert.ok(!isEmptyPass({ ...s, blocks: s.blocks.map((b, i) => (i ? b : { ...b, coachNote: 'x' })) }))
  })
  it('removing soft items keeps it empty', () => {
    const s = createBlankSession()
    assert.ok(isEmptyPass({ ...s, blocks: s.blocks.map((b) => ({ ...b, items: [] })) }))
  })
  it('marked mall clone is fresh; a minute change ends it, also when put back by hand', () => {
    const m = cloneTemplate(seedTemplates[0])
    assert.ok(!isFreshPass(m))
    markFresh(m)
    assert.ok(isFreshPass(m))
    const b = m.blocks.find((x) => x.items.length)!
    const it0 = b.items[0]
    const changed = updateItemDuration(m, b.id, it0.id, it0.durationMinutes + 1)
    noteChange(changed)
    assert.ok(!isFreshPass(changed))
    assert.ok(!isFreshPass(updateItemDuration(changed, b.id, it0.id, it0.durationMinutes)))
  })
})
