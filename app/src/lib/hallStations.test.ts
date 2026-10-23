import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { Session, SessionBlock } from '../types.ts'
import { flowSegments, placeableItems, stationRanks, techniqueIndexFor } from './hall.ts'
import { autoPlaceUnplaced } from './hallSuggest.ts'
import { addItemToBlock, moveTechniqueTo, removeItem } from './session.ts'
import { DRAG_THRESHOLD, dropIndex, pastThreshold } from './pointerDrag.ts'

const TECH = ['tech-ljushopp-satsbrada', 'tech-satsbrada-volt-rygg', 'tech-trampett-volt-mattberg']

function session(): Session {
  const blocks: SessionBlock[] = BLOCK_ORDER.map((type) => ({
    id: `block-${type}`,
    type,
    title: BLOCK_LABELS[type],
    durationMinutes: BLOCK_BUDGETS[type],
    coachNote: '',
    items:
      type === 'techniques'
        ? TECH.map((activityId, order) => ({
            id: `t${order}`,
            activityId,
            durationMinutes: 6,
            note: '',
            order,
          }))
        : type === 'warmup'
          ? [{ id: 'w0', activityId: 'warm-tag-lek', durationMinutes: 5, note: '', order: 0 }]
          : [],
  }))
  return {
    id: 's',
    title: 'Test',
    totalMinutes: 23,
    notes: '',
    blocks,
    hallTemplateId: 'forening-bla',
    hallPlacements: [
      { sessionItemId: 't0', x: 0.2, y: 0.2 },
      { sessionItemId: 't1', x: 0.5, y: 0.5 },
      { sessionItemId: 't2', x: 0.8, y: 0.8 },
    ],
  }
}

const ids = (s: Session) => placeableItems(s).map((i) => i.id)
const teknik = (s: Session) => s.blocks.find((b) => b.type === 'techniques')!

describe('Slice 48 D1 — moveTechniqueTo', () => {
  it('moves first → last and last → first', () => {
    assert.deepEqual(ids(moveTechniqueTo(session(), 't0', 2)), ['t1', 't2', 't0'])
    assert.deepEqual(ids(moveTechniqueTo(session(), 't2', 0)), ['t2', 't0', 't1'])
  })

  it('same place and unknown id return the same session', () => {
    const s = session()
    assert.equal(moveTechniqueTo(s, 't1', 1), s)
    assert.equal(moveTechniqueTo(s, 'nope', 0), s)
  })

  it('rewrites order to 0..n−1 and leaves other blocks and placements alone', () => {
    const s = session()
    const next = moveTechniqueTo(s, 't2', 0)
    const orders = [...teknik(next).items].sort((a, b) => a.order - b.order).map((i) => i.order)
    assert.deepEqual(orders, [0, 1, 2])
    assert.equal(next.blocks.find((b) => b.type === 'warmup'), s.blocks.find((b) => b.type === 'warmup'))
    assert.equal(next.hallPlacements, s.hallPlacements)
  })

  it('ranks and flow follow the new order', () => {
    const next = moveTechniqueTo(session(), 't2', 0)
    const ranks = stationRanks(next)
    assert.equal(ranks.get('t2'), 1)
    assert.equal(ranks.get('t0'), 2)
    assert.equal(ranks.get('t1'), 3)
    assert.equal(flowSegments(next)[0]?.fromId, 't2')
  })

  it('techniqueIndexFor maps list slots to block indexes', () => {
    const s = session()
    assert.equal(techniqueIndexFor(s, 't2', 0), 0)
    assert.equal(techniqueIndexFor(s, 't0', 2), 2)
    assert.equal(techniqueIndexFor(s, 't0', 1), 1)
  })
})

describe('Slice 48 E1 — remove + undo, add', () => {
  it('remove drops the station and its placement; the kept before-pass restores both', () => {
    const before = session()
    const after = removeItem(before, 'block-techniques', 't1')
    assert.deepEqual(ids(after), ['t0', 't2'])
    assert.ok(!(after.hallPlacements ?? []).some((p) => p.sessionItemId === 't1'))
    // Undo is one level: the hall puts `before` back as-is.
    assert.deepEqual(ids(before), ['t0', 't1', 't2'])
    assert.ok((before.hallPlacements ?? []).some((p) => p.sessionItemId === 't1'))
  })

  it('add lands last in Teknik and gets a free placement', () => {
    const s = session()
    const added = addItemToBlock(s, 'block-techniques', 'tech-rondat-flickis', 6)
    const next = autoPlaceUnplaced(added)
    const list = ids(next)
    assert.equal(list.length, 4)
    const fresh = list[3]
    const p = (next.hallPlacements ?? []).find((pl) => pl.sessionItemId === fresh)
    assert.ok(p)
    const taken = (s.hallPlacements ?? []).map((pl) => `${pl.x},${pl.y}`)
    assert.ok(!taken.includes(`${p!.x},${p!.y}`))
  })
})

describe('Slice 48 C1 — pointerDrag logic', () => {
  it('threshold is 6 px', () => {
    assert.equal(DRAG_THRESHOLD, 6)
    assert.equal(pastThreshold(3, 4), false)
    assert.equal(pastThreshold(6, 0), true)
    assert.equal(pastThreshold(-4, -5), true)
  })

  it('dropIndex counts midpoints above y', () => {
    const mids = [100, 150, 200]
    assert.equal(dropIndex(50, mids), 0)
    assert.equal(dropIndex(120, mids), 1)
    assert.equal(dropIndex(250, mids), 3)
  })
})
