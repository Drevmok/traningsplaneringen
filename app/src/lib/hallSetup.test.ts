import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Activity, Session, SessionBlock, SessionItem, StationLayout } from '../types.ts'
import { getActivityById } from '../data/seedActivities.ts'
import { setEphemeralOwn } from './ownActivities.ts'
import { hallSetupSteps } from './hallSetup.ts'

const pass = (items: Partial<SessionItem>[], placed: string[] = [], type: SessionBlock['type'] = 'techniques') =>
  ({
    id: 's',
    title: '',
    totalMinutes: 0,
    notes: '',
    hallPlacements: placed.map((id, n) => ({ sessionItemId: id, x: 0.9 - n * 0.3, y: 0.5 })),
    blocks: [{ id: 'b', type, items: items.map((i, n) => ({ id: `i${n}`, durationMinutes: 5, note: '', order: n, ...i })) }],
  }) as unknown as Session

describe('hallSetupSteps (Slice 65, B1 C1)', () => {
  const tek = ['tech-ljushopp-satsbrada', 'tech-ljushopp-trampett', 'tech-satsbrada-volt-rygg']

  it('placed Teknik follow stationRanks (pass order, not map position), with numbers', () => {
    const steps = hallSetupSteps(pass(tek.map((activityId) => ({ activityId })), ['i2', 'i0', 'i1']))
    assert.deepEqual(steps.map((s) => [s.itemId, s.rank]), [['i0', 1], ['i1', 2], ['i2', 3]])
  })

  it('unplaced Teknik come last without a rank', () => {
    const steps = hallSetupSteps(pass(tek.map((activityId) => ({ activityId })), ['i2']))
    assert.deepEqual(steps.map((s) => [s.itemId, s.rank]), [['i2', 1], ['i0', undefined], ['i1', undefined]])
  })

  it('slots from förslag when unset, own list when set; layout per layoutForStation', () => {
    const eq = [{ pieceId: 'eq-plint', count: 2 }]
    const layout = { v: 1, poses: [] } as unknown as StationLayout
    const own = { ...(getActivityById(tek[0]) as Activity), id: 'own-s65', own: true, defaultStationLayout: layout }
    setEphemeralOwn([own])
    try {
      const [a, b, c] = hallSetupSteps(
        pass([{ activityId: tek[0] }, { activityId: own.id }, { activityId: own.id, stationEquipment: eq }], ['i0', 'i1', 'i2']),
      )
      assert.deepEqual(a.slots, getActivityById(tek[0])?.defaultStationEquipment)
      assert.equal(a.layout, undefined)
      assert.equal(b.layout, layout)
      assert.deepEqual(c.slots, eq)
      assert.equal(c.layout, undefined)
    } finally {
      setEphemeralOwn([])
    }
  })

  it('no Teknik or empty pass → []', () => {
    assert.deepEqual(hallSetupSteps(pass([])), [])
    assert.deepEqual(hallSetupSteps(pass([{ activityId: 'warm-hall-varv' }], [], 'warmup')), [])
  })
})
