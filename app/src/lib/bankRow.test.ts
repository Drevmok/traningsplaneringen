import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { floorTip } from '../data/activityTips.ts'
import { seedActivities } from '../data/seedActivities.ts'
import type { Activity } from '../types.ts'
import { activityToBankRow, rowToActivity, rowToEntry, type BankRow } from './bankRow.ts'

const quiet = console.warn
function silently<T>(fn: () => T): T {
  console.warn = () => {}
  try {
    return fn()
  } finally {
    console.warn = quiet
  }
}

function rowOf(a: Activity, index = 0): BankRow {
  return activityToBankRow(a, index, floorTip(a).safety ?? null)
}

const teknik = seedActivities.find((a) => a.id === 'tech-formhopp-over-block') as Activity

describe('rowToActivity — parity with the bundled seeds (AC 7)', () => {
  it('maps every seed row back to the same Activity, plus safetyLine', () => {
    assert.equal(seedActivities.length, 51)
    seedActivities.forEach((seed, index) => {
      const safety = floorTip(seed).safety
      const expected: Activity = safety ? { ...seed, safetyLine: safety } : { ...seed }
      assert.deepStrictEqual(rowToActivity(rowOf(seed, index)), expected, seed.id)
    })
  })

  it('keeps redskap, tags, links and Källa verbatim', () => {
    const a = rowToActivity(rowOf(teknik)) as Activity
    assert.deepEqual(a.defaultStationEquipment, teknik.defaultStationEquipment)
    assert.deepEqual(a.tags, teknik.tags)
    assert.equal(a.progressionOf, teknik.progressionOf)
    assert.deepEqual(a.source, teknik.source)
    assert.equal(a.tags.includes('egen'), false)
  })
})

describe('rowToActivity — guards (AC 11)', () => {
  it('drops rows with 6 steps, missing Säkerhet off Samling, an unknown block, or a pending status', () => {
    silently(() => {
      assert.equal(rowToActivity({ ...rowOf(teknik), how_to: '1. a\n2. b\n3. c\n4. d\n5. e\n6. f' }), null)
      assert.equal(rowToActivity({ ...rowOf(teknik), safety_line: null }), null)
      assert.equal(rowToActivity({ ...rowOf(teknik), block_type: 'cardio' }), null)
      assert.equal(rowToActivity({ ...rowOf(teknik), status: 'pending' }), null)
      assert.equal(rowToActivity({ ...rowOf(teknik), id: 'own-sneaky' }), null)
      assert.equal(rowToActivity({ ...rowOf(teknik), title: 'x'.repeat(81) }), null)
      assert.equal(rowToActivity(null), null)
    })
  })

  it('Samling may have no Säkerhet', () => {
    const gather = seedActivities.find((a) => a.blockType === 'gathering') as Activity
    const a = rowToActivity(rowOf(gather))
    assert.ok(a)
    assert.equal(a.safetyLine, undefined)
  })

  it('drops unknown redskap ids, a non-https Källa and redskap off Teknik — keeps the row', () => {
    const a = rowToActivity({
      ...rowOf(teknik),
      default_station_equipment: [{ pieceId: 'eq-trampett', count: 1 }, { pieceId: 'eq-jetpack', count: 2 }],
      source: { url: 'http://example.com', creator: 'X' },
    }) as Activity
    assert.deepEqual(a.defaultStationEquipment, [{ pieceId: 'eq-trampett', count: 1 }])
    assert.equal(a.source, undefined)
    const warm = seedActivities.find((x) => x.blockType === 'warmup') as Activity
    const w = rowToActivity({ ...rowOf(warm), default_station_equipment: [{ pieceId: 'eq-trampett', count: 1 }] }) as Activity
    assert.equal(w.defaultStationEquipment, undefined)
  })

  it('reads status and sort order', () => {
    const e = rowToEntry({ ...rowOf(teknik, 4), status: 'hidden' })
    assert.equal(e?.status, 'hidden')
    assert.equal(e?.sortOrder, 50)
  })
})

describe('Slice 57 — default_station_layout', () => {
  const slots = teknik.defaultStationEquipment ?? []
  const layout = {
    v: 1 as const,
    poses: slots.flatMap((s) =>
      Array.from({ length: s.count }, (_, i) => ({ pieceId: s.pieceId, x: 0.1 + i * 0.1, z: 0.3, yaw: Math.PI / 2 })),
    ),
  }
  it('round-trips row ↔ activity with a layout', () => {
    assert.ok(slots.length > 0)
    const withLayout: Activity = { ...teknik, defaultStationLayout: layout }
    const row = rowOf(withLayout)
    assert.deepEqual(row.default_station_layout, layout)
    assert.deepEqual(rowToActivity(row)?.defaultStationLayout, layout)
  })
  it('non-Teknik row never gets a layout', () => {
    const fun = seedActivities.find((a) => a.blockType === 'fun_and_games') as Activity
    const row = { ...rowOf(fun), default_station_equipment: slots, default_station_layout: layout }
    assert.equal(rowToActivity(row)?.defaultStationLayout, undefined)
  })
  it('missing column / broken layout → no layout, row still loads', () => {
    const row = rowOf(teknik) as Partial<BankRow>
    delete row.default_station_layout
    const a = rowToActivity(row) as Activity
    assert.ok(a)
    assert.equal(a.defaultStationLayout, undefined)
    const broken = silently(() => rowToActivity({ ...rowOf(teknik), default_station_layout: { v: 2, poses: [] } }))
    assert.ok(broken)
    assert.equal(broken?.defaultStationLayout, undefined)
  })
})
