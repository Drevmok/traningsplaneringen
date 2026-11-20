import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { Activity, Session, SessionBlock, SessionItem, StationLayout } from '../types.ts'
import { getActivityById } from '../data/seedActivities.ts'
import { setEphemeralOwn } from './ownActivities.ts'
import {
  clockRemaining,
  formatRunClock,
  pauseClock,
  resumeClock,
  runStationSketch,
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
    hallTemplateId: 'forening-bla',
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

describe('runStationSketch (Slice 64, A1 C1)', () => {
  const eq = [{ pieceId: 'eq-plint', count: 1 }]
  const layout = { v: 1, poses: [] } as unknown as StationLayout
  const own = { ...(getActivityById('tech-ljushopp-satsbrada') as Activity), id: 'own-s64', own: true, defaultStationLayout: layout }
  const pass = (items: Partial<SessionItem>[], type: SessionBlock['type'] = 'techniques') =>
    ({ id: 's', title: '', totalMinutes: 0, notes: '', blocks: [{ id: 'b', type, items: items.map((i, n) => ({ id: `i${n}`, durationMinutes: 5, note: '', order: n, ...i })) }] }) as unknown as Session

  it('seed Teknik with förslag, unset list, no layout → förslag slots, auto row', () => {
    const r = runStationSketch(pass([{ activityId: 'tech-ljushopp-satsbrada' }]), 'i0')
    assert.deepEqual(r?.slots, getActivityById('tech-ljushopp-satsbrada')?.defaultStationEquipment)
    assert.ok(r?.slots.length)
    assert.equal(r?.layout, undefined)
  })

  it('saved layout used while the list is unset or equals the förslag; own list → no layout', () => {
    setEphemeralOwn([own])
    try {
      assert.equal(runStationSketch(pass([{ activityId: own.id }]), 'i0')?.layout, layout)
      assert.equal(runStationSketch(pass([{ activityId: own.id, stationEquipment: own.defaultStationEquipment }]), 'i0')?.layout, layout)
      const mine = runStationSketch(pass([{ activityId: own.id, stationEquipment: eq }]), 'i0')
      assert.deepEqual(mine?.slots, eq)
      assert.equal(mine?.layout, undefined)
    } finally {
      setEphemeralOwn([])
    }
  })

  it('uppvärmning, empty list, no förslag, unknown id → undefined', () => {
    assert.equal(runStationSketch(pass([{ activityId: 'warm-hall-varv' }], 'warmup'), 'i0'), undefined)
    assert.equal(runStationSketch(pass([{ activityId: 'tech-ljushopp-satsbrada', stationEquipment: [] }]), 'i0'), undefined)
    assert.equal(runStationSketch(pass([{ activityId: 'tech-ljushopp-satsbrada' }]), 'nope'), undefined)
    assert.equal(runStationSketch(pass([{ activityId: 'finns-inte' }]), 'i0'), undefined)
  })
})
