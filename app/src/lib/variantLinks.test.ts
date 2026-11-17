import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { getActivityById, seedActivities } from '../data/seedActivities.ts'
import type { Activity, Session } from '../types.ts'
import { easierOf, harderOf, stepTeknikHarder, swapSessionActivity, teknikItemsWithHarder } from './variantLinks.ts'

const by = (id: string) => seedActivities.find((a) => a.id === id) as Activity
const get = (id: string) => getActivityById(id)

describe('easierOf / harderOf (Slice 62, A1 B1)', () => {
  it('Grenhopp: landning easier, formhopp harder (own fields)', () => {
    assert.equal(easierOf(by('tech-grenhopp-trampett'), get)?.id, 'tech-landning-plint')
    assert.equal(harderOf(by('tech-grenhopp-trampett'), get)?.id, 'tech-formhopp-over-block')
  })

  it('Hjul ↔ Minihjul; one-sided link still resolves via the reverse link', () => {
    assert.equal(easierOf(by('tech-hjul'), get)?.id, 'tech-minihjul')
    assert.equal(harderOf(by('tech-minihjul'), get)?.id, 'tech-hjul')
    const miniNoOwn = { ...by('tech-minihjul'), regressionOf: undefined }
    assert.equal(harderOf(miniNoOwn, get)?.id, 'tech-hjul')
    const hjulNoOwn = { ...by('tech-hjul'), progressionOf: undefined }
    assert.equal(easierOf(hjulNoOwn, get)?.id, 'tech-minihjul')
  })

  it('Bro and missing / self targets → undefined', () => {
    assert.equal(easierOf(by('tech-bro'), get), undefined)
    assert.equal(harderOf(by('tech-bro'), get), undefined)
    const ghost = { ...by('tech-bro'), progressionOf: 'tech-finns-inte', regressionOf: 'tech-bro' }
    assert.equal(easierOf(ghost, get), undefined)
    assert.equal(harderOf(ghost, get), undefined)
  })
})

describe('swapSessionActivity (Slice 62, B1)', () => {
  const session = {
    id: 's', title: '', totalMinutes: 13, notes: '',
    blocks: [{ id: 'b', type: 'techniques', items: [
      { id: 'i1', activityId: 'tech-minihjul', durationMinutes: 7, note: 'n', order: 0 },
      { id: 'i2', activityId: 'tech-grenhopp-trampett', durationMinutes: 6, note: '', order: 1, stationEquipment: [{ pieceId: 'eq-trampett', count: 1 }] },
    ] }],
  } as unknown as Session

  it('swaps only activityId; id, minutes, note, order and redskap stay', () => {
    const next = swapSessionActivity(session, 'i1', 'tech-hjul')
    const [a, b] = next.blocks[0].items
    assert.deepEqual(a, { ...session.blocks[0].items[0], activityId: 'tech-hjul' })
    assert.ok(!('stationEquipment' in a) || a.stationEquipment === undefined)
    assert.equal(b, session.blocks[0].items[1])
    assert.equal(next.totalMinutes, 13)
    const c = swapSessionActivity(session, 'i2', 'tech-formhopp-over-block').blocks[0].items[1]
    assert.deepEqual(c.stationEquipment, [{ pieceId: 'eq-trampett', count: 1 }])
  })

  it('unknown item or same id → unchanged', () => {
    assert.equal(swapSessionActivity(session, 'nope', 'tech-hjul'), session)
    assert.equal(swapSessionActivity(session, 'i1', 'tech-minihjul'), session)
  })
})

describe('seed links (Slice 62, C1)', () => {
  const md = readFileSync(new URL('../../../slice-62/content/microcopy.sv.md', import.meta.url), 'utf8')
  const rows = [...md.matchAll(/^\| `(tech-[a-z-]+)` \| (`tech-[a-z-]+`|—) \| (`tech-[a-z-]+`|—) \|$/gm)]
  const val = (c: string) => (c === '—' ? undefined : c.replaceAll('`', ''))

  it('the 16 have exactly the microcopy links, reciprocally', () => {
    assert.equal(rows.length, 16)
    for (const [, id, p, r] of rows) {
      const a = by(id)
      assert.equal(a.progressionOf, val(p), `${id} progressionOf`)
      assert.equal(a.regressionOf, val(r), `${id} regressionOf`)
      if (a.progressionOf) assert.equal(by(a.progressionOf).regressionOf, id, `${id} ← back`)
      if (a.regressionOf) assert.equal(by(a.regressionOf).progressionOf, id, `${id} → back`)
    }
  })

  it('the 8 other Teknik have no links', () => {
    const ids = new Set(rows.map((r) => r[1]))
    const rest = seedActivities.filter((a) => a.blockType === 'techniques' && !ids.has(a.id))
    assert.equal(rest.length, 8)
    for (const a of rest) assert.ok(!a.progressionOf && !a.regressionOf, a.id)
  })
})

describe('stepTeknikHarder (Slice 63, D1)', () => {
  const eq = [{ pieceId: 'eq-trampett', count: 1 }]
  const pass = (ids: string[], extra: object = {}) => ({
    id: 's', title: '', totalMinutes: 20, notes: '', hallPlacements: [{ itemId: 'i0', x: 1, y: 2 }], ...extra,
    blocks: [
      { id: 'w', type: 'warmup', items: [{ id: 'w1', activityId: 'tech-minihjul', durationMinutes: 4, note: '', order: 0 }] },
      { id: 'b', type: 'techniques', items: ids.map((activityId, n) => ({
        id: `i${n}`, activityId, durationMinutes: 5 + n, note: `n${n}`, order: n, ...(n === 1 ? { stationEquipment: eq } : {}),
      })) },
    ],
  }) as unknown as Session

  it('Minihjul → Hjul, Grenhopp → Formhopp, Bro and other blocks untouched; rest kept', () => {
    const before = pass(['tech-minihjul', 'tech-grenhopp-trampett', 'tech-bro'])
    const after = stepTeknikHarder(before, get)
    const [a, b, c] = after.blocks[1].items
    assert.deepEqual(after.blocks[1].items.map((i) => i.activityId), ['tech-hjul', 'tech-formhopp-over-block', 'tech-bro'])
    assert.deepEqual([a.id, a.durationMinutes, a.note, a.stationEquipment], ['i0', 5, 'n0', undefined])
    assert.deepEqual([b.id, b.durationMinutes, b.note, b.stationEquipment], ['i1', 6, 'n1', eq])
    assert.equal(c, before.blocks[1].items[2])
    assert.deepEqual(after.blocks[0], before.blocks[0])
    assert.equal(after.hallPlacements, before.hallPlacements)
    assert.equal(after.totalMinutes, 20)
  })

  it('already hardest or only Bro → same session, no hits', () => {
    for (const ids of [['tech-formhopp-over-block', 'tech-hjul'], ['tech-bro']]) {
      const s = pass(ids)
      assert.deepEqual(teknikItemsWithHarder(s, get), [])
      assert.equal(stepTeknikHarder(s, get), s)
    }
  })

  it('one step per call along the chain', () => {
    const once = stepTeknikHarder(pass(['tech-ljushopp-rockringar']), get)
    assert.equal(once.blocks[1].items[0].activityId, 'tech-ljushopp-satsbrada')
    assert.equal(stepTeknikHarder(once, get).blocks[1].items[0].activityId, 'tech-ljushopp-trampett')
  })
})
